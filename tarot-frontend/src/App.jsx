import { useState, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState('welcome'); 
  
  // ✅ เปลี่ยนจาก selectedCount เป็น selectedIds (เก็บ ID ของไพ่ที่ถูกเลือก)
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('prediction');
  
  // --- ส่วนของหน้า Welcome (เหมือนเดิม) ---
  const bgCardList = ['ar00', 'ar01', 'ar02', 'ar03', 'ar04', 'ar05', 'ar06', 'ar07', 'ar08', 'ar09', 'ar10', 'ar11', 'ar12', 'ar13', 'ar14', 'ar15', 'ar16', 'ar17', 'ar18', 'ar19', 'ar20', 'ar21'];
  
  const scatteredBackground = useMemo(() => {
    return bgCardList.map((name, i) => ({
      id: `bg-${i}`,
      name: name,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `${Math.random() * 360}deg`,
      scale: Math.random() * 0.4 + 0.6 
    }));
  }, []);

  const handleStartGame = () => {
    setGameState('picking');
  };

  // --- ส่วนของหน้า Picking ---
  const deck = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      x: Math.random() * 40 - 20,
      y: Math.random() * 40 - 20,
      rotate: Math.random() * 40 - 20
    }));
  }, []);

  // ✅ ฟังก์ชันเลือก/ยกเลิกไพ่
  const handleCardPick = async (id) => {
    if (loading) return;

    // ตรวจสอบว่าไพ่ใบนี้ถูกเลือกไปแล้วหรือยัง?
    const isSelected = selectedIds.includes(id);

    if (isSelected) {
      // 1. ถ้าเลือกอยู่แล้ว -> ให้เอาออก (Deselect)
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      // 2. ถ้ายังไม่เลือก -> ตรวจสอบว่าครบ 3 ใบหรือยัง
      if (selectedIds.length < 3) {
        const newSelection = [...selectedIds, id];
        setSelectedIds(newSelection);

        // ถ้าเลือกครบ 3 ใบแล้ว ให้เริ่มทำนาย
        if (newSelection.length === 3) {
          startPrediction();
        }
      }
    }
  };

  // แยกฟังก์ชันเริ่มทำนายออกมา
  const startPrediction = async () => {
    setLoading(true);
    // หน่วงเวลานิดนึง ให้ User เห็นว่าไพ่ใบที่ 3 ถูกเลือกแล้ว
    await new Promise(r => setTimeout(r, 500));

    try {
      const res = await axios.get('http://localhost:3000/api/tarot-reading?n=3');
      setTimeout(() => {
          setCards(res.data.reading);
          setGameState('reading');
          setLoading(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      alert("สัญญาณจักรวาลขัดข้อง (Connection Error)");
      setLoading(false);
      setSelectedIds([]); // Reset ถ้า Error
    }
  };

  const resetGame = () => {
    setCards([]);
    setSelectedIds([]); // Reset การเลือก
    setGameState('picking');
    setMode('prediction');
  };

  const getCardDisplay = (card, index) => {
    if (mode === 'meaning') {
        return { title: card.name_th || card.name, text: card.meaning_up_th || "ไม่มีข้อมูล", color: '#d4af37' };
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
    <div 
        style={{ textAlign: 'center', width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
        onClick={gameState === 'welcome' ? handleStartGame : undefined}
    >

      <AnimatePresence mode='wait'>
        {/* หน้า Welcome (เหมือนเดิม) */}
        {gameState === 'welcome' && (
            <motion.div
                key="welcome-screen"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.8 }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000, background: '#0a0a0a', cursor: 'pointer' }}
            >
                <div style={{ position: 'absolute', top:0, left:0, width:'100%', height:'100%', opacity: 0.3, filter: 'grayscale(50%) blur(2px)', pointerEvents: 'none' }}>
                    {scatteredBackground.map((bgCard) => (
                        <img key={bgCard.id} src={`/cards/${bgCard.name}.jpg`} style={{ position: 'absolute', top: bgCard.top, left: bgCard.left, transform: `translate(-50%, -50%) rotate(${bgCard.rotate}) scale(${bgCard.scale})`, width: '120px', boxShadow: '0 0 20px rgba(0,0,0,0.8)' }} />
                    ))}
                    <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%)' }}></div>
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, width: '100%' }}>
                    <motion.img initial={{ y: -20, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1 }} src="/logo-tarot.png" alt="Tarot Logo" style={{ width: '80%', maxWidth: '1200px', height: 'auto', marginBottom: '30px', filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.6))' }} />
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }} style={{ color: '#d4af37', fontSize: '1.5rem', letterSpacing: '4px', textShadow: '0 0 10px #000', fontWeight: 'bold' }}>กดหน้าจอเพื่อเริ่มทำนาย</motion.p>
                </div>
            </motion.div>
        )}

        {/* หน้าหลัก (Picking & Reading) */}
        {gameState !== 'welcome' && (
            <motion.div
                key="main-content"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', position: 'relative' }}
            >
            
            <AnimatePresence>
                {gameState === 'reading' && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
                        <div className="lang-switch-container">
                            <button className={`lang-btn ${mode === 'prediction' ? 'active' : ''}`} onClick={() => setMode('prediction')}>🔮 คำทำนาย</button>
                            <button className={`lang-btn ${mode === 'meaning' ? 'active' : ''}`} onClick={() => setMode('meaning')}>📖 ความหมายไพ่</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginBottom: '40px', marginTop: '60px' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1>✨ {gameState === 'picking' ? 'เลือกไพ่ 3 ใบ' : 'คำทำนายของคุณ'} ✨</h1>
                    <p style={{ color: '#aaa', fontStyle: 'italic' }}>
                        {gameState === 'picking' ? `ตั้งจิตอธิษฐานแล้วเลือกไพ่ (${selectedIds.length}/3)` : 'ความรัก • การเงิน • โชคลาภ'}
                    </p>
                </motion.div>
            </div>

            {/* --- Picking Phase (แก้ไขใหม่) --- */}
            {gameState === 'picking' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', maxWidth: '800px', margin: '0 auto' }}>
                    {deck.map((item) => {
                        // เช็คสถานะการเลือกของไพ่แต่ละใบ
                        const isSelected = selectedIds.includes(item.id);

                        return (
                            <motion.div
                                key={item.id}
                                // ถ้าเลือก: ให้ลอยขึ้นนิดนึง + ขยาย
                                animate={{ 
                                    opacity: 1, 
                                    scale: isSelected ? 1.15 : 1, // ขยายเมื่อเลือก
                                    rotate: item.rotate, 
                                    x: item.x, 
                                    y: isSelected ? item.y - 20 : item.y, // ลอยขึ้นเมื่อเลือก
                                    zIndex: isSelected ? 50 : 1 // อยู่บนสุดเมื่อเลือก
                                }}
                                whileHover={{ scale: 1.1, zIndex: 60 }} 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCardPick(item.id)}
                                style={{ width: '100px', height: '160px', cursor: 'pointer' }}
                            >
                                <div 
                                    className="card-back"
                                    style={{
                                        // ถ้าเลือก: เปลี่ยนขอบเป็นสีขาวสว่าง + เงาเรืองแสง
                                        border: isSelected ? '3px solid #fff' : '2px solid #d4af37',
                                        boxShadow: isSelected ? '0 0 20px rgba(255, 255, 255, 0.6)' : '0 4px 10px rgba(0,0,0,0.5)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                </div>
                            </motion.div>
                        );
                    })}

                    {loading && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 100 }}>
                            <h2 style={{ color: '#d4af37', textShadow: '0 0 10px #000', background: 'rgba(0,0,0,0.9)', padding: '30px', borderRadius: '15px', border: '1px solid #d4af37' }}>
                                ...กำลังเปิดชะตา...
                            </h2>
                        </div>
                    )}
                </div>
            )}

            {/* Reading Phase  */}
            {gameState === 'reading' && (
                <div className="card-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {cards.map((card, index) => {
                        const content = getCardDisplay(card, index);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: index * 0.3, duration: 0.6 }}
                                style={{ background: '#1c1c1c', border: '1px solid #333', borderRadius: '10px', padding: '15px', width: '260px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <h4 style={{ color: content.color, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>{mode === 'prediction' ? content.title : `ไพ่ใบที่ ${index + 1}`}</h4>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#d4af37' }}>{card.name_th || card.name}</h3>
                                <div style={{ width: '100%', borderRadius: '5px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #444' }}>
                                    <img src={`/cards/${card.name_short}.jpg`} alt={card.name} style={{ width: '100%', display: 'block' }} />
                                </div>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#ddd', marginTop: 'auto' }}>{content.text}</p>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {gameState === 'reading' && (
                <div style={{ marginTop: '50px', paddingBottom: '50px' }}>
                    <button className="mystic-btn" onClick={resetGame}>🔄 ทำนายดวงอีกครั้ง</button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;