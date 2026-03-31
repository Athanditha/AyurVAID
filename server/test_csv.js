const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(__dirname, '../datasets/Prakriti.csv');

try {
    console.log('Testing CSV Loader...');
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const data = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    console.log('✅ Successfully parsed CSV');
    console.log('Total records:', data.length);
    console.log('First record sample:', JSON.stringify(data[0], null, 2));

    const doshaCol = Object.keys(data[0]).find(k => k.toLowerCase() === 'dosha');
    if (doshaCol) {
        console.log(`✅ Found Dosha column: "${doshaCol}"`);
    } else {
        console.log('❌ Could not find Dosha column. Available columns:', Object.keys(data[0]));
    }
} catch (error) {
    console.error('❌ CSV Test Failed:', error.message);
}
