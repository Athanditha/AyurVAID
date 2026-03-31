const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

class PrakritiDataLoader {
    constructor() {
        this.csvPath = path.join(__dirname, '../../datasets/Prakriti.csv');
        this.data = null;
        this.loadData();
    }

    loadData() {
        try {
            const fileContent = fs.readFileSync(this.csvPath, 'utf8');
            this.data = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true, // Handle rows with extra commas in quotes better
                trim: true
            });
            console.log(`✅ Loaded ${this.data.length} Prakriti records from CSV`);
        } catch (error) {
            console.error('❌ Failed to load Prakriti CSV dataset:', error.message);
            this.data = [];
        }
    }

    findBestMatch(responses) {
        if (!this.data || this.data.length === 0) return null;

        let bestMatch = null;
        let maxMatches = -1;

        for (const record of this.data) {
            let matches = 0;

            // Match each response field to the CSV record fields
            for (const [key, value] of Object.entries(responses)) {
                // Robust matching: Check if the selected user value is contained within the CSV cell
                // or vice versa, ignoring case and whitespace.
                const csvValue = String(record[key] || '').toLowerCase();
                const userValue = String(value || '').toLowerCase();

                if (csvValue && userValue && (csvValue.includes(userValue) || userValue.includes(csvValue))) {
                    matches++;
                }
            }

            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatch = record;
            }
        }

        return bestMatch;
    }

    getAllRecords() {
        return this.data;
    }
}

module.exports = new PrakritiDataLoader();
