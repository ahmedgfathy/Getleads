-- Leads Table Schema
-- This schema follows standard CRM best practices for lead management

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Contact Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  mobile VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(100),
  
  -- Lead Source & Classification
  lead_source VARCHAR(100), -- e.g., Website, Referral, Social Media, Cold Call, Email Campaign
  lead_status VARCHAR(50) DEFAULT 'new', -- new, contacted, qualified, proposal, negotiation, won, lost
  lead_type VARCHAR(50), -- e.g., Cold, Warm, Hot
  lead_priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  
  -- Property Information (specific to real estate)
  property_category VARCHAR(50), -- commercial, residential, manufacturing
  property_type VARCHAR(50), -- apartment, villa, office, warehouse, etc.
  property_location TEXT,
  property_budget DECIMAL(15, 2),
  property_size DECIMAL(10, 2), -- in square meters/feet
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
  probability INTEGER CHECK (probability >= 0 AND probability <= 100), -- 0-100%
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  owner_id UUID REFERENCES auth.users(id),
  
  -- Communication
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  contact_preference VARCHAR(50), -- email, phone, whatsapp, meeting
  
  -- Social Media & Web
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  facebook_url VARCHAR(255),
  
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted ON leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_leads_property_category ON leads(property_category);
CREATE INDEX IF NOT EXISTS idx_leads_lead_priority ON leads(lead_priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Users can view all non-deleted leads
CREATE POLICY "Users can view all non-deleted leads" 
  ON leads FOR SELECT 
  USING (auth.role() = 'authenticated' AND is_deleted = false);

-- Users can insert leads
CREATE POLICY "Users can insert leads" 
  ON leads FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update leads they own or are assigned to
CREATE POLICY "Users can update their leads" 
  ON leads FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (owner_id = auth.uid() OR assigned_to = auth.uid() OR created_by = auth.uid())
  );

-- Users can soft delete leads they own
CREATE POLICY "Users can delete their leads" 
  ON leads FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    (owner_id = auth.uid() OR created_by = auth.uid())
  );

-- Create lead activities table for tracking interactions
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- call, email, meeting, note, task, status_change
  subject VARCHAR(255),
  description TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER, -- for calls and meetings
  outcome VARCHAR(100), -- successful, unsuccessful, no_answer, left_message
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(activity_type);

-- Enable RLS for lead_activities
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lead activities" 
  ON lead_activities FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert lead activities" 
  ON lead_activities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Create lead documents table
CREATE TABLE IF NOT EXISTS lead_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50), -- proposal, contract, brochure, floor_plan, etc.
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_documents_lead_id ON lead_documents(lead_id);

-- Enable RLS for lead_documents
ALTER TABLE lead_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lead documents" 
  ON lead_documents FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert lead documents" 
  ON lead_documents FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
