import React, { useState, useRef, useEffect, useCallback } from 'react';
import Avatar from '../Common/Avatar.jsx';
import { getTierColor, getSpiritColor } from '../../utils/colorHelpers';

// 稀有度颜色映射
const rarityColor = {
  WHITE: '#9e9e9e',
  GREEN: '#4caf50',
  BLUE: '#2196f3',
  PURPLE: '#9c27b0',
  ORANGE: '#ff9800',
  RED: '#f44336'
};

const FamilyTreeChart = ({ children, pregnantNpcs = [], onChildClick }) => {
  // 状态管理
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [familyTree, setFamilyTree] = useState([]);
  
  // 引用
  const containerRef = useRef(null);
  
  // 构建家族树数据结构
  const buildFamilyTree = useCallback(() => {
    // 按年龄排序，先处理长辈
    const sortedChildren = [...children].sort((a, b) => a.age - b.age);
    
    // 创建映射，方便查找父子关系
    const childMap = {};
    const tree = [];
    
    // 初始化所有子嗣
    sortedChildren.forEach(child => {
      childMap[child.id] = {
        ...child,
        children: [],
        level: 0
      };
    });
    
    // 构建树状结构
    sortedChildren.forEach(child => {
      if (child.parentId === undefined) {
        // 直接子嗣（玩家的孩子）
        tree.push(childMap[child.id]);
      } else {
        // 孙子辈或更低
        if (childMap[child.parentId]) {
          childMap[child.parentId].children.push(childMap[child.id]);
        }
      }
    });
    
    // 计算每个节点的层级
    const calculateLevels = (nodes, level) => {
      nodes.forEach(node => {
        node.level = level;
        if (node.children && node.children.length > 0) {
          calculateLevels(node.children, level + 1);
        }
      });
    };
    
    calculateLevels(tree, 0);
    
    setFamilyTree(tree);
  }, [children]);
  
  // 初始化家族树
  useEffect(() => {
    buildFamilyTree();
  }, [buildFamilyTree]);
  
  // 处理缩放
  const handleWheel = (e) => {
    if (e.cancelable) e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(0.3, prev * delta), 3));
  };
  
  // 处理拖拽开始
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };
  
  // 处理拖拽中
  const handleMouseMove = (e) => {
    if (isDragging) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // 处理点击节点
  const handleNodeClick = (child) => {
    onChildClick(child);
  };
  
  // 渲染单个节点
  const renderNode = (node, x, y) => {
    const isPregnant = pregnantNpcs.some(npc => npc.id === node.id);
    
    return (
      <g
        key={node.id}
        transform={`translate(${x}, ${y}) scale(0.8)`}
        onClick={() => handleNodeClick(node)}
      >
        {/* 节点连线（只连接父节点到子节点） */}
        {node.parentId && (
          <line
            x1={25}
            y1={0}
            x2={25}
            y2={-60}
            stroke="#8d6e63"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
        
        {/* 节点卡片 */}
        <rect
          x={0}
          y={0}
          width={150}
          height={100}
          rx={8}
          ry={8}
          fill={node.sect ? '#ffffff' : '#f5f5f5'}
          stroke={(node.stats?.aptitude || 0) >= 80 ? '#FFD700' : '#e0e0e0'}
          strokeWidth={(node.stats?.aptitude || 0) >= 80 ? 3 : 1}
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          cursor="pointer"
        />
        
        {/* 头像 */}
        <foreignObject x={55} y={10} width={40} height={40}>
          {node.age < 15 ? (
            <div style={{width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👶</div>
          ) : (
            <Avatar dna={node.avatar} gender={node.gender} size={40} />
          )}
        </foreignObject>
        
        {/* 姓名和性别 */}
        <text x={75} y={65} textAnchor="middle" fontSize="14" fontWeight="bold" fill={getTierColor(node.stats?.aptitude || 0)}>
          {node.name}
        </text>
        <text x={130} y={20} textAnchor="middle" fontSize="12" fill={node.gender === '男' ? '#4285F4' : '#EA4335'}>
          {node.gender === '男' ? '♂' : '♀'}
        </text>
        
        {/* 境界和灵根 */}
        <text x={75} y={80} textAnchor="middle" fontSize="10" fill="#3e2723">
          {node.tierTitle || "凡人"}
        </text>
        {node.isTested && (
          <text x={75} y={92} textAnchor="middle" fontSize="10" fill={getSpiritColor(node.spiritRoot.type)}>
            {node.spiritRoot.type}
          </text>
        )}
        
        {/* 配偶信息 */}
        {node.spouse && (
          <text x={75} y={104} textAnchor="middle" fontSize="8" fill="#e91e63">
            ❤ {node.spouse.name}
          </text>
        )}
        
        {/* 怀孕标记 */}
        {isPregnant && (
          <text x={20} y={20} textAnchor="middle" fontSize="12" fill="#d81b60">
            🥚
          </text>
        )}
        
        {/* 子嗣数量 */}
        {node.children && node.children.length > 0 && (
          <text x={130} y={95} textAnchor="middle" fontSize="10" fill="#2e7d32">
            👶 {node.children.length}
          </text>
        )}
      </g>
    );
  };
  
  // 渲染树状结构
  const renderTree = (nodes, x, y, level = 0) => {
    const nodeSpacing = 180;
    const levelSpacing = 150;
    let currentX = x;
    
    return (
      <g>
        {nodes.map((node, index) => {
          // 计算当前节点位置
          const nodeElement = renderNode(node, currentX, y);
          
          // 渲染子节点
          let childrenElement = null;
          if (node.children && node.children.length > 0) {
            const childX = currentX - (node.children.length - 1) * nodeSpacing / 2;
            childrenElement = renderTree(node.children, childX, y + levelSpacing, level + 1);
          }
          
          currentX += nodeSpacing;
          
          return (
            <g key={node.id}>
              {nodeElement}
              {childrenElement}
            </g>
          );
        })}
      </g>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      style={styles.container}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="tree-container"
    >
      <div style={styles.controls}>
        <button 
          onClick={() => setScale(1)} 
          style={styles.controlBtn}
        >
          重置视图
        </button>
        <div style={styles.scaleInfo}>缩放: {Math.round(scale * 100)}%</div>
      </div>
      
      <svg 
        width="100%" 
        height="800"
        style={{
          ...styles.svg,
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`
        }}
      >
        {/* 中心标记 */}
        <circle cx="400" cy="200" r="5" fill="#8d6e63" opacity="0.5" />
        
        {/* 渲染家族树 */}
        <g transform="translate(400, 200)">
          {renderTree(familyTree, 0, 0)}
        </g>
      </svg>
      
      {/* 说明 */}
      <div style={styles.legend}>
        <h4>家族树使用说明：</h4>
        <ul>
          <li>滚轮缩放视图</li>
          <li>拖拽移动视图</li>
          <li>点击节点查看详情</li>
          <li>金色边框：资质≥80</li>
          <li>彩色文字：灵根类型</li>
          <li>🥚 标记：孕育中</li>
          <li>👶 数字：子嗣数量</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '20px',
    border: '2px solid #8d6e63',
    borderRadius: '12px',
    backgroundColor: '#f5f0e8',
    padding: '15px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  svg: {
    transition: 'transform 0.1s ease-out',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    overflow: 'visible'
  },
  controls: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 10,
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  controlBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }
  },
  scaleInfo: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#5d4037',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: '4px 8px',
    borderRadius: '10px'
  },
  legend: {
    marginTop: '15px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    marginBottom: '5px'
  }
};

export default FamilyTreeChart;