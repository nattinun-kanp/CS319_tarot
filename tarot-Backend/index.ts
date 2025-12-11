import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import mongoose from 'mongoose';

// 1. ตั้งค่า Database
const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

// 2. สร้าง Model เตรียมไว้
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

// 3. สร้างแอป Elysia
const app = new Elysia()
  .use(cors())
  .get('/', () => ({ status: 'The Oracle is Alive! 🔮' }))
  .get('/draw', async ({ query }) => {
    const count = Number(query.n) || 1;
    const cards = await CardModel.aggregate([
      { $sample: { size: count } }
    ]);
    return {
      success: true,
      data: cards,
      timestamp: new Date()
    };
  });

// --- จุดที่แก้ไข: สร้างฟังก์ชัน start มาครอบการทำงาน ---
const startServer = async () => {
  try {
    // เชื่อมต่อ Database ก่อน
    await mongoose.connect(MONGO_URI);
    console.log('🔮 Oracle Engine connected to Database...');

    // ถ้าต่อติดแล้ว ค่อยสั่งรัน Server
    app.listen(3001);
    console.log(`🦊 Oracle is running at ${app.server?.hostname}:${app.server?.port}`);
    
  } catch (error) {
    console.error('❌ Connection Failed:', error);
  }
};

// สั่งรันฟังก์ชัน
startServer();