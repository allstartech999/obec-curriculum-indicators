const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

function groupIntoLines(items) {
  const lines = [];
  let currentLine = [];
  let currentY = null;

  for (const item of items) {
    if (currentY === null) {
      currentY = item.y;
      currentLine.push(item);
    } else if (Math.abs(item.y - currentY) <= 4) {
      currentLine.push(item);
    } else {
      currentLine.sort((a, b) => a.x - b.x);
      lines.push(currentLine.map(i => i.str).join(' '));
      currentLine = [item];
      currentY = item.y;
    }
  }
  if (currentLine.length > 0) {
    currentLine.sort((a, b) => a.x - b.x);
    lines.push(currentLine.map(i => i.str).join(' '));
  }
  return lines;
}

const STRAND_MAP = {
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
  'ส 5.2': 'สาระที่ 5 ภูมิศาสตร์'
};

const boilerplatePrefixes = [
  'มาตรฐาน',
  'สาระที่',
  'กลุ่มที่',
  'ตัวชี้วัด',
  'หมายเหตุ',
  'ชั้นมัธยมศึกษา',
  'รวม ',
  '* วิธีการทางประวัติศาสตร์',
  'วิธีการทางประวัติศาสตร์'
];

const boilerplatePhrases = [
  'เพื่ออยู่ร่วมกันอย่างสันติสุข',
  'และธำรงรักษาพระพุทธศาสนา',
  'หรือศาสนาที่ตนนับถือ',
  'และธำรงรักษา',
  'ประเพณีและวัฒนธรรมไทย',
  'ดำรงชีวิตอยู่ร่วมกันในสังคมไทย',
  'และการดำเนินชีวิตในสังคม',
  'และสังคมโลกอย่างสันติสุข',
  'ยึดมั่น ศรัทธา',
  'การปกครองระบอบประชาธิปไตยอันมีพระมหากษัตริย์ทรงเป็นประมุข',
  'เพื่อการดำรงชีวิตอย่างมีดุลยภาพ',
  'ที่มีอยู่จำกัดได้อย่างมีประสิทธิภาพและคุ้มค่า',
  'รวมทั้งเข้าใจหลักการของเศรษฐกิจพอเพียง',
  'ของการร่วมมือกันทางเศรษฐกิจในสังคมโลก',
  'ความสัมพันธ์ทางเศรษฐกิจและความจำเป็น',
  'ทางประวัติศาสตร์มาวิเคราะห์เหตุการณ์ต่าง ๆ อย่างเป็นระบบ',
  'สามารถใช้วิธีการ',
  'การเปลี่ยนแปลงของเหตุการณ์อย่างต่อเนื่อง',
  'ตระหนักถึงความสำคัญ และสามารถวิเคราะห์ ผลกระทบที่เกิดขึ้น',
  'และธำรงความเป็นไทย',
  'มีความรัก ความภูมิใจ',
  'และใช้ข้อมูลภูมิสารสนเทศอย่างมีประสิทธิภาพ',
  'เพื่อการพัฒนาที่ยั่งยืน',
  'พัฒนาที่ยั่งยืน',
  'วัฒนธรรม มีจิตสำนึกและมีส่วนร่วมในการอนุรักษ์',
  'ในระบบของธรรมชาติ ใช้แผนที่และเครื่องมือ',
  'ในการค้นหา วิเคราะห์ สรุป',
  'วิธีการทางประวัติศาสตร์เป็นกระบวนการที่ใช้ในการจัดการเรียนรู้',
  'ดังนั้น วิธีการทางประวัติศาสตร์จึงระบุไว้ในทุกกลุ่มตัวชี้วัด',
  'ทางประวัติศาสตร์ที่ผู้เรียนควรศึกษา',
  'ผลกระทบที่เกิดขึ้น'
];

function isBoilerplateLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '-') return true;
  for (const p of boilerplatePrefixes) {
    if (trimmed.startsWith(p)) return true;
  }
  if (trimmed.startsWith('เข้าใจ') || trimmed.startsWith('รู้และเข้าใจ')) return true;
  for (const phrase of boilerplatePhrases) {
    if (trimmed.includes(phrase)) return true;
  }
  return false;
}

function cleanLine(l) {
  return l
    .replace(/ม\s*\.?\s*4\s*-\s*6/g, 'ม.4-6')
    .replace(/ม\s*\.?\s*๔\s*-\s*๖/g, 'ม.4-6')
    .replace(/๑/g, '1').replace(/๒/g, '2').replace(/๓/g, '3').replace(/๔/g, '4')
    .replace(/๕/g, '5').replace(/๖/g, '6').replace(/๗/g, '7').replace(/๘/g, '8').replace(/๙/g, '9')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanThaiSpaces(text) {
  return text
    .replace(/แ\s+ละ/g, 'และ')
    .replace(/วิเ\s+เคราะห์/g, 'วิเคราะห์')
    .replace(/ศาส\s+นา/g, 'ศาสนา')
    .replace(/อภิปร\s+าย/g, 'อภิปราย')
    .replace(/ความสั\s+มพันธ์/g, 'ความสัมพันธ์')
    .replace(/ฉบับปัจ\s+จุบั/g, 'ฉบับปัจจุบัน')
    .replace(/ข้อธรรมสำคั\s+ญ/g, 'ข้อธรรมสำคัญ')
    .replace(/ศาสนิก\s+ชน/g, 'ศาสนิกชน')
    .replace(/วัฒน\s+ธรรม/g, 'วัฒนธรรม')
    .replace(/อย่างหมาะ\s*สม/g, 'อย่างเหมาะสม')
    .replace(/อย่างหมาะ/g, 'อย่างเหมาะสม')
    .replace(/ระหว่\s+าง/g, 'ระหว่าง')
    .replace(/ก\s+าร/g, 'การ')
    .replace(/ตนนับถื\s+อ/g, 'ตนนับถือ')
    .replace(/ปร\s+ะจำวัน/g, 'ประจำวัน')
    .replace(/\s*-\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCode(raw, currentStandard, gradeLevel) {
  let cleaned = raw
    .replace(/^\*\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If missing standard prefix (e.g. "ม.2/1" or "2.2 ม.3/1")
  if (!/^ส\s*\d\.\d/.test(cleaned)) {
    if (/^\d\.\d\s+ม\./.test(cleaned)) {
      cleaned = 'ส ' + cleaned;
    } else if (cleaned.startsWith('ม.')) {
      cleaned = currentStandard + ' ' + cleaned;
    }
  }

  // Handle typos in official PDF
  if (cleaned === 'ส 3.2 ม.2/2' && raw.includes('ปัจจัยการผลิต')) {
    cleaned = 'ส 3.1 ม.2/2';
  }
  if (cleaned === 'ส 3.2 ม.2/4' && raw.includes('คุ้มครองสิทธิ')) {
    cleaned = 'ส 3.1 ม.2/4';
  }
  if (cleaned === 'ส 1.1 ม.3/5' && (currentStandard === 'ส 2.1' || raw.includes('เสนอแนวคิด'))) {
    cleaned = 'ส 2.1 ม.3/5';
  }

  return cleaned.replace(/\s+/g, ' ');
}

async function buildSocial() {
  const pdfPath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage\\8434969eef2420f7.pdf';
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();

  const configs = [
    { grade: 'ม.1', file: 'social-m1.json', pages: [25, 26, 27, 28, 29], targetTotal: 45, targetBetween: 27, targetFinal: 18 },
    { grade: 'ม.2', file: 'social-m2.json', pages: [30, 31, 32, 33, 34], targetTotal: 45, targetBetween: 30, targetFinal: 15 },
    { grade: 'ม.3', file: 'social-m3.json', pages: [35, 36, 37, 38, 39], targetTotal: 50, targetBetween: 33, targetFinal: 17 },
    { grade: 'ม.4-6', file: 'social-highschool.json', pages: [40, 41, 42, 43, 44, 45], targetTotal: 61, targetBetween: 42, targetFinal: 19 }
  ];

  for (const cfg of configs) {
    console.log(`\nProcessing ${cfg.grade}...`);
    let currentStandard = 'ส 1.1';
    const indicatorsMap = new Map();

    for (const p of cfg.pages) {
      const page = await parser.doc.getPage(p);
      const content = await page.getTextContent();
      const rawItems = content.items
        .map(i => ({
          str: i.str.trim(),
          x: Math.round(i.transform[4]),
          y: Math.round(i.transform[5]),
          w: Math.round(i.width)
        }))
        .filter(i => i.str.length > 0);

      // Boundary y < 700 to include top-most indicator lines while excluding header
      const leftItems = rawItems.filter(i => i.x >= 110 && i.x < 360 && i.y < 700 && i.y > 60).sort((a, b) => b.y - a.y || a.x - b.x);
      const rightItems = rawItems.filter(i => i.x >= 360 && i.y < 700 && i.y > 60).sort((a, b) => b.y - a.y || a.x - b.x);

      const leftLines = groupIntoLines(leftItems).map(cleanLine);
      const rightLines = groupIntoLines(rightItems).map(cleanLine);

      function processColumn(lines, colType) {
        let currentItem = null;
        for (let line of lines) {
          line = line.trim();
          if (!line) continue;

          // Check standard header
          const stdMatch = line.match(/มาตรฐาน\s*(ส\s*\d\.\d)/);
          if (stdMatch) {
            currentStandard = stdMatch[1].replace(/\s+/g, ' ');
            continue;
          }

          if (isBoilerplateLine(line)) {
            continue;
          }

          // Regex matching indicator code at start of line
          const codeMatch = line.match(/^(\*?\s*(?:ส\s*\d\.\d\s+)?(?:ม\.\s*(?:[0-9]+|4-6)\/[0-9]+|\d\.\d\s+ม\.\s*(?:[0-9]+|4-6)\/[0-9]+))/);

          if (codeMatch) {
            if (currentItem) {
              const fullText = cleanThaiSpaces(currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim());
              if (!indicatorsMap.has(currentItem.code)) {
                indicatorsMap.set(currentItem.code, {
                  code: currentItem.code,
                  name: fullText,
                  type: currentItem.type,
                  subjectArea: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
                  gradeLevel: cfg.grade,
                  strand: STRAND_MAP[currentItem.std] || 'สังคมศึกษา ศาสนา และวัฒนธรรม'
                });
              }
            }

            const rawCode = codeMatch[0];
            let normCode = normalizeCode(rawCode, currentStandard, cfg.grade);

            if (normCode === 'ส 3.2 ม.2/2' && line.includes('ปัจจัยการผลิต')) {
              normCode = 'ส 3.1 ม.2/2';
            }
            if (normCode === 'ส 3.2 ม.2/4' && line.includes('คุ้มครองสิทธิ')) {
              normCode = 'ส 3.1 ม.2/4';
            }
            if ((normCode === 'ส 1.1 ม.3/5' || rawCode.includes('ม.3/5')) && (line.includes('เสนอแนวคิด') || line.includes('ดำรงชีวิตอย่างมีความสุข'))) {
              normCode = 'ส 2.1 ม.3/5';
            }

            const stdCode = normCode.match(/ส\s*\d\.\d/)[0];
            currentStandard = stdCode;

            let rest = line.slice(rawCode.length).trim();
            currentItem = {
              code: normCode,
              std: stdCode,
              nameParts: rest && !isBoilerplateLine(rest) ? [rest] : [],
              type: colType
            };
          } else if (currentItem) {
            if (!isBoilerplateLine(line)) {
              currentItem.nameParts.push(line);
            }
          }
        }

        if (currentItem) {
          const fullText = cleanThaiSpaces(currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim());
          if (!indicatorsMap.has(currentItem.code)) {
            indicatorsMap.set(currentItem.code, {
              code: currentItem.code,
              name: fullText,
              type: currentItem.type,
              subjectArea: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
              gradeLevel: cfg.grade,
              strand: STRAND_MAP[currentItem.std] || 'สังคมศึกษา ศาสนา และวัฒนธรรม'
            });
          }
        }
      }

      processColumn(leftLines, 'BETWEEN');
      processColumn(rightLines, 'FINAL');
    }

    const items = Array.from(indicatorsMap.values());
    const betweenItems = items.filter(i => i.type === 'BETWEEN');
    const finalItems = items.filter(i => i.type === 'FINAL');

    console.log(`${cfg.grade} Total: ${items.length} (Target: ${cfg.targetTotal})`);
    console.log(`${cfg.grade} Between: ${betweenItems.length} (Target: ${cfg.targetBetween})`);
    console.log(`${cfg.grade} Final: ${finalItems.length} (Target: ${cfg.targetFinal})`);

    if (items.length !== cfg.targetTotal || betweenItems.length !== cfg.targetBetween || finalItems.length !== cfg.targetFinal) {
      throw new Error(`Count mismatch in ${cfg.grade}! Expected ${cfg.targetTotal} (${cfg.targetBetween} B, ${cfg.targetFinal} F), got ${items.length} (${betweenItems.length} B, ${finalItems.length} F)`);
    }

    const outPath = path.join(__dirname, '../data', cfg.file);
    fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf8');
    console.log(`Saved ${items.length} indicators to ${outPath}`);
  }

  console.log('\nAll Social Studies indicators built successfully!');
}

buildSocial().catch(console.error);
