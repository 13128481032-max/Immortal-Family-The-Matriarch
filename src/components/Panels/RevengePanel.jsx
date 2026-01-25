import React from 'react';
import { calculateCombatPower } from '../../game/challengeSystem.js';

const RevengePanel = ({ player, rival, onAction }) => {
  const playerCP = calculateCombatPower(player);
  const rivalCP = rival.combatPower;
  const winRate = Math.min(100, Math.max(0, (playerCP / rivalCP) * 50)).toFixed(0);

  return (
    <div style={{padding: '15px'}}>
      {/* 顶部：双雄对决图 */}
      <div style={styles.header}>
        <div style={styles.avatarBox}>
          <div style={styles.avatar}>你</div>
          <div>{player.tier}</div>
          <small>战力: {playerCP}</small>
        </div>
        <div style={styles.vs}>VS</div>
        <div style={styles.avatarBox}>
          <div style={{...styles.avatar, background: '#d32f2f'}}>敌</div>
          <div style={{color: '#d32f2f'}}>{rival.name}</div>
          <small>境界: {rival.tier}</small>
          <small>战力: {rivalCP}</small>
        </div>
      </div>

      {/* 威胁度进度条 */}
      <div style={styles.threatBox}>
        <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
          <span>🔥 追杀威胁度</span>
          <span>{rival.threat}/100</span>
        </div>
        <div style={styles.progressBg}>
          <div style={{...styles.progressFill, width: `${Math.min(100, rival.threat)}%`}}></div>
        </div>
        <p style={{fontSize: '10px', color: '#666', marginTop: '5px'}}>
          威胁度越高，遭遇杀手的概率和强度越大。
        </p>
      </div>

      {/* 复仇行动 */}
      <h3>🗡️ 复仇行动</h3>
      <div style={styles.actions}>
        
        <button style={styles.btn} onClick={() => onAction('SABOTAGE')}>
          <div>🕵️‍♀️ 散布谣言</div>
          <small>消耗 50 灵石，降低她 10 点名望与修炼速度。</small>
        </button>

        <button style={styles.btn} onClick={() => onAction('DEFEND')}>
          <div>🛡️ 隐匿行踪</div>
          <small>消耗 20 灵石，降低 20 点威胁度，躲避追杀。</small>
        </button>

        <button
          style={{...styles.btn, borderColor: '#d32f2f', background: '#ffebee'}}
          onClick={() => onAction('DUEL')}
        >
          <div>☠️ 生死决战</div>
          <small>发起总攻！当前胜率: <span style={{fontWeight:'bold', color: winRate > 60 ? 'green' : 'red'}}>{winRate}%</span></small>
        </button>
      </div>

      {/* 剧情日志 */}
      <div style={styles.logBox}>
        <h4>📝 仇人动向</h4>
        {rival.logs.map((log, i) => (
          <div key={i} style={styles.logItem}>{log}</div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  avatarBox: { textAlign: 'center', display: 'flex', flexDirection: 'column' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#333', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 5px' },
  vs: { fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic', color: '#ccc' },
  threatBox: { background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffe0b2' },
  progressBg: { height: '8px', background: '#eee', borderRadius: '4px' },
  progressFill: { height: '100%', background: '#ff5722', borderRadius: '4px', transition: 'width 0.3s' },
  actions: { display: 'grid', gap: '10px' },
  btn: { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: 'white', textAlign: 'left', cursor: 'pointer' },
  logBox: { marginTop: '20px', maxHeight: '150px', overflowY: 'auto' },
  logItem: { fontSize: '12px', padding: '5px 0', borderBottom: '1px dashed #eee', color: '#555' }
};

export default RevengePanel;