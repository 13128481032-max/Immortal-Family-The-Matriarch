import React, { useState } from 'react';

const SpiritRootTestModal = ({ child, onClose, onFinish }) => {
  const [stage, setStage] = useState('INIT'); // INIT, ANIMATING, REVEAL

  const startTest = () => {
    setStage('ANIMATING');
    // 模拟2秒动画
    setTimeout(() => {
      setStage('REVEAL');
      onFinish(child); // 通知父组件更新孩子状态(比如解锁准确资质)
    }, 2000);
  };

  // 根据元素获取颜色
  const getElementColor = (el) => {
    const map = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#795548', '雷': '#673AB7', '冰': '#00BCD4', '风': '#009688' };
    return map[el] || '#ccc';
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={{color: '#3e2723'}}>🔮 测灵大会</h2>
        
        {stage === 'INIT' && (
          <div style={{textAlign: 'center'}}>
            <h3 style={{margin: '0 0 15px 0', color: '#3e2723'}}>{child.name}</h3>
            <p>年已六岁，骨骼长成。</p>
            <p>今日家族开启测灵台，且看此{child.gender === '男' ? '子' : '女'}仙缘如何！</p>
            <div style={styles.childIcon}>{child.gender === '男' ? '👦' : '👧'}</div>
            <button onClick={startTest} style={styles.btn}>✋ 手抚测灵石</button>
          </div>
        )}

        {stage === 'ANIMATING' && (
          <div style={{textAlign: 'center'}}>
            <h3 style={{margin: '0 0 15px 0', color: '#3e2723'}}>{child.name}</h3>
            <div style={styles.orb}></div>
            <p>灵石光芒流转，正在感应天地灵气...</p>
          </div>
        )}

        {stage === 'REVEAL' && (
          <div style={{textAlign: 'center', animation: 'fadeIn 0.5s'}}>
            <h3 style={{margin: '0 0 15px 0', color: '#3e2723'}}>{child.name}</h3>
            <h3>✨ 结果揭晓 ✨</h3>
            <div style={styles.resultBox}>
              {/* 显示灵根类型 */}
              <div style={{color: child.spiritRoot.color, fontSize: '24px', fontWeight: 'bold'}}>
                {child.spiritRoot.type}
              </div>
              
              {/* 显示具体元素 (金木水火土) */}
              <div style={styles.elements}>
                {child.spiritRoot.elements.map(el => (
                  <span key={el} style={{...styles.elBadge, background: getElementColor(el)}}>
                    {el}
                  </span>
                ))}
              </div>

              {/* 显示资质大数字 */}
              <div style={{marginTop: '15px'}}>
                <span style={{fontSize: '12px', color: '#666'}}>灵根资质</span>
                <div style={{fontSize: '40px', fontWeight: 'bold', color: '#333'}}>
                  {child.stats.aptitude}
                  <span style={{fontSize: '14px', color: '#999'}}>/100</span>
                </div>
              </div>
              
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                {child.spiritRoot.desc}
              </p>
            </div>

            <div style={styles.stats}>
              <p>资质判定: <strong>{child.stats.aptitude}</strong></p>
              <p>初始灵力: <strong>{child.combatStats.mp}</strong></p>
            </div>

            <button onClick={onClose} style={styles.confirmBtn}>收入族谱</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 400 },
  card: { width: '320px', background: '#fff', borderRadius: '15px', padding: '30px', textAlign: 'center', boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' },
  btn: { padding: '15px 30px', fontSize: '18px', background: '#3e2723', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', marginTop: '20px' },
  confirmBtn: { padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' },
  
  // 动画球
  orb: { width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle, #fff, #2196f3, #000)', margin: '20px auto', animation: 'pulse 1s infinite' },
  
  // 结果样式
  childIcon: { fontSize: '50px', margin: '20px 0' },
  resultBox: { background: '#f5f5f5', padding: '15px', borderRadius: '10px', margin: '20px 0' },
  rootType: { fontSize: '24px', fontWeight: 'bold', color: '#d81b60', marginBottom: '10px' },
  elements: { display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '10px' },
  elBadge: { padding: '4px 8px', borderRadius: '50%', color: 'white', fontWeight: 'bold', width: '24px', height: '24px', lineHeight: '24px' },
  stats: { display: 'flex', justifyContent: 'space-around', fontSize: '14px', borderTop: '1px dashed #ccc', paddingTop: '15px' }
};

export default SpiritRootTestModal;