-- =============================================================================
-- IMPORT SYSTEM TABLES - MariaDB Version
-- For handling dynamic field imports from multiple file formats
-- =============================================================================

-- Track all custom fields discovered from imports
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  entity_type VARCHAR(50) NOT NULL, -- 'contact', 'property', 'organization', 'lead'
  field_name VARCHAR(255) NOT NULL,
  field_label VARCHAR(255),
  data_type VARCHAR(50), -- 'string', 'number', 'date', 'boolean', 'text'
  source_files JSON DEFAULT NULL, -- Array of filenames
  usage_count INTEGER DEFAULT 0,
  is_searchable BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_entity_field (entity_type, field_name),
  INDEX idx_custom_fields_entity (entity_type),
  INDEX idx_custom_fields_usage (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Track import jobs
CREATE TABLE IF NOT EXISTS import_jobs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- 'xlsx', 'csv', 'vcf', 'txt'
  file_size BIGINT,
  entity_type VARCHAR(50), -- 'contact', 'property', 'organization', 'lead'
  
  -- Statistics
  total_rows INTEGER DEFAULT 0,
  imported_rows INTEGER DEFAULT 0,
  skipped_rows INTEGER DEFAULT 0,
  error_rows INTEGER DEFAULT 0,
  duplicate_rows INTEGER DEFAULT 0,
  
  -- Mapping
  column_mapping JSON DEFAULT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  progress_percent DECIMAL(5,2) DEFAULT 0,
  
  -- Error tracking
  error_log JSON DEFAULT NULL,
  
  -- User tracking
  created_by VARCHAR(36),
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_import_jobs_status (status),
  INDEX idx_import_jobs_entity (entity_type),
  INDEX idx_import_jobs_created_by (created_by),
  INDEX idx_import_jobs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store duplicate records for review
CREATE TABLE IF NOT EXISTS import_duplicates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  import_job_id VARCHAR(36),
  entity_type VARCHAR(50),
  duplicate_hash VARCHAR(64),
  existing_record_id VARCHAR(36),
  new_data JSON,
  match_reason VARCHAR(255), -- 'phone_email_match', 'name_phone_match', etc.
  action_taken VARCHAR(50), -- 'skipped', 'merged', 'created_new', 'manual_review'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
  INDEX idx_import_duplicates_job_id (import_job_id),
  INDEX idx_import_duplicates_hash (duplicate_hash),
  INDEX idx_import_duplicates_action (action_taken)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Store raw import data temporarily for review before final import
CREATE TABLE IF NOT EXISTS import_staging (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  import_job_id VARCHAR(36),
  entity_type VARCHAR(50),
  row_index INTEGER,
  raw_data JSON,
  parsed_data JSON,
  validation_errors JSON DEFAULT NULL,
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of VARCHAR(36),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, imported
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (import_job_id) REFERENCES import_jobs(id) ON DELETE CASCADE,
  INDEX idx_import_staging_job_id (import_job_id),
  INDEX idx_import_staging_status (status),
  INDEX idx_import_staging_is_duplicate (is_duplicate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Column mapping templates (reusable mappings for common file formats)
CREATE TABLE IF NOT EXISTS import_templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  template_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  file_type VARCHAR(50),
  column_mapping JSON,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_import_templates_entity (entity_type),
  INDEX idx_import_templates_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
