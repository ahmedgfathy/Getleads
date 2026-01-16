import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET() {
  try {
    const jobs = await query(
      `SELECT id, file_name, file_type, file_size, entity_type, 
              total_rows, imported_rows, skipped_rows, error_rows, duplicate_rows,
              status, progress_percent, created_at, started_at, completed_at
       FROM import_jobs 
       ORDER BY created_at DESC 
       LIMIT 100`
    );

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching import history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch import history' },
      { status: 500 }
    );
  }
}
