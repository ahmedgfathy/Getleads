# Leads Module Database Setup

This document explains how to set up the database schema for the Leads module.

## Database Schema

The leads module uses three main tables:
- `leads` - Main table for storing lead information
- `lead_activities` - Track interactions and activities with leads
- `lead_documents` - Store documents related to leads

## Setup Instructions

### 1. Access Your Supabase Dashboard

Go to your Supabase project dashboard at https://app.supabase.com

### 2. Run the SQL Schema

⚠️ **IMPORTANT:** If you already have the leads table created, skip this step and go to Step 3.

1. Navigate to the **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the contents of `/database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### 3. Create Properties and Contacts Tables (NEW)

To add the properties and contacts modules:

1. Navigate to the **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the contents of `/database/properties-contacts-schema.sql`
4. Paste into the SQL editor
5. Click **Run** to create the missing tables

### 4. Verify All Tables Were Created

After running both schemas, you should see the following tables in the **Table Editor**:
- `leads`
- `lead_activities`
- `lead_documents`
- `properties`
- `contacts`
- `contact_activities`

**See `/database/SETUP-GUIDE.md` for detailed setup instructions and troubleshooting.**

## Features Included

### Lead Management
- Full CRUD operations (Create, Read, Update, Delete)
- Soft delete functionality (leads are marked as deleted, not removed)
- Row Level Security (RLS) for data protection
- Automatic timestamp tracking (created_at, updated_at)

### Standard CRM Fields

**Contact Information:**
- First name, last name
- Email, phone, mobile
- Company, job title
- Contact preferences

**Lead Classification:**
- Lead source (Website, Referral, etc.)
- Lead status (new, contacted, qualified, proposal, negotiation, won, lost)
- Lead type (cold, warm, hot)
- Priority (low, medium, high, urgent)

**Property Information (Real Estate Specific):**
- Property category (commercial, residential, manufacturing)
- Property type (apartment, villa, office, etc.)
- Location, budget, size
- Requirements

**Business Information:**
- Estimated value
- Expected close date
- Probability (0-100%)

**Additional Features:**
- Address information
- Description and notes
- Social media links (LinkedIn, Facebook)
- Assignment to users
- Follow-up tracking

### Database Security

The schema includes Row Level Security (RLS) policies:
- Users can view all non-deleted leads
- Users can create new leads
- Users can update leads they own or are assigned to
- Users can soft-delete leads they own

### Performance Optimizations

Multiple indexes are created for better query performance on:
- Email and phone lookups
- Status and priority filtering
- Source and category filtering
- User assignment
- Date-based queries

## Testing the Setup

After setting up the database:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. Sign in to your account

4. Click on "Leads" in the navigation

5. Try creating a new lead

If everything works correctly, you should be able to:
- View the leads list (empty initially)
- Create a new lead
- View lead details
- Edit lead information
- Delete leads (soft delete)

## Troubleshooting

### Tables Not Created
- Make sure you ran the entire SQL script
- Check for any error messages in the SQL editor
- Verify your Supabase project has proper permissions

### Cannot Create/Read Leads
- Ensure RLS policies were created correctly
- Verify you're logged in with a valid Supabase user
- Check browser console for authentication errors

### Missing Columns
- Re-run the schema.sql file
- Check if any SQL commands failed during execution

## Data Migration

If you have existing leads data, you can import it using:
1. The Supabase dashboard's CSV import feature
2. Custom SQL INSERT statements
3. The API endpoints provided in the application

## Future Enhancements

The schema is designed to support:
- Lead activities tracking
- Document attachments
- Advanced filtering and search
- Lead scoring
- Assignment workflows
- Email integration
- Calendar integration
