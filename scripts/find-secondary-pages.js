const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const pdfs = [
  { name: 'thai', file: 'bf76c9c33c7b1b15.pdf' },
  { name: 'math', file: 'bbc16cd431d56526.pdf' },
  { name: 'science', file: 'a6ccd2fb1d565064.pdf' },
  { name: 'health', file: '65bb817023901652.pdf' },
  { name: 'arts', file: 'a4e57e09824e10e4.pdf' },
  { name: 'career', file: '7ebbd0baa58c3ddb.pdf' },
  { name: 'english', file: '4f16994ffe8153f4.pdf' }
];

const basePath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage';

async function main() {
  for (const item of pdfs) {
    const fullPath = path.join(basePath, item.file);
    const parser = new PDFParse({ data: fs.readFileSync(fullPath) });
    await parser.load();
    console.log(`\n=== Subject: ${item.name} (${item.file}) Total Pages: ${parser.doc.numPages} ===`);
    for (let p = 1; p <= parser.doc.numPages; p++) {
      const page = await parser.doc.getPage(p);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(i => i.str).join(' ');
      const match = text.match(/(ชั้นมัธยมศึกษาปีที่\s*[๑-๖1-6]|ชั้นมัธยมศึกษาปีที่\s*[๔4]\s*-\s*[๖6]|ม\.[๑-๖1-6]|ม\.[๔4]-[๖6])/);
      if (match) {
        console.log(`  Page ${p}: matched [${match[0]}]`);
      }
    }
  }
}

main().catch(console.error);
