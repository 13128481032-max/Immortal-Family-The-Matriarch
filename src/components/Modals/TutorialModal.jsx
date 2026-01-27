import React, { useState } from 'react';

// 简化的新手引导步骤
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: '欢迎来到《嫡女仙途》',
    content: `
      <p>👋 欢迎，修真者！</p>
      <p>这是一个结合<strong>家族繁衍</strong>与<strong>个人修仙</strong>的游戏。</p>
      <p><strong>你的目标：</strong>击败宿敌楚清瑶，夺回属于你的一切。</p>
      <br/>
      <p>📌 <strong>核心玩法：</strong></p>
      <ul>
        <li>🌍 游历：结识不同资质的伴侣</li>
        <li>👶 繁衍：生下子嗣，扩大家族</li>
        <li>⚡ 反哺：子嗣修为会提升你的境界</li>
        <li>💰 经营：派遣子嗣管理产业赚灵石</li>
      </ul>
    `
  },
  {
    id: 2,
    title: '游戏界面导航',
    content: `
      <p>🎮 <strong>顶部状态栏：</strong>显示你的姓名、境界、修为、灵石等核心信息</p>
      <br/>
      <p>📱 <strong>底部导航栏：</strong></p>
      <ul>
        <li><strong>📜 游历：</strong>结识NPC，建立关系</li>
        <li><strong>👨‍👩‍👧‍👦 家族：</strong>管理你的子嗣和家族树</li>
        <li><strong>💼 经营：</strong>管理产业，赚取灵石</li>
        <li><strong>⚔️ 挑战：</strong>与他人比武切磋</li>
        <li><strong>💀 复仇：</strong>监控威胁度，对抗宿敌</li>
        <li><strong>⚙️ 系统：</strong>存档、读档、查看指南</li>
      </ul>
    `
  },
  {
    id: 3,
    title: '如何快速提升修为？',
    content: `
      <p>⚡ <strong>修为反哺机制</strong>是游戏的核心！</p>
      <br/>
      <p><strong>为何前期修为增长缓慢？</strong></p>
      <p>因为<strong>凡人子嗣的反哺微乎其微</strong>（仅10%效率）。</p>
      <br/>
      <p>📈 <strong>境界系数：</strong></p>
      <ul>
        <li>👶 凡人/炼气期：10% 效率</li>
        <li>🧒 筑基期：50% 效率</li>
        <li>🧑 金丹期及以上：100% 效率</li>
      </ul>
      <br/>
      <p>💡 <strong>策略建议：</strong></p>
      <ul>
        <li>不要盲目生孩子，质量>数量</li>
        <li>尽快提升子嗣境界（用丹药、教导）</li>
        <li>寻找高资质伴侣改良后代基因</li>
      </ul>
    `
  },
  {
    id: 4,
    title: '注意威胁度！',
    content: `
      <p>⚠️ 你的宿敌<strong>楚清瑶</strong>在时刻注视着你！</p>
      <br/>
      <p><strong>威胁度系统：</strong></p>
      <ul>
        <li>威胁度会随时间自然增长</li>
        <li>当威胁度达到 <strong>100</strong> 时，会触发刺杀！</li>
        <li>在【复仇】面板可花费灵石<strong>"隐匿行踪"</strong></li>
      </ul>
      <br/>
      <p>⚔️ <strong>战斗系统：</strong></p>
      <ul>
        <li>战斗采用回合制，对比 HP(气血) 和 ATK(攻击)</li>
        <li>提升战力可正面反杀杀手，获得战利品</li>
      </ul>
    `
  },
  {
    id: 5,
    title: '开始你的仙途吧！',
    content: `
      <p>✨ <strong>恭喜你完成了新手引导！</strong></p>
      <br/>
      <p>📚 <strong>更多详细玩法：</strong></p>
      <p>在游戏中随时可以点击【系统】→【仙途指南】查看完整攻略。</p>
      <br/>
      <p>💡 <strong>小提示：</strong></p>
      <ul>
        <li>前期多游历，认识不同的NPC</li>
        <li>定期查看【消息中心】📮 了解世界动态</li>
        <li>灵根测试要等到6岁才能进行</li>
        <li>记得定期存档！</li>
      </ul>
      <br/>
      <p style="text-align:center; color:#d32f2f; font-weight:bold;">
        愿你早日修成正果，复仇成功！
      </p>
    `
  }
];

const TutorialModal = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 完成引导
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
    onClose();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* 头部 */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <span style={styles.stepIndicator}>
              步骤 {currentStep + 1} / {TUTORIAL_STEPS.length}
            </span>
            <h3 style={styles.title}>{step.title}</h3>
          </div>
          <button onClick={handleSkip} style={styles.skipBtn}>跳过引导</button>
        </div>

        {/* 进度条 */}
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${progress}%`}} />
        </div>

        {/* 内容区 */}
        <div style={styles.content}>
          <div
            style={styles.contentText}
            dangerouslySetInnerHTML={{ __html: step.content }}
          />
        </div>

        {/* 底部按钮 */}
        <div style={styles.footer}>
          {currentStep > 0 && (
            <button onClick={() => setCurrentStep(currentStep - 1)} style={styles.prevBtn}>
              上一步
            </button>
          )}
          <div style={{flex: 1}} />
          <button onClick={handleNext} style={styles.nextBtn}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? '开始游戏' : '下一步'}
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
    background: 'rgba(0, 0, 0, 0.85)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease-in'
  },
  modal: {
    width: '90%',
    maxWidth: '550px',
    maxHeight: '85vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '2px solid #d4af37'
  },
  header: {
    padding: '20px',
    background: 'linear-gradient(135deg, #5d4037 0%, #3e2723 100%)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerContent: {
    flex: 1
  },
  stepIndicator: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    marginBottom: '8px'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold'
  },
  skipBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: '#e0e0e0'
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #d4af37 0%, #f4e4a6 100%)',
    transition: 'width 0.3s ease'
  },
  content: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
    fontSize: '14px',
    lineHeight: '1.8'
  },
  contentText: {
    color: '#333'
  },
  footer: {
    padding: '15px 20px',
    borderTop: '1px solid #e0e0e0',
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px'
  },
  prevBtn: {
    padding: '10px 20px',
    background: '#9e9e9e',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  nextBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%)',
    color: '#3e2723',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
  }
};

export default TutorialModal;
