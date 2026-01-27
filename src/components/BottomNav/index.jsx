import React from 'react';
import theme from '../../styles/theme.js';

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
    height: theme.sizes.navHeight,
    background: theme.gradients.warm,
    borderTop: `2px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    boxShadow: `0 -6px 18px ${theme.colors.shadow}`,
    borderRadius: '16px 16px 0 0'
  },
  btn: {
    background: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '6px 3px',
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  icon: { fontSize: '16px', marginBottom: '2px', color: theme.colors.ink },
  label: { fontSize: '10px', color: theme.colors.muted, fontFamily: 'Microsoft YaHei, SimSun, serif' }
};

export default BottomNav;