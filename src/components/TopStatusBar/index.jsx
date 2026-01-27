import React from 'react';
import Avatar from '../Common/Avatar.jsx';

// 增加 onBreakthrough 参数
const TopStatusBar = ({ player, isAuto, onBreakthrough }) => {
  // 计算进度条宽度
  const ratio = player.currentExp / player.maxExp;
  const expPercent = Math.min(100, ratio * 100);
  const isFull = player.currentExp >= player.maxExp; // 是否满级

  // 使用传入的玩家头像数据，回退到默认DNA以防缺失
  const playerDNA = player?.avatar || { base:0, skinColor:0, hair:0, hairColor:0, eye:0, eyeColor:1, mouth:0 };

  return (
    <div style={styles.container}>
      {/* 左侧：头像与角色信息 */}
      <div style={styles.left}>
        {/* 如果闭关中，头像显示为冥想状态 */}
        <div style={{
          ...styles.avatar,
          border: isAuto ? '2px solid #76ff03' : 'none',
          animation: isAuto ? 'pulse 1.5s infinite' : 'none'
        }}>
          {isAuto ? (
            <div style={{fontSize: '24px'}}>🧘</div>
          ) : (
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
              <Avatar dna={playerDNA} gender={player.gender} size={44} />
              {/* 调试用：随机头像 按钮，会调用父组件传入的回调 */}
              {typeof onRandomizeAvatar === 'function' && (
                <button onClick={onRandomizeAvatar} style={{fontSize:12, padding:'4px 6px', borderRadius:6, border:'none', cursor:'pointer'}}>随机</button>
              )}
            </div>
          )}
        </div>
        <div style={styles.info}>
          <div style={styles.name}>{player.name}</div>
          <div style={styles.tier}>
            {player.tier}
            {isAuto && <span style={styles.meditateStatus}>● 闭关中</span>}
          </div>
        </div>
      </div>

      {/* 右侧：核心资源与时间 */}
      <div style={styles.right}>
        <div style={styles.resource}>
          <span style={styles.resourceIcon}>💎</span>
          <span style={styles.resourceValue}>{player.resources.spiritStones}</span>
        </div>
        <div style={styles.time}>
          <span style={styles.timeIcon}>📅</span>
          <span style={styles.timeValue}>云澜历 {Math.floor(player.age)}年 {player.time.month}月</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '60px', // 减少高度，避免遮挡主界面
    background: 'linear-gradient(135deg, #3e2723 0%, #2c1810 100%)', // 深色渐变背景，提高对比度
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
    position: 'relative',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)', // 加深阴影
    borderRadius: '0 0 16px 16px' // 底部圆角
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%', // 圆形头像，更符合古风审美
    background: 'linear-gradient(135deg, #a1887f 0%, #8d6e63 100%)', // 渐变背景
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    imageRendering: 'pixelated',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)' // 柔和阴影
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  name: {
    fontSize: '15px',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  tier: {
    fontSize: '12px',
    color: '#ffecb3',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
  },
  meditateStatus: {
    color: '#76ff03',
    marginLeft: '5px',
    fontSize: '10px'
  },
  right: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0
  },
  resource: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '5px 10px',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  resourceIcon: {
    fontSize: '16px'
  },
  resourceValue: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff'
  },
  time: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '5px 10px',
    borderRadius: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  timeIcon: {
    fontSize: '16px'
  },
  timeValue: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#fff'
  }
};

// 添加脉冲动画
const addPulseAnimation = () => {
  try {
    const styleSheet = document.styleSheets[0];
    if (styleSheet) {
      const animationRule = `
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(118, 255, 3, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(118, 255, 3, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(118, 255, 3, 0); }
        }
      `;
      styleSheet.insertRule(animationRule, styleSheet.cssRules.length);
    }
  } catch (error) {
    console.warn('Failed to add pulse animation:', error);
  }
};

// 在组件挂载后添加动画
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  addPulseAnimation();
}

export default TopStatusBar;