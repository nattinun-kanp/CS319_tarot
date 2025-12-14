const fs = require('fs');
const path = require('path');

// --- ตั้งค่า Path ---
const KAGGLE_JSON_PATH = './tarot-images.json';
const MY_DB_PATH = './card_data.json';
const SOURCE_IMG_DIR = './cards';
const TARGET_IMG_DIR = '../tarot-frontend/public/cards';

// 1. อ่านข้อมูลไฟล์ JSON ทั้งสอง
const kaggleData = JSON.parse(fs.readFileSync(KAGGLE_JSON_PATH, 'utf-8'));
const myData = JSON.parse(fs.readFileSync(MY_DB_PATH, 'utf-8'));

// สร้าง Folder ปลายทางถ้ายังไม่มี
if (!fs.existsSync(TARGET_IMG_DIR)){
    fs.mkdirSync(TARGET_IMG_DIR, { recursive: true });
}

console.log("🚀 Starting Image Import...");

// --- ส่วนที่เพิ่ม: คู่มือแปลชื่อไพ่ ---
const nameMapping = {
  "Fortitude": "Strength",
  "Wheel Of Fortune": "Wheel of Fortune",
  "The Last Judgment": "Judgement"
};
// --------------------------------

let matchCount = 0;

// 2. วนลูปดูไพ่ทุกใบใน Database ของเรา
myData.cards.forEach(myCard => {
    // เช็คว่าต้องแปลชื่อไหม? ถ้าไม่มีในคู่มือให้ใช้ชื่อเดิม
    const searchName = nameMapping[myCard.name] || myCard.name;

    // หาไพ่คู่แฝดใน Kaggle
    const kaggleCard = kaggleData.cards.find(k => k.name === searchName);

    if (kaggleCard) {
        const srcFile = path.join(SOURCE_IMG_DIR, kaggleCard.img);
        const destFile = path.join(TARGET_IMG_DIR, `${myCard.name_short}.jpg`);

        // 3. ก๊อปปี้และเปลี่ยนชื่อไฟล์
        if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, destFile);
            console.log(`✅ [OK] ${myCard.name} -> ${myCard.name_short}.jpg`);
            matchCount++;
        } else {
            console.error(`❌ [Missing File] รูปหาย: ${srcFile}`);
        }
    } else {
        console.warn(`⚠️ [Not Found] ยังหาไม่เจอ: ${myCard.name} (ลองค้นหาด้วยคำว่า '${searchName}')`);
    }
});

console.log(`\n🎉 เสร็จสิ้น! นำเข้ารูปภาพได้ ${matchCount} / ${myData.cards.length} ใบ`);