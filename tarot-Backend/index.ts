import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import mongoose from 'mongoose';

const PORT = 3001;
const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 1. สร้าง Schema
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
  meaning_love: String,
  meaning_finance: String,
  meaning_luck: String,
  type: String
});

const CardModel = mongoose.models.Card || mongoose.model('Card', cardSchema);

// 2. สร้างฟังก์ชันเริ่มระบบ
const startServer = async () => {
  try {
    // ต่อ Database ให้เสร็จก่อน
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected!');

    // สร้าง Server หลังจากต่อ DB ติดแล้ว
    const app = new Elysia()
      .use(cors())
      .get('/', () => '🦊 Oracle is ready...')
      .get('/draw', async ({ query }) => {
        try {
            const count = Number(query.n) || 3;
            
            // เช็คว่ามีของใน DB จริงไหม
            const total = await CardModel.countDocuments();
            if (total === 0) {
                throw new Error("Database is empty! Run seed.ts first.");
            }

            // สุ่มไพ่
            const cards = await CardModel.aggregate([
                { $sample: { size: count } }
            ]);

            console.log(`🃏 Drew ${cards.length} cards`);
            return { success: true, reading: cards, timestamp: new Date() }; 
        } catch (error) {
            console.error("❌ Drawing Error:", error);
            return { success: false, error: String(error) };
        }
      })
      .listen(PORT);

    console.log(`🦊 Oracle Engine is running at http://localhost:${PORT}`);

  } catch (err) {
    console.error('💥 Fatal Error: Cannot start server', err);
    process.exit(1);
  }
};

// เริ่มรัน
startServer();