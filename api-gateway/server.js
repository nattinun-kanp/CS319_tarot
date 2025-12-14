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
        console.log(`🔄 Requesting ${num} cards from Oracle...`);

        // ยิงไปหา Backend (เพิ่ม timeout 10 วินาที)
        const response = await axios.get(`${ORACLE_URL}/draw?n=${num}`, {
            timeout: 10000 
        });
        
        const cards = response.data.reading;

        if (!cards || !Array.isArray(cards)) {
            console.error("❌ Invalid response from Backend:", response.data);
            throw new Error("Backend did not return a valid 'reading' array");
        }

        console.log(`✅ Received ${cards.length} cards. Sending to client.`);
        
        res.json({
            service: "Gateway",
            timestamp: new Date(),
            reading: cards 
        });

    } catch (error) {
        console.error("❌ Gateway Error:", error.message);
        if(error.code === 'ECONNREFUSED') {
            return res.status(503).json({ error: "Backend (Port 3001) is down." });
        }
        res.status(500).json({ error: "Connection Failed: " + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🛡️  Gateway Server listening on port ${PORT}`);
});