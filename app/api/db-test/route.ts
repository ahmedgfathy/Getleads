import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET() {
  try {
    // Test database connection
    const result = await query('SELECT 1 as test');
    
    // Get table count
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'getleads'
      ORDER BY table_name
    `);
    
    // Get custom fields count
    const customFields = await query('SELECT COUNT(*) as count FROM custom_field_definitions');
    
    // Get import jobs count
    const imports = await query('SELECT COUNT(*) as count FROM import_jobs');
    
    return NextResponse.json({
      status: 'connected',
      database: 'getleads',
      tables: tables.map((t: any) => t.table_name),
      stats: {
        totalTables: tables.length,
        customFields: customFields[0]?.count || 0,
        importJobs: imports[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
