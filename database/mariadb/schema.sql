-- =============================================================================
-- LEADS TABLE SCHEMA - MariaDB Version
-- This schema follows standard CRM best practices for lead management
-- =============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Basic Contact Information
  first_name VARCHAR(100) NULL DEFAULT 'Unknown',
  last_name VARCHAR(100) NULL DEFAULT 'Lead',
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(100),
  
  -- Lead Source & Classification
  lead_source VARCHAR(100),
  lead_status VARCHAR(50) DEFAULT 'new',
  lead_type VARCHAR(50),
  lead_priority VARCHAR(20) DEFAULT 'medium',
  
  -- Property Information
  property_category VARCHAR(50),
  property_type VARCHAR(50),
  property_location TEXT,
  property_budget DECIMAL(15, 2),
  property_size DECIMAL(10, 2),
  property_requirements TEXT,
  
  -- Address Information
  street_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Egypt',
  postal_code VARCHAR(20),
  
  -- Lead Details
  description TEXT,
  notes TEXT,
  
  -- Business Information
  estimated_value DECIMAL(15, 2),
  expected_close_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  
  -- Assignment
  assigned_to VARCHAR(36),
  owner_id VARCHAR(36),
  
  -- Communication
  last_contact_date TIMESTAMP NULL,
  next_follow_up_date TIMESTAMP NULL,
  contact_preference VARCHAR(50),
  
  -- Social Media & Web
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  
  -- Custom Fields (Dynamic columns from imports)
  custom_fields JSON DEFAULT NULL,
  data_hash VARCHAR(64) UNIQUE,
  
  -- Tracking & Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(36),
  updated_by VARCHAR(36),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36),
  
  INDEX idx_leads_email (email),
  INDEX idx_leads_phone (phone),
  INDEX idx_leads_status (lead_status),
  INDEX idx_leads_source (lead_source),
  INDEX idx_leads_assigned_to (assigned_to),
  INDEX idx_leads_owner_id (owner_id),
  INDEX idx_leads_created_at (created_at),
  INDEX idx_leads_is_deleted (is_deleted),
  INDEX idx_leads_property_category (property_category),
  INDEX idx_leads_lead_priority (lead_priority),
  INDEX idx_leads_data_hash (data_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- LEAD ACTIVITIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_activities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lead_id VARCHAR(36),
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER,
  outcome VARCHAR(100),
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_activities_lead_id (lead_id),
  INDEX idx_lead_activities_created_at (created_at),
  INDEX idx_lead_activities_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- LEAD DOCUMENTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS lead_documents (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lead_id VARCHAR(36),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by VARCHAR(36),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  INDEX idx_lead_documents_lead_id (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
