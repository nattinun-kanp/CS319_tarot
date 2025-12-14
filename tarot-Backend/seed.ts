import mongoose from 'mongoose';
import { readFileSync } from 'node:fs'; 

const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 1. อัปเดต Schema ให้รองรับภาษาไทย
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,       // ชื่ออังกฤษ
  name_th: String,    // ชื่อไทย (เพิ่ม)
  value: String,
  value_int: Number,
  meaning_up: String,    // ความหมายอังกฤษ
  meaning_up_th: String, // ความหมายไทย (เพิ่ม)
  meaning_rev: String,
  desc: String,
  desc_th: String,       // คำบรรยายไทย (เพิ่ม)
  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 2. อ่านไฟล์ทั้ง 2 ภาษา
    const enData = JSON.parse(readFileSync('./card_data.json', 'utf-8'));
    const thData = JSON.parse(readFileSync('./card_data_th.json', 'utf-8')); // ไฟล์ไทย

    const enCards = enData.cards || enData;
    const thCards = thData.cards || thData;

    // 3. รวมร่างข้อมูล (Merge) โดยใช้ name_short เป็นตัวเชื่อม
    const mergedCards = enCards.map((card: any) => {
        // หาข้อมูลไทยที่ตรงกัน
        const thaiCard = thCards.find((t: any) => t.name_short === card.name_short);
        
        return {
            ...card, // เอาข้อมูลอังกฤษตั้งต้น
            name_th: thaiCard?.name_th || card.name, // ถ้าไม่มีไทย ให้ใช้อังกฤษแทน
            meaning_up_th: thaiCard?.meaning_up_th || "ยังไม่มีข้อมูลภาษาไทย",
            desc_th: thaiCard?.desc_th || ""
        };
    });

    // 4. ล้างของเก่าและบันทึกใหม่
    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    await CardModel.insertMany(mergedCards);
    console.log(`✨ Success! Seeded ${mergedCards.length} cards with Dual Language support.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();