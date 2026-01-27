// src/components/SpouseSelectionModal/index.jsx
import React from 'react';
import Avatar from '../Avatar';

const SpouseSelectionModal = ({ child, candidates, onSelect, onClose }) => {
  if (!candidates || candidates.length === 0) return null;

  const getArchetypeLabel = (archetype) => {
    switch(archetype) {
      case 'talented': return '🌟 资质型';
      case 'beautiful': return '🌸 容貌型';
      case 'wise': return '📚 悟性型';
      case 'buddha': return '🙏 佛修';
      default: return '⚖️ 均衡型';
    }
  };

  const getArchetypeDesc = (archetype) => {
    switch(archetype) {
      case 'talented': return '天赋异禀，修炼神速';
      case 'beautiful': return '容貌出众，倾国倾城';
      case 'wise': return '智慧超群，悟性极高';
      case 'buddha': return '佛门弟子，六根清净';
      default: return '各项均衡，无明显短板';
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>💍 为 {child.name} 选择配偶</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        
        <div style={styles.subtitle}>
          请从以下三位候选人中选择一位作为 {child.name} 的配偶：
        </div>

        <div style={styles.candidatesContainer}>
          {candidates.map((candidate, index) => (
            <div key={candidate.id} style={styles.candidateCard}>
              <div style={styles.cardHeader}>
                <div style={styles.archetypeBadge}>
                  {getArchetypeLabel(candidate.archetype)}
                </div>
              </div>

              <div style={styles.avatarSection}>
                <Avatar 
                  avatar={candidate.avatar}
                  gender={candidate.gender}
                  size={80}
                />
                <div style={styles.nameSection}>
                  <div style={styles.candidateName}>{candidate.name}</div>
                  <div style={styles.candidateGender}>
                    {candidate.gender === '男' ? '♂ 男' : '♀ 女'}
                  </div>
                  {candidate.identity && (
                    <div style={styles.identity}>{candidate.identity}</div>
                  )}
                </div>
              </div>

              <div style={styles.archetypeDesc}>
                {getArchetypeDesc(candidate.archetype)}
              </div>

              <div style={styles.statsSection}>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>资质：</span>
                  <span style={{
                    ...styles.statValue,
                    color: candidate.stats.aptitude >= 80 ? '#ff4081' : 
                           candidate.stats.aptitude >= 60 ? '#9c27b0' : '#666'
                  }}>
                    {candidate.stats.aptitude}
                  </span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>容貌：</span>
                  <span style={{
                    ...styles.statValue,
                    color: candidate.stats.looks >= 80 ? '#ff4081' : 
                           candidate.stats.looks >= 60 ? '#9c27b0' : '#666'
                  }}>
                    {candidate.stats.looks}
                  </span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>悟性：</span>
                  <span style={{
                    ...styles.statValue,
                    color: candidate.stats.intelligence >= 80 ? '#ff4081' : 
                           candidate.stats.intelligence >= 60 ? '#9c27b0' : '#666'
                  }}>
                    {candidate.stats.intelligence}
                  </span>
                </div>
              </div>

              <div style={styles.spiritRootSection}>
                <div style={styles.spiritRootLabel}>灵根：</div>
                <div style={styles.spiritRootValue}>
                  {candidate.spiritRoot?.type} 
                  {candidate.spiritRoot?.elements?.length > 0 && 
                    ` (${candidate.spiritRoot.elements.join('、')})`
                  }
                </div>
              </div>

              <div style={styles.cultivationSection}>
                <div style={styles.tierLabel}>{candidate.tierTitle}</div>
                <div style={styles.cultivationValue}>
                  修为: {candidate.cultivation}
                </div>
              </div>

              <button 
                style={styles.selectBtn}
                onClick={() => onSelect(candidate)}
                onMouseEnter={(e) => e.target.style.background = '#d81b60'}
                onMouseLeave={(e) => e.target.style.background = '#e91e63'}
              >
                选择 {candidate.name}
              </button>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <div style={styles.costInfo}>💰 婚礼开销：500 灵石</div>
          <button style={styles.cancelBtn} onClick={onClose}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  modal: {
    background: 'linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%)',
    borderRadius: '16px',
    maxWidth: '1100px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: '2px solid #ffb74d',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '2px solid #ffb74d',
    background: 'linear-gradient(90deg, #ffe0b2, #ffcc80)',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#d84315',
    fontWeight: 'bold',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#bf360c',
    padding: '0',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.2s',
  },
  subtitle: {
    padding: '16px 24px',
    fontSize: '16px',
    color: '#5d4037',
    textAlign: 'center',
    background: '#fff3e0',
  },
  candidatesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    padding: '24px',
  },
  candidateCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '2px solid #ffb74d',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  cardHeader: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'center',
  },
  archetypeBadge: {
    background: 'linear-gradient(135deg, #e91e63, #f06292)',
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
    paddingBottom: '12px',
    borderBottom: '1px solid #ffe0b2',
  },
  nameSection: {
    flex: 1,
  },
  candidateName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#d84315',
    marginBottom: '4px',
  },
  candidateGender: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  identity: {
    fontSize: '12px',
    color: '#ff6f00',
    fontWeight: 'bold',
    background: '#fff3e0',
    padding: '2px 8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  archetypeDesc: {
    fontSize: '13px',
    color: '#795548',
    fontStyle: 'italic',
    marginBottom: '16px',
    textAlign: 'center',
    padding: '8px',
    background: '#fff8e1',
    borderRadius: '6px',
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    padding: '12px',
    background: '#fafafa',
    borderRadius: '8px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  spiritRootSection: {
    marginBottom: '12px',
    padding: '10px',
    background: '#e3f2fd',
    borderRadius: '6px',
    border: '1px solid #90caf9',
  },
  spiritRootLabel: {
    fontSize: '12px',
    color: '#1565c0',
    marginBottom: '4px',
  },
  spiritRootValue: {
    fontSize: '14px',
    color: '#0d47a1',
    fontWeight: 'bold',
  },
  cultivationSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '10px',
    background: '#f3e5f5',
    borderRadius: '6px',
  },
  tierLabel: {
    fontSize: '14px',
    color: '#6a1b9a',
    fontWeight: 'bold',
  },
  cultivationValue: {
    fontSize: '13px',
    color: '#4a148c',
  },
  selectBtn: {
    background: '#e91e63',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s',
    boxShadow: '0 2px 8px rgba(233, 30, 99, 0.3)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '2px solid #ffb74d',
    background: '#fff3e0',
  },
  costInfo: {
    fontSize: '16px',
    color: '#d84315',
    fontWeight: 'bold',
  },
  cancelBtn: {
    background: '#9e9e9e',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default SpouseSelectionModal;
