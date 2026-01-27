import React from 'react';
import { getRootConfigByValue, calculateCultivationSpeed } from '../../game/cultivationSystem.js';
import { getManualSpeedMultiplier } from '../../data/manualData.js';
import Avatar from '../Common/Avatar.jsx';

const PlayerPanel = ({ player, childFeedback = 0, onOpenInventory, onAllocateSkillPoint }) => {
  // 获取灵根配置
  const rootConfig = getRootConfigByValue(player.stats.aptitude);
  
  // 计算修炼速度（按月）
  const cultivationSpeed = calculateCultivationSpeed(player, true);
  
  // 总修炼速度 = 自身修炼速度 + 子嗣反馈
  const totalSpeed = cultivationSpeed + childFeedback;
  
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
              <span>年龄:</span> <span>{Math.floor(player.age)}岁</span>
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
                <span style={{fontWeight: 'bold', color: '#4CAF50'}}>⚡ 修炼速度: {totalSpeed}/月</span>
                {childFeedback > 0 && (
                  <span style={{fontSize: '12px', color: '#666', marginLeft: '8px'}}>
                    (自身 {cultivationSpeed} + 子嗣反哺 {childFeedback})
                  </span>
                )}
              </div>
              <div style={styles.speedFormula}>
                <div style={{fontSize: '11px', color: '#666', marginBottom: '4px'}}>
                  自身修炼: 基础(10/月) × 资质 × 灵根 × 功法 × 词条 × 宗门
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
                {childFeedback > 0 && (
                  <div style={{fontSize: '11px', color: '#4CAF50', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #ddd'}}>
                    👶 子嗣反哺: +{childFeedback}/月
                  </div>
                )}
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
                <span>技能点:</span> 
                <span style={{fontWeight:'bold', color: '#FF9800'}}>{player.skillPoints || 0}</span>
              </div>
            </div>
            
            {/* 技能点分配 */}
            {(player.skillPoints || 0) > 0 && (
              <div style={{marginTop: '10px', padding: '10px', background: '#FFF3E0', borderRadius: '8px', border: '1px solid #FFB74D'}}>
                <div style={{fontSize: '12px', color: '#E65100', marginBottom: '8px'}}>
                  💡 可分配技能点: {player.skillPoints}
                </div>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button 
                    onClick={() => onAllocateSkillPoint && onAllocateSkillPoint('aptitude')}
                    style={{...styles.allocateBtn, background: '#9C27B0'}}
                  >
                    +资质
                  </button>
                  <button 
                    onClick={() => onAllocateSkillPoint && onAllocateSkillPoint('combatPower')}
                    style={{...styles.allocateBtn, background: '#F44336'}}
                  >
                    +战力
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div style={styles.section}>
            <h4>📦 背包</h4>
            <button onClick={onOpenInventory} style={styles.inventoryBtn}>
              查看背包
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '20px',
    color: 'white',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    marginBottom: '20px'
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  content: {
    display: 'flex',
    gap: '20px'
  },
  leftSection: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  avatarContainer: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    padding: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  basicInfo: {
    textAlign: 'center'
  },
  tierBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    marginTop: '8px',
    display: 'inline-block',
    border: '1px solid rgba(255,255,255,0.3)'
  },
  infoRow: {
    marginTop: '8px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px'
  },
  section: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '15px',
    backdropFilter: 'blur(10px)'
  },
  barContainer: {
    marginBottom: '10px'
  },
  barBg: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '10px',
    height: '20px',
    marginTop: '5px',
    overflow: 'hidden',
    position: 'relative'
  },
  barFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  speedInfo: {
    marginTop: '10px',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '12px'
  },
  speedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  speedDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '11px',
    opacity: 0.9
  },
  speedRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  },
  statItem: {
    display: 'grid',
    gridTemplateColumns: '60px 40px 1fr',
    gap: '8px',
    alignItems: 'center'
  },
  statLabel: {
    fontSize: '14px'
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  statBar: {
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '10px',
    height: '16px',
    overflow: 'hidden'
  },
  statBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease'
  },
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  resourceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px'
  },
  allocateBtn: {
    flex: 1,
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  inventoryBtn: {
    width: '100%',
    padding: '10px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s'
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    border: '1px solid rgba(255,255,255,0.2)'
  }
};

export default PlayerPanel;