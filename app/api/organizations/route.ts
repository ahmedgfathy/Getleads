import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET(request: Request) {
  try {
    const organizations = await query(`
      SELECT *
      FROM organizations
      WHERE is_deleted = 0 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
