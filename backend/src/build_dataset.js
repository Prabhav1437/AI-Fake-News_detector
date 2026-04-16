const fs = require('fs');
const path = require('path');

// Simple CSV parser (handles quoted fields with commas inside)
function parseCSV(content) {
    const rows = [];
    const lines = content.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        try {
            const values = parseCSVLine(line);
            if (values.length >= 2) {
                const row = {};
                headers.forEach((h, idx) => {
                    row[h.trim()] = (values[idx] || '').trim();
                });
                rows.push(row);
            }
        } catch(e) { /* skip bad rows */ }
    }
    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (ch === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += ch;
        }
    }
    result.push(current);
    return result;
}

// Load CSVs
const fakeCSV = fs.readFileSync(
    path.join(__dirname, '../../../fake_news_dataset.csv'), 'utf8'
);
const realCSV = fs.readFileSync(
    path.join(__dirname, '../../../news_dataset.csv'), 'utf8'
);

const fakeRows = parseCSV(fakeCSV);
const realRows = parseCSV(realCSV);

console.log(`Fake rows: ${fakeRows.length}, Real rows: ${realRows.length}`);

// Sample 50 fake + 50 real examples for the RAG knowledge base
// Select diverse examples by spreading across the dataset
function sampleDiverse(rows, count) {
    const step = Math.floor(rows.length / count);
    const samples = [];
    for (let i = 0; i < count && i * step < rows.length; i++) {
        samples.push(rows[i * step]);
    }
    return samples;
}

const fakeSamples = sampleDiverse(fakeRows, 50);
const realSamples = sampleDiverse(realRows, 50);

// Build RAG knowledge base entries
const knowledgeBase = [];

// Process fake news
fakeSamples.forEach(row => {
    // fake_news_dataset.csv has: title, text, FAKE (label in 3rd col)
    const keys = Object.keys(row);
    const title = row[keys[0]] || '';
    const text = row[keys[1]] || '';
    if (!title && !text) return;
    
    const snippet = (title + ' ' + text).substring(0, 300).replace(/\s+/g, ' ').trim();
    if (snippet.length < 20) return;

    knowledgeBase.push({
        text: snippet,
        label: "FAKE",
        reasoning: "This article exhibits patterns common in fake/biased news: emotionally charged language, partisan framing, unverified claims, or satire/misinformation patterns observed in the training dataset."
    });
});

// Process real news (news_dataset.csv has: title, content, source, url, label)
realSamples.forEach(row => {
    const title = row['title'] || row[Object.keys(row)[0]] || '';
    const content = row['content'] || row[Object.keys(row)[1]] || '';
    const label = (row['label'] || '').toString().trim().toUpperCase();
    
    if (!title && !content) return;
    const snippet = (title + ' ' + content).substring(0, 300).replace(/\s+/g, ' ').trim();
    if (snippet.length < 20) return;

    const isReal = !label.includes('FAKE');
    knowledgeBase.push({
        text: snippet,
        label: isReal ? "REAL" : "FAKE",
        reasoning: isReal
            ? "This article demonstrates factual reporting standards: neutral language, real-world grounding, and verifiable claims consistent with credible journalism."
            : "This article contains patterns of misinformation or manipulative framing identified in the labeled dataset."
    });
});

// Save the knowledge base
const outputPath = path.join(__dirname, 'dataset.json');
fs.writeFileSync(outputPath, JSON.stringify(knowledgeBase, null, 2));
console.log(`\n✅ RAG Knowledge Base built: ${knowledgeBase.length} entries saved to dataset.json`);
console.log(`   Fake examples: ${knowledgeBase.filter(e => e.label === 'FAKE').length}`);
console.log(`   Real examples: ${knowledgeBase.filter(e => e.label === 'REAL').length}`);
