import React, { useState, useEffect } from 'react';

const ExplorationModal = ({
  open,
  realmName,
  progress,
  total,
  event,
  log,
  onSelectOption,
  onNext,
  onStartCombat,
  onClose
}) => {
  const [hoveredOption, setHoveredOption] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimate(true);
    }
  }, [open]);

  if (!open) return null;

  // 根据事件类型显示不同的背景色和图标
  const getEventIcon = () => {
    if (!event) return '🏞️';
    switch (event.kind) {
      case 'COMBAT': return '⚔️';
      case 'BOSS': return '👹';
      case 'TREASURE': return '💎';
      case 'MYSTERY': return '🔮';
      default: return '🌟';
    }
  };

  const getEventTypeColor = () => {
    if (!event) return '#4a5568';
    switch (event.kind) {
      case 'COMBAT': return '#d32f2f';
      case 'BOSS': return '#7b1fa2';
      case 'TREASURE': return '#f57c00';
      case 'MYSTERY': return '#1976d2';
      default: return '#388e3c';
    }
  };

  const progressPercent = ((progress / total) * 100).toFixed(0);

  // 当玩家选择一个选项后，自动执行并进入下一步
  const handleOptionSelect = (opt) => {
    onSelectOption(opt);
    // 延迟一小段时间让玩家看到选择结果，然后自动前进
    setTimeout(() => {
      onNext();
    }, 800);
  };

  // 当战斗开始后，也自动前进
  const handleCombatStart = () => {
    onStartCombat();
    setTimeout(() => {
      onNext();
    }, 800);
  };

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.window,
        animation: animate ? 'slideIn 0.3s ease-out' : 'none'
      }}>
        {/* 顶部渐变标题栏 */}
        <div style={{
          ...styles.header,
          background: `linear-gradient(135deg, ${getEventTypeColor()}, ${getEventTypeColor()}dd)`
        }}>
          <div style={styles.headerTop}>
            <span style={styles.realmTitle}>
              {getEventIcon()} {realmName}
            </span>
            <button 
              style={styles.closeIconBtn}
              onClick={onClose}
              onMouseEnter={() => setHoveredBtn('close')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              ✕
            </button>
          </div>
          {/* 进度条 */}
          <div style={styles.progressContainer}>
            <div style={{
              ...styles.progressBar,
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #ffd54f, #ffb300)'
            }} />
            <span style={styles.progressText}>{progress} / {total}</span>
          </div>
        </div>

        {/* 主体内容区 */}
        <div style={styles.body}>
          {/* 事件卡片 */}
          <div style={{
            ...styles.eventCard,
            borderLeft: `4px solid ${getEventTypeColor()}`
          }}>
            <div style={styles.eventHeader}>
              <span style={{
                ...styles.eventBadge,
                background: getEventTypeColor()
              }}>
                {event?.kind || '事件'}
              </span>
              <h3 style={styles.eventTitle}>{event?.title || '未知事件'}</h3>
            </div>
            <p style={styles.eventDesc}>{event?.desc || '……'}</p>
          </div>

          {/* 选项按钮区域 */}
          {event?.options && event.options.length > 0 && (
            <div style={styles.optionsContainer}>
              <div style={styles.optionsLabel}>📋 可选择的行动：</div>
              <div style={styles.options}>
                {event.options.map((opt, idx) => (
                  <button
                    key={idx}
                    style={{
                      ...styles.optionBtn,
                      ...(hoveredOption === idx ? styles.optionBtnHover : {})
                    }}
                    onMouseEnter={() => setHoveredOption(idx)}
                    onMouseLeave={() => setHoveredOption(null)}
                    onClick={() => handleOptionSelect(opt)}
                  >
                    <span style={styles.optionIcon}>🎯</span>
                    <span style={styles.optionLabel}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 战斗按钮 */}
          {(event?.kind === 'COMBAT' || event?.kind === 'BOSS') && (
            <button 
              style={{
                ...styles.fightBtn,
                ...(hoveredBtn === 'fight' ? styles.fightBtnHover : {})
              }}
              onMouseEnter={() => setHoveredBtn('fight')}
              onMouseLeave={() => setHoveredBtn(null)}
              onClick={handleCombatStart}
            >
              <span style={styles.fightIcon}>⚔️</span>
              <span>开始战斗</span>
            </button>
          )}
        </div>

        {/* 底部操作栏 - 仅保留结束探险按钮 */}
        <div style={styles.footer}>
          <button 
            style={{
              ...styles.actionBtn,
              ...styles.exitBtn,
              ...(hoveredBtn === 'exit' ? styles.exitBtnHover : {})
            }}
            onMouseEnter={() => setHoveredBtn('exit')}
            onMouseLeave={() => setHoveredBtn(null)}
            onClick={onClose}
          >
            <span>结束探险</span>
          </button>
        </div>
      </div>

      {/* 添加CSS动画 */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
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
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 2100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  window: {
    width: '100%',
    maxWidth: '600px',
    background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh'
  },
  header: {
    color: '#fff',
    padding: '16px 20px',
    position: 'relative'
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  realmTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  closeIconBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(255,255,255,0.3)'
    }
  },
  progressContainer: {
    position: 'relative',
    background: 'rgba(0,0,0,0.2)',
    height: '24px',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: '12px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '13px',
    fontWeight: 'bold',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
  },
  body: {
    padding: '20px',
    flex: 1,
    overflowY: 'auto'
  },
  eventCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  eventBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  eventTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0
  },
  eventDesc: {
    fontSize: '14px',
    color: '#4a5568',
    lineHeight: 1.7,
    margin: 0
  },
  optionsContainer: {
    marginBottom: '16px'
  },
  optionsLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '10px'
  },
  options: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px'
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2d3748',
    transition: 'all 0.2s ease',
    textAlign: 'left'
  },
  optionBtnHover: {
    borderColor: '#4299e1',
    background: '#ebf8ff',
    transform: 'translateX(4px)',
    boxShadow: '0 4px 12px rgba(66, 153, 225, 0.15)'
  },
  optionIcon: {
    fontSize: '16px'
  },
  optionLabel: {
    flex: 1
  },
  fightBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    border: 'none',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  fightBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)'
  },
  fightIcon: {
    fontSize: '20px',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    background: '#fff',
    borderTop: '1px solid #e2e8f0'
  },
  actionBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '15px',
    transition: 'all 0.2s ease'
  },
  exitBtn: {
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1'
  },
  exitBtnHover: {
    background: '#e2e8f0',
    borderColor: '#94a3b8'
  }
};

export default ExplorationModal;
