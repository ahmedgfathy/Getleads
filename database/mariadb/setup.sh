#!/bin/bash

# Setup script for MariaDB GetLeads database
# Run this script in WSL Ubuntu

DB_NAME="getleads"
DB_USER="root"
DB_PASS="zerocall"
DB_HOST="localhost"

echo "🚀 Setting up GetLeads database in MariaDB..."

# Create database
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database '$DB_NAME' created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

# Import schema files
echo "📊 Importing schemas..."

echo "  → Importing leads schema..."
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < schema.sql

echo "  → Importing properties & contacts schema..."
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < properties-contacts.sql

echo "  → Importing organizations schema..."
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < organizations.sql

echo "  → Importing import system schema..."
mysql -u$DB_USER -p$DB_PASS -h$DB_HOST $DB_NAME < import-system.sql

echo ""
echo "✅ All schemas imported successfully!"
echo ""
echo "📋 Database: $DB_NAME"
echo "📋 Host: $DB_HOST"
echo "📋 User: $DB_USER"
echo ""
echo "🔍 Verify installation:"
echo "  mysql -u$DB_USER -p$DB_PASS -e 'USE $DB_NAME; SHOW TABLES;'"
echo ""
echo "🎯 Next steps:"
echo "  1. Update .env.local with MariaDB connection"
echo "  2. Run the Next.js app"
echo "  3. Access /import to start importing files"
