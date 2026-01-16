import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function GET() {
  try {
    // We use LIKE queries because the data is in a JSON string column and structure varies
    const [
      totalResult,
      apartmentResult,
      villaResult,
      commercialResult,
      adminResult
    ] = await Promise.all([
      query('SELECT COUNT(*) as c FROM properties WHERE is_deleted = 0'),
      query(`SELECT COUNT(*) as c FROM properties WHERE is_deleted = 0 AND (custom_fields LIKE '%Apartment%' OR custom_fields LIKE '%شقة%' OR custom_fields LIKE '%Duplex%' OR custom_fields LIKE '%Penthouse%')`),
      query(`SELECT COUNT(*) as c FROM properties WHERE is_deleted = 0 AND (custom_fields LIKE '%Villa%' OR custom_fields LIKE '%فيلا%' OR custom_fields LIKE '%Town House%' OR custom_fields LIKE '%Twin House%' OR custom_fields LIKE '%Stand alone%')`),
      query(`SELECT COUNT(*) as c FROM properties WHERE is_deleted = 0 AND (custom_fields LIKE '%Commercial%' OR custom_fields LIKE '%تجاري%' OR custom_fields LIKE '%Shop%' OR custom_fields LIKE '%Store%')`),
      query(`SELECT COUNT(*) as c FROM properties WHERE is_deleted = 0 AND (custom_fields LIKE '%Admin%' OR custom_fields LIKE '%إداري%' OR custom_fields LIKE '%Office%')`)
    ]);

    // Helper to safely extract count (handling array return from query)
    const getCount = (res: any) => {
        if (Array.isArray(res) && res.length > 0) return Number(res[0].c);
        return 0;
    };

    return NextResponse.json({
      total: getCount(totalResult),
      aparments: getCount(apartmentResult), // keeping variable name typo-safe if used elsewhere, but "apartments" is correct
      villas: getCount(villaResult),
      commercial: getCount(commercialResult),
      admin: getCount(adminResult)
    });

  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
