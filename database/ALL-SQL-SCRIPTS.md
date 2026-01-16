# All SQL Scripts - Quick Reference

## 📋 Summary

| File | Status | Tables | Action Required |
|------|--------|--------|-----------------|
| `schema.sql` | ✅ Already executed | leads, lead_activities, lead_documents | **DO NOT RUN** (already exists) |
| `properties-contacts-schema.sql` | ⏳ Need to run | properties, contacts, contact_activities | **RUN THIS** |

---

## 🎯 What You Need to Do

Since you got the error `relation "leads" already exists`, this means **schema.sql** was already run.

### ✅ Next Step: Run This SQL

Go to Supabase SQL Editor and run: **`properties-contacts-schema.sql`**

This will create:
- ✅ `properties` table
- ✅ `contacts` table  
- ✅ `contact_activities` table

---

## 📝 Complete SQL Files List

### 1️⃣ schema.sql (DO NOT RUN AGAIN)
```
Location: /database/schema.sql
Status: Already executed in your database
Created: leads, lead_activities, lead_documents tables
Function: update_updated_at_column() trigger function
```

**This file was already run** - You got "relation leads already exists" which confirms this.

### 2️⃣ properties-contacts-schema.sql (RUN THIS NOW)
```
Location: /database/properties-contacts-schema.sql
Status: Needs to be executed
Creates: properties, contacts, contact_activities tables
Safe: Uses CREATE TABLE IF NOT EXISTS (won't error if tables exist)
```

**Run this file in Supabase SQL Editor** to add properties and contacts functionality.

---

## 🔍 How to Check What Tables Exist

Run this query in Supabase SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should currently see:
- ✅ leads
- ✅ lead_activities  
- ✅ lead_documents

After running `properties-contacts-schema.sql`, you'll see:
- ✅ leads
- ✅ lead_activities
- ✅ lead_documents
- ✅ contact_activities
- ✅ contacts
- ✅ properties

---

## 💡 Pro Tip

The SQL files use `CREATE TABLE IF NOT EXISTS` so they're safe to run multiple times. If a table already exists, it will be skipped.

---

## 🚨 Error Reference

| Error | Meaning | Solution |
|-------|---------|----------|
| `relation "leads" already exists` | Table already created | Skip schema.sql |
| `relation "properties" already exists` | Table already created | Safe to ignore |
| `function update_updated_at_column() does not exist` | Missing function | Run schema.sql first |

---

**Updated:** January 2026
