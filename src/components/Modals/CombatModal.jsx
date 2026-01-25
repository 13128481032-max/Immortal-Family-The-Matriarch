import React, { useEffect, useRef } from 'react';

const CombatModal = ({ player, enemy, result, onClose }) => {
  const logBoxRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.window}>
        <div style={styles.header}>⚔️ 生死决战</div>
        
        {/* 双方状态条 */}
        <div style={styles.statusBar}>
          <div style={styles.fighter}>
            <div style={styles.avatar}>我</div>
            <div>{player.name}</div>
            <div style={{color:'#d32f2f'}}>
              HP: {player.combatStats?.hp || 0}
            </div>
          </div>
          <div style={styles.vs}>VS</div>
          <div style={styles.fighter}>
            <div style={{...styles.avatar, background:'#d32f2f'}}>敌</div>
            <div>{enemy.name}</div>
            <div style={{color:'#d32f2f'}}>
              HP: {enemy.combatStats?.hp || 0}
            </div>
          </div>
        </div>

        {/* 战斗日志区域 */}
        <div style={styles.logBox} ref={logBoxRef}>
          {result.logs.map((line, idx) => (
            <div key={idx} style={{
              ...styles.logLine,
              color: line.includes("受到") ? '#d32f2f' : (line.includes("造成") ? '#2e7d32' : '#333'),
              fontWeight: line.includes("暴击") ? 'bold' : 'normal'
            }}>
              {line}
            </div>
          ))}
        </div>

        {/* 结算按钮 */}
        <button
          onClick={onClose}
          style={{
            ...styles.btn,
            background: result.success ? '#4caf50' : '#d32f2f'
          }}
        >
          {result.success ? "收刮战利品" : "接受败局"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  window: { width: '90%', maxWidth: '400px', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 20px rgba(255,0,0,0.5)' },
  header: { background: '#212121', color: '#fff', padding: '15px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' },
  statusBar: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#f5f5f5', borderBottom: '1px solid #ddd' },
  fighter: { textAlign: 'center', fontSize: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#333', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px' },
  vs: { fontSize: '24px', fontStyle: 'italic', fontWeight: 'bold', color: '#999', alignSelf: 'center' },
  logBox: { padding: '15px', height: '250px', overflowY: 'auto', background: '#fff', fontSize: '13px', lineHeight: '1.6' },
  logLine: { marginBottom: '5px' },
  btn: { padding: '15px', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }
};

export default CombatModal;