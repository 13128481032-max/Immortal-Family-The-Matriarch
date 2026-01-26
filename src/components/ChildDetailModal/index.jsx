import React, { useState } from 'react';
import { getTraitByValue } from '../../game/traitSystem.js';
import { getRootConfigByValue } from '../../game/cultivationSystem.js';
import TraitTag from '../Common/TraitTag.jsx';
import Avatar from '../Common/Avatar.jsx';
import ManualSection from './ManualSection.jsx';

const ChildDetailModal = ({ child, onClose, onAction }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(child.name);

  // 辅助：获取灵根颜色
  const getElColor = (el) => {
    const map = { '金': '#FFD700', '木': '#4CAF50', '水': '#2196F3', '火': '#F44336', '土': '#795548', '雷': '#673AB7', '冰': '#00BCD4', '风': '#009688' };
    return map[el] || '#9e9e9e';
  };

  // 辅助：稀有度颜色
  const getRarityColor = (rarity) => {
    const map = { 'WHITE': '#9e9e9e', 'GREEN': '#4caf50', 'BLUE': '#2196f3', 'PURPLE': '#9c27b0', 'ORANGE': '#ff9800', 'RED': '#f44336' };
    return map[rarity] || '#333';
  };

  const handleSaveName = () => {
    onAction('RENAME', newName);
    setIsRenaming(false);
  };

  const ageMonths = Math.floor(child.age * 12);
  const hasTestedRoot = child.isTested && ageMonths >= 72 && !!child.spiritRoot;

  // 获取灵根配置（添加安全检查）
  const aptitude = child.stats?.aptitude || 0;
  const rootConfig = getRootConfigByValue(aptitude);
  
  // 计算属性百分比（用于进度条视觉）
  const aptitudePercent = Math.min(100, aptitude);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>×</button>

        <div style={styles.content}>
          {/* 单栏展示 */}
          <div style={styles.singleCol}>
            {/* 头部：头像和基本信息 */}
            <div style={{display:'flex', gap:'20px', alignItems:'center', marginBottom:'20px', paddingBottom:'15px', borderBottom:'1px dashed #e0e0e0'}}>
              <div style={{marginBottom: '15px'}}>
                {child.age < 15 ? (
                  <div style={{fontSize: '48px'}}>👶</div>
                ) : (
                  <Avatar dna={child.avatar} gender={child.gender} size={100} />
                )}
              </div>

              {/* 名字与改名 */}
              <div style={styles.nameBox}>
                {isRenaming ? (
                  <div style={{display:'flex', gap:'5px'}}>
                    <input value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input} />
                    <button onClick={handleSaveName} style={styles.smallBtn}>✅</button>
                  </div>
                ) : (
                  <h2 style={{margin:0}}>
                    {child.name}
                    <span onClick={()=>setIsRenaming(true)} style={styles.editIcon}>✏️</span>
                  </h2>
                )}
                <div style={styles.tierBadge}>{child.tierTitle || "凡人"}</div>

                <div style={{marginTop:'10px', fontSize:'13px', color:'#555'}}>
                  <div style={{display:'flex', gap:'15px', marginBottom:'5px'}}>
                    <div>🎂 {Math.floor(child.age)}岁{Math.floor((child.age % 1) * 12)}个月</div>
                    <div>👨 {child.fatherName}</div>
                    <div>⚧️ {child.gender}</div>
                  </div>

                  {/* 抓周词条 */}
                  {child.trait && (
                    <div style={{...styles.traitBox, borderColor: getRarityColor(child.trait.rarity), marginTop:'5px', display:'inline-block'}}>
                      <span style={{color: getRarityColor(child.trait.rarity), fontWeight:'bold'}}>{child.trait.name}</span>
                      <p style={{margin:'5px 0 0', fontSize:'10px', color:'#666'}}>{child.trait.desc}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 1. 配偶信息 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>❤ 配偶信息</h4>
              {child.spouse ? (
                <div style={styles.spouseCard}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                    <div style={styles.miniAvatar}>{child.spouse.gender === '女' ? '👩' : '👨'}</div>
                    <div>
                      <div style={{fontWeight:'bold', color:'#e91e63'}}>{child.spouse.name}</div>
                      <div style={{fontSize:'12px', color:'#666'}}>{child.spouse.gender === '男' ? '♂ 男' : '♀ 女'}</div>
                      <div style={{fontSize:'12px'}}>{child.spouse.tierTitle || '凡人'}</div>
                    </div>
                  </div>
                  
                  {/* 配偶属性简略 */}
                  <div style={{marginTop:'8px', fontSize:'13px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                    <div>资质: <span style={{color:'purple'}}>{child.spouse.stats?.aptitude || child.spouse.aptitude}</span></div>
                    <div>容貌: {child.spouse.stats?.looks || child.spouse.looks}</div>
                    <div>悟性: {child.spouse.stats?.intelligence || child.spouse.intelligence}</div>
                    <div style={{gridColumn:'span 3', color:'#d81b60'}}>
                      {child.spouse.spiritRoot?.type} {child.spouse.spiritRoot?.elements?.join(', ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{color:'#999', fontSize:'12px', textAlign:'center', padding:'15px', background:'#f5f5f5', borderRadius:'8px'}}>
                  尚未婚配
                  <br/>
                  <button style={styles.marryBtn} onClick={() => onAction('MARRY')}>💍 安排婚事</button>
                </div>
              )}
            </div>

            {/* 2. 灵根资质 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>🔮 灵根资质</h4>
              {hasTestedRoot ? (
                <>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                    <strong style={{fontSize:'16px'}}>{child.spiritRoot.type}</strong>
                    <div style={{display:'flex', gap:'4px'}}>
                      {child.spiritRoot.elements.map(el => (
                        <span key={el} style={{...styles.elBadge, background: getElColor(el)}}>{el}</span>
                      ))}
                    </div>
                  </div>
                  <div style={styles.barContainer}>
                    <span>资质 ({aptitude})</span>
                    <div style={styles.barBg}>
                      <div style={{
                        ...styles.barFill,
                        width: `${aptitudePercent}%`,
                        background: rootConfig.color // 动态调用配置里的颜色 (金/紫/蓝/绿/灰)
                      }}></div>
                    </div>
                  </div>
                  <p style={{fontSize:'12px', color:'#666', marginTop:'5px'}}>{child.spiritRoot.desc}</p>
                </>
              ) : (
                <p style={{color:'#999', fontStyle:'italic'}}>
                  尚且年幼，骨骼未成（6岁触发测灵后再显示）
                </p>
              )}
            </div>

            {/* 2.5 装备槽 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>🧰 装备</h4>
              <div style={styles.equipGrid}>
                {['weapon','armor','accessory'].map(slot => {
                  const equipped = child.equipment?.[slot];
                  const labelMap = { weapon: '武器', armor: '防具', accessory: '饰品' };
                  return (
                    <div key={slot} style={styles.equipSlot}>
                      <div style={{fontWeight:'bold'}}>{labelMap[slot]}</div>
                      <div style={{fontSize:'12px', color:'#555', minHeight:'18px'}}>
                        {equipped ? equipped.name : '未装备'}
                      </div>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button style={styles.smallBtn} onClick={() => onAction('OPEN_INVENTORY', { mode:'SELECT', slot })}>选择</button>
                        {equipped && (
                          <button style={styles.smallBtn} onClick={() => onAction('UNEQUIP', { slot })}>卸下</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{marginTop:'8px', textAlign:'right'}}>
                <button style={styles.smallBtn} onClick={() => onAction('OPEN_INVENTORY', { mode:'VIEW' })}>📦 打开背包（丹药）</button>

                          {/* 2.6 修炼功法 */}
                          <ManualSection child={child} onChangeManual={(c) => onAction('CHANGE_MANUAL', c)} />
              </div>
            </div>

            {/* 3. 天赋词条 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>✨ 天赋词条</h4>
              <div style={styles.traitGrid}>
                {/* 容貌 */}
                <div style={styles.traitRow}>
                  <span style={styles.label}>容貌:</span>
                  <TraitTag
                    trait={getTraitByValue(child.stats?.looks || 50, 'LOOKS', child.gender)}
                    showValue={true} // 这里设为true，让玩家既看词条也看数值
                  />
                </div>

                {/* 悟性 (原智力) */}
                <div style={styles.traitRow}>
                  <span style={styles.label}>悟性:</span>
                  <TraitTag
                    trait={getTraitByValue(child.stats?.intelligence || 50, 'INT')}
                    showValue={true}
                  />
                </div>

                {/* 灵根资质 (复用逻辑，虽然没有专门的成语，但可以用颜色区分) */}
                <div style={styles.traitRow}>
                  <span style={styles.label}>根骨:</span>
                  <div style={{
                     // 简单的进度条展示
                     flex: 1, height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${aptitude}%`,
                      background: aptitude >= 90 ? '#d50000' : (aptitude >= 80 ? '#aa00ff' : '#4caf50')
                    }}></div>
                  </div>
                  <span style={{fontSize:'12px', marginLeft:'5px'}}>{aptitude}</span>
                </div>
              </div>
            </div>

            {/* 4. 实战数值 (HP/MP/ATK) - 保持数字显示 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>⚔️ 实战数值</h4>
              <div style={styles.combatGrid}>
                <div style={styles.statItem}>
                  <span style={{color:'#d32f2f'}}>气血</span>
                  <strong>{child.combatStats?.hp || 100}</strong>
                </div>
                <div style={styles.statItem}>
                  <span style={{color:'#1976d2'}}>灵力</span>
                  <strong>{child.combatStats?.mp || 0}</strong>
                </div>
                <div style={styles.statItem}>
                  <span style={{color:'#f57c00'}}>攻击</span>
                  <strong>{child.combatStats?.atk || 5}</strong>
                </div>
              </div>
            </div>

            {/* 4.5 修为进度 */}
            {child.tierTitle && (
              <div style={styles.section}>
                <h4 style={styles.secTitle}>⚡ 修为进度</h4>
                <div style={{fontSize: '12px', marginBottom: '8px'}}>
                  <span style={{color: '#666'}}>当前境界: </span>
                  <span style={{fontWeight: 'bold', color: '#9c27b0'}}>{child.tierTitle || '凡人'}</span>
                </div>
                {child.currentExp !== undefined && child.maxExp && (
                  <div>
                    {/* 修为进度条 */}
                    <div style={{marginBottom: '4px'}}>
                      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                        <span style={{fontSize: '11px', color: '#666'}}>修为进度</span>
                        <span style={{fontSize: '11px', color: '#666', fontWeight: 'bold'}}>
                          {Math.floor((child.currentExp / child.maxExp) * 100)}%
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
                          width: `${Math.min(100, (child.currentExp / child.maxExp) * 100)}%`,
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
                      {child.currentExp || 0} / {child.maxExp || 100}
                    </div>
                    
                    {/* 修炼速度显示 */}
                    {child.cultivationSpeed && (
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
                            {Math.floor(child.cultivationSpeed)} 经验/月
                          </span>
                        </div>
                        {(() => {
                          const remainingExp = child.maxExp - child.currentExp;
                          const monthsToBreakthrough = Math.ceil(remainingExp / child.cultivationSpeed);
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
                  </div>
                )}
              </div>
            )}

            {/* 5. 宗门与职业 */}
            <div style={styles.section}>
              <h4 style={styles.secTitle}>🏫 宗门职位</h4>
              {child.sect ? (
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:'bold', color:'#00695c'}}>{child.sect.name}</div>
                    <div style={{fontSize:'12px'}}>{child.rank}</div>
                  </div>
                  <div style={{textAlign:'right', fontSize:'12px'}}>
                    <div>俸禄: {Math.floor(child.age * 12) >= 192 ? '已发放' : '未成年'}</div>
                  </div>
                </div>
              ) : (
                <p style={{color:'#666', fontSize:'12px'}}>暂无宗门 / 散修</p>
              )}
            </div>

            {/* 6. 操作按钮区 */}
            <div style={{...styles.actionArea, gridTemplateColumns: '1fr 1fr 1fr'}}>
              <button
                onClick={() => onAction('CHAT')}
                style={{...styles.actionBtn, background:'#7e57c2'}}
              >
                💬 闲聊
                <br/><small style={{fontSize:'10px', opacity:0.8}}>增进亲子感情</small>
              </button>

              <button
                onClick={() => onAction('FEED_PILL')}
                style={styles.actionBtn}
                disabled={Math.floor(child.age * 12) < 72}
              >
                💊 赐予丹药 (-100灵石)
                <br/><small style={{fontSize:'10px', opacity:0.8}}>修为大幅提升</small>
              </button>

              <button
                onClick={() => onAction('EDUCATE')}
                style={{...styles.actionBtn, background:'#0097a7'}}
              >
                📖 亲自教导 (-50灵石)
                <br/><small style={{fontSize:'10px', opacity:0.8}}>微量提升资质</small>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { width: '600px', height: '600px', background: '#fff', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' },
  closeBtn: { position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'transparent', fontSize: '24px', cursor: 'pointer', color: '#888' },
  content: { flex: 1, height: '100%', overflow: 'hidden' },

  // 单栏样式
  // 增加底部内边距，避免末尾按钮被裁切
  singleCol: { width: '100%', padding: '25px 25px 90px 25px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' },
  avatar: { fontSize: '60px', marginBottom: '10px', background: '#fff', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  nameBox: { textAlign: 'left' },
  editIcon: { fontSize: '12px', cursor: 'pointer', marginLeft: '5px', opacity: 0.5 },
  input: { width: '120px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' },
  smallBtn: { padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#f5f5f5' },
  tierBadge: { fontSize: '12px', background: '#3e2723', color: '#fff', padding: '2px 8px', borderRadius: '10px', marginTop: '5px', display: 'inline-block' },
  infoRow: { width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', color: '#555' },
  traitBox: { padding: '10px', background: '#fff', border: '1px solid', borderRadius: '8px', textAlign: 'center', display: 'inline-block' },
  spouseBox: { marginTop: 'auto', fontSize: '12px', color: '#e91e63' },

  // 配偶卡片样式
  spouseCard: { background: '#fff8e1', padding: '15px', borderRadius: '8px', border: '1px solid #ffecb3', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  miniAvatar: { fontSize: '24px', width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  marryBtn: { marginTop: '10px', padding: '5px 15px', fontSize: '12px', cursor: 'pointer', borderRadius: '15px', border: '1px solid #e91e63', backgroundColor: '#fff', color: '#e91e63', transition: 'all 0.2s', ':hover': { backgroundColor: '#fce4ec', transform: 'translateY(-1px)' } },

  // 通用样式
  section: { marginBottom: '25px' },
  secTitle: { margin: '0 0 15px 0', fontSize: '14px', color: '#333', borderBottom: '1px dashed #ccc', paddingBottom: '8px' },
  elBadge: { padding: '2px 6px', borderRadius: '4px', color: '#fff', fontSize: '10px', fontWeight: 'bold' },
  barContainer: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', marginBottom: '10px' },
  barBg: { flex: 1, height: '8px', background: '#eee', borderRadius: '4px' },
  barFill: { height: '100%', borderRadius: '4px' },
  combatGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' },
  statItem: { background: '#fafafa', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' },
  spouseDetail: { background: '#f8f8f8', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  actionArea: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' },
  actionBtn: { padding: '12px', border: 'none', borderRadius: '8px', background: '#ff9800', color: 'white', cursor: 'pointer', textAlign: 'center', fontSize: '14px', transition: 'all 0.2s', ':hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0,0,0,0.15)' } },
  traitGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  traitRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  label: { width: '60px', fontSize: '13px', color: '#555', fontWeight: 'bold' },
  equipGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  equipSlot: { border: '1px dashed #ccc', borderRadius: '8px', padding: '10px', background: '#fafafa', textAlign: 'center' }
};

export default ChildDetailModal;