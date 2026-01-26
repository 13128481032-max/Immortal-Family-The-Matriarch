import React from 'react';
import Avatar from '../Common/Avatar.jsx';

const NpcCard = ({ npc, onInteract }) => {
  // 根据好感度改变心形颜色
  const getHeartColor = () => {
    const affection = npc.relationship?.affection || 0;
    if (affection >= 80) return "#ff1744"; // 深爱-红
    if (affection >= 40) return "#ff9100"; // 友善-橙
    return "#bdbdbd"; // 路人-灰
  };

  return (
    <div style={styles.card}>
      {/* 头部：头像与名字 */}
      <div style={styles.header}>
        <Avatar dna={npc.avatar} gender={npc.gender} size={60} />
        <div>
          <h3 style={{margin: 0}}>{npc.name} <span style={styles.tag}>{npc.identity}</span></h3>
          <small style={{color: '#666'}}>{npc.cultivation}</small>
        </div>
      </div>

      {/* 描述与状态 */}
      <p style={styles.desc}>“{npc.desc}”</p>
      
      {/* 好感度进度条 */}
      <div style={styles.statRow}>
        <span>好感度:</span>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill, 
            width: `${npc.relationship?.affection || 0}%`,
            backgroundColor: getHeartColor()
          }}></div>
        </div>
        <span style={{color: getHeartColor()}}>♥ {npc.relationship?.affection || 0}</span>
      </div>

      {/* 交互按钮区 */}
      <div style={styles.actions}>
        <button onClick={() => onInteract(npc.id, 'DETAIL')} style={styles.btn}>
          📋 详情
        </button>
        <button onClick={() => onInteract(npc.id, 'CHAT')} style={styles.btn}>
          💬 闲聊
        </button>
        <button onClick={() => onInteract(npc.id, 'GIFT')} style={styles.btn}>
          🎁 赠礼
        </button>
        
        {/* 切磋按钮 - 需要中立以上关系 */}
        <button 
          onClick={() => onInteract(npc.id, 'SPAR')} 
          disabled={(npc.relationship?.affection || 0) < 0}
          style={{
            ...styles.btn, 
            opacity: (npc.relationship?.affection || 0) < 0 ? 0.5 : 1,
            backgroundColor: '#ff9800',
            color: 'white'
          }}
          title="友好切磋，提升修为"
        >
          ⚔️ 切磋
        </button>
        
        {/* 双修按钮 - 需要亲密关系（80+） */}
        {!npc.isChild && (
          <button 
            onClick={() => onInteract(npc.id, 'DUAL_CULTIVATION')}
            style={{
              ...styles.btn, 
              opacity: (npc.relationship?.affection || 0) < 80 ? 0.5 : 1, 
              backgroundColor: '#7b1fa2', 
              color: 'white'
            }}
            title="双修大道，共享经验（需要80+好感）"
          >
            🧘 双修
          </button>
        )}
        
        {/* 劝生按钮 - 需要亲密关系（80+） */}
        {!npc.isChild && (
          <button 
            onClick={() => onInteract(npc.id, 'PROPOSE')}
            disabled={(npc.relationship?.affection || 0) < 80}
            style={{
              ...styles.btn, 
              opacity: (npc.relationship?.affection || 0) < 80 ? 0.5 : 1, 
              backgroundColor: '#d81b60', 
              color: 'white',
              cursor: (npc.relationship?.affection || 0) < 80 ? 'not-allowed' : 'pointer'
            }}
            title="劝其为你诞子（需要80+好感）"
          >
            👶 劝生
          </button>
        )}
      </div>
    </div>
  );
};

// 样式
const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '10px'
  },
  header: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
  avatar: { fontSize: '40px', background: '#f5f5f5', borderRadius: '50%', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tag: { fontSize: '12px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', color: '#333' },
  desc: { fontStyle: 'italic', color: '#555', fontSize: '14px', margin: '5px 0 15px 0' },
  statRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '14px' },
  progressBar: { flex: 1, height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' },
  progressFill: { height: '100%', transition: 'width 0.3s ease' },
  actions: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' },
  btn: { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '12px' }
};

export default NpcCard;