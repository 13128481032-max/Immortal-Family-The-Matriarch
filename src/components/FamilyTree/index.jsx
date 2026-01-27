import React from 'react';
import Avatar from '../Common/Avatar.jsx';

// 辅助函数：根据资质返回颜色
const getTierColor = (aptitude) => {
  if (aptitude >= 90) return '#FFD700'; // 金色 (天灵根)
  if (aptitude >= 80) return '#9C27B0'; // 紫色 (单灵根)
  if (aptitude >= 60) return '#2196F3'; // 蓝色 (双灵根)
  return '#4CAF50'; // 绿色 (凡人)
};

// 辅助函数：根据灵根类型返回颜色
const getSpiritColor = (spiritRootType) => {
  const colorMap = {
    "天灵根": "#FFD700", // 金色
    "双灵根": "#9C27B0", // 紫色
    "三灵根": "#2196F3", // 蓝色
    "四灵根": "#4CAF50", // 绿色
    "五灵根": "#9E9E9E", // 灰色
    "变异灵根": "#00BCD4" // 青色
  };
  return colorMap[spiritRootType] || "#9E9E9E";
};

// 稀有度颜色映射
const rarityColor = {
  WHITE: '#9e9e9e',
  GREEN: '#4caf50',
  BLUE: '#2196f3',
  PURPLE: '#9c27b0',
  ORANGE: '#ff9800',
  RED: '#f44336'
};

const FamilyTree = ({ children, pregnantNpcs = [], onMarry, onChildClick }) => {
  // 计算家族总人口 (已出生 + 腹中)
  const totalPop = children.length + pregnantNpcs.length;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🌳 楚氏家族树 ({totalPop}人)</h3>
      
      {totalPop === 0 ? (
        <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
          暂无子嗣...<br/>
          <small>请尽快寻找良人繁衍，振兴家族。</small>
        </div>
      ) : (
        <div style={styles.grid}>
          
          {/* 1. 先渲染正在孕育中的胚胎 */}
          {pregnantNpcs.map(npc => (
            <div 
              key={`embryo-${npc.id}`} 
              style={{...styles.embryoCard, cursor: 'pointer'}}
              onClick={() => onChildClick({ isEmbryo: true, npc: npc })}
            >
              <div style={styles.icon}>🥚</div>
              <div style={styles.info}>
                <strong style={{color: '#d81b60'}}>孕育中...</strong>
                <div style={styles.detail}>
                  孕父: {npc.name} {npc.gender === '男' && <span style={{fontSize: '10px', color: '#ff6b6b'}}>(男修孕育)</span>}
                </div>
                {/* 显示进度条 */}
                <div style={styles.progressBg}>
                   <div style={{...styles.progressFill, width: `${(npc.pregnancyProgress || 0) * 11.1}%`}}></div>
                </div>
                <div style={styles.detail}>进度: {npc.pregnancyProgress || 0}/9月</div>
              </div>
            </div>
          ))}

          {/* 2. 再渲染已出生的孩子 */}
          {children.map(child => (
            <div
              key={child.id}
              onClick={() => onChildClick(child)} // 👈 添加点击事件
              style={{
                ...styles.childCard,
                borderColor: (child.stats?.aptitude || 0) >= 80 ? 'gold' : '#e0e0e0',
                background: child.sect ? '#fff' : '#f5f5f5',
                border: (child.stats?.aptitude || 0) >= 80 ? '2px solid gold' : '1px solid #ddd', // 天才加金边
                cursor: 'pointer' // 鼠标变手型
            }}>
              <div style={{marginBottom: '10px'}}>
                {child.age === 0 ? (
                  <div style={{fontSize: '28px'}}>🥚</div>
                ) : child.age < 15 ? (
                  <div style={{fontSize: '28px'}}>👶</div>
                ) : (
                  <Avatar dna={child.avatar} gender={child.gender} size={50} />
                )}
              </div>
              <div style={styles.info}>
                {/* 名字与境界 */}
                <div>
                  <strong style={{color: getTierColor(child.stats?.aptitude || 0)}}>{child.name}</strong>
                  <span style={{
                    fontSize: '10px',
                    background: child.gender === '男' ? '#4285F4' : '#EA4335',
                    color: 'white',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    marginLeft: '3px',
                    fontWeight: 'bold'
                  }}>
                    {child.gender === '男' ? '♂' : '♀'}
                  </span>
                  <span style={styles.tierTag}>{child.tierTitle || "凡人"}</span>
                  {/* 如果已测灵，显示灵根徽章 */}
                  {child.isTested ? (
                    <span style={{
                      fontSize: '10px',
                      border: '1px solid',
                      padding: '1px 3px',
                      borderRadius: '4px',
                      marginLeft: '5px',
                      color: getSpiritColor(child.spiritRoot.type)
                    }}>
                      {child.spiritRoot.type}
                    </span>
                  ) : (
                    <span style={{fontSize:'10px', color:'#999'}}>(骨骼未成)</span>
                  )}
                </div>

                {/* 词条展示 */}
                {child.trait && (
                  <div style={{
                    ...styles.traitTag,
                    color: rarityColor[child.trait.rarity],
                    borderColor: rarityColor[child.trait.rarity]
                  }}>
                    {child.trait.name}
                  </div>
                )}

                {/* 宗门与职位 */}
                <div style={styles.sectInfo}>
                  {child.sect ? `${child.sect.name} · ${child.rank}` : "家中啃老"}
                </div>

                {/* 属性细节 */}
                <div style={styles.detail}>
                  资质: {child.stats?.aptitude || 0} | 
                  年龄: {Math.floor(child.age)}岁{Math.floor((child.age % 1) * 12)}个月
                </div>
                {child.cultivation > 0 && (
                  <div style={styles.detail}>修为: {child.cultivation}</div>
                )}

                {/* 显示特殊体质标签 */}
                {child.constitution && (
                  <div style={{fontSize:'10px', background:'linear-gradient(to right, #ffecd2, #fcb69f)', padding:'2px', borderRadius:'4px', marginTop: '2px'}}>
                    ✨{child.constitution.name}
                  </div>
                )}

                {/* 婚配按钮 (成年且未婚) */}
                {Math.floor(child.age * 12) >= 216 && !child.spouse && onMarry && (
                  <button 
                    onClick={() => onMarry(child.id)} 
                    style={styles.marryBtn}
                  >
                    💍 安排婚事
                  </button>
                )}
                
                {/* 已婚显示 */}
                {child.spouse && (
                  <div style={styles.spouseInfo}>❤ 伴侣: {child.spouse.name}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    border: '2px solid #2e7d32',
    borderRadius: '8px',
    backgroundColor: '#e8f5e9',
    padding: '10px'
  },
  title: {
    margin: '0 0 10px 0',
    color: '#1b5e20',
    textAlign: 'center',
    borderBottom: '1px dashed #a5d6a7',
    paddingBottom: '5px'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center'
  },
  childCard: {
    width: '120px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  embryoCard: {
    width: '120px',
    backgroundColor: '#fff0f5', // 粉色背景区分
    border: '1px dashed #d81b60', // 虚线边框
    borderRadius: '8px',
    padding: '8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  progressBg: { width: '100%', height: '4px', background: '#eee', borderRadius: '2px', margin: '5px 0' },
  progressFill: { height: '100%', background: '#d81b60', borderRadius: '2px', transition: 'width 0.3s' },
  icon: { fontSize: '24px', marginBottom: '5px' },
  info: { width: '100%' },
  age: { fontSize: '12px', color: '#666' },
  detail: { fontSize: '10px', color: '#555', marginTop: '2px' },
  tierTag: { fontSize: '10px', background: '#3e2723', color: '#fff', padding: '1px 4px', borderRadius: '4px', marginLeft: '5px' },
  traitTag: { fontSize: '10px', border: '1px solid', padding: '1px 4px', borderRadius: '4px', display: 'inline-block', margin: '2px 0', fontWeight: 'bold' },
  sectInfo: { fontSize: '11px', color: '#00695c', fontWeight: 'bold', margin: '2px 0' },
  marryBtn: { marginTop: '5px', fontSize: '10px', background: '#e91e63', color: 'white', border: 'none', borderRadius: '10px', padding: '2px 8px', cursor: 'pointer' },
  spouseInfo: { fontSize: '10px', color: '#e91e63', marginTop: '2px' }
};

export default FamilyTree;