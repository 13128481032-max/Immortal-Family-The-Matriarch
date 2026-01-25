import React, { useEffect } from 'react';

const ResultModal = ({ result, onClose }) => {
  useEffect(() => {
    // 只有当 autoClose 为 true 时才倒计时
    if (result && result.autoClose !== false) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, result]);

  if (!result) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}> 
        <div style={styles.icon}>{result.success ? '🎉' : '📜'}</div>
        <h3 style={{margin: '10px 0'}}>{result.title}</h3>
        
        {/* 支持显示较长的剧情文本 */}
        <div style={styles.scrollText}>{result.msg}</div>
        
        {result.changes && (
          <div style={styles.changes}>
            {Object.entries(result.changes).map(([key, val]) => (
              <span key={key} style={styles.badge}>
                {key}: {val > 0 ? '+' : ''}{val}
              </span>
            ))}
          </div>
        )}
        
        {/* 如果不自动关闭，显示明确的按钮 */}
        {result.autoClose === false ? (
            <button onClick={onClose} style={styles.confirmBtn}>确认</button>
        ) : (
            <div style={styles.tip}>[ 点击任意处关闭 ]</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2200, 
    animation: 'fadeIn 0.2s',
    backdropFilter: 'blur(2px)' // 背景模糊效果
  },
  card: { 
    width: '85%', // 更宽的卡片，适合手机
    maxWidth: '500px',
    background: '#f5f0e8', // 古色古香的背景色
    padding: '25px', 
    borderRadius: '16px', 
    textAlign: 'center', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)', 
    animation: 'fadeIn 0.3s ease-out', 
    maxHeight: '80vh', 
    display: 'flex', 
    flexDirection: 'column',
    border: '2px solid #d7ccc8' // 古色边框
  },
  scrollText: { 
    maxHeight: '250px', 
    overflowY: 'auto', 
    lineHeight: '1.8', 
    color: '#5d4037', // 深棕色文字
    textAlign: 'left', 
    background: '#faf8f5', // 浅色背景
    padding: '20px', 
    borderRadius: '12px', 
    margin: '15px 0',
    border: '1px solid #e0e0e0', // 边框
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', // 柔和阴影
    fontFamily: 'Microsoft YaHei, SimSun, serif' // 中文字体
  },
  confirmBtn: { 
    marginTop: '20px', 
    padding: '12px 25px', 
    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)', // 渐变背景
    color: 'white', 
    border: 'none', 
    borderRadius: '25px', 
    cursor: 'pointer',
    fontSize: '15px',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // 柔和阴影
    ':hover': {
      background: 'linear-gradient(135deg, #6d4c41 0%, #5d4037 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  },
  icon: { fontSize: '48px', marginBottom: '15px' },
  changes: { 
    marginTop: '20px', 
    display: 'flex', 
    gap: '8px', 
    justifyContent: 'center', 
    flexWrap: 'wrap' 
  },
  badge: { 
    background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)', // 渐变背景
    color: '#5d4037', // 深棕色文字
    padding: '4px 12px', 
    borderRadius: '15px', 
    fontSize: '13px', 
    border: '1px solid #d7ccc8', // 古色边框
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // 柔和阴影
  },
  tip: { 
    marginTop: '15px', 
    fontSize: '12px', 
    color: '#8d6e63', // 古色文字
    fontStyle: 'italic'
  }
};

export default ResultModal;