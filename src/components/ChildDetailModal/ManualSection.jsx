// src/components/ChildDetailModal/ManualSection.jsx
import React from 'react';
import { getManualCompatibilityInfo } from '../../game/manualSystem.js';

/**
 * 功法信息展示组件
 */
const ManualSection = ({ child, onChangeManual }) => {
  // 如果孩子还没有灵根信息，不显示功法部分
  if (!child.spiritRoot || !child.spiritRoot.elements) {
    return (
      <div style={styles.section}>
        <h4 style={styles.secTitle}>📖 修炼功法</h4>
        <p style={{ color: '#999', fontSize: '12px' }}>需要先测灵根(6岁)</p>
      </div>
    );
  }
  
  // 获取当前功法信息和契合度
  const manualId = child.cultivationMethod || 'basic_breath';
  const manualInfo = getManualCompatibilityInfo(manualId, child.spiritRoot);
  
  if (!manualInfo.manual) {
    return (
      <div style={styles.section}>
        <h4 style={styles.secTitle}>📖 修炼功法</h4>
        <p style={{ color: '#999', fontSize: '12px' }}>未修炼功法</p>
      </div>
    );
  }
  
  const { manual, compatibility, speedBonus } = manualInfo;
  
  // 契合度颜色映射
  const compatibilityColor = compatibility.color || '#999';
  
  return (
    <div style={styles.section}>
      <h4 style={styles.secTitle}>📖 修炼功法</h4>
      
      <div style={styles.manualCard}>
        {/* 功法名称和等阶 */}
        <div style={styles.manualHeader}>
          <div style={styles.manualName}>
            {manual.name}
            <span style={{ 
              ...styles.tierBadge, 
              background: manual.tierColor,
              marginLeft: '8px'
            }}>
              {manual.tierName}
            </span>
          </div>
          
          {/* 属性标签 */}
          {manual.element !== 'NONE' && (
            <div style={styles.elementBadge}>
              {manual.element}
            </div>
          )}
        </div>
        
        {/* 功法描述 */}
        <div style={styles.manualDesc}>
          {manual.desc}
        </div>
        
        {/* 契合度显示 */}
        <div style={{ ...styles.compatibilityBox, borderColor: compatibilityColor }}>
          <div style={styles.compatibilityRow}>
            <span>契合度：</span>
            <span style={{ color: compatibilityColor, fontWeight: 'bold' }}>
              {compatibility.desc}
            </span>
          </div>
          <div style={styles.compatibilityRow}>
            <span>修炼加成：</span>
            <span style={{ color: '#2196F3', fontWeight: 'bold' }}>
              +{speedBonus}
            </span>
          </div>
        </div>
        
        {/* 更换功法按钮 */}
        <div style={styles.actionRow}>
          <button 
            style={styles.changeBtn}
            onClick={() => onChangeManual && onChangeManual(child)}
          >
            🔄 更换功法
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  section: {
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #e0e0e0'
  },
  secTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  },
  manualCard: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #e0e0e0'
  },
  manualHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  manualName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    display: 'flex',
    alignItems: 'center'
  },
  tierBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: 'white',
    fontWeight: 'bold'
  },
  elementBadge: {
    padding: '4px 10px',
    background: '#FF6B6B',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  manualDesc: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '10px',
    lineHeight: '1.5'
  },
  compatibilityBox: {
    background: 'white',
    borderLeft: '3px solid',
    padding: '8px 10px',
    marginBottom: '10px',
    borderRadius: '4px'
  },
  compatibilityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '4px'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  changeBtn: {
    padding: '6px 16px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'background 0.2s'
  }
};

export default ManualSection;
