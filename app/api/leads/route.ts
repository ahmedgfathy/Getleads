import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// GET /api/leads - Get all leads
// POST /api/leads - Create a new lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const source = searchParams.get('source');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Build query
    let query = supabase
      .from('leads')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('lead_status', status);
    }
    if (priority) {
      query = query.eq('lead_priority', priority);
    }
    if (source) {
      query = query.eq('lead_source', source);
    }
    if (category) {
      query = query.eq('property_category', category);
    }
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads }, { status: 200 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Set default values and user info
    const leadData = {
      ...body,
      created_by: user.id,
      owner_id: user.id,
      lead_status: body.lead_status || 'new',
      lead_priority: body.lead_priority || 'medium',
      country: body.country || 'Egypt',
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
