import React, { useState, useMemo } from 'react';
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
    "天灵根": "#FFD700",
    "双灵根": "#9C27B0",
    "三灵根": "#2196F3",
    "四灵根": "#4CAF50",
    "五灵根": "#9E9E9E",
    "变异灵根": "#00BCD4"
  };
  return colorMap[spiritRootType] || "#9E9E9E";
};

const ChildrenListView = ({ children, pregnantNpcs = [], onChildClick }) => {
  const [sortBy, setSortBy] = useState('age'); // age, aptitude, cultivation, name
  const [filterGender, setFilterGender] = useState('all'); // all, 男, 女
  const [filterGeneration, setFilterGeneration] = useState('all'); // all, 1, 2, 3+
  const [filterStatus, setFilterStatus] = useState('all'); // all, married, single, pregnant, cultivating

  // 计算每个子嗣的代数
  const getGeneration = (child) => {
    if (!child.parentId || child.parentId === 'PLAYER') return 1;
    // 简单估算：找parent
    const parent = children.find(c => c.id === child.parentId);
    if (!parent) return 1;
    return getGeneration(parent) + 1;
  };

  // 过滤和排序
  const processedChildren = useMemo(() => {
    let result = [...children];

    // 性别过滤
    if (filterGender !== 'all') {
      result = result.filter(c => c.gender === filterGender);
    }

    // 代数过滤
    if (filterGeneration !== 'all') {
      result = result.filter(c => {
        const gen = getGeneration(c);
        if (filterGeneration === '3+') return gen >= 3;
        return gen === parseInt(filterGeneration);
      });
    }

    // 状态过滤
    if (filterStatus !== 'all') {
      result = result.filter(c => {
        if (filterStatus === 'married') return c.spouse;
        if (filterStatus === 'single') return !c.spouse;
        if (filterStatus === 'pregnant') return pregnantNpcs.some(npc => npc.id === c.id);
        if (filterStatus === 'cultivating') return c.sect;
        return true;
      });
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'age':
          return a.age - b.age;
        case 'aptitude':
          return (b.stats?.aptitude || 0) - (a.stats?.aptitude || 0);
        case 'cultivation':
          return (b.cultivationLevel || 0) - (a.cultivationLevel || 0);
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN');
        default:
          return 0;
      }
    });

    return result;
  }, [children, sortBy, filterGender, filterGeneration, filterStatus, pregnantNpcs]);

  // 统计信息
  const stats = useMemo(() => {
    return {
      total: children.length,
      male: children.filter(c => c.gender === '男').length,
      female: children.filter(c => c.gender === '女').length,
      married: children.filter(c => c.spouse).length,
      pregnant: pregnantNpcs.length,
      cultivating: children.filter(c => c.sect).length,
      genius: children.filter(c => (c.stats?.aptitude || 0) >= 80).length
    };
  }, [children, pregnantNpcs]);

  return (
    <div style={styles.container}>
      {/* 标题和统计 */}
      <div style={styles.header}>
        <h3 style={styles.title}>子嗣列表 ({processedChildren.length}/{stats.total})</h3>
        <div style={styles.statsBar}>
          <span style={styles.statItem}>👨 {stats.male}</span>
          <span style={styles.statItem}>👩 {stats.female}</span>
          <span style={styles.statItem}>❤️ {stats.married}</span>
          <span style={styles.statItem}>🥚 {stats.pregnant}</span>
          <span style={styles.statItem}>⚔️ {stats.cultivating}</span>
          <span style={styles.statItem}>⭐ {stats.genius}</span>
        </div>
      </div>

      {/* 筛选和排序控制 */}
      <div style={styles.controls}>
        {/* 排序 */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>排序:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="age">年龄</option>
            <option value="aptitude">资质</option>
            <option value="cultivation">修为</option>
            <option value="name">姓名</option>
          </select>
        </div>

        {/* 性别过滤 */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>性别:</label>
          <select 
            value={filterGender} 
            onChange={(e) => setFilterGender(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>

        {/* 代数过滤 */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>代数:</label>
          <select 
            value={filterGeneration} 
            onChange={(e) => setFilterGeneration(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部</option>
            <option value="1">第一代</option>
            <option value="2">第二代</option>
            <option value="3+">第三代+</option>
          </select>
        </div>

        {/* 状态过滤 */}
        <div style={styles.controlGroup}>
          <label style={styles.label}>状态:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="all">全部</option>
            <option value="married">已婚</option>
            <option value="single">单身</option>
            <option value="pregnant">孕育中</option>
            <option value="cultivating">修行中</option>
          </select>
        </div>
      </div>

      {/* 孕育中的胚胎 */}
      {pregnantNpcs.length > 0 && filterStatus !== 'single' && filterStatus !== 'cultivating' && (
        <div style={styles.section}>
          <h4 style={styles.sectionTitle}>🥚 孕育中 ({pregnantNpcs.length})</h4>
          <div style={styles.embryoList}>
            {pregnantNpcs.map(npc => (
              <div key={`embryo-${npc.id}`} style={styles.embryoCard}>
                <div style={styles.embryoIcon}>🥚</div>
                <div style={styles.embryoInfo}>
                  <div style={styles.embryoName}>孕育中...</div>
                  <div style={styles.embryoDetail}>父: {npc.name}</div>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill, 
                        width: `${(npc.pregnancyProgress || 0) * 10}%`
                      }}
                    ></div>
                  </div>
                  <div style={styles.embryoProgress}>{npc.pregnancyProgress || 0}/10月</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 子嗣列表 */}
      <div style={styles.listContainer}>
        {processedChildren.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <div style={styles.emptyText}>没有符合条件的子嗣</div>
          </div>
        ) : (
          processedChildren.map(child => {
            const generation = getGeneration(child);
            const isPregnant = pregnantNpcs.some(npc => npc.id === child.id);
            
            return (
              <div
                key={child.id}
                style={styles.childCard}
                onClick={() => onChildClick(child)}
              >
                {/* 左侧头像 */}
                <div style={styles.avatarSection}>
                  {child.age < 15 ? (
                    <div style={styles.babyIcon}>👶</div>
                  ) : (
                    <Avatar dna={child.avatar} gender={child.gender} size={60} />
                  )}
                  <div style={styles.genderBadge} data-gender={child.gender}>
                    {child.gender === '男' ? '♂' : '♀'}
                  </div>
                </div>

                {/* 中间信息 */}
                <div style={styles.infoSection}>
                  <div style={styles.childName}>
                    <span style={{color: getTierColor(child.stats?.aptitude || 0)}}>
                      {child.name}
                    </span>
                    <span style={styles.generationBadge}>第{generation}代</span>
                    {(child.stats?.aptitude || 0) >= 80 && (
                      <span style={styles.geniusBadge}>⭐天才</span>
                    )}
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoItem}>
                      年龄: {Math.floor(child.age)}岁
                    </span>
                    <span style={styles.infoItem}>
                      {child.tierTitle || '凡人'}
                    </span>
                    {child.isTested && (
                      <span 
                        style={{
                          ...styles.infoItem, 
                          color: getSpiritColor(child.spiritRoot.type)
                        }}
                      >
                        {child.spiritRoot.type}
                      </span>
                    )}
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoItem}>
                      资质: {child.stats?.aptitude || 0}
                    </span>
                    {child.sect && (
                      <span style={styles.sectBadge}>
                        ⚔️ {child.sect.name}
                      </span>
                    )}
                    {child.spouse && (
                      <span style={styles.spouseBadge}>
                        ❤️ {child.spouse.name}
                      </span>
                    )}
                    {isPregnant && (
                      <span style={styles.pregnantBadge}>
                        🥚 孕育中
                      </span>
                    )}
                  </div>

                  {/* 功法 */}
                  {child.cultivationManual && (
                    <div style={styles.manualInfo}>
                      📖 {child.cultivationManual.name}
                    </div>
                  )}
                </div>

                {/* 右侧箭头 */}
                <div style={styles.arrowSection}>
                  →
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#f5f0e8',
    borderRadius: '12px',
    border: '2px solid #8d6e63',
    maxHeight: '600px',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    marginBottom: '15px'
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#5d4037'
  },
  statsBar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  statItem: {
    fontSize: '12px',
    padding: '4px 8px',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: '12px',
    fontWeight: 'bold'
  },
  controls: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: '8px'
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  label: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#5d4037'
  },
  select: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: '1px solid #8d6e63',
    backgroundColor: 'white',
    fontSize: '12px',
    cursor: 'pointer'
  },
  section: {
    marginBottom: '15px'
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#d81b60'
  },
  embryoList: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px'
  },
  embryoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '2px dashed #d81b60',
    minWidth: '200px'
  },
  embryoIcon: {
    fontSize: '32px'
  },
  embryoInfo: {
    flex: 1
  },
  embryoName: {
    fontWeight: 'bold',
    color: '#d81b60',
    marginBottom: '4px'
  },
  embryoDetail: {
    fontSize: '11px',
    color: '#666',
    marginBottom: '4px'
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '4px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d81b60',
    transition: 'width 0.3s ease'
  },
  embryoProgress: {
    fontSize: '10px',
    color: '#666'
  },
  listContainer: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  childCard: {
    display: 'flex',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '10px',
    border: '2px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  avatarSection: {
    position: 'relative',
    flexShrink: 0
  },
  babyIcon: {
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    backgroundColor: '#f5f5f5',
    borderRadius: '50%'
  },
  genderBadge: {
    position: 'absolute',
    bottom: '-4px',
    right: '-4px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4285F4',
    border: '2px solid white'
  },
  infoSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0
  },
  childName: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    flexWrap: 'wrap'
  },
  generationBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '10px',
    fontWeight: 'normal'
  },
  geniusBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    borderRadius: '10px',
    fontWeight: 'normal'
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  infoItem: {
    fontSize: '11px',
    color: '#666'
  },
  sectBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '10px',
    fontWeight: 'bold'
  },
  spouseBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#fce4ec',
    color: '#c2185b',
    borderRadius: '10px',
    fontWeight: 'bold'
  },
  pregnantBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    borderRadius: '10px',
    fontWeight: 'bold'
  },
  manualInfo: {
    fontSize: '11px',
    color: '#7b1fa2',
    fontWeight: 'bold'
  },
  arrowSection: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '20px',
    color: '#bbb',
    flexShrink: 0
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#999'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '14px'
  }
};

// 添加CSS来处理性别徽章的颜色
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  [data-gender="男"] {
    background-color: #4285F4 !important;
  }
  [data-gender="女"] {
    background-color: #EA4335 !important;
  }
  .childCard:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #8d6e63;
  }
`;
document.head.appendChild(styleSheet);

export default ChildrenListView;
