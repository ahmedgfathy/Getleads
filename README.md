# GetLeads

A Next.js application with Supabase authentication featuring a login page as the default home page.

## Features

- 🔐 Supabase Authentication
- 🎨 Modern UI with Tailwind CSS
- 🌓 Dark mode support
- ✉️ Email/Password authentication
- 🔑 Password reset functionality
- 📱 Responsive design
- ⚡ Built with Next.js 15+ App Router

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
3. Optionally, configure email templates in your Supabase dashboard under Authentication > Email Templates

## Project Structure

```
├── app/
│   ├── dashboard/      # Protected dashboard page
│   │   └── page.tsx
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Login page (home)
│   └── globals.css     # Global styles
├── lib/
│   └── supabase.ts     # Supabase client configuration
├── .env.example        # Environment variables template
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

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

This project is licensed under the ISC License.