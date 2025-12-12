import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // ฟังก์ชันจั่วไพ่ (เรียก API Gateway)
  const handleDraw = async () => {
    setLoading(true);
    setCards([]); // เคลียร์ไพ่เก่า
    try {
      // เรียก Express ที่ Port 3000
      const res = await axios.get('http://localhost:3000/api/tarot-reading?n=3');
      
      // หน่วงเวลาเล็กน้อยเพื่อความขลัง (ให้เหมือนกำลังสับไพ่)
      setTimeout(() => {
        setCards(res.data.reading);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Connection Error:", error);
      alert("สัญญาณจักรวาลขัดข้อง (Backend Error)");
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '1200px', padding: '20px' }}>
      
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1>🔮 Tarot Oracle 🔮</h1>
        <p style={{ color: '#aaa', fontStyle: 'italic' }}>ตั้งจิตอธิษฐาน แล้วแตะที่ปุ่มด้านล่าง...</p>
      </motion.div>

      <div className="card-container">
        {/* Loading State: แสดงวงกลมหมุนๆ หรือข้อความ */}
        {loading && (
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: '1.5rem', color: '#d4af37' }}
          >
            ...ดวงดาวกำลังเรียงตัว...
          </motion.div>
        )}

        {/* Card Display Area */}
        {cards.map((card, index) => (
          <motion.div
            key={card._id || index}
            initial={{ opacity: 0, y: 50, rotateY: 90 }} // เริ่มแบบจางและพลิกอยู่
            animate={{ opacity: 1, y: 0, rotateY: 0 }}   // ค่อยๆ โผล่และพลิกหน้ามา
            transition={{ delay: index * 0.3, duration: 0.8 }} // เรียงกันโผล่ทีละใบ
            style={{
              background: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '20px',
              width: '220px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* ชื่อไพ่ */}
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#d4af37' }}>
              {card.name}
            </h3>
            
            {/* พื้นที่รูปภาพ (Placeholder) */}
            <div style={{ 
              width: '100%', 
              height: '250px', 
              background: '#2a2a2a', 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #444'
            }}>
              <span style={{ fontSize: '3rem' }}>🃏</span>
            </div>

            {/* ความหมายไพ่ */}
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#ddd' }}>
              {card.meaning_up}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div style={{ marginTop: '50px' }}>
        {!loading && (
          <button className="glow-btn" onClick={handleDraw}>
             เปิดไพ่ทำนายดวง 
          </button>
        )}
      </motion.div>

    </div>
  );
}

export default App;