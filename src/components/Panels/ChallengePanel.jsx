import React, { useState } from 'react';
import { REALMS, calculateCombatPower } from '../../game/challengeSystem.js';

const ChallengePanel = ({ player, children, onChallenge }) => {
  const [selectedRealm, setSelectedRealm] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState([]);

  // 筛选可用战斗力 (成年人)
  const fighters = children.filter(c => c.age >= 16);

  // 切换队员选中状态
  const toggleMember = (childId) => {
    if (selectedTeam.includes(childId)) {
      setSelectedTeam(prev => prev.filter(id => id !== childId));
    } else {
      if (selectedTeam.length >= 3) return alert("最多带3名子嗣！");
      setSelectedTeam(prev => [...prev, childId]);
    }
  };

  // 计算当前队伍战力
  const currentTeamCP = calculateCombatPower(player) +
    selectedTeam.reduce((sum, id) => {
      const c = fighters.find(child => child.id === id);
      return sum + (c ? calculateCombatPower(c) : 0);
    }, 0);

  return (
    <div style={{padding: '10px'}}>
      {selectedRealm ? (
        // --- 详情与组队页 ---
        <div>
          <button onClick={() => setSelectedRealm(null)}>← 返回</button>
          <h3>🔥 {selectedRealm.name}</h3>
          <p>{selectedRealm.desc}</p>
          <div style={styles.statBox}>
            <div>推荐战力: {selectedRealm.recommendCP}</div>
            <div>当前战力: <span style={{color: currentTeamCP >= selectedRealm.recommendCP ? 'green' : 'red'}}>{currentTeamCP}</span></div>
            <div>死亡率: {(selectedRealm.risk * 100).toFixed(0)}%</div>
          </div>

          <h4>选择随从 (最多3人)</h4>
          <div style={styles.list}>
            {fighters.map(c => (
              <div
                key={c.id}
                onClick={() => toggleMember(c.id)}
                style={{
                  ...styles.fighterRow,
                  background: selectedTeam.includes(c.id) ? '#ffe0b2' : 'white'
                }}
              >
                <span>{c.name} ({c.tierTitle})</span>
                <span>CP: {calculateCombatPower(c)}</span>
              </div>
            ))}
          </div>

          <button
            style={styles.startBtn}
            onClick={() => onChallenge(selectedRealm, selectedTeam)}
          >
            出发 (消耗 {selectedRealm.cost} 灵石)
          </button>
        </div>
      ) : (
        // --- 列表页 ---
        <div>
          <h3>⚔️ 秘境试炼</h3>
          <p style={{fontSize:'12px', color:'#666'}}>探索秘境可获得珍稀宝物，但需注意子嗣生命安全。</p>
          <div style={styles.list}>
            {REALMS.map(r => (
              <div key={r.id} onClick={() => setSelectedRealm(r)} style={styles.realmCard}>
                <div style={{fontWeight:'bold'}}>{r.name}</div>
                <div style={{fontSize:'12px', color:'#d81b60'}}>推荐: {r.reqTier}</div>
                <div style={{fontSize:'12px'}}>门票: {r.cost}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' },
  realmCard: { border: '1px solid #ddd', padding: '15px', borderRadius: '8px', cursor: 'pointer', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fighterRow: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' },
  statBox: { background: '#eee', padding: '10px', borderRadius: '5px', margin: '10px 0', fontSize: '14px' },
  startBtn: { width: '100%', padding: '15px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', marginTop: '20px', cursor: 'pointer' }
};

export default ChallengePanel;