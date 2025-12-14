import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'node:fs';

// 1. ตั้งค่า Database
const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 2. สร้าง Schema (เพิ่มช่องเก็บภาษาไทย)
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,       // อังกฤษ
  name_th: String,    // ไทย (เพิ่ม)
  value: String,
  value_int: Number,
  meaning_up: String,    // อังกฤษ
  meaning_up_th: String, // ไทย (เพิ่ม)
  meaning_rev: String,
  desc: String,
  desc_th: String,       // ไทย (เพิ่ม)
  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 3. อ่านไฟล์ JSON
    const enFile = readFileSync('./card_data.json', 'utf-8');
    const enData = JSON.parse(enFile);
    const enCards = enData.cards || enData;

    // เช็คว่ามีไฟล์ไทยไหม?
    let thCards = [];
    if (existsSync('./card_data_th.json')) {
        const thFile = readFileSync('./card_data_th.json', 'utf-8');
        const thData = JSON.parse(thFile);
        thCards = thData.cards || thData;
        console.log(`🇹🇭 พบไฟล์ภาษาไทย: มีข้อมูล ${thCards.length} ใบ`);
    } else {
        console.log('⚠️ ไม่พบไฟล์ card_data_th.json (จะใช้ภาษาอังกฤษแทนชั่วคราว)');
    }

    // 4. รวมร่างข้อมูล (Merge)
    const mergedCards = enCards.map((card: any) => {
        // หาคู่ภาษาไทยโดยใช้ชื่อย่อ (name_short) เป็นตัวเชื่อม
        const thaiCard = thCards.find((t: any) => t.name_short === card.name_short);
        
        return {
            ...card, // เอาข้อมูลอังกฤษตั้งต้น
            // ถ้ามีไทยให้ใช้ไทย ถ้าไม่มีให้ใส่อังกฤษหรือข้อความแจ้งเตือน
            name_th: thaiCard?.name_th || card.name, 
            meaning_up_th: thaiCard?.meaning_up_th || "รอการแปลภาษาไทย...",
            desc_th: thaiCard?.desc_th || ""
        };
    });

    // 5. ล้างของเก่าและบันทึกใหม่
    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    await CardModel.insertMany(mergedCards);
    console.log(`✨ Success! Seeded ${mergedCards.length} cards into Database.`);

  } catch (error) {
    console.error('❌ Error Details:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();