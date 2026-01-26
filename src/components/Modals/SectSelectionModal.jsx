import React from 'react';
import { getSectById, SECTS } from '../../game/cultivationSystem.js';

const SectSelectionModal = ({ event, onClose, onAssign }) => {
  if (!event) return null;
  const { child, selectableSects = [], title, message } = event;

  // 辅助函数：将宗门ID数组转换为中文名称
  const getExclusiveNames = (ids) => {
    if (!ids || ids.length === 0) return '';
    return ids.map(id => {
      const sect = SECTS.find(s => s.id === id);
      return sect ? sect.name : id;
    }).join('、');
  };

  const calcCompatibility = (s) => {
    const sect = s.sect || s;
    let score = 0;
    
    // 灵根元素匹配
    if (Array.isArray(child.spiritRoot?.elements)) {
      child.spiritRoot.elements.forEach(el => {
        if (sect.prefElements && sect.prefElements.includes(el)) {
          score += 50;
          // 单灵根或天灵根完全匹配额外加分
          if (child.spiritRoot.elements.length === 1) score += 30;
        }
      });
      
      // 特殊灵根类型加成
      if (child.spiritRoot.type === '天灵根' && sect.level === 'TOP') score += 50;
      if (child.spiritRoot.type === '变异灵根') {
        if (sect.id === 'DEMON') score += 60;
        if (sect.id === 'THUNDER') score += 50;
        if (sect.id === 'GHOST' && child.spiritRoot.elements.includes('冰')) score += 50;
        if (sect.id === 'WIND' && child.spiritRoot.elements.includes('风')) score += 50;
        if (sect.id === 'HEAVEN_EMPEROR') score += 40;
      }
    }
    
    // 资质加成
    const apt = child.stats?.aptitude || 50;
    const aptBonus = Math.max(0, apt - (sect.minApt || 0));
    score += Math.min(40, aptBonus);
    
    return Math.round(score);
  };

  const handleChoose = (s) => {
    const sect = s.sect || s;
    // 如果外部提供了预测职位，则采用预测职位
    const rank = s.predictedRank || '外门弟子';
    onAssign(child.id, sect.id, rank);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2>{title || '宗门选拔'}</h2>
        <p style={{color: '#444'}}>{message}</p>

        <div style={styles.content}>
          <div style={styles.childBox}>
            <h3>{child.name} ({child.gender})</h3>
            <p>资质: {child.stats?.aptitude || 0}</p>
            <p>灵根: <strong style={{color: child.spiritRoot?.color || '#666'}}>{child.spiritRoot?.type || '未测'}</strong></p>
            <div style={{display: 'flex', gap: 6}}>
              {(child.spiritRoot?.elements || []).map(el => (
                <span key={el} style={{padding: '4px 8px', background:'#eee', borderRadius:6}}>{el}</span>
              ))}
            </div>
          </div>

          <div style={styles.listBox}>
            {selectableSects.map(s => {
              const sect = s.sect || s;
              const predRank = s.predictedRank;
              const resources = s.resources || [];
              const exclusiveIds = s.exclusiveWith || sect.exclusiveWith || [];
              const exclusiveNames = getExclusiveNames(exclusiveIds);
              return (
                <div key={sect.id} style={styles.sectRow}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{sect.name}</div>
                    <div style={{fontSize:12, color:'#666'}}>{sect.desc}</div>
                    <div style={{fontSize:12, color:'#444', marginTop:6}}>资源: {resources.join(', ') || '无'}</div>
                    {exclusiveNames ? <div style={{fontSize:12, color:'#a00'}}>互斥宗门: {exclusiveNames}</div> : null}
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{marginBottom:6}}>契合度: {calcCompatibility(s)}</div>
                    <div style={{fontSize:12, color:'#333', marginBottom:6}}>建议职位: {predRank || '外门弟子'}</div>
                    <button onClick={() => handleChoose(s)} style={styles.btn}>拜入此宗</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', marginTop: 12}}>
          <button onClick={onClose} style={styles.cancel}>暂不选择</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', 
    inset: 0, 
    background: 'rgba(0,0,0,0.7)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 500,
    padding: '10px',
    overflowY: 'auto'
  },
  card: { 
    width: '100%',
    maxWidth: '640px', 
    background: '#fff', 
    borderRadius: 12, 
    padding: '16px',
    maxHeight: '90vh',
    overflowY: 'auto',
    margin: 'auto'
  },
  content: { 
    display: 'flex', 
    gap: 12,
    flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
  },
  childBox: { 
    width: window.innerWidth <= 768 ? '100%' : '220px',
    padding: 12, 
    background: '#fafafa', 
    borderRadius: 8 
  },
  listBox: { 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 8 
  },
  sectRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 10, 
    borderRadius: 8, 
    background: '#fff', 
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
    gap: window.innerWidth <= 480 ? '10px' : '0'
  },
  btn: { 
    padding: '8px 12px', 
    background: '#3e2723', 
    color: 'white', 
    border: 'none', 
    borderRadius: 6, 
    cursor: 'pointer',
    fontSize: 'clamp(12px, 3vw, 14px)',
    whiteSpace: 'nowrap'
  },
  cancel: { 
    padding: '8px 12px', 
    background: '#ddd', 
    border: 'none', 
    borderRadius: 6, 
    cursor: 'pointer',
    fontSize: 'clamp(12px, 3vw, 14px)'
  }
};

export default SectSelectionModal;
