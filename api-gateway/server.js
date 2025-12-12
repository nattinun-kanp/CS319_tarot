const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000; // Express จะรันที่ Port 3000 (React จะยิงมาที่นี่)
const ORACLE_URL = 'http://localhost:3001'; // ที่อยู่ของแม่หมอ Elysia

app.use(cors()); // อนุญาตให้ React (คนละ Port) เรียกใช้งานได้
app.use(express.json());

// 1. Route: สำหรับหน้าดูดวง (สุ่มไพ่)
app.get('/api/tarot-reading', async (req, res) => {
    try {
        const num = req.query.n || 3; // ถ้าไม่บอก เอา 3 ใบ
        
        // Express เดินไปขอไพ่จาก Elysia
        const response = await axios.get(`${ORACLE_URL}/draw?n=${num}`);
        const cards = response.data.data;

        // ตรงนี้เราสามารถ "ปรุงแต่ง" ข้อมูลเพิ่มได้ก่อนส่งให้ React
        // เช่น ใส่คำทำนายเพิ่ม หรือจัด format ใหม่
        
        console.log(`✅ Served ${cards.length} cards to client.`);
        
        res.json({
            service: "Gateway",
            timestamp: new Date(),
            reading: cards
        });

    } catch (error) {
        console.error("❌ Error contacting Oracle:", error.message);
        res.status(500).json({ error: "แม่หมอหลังบ้านป่วย (Connection Failed)" });
    }
});

// 2. Route: เช็คสถานะ
app.get('/', (req, res) => {
    res.send('API Gateway is running on Port 3000 🛡️');
});

app.listen(PORT, () => {
    console.log(`🛡️  Gateway Server listening on port ${PORT}`);
});