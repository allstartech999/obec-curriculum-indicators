const fs = require('fs');
const path = require('path');

// 1. UPDATE THAI M1 (35 items)
const thaiM1Existing = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/thai-m1.json'), 'utf8'));
const thaiM1ExistingCodes = new Set(thaiM1Existing.map(d => d.code));

const thaiM1Additions = [
  {
    code: "ท 3.1 ม.1/4",
    name: "ประเมินความน่าเชื่อถือของสื่อที่มีเนื้อหาโน้มน้าวใจ",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.1/5",
    name: "พูดรายงานเรื่องหรือประเด็นที่ศึกษาค้นคว้าจากการฟัง การดู และการสนทนา",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.1/6",
    name: "มีมารยาทในการฟัง การดู และการพูด",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 4.1 ม.1/4",
    name: "วิเคราะห์ความแตกต่างของภาษาพูดและภาษาเขียน",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.1/5",
    name: "แต่งบทร้อยกรอง",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.1/6",
    name: "จำแนกและใช้สำนวนที่เป็นคำพังเพยและสุภาษิต",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.1",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  }
];

const newThaiM1 = [...thaiM1Existing];
for (const item of thaiM1Additions) {
  if (!thaiM1ExistingCodes.has(item.code)) {
    newThaiM1.push(item);
  }
}
newThaiM1.sort((a, b) => a.code.localeCompare(b.code, 'th'));
fs.writeFileSync(path.join(__dirname, '../data/thai-m1.json'), JSON.stringify(newThaiM1, null, 2), 'utf8');
console.log('thai-m1.json count:', newThaiM1.length);

// 2. UPDATE THAI HIGHSCHOOL (36 items: 23 between, 13 final)
const thaiHighschool = [
  // ท 1.1 (9 items)
  {
    code: "ท 1.1 ม.4-6/1",
    name: "อ่านออกเสียงบทร้อยแก้วและบทร้อยกรองได้อย่างถูกต้อง ไพเราะ และเหมาะสมกับเรื่องที่อ่าน",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/2",
    name: "ตีความ แปลความ และขยายความเรื่องที่อ่าน",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/3",
    name: "วิเคราะห์และวิจารณ์เรื่องที่อ่านในทุกๆ ด้านอย่างมีเหตุผล",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/4",
    name: "คาดคะเนเหตุการณ์จากเรื่องที่อ่าน และประเมินค่าเพื่อนำความรู้ความคิดไปใช้ตัดสินใจ แก้ปัญหาในการดำเนินชีวิต",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/5",
    name: "วิเคราะห์ วิจารณ์ แสดงความคิดเห็นโต้แย้งกับเรื่องที่อ่าน และเสนอความคิดใหม่อย่างมีเหตุผล",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/6",
    name: "ตอบคำถามจากการอ่านประเภทต่าง ๆ ภายในเวลาที่กำหนด",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/7",
    name: "อ่านเรื่องต่าง ๆ แล้วเขียนกรอบแนวคิด ผังความคิด บันทึก ย่อความ และรายงาน",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/8",
    name: "สังเคราะห์ความรู้จากการอ่านสื่อสิ่งพิมพ์ สื่ออิเล็กทรอนิกส์ และแหล่งเรียนรู้ต่าง ๆ มาพัฒนาตน พัฒนาการเรียน และพัฒนาความรู้ทางอาชีพ",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },
  {
    code: "ท 1.1 ม.4-6/9",
    name: "มีมารยาทในการอ่าน",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 1 การอ่าน"
  },

  // ท 2.1 (8 items)
  {
    code: "ท 2.1 ม.4-6/1",
    name: "เขียนสื่อสารในรูปแบบต่าง ๆ ได้ตรงตามวัตถุประสงค์ โดยใช้ภาษาเรียบเรียงถูกต้อง มีข้อมูล และสาระสำคัญชัดเจน",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/2",
    name: "เขียนเรียงความ",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/3",
    name: "เขียนย่อความจากสื่อที่มีรูปแบบและเนื้อหาหลากหลาย",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/4",
    name: "ผลิตงานเขียนของตนเองในรูปแบบต่าง ๆ",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/5",
    name: "ประเมินงานเขียนของผู้อื่น แล้วนำมาพัฒนางานเขียนของตนเอง",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/6",
    name: "เขียนรายงานการศึกษาค้นคว้าเรื่องที่สนใจตามหลักการเขียนเชิงวิชาการ และใช้ข้อมูลสารสนเทศอ้างอิงอย่างถูกต้อง",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/7",
    name: "บันทึกการศึกษาค้นคว้าเพื่อนำไปพัฒนาตนเองอย่างสม่ำเสมอ",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },
  {
    code: "ท 2.1 ม.4-6/8",
    name: "มีมารยาทในการเขียน",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 2 การเขียน"
  },

  // ท 3.1 (6 items)
  {
    code: "ท 3.1 ม.4-6/1",
    name: "สรุปแนวคิดและแสดงความคิดเห็นจากเรื่องที่ฟังและดู",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.4-6/2",
    name: "วิเคราะห์แนวคิด การใช้ภาษา และความน่าเชื่อถือจากเรื่องที่ฟังและดูอย่างมีเหตุผล",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.4-6/3",
    name: "ประเมินเรื่องที่ฟังและดู แล้วกำหนดแนวทางนำไปประยุกต์ใช้ในการดำเนินชีวิต",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.4-6/4",
    name: "มีวิจารณญาณในการเลือกเรื่องที่ฟังและดู",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.4-6/5",
    name: "พูดในโอกาสต่าง ๆ พูดแสดงทรรศนะ โต้แย้ง โน้มน้าวใจ และเสนอแนวคิดใหม่ด้วยภาษาที่ถูกต้องเหมาะสม",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },
  {
    code: "ท 3.1 ม.4-6/6",
    name: "มีมารยาทในการฟัง การดู และการพูด",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 3 การฟัง การดู และการพูด"
  },

  // ท 4.1 (7 items)
  {
    code: "ท 4.1 ม.4-6/1",
    name: "อธิบายธรรมชาติของภาษา พลังของภาษา และลักษณะของภาษา",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/2",
    name: "ใช้คำและกลุ่มคำสร้างประโยคตรงตามวัตถุประสงค์",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/3",
    name: "ใช้ภาษาเหมาะสมแก่โอกาส กาลเทศะ และบุคคล รวมทั้งคำราชาศัพท์อย่างเหมาะสม",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/4",
    name: "แต่งบทร้อยกรอง",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/5",
    name: "วิเคราะห์อิทธิพลของภาษาต่างประเทศและภาษาถิ่น",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/6",
    name: "อธิบายและวิเคราะห์หลักการสร้างคำในภาษาไทย",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },
  {
    code: "ท 4.1 ม.4-6/7",
    name: "วิเคราะห์และประเมินการใช้ภาษาจากสื่อสิ่งพิมพ์และสื่ออิเล็กทรอนิกส์",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 4 หลักการใช้ภาษาไทย"
  },

  // ท 5.1 (6 items)
  {
    code: "ท 5.1 ม.4-6/1",
    name: "วิเคราะห์และวิจารณ์วรรณคดีและวรรณกรรมตามหลักการวิจารณ์เบื้องต้น",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  },
  {
    code: "ท 5.1 ม.4-6/2",
    name: "วิเคราะห์ลักษณะเด่นของวรรณคดีเชื่อมโยงกับการเรียนรู้ทางประวัติศาสตร์และวิถีชีวิตของสังคมในอดีต",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  },
  {
    code: "ท 5.1 ม.4-6/3",
    name: "วิเคราะห์และประเมินคุณค่าด้านวรรณศิลป์ของวรรณคดีและวรรณกรรมในฐานะที่เป็นมรดกทางวัฒนธรรมของชาติ",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  },
  {
    code: "ท 5.1 ม.4-6/4",
    name: "สังเคราะห์ข้อคิดจากวรรณคดีและวรรณกรรมเพื่อนำไปประยุกต์ใช้ในชีวิตจริง",
    type: "FINAL",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  },
  {
    code: "ท 5.1 ม.4-6/5",
    name: "รวบรวมวรรณกรรมพื้นบ้านและอธิบายภูมิปัญญาทางภาษา",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  },
  {
    code: "ท 5.1 ม.4-6/6",
    name: "ท่องจำและบอกคุณค่าบทอาขยานตามที่กำหนดและบทร้อยกรองที่มีคุณค่าตามความสนใจและนำไปใช้อ้างอิง",
    type: "BETWEEN",
    subjectArea: "ภาษาไทย",
    gradeLevel: "ม.4-6",
    strand: "สาระที่ 5 วรรณคดีและวรรณกรรม"
  }
];

fs.writeFileSync(path.join(__dirname, '../data/thai-highschool.json'), JSON.stringify(thaiHighschool, null, 2), 'utf8');
console.log('thai-highschool.json count:', thaiHighschool.length);
