import React, { useState } from 'react';
import { getRandomEvent } from '../../data/eventLibrary.js'; // 引入库
import { getTraitByValue } from '../../game/traitSystem.js';
import TraitTag from '../Common/TraitTag.jsx';
import Avatar from '../Common/Avatar.jsx';
import ChatInterface from '../ChatInterface'; // 引入聊天组件
import { 
  calculateRemainingLifespan, 
  getRelationshipStatus, 
  getRelationshipStatusDisplay 
} from '../../game/npcLifecycle.js'; // 引入生命周期系统

const NpcDetailModal = ({ npc, onClose, onOptionSelect, player, children = [], npcs = [], onViewLog }) => {
  // 当前随机到的剧情事件
  const [currentEvent, setCurrentEvent] = useState(null);
  // 视图模式：'INFO' 或 'CHAT'
  const [viewMode, setViewMode] = useState('INFO');
  
  // 构建游戏状态对象
  const gameState = {
    children: children,
    npcs: npcs,
    // 可以添加更多游戏状态信息
  };

  // 辅助组件：属性条
  const AttributeRow = ({ label, value, max=100, color }) => (
    <div style={{display:'flex', alignItems:'center', marginBottom:'5px', fontSize:'12px'}}>
      <span style={{width:'30px', color:'#666'}}>{label}</span>
      <div style={{flex:1, height:'6px', background:'#eee', borderRadius:'3px', margin:'0 8px'}}>
        <div style={{width:`${Math.min(100, (value/max)*100)}%`, background:color, height:'100%', borderRadius:'3px'}}></div>
      </div>
      <span style={{width:'25px', textAlign:'right', fontWeight:'bold'}}>{value}</span>
    </div>
  );

  // 触发剧情逻辑
  const triggerEvent = () => {
    // 使用新的函数抽取事件
    const event = getRandomEvent(npc, player);
    
    if (event) {
      setCurrentEvent(event);
    } else {
      // 如果没有合适事件，给个默认文本
      setCurrentEvent({
        text: `${npc.name} 正在闭关修炼，暂时不愿见客。`,
        options: [
          { label: "离开", result: "neutral", msg: "你转身离开。", change: {} }
        ]
      });
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>×</button>
        
        {/* 模式切换栏 */}
        <div style={styles.tabBar}>
          <button 
            onClick={() => setViewMode('INFO')} 
            style={{
              ...styles.tab, 
              background: viewMode === 'INFO' ? 'linear-gradient(135deg, #4e6a5d 0%, #3d5549 100%)' : '#f5f5f5',
              color: viewMode === 'INFO' ? '#fff' : '#333',
              fontWeight: viewMode === 'INFO' ? 'bold' : 'normal'
            }}
          >
            📊 详细属性
          </button>
          <button 
            onClick={() => setViewMode('CHAT')} 
            style={{
              ...styles.tab, 
              background: viewMode === 'CHAT' ? 'linear-gradient(135deg, #4e6a5d 0%, #3d5549 100%)' : '#f5f5f5',
              color: viewMode === 'CHAT' ? '#fff' : '#333',
              fontWeight: viewMode === 'CHAT' ? 'bold' : 'normal'
            }}
          >
            💬 传音对话
          </button>
        </div>
        
        <div style={styles.content}>
          {viewMode === 'INFO' ? (
            // 属性面板视图
            <div style={styles.leftCol}>
              {/* 头像与基本信息 */}
              <div style={{marginBottom: '15px'}}>
                <Avatar dna={npc.avatar} gender={npc.gender} size={120} />
              </div>
              <div style={styles.nameBlock}>
                <h2 style={{margin:'10px 0 5px'}}>{npc.name}</h2>
                <span style={styles.identityTag}>{npc.identity}</span>
                {npc.constitution && <span style={styles.rareTag}>{npc.constitution.name}</span>}
                
                {/* 宗门信息显示 */}
                {npc.sect && npc.sectStatus !== 'mysterious' && npc.sectStatus !== 'rogue' && (
                  <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    <span style={{
                      ...styles.identityTag,
                      background: npc.sectStatus === 'defected' ? 'linear-gradient(135deg, #e53935 0%, #c62828 100%)' :
                                 npc.sectStatus === 'hidden' ? 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)' :
                                 npc.sect.level === 'TOP' ? 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)' :
                                 npc.sect.level === 'HIGH' ? 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)' :
                                 npc.sect.level === 'RECKLESS' ? 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)' :
                                 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                      fontSize: '11px'
                    }}>
                      {npc.sectStatus === 'defected' ? '⚠️ 叛徒' : 
                       npc.sectStatus === 'hidden' ? '🎭 隐秘' : '🏛️'} 
                      【{npc.sect.name}】{npc.sectRank}
                    </span>
                  </div>
                )}
                {npc.sectStatus === 'mysterious' && (
                  <span style={{
                    ...styles.identityTag,
                    background: 'linear-gradient(135deg, #616161 0%, #424242 100%)',
                    fontSize: '11px'
                  }}>
                    🔮 来历神秘
                  </span>
                )}
                {npc.sectStatus === 'rogue' && (
                  <span style={{
                    ...styles.identityTag,
                    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
                    fontSize: '11px'
                  }}>
                    🗡️ 散修
                  </span>
                )}
              </div>

              <p style={styles.desc}>"{npc.desc || npc.appearance || '暂无描述'}"</p>
            
            {/* --- 新增：核心六维属性图 (这里用文字模拟条形图) --- */}
            <div style={styles.attrBox}>
              <h4>🧬 天赋品鉴</h4>

              <div style={{marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
                <span style={{fontSize: '12px', width: '40px'}}>容貌:</span>
                <TraitTag trait={getTraitByValue(npc.stats.looks, 'LOOKS', '男')} />
              </div>

              <div style={{marginBottom: '8px', display: 'flex', alignItems: 'center'}}>
                <span style={{fontSize: '12px', width: '40px'}}>悟性:</span>
                <TraitTag trait={getTraitByValue(npc.stats.intelligence, 'INT')} />
              </div>

              {/* 灵根单独处理，因为格式不同 */}
              {npc.spiritRoot && (
                <div style={{marginBottom: '8px'}}>
                  <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                    <span style={{fontSize: '12px', width: '40px'}}>灵根:</span>
                    <span style={{fontSize: '12px', fontWeight: 'bold', color: npc.spiritRoot.color || '#d81b60'}}>
                      {npc.spiritRoot.type}
                    </span>
                  </div>
                  {npc.spiritRoot.elements && (
                    <div style={{display: 'flex', alignItems: 'center', marginLeft: '40px'}}>
                      <div style={{display: 'flex', gap: '4px'}}>
                        {npc.spiritRoot.elements.map(el => {
                          const getElementColor = (element) => {
                            const map = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#795548', '雷': '#673AB7', '冰': '#00BCD4', '风': '#009688' };
                            return map[element] || '#ccc';
                          };
                          return (
                            <span key={el} style={{padding: '2px 6px', borderRadius: '10px', color: 'white', fontWeight: 'bold', fontSize: '10px', background: getElementColor(el)}}>
                              {el}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div style={{display: 'flex', alignItems: 'center', marginLeft: '40px', marginTop: '4px'}}>
                    <span style={{fontSize: '11px', color: '#666'}}>
                      资质: {npc.stats?.aptitude} ({npc.stats?.aptitude >= 80 ? '极品' : '尚可'})
                    </span>
                  </div>
                  {npc.spiritRoot.desc && (
                    <div style={{marginLeft: '40px', marginTop: '2px'}}>
                      <span style={{fontSize: '11px', color: '#666'}}>
                        {npc.spiritRoot.desc}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={styles.attrBox}>
              <h4>❤️ 情感状态</h4>
              <AttributeRow label="好感" value={npc.relationship?.affection || 0} max={100} color="#f50057" />
              <AttributeRow label="信任" value={npc.relationship?.trust || 0} max={100} color="#00e5ff" />
              
              {/* 关系状态显示 */}
              {(() => {
                const affection = npc.relationship?.affection || 0;
                const status = getRelationshipStatus(affection);
                const display = getRelationshipStatusDisplay(status);
                return (
                  <div style={{marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontSize: '12px', color: '#666'}}>关系:</span>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: display.color
                    }}>
                      {display.icon} {display.text}
                    </span>
                  </div>
                );
              })()}
              
              {/* 醋意值显示 */}
              {(() => {
                const jealousy = npc.jealousy || 0;
                const getJealousyColor = (value) => {
                  if (value >= 81) return '#d32f2f'; // 修罗场 - 深红
                  if (value >= 61) return '#f44336'; // 大醋 - 红色
                  if (value >= 41) return '#ff9800'; // 中醋 - 橙色
                  if (value >= 21) return '#ffc107'; // 微醋 - 黄色
                  return '#4caf50'; // 无醋 - 绿色
                };
                
                const getJealousyLabel = (value) => {
                  if (value >= 81) return '修罗场';
                  if (value >= 61) return '大醋';
                  if (value >= 41) return '中醋';
                  if (value >= 21) return '微醋';
                  return '平静';
                };
                
                return (
                  <div style={{marginTop: '8px'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                      <span style={{fontSize: '12px', color: '#666'}}>醋意:</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: getJealousyColor(jealousy)
                      }}>
                        {getJealousyLabel(jealousy)} ({jealousy})
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${jealousy}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${getJealousyColor(jealousy)}, ${getJealousyColor(jealousy)}dd)`,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease, background 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 生命状态 */}
            <div style={styles.attrBox}>
              <h4>⏳ 生命状态</h4>
              <div style={{fontSize: '12px', color: '#666', lineHeight: '1.6'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <span>当前年龄:</span>
                  <span style={{fontWeight: 'bold'}}>{Math.floor(npc.age || 18)} 岁</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <span>基础寿元:</span>
                  <span style={{fontWeight: 'bold'}}>{npc.stats?.lifespan || 100} 年</span>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <span>剩余寿元:</span>
                  <span style={{
                    fontWeight: 'bold',
                    color: (() => {
                      const remaining = calculateRemainingLifespan(npc);
                      if (remaining < 10) return '#f44336';
                      if (remaining < 30) return '#ff9800';
                      return '#4caf50';
                    })()
                  }}>
                    {calculateRemainingLifespan(npc)} 年
                  </span>
                </div>
                {calculateRemainingLifespan(npc) < 10 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: 'rgba(244, 67, 54, 0.1)',
                    borderRadius: '4px',
                    color: '#f44336',
                    fontSize: '11px'
                  }}>
                    ⚠️ 寿元将尽，请尽快助其突破延寿！
                  </div>
                )}
              </div>
            </div>

            {/* 修为进度 */}
            {npc.tier && (
              <div style={styles.attrBox}>
                <h4>⚡ 修为进度</h4>
                <div style={{fontSize: '12px', marginBottom: '8px'}}>
                  <span style={{color: '#666'}}>当前境界: </span>
                  <span style={{fontWeight: 'bold', color: '#9c27b0'}}>{npc.tier || '凡人'}</span>
                </div>
                {npc.currentExp !== undefined && npc.maxExp && (
                  <div>
                    {/* 修为进度条 */}
                    <div style={{marginBottom: '4px'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span style={{fontSize: '11px', color: '#666'}}>修为进度</span>
                        <span style={{fontSize: '11px', color: '#666', fontWeight: 'bold'}}>
                          {Math.floor((npc.currentExp / npc.maxExp) * 100)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '14px',
                        background: 'linear-gradient(to right, #f0f0f0, #e0e0e0)',
                        borderRadius: '7px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${Math.min(100, (npc.currentExp / npc.maxExp) * 100)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #9c27b0 0%, #d05ce3 100%)',
                          borderRadius: '7px',
                          transition: 'width 0.3s ease',
                          boxShadow: '0 0 10px rgba(156, 39, 176, 0.5)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          {/* 闪光效果 */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            animation: 'shimmer 2s infinite'
                          }}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 经验数值 */}
                    <div style={{fontSize: '11px', color: '#666', textAlign: 'right', marginTop: '2px'}}>
                      {npc.currentExp || 0} / {npc.maxExp || 100}
                    </div>
                    
                    {/* 修炼速度显示 */}
                    {npc.cultivationSpeed && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 10px',
                        background: 'rgba(156, 39, 176, 0.05)',
                        borderRadius: '6px',
                        border: '1px solid rgba(156, 39, 176, 0.1)'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                          <span style={{fontSize: '11px', color: '#666'}}>修炼速度:</span>
                          <span style={{fontSize: '11px', fontWeight: 'bold', color: '#9c27b0'}}>
                            {Math.floor(npc.cultivationSpeed)} 经验/月
                          </span>
                        </div>
                        {(() => {
                          const remainingExp = npc.maxExp - npc.currentExp;
                          const monthsToBreakthrough = Math.ceil(remainingExp / npc.cultivationSpeed);
                          return (
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{fontSize: '11px', color: '#666'}}>预计突破:</span>
                              <span style={{fontSize: '11px', fontWeight: 'bold', color: monthsToBreakthrough > 12 ? '#ff9800' : '#4caf50'}}>
                                {monthsToBreakthrough > 12 ? `约${Math.floor(monthsToBreakthrough/12)}年` : `${monthsToBreakthrough}个月`}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    
                    {/* 好感度修炼加成提示 */}
                    {(() => {
                      const affection = npc.relationship?.affection || 0;
                      let bonus = 0;
                      let bonusText = '';
                      
                      if (affection >= 80) {
                        bonus = 50;
                        bonusText = '情深意重';
                      } else if (affection >= 60) {
                        bonus = 30;
                        bonusText = '深度亲密';
                      } else if (affection >= 40) {
                        bonus = 20;
                        bonusText = '好感相关';
                      } else if (affection >= 20) {
                        bonus = 10;
                        bonusText = '初步关注';
                      }
                      
                      if (bonus > 0) {
                        return (
                          <div style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            background: 'linear-gradient(135deg, rgba(244, 81, 108, 0.1), rgba(240, 98, 146, 0.1))',
                            borderRadius: '6px',
                            border: '1px solid rgba(244, 81, 108, 0.2)',
                            fontSize: '11px',
                            color: '#f4516c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>💕 {bonusText}加成</span>
                            <span style={{fontWeight: 'bold'}}>+{bonus}% 修炼速度</span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            )}

            <div style={styles.personalityBox}>
              <span>性格标签：</span>
              {typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality ? (
                <span style={styles.tag}>{npc.personality.label} ({npc.personality.desc})</span>
              ) : Array.isArray(npc.personality) ? (
                <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                  {npc.personality.map((trait, idx) => (
                    <span key={idx} style={styles.tag}>{trait}</span>
                  ))}
                </div>
              ) : (
                <span style={styles.tag}>未知</span>
              )}
            </div>

            {/* 查看日志按钮 */}
            {onViewLog && (
              <button 
                onClick={() => onViewLog(npc)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '15px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                📖 查看{npc.name}的日志
              </button>
            )}
          </div>
          ) : viewMode === 'CHAT' ? (
            // 聊天视图
            <div style={{width: '100%', padding: '20px'}}>
              {(() => {
                const apiKey = localStorage.getItem('game_api_key');
                const apiUrl = localStorage.getItem('game_api_url');
                
                if (!apiKey || !apiUrl) {
                  return (
                    <div style={styles.noApiHint}>
                      <div style={{fontSize: '48px', marginBottom: '20px'}}>🔮</div>
                      <h3>传音功能未激活</h3>
                      <p>请先在【系统设置】中配置 AI API 才能与 {npc.name} 进行智能对话。</p>
                      <div style={{marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6'}}>
                        <strong>配置指引：</strong><br/>
                        1. 点击底部导航栏的【系统】按钮<br/>
                        2. 在【AI 对话配置】中填写 API Key 和 URL<br/>
                        3. 推荐使用 DeepSeek（便宜且擅长中文角色扮演）<br/>
                        4. 点击【测试连接】确保配置正确<br/>
                        5. 保存后即可返回此处与 NPC 对话
                      </div>
                    </div>
                  );
                }
                
                return (
                  <ChatInterface 
                    npc={npc} 
                    player={player} 
                    apiKey={apiKey}
                    apiUrl={apiUrl}
                    gameState={gameState}
                  />
                );
              })()}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// 样式表
const styles = {
  overlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 1000,
    backdropFilter: 'blur(2px)' // 背景模糊效果
  },
  modal: { 
    width: '90%', // 更宽的弹窗，适合手机
    maxWidth: '600px',
    height: '80vh', // 更高的弹窗，适合手机
    backgroundColor: '#f5f0e8', // 古色古香的背景色
    borderRadius: '16px', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column', 
    position: 'relative', 
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    border: '2px solid #d7ccc8' // 古色边框
  },
  closeBtn: { 
    position: 'absolute', 
    top: '10px', 
    right: '10px', 
    border: 'none', 
    background: 'rgba(141, 110, 99, 0.2)', 
    fontSize: '28px', 
    cursor: 'pointer', 
    color: '#8d6e63',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 10
  },
  content: { 
    display: 'flex', 
    flex: 1, 
    height: 'calc(100% - 40px)', 
    overflow: 'hidden'
  },
  leftCol: { 
    width: '100%', // 全屏宽度，因为右侧已经删除
    backgroundColor: '#faf8f5', // 浅色背景
    padding: '25px', 
    display: 'flex', 
    flexDirection: 'column',
    overflowY: 'auto'
  },
  avatarBig: { fontSize: '80px', alignSelf: 'center', marginBottom: '10px' },
  subTitle: { fontSize: '14px', color: '#795548', fontWeight: 'normal' },
  desc: { 
    fontSize: '14px', 
    color: '#5d4037', // 深棕色文字
    fontStyle: 'italic', 
    marginBottom: '20px', 
    lineHeight: '1.8',
    padding: '15px',
    background: '#f5f0e8', // 背景色
    borderRadius: '10px',
    border: '1px solid #e0e0e0', // 边框
    fontFamily: 'Microsoft YaHei, SimSun, serif' // 中文字体
  },
  tags: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  tag: { 
    fontSize: '13px', 
    background: 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 100%)', // 渐变背景
    padding: '4px 12px', 
    borderRadius: '15px', 
    color: '#3e2723',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // 柔和阴影
  },
  statsBox: { marginBottom: '20px' },
  statRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' },
  barBg: { flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s' },
  likesBox: { marginTop: 'auto', padding: '15px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px', fontSize: '13px', border: '1px solid #e0e0e0' },
  identityTag: { 
    background: 'linear-gradient(135deg, #795548 0%, #5d4037 100%)', 
    color:'white', 
    padding:'4px 10px', 
    borderRadius:'8px', 
    fontSize:'11px', 
    marginRight:'8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // 柔和阴影
  },
  rareTag: { 
    background: 'linear-gradient(45deg, #FFD700, #FFA500)', 
    color:'white', 
    padding:'4px 10px', 
    borderRadius:'8px', 
    fontSize:'11px', 
    marginLeft:'5px', 
    fontWeight:'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // 柔和阴影
  },
  attrBox: { 
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)', // 渐变背景
    padding:'18px', 
    borderRadius:'12px', 
    marginBottom:'20px',
    border: '1px solid #e0e0e0', // 边框
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' // 柔和阴影
  },
  personalityBox: { 
    marginTop: 'auto', 
    padding: '15px', 
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)', // 渐变背景
    borderRadius: '12px', 
    fontSize: '13px',
    border: '1px solid #e0e0e0', // 边框
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' // 柔和阴影
  },
  tabBar: {
    display: 'flex',
    borderBottom: '2px solid #d7ccc8',
    background: 'linear-gradient(180deg, #f5f0e8 0%, #ebe6dd 100%)',
  },
  tab: {
    flex: 1,
    padding: '15px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    borderRadius: '0',
  },
  noApiHint: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '40px',
    color: '#5d4037',
  }
};

export default NpcDetailModal;