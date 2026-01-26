import React, { useState, useRef } from 'react';
import TraitTag from '../Common/TraitTag.jsx';
import { getTraitByValue } from '../../game/traitSystem.js';

// --- 1. 递归树节点组件 ---
const TreeNode = ({ node, allChildren, onNodeClick }) => {
  // 查找当前节点的孩子 (即下级子嗣)
  const myOffspring = allChildren.filter(c => c.parentId === node.id);

  return (
    <div style={styles.nodeWrapper}>
      {/* 节点卡片 */}
      <div
        style={{
           ...styles.card,
           borderColor: node.id === 'PLAYER' ? '#d4af37' : (node.stats?.aptitude >= 80 ? '#d4af37' : '#dcd6cc')
        }}
        onClick={() => onNodeClick(node)}
      >
        <div style={styles.avatar}>{node.gender === '女' ? '👩' : '👨'}</div>
        <div style={styles.name}>{node.name}</div>
        
        {node.id !== 'PLAYER' && (
          <>
            <div style={styles.tier}>{node.tierTitle || '凡人'}</div>
            {node.spouse && <div style={styles.spouseTag}>❤ 已婚</div>}
            {node.isPregnant && (
              <div style={styles.pregnantTag}>
                🥚 孕育中{node.gender === '男' && <span style={{fontSize: '9px'}}>(男修)</span>}
              </div>
            )}
          </>
        )}
      </div>

      {/* 连接线 (如果有孩子) */}
      {myOffspring.length > 0 && <div style={styles.lineDown}></div>}

      {/* 递归渲染下级 (如果有孩子) */}
      {myOffspring.length > 0 && (
        <div style={styles.childrenContainer}>
          {myOffspring.map((child, index) => (
            <div key={child.id} style={styles.childWrapper}>
              {/* 横向连接线逻辑 */}
              <div style={{
                ...styles.lineTop,
                // 第一个孩子只显示右半边线，最后一个只显示左半边
                left: index === 0 ? '50%' : '0',
                width: index === 0 || index === myOffspring.length - 1 ? '50%' : '100%',
                // 只有一个孩子时不需要横线，只需要竖线
                display: myOffspring.length === 1 ? 'none' : 'block'
              }}></div>
              
              <TreeNode node={child} allChildren={allChildren} onNodeClick={onNodeClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 2. 主容器 (处理缩放拖拽) ---
const ZoomableTree = ({ player, children, pregnantNpcs = [], onChildClick }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const containerRef = useRef(null);

  // 滚轮缩放
  const handleWheel = (e) => {
    if (e.cancelable) e.preventDefault(); // 防止页面滚动（仅在可取消时）
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(.2, scale + delta), 3);
    setScale(newScale);
  };

  // 鼠标拖拽逻辑
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 触摸事件支持（移动端）
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // 单指拖动
      setIsDragging(true);
      setTouchStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    } else if (e.touches.length === 2) {
      // 双指缩放
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    
    if (e.touches.length === 1 && isDragging && touchStart) {
      // 单指拖动
      setPosition({
        x: e.touches[0].clientX - touchStart.x,
        y: e.touches[0].clientY - touchStart.y
      });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      // 双指缩放
      const newDistance = getTouchDistance(e.touches);
      const scaleFactor = newDistance / lastTouchDistance;
      const newScale = Math.min(Math.max(0.2, scale * scaleFactor), 3);
      setScale(newScale);
      setLastTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
    setLastTouchDistance(null);
  };

  // 构造根节点 (玩家自己)
  const rootNode = {
    id: 'PLAYER',
    name: player.name + " (老祖)",
    gender: player.gender,
    parentId: null,
    // 玩家的孩子 parentId 应该是 undefined 或者特定的，我们需要在这里处理一下数据
    // 假设第一代孩子的 parentId 为 undefined 或 null
  };

  // 预处理数据：把第一代孩子的 parentId 设为 PLAYER
  // 将孕育中的胚胎以占位节点挂在玩家名下，便于在族谱中查看
  const embryoNodes = pregnantNpcs.map((npc, idx) => ({
    id: `embryo-${npc.id || idx}`,
    name: `${npc.name}（胚胎）`,
    gender: npc.gender || '女',
    parentId: 'PLAYER',
    generation: 1,
    tierTitle: '孕育中',
    isPregnant: true
  }));

  const processedChildren = [...children, ...embryoNodes].map(c => ({
    ...c,
    parentId: c.parentId || 'PLAYER' // 玩家直接子嗣的 parentId 设为 PLAYER
  }));

  return (
    <div
      ref={containerRef}
      style={styles.viewport}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div style={styles.controls}>
        <button onClick={() => setScale(Math.min(3, scale + 0.1))}>放大</button>
        <button onClick={() => setScale(Math.max(0.2, scale - 0.1))}>缩小</button>
        <button onClick={() => {setScale(1); setPosition({x:0,y:0})}}>重置</button>
      </div>

      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          ...styles.treeCanvas
        }}
      >
         <TreeNode
            node={rootNode}
            allChildren={processedChildren}
            onNodeClick={(n) => n.id !== 'PLAYER' && onChildClick(n)}
         />
      </div>
    </div>
  );
};

const styles = {
  viewport: { width: '100%', height: '500px', overflow: 'hidden', background: '#f0f4f8', position: 'relative', border: '3px double #dcd6cc', borderRadius: '12px', cursor: 'grab' },
  controls: { position: 'absolute', top: 10, right: 10, zIndex: 10, display: 'flex', gap: '5px' },
  treeCanvas: { display: 'flex', justifyContent: 'center', paddingTop: '50px', width: 'max-content', minWidth: '100%' },
  
  // 树结构样式
  nodeWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  card: { width: '100px', padding: '8px', background: '#fff', border: '2px solid #ccc', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', position: 'relative', zIndex: 2 },
  childrenContainer: { display: 'flex', paddingTop: '20px' },
  childWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 10px' },
  
  // 连线
  lineDown: { width: '2px', height: '20px', background: '#ccc' },
  lineTop: { position: 'absolute', top: 0, height: '20px', borderTop: '2px solid #ccc', zIndex: 1 },
  
  // 内容
  avatar: { fontSize: '24px' },
  name: { fontSize: '12px', fontWeight: 'bold', margin: '2px 0' },
  tier: { fontSize: '10px', color: '#666' },
  spouseTag: { fontSize: '10px', color: '#e91e63', marginTop: '2px' },
  pregnantTag: { fontSize: '10px', color: '#ff9800', marginTop: '2px' }
};

export default ZoomableTree;