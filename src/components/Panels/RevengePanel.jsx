// src/components/Panels/RevengePanel.jsx
import React, { useState } from 'react';
import { spreadRumor, hideFromRival, finalDuel } from '../../game/revengeSystem';

const RevengePanel = ({ player, setPlayer }) => {
  const [rumorCost, setRumorCost] = useState(50);
  const [hidingMonths, setHidingMonths] = useState(1);
  const [showResult, setShowResult] = useState(null);

  // 从 player 中获取 rival 数据
  const rival = player.rival || {
    name: "楚清瑶",
    state: "NORMAL",
    lifeStage: 0,
    threatLevel: 0,
    rumorCount: 0,
    isDead: false,
    tier: "炼气初期",
    currentExp: 300
  };
  
  // 威胁度颜色
  const getThreatColor = (level) => {
    if (level >= 80) return '#ff4444';
    if (level >= 60) return '#ff8800';
    if (level >= 30) return '#ffbb00';
    return '#44ff44';
  };
  
  // 威胁度描述
  const getThreatLevel = (level) => {
    if (level >= 80) return '【极度危险】';
    if (level >= 60) return '【高度警戒】';
    if (level >= 30) return '【略有察觉】';
    return '【风平浪静】';
  };

  // 状态描述
  const getStateDesc = (state) => {
    const stateMap = {
      'NORMAL': '春风得意',
      'ANXIOUS': '焦虑不安',
      'FURIOUS': '暴怒失态',
      'DEAD': '已然陨落'
    };
    return stateMap[state] || '未知';
  };

  // 执行散布谣言
  const handleSpreadRumor = () => {
    // 创建player的深拷贝
    const playerCopy = JSON.parse(JSON.stringify(player));
    
    // 使用新的复仇系统
    const result = spreadRumor(playerCopy, rumorCost);
    
    if (result.success) {
      // 更新父组件状态（使用修改后的playerCopy）
      setPlayer(playerCopy);
    }
    
    setShowResult(result);
    setTimeout(() => setShowResult(null), 5000);
  };

  // 执行隐匿行踪
  const handleHide = () => {
    // 创建player的深拷贝
    const playerCopy = JSON.parse(JSON.stringify(player));
    
    const result = hideFromRival(playerCopy, hidingMonths, 30);
    
    if (result.success) {
      // 更新父组件状态（使用修改后的playerCopy）
      setPlayer(playerCopy);
    }
    
    setShowResult(result);
    setTimeout(() => setShowResult(null), 5000);
  };

  // 执行生死决斗
  const handleDuel = () => {
    if (!window.confirm('这将是与楚清瑶的最终决战，你确定要挑战吗？')) {
      return;
    }
    
    // 创建player的深拷贝
    const playerCopy = JSON.parse(JSON.stringify(player));
    
    const result = finalDuel(playerCopy);
    
    if (result.success) {
      // 更新父组件状态（使用修改后的playerCopy）
      setPlayer(playerCopy);
    }
    
    setShowResult(result);
    
    if (result.victory) {
      setTimeout(() => {
        alert('复仇成功！你终于击败了楚清瑶，多年的恩怨终于了结...');
      }, 1000);
    } else {
      setTimeout(() => {
        alert('你败给了楚清瑶，身受重伤...但你还活着，还有机会！');
      }, 1000);
    }
  };

  // 如果宿敌已死
  if (rival.isDead) {
    return (
      <div style={styles.panel}>
        <div style={styles.completed}>
          <h2>✨ 复仇已完成 ✨</h2>
          <p>楚清瑶已死，你的复仇之路到此为止。</p>
          <p>多年的恩怨终于化作尘埃...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>⚔️ 复仇栏目</h2>
        <p style={styles.subtitle}>宿敌：{rival.name}</p>
      </div>

      {/* 宿敌状态 */}
      <div style={styles.rivalStatus}>
        <h3 style={styles.sectionTitle}>宿敌状态</h3>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>境界：</span>
            <span style={styles.statusValue}>{rival.tier}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>状态：</span>
            <span style={styles.statusValue}>{getStateDesc(rival.state)}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>威胁度：</span>
            <span style={{...styles.statusValue, color: getThreatColor(rival.threatLevel)}}>
              {getThreatLevel(rival.threatLevel)} {rival.threatLevel}%
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>谣言效果：</span>
            <span style={styles.statusValue}>已削弱 {rival.rumorCount * 5}%</span>
          </div>
        </div>

        {/* 威胁度进度条 */}
        <div style={styles.threatBar}>
          <div 
            style={{ 
              ...styles.threatFill,
              width: `${rival.threatLevel}%`,
              backgroundColor: getThreatColor(rival.threatLevel)
            }}
          />
        </div>

        {/* 高危预警 */}
        {rival.threatLevel >= 80 && (
          <div style={styles.dangerWarning}>
            ⚠️ 高危警告：血榜杀手即将出动！请立即隐匿行踪！
          </div>
        )}
      </div>

      {/* 操作按钮区 */}
      <div style={styles.actions}>
        <h3 style={styles.sectionTitle}>复仇操作</h3>
        
        {/* 散布谣言 */}
        <div style={styles.actionCard}>
          <div style={styles.actionHeader}>
            <h4 style={styles.actionTitle}>📜 散布谣言</h4>
            <span style={styles.actionCost}>消耗：{rumorCost} 灵石</span>
          </div>
          <p style={styles.actionDesc}>
            通过地下渠道散布对楚清瑶不利的谣言，削弱她的名望和修为进度。
            <br />花费越多，效果越好，但威胁度也会提升。
          </p>
          <div style={styles.actionControls}>
            <input 
              type="range" 
              min="50" 
              max="150" 
              step="10"
              value={rumorCost}
              onChange={(e) => setRumorCost(Number(e.target.value))}
              style={styles.slider}
            />
            <button 
              style={styles.rumorBtn}
              onClick={handleSpreadRumor}
              disabled={player.resources.spiritStones < rumorCost}
            >
              散布谣言 ({rumorCost}灵石)
            </button>
          </div>
          <div style={styles.actionInfo}>
            成功率：{Math.min(90, 60 + rumorCost / 2)}% | 
            威胁度+{rumorCost >= 100 ? 25 : 10}
          </div>
        </div>

        {/* 隐匿行踪 */}
        <div style={styles.actionCard}>
          <div style={styles.actionHeader}>
            <h4 style={styles.actionTitle}>🌫️ 隐匿行踪</h4>
            <span style={styles.actionCost}>消耗：{hidingMonths * 30} 灵石</span>
          </div>
          <p style={styles.actionDesc}>
            躲避楚清瑶的搜捕，大幅降低威胁度。威胁度超过80%时必须使用！
          </p>
          <div style={styles.actionControls}>
            <select 
              value={hidingMonths} 
              onChange={(e) => setHidingMonths(Number(e.target.value))}
              style={styles.select}
            >
              <option value="1">1个月（-40%威胁）</option>
              <option value="2">2个月（-80%威胁）</option>
              <option value="3">3个月（-100%威胁）</option>
            </select>
            <button 
              style={styles.hideBtn}
              onClick={handleHide}
              disabled={player.resources.spiritStones < hidingMonths * 30}
            >
              隐匿行踪 ({hidingMonths * 30}灵石)
            </button>
          </div>
        </div>

        {/* 生死决斗 */}
        <div style={{...styles.actionCard, ...styles.finalDuelCard}}>
          <div style={styles.actionHeader}>
            <h4 style={styles.actionTitle}>⚔️ 生死决斗</h4>
            <span style={styles.actionWarning}>不可逆操作！</span>
          </div>
          <p style={styles.actionDesc}>
            向楚清瑶发起最终挑战。胜利将完成复仇，失败将重伤修为大损。
            <br />
            <strong>建议：</strong>至少达到筑基期，并通过谣言削弱对方后再挑战。
          </p>
          <div style={styles.powerComparison}>
            <div style={styles.powerItem}>
              <span>你的战力：</span>
              <span>{player.currentExp + (player.combatStats?.atk || 50) * 10}</span>
            </div>
            <div style={styles.powerItem}>
              <span>敌方战力：</span>
              <span>{Math.floor((rival.currentExp + 500) * (1 - rival.rumorCount * 0.05))}</span>
            </div>
          </div>
          <button 
            style={styles.duelBtn}
            onClick={handleDuel}
            disabled={!player.tier.includes("筑基") && !player.tier.includes("金丹")}
          >
            发起生死决斗
          </button>
          {(!player.tier.includes("筑基") && !player.tier.includes("金丹")) && (
            <div style={styles.actionWarningText}>
              ⚠️ 需要至少达到筑基期
            </div>
          )}
        </div>
      </div>

      {/* 操作结果提示 */}
      {showResult && (
        <div style={{
          ...styles.resultToast,
          backgroundColor: showResult.success ? '#4caf50' : '#f44336'
        }}>
          <p>{showResult.message}</p>
          {showResult.damage && <p>削弱修为：{showResult.damage}</p>}
          {showResult.threatIncrease && <p>威胁度提升：+{showResult.threatIncrease}%</p>}
          {showResult.threatReduction && <p>威胁度降低：-{showResult.threatReduction}%</p>}
        </div>
      )}
    </div>
  );
};

const styles = {
  panel: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    color: '#e0d5c7'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #8b4513',
    paddingBottom: '15px'
  },
  title: {
    color: '#ff6b6b',
    fontSize: '28px',
    marginBottom: '8px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  },
  subtitle: {
    color: '#ffd700',
    fontSize: '18px',
    fontStyle: 'italic'
  },
  rivalStatus: {
    background: 'linear-gradient(135deg, rgba(40, 20, 20, 0.8), rgba(60, 30, 30, 0.8))',
    border: '2px solid #8b4513',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  sectionTitle: {
    color: '#ffd700',
    marginBottom: '15px',
    fontSize: '20px'
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '15px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '6px'
  },
  statusLabel: {
    color: '#bbb',
    fontWeight: '500'
  },
  statusValue: {
    color: '#fff',
    fontWeight: 'bold'
  },
  threatBar: {
    width: '100%',
    height: '30px',
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '2px solid #666',
    marginTop: '15px',
    position: 'relative'
  },
  threatFill: {
    height: '100%',
    transition: 'width 0.5s ease, background-color 0.5s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
  },
  dangerWarning: {
    marginTop: '15px',
    padding: '12px',
    background: 'linear-gradient(90deg, #ff4444, #ff6b6b)',
    border: '2px solid #ff0000',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    boxShadow: '0 0 20px rgba(255, 68, 68, 0.6)'
  },
  actions: {
    marginTop: '30px'
  },
  actionCard: {
    background: 'linear-gradient(135deg, rgba(30, 30, 40, 0.9), rgba(50, 40, 60, 0.9))',
    border: '2px solid #8b4513',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
  },
  finalDuelCard: {
    background: 'linear-gradient(135deg, rgba(60, 20, 20, 0.9), rgba(80, 30, 30, 0.9))',
    borderColor: '#ff4444'
  },
  actionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    paddingBottom: '10px'
  },
  actionTitle: {
    color: '#ffd700',
    fontSize: '18px',
    margin: 0
  },
  actionCost: {
    color: '#66ff66',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  actionWarning: {
    color: '#ff6b6b',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  actionDesc: {
    color: '#ccc',
    lineHeight: '1.6',
    marginBottom: '15px',
    fontSize: '14px'
  },
  actionControls: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '10px'
  },
  slider: {
    flex: 1,
    height: '8px'
  },
  select: {
    flex: 1,
    padding: '10px',
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    border: '2px solid #8b4513',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  rumorBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6a5acd, #8b7ad8)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  },
  hideBtn: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #4a90e2, #5ba3f5)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  },
  duelBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ff4444, #ff6b6b)',
    color: 'white',
    fontSize: '16px',
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  },
  actionInfo: {
    color: '#aaa',
    fontSize: '12px',
    marginTop: '5px'
  },
  actionWarningText: {
    color: '#ff6b6b',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '10px',
    fontWeight: 'bold'
  },
  powerComparison: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    margin: '15px 0',
    padding: '15px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px'
  },
  powerItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    color: '#bbb',
    fontSize: '13px'
  },
  completed: {
    textAlign: 'center',
    padding: '60px 40px',
    background: 'linear-gradient(135deg, rgba(40, 80, 40, 0.8), rgba(60, 100, 60, 0.8))',
    border: '3px solid #4caf50',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  },
  resultToast: {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '20px 30px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: 9999,
    minWidth: '300px',
    maxWidth: '500px',
    color: 'white'
  }
};

export default RevengePanel;