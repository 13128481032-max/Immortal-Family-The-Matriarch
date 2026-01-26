import React, { useState } from 'react';

const rarityColor = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800'
};

const InventoryModal = ({ items = [], mode = 'VIEW', slot = null, childId = null, children = [], onClose, onEquip, onUse, onGiveToChild, onBatchGive }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  const filtered = mode === 'SELECT' && slot
    ? items.filter(i => i.slot === slot)
    : items;
    
  // 检查物品是否可以赠送
  const canGiveItem = (item) => {
    if (item.type === 'manual') {
      return { allowed: false, reason: '功法秘籍无法赠送' };
    }
    if (item.type === 'consumable') {
      return { allowed: true, reason: '' };
    }
    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      return { allowed: true, reason: '' };
    }
    return { allowed: false, reason: '该物品类型无法赠送' };
  };
  
  // 切换选择物品
  const toggleItemSelection = (instanceId) => {
    if (selectedItems.includes(instanceId)) {
      setSelectedItems(selectedItems.filter(id => id !== instanceId));
    } else {
      setSelectedItems([...selectedItems, instanceId]);
    }
  };
  
  // 批量赠送
  const handleBatchGive = () => {
    if (selectedItems.length === 0) {
      alert('请选择要赠送的物品');
      return;
    }
    
    // 过滤出可以赠送的物品
    const giveableItems = selectedItems.filter(id => {
      const item = items.find(i => i.instanceId === id);
      return item && canGiveItem(item).allowed;
    });
    
    if (giveableItems.length === 0) {
      alert('所选物品都无法赠送');
      return;
    }
    
    if (onBatchGive) {
      onBatchGive(giveableItems);
      setSelectedItems([]);
      setIsBatchMode(false);
    }
  };

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
        
        {/* 批量操作工具栏 */}
        {mode === 'VIEW' && !childId && children && children.length > 0 && (
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid #eee',
            background: isBatchMode ? '#e3f2fd' : '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                setSelectedItems([]);
              }}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                background: isBatchMode ? '#1976d2' : '#757575',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {isBatchMode ? '✓ 批量模式' : '📦 批量整理'}
            </button>
            
            {isBatchMode && (
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{fontSize: '12px', color: '#666'}}>
                  已选 {selectedItems.length} 件
                </span>
                <button
                  onClick={handleBatchGive}
                  disabled={selectedItems.length === 0}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: selectedItems.length > 0 ? '#7b1fa2' : '#ccc',
                    color: '#fff',
                    cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '12px'
                  }}
                >
                  批量分配
                </button>
                <button
                  onClick={() => {
                    const allGiveable = filtered
                      .filter(item => canGiveItem(item).allowed)
                      .map(item => item.instanceId);
                    setSelectedItems(allGiveable);
                  }}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#00897b',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  全选可赠
                </button>
              </div>
            )}
          </div>
        )}

        <div style={styles.list}>
          {filtered.length === 0 && (
            <div style={styles.empty}>暂无可用物品</div>
          )}
          {filtered.map(item => {
            const isSelected = selectedItems.includes(item.instanceId);
            const giveCheck = canGiveItem(item);
            
            return (
              <div 
                key={item.instanceId} 
                style={{
                  ...styles.card,
                  border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                  background: isSelected ? '#e3f2fd' : '#fafafa',
                  cursor: isBatchMode ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (isBatchMode && giveCheck.allowed) {
                    toggleItemSelection(item.instanceId);
                  }
                }}
              >
                <div style={styles.rowBetween}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    {isBatchMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (giveCheck.allowed) {
                            toggleItemSelection(item.instanceId);
                          }
                        }}
                        disabled={!giveCheck.allowed}
                        style={{cursor: giveCheck.allowed ? 'pointer' : 'not-allowed'}}
                      />
                    )}
                    <span style={{color: rarityColor[item.rarity] || '#333', fontWeight: 'bold'}}>{item.name}</span>
                  </div>
                  <span style={styles.tag}>{typeMap[item.type] || item.type}</span>
                </div>
                
                <div style={styles.desc}>{item.desc}</div>
                <div style={styles.stats}>{renderStats(item) || '无附加属性'}</div>
                
                {/* 显示不可赠送原因 */}
                {isBatchMode && !giveCheck.allowed && (
                  <div style={{
                    fontSize: '11px',
                    color: '#f44336',
                    marginTop: '4px',
                    padding: '4px 8px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    borderRadius: '4px'
                  }}>
                    ⚠️ {giveCheck.reason}
                  </div>
                )}
                
                {!isBatchMode && (
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
                )}
              </div>
            );
          })}
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
