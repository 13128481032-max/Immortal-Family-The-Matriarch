// src/game/jealousySystem.js
// 吃醋与雄竞系统

/**
 * 醋意等级定义
 */
export const JEALOUSY_LEVEL = {
  NONE: { min: 0, max: 20, label: '无醋意', color: '#4caf50' },
  LOW: { min: 21, max: 40, label: '微醋', color: '#8bc34a' },
  MEDIUM: { min: 41, max: 60, label: '中醋', color: '#ff9800' },
  HIGH: { min: 61, max: 80, label: '大醋', color: '#ff5722' },
  EXTREME: { min: 81, max: 100, label: '修罗场', color: '#f44336' }
};

/**
 * 获取醋意等级
 */
export function getJealousyLevel(jealousy = 0) {
  if (jealousy <= 20) return JEALOUSY_LEVEL.NONE;
  if (jealousy <= 40) return JEALOUSY_LEVEL.LOW;
  if (jealousy <= 60) return JEALOUSY_LEVEL.MEDIUM;
  if (jealousy <= 80) return JEALOUSY_LEVEL.HIGH;
  return JEALOUSY_LEVEL.EXTREME;
}

/**
 * 计算互动被目击时的醋意增加值
 * @param {Object} witness - 目击者NPC
 * @param {Object} targetNpc - 被互动的NPC
 * @param {string} actionType - 互动类型：'CHAT', 'GIFT', 'DUAL_CULTIVATION', 'SPAR'
 * @returns {number} 醋意增加值
 */
export function calculateJealousyIncrease(witness, targetNpc, actionType) {
  const witnessAffection = witness.relationship?.affection || 0;
  
  // 好感度不足50，不会吃醋
  if (witnessAffection < 50) return 0;
  
  // 基础醋意值（根据互动类型）
  const baseJealousy = {
    'CHAT': 5,
    'GIFT': 10,
    'SPAR': 8,
    'DUAL_CULTIVATION': 30
  };
  
  let increase = baseJealousy[actionType] || 5;
  
  // 好感度调整系数
  if (witnessAffection >= 80) {
    increase *= 2.0; // 亲密关系，醋意×2
  } else if (witnessAffection >= 70) {
    increase *= 1.5;
  } else if (witnessAffection >= 60) {
    increase *= 1.2;
  }
  
  // 性格调整系数
  const personality = typeof witness.personality === 'object' && witness.personality !== null && 'label' in witness.personality 
    ? witness.personality.label 
    : (Array.isArray(witness.personality) ? witness.personality[0] : "普通");
  
  const personalityMultiplier = {
    '病娇': 1.8,
    '偏执': 1.6,
    '傲娇': 1.3,
    '高冷': 0.8, // 高冷型表面不在意，醋意增长慢
    '温柔': 1.1,
    '佛修': 1.2  // 佛修虽然克制，但内心挣扎
  };
  
  increase *= (personalityMultiplier[personality] || 1.0);
  
  // 如果目击者和被互动者之前有过节（醋意已经很高），加成
  const currentJealousy = witness.relationship?.jealousy || 0;
  if (currentJealousy >= 60) {
    increase *= 1.3;
  }
  
  return Math.floor(increase);
}

/**
 * 检测互动是否被目击（概率触发）
 * @param {Object} player - 玩家对象
 * @param {Object} activeNpc - 正在互动的NPC
 * @param {Array} allNpcs - 所有NPC列表
 * @param {string} actionType - 互动类型
 * @returns {Array} 目击的NPC列表
 */
export function checkWitnessEvent(player, activeNpc, allNpcs, actionType) {
  const witnesses = [];
  
  // 不同互动类型被目击的概率不同（降低基础概率，增加惊喜感）
  const witnessProbability = {
    'CHAT': 0.05,           // 闲聊：5%
    'GIFT': 0.08,           // 赠礼：8%
    'SPAR': 0.06,           // 切磋：6%
    'DUAL_CULTIVATION': 0.02 // 双修：2%（私密）
  };
  
  const baseProb = witnessProbability[actionType] || 0.05;
  
  allNpcs.forEach(npc => {
    // 跳过正在互动的NPC自己
    if (npc.id === activeNpc.id) return;
    
    // 跳过已死亡的NPC
    if (npc.isDead) return;
    
    const affection = npc.relationship?.affection || 0;
    
    // 好感度≥50才可能目击
    if (affection < 50) return;
    
    // 好感度越高，越容易"恰好路过"（但整体概率仍然较低）
    let witnessChance = baseProb;
    if (affection >= 80) {
      witnessChance *= 2.0; // 亲密关系更关注玩家
    } else if (affection >= 70) {
      witnessChance *= 1.6;
    } else if (affection >= 60) {
      witnessChance *= 1.3;
    }
    
    // 性格影响
    const personality = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
      ? npc.personality.label 
      : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
    
    if (personality === '病娇' || personality === '偏执') {
      witnessChance *= 1.3; // 病娇型会刻意关注（降低倍率）
    }
    
    // 概率判定
    if (Math.random() < witnessChance) {
      witnesses.push(npc);
    }
  });
  
  return witnesses;
}

/**
 * 应用醋意增加并生成事件
 * @param {Object} witness - 目击者NPC
 * @param {Object} activeNpc - 被互动的NPC
 * @param {string} actionType - 互动类型
 * @param {number} increase - 醋意增加值
 * @returns {Object} 事件对象
 */
export function applyJealousyIncrease(witness, activeNpc, actionType, increase) {
  const oldJealousy = witness.relationship?.jealousy || 0;
  const newJealousy = Math.min(100, oldJealousy + increase);
  
  // 更新醋意值
  witness.relationship = {
    ...witness.relationship,
    jealousy: newJealousy
  };
  
  // 记录情敌
  if (!witness.relationship.rivalNpcs) {
    witness.relationship.rivalNpcs = [];
  }
  if (!witness.relationship.rivalNpcs.includes(activeNpc.id)) {
    witness.relationship.rivalNpcs.push(activeNpc.id);
  }
  
  // 生成事件描述
  const level = getJealousyLevel(newJealousy);
  const actionText = {
    'CHAT': '闲聊',
    'GIFT': '赠礼',
    'SPAR': '切磋',
    'DUAL_CULTIVATION': '双修'
  };
  
  return {
    type: 'JEALOUSY',
    witnessName: witness.name,
    targetName: activeNpc.name,
    actionType: actionText[actionType] || '互动',
    increase: increase,
    newJealousy: newJealousy,
    level: level.label,
    // 根据醋意等级生成不同的描述
    description: generateJealousyEventDescription(witness, activeNpc, actionType, level)
  };
}

/**
 * 生成吃醋事件描述
 */
function generateJealousyEventDescription(witness, target, actionType, level) {
  const name = witness.name;
  const targetName = target.name;
  const personality = typeof witness.personality === 'object' && witness.personality !== null && 'label' in witness.personality 
    ? witness.personality.label 
    : (Array.isArray(witness.personality) ? witness.personality[0] : "普通");
  
  // 根据醋意等级生成不同描述
  if (level.min >= 81) {
    // 修罗场级别
    return `${name}看到你与${targetName}${actionType === 'DUAL_CULTIVATION' ? '双修' : '在一起'}，眼中闪过危险的光芒...`;
  } else if (level.min >= 61) {
    // 大醋
    const texts = {
      '病娇': `${name}在远处凝视着你和${targetName}，嘴角勾起诡异的笑容...`,
      '傲娇': `${name}看到你们，冷哼一声转身离开，背影透着气愤。`,
      '高冷': `${name}面无表情地看了一眼，然后径直走开。`,
      '温柔': `${name}看到你们，眼中闪过一丝受伤，默默退开。`,
      '佛修': `${name}合掌低诵佛号，额角青筋隐现...`,
      '默认': `${name}看到你们，眼神变得冰冷。`
    };
    return texts[personality] || texts['默认'];
  } else if (level.min >= 41) {
    // 中醋
    return `${name}恰好路过，看到你与${targetName}在一起，眼神有些复杂。`;
  } else if (level.min >= 21) {
    // 微醋
    return `${name}远远看到你与${targetName}，若有所思地离开了。`;
  }
  
  return null; // 无醋意不显示
}

/**
 * 检测长期冷落（每月调用）
 * @param {Object} npc - NPC对象
 * @param {number} currentMonth - 当前月份
 * @returns {number} 醋意增加值
 */
export function checkNeglect(npc, currentMonth) {
  const affection = npc.relationship?.affection || 0;
  
  // 只有好感≥70的才会因冷落吃醋
  if (affection < 70) return 0;
  
  const lastInteraction = npc.relationship?.lastInteraction || 0;
  const monthsSinceInteraction = currentMonth - lastInteraction;
  
  // 超过3个月未互动
  if (monthsSinceInteraction >= 3) {
    // 好感度越高，冷落感越强
    let increase = 5;
    if (affection >= 90) increase = 10;
    else if (affection >= 80) increase = 8;
    
    return increase;
  }
  
  return 0;
}

/**
 * 醋意自然衰减（每月调用）
 * @param {Object} npc - NPC对象
 * @param {boolean} hadInteraction - 本月是否有互动
 * @returns {number} 醋意减少值
 */
export function calculateJealousyDecay(npc, hadInteraction) {
  const jealousy = npc.relationship?.jealousy || 0;
  
  if (jealousy === 0) return 0;
  
  // 有互动：-5，无互动：-2
  const baseDecay = hadInteraction ? 5 : 2;
  
  // 性格影响衰减速度
  const personality = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
  
  const decayMultiplier = {
    '病娇': 0.5,  // 病娇记仇，衰减慢
    '偏执': 0.6,
    '傲娇': 1.2,  // 傲娇虽然嘴硬，但来得快去得也快
    '温柔': 1.5,  // 温柔型最容易原谅
    '佛修': 0.8   // 佛修克制，但心结难解
  };
  
  const decay = Math.floor(baseDecay * (decayMultiplier[personality] || 1.0));
  
  return Math.min(decay, jealousy); // 不能减到负数
}

/**
 * 检测是否触发修罗场
 * @param {Array} npcs - NPC列表
 * @returns {Object|null} 修罗场事件对象
 */
export function checkShuraFieldTrigger(npcs) {
  // 筛选出醋意≥60且好感≥70的NPC
  const jealousNpcs = npcs.filter(npc => {
    if (npc.isDead) return false;
    const jealousy = npc.relationship?.jealousy || 0;
    const affection = npc.relationship?.affection || 0;
    return jealousy >= 60 && affection >= 70;
  });
  
  // 至少需要2个NPC才能触发修罗场
  if (jealousNpcs.length < 2) return null;
  
  // 修罗场触发概率：每有一个高醋意NPC，概率+15%
  const triggerChance = Math.min(0.6, jealousNpcs.length * 0.15);
  
  if (Math.random() < triggerChance) {
    return {
      type: 'SHURA_FIELD',
      participants: jealousNpcs,
      triggerChance: triggerChance
    };
  }
  
  return null;
}

/**
 * 生成吃醋相关的日志内容（NPC第一人称）
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} targetNpc - 被互动的NPC（可选）
 * @param {number} jealousyLevel - 醋意等级
 * @returns {string} 日志内容
 */
export function generateJealousyLogContent(npc, player, targetNpc, jealousyLevel) {
  const playerName = player.name;
  const targetName = targetNpc?.name || '那人';
  const personality = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
  
  // 根据醋意等级和性格生成不同内容
  const templates = {
    // 微醋（21-40）
    'LOW': {
      '病娇': `今日见${playerName}与${targetName}颇为投契...呵，我早该料到的。不过没关系，我会让${playerName}知道，谁才是最适合${player.gender === '女' ? '她' : '他'}的人。`,
      '傲娇': `${playerName}居然和${targetName}那么亲近...哼，才不是吃醋！我、我只是觉得${player.gender === '女' ? '她' : '他'}眼光不太好而已...`,
      '高冷': `${playerName}与${targetName}往来甚密。我不该在意这些，但心中为何有些不悦？`,
      '温柔': `看到${playerName}对${targetName}笑得那么开心...我是不是做得不够好？要再努力一些才行。`,
      '佛修': `见施主与${targetName}相谈甚欢，贫僧心中竟泛起涟漪。阿弥陀佛，这是嫉妒之念，需斩断...可为何斩之不断？`,
      '默认': `${playerName}最近与${targetName}走得很近，我心中有些不是滋味。`
    },
    // 中醋（41-60）
    'MEDIUM': {
      '病娇': `${playerName}的眼里，现在都是${targetName}了吗？不...不会的，${player.gender === '女' ? '她' : '他'}是我的，只能是我的。我要想办法...`,
      '傲娇': `${playerName}这个笨蛋！明明我才是最关心${player.gender === '女' ? '她' : '他'}的人！${targetName}那家伙有什么好的！`,
      '高冷': `${playerName}与${targetName}频繁往来，我已无法视而不见。或许...我该做些什么。`,
      '温柔': `${playerName}对${targetName}那么温柔...我好像越来越不重要了。但我不想失去${player.gender === '女' ? '她' : '他'}...该怎么办？`,
      '佛修': `施主与${targetName}形影不离，贫僧已难守清净。师尊曾言'不可得而求之，徒增苦痛'，可贫僧已陷太深...`,
      '默认': `${playerName}对${targetName}如此上心，让我心中焦虑。我是不是该更主动一些？`
    },
    // 大醋（61-80）
    'HIGH': {
      '病娇': `够了...够了！${playerName}为什么要这样对我！${player.gender === '女' ? '她' : '他'}明明是我的！${targetName}...你为什么要出现...你为什么不消失...`,
      '傲娇': `${playerName}这个大笨蛋！混蛋！我再也不要理${player.gender === '女' ? '她' : '他'}了！...可是...呜呜呜...`,
      '高冷': `${playerName}，你让我失望了。既然你已有别心，那我也无需再留恋。`,
      '温柔': `今夜又梦见${playerName}牵着${targetName}的手渐行渐远...我追着${player.gender === '女' ? '她' : '他'}，却怎么也追不上。醒来时，枕头已湿透...`,
      '佛修': `色即是空，空即是色。可这色...为何如此难空？施主与${targetName}双修之事传入耳中，贫僧险些走火入魔。戒律...道心...已然支离破碎...`,
      '默认': `${playerName}与${targetName}的事，让我痛苦万分。我该如何面对${player.gender === '女' ? '她' : '他'}？`
    },
    // 修罗场（81-100）
    'EXTREME': {
      '病娇': `我已经忍够了。${targetName}，以及所有妄图夺走${playerName}的人...都该死。只有这样，${playerName}才会只看着我...只属于我...`,
      '傲娇': `${playerName}！你给我站住！我有话要说！什么${targetName}啊、谁谁谁的，你到底喜欢谁！给我一个答案！`,
      '高冷': `是时候解决了。${playerName}，你需要做出选择。是我，还是${targetName}？`,
      '温柔': `${playerName}...我知道我没资格要求你，但...能不能至少看看我？我也在这里啊...`,
      '佛修': `施主，你可知贫僧为你破了多少戒？杀戒、妄戒、淫戒...如今贫僧已是罗刹，不入轮回。若你还有一丝怜悯...给贫僧一个答案。`,
      '默认': `${playerName}，我们需要谈谈。关于你、我，还有${targetName}。`
    }
  };
  
  // 确定醋意等级类型
  let levelType = 'LOW';
  if (jealousyLevel >= 81) levelType = 'EXTREME';
  else if (jealousyLevel >= 61) levelType = 'HIGH';
  else if (jealousyLevel >= 41) levelType = 'MEDIUM';
  
  const levelTemplates = templates[levelType];
  return levelTemplates[personality] || levelTemplates['默认'];
}
