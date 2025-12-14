import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import mongoose from 'mongoose';

// 1. เชื่อมต่อ DB
mongoose.connect('mongodb+srv://tarotDB:nattinun551776@tarot.jpvsyia.mongodb.net/?appName=tarot')
  .then(() => console.log('🔮 Oracle Engine connected...'))
  .catch(err => console.error('❌ DB Error:', err));

// 2. อัปเดต Schema ให้ตรงกับ seed.ts (เพิ่ม meaning_rev_th)
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

const CardModel = mongoose.models.Card || mongoose.model('Card', cardSchema);

const app = new Elysia()
  .use(cors())
  .get('/draw', async ({ query }) => {
    try {
        const count = Number(query.n) || 3;
        const cards = await CardModel.aggregate([{ $sample: { size: count } }]);
        
        // ส่งข้อมูลออกไป
        return { success: true, reading: cards, timestamp: new Date() }; 
    } catch (error) {
        return { success: false, error: String(error) };
    }
  })
  .listen(3001);

console.log(`🦊 Oracle running at http://localhost:3001`);