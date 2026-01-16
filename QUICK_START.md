# Quick Start Guide - Leads Module

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup (2 minutes)

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `database/schema.sql` in this repository
6. Copy and paste the entire contents into the SQL editor
7. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)
8. ✅ Verify you see success messages

### Step 2: Environment Setup (1 minute)

If not already done:
```bash
# Copy environment template
cp .env.example .env.local

# Add your Supabase credentials
# Get them from: https://app.supabase.com/project/_/settings/api
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Install & Run (2 minutes)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 4: Test the Module

1. **Sign in** to your account (or create one)
2. Click **Leads** in the navigation bar
3. Click **New Lead** button
4. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: +1234567890
   - Company: ABC Corp
   - Status: New
   - Priority: High
5. Click **Create Lead**
6. ✅ You should see your first lead in the table!

## 📋 What You Can Do

### Create a Lead
- Navigate to Leads → New Lead
- Fill in required fields (First Name, Last Name)
- Add optional details (property, business info)
- Click Create

### View Leads
- Navigate to Leads
- See all your leads in a table
- Use filters to narrow down results
- Click on a lead to see full details

### Edit a Lead
- Go to lead detail page
- Click Edit button
- Update any information
- Click Save Changes

### Delete a Lead
- Go to lead detail page (or from table)
- Click Delete
- Confirm deletion
- Lead is soft-deleted (can be restored via database)

### Filter Leads
- Use the Search box to find leads by name, email, or company
- Filter by Status (New, Contacted, Qualified, etc.)
- Filter by Priority (Low, Medium, High, Urgent)

## 🎯 Common Workflows

### New Lead Capture
1. Click "New Lead"
2. Enter contact details
3. Set status to "New"
4. Set priority based on urgency
5. Add property requirements
6. Save

### Following Up
1. Go to Leads
2. Filter by Status: "New" or "Contacted"
3. Click on a lead
4. Update status to "Contacted" or "Qualified"
5. Add notes about the interaction
6. Save changes

### Closing a Deal
1. Find the lead
2. Update status to "Won"
3. Add final notes
4. Lead shows as successfully closed

### Pipeline Management
1. View all leads
2. Filter by status to see pipeline stages:
   - New: Just captured
   - Contacted: First touch made
   - Qualified: Meets criteria
   - Proposal: Sent quote/proposal
   - Negotiation: In discussion
   - Won: Deal closed
   - Lost: Deal fell through

## 🔑 Key Features

### Lead Information
- **Contact**: Name, email, phone, company
- **Classification**: Status, priority, type, source
- **Property**: Category, type, location, budget, size
- **Business**: Estimated value, close date, probability
- **Notes**: Description and internal notes

### Visual Indicators
- **Blue Badge**: New status
- **Green Badge**: Qualified/Won status
- **Red Badge**: Lost/Urgent priority
- **Orange Badge**: Negotiation/High priority
- **Purple Badge**: Contacted status

### Smart Features
- Auto-saves who created/updated
- Soft delete (no data loss)
- Real-time updates
- Dark mode support
- Mobile responsive

## 📊 Dashboard Overview

The dashboard shows:
- Total Leads count
- Breakdown by property category
- Lead sources distribution
- Lead types distribution

Click "View All Leads" to see the full list.

## 🔒 Security

- Must be logged in to access
- Can only see non-deleted leads
- Can update/delete own leads
- All actions are tracked (audit trail)
- Database-level security (RLS)

## 💡 Pro Tips

1. **Use Priority Wisely**: Set urgent for hot leads requiring immediate attention
2. **Track Sources**: Record where leads come from to optimize marketing
3. **Update Status Regularly**: Keep pipeline current for accurate forecasting
4. **Add Notes**: Document interactions for team collaboration
5. **Set Expected Close Dates**: Track timeline and follow-up needs
6. **Use Probability**: Forecast revenue with win probability percentages

## 🐛 Troubleshooting

### "No leads" message shown
- This is normal for new installations
- Click "New Lead" to create your first lead

### Can't see leads I created
- Check you're logged in with the same account
- Verify database schema was run correctly
- Check browser console for errors

### Form doesn't submit
- Ensure First Name and Last Name are filled
- Check browser console for errors
- Verify Supabase connection in .env.local

### Database errors
- Verify schema.sql was run completely
- Check Supabase project is active
- Verify environment variables are correct

## 📚 Next Steps

- Read `FEATURES.md` for detailed feature list
- Check `database/README.md` for database details
- See `IMPLEMENTATION_SUMMARY.md` for technical details
- Review code in `app/leads/` for customization

## 🎉 You're Ready!

The leads module is now set up and ready to use. Start adding your leads and managing your real estate pipeline!

For support, check the documentation files or review the code comments.
