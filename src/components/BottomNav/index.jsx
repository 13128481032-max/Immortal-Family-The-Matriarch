import React from 'react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'FAMILY', label: '家族', icon: '🌳' },
    { id: 'NPC',    label: '情缘', icon: '💞' },
    { id: 'ACTION', label: '修炼', icon: '🧘' }, // 这里包含了 办事/挑战
    { id: 'REVENGE', label: '复仇', icon: '⚔️' },
    { id: 'PLAYER', label: '主角', icon: '🧙‍♀️' }, // 新增：主角属性界面
    { id: 'SYSTEM', label: '系统', icon: '⚙️' },
    { id: 'LOG',    label: '纪事', icon: '📜' },
  ];

  return (
    <div style={styles.container}>
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            ...styles.btn,
            backgroundColor: activeTab === tab.id ? 'rgba(255,193,7,0.2)' : 'transparent',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal'
          }}
        >
          <div style={styles.icon}>{tab.icon}</div>
          <div style={styles.label}>{tab.label}</div>
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    height: '70px',
    background: 'linear-gradient(135deg, #3e2723 0%, #2c1810 100%)', // 深色渐变背景，提高对比度
    borderTop: '2px solid #5d4037', // 深色边框
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'fixed', // 绝对定位在底部
    bottom: 0,
    left: 0,
    right: 0, // 撑满宽度
    zIndex: 100,
    boxShadow: '0 -4px 15px rgba(0,0,0,0.3)', // 加深阴影
    borderRadius: '16px 16px 0 0' // 顶部圆角
  },
  btn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 4px',
    borderRadius: '12px', // 圆角
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.1)', // 悬停背景
      transform: 'translateY(-2px)'
    }
  },
  icon: { fontSize: '22px', marginBottom: '3px' },
  label: { fontSize: '11px', color: '#fff', fontFamily: 'Microsoft YaHei, SimSun, serif' } // 白色文字
};

export default BottomNav;