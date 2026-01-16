-- =============================================================================
-- PROPERTIES TABLE SCHEMA - MariaDB Version
-- =============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Property Classification
  property_category VARCHAR(50) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  listing_type VARCHAR(50) NOT NULL,
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  street_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Egypt',
  postal_code VARCHAR(20),
  location_coordinates JSON DEFAULT NULL,
  
  -- Property Details
  price DECIMAL(15, 2) NOT NULL,
  area DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  parking_spaces INTEGER,
  year_built INTEGER,
  
  -- Status & Availability
  status VARCHAR(50) DEFAULT 'available',
  availability_date DATE,
  
  -- Features & Amenities
  features JSON DEFAULT NULL,
  
  -- Media
  images JSON DEFAULT NULL,
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Agent Information
  agent_id VARCHAR(36),
  owner_id VARCHAR(36),
  
  -- Additional Information
  reference_number VARCHAR(100) UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
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
  
  INDEX idx_properties_category (property_category),
  INDEX idx_properties_type (property_type),
  INDEX idx_properties_listing_type (listing_type),
  INDEX idx_properties_status (status),
  INDEX idx_properties_price (price),
  INDEX idx_properties_city (city),
  INDEX idx_properties_agent_id (agent_id),
  INDEX idx_properties_owner_id (owner_id),
  INDEX idx_properties_created_at (created_at),
  INDEX idx_properties_is_deleted (is_deleted),
  INDEX idx_properties_reference_number (reference_number),
  INDEX idx_properties_data_hash (data_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- CONTACTS TABLE SCHEMA - MariaDB Version
-- =============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Name Information
  prefix VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  suffix VARCHAR(20),
  nickname VARCHAR(100),
  
  -- Company & Job
  company VARCHAR(255),
  job_title VARCHAR(100),
  department VARCHAR(100),
  
  -- Contact Information
  email VARCHAR(255),
  email_secondary VARCHAR(255),
  phone VARCHAR(50),
  phone_secondary VARCHAR(50),
  mobile VARCHAR(50),
  fax VARCHAR(50),
  website VARCHAR(255),
  
  -- Address Information
  street_address TEXT,
  address_line_2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Egypt',
  postal_code VARCHAR(20),
  
  -- Social Media
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  
  -- Personal Information
  birthday DATE,
  notes TEXT,
  
  -- Tags & Categories
  tags JSON DEFAULT NULL,
  
  -- Relationship Management
  contact_type VARCHAR(50),
  contact_source VARCHAR(100),
  assigned_to VARCHAR(36),
  
  -- Avatar & Display
  avatar_url TEXT,
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
  
  INDEX idx_contacts_email (email),
  INDEX idx_contacts_phone (phone),
  INDEX idx_contacts_mobile (mobile),
  INDEX idx_contacts_first_name (first_name),
  INDEX idx_contacts_last_name (last_name),
  INDEX idx_contacts_company (company),
  INDEX idx_contacts_contact_type (contact_type),
  INDEX idx_contacts_assigned_to (assigned_to),
  INDEX idx_contacts_created_at (created_at),
  INDEX idx_contacts_is_deleted (is_deleted),
  INDEX idx_contacts_data_hash (data_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- CONTACT ACTIVITIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_activities (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  contact_id VARCHAR(36),
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_minutes INTEGER,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  INDEX idx_contact_activities_contact_id (contact_id),
  INDEX idx_contact_activities_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
