import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch single property
      const results = await query(
        `SELECT 
          id, title, property_category, property_type, listing_type,
          price, area, bedrooms, bathrooms, city, state, country,
          status, reference_number, street_address, description,
          custom_fields, created_at, updated_at
        FROM properties 
        WHERE id = ? AND is_deleted = 0`,
        [id]
      );

      if (Array.isArray(results) && results.length > 0) {
        return NextResponse.json(results[0]);
      } else {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }
    } else {
      // Fetch all properties
      const properties = await query(`
        SELECT 
          id, title, property_category, property_type, listing_type,
          price, area, bedrooms, bathrooms, city, state, country,
          status, reference_number, street_address, description,
          custom_fields, created_at, updated_at
        FROM properties 
        WHERE is_deleted = 0 
        ORDER BY created_at DESC
      `);

      return NextResponse.json(properties);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
