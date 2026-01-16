# Database Setup Guide

This guide explains all database tables for the GetLeads CRM system and how to set them up.

## 📋 Database Tables Overview

### Core Tables
1. **leads** - Main CRM lead management (✅ Already created)
2. **properties** - Real estate property listings
3. **contacts** - Contact management (Google Contacts standard)

### Related Tables
4. **lead_activities** - Track interactions with leads (✅ Already created)
5. **lead_documents** - Documents attached to leads (✅ Already created)
6. **contact_activities** - Track interactions with contacts

## 🚀 Quick Setup

### Step 1: Check What's Already Created

Go to your Supabase dashboard → **Table Editor** and check if you see these tables:
- ✅ `leads` (already exists)
- ✅ `lead_activities` (already exists)
- ✅ `lead_documents` (already exists)
- ❌ `properties` (needs to be created)
- ❌ `contacts` (needs to be created)
- ❌ `contact_activities` (needs to be created)

### Step 2: Run Missing Schemas

Since the **leads** table already exists, you only need to run the properties and contacts schema:

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the contents of `/database/properties-contacts-schema.sql`
4. Click **Run** to create the missing tables

---

## 📁 SQL Files Reference

### 1. schema.sql
**Purpose:** Creates leads module tables  
**Status:** ✅ Already executed in your database  
**Tables Created:**
- `leads` - Main lead management table
- `lead_activities` - Track lead interactions
- `lead_documents` - Store lead documents

**DO NOT RUN AGAIN** - This will cause "relation already exists" errors.

### 2. properties-contacts-schema.sql
**Purpose:** Creates properties and contacts tables  
**Status:** ⏳ Needs to be executed  
**Tables Created:**
- `properties` - Property listings management
- `contacts` - Contact management
- `contact_activities` - Track contact interactions

**RUN THIS FILE** - Safe to execute, uses `CREATE TABLE IF NOT EXISTS`

---

## 📊 Table Details

### Leads Table
**Schema File:** `schema.sql` (already created)  
**Purpose:** CRM lead management with comprehensive tracking  
**Key Fields:**
- Contact info: first_name, last_name, email, phone
- Lead classification: lead_source, lead_status, lead_type, lead_priority
- Property interests: property_category, property_type, property_budget
- Assignment: assigned_to, owner_id
- Tracking: created_at, updated_at, last_contact_date, next_follow_up_date

### Properties Table
**Schema File:** `properties-contacts-schema.sql` (NEW)  
**Purpose:** Real estate property listings  
**Key Fields:**
- Classification: property_category, property_type, listing_type
- Details: title, description, price, area, bedrooms, bathrooms
- Location: street_address, city, state, country
- Status: status (available, sold, rented, under_contract)
- Media: images (JSON array), video_url, virtual_tour_url
- Features: features (JSON array)

### Contacts Table
**Schema File:** `properties-contacts-schema.sql` (NEW)  
**Purpose:** Contact management following vCard/Google Contacts standard  
**Key Fields:**
- Name: prefix, first_name, middle_name, last_name, suffix, nickname
- Company: company, job_title, department
- Contact: email, phone, mobile, website
- Address: street_address, city, state, country
- Social: linkedin_url, facebook_url, twitter_url
- Categorization: tags (JSON array), contact_type, contact_source

---

## 🔒 Security Features

All tables include:
- **Row Level Security (RLS)** enabled
- **Policies** for SELECT, INSERT, UPDATE, DELETE
- **Soft delete** functionality (is_deleted flag)
- **Automatic timestamps** (created_at, updated_at)
- **User tracking** (created_by, updated_by)

---

## 🛠️ Common Commands

### Check if tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Drop a table (if you need to recreate):
```sql
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS contact_activities CASCADE;
```

### View table structure:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
```

---

## 📝 Execution Order

If starting fresh (all tables need to be created):

1. **First:** Run `schema.sql` (creates leads tables + helper functions)
2. **Second:** Run `properties-contacts-schema.sql` (creates properties + contacts)

**Note:** The `properties-contacts-schema.sql` depends on the `update_updated_at_column()` function created in `schema.sql`, so always run `schema.sql` first.

---

## ✅ Verification

After running the SQL scripts, verify by checking:

### In Table Editor:
You should see 6 tables:
- leads
- lead_activities
- lead_documents
- properties
- contacts
- contact_activities

### Test Queries:
```sql
-- Test leads table
SELECT COUNT(*) FROM leads;

-- Test properties table
SELECT COUNT(*) FROM properties;

-- Test contacts table
SELECT COUNT(*) FROM contacts;
```

All queries should return `0` (zero rows) without errors.

---

## 🐛 Troubleshooting

### Error: "relation 'leads' already exists"
**Solution:** The leads table is already created. Skip `schema.sql` and only run `properties-contacts-schema.sql`.

### Error: "function update_updated_at_column() does not exist"
**Solution:** Run `schema.sql` first to create the function, then run `properties-contacts-schema.sql`.

### Error: "permission denied"
**Solution:** Make sure you're logged into your Supabase project and have admin access.

---

## 📞 Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Verify you're running SQL in the correct project
3. Ensure your database connection is active
4. Try running tables individually if batch execution fails

---

**Last Updated:** January 2026  
**Database Version:** PostgreSQL 15+ (Supabase)
