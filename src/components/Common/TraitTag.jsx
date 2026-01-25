import React from 'react';

const TraitTag = ({ trait, showValue = false }) => {
  const { style, text, value } = trait;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: '12px',
      backgroundColor: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      fontSize: '12px',
      fontWeight: 'bold',
      boxShadow: style.shadow || 'none',
      marginRight: '5px'
    }}>
      <span>{text}</span>
      {/* 鼠标悬浮或特定开关下显示具体数值 */}
      {showValue && (
        <span style={{
          marginLeft: '5px',
          fontSize: '10px',
          opacity: 0.7,
          borderLeft: `1px solid ${style.color}`,
          paddingLeft: '5px'
        }}>
          {value}
        </span>
      )}
    </div>
  );
};

export default TraitTag;