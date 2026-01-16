import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET() {
  try {
    const types = await query('SELECT property_type, COUNT(*) as count FROM properties GROUP BY property_type');
    const categories = await query('SELECT property_category, COUNT(*) as count FROM properties GROUP BY property_category');
    // Also check custom fields for a few rows to see if data is hidden there
    const samples = await query('SELECT id, property_type, property_category, custom_fields FROM properties LIMIT 5');

    return NextResponse.json({ types, categories, samples });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
