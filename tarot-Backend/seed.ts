import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'node:fs';

const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 1. อัปเดต Schema ให้มีช่องเก็บข้อมูลเฉพาะด้าน
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,
  name_th: String,
  value: String,
  value_int: Number,
  meaning_up: String,
  meaning_up_th: String,
  meaning_rev: String,
  meaning_rev_th: String,
  desc: String,
  desc_th: String,
  
  // ✅ เพิ่มฟิลด์ใหม่สำหรับ 3 ด้าน
  meaning_love: String,    // ความรัก
  meaning_finance: String, // การเงิน
  meaning_luck: String,    // โชคลาภ

  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // 2. อ่านไฟล์ข้อมูลทั้งหมด
    const enData = JSON.parse(readFileSync('./card_data.json', 'utf-8')); // ข้อมูลหลัก
    
    // ฟังก์ชันช่วยอ่านไฟล์แบบปลอดภัย (ถ้าไม่มีไฟล์ให้คืนค่าว่าง)
    const loadJson = (path: string) => existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')).cards : [];

    const thCards = loadJson('./card_data_th.json');
    const loveCards = loadJson('./card_love_th.json');
    const moneyCards = loadJson('./card_money_th.json');
    const luckCards = loadJson('./card_luck_th.json');

    console.log(`📦 Loaded: TH=${thCards.length}, Love=${loveCards.length}, Money=${moneyCards.length}, Luck=${luckCards.length}`);

    // 3. รวมร่างข้อมูล (Merge)
    const enCards = enData.cards || enData;
    const mergedCards = enCards.map((card: any) => {
        const short = card.name_short;

        // ค้นหาข้อมูลจากแต่ละไฟล์โดยใช้ name_short
        const thai = thCards.find((t: any) => t.name_short === short);
        const love = loveCards.find((t: any) => t.name_short === short);
        const money = moneyCards.find((t: any) => t.name_short === short);
        const luck = luckCards.find((t: any) => t.name_short === short);
        
        return {
            ...card, 
            name_th: thai?.name_th || thai?.name || card.name,
            meaning_up_th: thai?.meaning_up_th || thai?.meaning_up || "",
            meaning_rev_th: thai?.meaning_rev_th || thai?.meaning_rev || "",
            desc_th: thai?.desc_th || thai?.desc || "",

            // ✅ ใส่ข้อมูล 3 ด้าน (ถ้าหาไม่เจอให้ใส่ข้อความ default)
            meaning_love: love?.meaning_love || "ไม่มีข้อมูลความรัก",
            meaning_finance: money?.meaning_finance || "ไม่มีข้อมูลการเงิน",
            meaning_luck: luck?.meaning_luck || "ไม่มีข้อมูลโชคลาภ"
        };
    });

    await CardModel.deleteMany({});
    console.log('🧹 Cleared old data.');

    await CardModel.insertMany(mergedCards);
    console.log(`✨ Success! Seeded ${mergedCards.length} cards with ALL meanings.`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected.');
  }
};

seed();