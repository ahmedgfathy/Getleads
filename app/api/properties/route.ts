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
      // Pagination & Filtering
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = (page - 1) * limit;
      const type = searchParams.get('type'); // 'sale' or 'rent'

      let whereClause = 'WHERE is_deleted = 0';
      const params: any[] = [];

      if (type === 'sale') {
          whereClause += ` AND (custom_fields LIKE '%sale%' OR custom_fields LIKE '%بيع%' OR listing_type = 'sale' OR status LIKE '%sale%')`;
      } else if (type === 'rent') {
          whereClause += ` AND (custom_fields LIKE '%rent%' OR custom_fields LIKE '%إيجار%' OR listing_type = 'rent' OR status LIKE '%rent%')`;
      }

      // Fetch filtered properties with pagination
      const properties = await query(`
        SELECT 
          id, title, property_category, property_type, listing_type,
          price, area, bedrooms, bathrooms, city, state, country,
          status, reference_number, street_address, description,
          custom_fields, created_at, updated_at
        FROM properties 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Get total count for pagination UI
      const countResult = await query(`
         SELECT COUNT(*) as total FROM properties ${whereClause}
      `, params);
      
      const total = Array.isArray(countResult) && countResult.length > 0 ? Number(countResult[0].total) : 0;

      return NextResponse.json({
          data: properties,
          pagination: {
              page,
              limit,
              total,
              totalPages: Math.ceil(total / limit)
          }
      });
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
