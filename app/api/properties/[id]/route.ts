import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const results = await query(
      `SELECT * FROM properties WHERE id = ? AND is_deleted = 0`,
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
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Clean undefined values
    const safeValue = (val: any) => val === undefined ? null : val;

    await query(
      `UPDATE properties SET
        title = ?,
        property_category = ?,
        property_type = ?,
        listing_type = ?,
        price = ?,
        area = ?,
        bedrooms = ?,
        bathrooms = ?,
        city = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        safeValue(body.title),
        safeValue(body.property_category),
        safeValue(body.property_type),
        safeValue(body.listing_type),
        safeValue(body.price),
        safeValue(body.area),
        safeValue(body.bedrooms),
        safeValue(body.bathrooms),
        safeValue(body.city),
        id
      ]
    );

    // Also update custom_fields if provided
    if (body.custom_fields) {
       // First get existing custom_fields to merge or overwrite
       // For now, assuming we just update the specific column if we had a deep merge utility
       // But simpler is to just update whatever is passed if it's the full object, 
       // or we rely on the client to send the full latest object.
       
       await query(
         `UPDATE properties SET custom_fields = ? WHERE id = ?`,
         [JSON.stringify(body.custom_fields), id]
       );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query(
      `UPDATE properties SET is_deleted = 1 WHERE id = ?`,
      [id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
