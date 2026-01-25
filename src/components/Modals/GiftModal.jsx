import React from 'react';

const gifts = [
  { id: 'herb', name: '止血草', cost: 10, value: 5, desc: '路边常见的草药' },
  { id: 'pill', name: '洗髓丹', cost: 100, value: 15, desc: '对修炼有益的丹药' },
  { id: 'weapon', name: '精铁剑', cost: 300, value: 30, desc: '锋利的凡兵' },
  { id: 'book', name: '古籍孤本', cost: 500, value: 50, desc: '记载着上古秘闻' },
  // 经典类礼物：用于触发佛修专属事件
  { id: 'sutra', name: '心经', cost: 200, value: 80, desc: '佛门经典，足以触动高僧', tags: ['scripture'] },
];

const GiftModal = ({ npc, playerMoney, onClose, onGift }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>🎁 给 {npc.name} 赠礼</h3>
          <span style={styles.money}>剩余灵石: {playerMoney}</span>
        </div>
        
        <p style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>
          他喜好: {npc.likes || "未知"} <br/>
          <small>投其所好可获得额外好感加成。</small>
        </p>

        <div style={styles.grid}>
          {gifts.map(gift => (
            <button 
              key={gift.id} 
              style={{
                ...styles.itemBtn,
                opacity: playerMoney >= gift.cost ? 1 : 0.5,
                border: playerMoney >= gift.cost ? '1px solid #8d6e63' : '1px solid #ddd'
              }}
              disabled={playerMoney < gift.cost}
              onClick={() => onGift(gift)}
            >
              <div style={styles.itemName}>{gift.name}</div>
              <div style={styles.itemCost}>💰 {gift.cost}</div>
              <div style={styles.itemDesc}>{gift.desc}</div>
            </button>
          ))}
        </div>
        
        <button onClick={onClose} style={styles.closeBtn}>取消</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  modal: { width: '320px', background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  money: { fontSize: '12px', color: '#d81b60', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' },
  itemBtn: { padding: '10px', background: '#f5f5f5', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  itemName: { fontWeight: 'bold', fontSize: '14px', color: '#3e2723' },
  itemCost: { fontSize: '12px', color: '#ff6f00', margin: '2px 0' },
  itemDesc: { fontSize: '10px', color: '#888' },
  closeBtn: { width: '100%', padding: '10px', background: '#e0e0e0', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export default GiftModal;