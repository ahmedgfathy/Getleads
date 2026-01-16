// Lead Types for CRM System

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadType = 'cold' | 'warm' | 'hot';
export type PropertyCategory = 'commercial' | 'residential' | 'manufacturing';
export type ContactPreference = 'email' | 'phone' | 'whatsapp' | 'meeting';

export interface Lead {
  id: string;
  
  // Basic Contact Information
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  
  // Lead Source & Classification
  lead_source?: string;
  lead_status: LeadStatus;
  lead_type?: LeadType;
  lead_priority: LeadPriority;
  
  // Property Information
  property_category?: PropertyCategory;
  property_type?: string;
  property_location?: string;
  property_budget?: number;
  property_size?: number;
  property_requirements?: string;
  
  // Address Information
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  
  // Lead Details
  description?: string;
  notes?: string;
  
  // Business Information
  estimated_value?: number;
  expected_close_date?: string;
  probability?: number;
  
  // Assignment
  assigned_to?: string;
  owner_id?: string;
  
  // Communication
  last_contact_date?: string;
  next_follow_up_date?: string;
  contact_preference?: ContactPreference;
  
  // Social Media & Web
  website?: string;
  linkedin_url?: string;
  facebook_url?: string;
  
  // Tracking & Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Soft Delete
  is_deleted: boolean;
  deleted_at?: string;
  deleted_by?: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';
  subject?: string;
  description?: string;
  activity_date: string;
  duration_minutes?: number;
  outcome?: string;
  created_by?: string;
  created_at: string;
}

export interface LeadDocument {
  id: string;
  lead_id: string;
  document_name: string;
  document_type?: string;
  file_url: string;
  file_size?: number;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface CreateLeadInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  job_title?: string;
  lead_source?: string;
  lead_status?: LeadStatus;
  lead_type?: LeadType;
  lead_priority?: LeadPriority;
  property_category?: PropertyCategory;
  property_type?: string;
  property_location?: string;
  property_budget?: number;
  property_size?: number;
  property_requirements?: string;
  street_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  description?: string;
  notes?: string;
  estimated_value?: number;
  expected_close_date?: string;
  probability?: number;
  assigned_to?: string;
  next_follow_up_date?: string;
  contact_preference?: ContactPreference;
  website?: string;
  linkedin_url?: string;
  facebook_url?: string;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  id: string;
}

export interface LeadFilters {
  lead_status?: LeadStatus;
  lead_priority?: LeadPriority;
  lead_source?: string;
  property_category?: PropertyCategory;
  assigned_to?: string;
  search?: string;
}
