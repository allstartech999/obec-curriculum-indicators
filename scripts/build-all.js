const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Systematic order of all subject and grade files
const files = [
  // Thai (ภาษาไทย)
  'thai-p1.json', 'thai-p2.json', 'thai-p3.json', 'thai-p4.json', 'thai-p5.json', 'thai-p6.json',
  'thai-m1.json', 'thai-m2.json', 'thai-m3.json', 'thai-highschool.json',

  // Mathematics (คณิตศาสตร์)
  'math-p1.json', 'math-p2.json', 'math-p3.json', 'math-p4.json', 'math-p5.json', 'math-p6.json',
  'math-m1.json', 'math-m2.json', 'math-m3.json', 'math-highschool.json',

  // Science & Technology (วิทยาศาสตร์และเทคโนโลยี)
  'science-p1.json', 'science-p2.json', 'science-p3.json', 'science-p4.json', 'science-p5.json', 'science-p6.json',
  'science-m1.json', 'science-m2.json', 'science-m3.json', 'science-highschool.json',

  // Social Studies (สังคมศึกษา ศาสนา และวัฒนธรรม)
  'social-p1.json', 'social-p2.json', 'social-p3.json', 'social-p4.json', 'social-p5.json', 'social-p6.json',
  'social-m1.json', 'social-m2.json', 'social-m3.json', 'social-highschool.json',

  // Health & Physical Education (สุขศึกษาและพลศึกษา)
  'health-p1.json', 'health-p2.json', 'health-p3.json', 'health-p4.json', 'health-p5.json', 'health-p6.json',
  'health-m1.json', 'health-m2.json', 'health-m3.json', 'health-highschool.json',

  // Arts (ศิลปะ)
  'arts-p1.json', 'arts-p2.json', 'arts-p3.json', 'arts-p4.json', 'arts-p5.json', 'arts-p6.json',
  'arts-m1.json', 'arts-m2.json', 'arts-m3.json', 'arts-highschool.json',

  // Career and Technology (การงานอาชีพ)
  'career-p1.json', 'career-p2.json', 'career-p3.json', 'career-p4.json', 'career-p5.json', 'career-p6.json',
  'career-m1.json', 'career-m2.json', 'career-m3.json', 'career-highschool.json',

  // Foreign Languages / English (ภาษาต่างประเทศ / ภาษาอังกฤษ)
  'english-p1.json', 'english-p2.json', 'english-p3.json', 'english-p4.json', 'english-p5.json', 'english-p6.json',
  'english-m1.json', 'english-m2.json', 'english-m3.json', 'english-highschool.json'
];

let allIndicators = [];
const seenCodes = new Set();
let duplicatesCount = 0;

const statsBySubject = {};

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File ${file} not found.`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const item of data) {
    const key = `${item.code}_${item.gradeLevel}`;
    if (seenCodes.has(key)) {
      duplicatesCount++;
      console.warn(`Duplicate found for key: ${key}`);
    } else {
      seenCodes.add(key);
      allIndicators.push(item);

      const subj = item.subjectArea;
      if (!statsBySubject[subj]) {
        statsBySubject[subj] = { total: 0, between: 0, final: 0, primary: 0, secondary: 0 };
      }
      statsBySubject[subj].total++;
      if (item.type === 'BETWEEN') statsBySubject[subj].between++;
      if (item.type === 'FINAL') statsBySubject[subj].final++;

      if (item.gradeLevel.startsWith('ป.')) {
        statsBySubject[subj].primary++;
      } else {
        statsBySubject[subj].secondary++;
      }
    }
  }
}

const outPath = path.join(dataDir, 'all-indicators.json');
fs.writeFileSync(outPath, JSON.stringify(allIndicators, null, 2), 'utf8');

console.log('='.repeat(80));
console.log('OBEC CURRICULUM INDICATORS MASTER COMPILATION REPORT');
console.log('='.repeat(80));
console.log(
  'Subject Area'.padEnd(35) +
  'Primary'.padStart(10) +
  'Secondary'.padStart(12) +
  'Between'.padStart(10) +
  'Final'.padStart(8) +
  'Total'.padStart(8)
);
console.log('-'.repeat(80));

let sumPrimary = 0;
let sumSecondary = 0;
let sumBetween = 0;
let sumFinal = 0;
let sumTotal = 0;

for (const [subj, s] of Object.entries(statsBySubject)) {
  console.log(
    subj.padEnd(35) +
    String(s.primary).padStart(10) +
    String(s.secondary).padStart(12) +
    String(s.between).padStart(10) +
    String(s.final).padStart(8) +
    String(s.total).padStart(8)
  );
  sumPrimary += s.primary;
  sumSecondary += s.secondary;
  sumBetween += s.between;
  sumFinal += s.final;
  sumTotal += s.total;
}

console.log('-'.repeat(80));
console.log(
  'GRAND TOTAL'.padEnd(35) +
  String(sumPrimary).padStart(10) +
  String(sumSecondary).padStart(12) +
  String(sumBetween).padStart(10) +
  String(sumFinal).padStart(8) +
  String(sumTotal).padStart(8)
);
console.log('='.repeat(80));
console.log(`\nFiles processed: ${files.length}`);
console.log(`Duplicates avoided: ${duplicatesCount}`);
console.log(`Saved master dataset to: ${outPath} (${allIndicators.length} indicators)\n`);
