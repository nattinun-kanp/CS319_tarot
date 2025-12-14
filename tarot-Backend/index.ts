import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import mongoose from 'mongoose';

// 1. เชื่อมต่อ Database (ใช้ .then เพื่อความชัวร์)
const MONGO_URI = 'mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot';

mongoose.connect(MONGO_URI)
  .then(() => console.log('🔮 Oracle Engine connected to Database...'))
  .catch((err) => console.error('❌ DB Connection Error:', err));

// 2. สร้าง Schema (ต้องมี _th ให้ครบ!)
const cardSchema = new mongoose.Schema({
  name_short: String,
  name: String,
  name_th: String,       // ✅ เพิ่ม
  value: String,
  value_int: Number,
  meaning_up: String,
  meaning_up_th: String, // ✅ เพิ่ม
  meaning_rev: String,
  desc: String,
  desc_th: String,       // ✅ เพิ่ม
  type: String
});

// ตรวจสอบว่า Model ซ้ำหรือไม่
const CardModel = mongoose.models.Card || mongoose.model('Card', cardSchema);

// 3. สร้าง Server
const app = new Elysia()
  .use(cors())
  .get('/', () => '🦊 Oracle is ready...')
  .get('/draw', async ({ query }) => {
    try {
        const count = Number(query.n) || 3;
        
        // สุ่มไพ่
        const cards = await CardModel.aggregate([
            { $sample: { size: count } }
        ]);

        return {
            success: true,
            reading: cards, // ส่งชื่อ reading (สำคัญ!)
            timestamp: new Date()
        };
    } catch (err) {
        return { success: false, error: String(err) };
    }
  })
  .listen(3001);

console.log(`🦊 Oracle is running at http://${app.server?.hostname}:${app.server?.port}`);