import React from 'react';

const rarityColor = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800'
};

const GiftModal = ({ npc, inventory = [], onClose, onGift }) => {
  // 过滤出可以赠送的物品（丹药、武器、防具、饰品）
  const giftableItems = inventory.filter(item => 
    ['consumable', 'weapon', 'armor', 'accessory'].includes(item.type)
  );

  // 物品类型翻译
  const typeMap = {
    'consumable': '丹药',
    'weapon': '武器',
    'armor': '防具',
    'accessory': '饰品'
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>🎁 给 {npc.name} 赠礼</h3>
          <button onClick={onClose} style={styles.closeIcon}>×</button>
        </div>
        
        <p style={{fontSize: '12px', color: '#666', marginBottom: '10px', padding: '0 10px'}}>
          从背包中选择物品赠送，贵重物品更能打动对方。
        </p>

        <div style={styles.itemList}>
          {giftableItems.length === 0 ? (
            <div style={styles.empty}>背包中暂无可赠送的物品</div>
          ) : (
            giftableItems.map(item => (
              <div 
                key={item.instanceId} 
                style={styles.itemCard}
                onClick={() => onGift(item)}
              >
                <div style={styles.itemHeader}>
                  <span style={{...styles.itemName, color: rarityColor[item.rarity] || '#333'}}>
                    {item.name}
                  </span>
                  <span style={styles.itemType}>
                    {typeMap[item.type] || item.type}
                  </span>
                </div>
                <div style={styles.itemDesc}>{item.desc}</div>
                {item.stats && (
                  <div style={styles.itemStats}>
                    {item.stats.atk && <span>攻击+{item.stats.atk}</span>}
                    {item.stats.hp && <span>气血+{item.stats.hp}</span>}
                    {item.stats.def && <span>防御+{item.stats.def}</span>}
                    {item.stats.mp && <span>灵力+{item.stats.mp}</span>}
                  </div>
                )}
                {item.effect && (
                  <div style={styles.itemEffect}>
                    {item.effect.kind === 'heal' && `恢复${item.effect.amount}气血`}
                    {item.effect.kind === 'exp' && `修为+${item.effect.amount}`}
                    {item.effect.kind === 'aptitude' && `资质+${item.effect.amount}`}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <button onClick={onClose} style={styles.closeBtn}>取消</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  modal: { width: '450px', maxHeight: '80vh', background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  closeIcon: { border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#666', lineHeight: 1 },
  itemList: { flex: 1, overflowY: 'auto', maxHeight: '400px', marginBottom: '15px' },
  empty: { textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: '14px' },
  itemCard: { padding: '12px', marginBottom: '8px', background: '#fafafa', borderRadius: '8px', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.2s', ':hover': { background: '#f5f5f5', borderColor: '#8d6e63' } },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  itemName: { fontWeight: 'bold', fontSize: '14px' },
  itemType: { fontSize: '11px', padding: '2px 8px', background: '#e0e0e0', borderRadius: '10px', color: '#666' },
  itemDesc: { fontSize: '12px', color: '#666', marginBottom: '6px' },
  itemStats: { fontSize: '11px', color: '#1976d2', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  itemEffect: { fontSize: '11px', color: '#388e3c', marginTop: '4px' },
  closeBtn: { width: '100%', padding: '10px', background: '#e0e0e0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }
};

export default GiftModal;