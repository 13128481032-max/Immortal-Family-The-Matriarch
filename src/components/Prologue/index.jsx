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
      sub: "庶妹楚清瑶觉醒双灵根，被测出是百年难遇的天才。父亲为了家族利益，竟默认她夺走了你的未婚夫，甚至诬陷你“私通外敌”。"
    },
    {
      text: "逐出家门。",
      sub: "深秋雨夜，你被废去一身修为，扔在荒山破庙。曾经的锦衣玉食，如今只剩满身泥泞。"
    }
  ];

  const handleChoice = (choice) => {
    // choice: 'RELIC' (母亲遗物) | 'MONEY' (私房钱) | 'HIDDEN' (隐忍)
    onFinish(choice);
  };

  if (step < storyline.length) {
    return (
      <div style={styles.container} onClick={() => setStep(step + 1)}>
        <h1 style={styles.title}>{storyline[step].text}</h1>
        <p style={styles.sub}>{storyline[step].sub}</p>
        
        {/* 如果有存档，显示继续按钮 */}
        {hasSave && step === 0 && (
          <button 
            onClick={onLoadGame}
            style={{...styles.btn, background: '#4caf50', marginBottom: '20px', width: '200px', textAlign: 'center'}}
          >
            📂 读取旧存档
          </button>
        )}

        <div style={styles.tip}>[ 点击屏幕开始新游戏 ]</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={{color: '#d32f2f', marginBottom: '30px'}}>绝境抉择</h2>
      <p style={styles.sub}>楚家的人快要追上来了，离开前，你只能带走一样东西：</p>
      
      <div style={styles.choices}>
        <button style={styles.btn} onClick={() => handleChoice('RELIC')}>
          <strong>母亲的遗物 (古玉)</strong>
          <br/><small>看似普通，或许藏着秘密 (资质+10，开启隐藏血脉)</small>
        </button>
        
        <button style={styles.btn} onClick={() => handleChoice('MONEY')}>
          <strong>藏好的私房钱</strong>
          <br/><small>生存才是硬道理 (灵石+500，凡银+100)</small>
        </button>

        <button style={styles.btn} onClick={() => handleChoice('HIDDEN')}>
          <strong>逃跑用的神行符</strong>
          <br/><small>只要活着就有希望 (初始闪避率UP，初始位置安全)</small>
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    background: 'black', 
    color: 'white', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 999, 
    padding: '20px', 
    textAlign: 'center',
    overflowY: 'auto'
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
    position: 'absolute', 
    bottom: '20px', 
    fontSize: 'clamp(10px, 2.5vw, 12px)', 
    color: '#666' 
  },
  choices: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px', 
    width: '100%', 
    maxWidth: '400px',
    marginTop: '20px'
  },
  btn: { 
    padding: '15px', 
    background: '#212121', 
    border: '1px solid #444', 
    color: 'white', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    textAlign: 'left', 
    transition: 'all 0.3s', 
    ':hover': { borderColor: '#d32f2f' },
    fontSize: 'clamp(12px, 3vw, 14px)',
    lineHeight: '1.5'
  }
};

export default Prologue;