import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import * as XLSX from 'xlsx';
import { parse as parseCSV } from 'csv-parse/sync';
import crypto from 'crypto';
import { query, insert } from '@/lib/mariadb';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Generate unique hash for deduplication
function generateHash(data: Record<string, any>): string {
  const normalizedData = Object.entries(data)
    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}:${String(v).toLowerCase().trim()}`)
    .sort()
    .join('|');
  return crypto.createHash('sha256').update(normalizedData).digest('hex');
}

// Parse Excel/CSV files
async function parseFile(filePath: string, fileType: string): Promise<any[]> {
  if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } else if (fileType === 'csv') {
    const fileContent = await readFileContent(filePath);
    return parseCSV(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }
  return [];
}

async function readFileContent(filePath: string): Promise<string> {
  const fs = require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
}

// Map dynamic columns to core fields and custom_fields
function mapDataToEntity(
  rawData: Record<string, any>,
  entityType: string
): { coreFields: Record<string, any>; customFields: Record<string, any> } {
  const coreFieldMappings: Record<string, string[]> = {
    contact: [
      'first_name', 'last_name', 'email', 'phone', 'mobile', 'company',
      'job_title', 'city', 'country', 'prefix', 'suffix', 'middle_name',
      'nickname', 'department', 'street_address', 'state', 'postal_code',
      'website', 'birthday', 'notes'
    ],
    property: [
      'title', 'description', 'property_category', 'property_type',
      'listing_type', 'price', 'area', 'bedrooms', 'bathrooms', 'floors',
      'parking_spaces', 'year_built', 'city', 'state', 'country',
      'postal_code', 'status', 'reference_number', 'street_address'
    ],
    organization: [
      'name', 'legal_name', 'organization_type', 'industry', 'email',
      'phone', 'website', 'city', 'state', 'country', 'postal_code',
      'tax_id', 'registration_number', 'employee_count', 'annual_revenue',
      'description', 'notes', 'street_address', 'status'
    ],
    lead: [
      'first_name', 'last_name', 'email', 'phone', 'mobile', 'company',
      'job_title', 'lead_source', 'lead_status', 'lead_type', 'lead_priority',
      'property_category', 'property_type', 'property_budget', 'city',
      'state', 'country', 'description', 'notes'
    ],
  };

  const coreFields: Record<string, any> = {};
  const customFields: Record<string, any> = {};
  const allowedCoreFields = coreFieldMappings[entityType] || [];

  // Normalize column names (lowercase, replace spaces/special chars with underscore)
  const normalizedData: Record<string, any> = {};
  Object.entries(rawData).forEach(([key, value]) => {
    const normalizedKey = key
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    normalizedData[normalizedKey] = value;
  });

  // Separate core fields from custom fields
  Object.entries(normalizedData).forEach(([key, value]) => {
    if (allowedCoreFields.includes(key)) {
      coreFields[key] = value;
    } else if (value !== null && value !== undefined && value !== '') {
      customFields[key] = value;
    }
  });

  return { coreFields, customFields };
}

// Store custom field definitions
async function registerCustomFields(
  entityType: string,
  customFields: Record<string, any>,
  fileName: string
) {
  for (const [fieldName, value] of Object.entries(customFields)) {
    // Check if field already exists
    const existing = await query(
      `SELECT id, usage_count, source_files FROM custom_field_definitions 
       WHERE entity_type = ? AND field_name = ?`,
      [entityType, fieldName]
    );

    if (existing.length > 0) {
      // Update usage count and add source file
      const sourceFiles = JSON.parse(existing[0].source_files || '[]');
      if (!sourceFiles.includes(fileName)) {
        sourceFiles.push(fileName);
      }
      await query(
        `UPDATE custom_field_definitions 
         SET usage_count = usage_count + 1, source_files = ? 
         WHERE id = ?`,
        [JSON.stringify(sourceFiles), existing[0].id]
      );
    } else {
      // Insert new custom field definition
      const dataType = typeof value === 'number' ? 'number' : 'string';
      await query(
        `INSERT INTO custom_field_definitions 
         (entity_type, field_name, field_label, data_type, source_files, usage_count) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [
          entityType,
          fieldName,
          fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          dataType,
          JSON.stringify([fileName]),
        ]
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    const safeFileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.-]/gi, '_')}`;
    const filePath = join(UPLOAD_DIR, safeFileName);
    await writeFile(filePath, buffer);

    // Create import job
    const jobId = crypto.randomUUID();
    await query(
      `INSERT INTO import_jobs (id, file_name, file_type, file_size, entity_type, status) 
       VALUES (?, ?, ?, ?, ?, 'processing')`,
      [jobId, file.name, fileType, file.size, entityType]
    );

    // Parse file
    const rows = await parseFile(filePath, fileType);
    
    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      try {
        const rawData = rows[i];
        const { coreFields, customFields } = mapDataToEntity(rawData, entityType);
        const dataHash = generateHash({ ...coreFields, ...customFields });

        // Check for duplicates
        const duplicateCheck = await query(
          `SELECT id FROM ${entityType === 'contact' ? 'contacts' : entityType === 'property' ? 'properties' : entityType === 'organization' ? 'organizations' : 'leads'} 
           WHERE data_hash = ?`,
          [dataHash]
        );

        if (duplicateCheck.length > 0) {
          duplicateCount++;
          await query(
            `INSERT INTO import_duplicates (import_job_id, entity_type, duplicate_hash, existing_record_id, new_data, match_reason, action_taken) 
             VALUES (?, ?, ?, ?, ?, 'hash_match', 'skipped')`,
            [jobId, entityType, dataHash, duplicateCheck[0].id, JSON.stringify(rawData)]
          );
          continue;
        }

        // Register custom fields
        if (Object.keys(customFields).length > 0) {
          await registerCustomFields(entityType, customFields, file.name);
        }

        // Insert record
        const tableName = entityType === 'contact' ? 'contacts' : entityType === 'property' ? 'properties' : entityType === 'organization' ? 'organizations' : 'leads';
        const fields = { ...coreFields, custom_fields: JSON.stringify(customFields), data_hash: dataHash };
        const columns = Object.keys(fields).join(', ');
        const placeholders = Object.keys(fields).map(() => '?').join(', ');
        const values = Object.values(fields);

        await query(
          `INSERT INTO ${tableName} (id, ${columns}) VALUES (UUID(), ${placeholders})`,
          values
        );

        importedCount++;
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errorCount++;
      }
    }

    // Update import job
    await query(
      `UPDATE import_jobs 
       SET total_rows = ?, imported_rows = ?, duplicate_rows = ?, error_rows = ?, 
           status = 'completed', completed_at = NOW(), progress_percent = 100 
       WHERE id = ?`,
      [rows.length, importedCount, duplicateCount, errorCount, jobId]
    );

    return NextResponse.json({
      success: true,
      jobId,
      stats: {
        total: rows.length,
        imported: importedCount,
        duplicates: duplicateCount,
        errors: errorCount,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
