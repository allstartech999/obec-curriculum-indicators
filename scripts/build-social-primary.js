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
  'ชั้นประถมศึกษา',
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
    .replace(/๐/g, '0').replace(/๑/g, '1').replace(/๒/g, '2').replace(/๓/g, '3').replace(/๔/g, '4')
    .replace(/๕/g, '5').replace(/๖/g, '6').replace(/๗/g, '7').replace(/๘/g, '8').replace(/๙/g, '9')
    .replace(/ส\s*(\d)\s*\.\s*(\d)/g, 'ส $1.$2')
    .replace(/ป\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ป.$1/$2')
    .replace(/ป\s*\.?\s*([0-9]+)/g, 'ป.$1')
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

function normalizeCode(raw, currentStandard, gradeLevel, colType) {
  let cleaned = raw
    .replace(/^\*\s*/, '')
    .replace(/ป\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ป.$1/$2')
    .replace(/\s+/g, ' ')
    .trim();

  // If starts with "ส 1.1 ป.1/1"
  if (/^ส\s*\d\.\d\s+ป\.\d+\/\d+/.test(cleaned)) {
    cleaned = cleaned.replace(/\s+/g, ' ');
  } else if (/^ส\s*(\d)\s+ป\.\d+\/\d+/.test(cleaned)) {
    const num = cleaned.match(/^ส\s*(\d)\s+ป/)[1];
    if (currentStandard && currentStandard.startsWith(`ส ${num}.`)) {
      cleaned = cleaned.replace(/^ส\s*\d\s+/, currentStandard + ' ');
    } else {
      cleaned = cleaned.replace(/^ส\s*\d\s+/, `ส ${num}.1 `);
    }
  } else if (/^ส\s+ป\.\d+\/\d+/.test(cleaned)) {
    cleaned = cleaned.replace(/^ส\s+/, currentStandard + ' ');
  } else if (!/^ส\s*\d\.\d/.test(cleaned)) {
    if (/^\d\.\d\s+ป\./.test(cleaned)) {
      cleaned = 'ส ' + cleaned;
    } else if (cleaned.startsWith('ป.')) {
      cleaned = currentStandard + ' ' + cleaned;
    }
  }

  // Handle PDF typos
  if (cleaned === 'ส 1.1 ป.3/2' && colType === 'FINAL') {
    cleaned = 'ส 1.2 ป.3/2';
  }

  return cleaned.replace(/\s+/g, ' ');
}

async function buildSocialPrimary() {
  const pdfPath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage\\8434969eef2420f7.pdf';
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();

  const configs = [
    { grade: 'ป.1', file: 'social-p1.json', pages: [3, 4, 5], targetTotal: 31, targetBetween: 22, targetFinal: 9 },
    { grade: 'ป.2', file: 'social-p2.json', pages: [6, 7, 8], targetTotal: 34, targetBetween: 22, targetFinal: 12 },
    { grade: 'ป.3', file: 'social-p3.json', pages: [9, 10, 11, 12], targetTotal: 39, targetBetween: 30, targetFinal: 9 },
    { grade: 'ป.4', file: 'social-p4.json', pages: [13, 14, 15, 16], targetTotal: 38, targetBetween: 26, targetFinal: 12 },
    { grade: 'ป.5', file: 'social-p5.json', pages: [17, 18, 19, 20], targetTotal: 36, targetBetween: 22, targetFinal: 14 },
    { grade: 'ป.6', file: 'social-p6.json', pages: [21, 22, 23, 24], targetTotal: 39, targetBetween: 24, targetFinal: 15 }
  ];

  const outDir = path.join(__dirname, '..', 'data');

  for (const cfg of configs) {
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

      const leftItems = rawItems.filter(i => i.x >= 70 && i.x < 360 && i.y < 720 && i.y > 60).sort((a, b) => b.y - a.y || a.x - b.x);
      const rightItems = rawItems.filter(i => i.x >= 360 && i.y < 720 && i.y > 60).sort((a, b) => b.y - a.y || a.x - b.x);

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

          // Strip leading group number
          line = line.replace(/^[0-9]+\s+/, '');

          // Regex matching indicator code at start of line
          const codeMatch = line.match(/^(\*?\s*(?:ส(?:\s*\d(?:\.\d)?)?\s+)?(?:ป\.\s*[0-9]+\/[0-9]+|\d\.\d\s+ป\.\s*[0-9]+\/[0-9]+))/);

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
            let normCode = normalizeCode(rawCode, currentStandard, cfg.grade, colType);
            const stdMatchCode = normCode.match(/ส\s*\d\.\d/);
            const stdCode = stdMatchCode ? stdMatchCode[0] : currentStandard;
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

    console.log(`[Social ${cfg.grade}] Total: ${items.length}/${cfg.targetTotal} (Between: ${betweenItems.length}/${cfg.targetBetween}, Final: ${finalItems.length}/${cfg.targetFinal})`);

    if (items.length !== cfg.targetTotal || betweenItems.length !== cfg.targetBetween || finalItems.length !== cfg.targetFinal) {
      throw new Error(`Discrepancy in Social ${cfg.grade}!`);
    }

    // Sort items by standard & code naturally
    items.sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true });
    });

    const destPath = path.join(outDir, cfg.file);
    fs.writeFileSync(destPath, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`Saved ${items.length} items to ${cfg.file}`);
  }

  console.log('\nAll Social Primary files generated successfully!');
}

buildSocialPrimary().catch(err => {
  console.error(err);
  process.exit(1);
});
