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
  'ท 1.1': 'สาระที่ 1 การอ่าน',
  'ท 2.1': 'สาระที่ 2 การเขียน',
  'ท 3.1': 'สาระที่ 3 การฟัง การดู และการพูด',
  'ท 4.1': 'สาระที่ 4 หลักการใช้ภาษาไทย',
  'ท 5.1': 'สาระที่ 5 วรรณคดีและวรรณกรรม'
};

const boilerplatePrefixes = [
  'มาตรฐาน',
  'สาระที่',
  'กลุ่มที่',
  'ตัวชี้วัด',
  'หมายเหตุ',
  'ชั้นมัธยมศึกษา',
  'รวม ',
  'ตามหลักสูตรแกนกลาง'
];

function isBoilerplateLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '-') return true;
  for (const p of boilerplatePrefixes) {
    if (trimmed.startsWith(p)) return true;
  }
  if (trimmed.startsWith('ใช้กระบวนการ') || trimmed.startsWith('เข้าใจธรรมชาติ') || trimmed.startsWith('รู้และเข้าใจ')) return true;
  return false;
}

function cleanLine(l) {
  return l
    .replace(/๐/g, '0').replace(/๑/g, '1').replace(/๒/g, '2').replace(/๓/g, '3').replace(/๔/g, '4')
    .replace(/๕/g, '5').replace(/๖/g, '6').replace(/๗/g, '7').replace(/๘/g, '8').replace(/๙/g, '9')
    .replace(/ท\s*\.?\s*(\d)\s*\.\s*(\d)/g, 'ท $1.$2')
    .replace(/ม\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1/$2')
    .replace(/ม\s*\.?\s*([0-9]+)/g, 'ม.$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCode(raw, currentStandard, gradeLevel) {
  let cleaned = raw
    .replace(/^\*\s*/, '')
    .replace(/ม\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1/$2')
    .replace(/\s+/g, ' ')
    .trim();

  // If starts with "ท 1.1 ม.1/1"
  if (/^ท\s*\d\.\d\s+ม\.\d+\/\d+/.test(cleaned)) {
    return cleaned.replace(/\s+/g, ' ');
  }

  // If starts with "ท 1 ม.1/1"
  if (/^ท\s*(\d)\s+ม\.\d+\/\d+/.test(cleaned)) {
    const num = cleaned.match(/^ท\s*(\d)\s+ม/)[1];
    if (currentStandard && currentStandard.startsWith(`ท ${num}.`)) {
      cleaned = cleaned.replace(/^ท\s*\d\s+/, currentStandard + ' ');
    } else {
      cleaned = cleaned.replace(/^ท\s*\d\s+/, `ท ${num}.1 `);
    }
  }

  // If starts with "ท ม.1/1"
  if (/^ท\s+ม\.\d+\/\d+/.test(cleaned)) {
    cleaned = cleaned.replace(/^ท\s+/, currentStandard + ' ');
  }

  if (!/^ท\s*\d\.\d/.test(cleaned)) {
    if (/^\d\.\d\s+ม\./.test(cleaned)) {
      cleaned = 'ท ' + cleaned;
    } else if (cleaned.startsWith('ม.')) {
      cleaned = currentStandard + ' ' + cleaned;
    }
  }

  return cleaned.replace(/\s+/g, ' ');
}

async function testThaiSecondary() {
  const pdfPath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage\\bf76c9c33c7b1b15.pdf';
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();

  const configs = [
    { grade: 'ม.1', file: 'thai-m1.json', pages: [19, 20, 21], targetTotal: 35, targetBetween: 24, targetFinal: 11 },
    { grade: 'ม.2', file: 'thai-m2.json', pages: [22, 23, 24], targetTotal: 32, targetBetween: 22, targetFinal: 10 },
    { grade: 'ม.3', file: 'thai-m3.json', pages: [25, 26, 27], targetTotal: 36, targetBetween: 26, targetFinal: 10 }
  ];

  for (const cfg of configs) {
    let currentStandard = 'ท 1.1';
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

          const stdMatch = line.match(/มาตรฐาน\s*(ท\s*\d\.\d)/);
          if (stdMatch) {
            currentStandard = stdMatch[1].replace(/\s+/g, ' ');
            continue;
          }

          if (isBoilerplateLine(line)) {
            continue;
          }

          line = line.replace(/^[0-9]+\s+/, '');

          const codeMatch = line.match(/^(\*?\s*(?:ท(?:\s*\d(?:\.\d)?)?\s+)?(?:ม\.\s*[0-9]+\/[0-9]+|\d\.\d\s+ม\.\s*[0-9]+\/[0-9]+))/);

          if (codeMatch) {
            if (currentItem) {
              const fullText = currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim();
              if (!indicatorsMap.has(currentItem.code)) {
                indicatorsMap.set(currentItem.code, {
                  code: currentItem.code,
                  name: fullText,
                  type: currentItem.type,
                  subjectArea: 'ภาษาไทย',
                  gradeLevel: cfg.grade,
                  strand: STRAND_MAP[currentItem.std] || 'ภาษาไทย'
                });
              }
            }

            const rawCode = codeMatch[0];
            let normCode = normalizeCode(rawCode, currentStandard, cfg.grade);
            const stdMatchCode = normCode.match(/ท\s*\d\.\d/);
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
          const fullText = currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim();
          if (!indicatorsMap.has(currentItem.code)) {
            indicatorsMap.set(currentItem.code, {
              code: currentItem.code,
              name: fullText,
              type: currentItem.type,
              subjectArea: 'ภาษาไทย',
              gradeLevel: cfg.grade,
              strand: STRAND_MAP[currentItem.std] || 'ภาษาไทย'
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

    console.log(`[Thai ${cfg.grade}] Total: ${items.length}/${cfg.targetTotal} (Between: ${betweenItems.length}/${cfg.targetBetween}, Final: ${finalItems.length}/${cfg.targetFinal})`);
    if (items.length !== cfg.targetTotal || betweenItems.length !== cfg.targetBetween || finalItems.length !== cfg.targetFinal) {
      console.log('Items found:');
      items.forEach(it => console.log(`  ${it.code} [${it.type}] ${it.name.slice(0, 30)}`));
    } else {
      const outPath = path.join(__dirname, '..', 'data', cfg.file);
      items.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
      fs.writeFileSync(outPath, JSON.stringify(items, null, 2), 'utf-8');
      console.log(`Successfully written ${cfg.file}!`);
    }
  }
}

testThaiSecondary().catch(console.error);
