import { useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // สถานะ: 'picking' (กำลังเลือก) หรือ 'reading' (ดูผล)
  const [gameState, setGameState] = useState('picking'); 
  const [selectedCount, setSelectedCount] = useState(0);
  
  const [cards, setCards] = useState([]); // เก็บข้อมูลไพ่จริงจาก API
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('prediction'); // โหมดการอ่าน (คำทำนาย / ความหมาย)
  const [lang, setLang] = useState('th'); // ภาษา

  // สร้าง Deck จำลอง 22 ใบ (Major Arcana จำนวน) สุ่มตำแหน่งและองศาหมุน
  // ใช้ useMemo เพื่อไม่ให้มันสุ่มใหม่ทุกครั้งที่ render
  const deck = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 40 - 20,      // สุ่มตำแหน่งซ้ายขวาเล็กน้อย (-20px ถึง 20px)
      y: Math.random() * 40 - 20,      // สุ่มตำแหน่งบนล่าง
      rotate: Math.random() * 40 - 20  // สุ่มองศาเอียง (-20 ถึง 20 องศา)
    }));
  }, []);

  // ฟังก์ชันเมื่อ User จิ้มไพ่
  const handleCardPick = async () => {
    // ถ้ากำลังโหลด หรือเลือกครบแล้ว ห้ามกดเพิ่ม
    if (loading || selectedCount >= 3) return;

    const currentCount = selectedCount + 1;
    setSelectedCount(currentCount);

    // ถ้าเลือกครบ 3 ใบ ให้เริ่มกระบวนการดึงข้อมูล
    if (currentCount === 3) {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:3000/api/tarot-reading?n=3');
        
        // รอแป๊บนึงให้ Animation จบ แล้วค่อยแสดงผล
        setTimeout(() => {
            setCards(res.data.reading);
            setGameState('reading');
            setLoading(false);
        }, 1000);

      } catch (error) {
        console.error(error);
        alert("สัญญาณจักรวาลขัดข้อง (Connection Error)");
        setLoading(false);
        setSelectedCount(0); // Reset ถ้า Error
      }
    }
  };

  // ฟังก์ชันรีเซ็ตเพื่อเล่นใหม่
  const resetGame = () => {
    setCards([]);
    setSelectedCount(0);
    setGameState('picking');
    setMode('prediction');
  };

  // ข้อความแสดงผลตามโหมด
  const getCardDisplay = (card, index) => {
    if (mode === 'meaning') {
        return { 
            title: card.name_th || card.name, 
            text: card.meaning_up_th || "ไม่มีข้อมูล", 
            color: '#d4af37' 
        };
    } else {
        switch (index) {
            case 0: return { title: "❤️ ด้านความรัก", text: card.meaning_love, color: '#ff6b6b' };
            case 1: return { title: "💰 ด้านการเงิน", text: card.meaning_finance, color: '#4ecdc4' };
            case 2: return { title: "🍀 ด้านโชคลาภ", text: card.meaning_luck, color: '#ffe66d' };
            default: return { title: "คำทำนาย", text: card.meaning_up_th, color: '#d4af37' };
        }
    }
  };

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: '1200px', padding: '20px', position: 'relative', minHeight: '100vh' }}>
      
      {/* ปุ่มเลือกโหมด (แสดงเฉพาะตอนดูผล) */}
      <AnimatePresence>
        {gameState === 'reading' && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}
            >
                <div className="lang-switch-container">
                    <button className={`lang-btn ${mode === 'prediction' ? 'active' : ''}`} onClick={() => setMode('prediction')}>🔮 คำทำนาย</button>
                    <button className={`lang-btn ${mode === 'meaning' ? 'active' : ''}`} onClick={() => setMode('meaning')}>📖 ความหมายไพ่</button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: '40px', marginTop: '60px' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1>✨ {gameState === 'picking' ? 'เลือกไพ่ 3 ใบ' : 'คำทำนายของคุณ'} ✨</h1>
            <p style={{ color: '#aaa', fontStyle: 'italic' }}>
                {gameState === 'picking' 
                    ? `ตั้งจิตอธิษฐานแล้วเลือกไพ่ (${selectedCount}/3)` 
                    : 'ความรัก • การเงิน • โชคลาภ'}
            </p>
        </motion.div>
      </div>

      {/* --- ส่วนที่ 1: หน้าเลือกไพ่ (Picking Phase) --- */}
      {gameState === 'picking' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', maxWidth: '800px', margin: '0 auto' }}>
            {deck.map((item, index) => (
                <motion.div
                    key={item.id}
                    // Animation ตอนไพ่ปรากฏ (สุ่มตำแหน่ง)
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        rotate: item.rotate, 
                        x: item.x, 
                        y: item.y 
                    }}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCardPick}
                    style={{
                        width: '100px',
                        height: '160px',
                    }}
                >
                    <div className="card-back"></div>
                </motion.div>
            ))}
            
            {/* Loading Overlay */}
            {loading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
                    <h2 style={{ color: '#d4af37', textShadow: '0 0 10px #000', background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px' }}>
                        ...ดวงดาวกำลังเรียงตัว...
                    </h2>
                </div>
            )}
        </div>
      )}

      {/* --- ส่วนที่ 2: หน้าแสดงผล (Reading Phase) --- */}
      {gameState === 'reading' && (
        <div className="card-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {cards.map((card, index) => {
                const content = getCardDisplay(card, index);
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, rotateY: 90 }} // เริ่มแบบพลิก
                        animate={{ opacity: 1, rotateY: 0 }}   // พลิกกลับมาตรง
                        transition={{ delay: index * 0.3, duration: 0.6 }}
                        style={{
                            background: '#1c1c1c',
                            border: '1px solid #333',
                            borderRadius: '10px',
                            padding: '15px',
                            width: '260px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}
                    >
                        <h4 style={{ color: content.color, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {mode === 'prediction' ? content.title : `ไพ่ใบที่ ${index + 1}`}
                        </h4>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#d4af37' }}>
                            {card.name_th || card.name}
                        </h3>
                        <div style={{ width: '100%', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #444' }}>
                            <img src={`/cards/${card.name_short}.jpg`} alt={card.name} style={{ width: '100%', display: 'block' }} />
                        </div>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd', marginTop: 'auto' }}>
                            {content.text}
                        </p>
                    </motion.div>
                );
            })}
        </div>
      )}

      {/* ปุ่มเล่นใหม่ */}
      {gameState === 'reading' && (
          <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
            <button className="mystic-btn" onClick={resetGame}>
               🔄 ทำนายดวงอีกครั้ง
            </button>
          </div>
      )}

    </div>
  );
}

export default App;