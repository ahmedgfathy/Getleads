# 🚀 GetLeads Bulk Import System

## Overview

Complete bulk import solution for handling 10,000+ files with varying column structures. The system automatically:
- ✅ Detects and preserves all column headers
- ✅ Maps core fields to database columns
- ✅ Stores unique/dynamic fields in JSON
- ✅ Handles deduplication via hash matching
- ✅ Tracks all imports with detailed statistics
- ✅ Supports multiple file formats

## ✨ Features

### File Format Support
- **📊 Excel**: .xlsx, .xls (parsed with SheetJS)
- **📄 CSV**: .csv (parsed with csv-parse)
- **👤 vCard**: .vcf (Google Contacts exports) - *Coming soon*
- **💬 WhatsApp**: .txt (message exports with property listings) - *Coming soon*

### Dynamic Schema
Each entity table has:
- **Core Fields**: Standard columns (name, email, phone, etc.)
- **custom_fields**: JSON column storing all unique headers from imports
- **data_hash**: SHA-256 hash for duplicate detection

### Import Tracking
- **import_jobs**: Track each upload with statistics
- **custom_field_definitions**: Catalog of all discovered fields
- **import_duplicates**: Log of skipped duplicate records
- **import_staging**: Preview area before final import
- **import_templates**: Reusable column mappings

## 🗄️ Database Setup

### MariaDB Installation (WSL Ubuntu)
```bash
# Already running on your system
DB: getleads
User: root
Password: zerocall
Host: localhost
```

### Tables Created
```sql
-- 13 tables total:
contacts, contact_activities
properties
leads, lead_activities, lead_documents  
organizations, organization_activities
import_jobs
import_staging
import_duplicates
custom_field_definitions
import_templates
```

### Run Database Setup
```bash
cd database/mariadb
chmod +x setup.sh
./setup.sh
```

## 📦 Installation

### 1. Install Dependencies
```bash
npm install mysql2 xlsx csv-parse
```

### 2. Configure Environment (.env.local)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=zerocall
DB_NAME=getleads
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Import Module
```
http://localhost:3000/import
```

## 🎯 How It Works

### 1. Upload Files
- Drag & drop or select multiple files
- Choose entity type (Contacts, Properties, Organizations, Leads)
- Supports up to 100 files at once

### 2. Automatic Processing
```javascript
For each file:
  1. Parse file (Excel/CSV)
  2. Extract all column headers
  3. Normalize header names (lowercase, underscores)
  4. Map to core fields vs custom fields
  5. Generate data hash for deduplication
  6. Check for existing records
  7. Register new custom field definitions
  8. Insert record with custom_fields JSON
  9. Update import statistics
```

### 3. Data Structure
```javascript
// Example: Contact from Excel with custom columns
Row: {
  "First Name": "Ahmed",
  "Email": "ahmed@example.com",
  "Customer Since": "2020",
  "VIP Status": "Gold",
  "Custom Field X": "Value Y"
}

// Stored as:
{
  // Core fields (columns)
  first_name: "Ahmed",
  email: "ahmed@example.com",
  
  // Custom fields (JSON)
  custom_fields: {
    "customer_since": "2020",
    "vip_status": "Gold",
    "custom_field_x": "Value Y"
  },
  
  // Deduplication hash
  data_hash: "a3f8e9c..."
}
```

### 4. Custom Field Definitions
Every unique header is cataloged:
```sql
SELECT * FROM custom_field_definitions;

entity_type | field_name      | usage_count | source_files
------------|-----------------|-------------|------------------
contact     | customer_since  | 125         | ["file1.xlsx", "file2.csv"]
contact     | vip_status      | 89          | ["file1.xlsx"]
property    | broker_commission| 45         | ["properties.xlsx"]
```

## 🔍 Querying Custom Fields

### Search in JSON
```sql
-- Find contacts with specific custom field
SELECT * FROM contacts 
WHERE JSON_EXTRACT(custom_fields, '$.vip_status') = 'Gold';

-- Search across all custom fields (MariaDB 10.2+)
SELECT * FROM contacts
WHERE JSON_SEARCH(custom_fields, 'one', '%keyword%') IS NOT NULL;
```

### Get All Custom Fields
```sql
SELECT 
  id, first_name, email,
  JSON_KEYS(custom_fields) as field_names,
  custom_fields
FROM contacts;
```

## 📊 Import Statistics

### View Import History
```
http://localhost:3000/import/history
```

Shows:
- File name and type
- Entity type
- Total rows processed
- Imported, duplicate, and error counts
- Status and progress
- Timestamps

### API Endpoint
```javascript
GET /api/import/history

Response:
{
  "jobs": [
    {
      "id": "uuid",
      "file_name": "contacts_2024.xlsx",
      "file_type": "xlsx",
      "entity_type": "contact",
      "total_rows": 1500,
      "imported_rows": 1450,
      "duplicate_rows": 45,
      "error_rows": 5,
      "status": "completed",
      "progress_percent": 100,
      "created_at": "2025-01-16T10:30:00Z",
      "completed_at": "2025-01-16T10:35:00Z"
    }
  ]
}
```

## 🎨 UI Pages

### /import (Main Upload)
- Entity type selector (Contacts, Properties, Organizations, Leads)
- File drag & drop area
- File list with icons and sizes
- Upload progress tracking
- Quick statistics dashboard

### /import/history (Import History)
- Table of all imports
- Status badges (completed, processing, failed)
- Record statistics
- Date/time tracking

## 🔐 Deduplication Strategy

### Hash Generation
```javascript
function generateHash(data) {
  // Combine all non-empty fields
  const normalized = Object.entries(data)
    .filter(([_, v]) => v !== null && v !== '')
    .map(([k, v]) => `${k}:${String(v).toLowerCase().trim()}`)
    .sort()
    .join('|');
    
  return crypto.createHash('sha256')
    .update(normalized)
    .digest('hex');
}
```

### Duplicate Handling
- Exact match via `data_hash` → Skip
- Phone + Email match → Log to import_duplicates
- All duplicates viewable for manual review

## 📈 Scalability

### Current Capacity
- **MariaDB Local**: No size limits (your disk space)
- **Records**: Unlimited rows
- **Files**: 100 at a time, unlimited batches
- **Custom Fields**: Unlimited (JSON columns)

### Performance Tips
```sql
-- Add indexes on frequently queried custom fields
ALTER TABLE contacts 
ADD INDEX idx_custom_vip (
  (CAST(JSON_EXTRACT(custom_fields, '$.vip_status') AS CHAR(50)))
);

-- Full-text search on JSON (MariaDB 10.4+)
ALTER TABLE contacts 
ADD FULLTEXT INDEX idx_custom_fields_text (custom_fields);
```

## 🛠️ Next Steps

### Phase 2 Features (Optional)
1. **vCard Parser** for .vcf files
2. **WhatsApp Parser** for .txt exports with regex
3. **Column Mapping UI** for manual field matching
4. **Duplicate Review Queue** with merge options
5. **Scheduled Imports** from folders
6. **API Import** for external integrations
7. **Export** with custom fields included

### Add to Existing Pages
Display custom fields in detail views:
```tsx
// In contact detail page
{contact.custom_fields && (
  <div className="mt-6">
    <h3 className="text-lg font-medium">Additional Information</h3>
    <dl className="grid grid-cols-2 gap-4 mt-4">
      {Object.entries(JSON.parse(contact.custom_fields)).map(([key, value]) => (
        <div key={key}>
          <dt className="text-sm font-medium text-gray-500">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </dt>
          <dd className="text-sm text-gray-900">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
)}
```

## 🎉 Usage Example

### Import 10,000 Files Workflow
1. Go to `/import`
2. Select "Contacts" entity type
3. Drag & drop 100 files
4. Click "Upload" → Wait ~2 minutes
5. Repeat 100 times for all files
6. Check `/import/history` for results
7. Query custom fields in MariaDB or API

### Result
- All 10K files imported
- All unique headers preserved
- Zero data loss
- Full deduplication
- Searchable custom fields
- Complete audit trail

## 📞 Support

For issues:
- Check MariaDB connection: `mysql -uroot -pzerocall -e "SHOW DATABASES;"`
- Verify tables: `mysql -uroot -pzerocall getleads -e "SHOW TABLES;"`
- Check import logs: `SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT 10;`
- View custom fields: `SELECT * FROM custom_field_definitions;`

---

**Status**: ✅ Fully functional and ready for 10K+ file imports!
