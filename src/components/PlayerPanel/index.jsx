import React from 'react';
import { getRootConfigByValue, calculateCultivationSpeed } from '../../game/cultivationSystem.js';
import { getManualSpeedMultiplier } from '../../data/manualData.js';
import Avatar from '../Common/Avatar.jsx';

const PlayerPanel = ({ player, onOpenInventory }) => {
  // 获取灵根配置
  const rootConfig = getRootConfigByValue(player.stats.aptitude);
  
  // 计算修炼速度
  const cultivationSpeed = calculateCultivationSpeed(player, false);
  
  // 计算各项加成
  const aptitude = player.stats.aptitude || 50;
  const aptitudeMultiplier = (aptitude / 50).toFixed(2);
  const rootMultiplier = player.spiritRoot?.multiplier || 1;
  const traitMultiplier = player.trait?.effect || 1;
  const sectMultiplier = (player.sect && player.sect.level !== "NONE") ? 1.5 : 1;
  const manualMultiplier = player.cultivationMethod && player.spiritRoot 
    ? getManualSpeedMultiplier(player.cultivationMethod, player.spiritRoot)
    : 1;
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🧙‍♀️ 主角信息</h3>
      
      <div style={styles.content}>
        {/* 左侧：头像和基本信息 */}
        <div style={styles.leftSection}>
          <div style={styles.avatarContainer}>
            <Avatar dna={player.avatar} gender={player.gender} size={100} />
          </div>
          
          <div style={styles.basicInfo}>
            <h2>{player.name}</h2>
            <div style={styles.tierBadge}>{player.tier}</div>
            <div style={styles.infoRow}>
              <span>年龄:</span> <span>{player.age}岁</span>
            </div>
          </div>
        </div>
        
        {/* 右侧：详细属性 */}
        <div style={styles.rightSection}>
          {/* 灵根信息 */}
          <div style={styles.section}>
            <h4>🔮 灵根资质</h4>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
              <strong style={{color: rootConfig.color, fontSize:'16px'}}>{player.spiritRoot.type}</strong>
              <div style={{display:'flex', gap:'4px'}}>
                {player.spiritRoot.elements.map(el => {
                  const getElColor = (element) => {
                    const map = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#795548', '雷': '#673AB7', '冰': '#00BCD4', '风': '#009688' };
                    return map[element] || '#9e9e9e';
                  };
                  return (
                    <span key={el} style={{padding: '2px 6px', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '10px', background: getElColor(el)}}>
                      {el}
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div style={styles.barContainer}>
              <span>资质 ({player.stats.aptitude})</span>
              <div style={styles.barBg}>
                <div style={{
                  ...styles.barFill,
                  width: `${player.stats.aptitude}%`,
                  background: rootConfig.color
                }}></div>
              </div>
            </div>
            
            <p style={{fontSize:'12px', color:'#666', marginTop:'5px'}}>{player.spiritRoot.desc}</p>
          </div>
          
          {/* 修为信息 */}
          <div style={styles.section}>
            <h4>💫 修为境界</h4>
            <div style={styles.barContainer}>
              <span>修为 ({player.currentExp}/{player.maxExp})</span>
              <div style={styles.barBg}>
                <div style={{
                  ...styles.barFill,
                  width: `${(player.currentExp / player.maxExp) * 100}%`,
                  background: '#4CAF50'
                }}></div>
              </div>
            </div>
            
            {/* 修炼速度说明 */}
            <div style={styles.speedInfo}>
              <div style={styles.speedHeader}>
                <span style={{fontWeight: 'bold', color: '#4CAF50'}}>⚡ 修炼速度: {cultivationSpeed}/回合</span>
              </div>
              <div style={styles.speedFormula}>
                <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>
                  计算公式: 基础(10) × 资质 × 灵根 × 功法 × 词条 × 宗门
                </div>
                <div style={styles.speedBreakdown}>
                  <span style={styles.speedItem}>
                    <span style={{color: '#888'}}>资质:</span> ×{aptitudeMultiplier}
                  </span>
                  <span style={styles.speedItem}>
                    <span style={{color: '#888'}}>灵根:</span> ×{rootMultiplier}
                  </span>
                  <span style={styles.speedItem}>
                    <span style={{color: '#888'}}>功法:</span> ×{manualMultiplier.toFixed(2)}
                  </span>
                  <span style={styles.speedItem}>
                    <span style={{color: '#888'}}>词条:</span> ×{traitMultiplier}
                  </span>
                  <span style={styles.speedItem}>
                    <span style={{color: '#888'}}>宗门:</span> ×{sectMultiplier}
                  </span>
                </div>
                <div style={{fontSize: '10px', color: '#999', marginTop: '4px', fontStyle: 'italic'}}>
                  = 10 × {aptitudeMultiplier} × {rootMultiplier} × {manualMultiplier.toFixed(2)} × {traitMultiplier} × {sectMultiplier} = {cultivationSpeed}
                </div>
              </div>
            </div>
          </div>
          
          {/* 基础属性 */}
          <div style={styles.section}>
            <h4>📊 基础属性</h4>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statLabel}>容貌</div>
                <div style={styles.statValue}>{player.stats.looks}</div>
                <div style={styles.statBar}>
                  <div style={{
                    ...styles.statBarFill,
                    width: `${player.stats.looks}%`,
                    background: '#FF6B6B'
                  }}></div>
                </div>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statLabel}>心机</div>
                <div style={styles.statValue}>{player.stats.cunning}</div>
                <div style={styles.statBar}>
                  <div style={{
                    ...styles.statBarFill,
                    width: `${player.stats.cunning}%`,
                    background: '#4ECDC4'
                  }}></div>
                </div>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statLabel}>健康</div>
                <div style={styles.statValue}>{player.stats.health}</div>
                <div style={styles.statBar}>
                  <div style={{
                    ...styles.statBarFill,
                    width: `${player.stats.health}%`,
                    background: '#45B7D1'
                  }}></div>
                </div>
              </div>
              
              <div style={styles.statItem}>
                <div style={styles.statLabel}>悟性</div>
                <div style={styles.statValue}>{player.stats.intelligence}</div>
                <div style={styles.statBar}>
                  <div style={{
                    ...styles.statBarFill,
                    width: `${player.stats.intelligence}%`,
                    background: '#96CEB4'
                  }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 资源信息 */}
          <div style={styles.section}>
            <h4>💰 资源</h4>
            <div style={styles.resourcesGrid}>
              <div style={styles.resourceItem}>
                <span>灵石:</span> <span style={{fontWeight:'bold'}}>{player.resources.spiritStones}</span>
              </div>
              <div style={styles.resourceItem}>
                <span>银两:</span> <span style={{fontWeight:'bold'}}>{player.resources.money}</span>
              </div>
            </div>
            <div style={{marginTop: '10px', textAlign: 'center'}}>
              <button 
                onClick={onOpenInventory}
                style={styles.inventoryBtn}
              >
                📦 打开背包
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    fontFamily: 'Microsoft YaHei, sans-serif'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#3e2723',
    textAlign: 'center',
    borderBottom: '1px dashed #e0e0e0',
    paddingBottom: '10px'
  },
  content: {
    display: 'flex',
    gap: '20px'
  },
  leftSection: {
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  avatarContainer: {
    marginBottom: '10px'
  },
  basicInfo: {
    textAlign: 'center'
  },
  tierBadge: {
    display: 'inline-block',
    backgroundColor: '#3e2723',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    margin: '5px 0'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    fontSize: '14px',
    margin: '5px 0'
  },
  rightSection: {
    flex: 1
  },
  section: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px'
  },
  barContainer: {
    marginBottom: '10px'
  },
  barBg: {
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '5px'
  },
  barFill: {
    height: '100%',
    transition: 'width 0.3s ease-in-out'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  statItem: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
  },
  statBar: {
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  statBarFill: {
    height: '100%',
    transition: 'width 0.3s ease-in-out'
  },
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  resourceItem: {
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between'
  },
  inventoryBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  },
  speedInfo: {
    marginTop: '12px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #e0e0e0'
  },
  speedHeader: {
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '1px dashed #e0e0e0'
  },
  speedFormula: {
    fontSize: '12px'
  },
  speedBreakdown: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '6px',
    marginBottom: '4px'
  },
  speedItem: {
    fontSize: '11px',
    padding: '2px 6px',
    backgroundColor: '#f5f5f5',
    borderRadius: '3px',
    border: '1px solid #e0e0e0'
  }
};

export default PlayerPanel;