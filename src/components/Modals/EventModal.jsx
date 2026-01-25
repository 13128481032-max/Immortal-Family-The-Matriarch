import React from 'react';

const EventModal = ({ event, npc, onClose, onOptionSelect }) => {
  // 处理选项选择
  const handleOptionClick = (option) => {
    // 只调用父组件的回调处理选项结果，弹窗关闭由父组件控制
    onOptionSelect(npc.id, option);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
        
        <h2 style={styles.title}>{npc.name} - 剧情事件</h2>
        
        <div style={styles.content}>
          <p style={styles.eventText}>{event.text}</p>
          
          <div style={styles.options}>
            {event.options.map((option, idx) => (
              <button 
                key={idx} 
                style={styles.optionBtn}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 半透明黑色背景，更柔和
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)' // 背景模糊效果
  },
  modal: {
    width: '90%', // 更宽的弹窗，适合手机
    maxWidth: '600px',
    backgroundColor: '#f5f0e8', // 古色古香的背景色
    borderRadius: '16px', // 更大的圆角
    padding: '25px',
    position: 'relative',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)', // 柔和的阴影
    border: '2px solid #d7ccc8', // 古色边框
    animation: 'fadeIn 0.3s ease-out' // 淡入动画
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    border: 'none',
    background: 'transparent',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#8d6e63', // 古色文字
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#6d4c41' // 鼠标悬停时颜色加深
    }
  },
  title: {
    fontSize: '20px',
    marginBottom: '25px',
    color: '#5d4037', // 深棕色文字
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: '15px',
    borderBottom: '2px solid #d7ccc8', // 底部边框装饰
    fontFamily: 'Microsoft YaHei, SimSun, serif' // 中文字体
  },
  content: {
    maxHeight: '70vh', // 更高的内容区域
    overflowY: 'auto',
    paddingRight: '10px' // 为滚动条预留空间
  },
  eventText: {
    fontSize: '16px',
    lineHeight: '1.8', // 更大的行高，更易阅读
    marginBottom: '35px',
    color: '#5d4037', // 深棕色文字
    padding: '20px',
    background: '#faf8f5', // 浅色背景
    borderRadius: '12px', // 圆角
    border: '1px solid #e0e0e0', // 边框
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // 柔和阴影
    fontFamily: 'Microsoft YaHei, SimSun, serif' // 中文字体
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px' // 更大的间距
  },
  optionBtn: {
    padding: '18px',
    border: '2px solid #d7ccc8', // 古色边框
    borderRadius: '12px', // 圆角
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)', // 渐变背景
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease',
    fontSize: '15px',
    color: '#5d4037', // 深棕色文字
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // 柔和阴影
    ':hover': {
      background: 'linear-gradient(135deg, #f5f0e8 0%, #e8e0d8 100%)', // 悬停渐变
      transform: 'translateY(-2px)', // 轻微上浮
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // 增强阴影
      borderColor: '#bcaaa4' // 边框颜色变化
    },
    ':active': {
      transform: 'translateY(0)', // 按下效果
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)' // 减弱阴影
    }
  }
};

export default EventModal;