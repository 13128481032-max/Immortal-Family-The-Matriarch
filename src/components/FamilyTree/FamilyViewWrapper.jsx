import React, { useState } from 'react';
import ZoomableTree from './ZoomableTree.jsx';
import ChildrenListView from './ChildrenListView.jsx';

/**
 * 家族视图包装器组件
 * 提供树形图和列表两种视图模式的切换
 */
const FamilyViewWrapper = ({ player, children, pregnantNpcs = [], onChildClick }) => {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' 或 'list'

  return (
    <div style={styles.container}>
      {/* 视图切换按钮 */}
      <div style={styles.viewSwitcher}>
        <button
          style={{
            ...styles.viewButton,
            ...(viewMode === 'tree' ? styles.viewButtonActive : {})
          }}
          onClick={() => setViewMode('tree')}
        >
          🌳 家族树
        </button>
        <button
          style={{
            ...styles.viewButton,
            ...(viewMode === 'list' ? styles.viewButtonActive : {})
          }}
          onClick={() => setViewMode('list')}
        >
          📋 列表
        </button>
      </div>

      {/* 视图内容 */}
      <div style={styles.viewContent}>
        {viewMode === 'tree' ? (
          <ZoomableTree
            player={player}
            children={children}
            pregnantNpcs={pregnantNpcs}
            onChildClick={onChildClick}
          />
        ) : (
          <ChildrenListView
            children={children}
            pregnantNpcs={pregnantNpcs}
            onChildClick={onChildClick}
          />
        )}
      </div>

      {/* 使用提示 */}
      {viewMode === 'tree' && (
        <div style={styles.hint}>
          💡 提示: 在树形图中,可以用鼠标/手指拖动查看,滚轮/双指缩放
        </div>
      )}
      {viewMode === 'list' && (
        <div style={styles.hint}>
          💡 提示: 使用上方筛选器来快速查找特定子嗣
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  viewSwitcher: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '12px',
    border: '2px solid #8d6e63'
  },
  viewButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid #8d6e63',
    borderRadius: '20px',
    backgroundColor: 'white',
    color: '#5d4037',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  viewButtonActive: {
    backgroundColor: '#8d6e63',
    color: 'white',
    transform: 'scale(1.05)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
  },
  viewContent: {
    flex: 1
  },
  hint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    padding: '8px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  }
};

// 添加悬停效果的CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  button:hover {
    transform: translateY(-2px);
  }
  button:active {
    transform: translateY(0);
  }
`;
if (!document.querySelector('#family-view-wrapper-styles')) {
  styleSheet.id = 'family-view-wrapper-styles';
  document.head.appendChild(styleSheet);
}

export default FamilyViewWrapper;
