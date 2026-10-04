const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const masterFile = path.join(dataDir, 'all-indicators.json');
const indicators = JSON.parse(fs.readFileSync(masterFile, 'utf-8'));

console.log('================================================================');
console.log('DEEP COMPREHENSIVE CURRICULUM INTEGRITY AUDIT');
console.log('================================================================');
console.log(`Total Master Indicators to Audit: ${indicators.length}\n`);

let issuesFound = 0;

// 1. Check required fields and types
console.log('>>> [Check 1/6] Field Existence & Strict Schema Validation');
indicators.forEach((item, idx) => {
  const required = ['code', 'name', 'type', 'subjectArea', 'gradeLevel', 'strand'];
  for (const f of required) {
    if (!item[f] || typeof item[f] !== 'string' || item[f].trim() === '') {
      console.error(`[ERROR] Item #${idx} missing or empty field '${f}':`, item);
      issuesFound++;
    }
  }
  if (item.type !== 'BETWEEN' && item.type !== 'FINAL') {
    console.error(`[ERROR] Item #${idx} (${item.code}) invalid type: '${item.type}'`);
    issuesFound++;
  }
});
console.log(`  Passed Check 1 with ${issuesFound === 0 ? 'ZERO issues' : issuesFound + ' issues'}.\n`);

// 2. Check for duplicate codes
console.log('>>> [Check 2/6] Uniqueness of Indicator Codes');
const codeSet = new Map();
indicators.forEach((item, idx) => {
  if (codeSet.has(item.code)) {
    console.error(`[ERROR] Duplicate code detected: '${item.code}' at index ${idx} (first seen at ${codeSet.get(item.code)})`);
    issuesFound++;
  } else {
    codeSet.set(item.code, idx);
  }
});
console.log(`  Passed Check 2 with ${codeSet.size} unique indicator codes.\n`);

// 3. Check Code vs GradeLevel consistency
console.log('>>> [Check 3/6] Code vs GradeLevel Consistency');
let gradeMismatches = 0;
indicators.forEach(item => {
  const code = item.code;
  const grade = item.gradeLevel;

  // Grade level inside code
  const codeGradeMatch = code.match(/(ป\.[1-6]|ม\.[1-6]|ม\.[1-6]-[1-6]|ม\.[4-6]-[4-6])/);
  if (!codeGradeMatch) {
    console.error(`[ERROR] Code does not contain recognizable grade: '${code}'`);
    issuesFound++;
    gradeMismatches++;
  } else {
    const codeGrade = codeGradeMatch[0];
    // Check if consistent
    let expectedMatch = false;
    if (grade === codeGrade) {
      expectedMatch = true;
    } else if (grade === 'ม.4-6' && (codeGrade === 'ม.4-6' || codeGrade === 'ม.4' || codeGrade === 'ม.5' || codeGrade === 'ม.6')) {
      expectedMatch = true;
    } else if ((grade === 'ม.4' || grade === 'ม.5' || grade === 'ม.6') && (codeGrade === 'ม.4-6' || codeGrade === grade)) {
      expectedMatch = true;
    }

    if (!expectedMatch) {
      console.error(`[ERROR] Grade mismatch: Item code has '${codeGrade}' but gradeLevel field is '${grade}' (Code: ${code})`);
      issuesFound++;
      gradeMismatches++;
    }
  }
});
console.log(`  Passed Check 3 with ${gradeMismatches} grade mismatches.\n`);

// 4. Check for boilerplate words or corrupted text in names
console.log('>>> [Check 4/6] Name Quality, Length & Boilerplate Leaks');
const suspiciousSubstrings = [
  'ตัวชี้วัดระหว่างทาง',
  'ตัวชี้วัดปลายทาง',
  'ตามหลักสูตรแกนกลาง',
  'สาระการเรียนรู้',
  'กลุ่มสาระการเรียนรู้',
  'รวม ๑',
  'รวม ๒',
  'รวม ๓',
  'รวม 1',
  'รวม 2',
  'รวม 3',
  'กลุ่มที่'
];

let badNames = 0;
indicators.forEach(item => {
  const name = item.name;
  if (name.length < 5) {
    console.error(`[SUSPICIOUS] Extremely short name (${name.length} chars): [${item.code}] "${name}"`);
    issuesFound++;
    badNames++;
  }

  for (const s of suspiciousSubstrings) {
    if (s === 'กลุ่มที่' && !/กลุ่มที่\s*\d+/.test(name)) {
      continue; // e.g. "กลุ่มที่ไม่ใช่พืชและสัตว์" is legitimate biology text
    }
    if (s.includes('สาระการเรียนรู้') && name.includes('สาระการเรียนรู้อื่น')) {
      continue; // e.g. "บูรณาการกับสาระการเรียนรู้อื่น" is legitimate curriculum text
    }

    if (name.includes(s)) {
      console.warn(`[WARNING] Boilerplate leak in name: [${item.code}] contains "${s}": "${name}"`);
      issuesFound++;
      badNames++;
    }
  }

  // Check for broken encoding or non-printable chars
  if (/\uFFFD/.test(name)) {
    console.error(`[ERROR] Replacement character (broken encoding) in [${item.code}] "${name}"`);
    issuesFound++;
    badNames++;
  }
});
console.log(`  Passed Check 4 with ${badNames} suspicious names.\n`);

// 5. Check Strand Consistency
console.log('>>> [Check 5/6] Strand Consistency with Standard Code');
const STD_TO_STRAND = {
  // Thai
  'ท 1.1': 'สาระที่ 1 การอ่าน',
  'ท 2.1': 'สาระที่ 2 การเขียน',
  'ท 3.1': 'สาระที่ 3 การฟัง การดู และการพูด',
  'ท 4.1': 'สาระที่ 4 หลักการใช้ภาษาไทย',
  'ท 5.1': 'สาระที่ 5 วรรณคดีและวรรณกรรม',
  // Math
  'ค 1.1': 'สาระที่ 1 จำนวนและพีชคณิต',
  'ค 1.2': 'สาระที่ 1 จำนวนและพีชคณิต',
  'ค 1.3': 'สาระที่ 1 จำนวนและพีชคณิต',
  'ค 2.1': 'สาระที่ 2 การวัดและเรขาคณิต',
  'ค 2.2': 'สาระที่ 2 การวัดและเรขาคณิต',
  'ค 3.1': 'สาระที่ 3 สถิติและความน่าจะเป็น',
  'ค 3.2': 'สาระที่ 3 สถิติและความน่าจะเป็น',
  // Science
  'ว 1.1': 'สาระที่ 1 วิทยาศาสตร์ชีวภาพ',
  'ว 1.2': 'สาระที่ 1 วิทยาศาสตร์ชีวภาพ',
  'ว 1.3': 'สาระที่ 1 วิทยาศาสตร์ชีวภาพ',
  'ว 2.1': 'สาระที่ 2 วิทยาศาสตร์กายภาพ',
  'ว 2.2': 'สาระที่ 2 วิทยาศาสตร์กายภาพ',
  'ว 2.3': 'สาระที่ 2 วิทยาศาสตร์กายภาพ',
  'ว 3.1': 'สาระที่ 3 วิทยาศาสตร์โลก และอวกาศ',
  'ว 3.2': 'สาระที่ 3 วิทยาศาสตร์โลก และอวกาศ',
  'ว 4.1': 'สาระที่ 4 เทคโนโลยี',
  'ว 4.2': 'สาระที่ 4 เทคโนโลยี',
  // Social
  'ส 1.1': 'สาระที่ 1 ศาสนา ศีลธรรม จริยธรรม',
  'ส 1.2': 'สาระที่ 1 ศาสนา ศีลธรรม จริยธรรม',
  'ส 2.1': 'สาระที่ 2 หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม',
  'ส 2.2': 'สาระที่ 2 หน้าที่พลเมือง วัฒนธรรม และการดำเนินชีวิตในสังคม',
  'ส 3.1': 'สาระที่ 3 เศรษฐศาสตร์',
  'ส 3.2': 'สาระที่ 3 เศรษฐศาสตร์',
  'ส 4.1': 'สาระที่ 4 ประวัติศาสตร์',
  'ส 4.2': 'สาระที่ 4 ประวัติศาสตร์',
  'ส 4.3': 'สาระที่ 4 ประวัติศาสตร์',
  'ส 5.1': 'สาระที่ 5 ภูมิศาสตร์',
  'ส 5.2': 'สาระที่ 5 ภูมิศาสตร์',
  // Health
  'พ 1.1': 'สาระที่ 1 การเจริญเติบโตและพัฒนาการของมนุษย์',
  'พ 2.1': 'สาระที่ 2 ชีวิตและครอบครัว',
  'พ 3.1': 'สาระที่ 3 การเคลื่อนไหว การออกกำลังกาย การเล่นเกม กีฬาไทย และกีฬาสากล',
  'พ 3.2': 'สาระที่ 3 การเคลื่อนไหว การออกกำลังกาย การเล่นเกม กีฬาไทย และกีฬาสากล',
  'พ 4.1': 'สาระที่ 4 การสร้างเสริมสุขภาพ สมรรถภาพและการป้องกันโรค',
  'พ 5.1': 'สาระที่ 5 ความปลอดภัยในชีวิต',
  // Arts
  'ศ 1.1': 'สาระที่ 1 ทัศนศิลป์',
  'ศ 1.2': 'สาระที่ 1 ทัศนศิลป์',
  'ศ 2.1': 'สาระที่ 2 ดนตรี',
  'ศ 2.2': 'สาระที่ 2 ดนตรี',
  'ศ 3.1': 'สาระที่ 3 นาฏศิลป์',
  'ศ 3.2': 'สาระที่ 3 นาฏศิลป์',
  // Career
  'ง 1.1': 'สาระที่ 1 การดำรงชีวิตและครอบครัว',
  'ง 2.1': 'สาระที่ 2 การอาชีพ',
  // English
  'ต 1.1': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 1.2': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 1.3': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 2.1': 'สาระที่ 2 ภาษาและวัฒนธรรม',
  'ต 2.2': 'สาระที่ 2 ภาษาและวัฒนธรรม',
  'ต 3.1': 'สาระที่ 3 ภาษากับความสัมพันธ์กับกลุ่มสาระการเรียนรู้อื่น',
  'ต 4.1': 'สาระที่ 4 ภาษากับความสัมพันธ์กับชุมชนและโลก',
  'ต 4.2': 'สาระที่ 4 ภาษากับความสัมพันธ์กับชุมชนและโลก'
};

let strandMismatches = 0;
indicators.forEach(item => {
  const stdMatch = item.code.match(/^[ก-๙]\s*\d\.\d/);
  if (stdMatch) {
    const std = stdMatch[0];
    const expectedStrand = STD_TO_STRAND[std];
    if (expectedStrand && item.strand !== expectedStrand) {
      console.error(`[ERROR] Strand mismatch for ${item.code}: expected '${expectedStrand}' but got '${item.strand}'`);
      issuesFound++;
      strandMismatches++;
    }
  }
});
console.log(`  Passed Check 5 with ${strandMismatches} strand mismatches.\n`);

// 6. Check Sequential Indicator Indexing per Standard & Grade
console.log('>>> [Check 6/6] Sequential Indicator Numbers (Gap Analysis)');
// Group by (Standard + GradeLevel)
const groups = new Map();
indicators.forEach(item => {
  const match = item.code.match(/^([ก-๙]\s*\d\.\d)\s+(?:ป\.\d+|ม\.\d+|ม\.\d+-\d+)\/(\d+)/);
  if (match) {
    const stdGrade = item.code.split('/')[0];
    const num = parseInt(match[2], 10);
    if (!groups.has(stdGrade)) {
      groups.set(stdGrade, []);
    }
    groups.get(stdGrade).push(num);
  }
});

let sequenceGaps = 0;
for (const [key, nums] of groups.entries()) {
  nums.sort((a, b) => a - b);
  // Check if starts at 1 and consecutive
  for (let i = 0; i < nums.length; i++) {
    const expected = i + 1;
    if (nums[i] !== expected) {
      console.warn(`[GAP DETECTED] In '${key}': numbers are [${nums.join(', ')}], missing or unexpected ${expected}`);
      issuesFound++;
      sequenceGaps++;
      break;
    }
  }
}
console.log(`  Checked ${groups.size} distinct (Standard + Grade) series.`);
console.log(`  Passed Check 6 with ${sequenceGaps} gaps.\n`);

// Final summary
console.log('================================================================');
console.log('FINAL AUDIT SUMMARY:');
console.log(`Total Indicators Analyzed: ${indicators.length}`);
console.log(`Total Issues Found:        ${issuesFound}`);
console.log(`Data Quality Rating:       ${issuesFound === 0 ? '100% PERFECT' : 'NEEDS ATTENTION'}`);
console.log('================================================================');
