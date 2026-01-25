import React, { useState } from 'react';
import { getRandomEvent } from '../../data/eventLibrary.js'; // 引入库
import { getTraitByValue } from '../../game/traitSystem.js';
import TraitTag from '../Common/TraitTag.jsx';
import Avatar from '../Common/Avatar.jsx';
import ChatInterface from '../ChatInterface'; // 引入聊天组件

const NpcDetailModal = ({ npc, onClose, onOptionSelect, player }) => {
  // 当前随机到的剧情事件
  const [currentEvent, setCurrentEvent] = useState(null);
  // 视图模式：'INFO' 或 'CHAT'
  const [viewMode, setViewMode] = useState('INFO');

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
            </div>

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
          </div>
          ) : (
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
                  />
                );
              })()}
            </div>
          )}
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
    top: '15px', 
    right: '20px', 
    border: 'none', 
    background: 'transparent', 
    fontSize: '28px', 
    cursor: 'pointer', 
    color: '#8d6e63', // 古色文字
    transition: 'color 0.3s ease',
    ':hover': {
      color: '#6d4c41' // 鼠标悬停时颜色加深
    }
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