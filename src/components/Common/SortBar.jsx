import React from 'react';

const SortBar = ({ options, currentSort, onSortChange }) => {
  return (
    <div style={styles.container}>
      <span style={styles.label}>⇅ 排序:</span>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        style={styles.select}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // 靠右显示
    padding: '5px 10px',
    marginBottom: '10px',
    background: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '12px'
  },
  label: {
    color: '#666',
    marginRight: '8px',
    fontWeight: 'bold'
  },
  select: {
    padding: '4px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    outline: 'none',
    color: '#333'
  }
};

export default SortBar;