const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'all-indicators.json');

const LEAK_PATTERNS = [
  // Footer summary leaks (with optional spaces between numbers like 3 5 or 2 5)
  /\s*รวม\s*\.?\s*[\d\s]+\s*ตัวชี้วัด.*$/g,
  /\s*[\d\s]+\s*ตัวชี้วัดปลายทาง.*$/g,
  /\s*[\d\s]+\s*ตัวชี้วัดระหว่างทาง.*$/g,
  /\s*ตัวชี้วัดระหว่างทาง.*$/g,
  /\s*ตัวชี้วัดปลายทาง.*$/g,

  // Leaked standard/strand descriptions
  /\s*ภาษากับความสัมพันธ์กับกลุ่มสาระการเรียนรู้อื่น\s*ในการพัฒนา\s*แสวงหาความรู้\s*และเปิดโลกทัศน์ของตน\s*และการแลกเปลี่ยนเรียนรู้กับสังคมโลก.*$/g,
  /\s*ในการพัฒนา\s*แสวงหาความรู้\s*และเปิดโลกทัศน์ของตน\s*และการแลกเปลี่ยนเรียนรู้กับสังคมโลก.*$/g,
  /\s*ในการพัฒนา\s*แสวงหาความรู้\s*และเปิดโลกทัศน์ของตน.*$/g,
  /\s*และความคิดเห็นอย่างมีประสิทธิภาพ\s*อย่างเหมาะสมกับกาลเท\s*ศะ.*$/g,
  /\s*และความคิดเห็นอย่างมีประสิทธิภาพ.*$/g,
  /\s*ภูมิปัญญาทางภาษา\s*และรักษาภาษาไทยไว้เป็นสมบัติของชาติ.*$/g,
  /\s*เขียนรายงานข้อมูลสารสนเทศและรายงานการศึกษาค้นคว้าอย่างมีประสิทธิภาพ.*$/g,
  /\s*ประยุกต์ใช้ในชีวิตจริง.*$/g,
  /\s*เพื่อพัฒนาอาชีพ\s*มีคุณธรรม\s*และมีเจตคติที่ดีต่ออาชีพ.*$/g
];

function cleanIndicatorName(code, name) {
  let cleaned = name;
  for (const p of LEAK_PATTERNS) {
    cleaned = cleaned.replace(p, '');
  }

  // Trailing footer number leak for specific codes
  if (code === 'ว 3.2 ป.6/2') {
    cleaned = cleaned.replace(/\s+10$/, '');
  }
  if (code.startsWith('ส 5.2 ม.') && /\s+1$/.test(cleaned)) {
    cleaned = cleaned.replace(/\s+1$/, '');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

let cleanedCount = 0;

for (const file of files) {
  const filePath = path.join(dataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let modified = false;

  for (const item of data) {
    const original = item.name;
    const cleaned = cleanIndicatorName(item.code, original);
    if (cleaned !== original) {
      console.log(`[CLEANED in ${file}] ${item.code}:`);
      console.log(`   BEFORE: "${original}"`);
      console.log(`   AFTER:  "${cleaned}"`);
      item.name = cleaned;
      modified = true;
      cleanedCount++;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

console.log(`\nTotal indicator names cleaned: ${cleanedCount}`);
