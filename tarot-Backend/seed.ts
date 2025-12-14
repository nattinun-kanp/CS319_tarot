import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'node:fs';

const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// ✅ 1. เพิ่ม Schema ให้ครบทุกฟิลด์ (รวม meaning_rev_th)
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,
  name_th: String,
  value: String,
  value_int: Number,
  meaning_up: String,
  meaning_up_th: String,
  meaning_rev: String,
  meaning_rev_th: String, // เพิ่ม
  desc: String,
  desc_th: String,
  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // อ่านไฟล์
    const enData = JSON.parse(readFileSync('./card_data.json', 'utf-8'));
    const enCards = enData.cards || enData;

    let thCards: any[] = [];
    if (existsSync('./card_data_th.json')) {
        const thFile = readFileSync('./card_data_th.json', 'utf-8');
        const thData = JSON.parse(thFile);
        thCards = thData.cards || thData;
        console.log(`🇹🇭 พบไฟล์ภาษาไทย: ${thCards.length} ใบ`);
    }

    // ✅ 2. ปรับการรวมข้อมูล (Merge) ให้รองรับชื่อ key แบบเดิม
    const mergedCards = enCards.map((card: any) => {
        // หาไพ่ภาษาไทยที่ชื่อย่อ (name_short) ตรงกัน
        const thai = thCards.find((t: any) => t.name_short === card.name_short);
        
        return {
            ...card, // ข้อมูลภาษาอังกฤษเป็นหลัก
            
            // ถ้าในไฟล์ไทยมี key "name_th" ให้ใช้ ถ้าไม่มีให้ลองหา "name" (แบบเดิม)
            name_th: thai?.name_th || thai?.name || card.name,
            
            // ความหมายแนวตั้ง
            meaning_up_th: thai?.meaning_up_th || thai?.meaning_up || "รอการแปล...",
            
            // ความหมายกลับหัว
            meaning_rev_th: thai?.meaning_rev_th || thai?.meaning_rev || "",
            
            // คำบรรยาย
            desc_th: thai?.desc_th || thai?.desc || ""
        };
    });

    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    await CardModel.insertMany(mergedCards);
    console.log(`✨ Success! Seeded ${mergedCards.length} cards with Thai data.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();