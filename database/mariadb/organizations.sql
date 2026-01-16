-- =============================================================================
-- ORGANIZATIONS TABLE SCHEMA - MariaDB Version
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Basic Information
  name VARCHAR(255) NULL DEFAULT 'Unknown Organization',
  legal_name VARCHAR(255),
  organization_type VARCHAR(50),
  industry VARCHAR(100),
  
  -- Contact Information
  email VARCHAR(255),
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  fax VARCHAR(50),
  website VARCHAR(255),
  
  -- Address Information
  street_address TEXT,
  address_line_2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Egypt',
  postal_code VARCHAR(20),
  
  -- Business Details
  tax_id VARCHAR(100),
  registration_number VARCHAR(100),
  employee_count VARCHAR(50),
  annual_revenue DECIMAL(15, 2),
  
  -- Social Media & Web
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  
  -- CRM Details
  status VARCHAR(50) DEFAULT 'active',
  parent_organization_id VARCHAR(36),
  assigned_to VARCHAR(36),
  
  -- Additional Information
  description TEXT,
  notes TEXT,
  tags JSON DEFAULT NULL,
  
  -- Logo & Display
  logo_url TEXT,
  color VARCHAR(7),
  
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
  
  FOREIGN KEY (parent_organization_id) REFERENCES organizations(id),
  INDEX idx_organizations_name (name),
  INDEX idx_organizations_email (email),
  INDEX idx_organizations_phone (phone),
  INDEX idx_organizations_type (organization_type),
  INDEX idx_organizations_industry (industry),
  INDEX idx_organizations_status (status),
  INDEX idx_organizations_assigned_to (assigned_to),
  INDEX idx_organizations_parent_id (parent_organization_id),
  INDEX idx_organizations_created_at (created_at),
  INDEX idx_organizations_is_deleted (is_deleted),
  INDEX idx_organizations_data_hash (data_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ORGANIZATION ACTIVITIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS organization_activities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  organization_id VARCHAR(36),
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  INDEX idx_organization_activities_org_id (organization_id),
  INDEX idx_organization_activities_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
