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
  'ง 1.1': 'สาระที่ 1 การดำรงชีวิตและครอบครัว',
  'ง 2.1': 'สาระที่ 2 การอาชีพ'
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
  if (trimmed.startsWith('เข้าใจการทำงาน') || trimmed.startsWith('มีทักษะกระบวนการทำงาน ทักษะการจัดการ') || trimmed.startsWith('รู้และเข้าใจ') || trimmed.startsWith('เข้าใจ มีทักษะที่จำเป็น')) return true;
  return false;
}

function cleanLine(l) {
  return l
    .replace(/๐/g, '0').replace(/๑/g, '1').replace(/๒/g, '2').replace(/๓/g, '3').replace(/๔/g, '4')
    .replace(/๕/g, '5').replace(/๖/g, '6').replace(/๗/g, '7').replace(/๘/g, '8').replace(/๙/g, '9')
    .replace(/ง\s*\.?\s*(\d)\s*\.\s*(\d)/g, 'ง $1.$2')
    .replace(/ม\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1/$2')
    .replace(/ม\s*\.?\s*([0-9]+)\s*-\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1-$2/$3')
    .replace(/ม\s*\.?\s*([0-9]+)/g, 'ม.$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCode(raw, currentStandard, gradeLevel) {
  let cleaned = raw
    .replace(/^\*\s*/, '')
    .replace(/ม\s*\.?\s*([0-9]+)\s*-\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1-$2/$3')
    .replace(/ม\s*\.?\s*([0-9]+)\s*\/\s*([0-9]+)/g, 'ม.$1/$2')
    .replace(/\s+/g, ' ')
    .trim();

  // If starts with "ง 1.1 ม.1/1" or "ง 1.1 ม.4-6/1"
  if (/^ง\s*\d\.\d\s+ม\./.test(cleaned)) {
    return cleaned.replace(/\s+/g, ' ');
  }

  // If starts with "ง 1 ม."
  if (/^ง\s*(\d)\s+ม\./.test(cleaned)) {
    const num = cleaned.match(/^ง\s*(\d)\s+ม/)[1];
    cleaned = cleaned.replace(/^ง\s*\d\s+/, `ง ${num}.1 `);
  }

  // If starts with "ง ม."
  if (/^ง\s+ม\./.test(cleaned)) {
    cleaned = cleaned.replace(/^ง\s+/, currentStandard + ' ');
  }

  if (!/^ง\s*\d\.\d/.test(cleaned)) {
    if (/^\d\.\d\s+ม\./.test(cleaned)) {
      cleaned = 'ง ' + cleaned;
    } else if (cleaned.startsWith('ม.')) {
      cleaned = currentStandard + ' ' + cleaned;
    }
  }

  return cleaned.replace(/\s+/g, ' ');
}

async function testCareerSecondary() {
  const pdfPath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage\\7ebbd0baa58c3ddb.pdf';
  const parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await parser.load();

  const configs = [
    { grade: 'ม.1', file: 'career-m1.json', pages: [9], targetTotal: 6, targetBetween: 3, targetFinal: 3 },
    { grade: 'ม.2', file: 'career-m2.json', pages: [10], targetTotal: 6, targetBetween: 2, targetFinal: 4 },
    { grade: 'ม.3', file: 'career-m3.json', pages: [11], targetTotal: 6, targetBetween: 4, targetFinal: 2 },
    { grade: 'ม.4-6', file: 'career-highschool.json', pages: [12], targetTotal: 11, targetBetween: 8, targetFinal: 3 }
  ];

  for (const cfg of configs) {
    let currentStandard = 'ง 1.1';
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

          const stdMatch = line.match(/มาตรฐาน\s*(ง\s*\d\.\d)/);
          if (stdMatch) {
            currentStandard = stdMatch[1].replace(/\s+/g, ' ');
            continue;
          }

          if (isBoilerplateLine(line)) {
            continue;
          }

          line = line.replace(/^[0-9]+\s+/, '');

          const codeMatch = line.match(/^(\*?\s*(?:ง(?:\s*\d(?:\.\d)?)?\s+)?(?:ม\.\s*[0-9]+(?:-[0-9]+)?\/[0-9]+|\d\.\d\s+ม\.\s*[0-9]+(?:-[0-9]+)?\/[0-9]+))/);

          if (codeMatch) {
            if (currentItem) {
              const fullText = currentItem.nameParts.join(' ').replace(/\s+/g, ' ').trim();
              if (!indicatorsMap.has(currentItem.code)) {
                indicatorsMap.set(currentItem.code, {
                  code: currentItem.code,
                  name: fullText,
                  type: currentItem.type,
                  subjectArea: 'การงานอาชีพ',
                  gradeLevel: cfg.grade,
                  strand: STRAND_MAP[currentItem.std] || 'การงานอาชีพ'
                });
              }
            }

            const rawCode = codeMatch[0];
            let normCode = normalizeCode(rawCode, currentStandard, cfg.grade);
            const stdMatchCode = normCode.match(/ง\s*\d\.\d/);
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
              subjectArea: 'การงานอาชีพ',
              gradeLevel: cfg.grade,
              strand: STRAND_MAP[currentItem.std] || 'การงานอาชีพ'
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

    console.log(`[Career ${cfg.grade}] Total: ${items.length}/${cfg.targetTotal} (Between: ${betweenItems.length}/${cfg.targetBetween}, Final: ${finalItems.length}/${cfg.targetFinal})`);
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

testCareerSecondary().catch(console.error);
