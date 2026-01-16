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
async function parseFile(buffer: Buffer, fileType: string): Promise<any[]> {
  if (fileType === 'xlsx' || fileType === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } else if (fileType === 'csv') {
    const fileContent = buffer.toString('utf-8');
    return parseCSV(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  }
  return [];
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

  // Numeric fields that must be numbers
  const numericFields = ['price', 'area', 'bedrooms', 'bathrooms', 'floors', 'parking_spaces', 
                         'year_built', 'employee_count', 'annual_revenue', 'property_budget'];

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

  // Separate core fields from custom fields with type validation
  Object.entries(normalizedData).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return; // Skip empty values
    }

    if (allowedCoreFields.includes(key)) {
      // If this is a numeric field, validate it's actually a number
      if (numericFields.includes(key)) {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        if (!isNaN(numValue)) {
          coreFields[key] = numValue;
        } else {
          // Not a valid number, store in custom_fields with original column name
          customFields[key] = value;
        }
      } else {
        coreFields[key] = value;
      }
    } else {
      customFields[key] = value;
    }
  });

  // No need to add defaults - database handles that now!

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
    console.log('=== Upload API Started ===');
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;

    console.log('File received:', file?.name, 'Entity type:', entityType);

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
    console.log('File saved to:', filePath);

    // Create import job
    const jobId = crypto.randomUUID();
    console.log('Creating import job:', jobId);
    await query(
      `INSERT INTO import_jobs (id, file_name, file_type, file_size, entity_type, status) 
       VALUES (?, ?, ?, ?, ?, 'processing')`,
      [jobId, file.name, fileType, file.size, entityType]
    );

    // Parse file
    console.log('Parsing file...');
    const rows = await parseFile(buffer, fileType);
    console.log('Parsed rows:', rows.length);
    
    let importedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;

    const tableName = entityType === 'contact' ? 'contacts' : entityType === 'property' ? 'properties' : entityType === 'organization' ? 'organizations' : 'leads';
    
    // Collect all custom fields first
    const allCustomFields = new Set<string>();
    const processedRows: Array<{ fields: Record<string, any>; rawData: any }> = [];

    console.log('Processing rows...');
    
    // First pass: process all rows and collect custom fields
    for (let i = 0; i < rows.length; i++) {
      try {
        const rawData = rows[i];
        const { coreFields, customFields } = mapDataToEntity(rawData, entityType);
        const dataHash = generateHash({ ...coreFields, ...customFields });

        // Collect custom field names
        Object.keys(customFields).forEach(field => allCustomFields.add(field));

        // Ensure we have at least SOME data - if no core fields, create a minimal record
        if (Object.keys(coreFields).length === 0 && Object.keys(customFields).length === 0) {
          errorCount++;
          continue; // Skip completely empty rows
        }

        const fields = { ...coreFields, custom_fields: JSON.stringify(customFields), data_hash: dataHash };
        
        // Filter out undefined and null values
        const filteredFields: Record<string, any> = {};
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            filteredFields[key] = value;
          }
        });

        processedRows.push({ fields: filteredFields, rawData });
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errorCount++;
      }
    }

    console.log(`Processed ${processedRows.length} rows, registering custom fields...`);

    // Register all custom fields at once
    if (allCustomFields.size > 0) {
      const sampleCustomFields: Record<string, any> = {};
      allCustomFields.forEach(field => {
        sampleCustomFields[field] = 'sample';
      });
      await registerCustomFields(entityType, sampleCustomFields, file.name);
    }

    // Check for duplicates in batch
    const hashes = processedRows.map(row => row.fields.data_hash);
    const duplicateHashes = hashes.length > 0 ? await query(
      `SELECT data_hash FROM ${tableName} WHERE data_hash IN (${hashes.map(() => '?').join(',')})`,
      hashes
    ) : [];
    
    const duplicateHashSet = new Set(duplicateHashes.map((d: any) => d.data_hash));

    console.log(`Found ${duplicateHashSet.size} duplicates, preparing batch insert...`);

    // Prepare batch insert
    const batchSize = 100;
    const rowsToInsert: typeof processedRows = [];
    
    for (const row of processedRows) {
      if (duplicateHashSet.has(row.fields.data_hash)) {
        duplicateCount++;
        continue;
      }
      rowsToInsert.push(row);
    }

    // Insert in batches
    for (let i = 0; i < rowsToInsert.length; i += batchSize) {
      const batch = rowsToInsert.slice(i, i + batchSize);
      
      if (batch.length === 0) continue;

      // Insert one by one to avoid complex batch logic issues
      let batchSuccess = 0;
      let batchFailed = 0;
      
      for (const row of batch) {
        try {
          const cols = Object.keys(row.fields).join(', ');
          const vals = Object.values(row.fields);
          const placeholders = vals.map(() => '?').join(', ');
          await query(
            `INSERT INTO ${tableName} (id, ${cols}) VALUES (UUID(), ${placeholders})`,
            vals
          );
          batchSuccess++;
          importedCount++;
        } catch (err) {
          console.error('Error inserting row:', err);
          batchFailed++;
          errorCount++;
        }
      }
      
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: ${batchSuccess} success, ${batchFailed} failed (total: ${importedCount})`);
    }

    // Update import job
    console.log(`Import complete: ${importedCount} imported, ${duplicateCount} duplicates, ${errorCount} errors`);
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
    console.error('=== Upload error ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to process file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
