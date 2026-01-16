-- =============================================================================
-- PROPERTIES TABLE SCHEMA
-- Real estate properties management
-- =============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Property Classification
  property_category VARCHAR(50) NOT NULL, -- commercial, residential, manufacturing
  property_type VARCHAR(50) NOT NULL, -- apartment, villa, office, warehouse, showroom, land
  listing_type VARCHAR(50) NOT NULL, -- sale, rent, lease
  
  -- Basic Information
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Location
  street_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Egypt',
  postal_code VARCHAR(20),
  location_coordinates JSONB, -- {lat: number, lng: number}
  
  -- Property Details
  price DECIMAL(15, 2) NOT NULL,
  area DECIMAL(10, 2), -- in square meters
  bedrooms INTEGER,
  bathrooms INTEGER,
  floors INTEGER,
  parking_spaces INTEGER,
  year_built INTEGER,
  
  -- Status & Availability
  status VARCHAR(50) DEFAULT 'available', -- available, sold, rented, under_contract, off_market
  availability_date DATE,
  
  -- Features & Amenities (stored as JSON array)
  features JSONB, -- ["pool", "gym", "garden", "security", "elevator"]
  
  -- Media
  images JSONB, -- array of image URLs
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Agent Information
  agent_id UUID REFERENCES auth.users(id),
  owner_id UUID REFERENCES auth.users(id),
  
  -- Additional Information
  reference_number VARCHAR(100) UNIQUE,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  
  -- Tracking & Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Create indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_agent_id ON properties(agent_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON properties(is_deleted);
CREATE INDEX IF NOT EXISTS idx_properties_reference_number ON properties(reference_number);

-- Create updated_at trigger for properties
CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Users can view all non-deleted properties" 
  ON properties FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_deleted = false);

CREATE POLICY "Users can insert properties" 
  ON properties FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their properties" 
  ON properties FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (owner_id = auth.uid() OR agent_id = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "Users can delete their properties" 
  ON properties FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (owner_id = auth.uid() OR created_by = auth.uid())
  );

-- =============================================================================
-- CONTACTS TABLE SCHEMA
-- Based on Google Contacts / vCard standard
-- =============================================================================

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Name Information (following vCard standard)
  prefix VARCHAR(20), -- Mr., Mrs., Dr., etc.
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100),
  suffix VARCHAR(20), -- Jr., Sr., III, etc.
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
  
  -- Tags & Categories (stored as JSON array)
  tags JSONB, -- ["client", "supplier", "partner", "investor"]
  
  -- Relationship Management
  contact_type VARCHAR(50), -- client, lead, partner, vendor, other
  contact_source VARCHAR(100), -- referral, website, event, etc.
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Avatar & Display
  avatar_url TEXT,
  color VARCHAR(7), -- hex color for avatar background
  
  -- Tracking & Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Create indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_contacts_mobile ON contacts(mobile);
CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts(first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts(last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_is_deleted ON contacts(is_deleted);

-- Create updated_at trigger for contacts
CREATE TRIGGER update_contacts_updated_at 
  BEFORE UPDATE ON contacts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can view all non-deleted contacts" 
  ON contacts FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_deleted = false);

CREATE POLICY "Users can insert contacts" 
  ON contacts FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their contacts" 
  ON contacts FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (assigned_to = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "Users can delete their contacts" 
  ON contacts FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid()
  );

-- =============================================================================
-- CONTACT ACTIVITIES TABLE
-- Track interactions with contacts
-- =============================================================================

CREATE TABLE IF NOT EXISTS contact_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- call, email, meeting, note, task
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_id ON contact_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_activities_created_at ON contact_activities(created_at);

ALTER TABLE contact_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contact activities" 
  ON contact_activities FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert contact activities" 
  ON contact_activities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
