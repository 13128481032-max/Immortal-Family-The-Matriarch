import React, { useState, useMemo } from 'react';
import { getEventIcon, getEventColor } from '../../game/worldEventsSystem.js';

const GameLog = ({ logs }) => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PERSONAL' | 'WORLD'
  
  // 分类过滤日志
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'ALL') return logs;
    if (activeFilter === 'PERSONAL') {
      return logs.filter(log => log.category !== '大陆纪事');
    }
    if (activeFilter === 'WORLD') {
      return logs.filter(log => log.category === '大陆纪事');
    }
    return logs;
  }, [logs, activeFilter]);
  
  // 统计各类日志数量
  const counts = useMemo(() => {
    const personal = logs.filter(log => log.category !== '大陆纪事').length;
    const world = logs.filter(log => log.category === '大陆纪事').length;
    return { all: logs.length, personal, world };
  }, [logs]);
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📜 仙途纪事</h3>
      
      {/* 分类过滤标签 */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'ALL' ? styles.filterBtnActive : {})
          }}
          onClick={() => setActiveFilter('ALL')}
        >
          📚 全部 ({counts.all})
        </button>
        <button
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'PERSONAL' ? styles.filterBtnActive : {})
          }}
          onClick={() => setActiveFilter('PERSONAL')}
        >
          👤 个人 ({counts.personal})
        </button>
        <button
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'WORLD' ? styles.filterBtnActive : {})
          }}
          onClick={() => setActiveFilter('WORLD')}
        >
          🌍 大陆 ({counts.world})
        </button>
      </div>
      
      <div style={styles.logWindow}>
        {filteredLogs.length === 0 ? <p style={{color: '#999'}}>暂无记录...</p> : null}

        {/* 遍历显示日志，最新的显示在最上面 */}
        {filteredLogs.map((log, index) => {
          const isWorldEvent = log.category === '大陆纪事';
          const icon = isWorldEvent ? getEventIcon(log.type) : '📝';
          const color = isWorldEvent ? getEventColor(log.type) : '#8B4513';
          
          return (
            <div key={log.turn + '-' + index} style={styles.logItem}>
              <div style={styles.logHeader}>
                <span style={{...styles.turn, color}}>{icon} [第{log.turn}月]</span>
                {isWorldEvent && log.title && (
                  <span style={styles.eventTag}>{log.title}</span>
                )}
              </div>
              <div style={styles.logContent}>{log.message}</div>
            </div>
          );
        })}
      </div>
      <div style={styles.footer}>
        <span style={{fontSize: '11px', color: '#666'}}>
          共 {filteredLogs.length} 条记录
        </span>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontFamily: '"KaiTi", serif',
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    margin: '0',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #eee',
    fontSize: '16px'
  },
  filterBar: {
    display: 'flex',
    gap: '5px',
    padding: '8px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #eee'
  },
  filterBtn: {
    flex: 1,
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  filterBtnActive: {
    backgroundColor: '#4A90E2',
    color: '#fff',
    borderColor: '#4A90E2',
    fontWeight: 'bold'
  },
  logWindow: {
    height: '250px',
    overflowY: 'auto',
    padding: '10px',
    fontSize: '13px',
    flex: 1
  },
  logItem: {
    marginBottom: '10px',
    borderBottom: '1px dashed #eee',
    paddingBottom: '6px'
  },
  logHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '3px'
  },
  turn: {
    fontWeight: 'bold',
    fontSize: '12px'
  },
  eventTag: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    color: '#666'
  },
  logContent: {
    lineHeight: '1.5',
    color: '#333'
  },
  footer: {
    padding: '8px 10px',
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #eee',
    textAlign: 'center'
  }
};

export default GameLog;