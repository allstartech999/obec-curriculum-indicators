const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const pdfs = [
  { name: 'Thai', file: 'bf76c9c33c7b1b15.pdf' },
  { name: 'Math', file: 'bbc16cd431d56526.pdf' },
  { name: 'Science', file: 'a6ccd2fb1d565064.pdf' },
  { name: 'Social', file: '8434969eef2420f7.pdf' },
  { name: 'Health', file: '65bb817023901652.pdf' },
  { name: 'Arts', file: 'a4e57e09824e10e4.pdf' },
  { name: 'Career', file: '7ebbd0baa58c3ddb.pdf' },
  { name: 'English', file: '4f16994ffe8153f4.pdf' }
];

const basePath = 'C:\\Users\\m1022\\.gemini\\antigravity\\brain\\0b478ce6-9eee-42b3-a850-986436680a7e\\.tempmediaStorage';

async function main() {
  for (const item of pdfs) {
    const fullPath = path.join(basePath, item.file);
    const parser = new PDFParse({ data: fs.readFileSync(fullPath) });
    await parser.load();
    console.log(`=== ${item.name} (${item.file}) Total Pages: ${parser.doc.numPages} ===`);
    
    // Check page 1 and 2
    for (let p = 1; p <= Math.min(2, parser.doc.numPages); p++) {
      const page = await parser.doc.getPage(p);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(i => i.str).join(' ');
      console.log(`--- Page ${p} ---`);
      console.log(text.slice(0, 500));
    }
  }
}

main().catch(console.error);
