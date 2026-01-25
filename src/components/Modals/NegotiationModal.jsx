import React from 'react';

const strategies = [
  { id: 'EMOTION', label: '动之以情', desc: '诉说相思之苦，渴望血脉相连', strongAgainst: ['温柔', '纯情'], weakAgainst: ['高冷', '重利'] },
  { id: 'PROFIT', label: '诱之以利', desc: '承诺给予大量资源与家族庇护', strongAgainst: ['重利', '落魄'], weakAgainst: ['正直', '傲娇'] },
  { id: 'REASON', label: '晓之以理', desc: '分析修真界传承之重，互利共赢', strongAgainst: ['高冷', '正直'], weakAgainst: ['病娇', '纯情'] }
];

const NegotiationModal = ({ npc, onClose, onNegotiate }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>👶 劝生谈判</h3>
        <p style={{color: '#555', fontSize: '14px'}}>
          面对性格 <strong style={{color: '#d81b60'}}>{npc.personality?.label}</strong> 的 {npc.name}，<br/>
          你打算如何开口？
        </p>

        <div style={styles.list}>
          {strategies.map(strat => (
            <button key={strat.id} onClick={() => onNegotiate(strat)} style={styles.btn}>
              <div style={{fontWeight:'bold'}}>{strat.label}</div>
              <small style={{color:'#666'}}>{strat.desc}</small>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={styles.cancel}>放弃</button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  modal: { width: '300px', background: '#fff8e1', borderRadius: '12px', padding: '20px', border: '2px solid #8d6e63' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' },
  btn: { padding: '15px', background: '#fff', border: '1px solid #d7ccc8', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', ':hover': {background: '#efebe9'} },
  cancel: { width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }
};

export default NegotiationModal;