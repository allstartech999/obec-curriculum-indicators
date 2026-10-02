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
  'ต 1.1': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 1.2': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 1.3': 'สาระที่ 1 ภาษาเพื่อการสื่อสาร',
  'ต 2.1': 'สาระที่ 2 ภาษาและวัฒนธรรม',
  'ต 2.2': 'สาระที่ 2 ภาษาและวัฒนธรรม',
  'ต 3.1': 'สาระที่ 3 ภาษากับความสัมพันธ์กับกลุ่มสาระการเรียนรู้อื่น',
  'ต 4.1': 'สาระที่ 4 ภาษากับความสัมพันธ์กับชุมชนและโลก',
  'ต 4.2': 'สาระที่ 4 ภาษากับความสัมพันธ์กับชุมชนและโลก'
};

const boilerplatePrefixes = [
  'มาตรฐาน',
  'สาระที่',
  'กลุ่มที่',
  'ตัวชี้วัด',
  'หมายเหตุ',
  'ชั้นประถมศึกษา',
  'รวม ',
  'ตามหลักสูตรแกนกลาง'
];

function isBoilerplateLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed === '-') return true;
  for (const p of boilerplatePrefixes) {
    if (trimmed.startsWith(p)) return true;
  }
  if (trimmed.startsWith('เข้าใจและตีความ') || trimmed.startsWith('มีทักษะการสื่อสาร') || trimmed.startsWith('รู้และเข้าใจ')) return true;
  return false;
}

function cleanLine(l) {
  return l
    .replace(/๐/g, '0').replace(/๑/g, '1').replace(/๒/g, '2').replace(/๓/g, '3').replace(/๔/g, '4')
    .replace(/๕/g, '5').replace(/๖/g, '6').replace(/๗/g, '7').replace(/๘/g, '8').replace(/๙/g, '9')
    .replace(/ต\s*\.\s*(\d)/g, 'ต $1')
    .replace(/ต\s*(\d)\s*\.\s*(\d)/g, 'ต $1.$2')
    .replace(/ป\s*\.?\s*\/\s*([0-9])\s*([0-9])/g, 'ป.$1/$2')
    .replace(/ป\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ป.$1/$2')
    .replace(/ป\s*\.?\s*([0-9]+)/g, 'ป.$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCode(raw, currentStandard, gradeLevel) {
  let cleaned = raw
    .replace(/^\*\s*/, '')
    .replace(/ป\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ป.$1/$2')
    .replace(/\s+/g, ' ')
    .trim();

  // If starts with "ต 1.1 ป.1/1"
  if (/^ต\s*\d\.\d\s+ป\.\d+\/\d+/.test(cleaned)) {
    return cleaned.replace(/\s+/g, ' ');
  }

  // If starts with "ต 1 ป.1/1"
  if (/^ต\s*(\d)\s+ป\.\d+\/\d+/.test(cleaned)) {
    const num = cleaned.match(/^ต\s*(\d)\s+ป/)[1];
    if (currentStandard && currentStandard.startsWith(`ต ${num}.`)) {
      cleaned = cleaned.replace(/^ต\s*\d\s+/, currentStandard + ' ');
    } else {
      cleaned = cleaned.replace(/^ต\s*\d\s+/, `ต ${num}.1 `);
    }
  }

  // If starts with "ต ป.1/1"
  if (/^ต\s+ป\.\d+\/\d+/.test(cleaned)) {
    cleaned = cleaned.replace(/^ต\s+/, currentStandard + ' ');
  }

  if (!/^ต\s*\d\.\d/.test(cleaned)) {
    if (/^\d\.\d\s+ป\./.test(cleaned)) {
      cleaned = 'ต ' + cleaned;
    } else if (cleaned.startsWith('ป.')) {
      cleaned = currentStandard + ' ' + cleaned;
    }
  }

  return cleaned.replace(/\s+/g, ' ');
}

async function buildEnglishPrimary() {
  const pdfPath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage\\4f16994ffe8153f4.pdf';
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();

  const configs = [
    { grade: 'ป.1', file: 'english-p1.json', pages: [3, 4], targetTotal: 16, targetBetween: 10, targetFinal: 6 },
    { grade: 'ป.2', file: 'english-p2.json', pages: [5, 6], targetTotal: 16, targetBetween: 10, targetFinal: 6 },
    { grade: 'ป.3', file: 'english-p3.json', pages: [7, 8], targetTotal: 18, targetBetween: 12, targetFinal: 6 },
    { grade: 'ป.4', file: 'english-p4.json', pages: [9, 10, 11], targetTotal: 20, targetBetween: 14, targetFinal: 6 },
    { grade: 'ป.5', file: 'english-p5.json', pages: [12, 13, 14], targetTotal: 20, targetBetween: 14, targetFinal: 6 },
    { grade: 'ป.6', file: 'english-p6.json', pages: [15, 16, 17], targetTotal: 20, targetBetween: 14, targetFinal: 6 }
  ];

  const outDir = path.join(__dirname, '..', 'data');

  for (const cfg of configs) {
    let currentStandard = 'ต 1.1';
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
          const stdMatch = line.match(/มาตรฐาน\s*(ต\s*\d\.\d)/);
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
          const codeMatch = line.match(/^(\*?\s*(?:ต(?:\s*\d(?:\.\d)?)?\s+)?(?:ป\.\s*[0-9]+\/[0-9]+|\d\.\d\s+ป\.\s*[0-9]+\/[0-9]+))/);

          if (codeMatch) {
            if (currentItem) {
              const fullText = currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim();
              if (!indicatorsMap.has(currentItem.code)) {
                indicatorsMap.set(currentItem.code, {
                  code: currentItem.code,
                  name: fullText,
                  type: currentItem.type,
                  subjectArea: 'ภาษาต่างประเทศ',
                  gradeLevel: cfg.grade,
                  strand: STRAND_MAP[currentItem.std] || 'ภาษาต่างประเทศ'
                });
              }
            }

            const rawCode = codeMatch[0];
            let normCode = normalizeCode(rawCode, currentStandard, cfg.grade);
            const stdMatchCode = normCode.match(/ต\s*\d\.\d/);
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
              subjectArea: 'ภาษาต่างประเทศ',
              gradeLevel: cfg.grade,
              strand: STRAND_MAP[currentItem.std] || 'ภาษาต่างประเทศ'
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

    console.log(`[English ${cfg.grade}] Total: ${items.length}/${cfg.targetTotal} (Between: ${betweenItems.length}/${cfg.targetBetween}, Final: ${finalItems.length}/${cfg.targetFinal})`);

    if (items.length !== cfg.targetTotal || betweenItems.length !== cfg.targetBetween || finalItems.length !== cfg.targetFinal) {
      throw new Error(`Discrepancy in English ${cfg.grade}!`);
    }

    // Sort items by code naturally
    items.sort((a, b) => {
      return a.code.localeCompare(b.code, undefined, { numeric: true });
    });

    const destPath = path.join(outDir, cfg.file);
    fs.writeFileSync(destPath, JSON.stringify(items, null, 2), 'utf-8');
    console.log(`Saved ${items.length} items to ${cfg.file}`);
  }

  console.log('\nAll English Primary files generated successfully!');
}

buildEnglishPrimary().catch(err => {
  console.error(err);
  process.exit(1);
});
