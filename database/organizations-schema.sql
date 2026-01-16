-- =============================================================================
-- ORGANIZATIONS TABLE SCHEMA
-- Company/Organization management for CRM
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  organization_type VARCHAR(50), -- client, partner, vendor, competitor, other
  industry VARCHAR(100), -- real_estate, construction, finance, technology, etc.
  
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
  tax_id VARCHAR(100), -- Tax identification number
  registration_number VARCHAR(100), -- Company registration number
  employee_count VARCHAR(50), -- 1-10, 11-50, 51-200, 201-500, 500+
  annual_revenue DECIMAL(15, 2),
  
  -- Social Media & Web
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  twitter_url VARCHAR(255),
  instagram_url VARCHAR(255),
  
  -- CRM Details
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, prospect, archived
  parent_organization_id UUID REFERENCES organizations(id),
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Additional Information
  description TEXT,
  notes TEXT,
  tags JSONB, -- ["vip", "local", "international"]
  
  -- Logo & Display
  logo_url TEXT,
  color VARCHAR(7), -- hex color for branding
  
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

-- Create indexes for organizations
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_organizations_email ON organizations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_phone ON organizations(phone);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_assigned_to ON organizations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at);
CREATE INDEX IF NOT EXISTS idx_organizations_is_deleted ON organizations(is_deleted);

-- Create updated_at trigger for organizations
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can view all non-deleted organizations" 
  ON organizations FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_deleted = false);

CREATE POLICY "Users can insert organizations" 
  ON organizations FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their organizations" 
  ON organizations FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (assigned_to = auth.uid() OR created_by = auth.uid())
  );

CREATE POLICY "Users can delete their organizations" 
  ON organizations FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    created_by = auth.uid()
  );

-- =============================================================================
-- ORGANIZATION ACTIVITIES TABLE
-- Track interactions with organizations
-- =============================================================================

CREATE TABLE IF NOT EXISTS organization_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- call, email, meeting, note, deal, contract
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organization_activities_org_id ON organization_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_activities_created_at ON organization_activities(created_at);

ALTER TABLE organization_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization activities" 
  ON organization_activities FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert organization activities" 
  ON organization_activities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
