import React from 'react';
import { getSectById } from '../../game/cultivationSystem.js';

const SectSelectionModal = ({ event, onClose, onAssign }) => {
  if (!event) return null;
  const { child, selectableSects = [], title, message } = event;

  const calcCompatibility = (s) => {
    const sect = s.sect || s;
    let score = 0;
    if (Array.isArray(child.spiritRoot?.elements)) {
      child.spiritRoot.elements.forEach(el => {
        if (sect.prefElements && sect.prefElements.includes(el)) score += 40;
        if (child.spiritRoot.type === '变异灵根' && sect.id === 'DEMON') score += 30;
      });
    }
    const apt = child.stats?.aptitude || 50;
    const aptBonus = Math.max(0, apt - (sect.minApt || 0));
    score += Math.min(50, aptBonus);
    return score;
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
              const exclusive = (s.exclusiveWith || sect.exclusiveWith || []).join(', ');
              return (
                <div key={sect.id} style={styles.sectRow}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{sect.name}</div>
                    <div style={{fontSize:12, color:'#666'}}>{sect.desc}</div>
                    <div style={{fontSize:12, color:'#444', marginTop:6}}>资源: {resources.join(', ') || '无'}</div>
                    {exclusive ? <div style={{fontSize:12, color:'#a00'}}>互斥: {exclusive}</div> : null}
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
  overlay: { position: 'fixed', inset:0, background: 'rgba(0,0,0,0.7)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:500 },
  card: { width: '640px', background: '#fff', borderRadius: 12, padding: 20 },
  content: { display: 'flex', gap: 12 },
  childBox: { width: 220, padding: 12, background: '#fafafa', borderRadius: 8 },
  listBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 },
  sectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderRadius: 8, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  btn: { padding: '8px 12px', background: '#3e2723', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' },
  cancel: { padding: '8px 12px', background: '#ddd', border: 'none', borderRadius: 6, cursor: 'pointer' }
};

export default SectSelectionModal;
