const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;
const ORACLE_URL = 'http://localhost:3001';

app.use(cors());
app.use(express.json());

app.get('/api/tarot-reading', async (req, res) => {
    try {
        const num = req.query.n || 3;
        
        // ยิงไปหา Backend
        const response = await axios.get(`${ORACLE_URL}/draw?n=${num}`);
        
        // ✅ จุดที่แก้: เปลี่ยน .data เป็น .reading ให้ตรงกับ Backend
        const cards = response.data.reading; 

        // เช็คเผื่อ Backend ส่งกลับมาผิดพลาด
        if (!cards) {
            throw new Error("Backend did not return any cards (reading is undefined)");
        }

        console.log(`✅ Served ${cards.length} cards to client.`);
        
        // ส่งต่อให้ Frontend
        res.json({
            service: "Gateway",
            timestamp: new Date(),
            reading: cards // Frontend ก็รอรับชื่อ reading เหมือนกัน
        });

    } catch (error) {
        console.error("❌ Gateway Error:", error.message);
        // ดู Error จริงๆ จาก Backend ถ้ามี
        if (error.response) {
            console.error("   Backend response:", error.response.data);
        }
        res.status(500).json({ error: "Connection Failed" });
    }
});

app.get('/', (req, res) => res.send('Gateway Running...'));

app.listen(PORT, () => {
    console.log(`🛡️  Gateway Server listening on port ${PORT}`);
});