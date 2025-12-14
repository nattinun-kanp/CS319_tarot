import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('th'); // 'th' = ไทย, 'en' = อังกฤษ

  // ฟังก์ชันจั่วไพ่
  const handleDraw = async () => {
    setLoading(true);
    setCards([]); 
    try {
      // เรียก API Gateway
      const res = await axios.get('http://localhost:3000/api/tarot-reading?n=3');
      
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
      
      {/* --- ปุ่มเลือกภาษา (เปลี่ยนเป็น Fixed เพื่อให้ติดขอบจอขวาสุดเสมอ) --- */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          <div className="lang-switch-container">
              <button 
                  className={`lang-btn ${lang === 'th' ? 'active' : ''}`}
                  onClick={() => setLang('th')}
              >
                  🇹🇭 TH
              </button>
              <button 
                  className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                  onClick={() => setLang('en')}
              >
                  🇬🇧 EN
              </button>
          </div>
      </div>

      {/* --- ส่วนหัว (Header) --- */}
      <div style={{ marginBottom: '40px', marginTop: '40px' }}>
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
        >
            <h1>✨ {lang === 'th' ? 'ทำนายดวงชะตา' : 'THE MYSTIC ORACLE'} ✨</h1>
            <p style={{ color: '#aaa', fontStyle: 'italic' }}>
                {lang === 'th' ? 'ตั้งจิตอธิษฐาน แล้วแตะที่ปุ่มด้านล่าง...' : 'Focus your mind and touch the button below...'}
            </p>
        </motion.div>
      </div>

      {/* --- พื้นที่แสดงไพ่ --- */}
      <div className="card-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', minHeight: '400px' }}>
        
        {loading && (
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: '1.5rem', color: '#d4af37', marginTop: '50px' }}
          >
            {lang === 'th' ? '...ดวงดาวกำลังเรียงตัว...' : '...Reading the stars...'}
          </motion.div>
        )}

        {cards.map((card, index) => (
          <motion.div
            key={card._id || index}
            initial={{ opacity: 0, y: 50, rotateY: 90 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: index * 0.3, duration: 0.8 }}
            style={{
              background: '#1c1c1c',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '15px',
              width: '220px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#d4af37', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {lang === 'th' ? (card.name_th || card.name) : card.name}
            </h3>
            
            <div style={{ 
              width: '100%', 
              overflow: 'hidden', 
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid #444'
            }}>
              <img 
                src={`/cards/${card.name_short}.jpg`} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/150x250?text=No+Image"; 
                }}
                alt={card.name}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>

            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#ddd' }}>
              {lang === 'th' ? (card.meaning_up_th || "ไม่มีข้อมูลภาษาไทย") : card.meaning_up}
            </p>
          </motion.div>
        ))}
      </div>

      {/* --- ปุ่มกดหลัก --- */}
      <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
        {!loading && (
          <button 
            className="mystic-btn" 
            onClick={handleDraw}
          >
             {lang === 'th' ? '🔮 เปิดไพ่ทำนาย 🔮' : '🔮 OPEN THE ORACLE 🔮'}
          </button>
        )}
      </div>

    </div>
  );
}

export default App;