import React from 'react';

const rarityColor = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800'
};

const InventoryModal = ({ items = [], mode = 'VIEW', slot = null, childId = null, children = [], onClose, onEquip, onUse, onGiveToChild }) => {
  const filtered = mode === 'SELECT' && slot
    ? items.filter(i => i.slot === slot)
    : items;

  // 物品类型翻译
  const typeMap = {
    'consumable': '消耗品',
    'weapon': '武器',
    'armor': '防具',
    'accessory': '饰品',
    'manual': '功法秘籍'
  };

  // 装备槽位翻译
  const slotMap = {
    'weapon': '武器',
    'armor': '防具',
    'accessory': '饰品'
  };

  const renderStats = (item) => {
    if (item.type === 'consumable' && item.effect) {
      const eff = item.effect;
      if (eff.kind === 'exp') return `修为 +${eff.amount}`;
      if (eff.kind === 'aptitude') return `资质 +${eff.amount}`;
      if (eff.kind === 'heal') return `恢复 +${eff.amount}`;
    }
    if (item.type === 'manual' && item.manualIds) {
      return `包含 ${item.manualIds.length} 种功法`;
    }
    const bonus = item.stats || {};
    const parts = [];
    if (bonus.atk) parts.push(`攻击 +${bonus.atk}`);
    if (bonus.hp) parts.push(`气血 +${bonus.hp}`);
    if (bonus.mp) parts.push(`灵力 +${bonus.mp}`);
    return parts.join(' / ');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{margin:0}}>{mode === 'SELECT' ? '选择装备' : '家族背包'}</h3>
          <button style={styles.close} onClick={onClose}>×</button>
        </div>

        <div style={styles.tip}>
          {mode === 'SELECT' && slot ? `仅显示可装备在【${slotMap[slot] || slot}】的物品` : '可使用丹药或查看装备属性'}
        </div>

        <div style={styles.list}>
          {filtered.length === 0 && (
            <div style={styles.empty}>暂无可用物品</div>
          )}
          {filtered.map(item => (
            <div key={item.instanceId} style={styles.card}>
              <div style={styles.rowBetween}>
                <span style={{color: rarityColor[item.rarity] || '#333', fontWeight: 'bold'}}>{item.name}</span>
                <span style={styles.tag}>{typeMap[item.type] || item.type}</span>
              </div>
              <div style={styles.desc}>{item.desc}</div>
              <div style={styles.stats}>{renderStats(item) || '无附加属性'}</div>
              <div style={styles.actions}>
                {mode === 'SELECT' && item.slot === slot && (
                  <button style={styles.btnPrimary} onClick={() => onEquip && onEquip(item.instanceId)}>装备</button>
                )}
                {mode === 'VIEW' && item.type === 'consumable' && childId && (
                  <button style={styles.btnPrimary} onClick={() => onUse && onUse(item.instanceId)}>使用</button>
                )}
                {mode === 'VIEW' && item.type === 'manual' && childId && (
                  <button style={styles.btnPrimary} onClick={() => onUse && onUse(item.instanceId)}>学习功法</button>
                )}
                {mode === 'VIEW' && !childId && children && children.length > 0 && (
                  <button style={styles.btnSecondary} onClick={() => onGiveToChild && onGiveToChild(item.instanceId)}>分配给子女</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 },
  modal: { width:'520px', maxHeight:'80vh', background:'#fff', borderRadius:'12px', boxShadow:'0 10px 25px rgba(0,0,0,0.2)', display:'flex', flexDirection:'column' },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid #eee' },
  close: { border:'none', background:'transparent', fontSize:'20px', cursor:'pointer', color:'#888' },
  tip: { padding:'8px 16px', fontSize:'12px', color:'#666', borderBottom:'1px dashed #eee' },
  list: { padding:'12px', overflowY:'auto' },
  empty: { textAlign:'center', color:'#999', padding:'20px' },
  card: { border:'1px solid #eee', borderRadius:'8px', padding:'10px', marginBottom:'10px', background:'#fafafa' },
  rowBetween: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' },
  tag: { fontSize:'10px', padding:'2px 6px', borderRadius:'6px', background:'#e0e0e0', color:'#555', textTransform:'uppercase' },
  desc: { fontSize:'12px', color:'#555', marginBottom:'6px' },
  stats: { fontSize:'12px', color:'#333', marginBottom:'8px' },
  actions: { display:'flex', gap:'8px', flexWrap:'wrap' },
  btnPrimary: { padding:'6px 12px', border:'none', borderRadius:'6px', background:'#1976d2', color:'#fff', cursor:'pointer' },
  btnSecondary: { padding:'6px 12px', border:'none', borderRadius:'6px', background:'#7b1fa2', color:'#fff', cursor:'pointer', fontSize:'12px' }
};

export default InventoryModal;
