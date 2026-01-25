import React from 'react';

const ChildSelectorModal = ({ children, item, onSelect, onClose }) => {
  const [hoveredId, setHoveredId] = React.useState(null);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{margin:0}}>选择子女</h3>
          <button style={styles.close} onClick={onClose}>×</button>
        </div>

        <div style={styles.tip}>
          将 <strong style={{color: '#1976d2'}}>{item?.name}</strong> 分配给哪位子女？
        </div>

        <div style={styles.list}>
          {children.length === 0 && (
            <div style={styles.empty}>暂无子女</div>
          )}
          {children.map((child, index) => (
            <div 
              key={child.id} 
              style={{
                ...styles.childCard,
                ...(hoveredId === child.id ? styles.childCardHover : {})
              }}
              onClick={() => onSelect(child)}
              onMouseEnter={() => setHoveredId(child.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div style={styles.childInfo}>
                <div style={styles.childHeader}>
                  <span style={styles.childName}>{child.name}</span>
                  <span style={styles.childTier}>{child.tierTitle || '凡人'}</span>
                </div>
                <div style={styles.childStats}>
                  <span>🎂 {Math.floor(child.age)}岁</span>
                  <span>⚧️ {child.gender}</span>
                  <span>✨ 资质 {child.stats?.aptitude || 50}</span>
                </div>
              </div>
              <div style={styles.arrow}>→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position:'fixed', 
    inset:0, 
    background:'rgba(0,0,0,0.5)', 
    display:'flex', 
    alignItems:'center', 
    justifyContent:'center', 
    zIndex:2100 
  },
  modal: { 
    width:'450px', 
    maxHeight:'70vh', 
    background:'#fff', 
    borderRadius:'12px', 
    boxShadow:'0 10px 25px rgba(0,0,0,0.2)', 
    display:'flex', 
    flexDirection:'column' 
  },
  header: { 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center', 
    padding:'12px 16px', 
    borderBottom:'1px solid #eee' 
  },
  close: { 
    border:'none', 
    background:'transparent', 
    fontSize:'20px', 
    cursor:'pointer', 
    color:'#888' 
  },
  tip: { 
    padding:'12px 16px', 
    fontSize:'13px', 
    color:'#555', 
    background:'#f5f5f5', 
    borderBottom:'1px solid #eee' 
  },
  list: { 
    padding:'12px', 
    overflowY:'auto', 
    flex: 1 
  },
  empty: { 
    textAlign:'center', 
    color:'#999', 
    padding:'20px' 
  },
  childCard: { 
    border:'1px solid #e0e0e0', 
    borderRadius:'8px', 
    padding:'12px', 
    marginBottom:'10px', 
    background:'#fafafa',
    cursor:'pointer',
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    transition:'all 0.2s'
  },
  childCardHover: {
    background:'#e3f2fd',
    borderColor:'#1976d2'
  },
  childInfo: {
    flex: 1
  },
  childHeader: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:'6px'
  },
  childName: {
    fontSize:'15px',
    fontWeight:'bold',
    color:'#333'
  },
  childTier: {
    fontSize:'11px',
    padding:'2px 8px',
    borderRadius:'10px',
    background:'#3e2723',
    color:'#fff'
  },
  childStats: {
    display:'flex',
    gap:'12px',
    fontSize:'12px',
    color:'#666'
  },
  arrow: {
    fontSize:'20px',
    color:'#1976d2',
    marginLeft:'10px'
  }
};

export default ChildSelectorModal;
