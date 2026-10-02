const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Order of files for deterministic master compilation
const files = [
  // Thai
  'thai-m1.json',
  'thai-m2.json',
  'thai-m3.json',
  'thai-highschool.json',
  'thai-p1.json',
  // Math
  'math-m1.json',
  'math-m2.json',
  'math-m3.json',
  'math-highschool.json',
  'math-p1.json',
  // Science & Tech
  'science-m1.json',
  'science-m2.json',
  'science-m3.json',
  'science-highschool.json',
  'science-p1.json',
  // Social Studies
  'social-m1.json',
  'social-m2.json',
  'social-m3.json',
  'social-highschool.json',
  // Health & PE
  'health-m1.json',
  'health-m2.json',
  'health-m3.json',
  'health-highschool.json',
  // Arts
  'arts-m1.json',
  'arts-m2.json',
  'arts-m3.json',
  'arts-highschool.json',
  // Career
  'career-m1.json',
  'career-m2.json',
  'career-m3.json',
  'career-highschool.json',
  // English
  'english-m1.json',
  'english-m2.json',
  'english-m3.json',
  'english-highschool.json'
];

let allIndicators = [];
const seenCodes = new Set();
let duplicatesCount = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File ${file} not found.`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Loaded ${data.length} indicators from ${file}`);
  
  for (const item of data) {
    const key = `${item.code}_${item.gradeLevel}`;
    if (seenCodes.has(key)) {
      duplicatesCount++;
      console.warn(`Duplicate found for key: ${key}`);
    } else {
      seenCodes.add(key);
      allIndicators.push(item);
    }
  }
}

const outPath = path.join(dataDir, 'all-indicators.json');
fs.writeFileSync(outPath, JSON.stringify(allIndicators, null, 2), 'utf8');

console.log(`\nMaster compilation complete!`);
console.log(`Total unique indicators in all-indicators.json: ${allIndicators.length}`);
console.log(`Duplicates avoided: ${duplicatesCount}`);
console.log(`File written to: ${outPath}`);
