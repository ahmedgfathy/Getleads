import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET(request: Request) {
  try {
    const contacts = await query(`
      SELECT *
      FROM contacts 
      WHERE is_deleted = 0 
      ORDER BY created_at DESC
    `);

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
