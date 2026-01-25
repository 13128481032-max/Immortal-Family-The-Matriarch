import React from 'react';

const ExplorationModal = ({
  open,
  realmName,
  progress,
  total,
  event,
  log,
  onSelectOption,
  onNext,
  onStartCombat,
  onClose
}) => {
  if (!open) return null;
  return (
    <div style={styles.overlay}>
      <div style={styles.window}>
        <div style={styles.header}>🏞️ 秘境探险 · {realmName} · {progress}/{total}</div>
        <div style={styles.body}>
          <div style={styles.eventTitle}>{event?.title || '未知事件'}</div>
          <div style={styles.eventDesc}>{event?.desc || '……'}</div>

          {/* 事件选项或战斗按钮 */}
          <div style={styles.options}>
            {event?.options?.map((opt, idx) => (
              <button
                key={idx}
                style={styles.optionBtn}
                onClick={() => onSelectOption(opt)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 战斗入口，若事件为战斗或Boss且用户选择了战斗 */}
          {(event?.kind === 'COMBAT' || event?.kind === 'BOSS') && (
            <button style={styles.fightBtn} onClick={onStartCombat}>⚔️ 开始战斗</button>
          )}

          {/* 底部日志与前进 */}
          <div style={styles.logBox}>
            {log.map((l, i) => (
              <div key={i} style={styles.logLine}>• {l}</div>
            ))}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.nextBtn} onClick={onNext}>➡ 继续前进</button>
          <button style={styles.closeBtn} onClick={onClose}>✖ 结束探险</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.70)', zIndex:2100, display:'flex', alignItems:'center', justifyContent:'center' },
  window: { width:'92%', maxWidth:'520px', background:'#fff', borderRadius:'12px', boxShadow:'0 0 20px rgba(0,0,0,0.3)', overflow:'hidden', display:'flex', flexDirection:'column' },
  header: { background:'#2e7d32', color:'#fff', padding:'12px 16px', fontWeight:'bold', textAlign:'center' },
  body: { padding:'14px' },
  eventTitle: { fontSize:'16px', fontWeight:'bold', marginBottom:'6px' },
  eventDesc: { fontSize:'13px', color:'#333', lineHeight:1.6, marginBottom:'12px' },
  options: { display:'grid', gridTemplateColumns:'1fr', gap:'8px', marginBottom:'8px' },
  optionBtn: { padding:'10px', border:'1px solid #ddd', borderRadius:'8px', background:'#fafafa', cursor:'pointer', fontSize:'14px' },
  fightBtn: { padding:'12px', border:'none', borderRadius:'8px', background:'#d32f2f', color:'#fff', fontWeight:'bold', cursor:'pointer', margin:'10px 0' },
  logBox: { borderTop:'1px dashed #ddd', marginTop:'8px', paddingTop:'8px', maxHeight:'160px', overflowY:'auto', fontSize:'12px', color:'#444' },
  logLine: { marginBottom:'4px' },
  footer: { display:'flex', justifyContent:'space-between', padding:'10px', background:'#f5f5f5', borderTop:'1px solid #eee' },
  nextBtn: { padding:'10px 14px', border:'none', borderRadius:'8px', background:'#1976d2', color:'#fff', cursor:'pointer', fontWeight:'bold' },
  closeBtn: { padding:'10px 14px', border:'none', borderRadius:'8px', background:'#9e9e9e', color:'#fff', cursor:'pointer', fontWeight:'bold' }
};

export default ExplorationModal;
