import { NextResponse } from 'next/server';
import { query } from '@/lib/mariadb';

export async function POST() {
  try {
    // 1. Identify duplicates based on custom_fields
    // We group by custom_fields and find those with count > 1
    // Note: Comparing JSON fields directly can be sensitive to key order/spacing.
    // If data was imported from same source, they are likely identical strings.
    
    console.log('Starting deduplication process...');

    // Find duplicates based on custom_fields casting to CHAR for comparison
    // We select the ID of the record we want to KEEP (the earliest created_at)
    // and identify all other IDs to DELETE.
    
    /* 
      Strategy:
      1. Get all properties that are not deleted.
      2. In the application layer, group them by a hash or stringified custom_fields.
      3. Collect IDs to delete.
      4. Execute delete.
      
      Doing this in SQL purely can be complex with JSON types depending on DB version.
      Doing it in app layer is safer for custom logic.
    */

    const allProperties = await query(`
      SELECT id, custom_fields, created_at 
      FROM properties 
      WHERE is_deleted = 0
    `);

    const seenMap = new Map();
    const idsToDelete: string[] = [];

    for (const prop of allProperties) {
      // Create a signature for comparison. 
      // specific logic: if custom_fields is purely where data lies.
      // We perform a stable stringify if it's an object, or just use the string.
      
      let signature = '';
      
      try {
        if (typeof prop.custom_fields === 'string') {
          // Parse and re-stringify to ensure key order doesn't matter if logic allows,
          // OR just use the string if we trust the exact string match.
          // Let's rely on string match for now as it's likely exact string duplication from repeated imports.
          
          // normalized:
          const obj = JSON.parse(prop.custom_fields);
          signature = JSON.stringify(obj, Object.keys(obj).sort());
        } else if (prop.custom_fields) {
           signature = JSON.stringify(prop.custom_fields, Object.keys(prop.custom_fields).sort());
        } else {
           signature = 'EMPTY_CUSTOM_FIELDS'; 
           // We generally don't want to dedup empty entries unless we are sure.
           // Let's skip empty ones for safety, or treat them as duplicates?
           // The user said "entire data info similar".
           continue; 
        }
      } catch (e) {
        // Fallback to raw string if parsing fails
        signature = String(prop.custom_fields);
      }

      if (seenMap.has(signature)) {
        // We have seen this content before.
        // The one in the map is the one we keep (first one encountered).
        // So this current 'prop.id' is a duplicate.
        idsToDelete.push(prop.id);
      } else {
        seenMap.set(signature, prop.id);
      }
    }

    if (idsToDelete.length > 0) {
      console.log(`Found ${idsToDelete.length} duplicates to remove.`);
      
      // Delete in batches if necessary, but for now single query
      // Use placeholders for security
      const placeholders = idsToDelete.map(() => '?').join(',');
      
      // Soft delete
      await query(
        `UPDATE properties SET is_deleted = 1 WHERE id IN (${placeholders})`,
        idsToDelete
      );
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully removed ${idsToDelete.length} duplicate properties.`,
        deletedCount: idsToDelete.length
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'No duplicate properties found.',
        deletedCount: 0
      });
    }

  } catch (error) {
    console.error('Error in deduplication:', error);
    return NextResponse.json(
      { error: 'Failed to deduplicate properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
