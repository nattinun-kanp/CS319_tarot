import mongoose from 'mongoose';
import { readFileSync } from 'fs';

// 1. ตั้งค่า Database (ถ้ามี User/Pass ให้ใส่ตรงนี้)
const MONGO_URI = 'mongodb://localhost:27017/tarot_db';

// 2. สร้างโครงสร้างข้อมูล (Schema)
const cardSchema = new mongoose.Schema({
  name_short: String, // เช่น ar00
  name: String,       // เช่น The Fool
  value: String,      // เช่น zero
  value_int: Number,  // เช่น 0
  meaning_up: String, // ความหมายไพ่ตั้ง
  meaning_rev: String,// ความหมายไพ่กลับหัว
  desc: String,       // คำบรรยาย
  type: String        // major หรือ minor
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    // เชื่อมต่อ MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // อ่านไฟล์ JSON
    const fileContent = readFileSync('./card_data.json', 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // เช็คโครงสร้าง JSON ว่าข้อมูลไพ่อยู่ตรงไหน
    // บางทีมันอาจจะหุ้มด้วย { "cards": [...] } หรือเป็น [...] เลย
    const cards = jsonData.cards || jsonData;

    if (!Array.isArray(cards)) {
        throw new Error("หาข้อมูลไพ่ไม่เจอ! ลองเช็คโครงสร้างไฟล์ JSON ดูอีกที");
    }

    // ล้างข้อมูลเก่าก่อน (เผื่อรันซ้ำ)
    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    // บันทึกข้อมูลใหม่
    await CardModel.insertMany(cards);
    console.log(`✨ Success! Seeded ${cards.length} cards.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();