import React from 'react';

const GameLog = ({ logs }) => {
  // 显示所有日志
  const allLogs = logs;
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📜 仙途纪事</h3>
      <div style={styles.logWindow}>
        {allLogs.length === 0 ? <p style={{color: '#999'}}>暂无记录...</p> : null}

        {/* 遍历显示日志，最新的显示在最上面 */}
        {allLogs.map((log, index) => (
          <div key={log.turn + '-' + index} style={styles.logItem}>
            <span style={styles.turn}>[第{log.turn}月]</span> {log.message}
          </div>
        ))}
      </div>
      <div style={styles.footer}>
        <span style={{fontSize: '11px', color: '#666'}}>
          共 {logs.length} 条记录
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
  logWindow: {
    height: '250px', // 增加日志窗口高度
    overflowY: 'auto', // 内容多了可以滚动
    padding: '10px',
    fontSize: '14px',
    flex: 1
  },
  logItem: {
    marginBottom: '8px',
    borderBottom: '1px dashed #eee',
    paddingBottom: '4px'
  },
  turn: {
    color: '#8B4513',
    fontWeight: 'bold'
  },
  footer: {
    padding: '8px 10px',
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #eee',
    textAlign: 'center'
  }
};

export default GameLog;