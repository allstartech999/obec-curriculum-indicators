const fs = require('fs');
const path = require('path');

const OFFICIAL_STANDARDS = {
  thai: {
    name: 'ภาษาไทย',
    grades: {
      'p1': { total: 22, between: 13, final: 9 },
      'p2': { total: 27, between: 18, final: 9 },
      'p3': { total: 31, between: 23, final: 8 },
      'p4': { total: 33, between: 26, final: 7 },
      'p5': { total: 33, between: 24, final: 9 },
      'p6': { total: 34, between: 22, final: 12 },
      'm1': { total: 35, between: 24, final: 11 },
      'm2': { total: 32, between: 22, final: 10 },
      'm3': { total: 36, between: 26, final: 10 },
      'highschool': { total: 36, between: 23, final: 13 }
    }
  },
  math: {
    name: 'คณิตศาสตร์',
    grades: {
      'p1': { total: 10, between: 3, final: 7 },
      'p2': { total: 16, between: 8, final: 8 },
      'p3': { total: 28, between: 15, final: 13 },
      'p4': { total: 22, between: 12, final: 10 },
      'p5': { total: 19, between: 9, final: 10 },
      'p6': { total: 21, between: 8, final: 13 },
      'm1': { total: 9, between: 1, final: 8 },
      'm2': { total: 12, between: 2, final: 10 },
      'm3': { total: 12, between: 0, final: 12 },
      'highschool': { total: 8, between: 2, final: 6 }
    }
  },
  science: {
    name: 'วิทยาศาสตร์และเทคโนโลยี',
    grades: {
      'p1': { total: 15, between: 6, final: 9 },
      'p2': { total: 16, between: 8, final: 8 },
      'p3': { total: 25, between: 12, final: 13 },
      'p4': { total: 21, between: 9, final: 12 },
      'p5': { total: 32, between: 19, final: 13 },
      'p6': { total: 30, between: 12, final: 18 },
      'm1': { total: 52, between: 30, final: 22 },
      'm2': { total: 63, between: 36, final: 27 },
      'm3': { total: 59, between: 40, final: 19 },
      'highschool': { total: 102, between: 60, final: 42 }
    }
  },
  social: {
    name: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
    grades: {
      'p1': { total: 31, between: 22, final: 9 },
      'p2': { total: 34, between: 22, final: 12 },
      'p3': { total: 39, between: 30, final: 9 },
      'p4': { total: 38, between: 26, final: 12 },
      'p5': { total: 36, between: 22, final: 14 },
      'p6': { total: 39, between: 24, final: 15 },
      'm1': { total: 45, between: 27, final: 18 },
      'm2': { total: 45, between: 30, final: 15 },
      'm3': { total: 50, between: 33, final: 17 },
      'highschool': { total: 61, between: 42, final: 19 }
    }
  },
  health: {
    name: 'สุขศึกษาและพลศึกษา',
    grades: {
      'p1': { total: 15, between: 10, final: 5 },
      'p2': { total: 21, between: 15, final: 6 },
      'p3': { total: 18, between: 11, final: 7 },
      'p4': { total: 19, between: 13, final: 6 },
      'p5': { total: 25, between: 15, final: 10 },
      'p6': { total: 22, between: 13, final: 9 },
      'm1': { total: 23, between: 15, final: 8 },
      'm2': { total: 25, between: 18, final: 7 },
      'm3': { total: 24, between: 15, final: 9 },
      'highschool': { total: 29, between: 16, final: 13 }
    }
  },
  arts: {
    name: 'ศิลปะ',
    grades: {
      'p1': { total: 18, between: 11, final: 7 },
      'p2': { total: 25, between: 16, final: 9 },
      'p3': { total: 29, between: 21, final: 8 },
      'p4': { total: 29, between: 18, final: 11 },
      'p5': { total: 26, between: 16, final: 10 },
      'p6': { total: 27, between: 16, final: 11 },
      'm1': { total: 27, between: 19, final: 8 },
      'm2': { total: 27, between: 17, final: 10 },
      'm3': { total: 32, between: 22, final: 10 },
      'highschool': { total: 39, between: 26, final: 13 }
    }
  },
  career: {
    name: 'การงานอาชีพ',
    grades: {
      'p1': { total: 3, between: 2, final: 1 },
      'p2': { total: 3, between: 2, final: 1 },
      'p3': { total: 3, between: 2, final: 1 },
      'p4': { total: 5, between: 2, final: 3 },
      'p5': { total: 6, between: 3, final: 3 },
      'p6': { total: 5, between: 3, final: 2 },
      'm1': { total: 6, between: 3, final: 3 },
      'm2': { total: 6, between: 2, final: 4 },
      'm3': { total: 6, between: 4, final: 2 },
      'highschool': { total: 11, between: 8, final: 3 }
    }
  },
  english: {
    name: 'ภาษาต่างประเทศ',
    grades: {
      'p1': { total: 16, between: 10, final: 6 },
      'p2': { total: 16, between: 10, final: 6 },
      'p3': { total: 18, between: 12, final: 6 },
      'p4': { total: 20, between: 14, final: 6 },
      'p5': { total: 20, between: 14, final: 6 },
      'p6': { total: 20, between: 14, final: 6 },
      'm1': { total: 20, between: 16, final: 4 },
      'm2': { total: 21, between: 17, final: 4 },
      'm3': { total: 21, between: 17, final: 4 },
      'highschool': { total: 21, between: 16, final: 5 }
    }
  }
};

const dataDir = path.join(__dirname, '..', 'data');
let totalMatches = 0;
let totalMismatches = 0;
const mismatches = [];

for (const [subjKey, subjVal] of Object.entries(OFFICIAL_STANDARDS)) {
  for (const [gradeKey, target] of Object.entries(subjVal.grades)) {
    const filename = `${subjKey}-${gradeKey}.json`;
    const filePath = path.join(dataDir, filename);

    if (!fs.existsSync(filePath)) {
      mismatches.push({ file: filename, reason: 'FILE_NOT_FOUND', target });
      totalMismatches++;
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const actualTotal = data.length;
    const actualBetween = data.filter(d => d.type === 'BETWEEN').length;
    const actualFinal = data.filter(d => d.type === 'FINAL').length;

    const isMatch = actualTotal === target.total &&
                    actualBetween === target.between &&
                    actualFinal === target.final;

    if (isMatch) {
      totalMatches++;
    } else {
      totalMismatches++;
      mismatches.push({
        file: filename,
        reason: 'COUNT_MISMATCH',
        actual: { total: actualTotal, between: actualBetween, final: actualFinal },
        target
      });
    }
  }
}

console.log(`\n======================================================`);
console.log(`AUDIT RESULTS vs OFFICIAL ว 1553 STANDARDS`);
console.log(`======================================================`);
console.log(`Total Files Checked: ${totalMatches + totalMismatches}`);
console.log(`Passed (100% Match): ${totalMatches}`);
console.log(`Failed (Mismatches):  ${totalMismatches}`);
console.log(`======================================================\n`);

if (mismatches.length > 0) {
  console.log('DISCREPANCIES FOUND:');
  mismatches.forEach(m => {
    console.log(`- ${m.file}:`);
    console.log(`    Actual: Total=${m.actual.total}, Between=${m.actual.between}, Final=${m.actual.final}`);
    console.log(`    Target: Total=${m.target.total}, Between=${m.target.between}, Final=${m.target.final}`);
  });
}
