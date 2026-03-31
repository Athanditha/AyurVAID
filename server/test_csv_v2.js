const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const csvPath = path.join(__dirname, '../datasets/Prakriti.csv');

try {
    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const data = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true // Add trim to handle potential whitespace
    });
    console.log('COLUMNS:', Object.keys(data[0]).join('|'));
    console.log('SAMPLE_ROW:', JSON.stringify(data[0]));
} catch (error) {
    console.error('ERROR:', error.message);
}
