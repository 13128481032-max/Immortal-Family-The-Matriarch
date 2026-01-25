// src/components/Dashboard/index.jsx
import React from 'react';

// 接收 player 数据作为参数
const Dashboard = ({ player }) => {
  return (
    <div style={styles.container}>
      {/* 头部：名字与境界 */}
      <div style={styles.header}>
        <h2>{player.name}</h2>
        <span style={styles.badge}>{player.tier}</span>
      </div>

      {/* 时间信息 [cite: 139] - 游戏按月推进 */}
      <p>📅 云澜历 {player.time.year}年 {player.time.month}月 ({player.time.season})</p>

      {/* 核心三维属性 */}
      <div style={styles.statsGrid}>
        <div>🌸 容貌: {player.stats.looks}</div>
        <div>🧠 心机: {player.stats.cunning}</div>
        <div>❤️ 健康: {player.stats.health}</div>
      </div>

      {/* 战斗属性 */}
      <div style={styles.combatGrid}>
        <div style={{color: '#d32f2f'}}>❤️ 气血: {player.combatStats?.hp || 100}/{player.combatStats?.maxHp || 100}</div>
        <div style={{color: '#1976d2'}}>💧 灵力: {player.combatStats?.mp || 0}</div>
        <div style={{color: '#f57c00'}}>⚔️ 攻击: {player.combatStats?.atk || 10}</div>
      </div>

      {/* 资源栏 */}
      <div style={styles.resources}>
        <span>💎 灵石: {player.resources.spiritStones}</span>
        <span style={{marginLeft: '10px'}}>💰 凡银: {player.resources.money}</span>
      </div>
      
      {/* 状态栏 */}
      <div style={styles.statusBox}>
        当前状态: {player.status.join("、")}
      </div>
    </div>
  );
};

// 简单的CSS样式（写在同一个文件里方便新手管理）
const styles = {
  container: {
    border: '2px solid #5d4037',
    backgroundColor: '#fff8e1', // 米黄色纸张感
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    fontFamily: '"KaiTi", "楷体", serif' // 古风字体
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #d7ccc8',
    marginBottom: '10px'
  },
  badge: {
    backgroundColor: '#5d4037',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.8em'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // 三列布局
    gap: '10px',
    marginBottom: '15px'
  },
  combatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr', // 三列布局
    gap: '10px',
    marginBottom: '15px',
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '5px'
  },
  resources: {
    backgroundColor: '#efebe9',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '10px'
  },
  statusBox: {
    color: '#c62828', // 红色警告色
    fontSize: '0.9em'
  }
};

export default Dashboard;