# GetLeads

A Next.js Progressive Web App (PWA) with Supabase authentication featuring a login page as the default home page.

## Features

- 🔐 Supabase Authentication
- 📊 Leads CRM Module - Complete lead management system
- 📱 Progressive Web App (PWA) - Install on mobile and desktop
- 💾 Offline Support - Works without internet connection
- 🎨 Modern UI with Tailwind CSS
- 🌓 Dark mode support
- ✉️ Email/Password authentication
- 🔑 Password reset functionality
- 📱 Responsive design
- ⚡ Built with Next.js 16+ App Router

## PWA Features

GetLeads is a fully installable Progressive Web App:
- **Install on any device**: Android, iOS, or desktop
- **Offline functionality**: Continue working without internet
- **Smart caching**: Fast loading with intelligent cache strategies
- **Install prompt**: Automatic prompt to install the app
- **Native-like experience**: Full-screen mode and app icon on home screen

For detailed PWA documentation, see [PWA.md](./PWA.md).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ahmedgfathy/Getleads.git
cd Getleads
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Get your Supabase credentials from https://app.supabase.com/project/_/settings/api
   - Update the values:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the login page.

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. The authentication is already configured to use Email/Password
3. **Set up the Leads database schema:**
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and run the SQL from `/database/schema.sql`
   - See `/database/README.md` for detailed setup instructions
4. Optionally, configure email templates in your Supabase dashboard under Authentication > Email Templates

## Project Structure

```
├── app/
│   ├── api/
│   │   └── leads/           # API routes for lead CRUD operations
│   ├── dashboard/           # Protected dashboard page
│   │   └── page.tsx
│   ├── leads/               # Leads module pages
│   │   ├── [id]/           # Lead detail and edit pages
│   │   ├── new/            # New lead form
│   │   └── page.tsx        # Leads list
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Login page (home)
│   └── globals.css          # Global styles
├── database/
│   ├── schema.sql           # Database schema for leads
│   └── README.md            # Database setup instructions
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── types/
│   └── lead.ts              # TypeScript types for leads
├── .env.example             # Environment variables template
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Authentication Flow

1. Users land on the login page (default home page)
2. They can sign in, sign up, or reset their password
3. After successful authentication, they're redirected to the dashboard
4. The dashboard page checks authentication and redirects back to login if not authenticated
5. Users can sign out from the dashboard

## Leads Management

The application includes a complete CRM leads module with the following features:

### Lead Features
- **CRUD Operations**: Create, read, update, and delete leads
- **Lead Information**:
  - Contact details (name, email, phone, company)
  - Lead classification (status, priority, type, source)
  - Property information (category, type, location, budget, size)
  - Business details (estimated value, close date, probability)
  - Additional notes and descriptions
- **Filtering**: Filter leads by status, priority, and search terms
- **Soft Delete**: Leads are marked as deleted rather than permanently removed
- **Responsive UI**: Works seamlessly on desktop and mobile devices

### Lead Workflow
1. Navigate to "Leads" from the dashboard
2. View all leads in a sortable, filterable table
3. Create new leads with comprehensive forms
4. View detailed lead information
5. Edit lead data as it progresses through the sales pipeline
6. Track leads through different statuses (new, contacted, qualified, proposal, negotiation, won, lost)

### Database Tables
- `leads` - Main lead information
- `lead_activities` - Track interactions (calls, emails, meetings)
- `lead_documents` - Store related documents

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

This project is licensed under the ISC License.
