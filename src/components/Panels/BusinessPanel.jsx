import React, { useState } from 'react';
import { BUSINESSES } from '../../game/challengeSystem.js';

const BusinessPanel = ({ player, children, onBuy, onAssign }) => {
  // 筛选出成年的、没有工作的孩子
  const idleChildren = children.filter(c => c.age >= 16 && !c.job);

  return (
    <div style={{padding: '10px'}}>
      <h3>💰 家族产业</h3>
      <p style={{fontSize:'12px', color:'#666'}}>
        利用家族子嗣管理产业，获取持续灵石收入。
        <br/>当前日收益: {player.businesses?.reduce((sum, b) => sum + b.income, 0) || 0} 灵石
      </p>

      {/* 已拥有产业列表 */}
      <div style={{marginBottom: '20px'}}>
        {player.businesses?.map((biz, idx) => {
           const manager = children.find(c => c.id === biz.managerId);
           return (
             <div key={idx} style={styles.bizCard}>
               <div style={{fontWeight:'bold'}}>{biz.name}</div>
               <div style={{fontSize:'12px'}}>
                 掌柜: {manager ? manager.name : <span style={{color:'red'}}>空缺</span>}
                 {manager && ` (智力:${manager.stats.intelligence})`}
               </div>
               <div style={{color: '#2e7d32'}}>预计月收: {biz.income}</div>
             </div>
           );
        })}
      </div>

      {/* 购买新产业 */}
      <h4>🏢 拓展版图</h4>
      <div style={styles.grid}>
        {BUSINESSES.map(biz => (
          <div key={biz.id} style={styles.card}>
            <div style={{fontWeight:'bold'}}>{biz.name}</div>
            <div style={{fontSize:'10px', color:'#555', height:'30px'}}>{biz.desc}</div>
            <div style={{fontSize:'12px', margin:'5px 0'}}>
              需: {biz.minTier} | 价: {biz.cost}
            </div>
            
            {/* 购买并指派逻辑 */}
            <select id={`select-${biz.id}`} style={styles.select}>
              <option value="">选择掌柜...</option>
              {idleChildren.map(c => <option key={c.id} value={c.id}>{c.name} (智{c.stats.intelligence})</option>)}
            </select>
            
            <button
              style={styles.buyBtn}
              onClick={() => {
                const select = document.getElementById(`select-${biz.id}`);
                const childId = select.value;
                if(!childId) return alert("必须指派一名子嗣打理！");
                onBuy(biz, childId);
              }}
            >
              购买
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  card: { border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: 'white' },
  bizCard: { border: '1px solid #81c784', background: '#e8f5e9', padding: '10px', borderRadius: '8px', marginBottom: '5px' },
  buyBtn: { width: '100%', background: '#ff9800', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' },
  select: { width: '100%', padding: '2px' }
};

export default BusinessPanel;