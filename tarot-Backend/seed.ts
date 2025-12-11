import mongoose from 'mongoose';
import { readFileSync } from 'node:fs'; 
// 1. ตั้งค่า Database
const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 2. สร้าง Schema
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,
  value: String,
  value_int: Number,
  meaning_up: String,
  meaning_rev: String,
  desc: String,
  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 3. อ่านไฟล์ JSON (ใช้ท่ามาตรฐานที่ปลอดภัยที่สุด)
    // ตรวจสอบชื่อไฟล์ให้ตรงเป๊ะๆ กับที่มีในโฟลเดอร์
    const fileContent = readFileSync('./card_data.json', 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // เช็คว่าข้อมูลซ่อนอยู่ใน property ไหน
    const cards = jsonData.cards || jsonData;

    if (!Array.isArray(cards)) {
        throw new Error("❌ หาข้อมูลไพ่ไม่เจอ! รูปแบบ JSON อาจไม่ถูกต้อง");
    }

    // ล้างข้อมูลเก่า
    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    // บันทึกข้อมูลใหม่
    await CardModel.insertMany(cards);
    console.log(`✨ Success! Seeded ${cards.length} cards.`);

  } catch (error) {
    console.error('❌ Error Details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();