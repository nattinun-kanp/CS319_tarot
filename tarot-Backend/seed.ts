import mongoose from 'mongoose';
import { readFileSync, existsSync } from 'node:fs';

const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// --- เพิ่มฟิลด์ _th  ---
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,
  name_th: String,       
  value: String,
  value_int: Number,
  meaning_up: String,
  meaning_up_th: String, 
  meaning_rev: String,
  desc: String,
  desc_th: String,      
  type: String
});

const CardModel = mongoose.model('Card', cardSchema);

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Connected to MongoDB...');

    // อ่านไฟล์ทั้ง 2 ภาษา
    const enFile = readFileSync('./card_data.json', 'utf-8');
    const enData = JSON.parse(enFile);
    const enCards = enData.cards || enData;

    let thCards = [];
    if (existsSync('./card_data_th.json')) {
        const thFile = readFileSync('./card_data_th.json', 'utf-8');
        const thData = JSON.parse(thFile);
        thCards = thData.cards || thData;
        console.log(`🇹🇭 พบไฟล์ภาษาไทย: ${thCards.length} ใบ`);
    }

    // รวมร่างข้อมูล
    const mergedCards = enCards.map((card: any) => {
        const thaiCard = thCards.find((t: any) => t.name_short === card.name_short);
        return {
            ...card,
            name_th: thaiCard?.name_th || card.name,
            meaning_up_th: thaiCard?.meaning_up_th || "รอการแปล...",
            desc_th: thaiCard?.desc_th || ""
        };
    });

    // ลบของเก่าแล้วใส่ใหม่
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