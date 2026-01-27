import React, { useState, useEffect } from 'react';
import { hasSaveFile } from '../../utils/saveSystem.js';

const Prologue = ({ onFinish, onLoadGame }) => {
  const [step, setStep] = useState(0);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setHasSave(hasSaveFile());
  }, []);

  const storyline = [
    {
      text: "云澜界，青云城楚家。",
      sub: "你本是楚家嫡长女，天资平平，却拥有楚家世代相传的婚约。"
    },
    {
      text: "变故突生。",
      sub: "庶妹楚清瑶觉醒天灵根，被测出是千年难遇的绝世天才。父亲为了家族利益，竟默认她夺走了你的未婚夫，甚至诬陷你「私通外敌」。"
    },
    {
      text: "逐出家门。",
      sub: "深秋雨夜，你被废去一身修为，扔在荒山破庙。曾经的锦衣玉食，如今只剩满身泥泞。"    },
    {
      text: "天降奇遇！",
      sub: "就在你绝望之际，破庙中一道金光闪过。母亲留下的古玉碎裂，一道神秘声音在脑海响起..."
    },
    {
      text: "【子嗣反哺系统】已激活",
      sub: "『诞育子嗣，血脉相连。每一位子女的修炼成长，都将反哺于你！』\n\n子嗣达到炼气期，每月为你提供修为反哺；境界越高，反哺越多。这是专属于你的逆天机缘！"    }
  ];

  if (step < storyline.length) {
    return (
      <>
        <div style={styles.overlay} onClick={() => setStep(step + 1)}></div>
        <div style={styles.container}>
          <h1 style={styles.title}>{storyline[step].text}</h1>
          <p style={styles.sub}>{storyline[step].sub}</p>
          
          {/* 如果有存档，显示继续按钮 */}
          {hasSave && step === 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onLoadGame(); }}
              style={{...styles.btn, background: '#4caf50', marginBottom: '20px', width: '200px', textAlign: 'center'}}
            >
              📂 读取旧存档
            </button>
          )}

          <div style={styles.tip}>[ 点击屏幕继续 ]</div>
          <button 
            onClick={() => setStep(step + 1)}
            style={{...styles.continueBtn, marginTop: '20px'}}
          >
            继续 →
          </button>
        </div>
      </>
    );
  }

  // 剧情结束后直接开始游戏
  return (
    <>
      <div style={styles.overlay}></div>
      <div style={styles.container}>
        <h2 style={{color: '#d4af37', marginBottom: '30px'}}>新的开始</h2>
        <p style={styles.sub}>命运的齿轮开始转动，你的逆天之路即将开启...</p>
        
        <button 
          style={{...styles.continueBtn, background: '#d4af37', fontSize: '18px', padding: '15px 40px'}}
          onClick={() => onFinish()}
        >
          开始游戏 →
        </button>
      </div>
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 2499,
    backdropFilter: 'blur(8px)'
  },
  container: { 
    position: 'fixed', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)', 
    width: '90%', 
    maxWidth: '600px', 
    maxHeight: '85vh', 
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2500, 
    padding: '30px', 
    textAlign: 'center',
    overflowY: 'auto',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
    border: '2px solid rgba(211, 47, 47, 0.5)'
  },
  title: { 
    fontSize: 'clamp(20px, 5vw, 32px)', 
    marginBottom: '20px', 
    animation: 'fadeIn 1s' 
  },
  sub: { 
    fontSize: 'clamp(14px, 3.5vw, 16px)', 
    color: '#ccc', 
    lineHeight: '1.6', 
    maxWidth: '600px', 
    animation: 'slideUp 1s',
    padding: '0 10px'
  },
  tip: { 
    fontSize: 'clamp(10px, 2.5vw, 12px)', 
    color: '#888',
    marginTop: '10px'
  },
  continueBtn: {
    padding: '10px 30px',
    background: '#d32f2f',
    border: 'none',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    marginTop: '15px'
  },
  choices: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px', 
    width: '100%', 
    maxWidth: '500px',
    marginTop: '20px',
    padding: '0 15px'
  },
  btn: { 
    padding: '15px 12px', 
    background: '#1a1a1a', 
    border: '2px solid #666', 
    color: '#fff', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    transition: 'all 0.3s', 
    ':hover': { borderColor: '#d32f2f' },
    fontSize: 'clamp(13px, 3.5vw, 15px)',
    lineHeight: '1.6',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    minHeight: '70px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  }
};

export default Prologue;