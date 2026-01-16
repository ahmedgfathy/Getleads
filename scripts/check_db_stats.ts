import { query } from '@/lib/mariadb';

async function checkData() {
    try {
        const types = await query('SELECT property_type, COUNT(*) as c FROM properties GROUP BY property_type');
        console.log('Types:', types);
        const categories = await query('SELECT property_category, COUNT(*) as c FROM properties GROUP BY property_category');
        console.log('Categories:', categories);
    } catch (e) {
        console.error(e);
    }
}

checkData();
