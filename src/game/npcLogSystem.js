// src/game/npcLogSystem.js
// NPC 第一人称日志生成系统

import {
  getChatTemplateByAffection,
  getGiftLikeTemplate,
  getGiftDislikeTemplate,
  getSparWinTemplate,
  getSparLoseTemplate,
  getDualCultivationTemplate,
  getBreakthroughSuccessTemplate,
  getBreakthroughFailTemplate,
  malePregnancyDecisionTemplates,
  malePregnancyMonthlyTemplates,
  maleBirthTemplates,
  marriageTemplates,
  childbornTemplates,
  nearDeathTemplates,
  severeInjuryTemplates,
  getDailyTemplateByIdentity,
  getDailyTemplateByPersonality,
  getDailyTemplateByRelationship,
  sectMissionTemplates,
  adventureTemplates,
  shoppingTemplates,
  socialTemplates,
  seclusionTemplates,
  sceneryTemplates,
  jealousyPrivateTemplates,
  pleasePlayerTemplates,
  randomPick
} from '../data/logTemplates.js';

// 日志类型枚举
export const LOG_TYPE = {
  INTERACTION: 'INTERACTION', // 交互日志（闲聊、赠礼、切磋等）
  STATE_CHANGE: 'STATE_CHANGE', // 重大状态变更（突破、结婚、生子等）
  DAILY: 'DAILY', // 日常模拟
  EVENT: 'EVENT' // 特殊事件
};

// 最大日志数量（防止存档膨胀）
const MAX_LOG_COUNT = 50;

/**
 * 为 NPC 添加一条日志
 * @param {Object} npc - NPC 对象
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {string} content - 日志内容（第一人称）
 * @param {string} type - 日志类型
 * @param {boolean} isSecret - 是否为秘密日志（需要高好感度或特殊道具查看）
 * @returns {Object} 更新后的 NPC
 */
export function addNpcLog(npc, year, month, content, type = LOG_TYPE.DAILY, isSecret = false) {
  if (!npc) return npc;
  
  // 确保 NPC 有 logs 数组
  const logs = npc.logs || [];
  
  // 创建新日志条目
  const newLog = {
    year,
    month,
    content,
    type,
    isSecret,
    timestamp: Date.now() // 用于排序和去重
  };
  
  // 添加到日志数组开头（最新的在前）
  const updatedLogs = [newLog, ...logs];
  
  // 清理旧日志（保留最近 MAX_LOG_COUNT 条）
  const trimmedLogs = updatedLogs.slice(0, MAX_LOG_COUNT);
  
  return {
    ...npc,
    logs: trimmedLogs
  };
}

/**
 * 替换文本模板中的占位符
 * @param {string} template - 模板文本
 * @param {Object} npc - NPC 对象
 * @param {Object} player - 玩家对象
 * @param {Object} extraParams - 额外参数（如礼物名称、新境界等）
 * @returns {string} 处理后的文本
 */
function fillTemplate(template, npc, player, extraParams = {}) {
  if (!template) return '';
  
  let result = template;
  
  // 基本替换
  result = result.replace(/{playerName}/g, player?.name || '道友');
  result = result.replace(/{npcName}/g, npc?.name || '某人');
  
  // 性别代词替换
  const playerGender = player?.gender || '男';
  const npcGender = npc?.gender || '女';
  
  result = result.replace(/{gender_ta}/g, playerGender === '女' ? '她' : '他');
  result = result.replace(/{gender_Ta}/g, playerGender === '女' ? '她' : '他'); // 大写版本
  
  // 额外参数替换
  Object.keys(extraParams).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, extraParams[key]);
  });
  
  return result;
}

// ==================== 一、交互日志生成 ====================

/**
 * 生成初遇剧情日志
 */
export function generateFirstMeetLog(npc, player, year, month) {
  // 根据NPC身份生成不同的初遇剧情
  let content = '';
  
  if (npc.name === '陆昭') {
    content = `今日在坊市偶遇${player.name}，此人气质不俗，与我攀谈甚欢。虽然我如今落魄，但${player.gender === '女' ? '她' : '他'}并未流露出轻视之意。这世道难得遇到如此真诚之人。或许...这是个机缘。`;
  } else if (npc.name === '慧空') {
    content = `于古刹禅房见到${player.name}，此施主身负因果，佛缘深厚。贫僧观其面相，红尘劫数未了，却有大道之姿。阿弥陀佛，或许这是天意安排，让贫僧在红尘中再历一劫。`;
  } else {
    // 通用初遇模板
    content = `初次见到${player.name}，${player.gender === '女' ? '她' : '他'}给我留下了深刻的印象。或许今后会有更多交集。`;
  }
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成闲聊日志
 */
export function generateChatLog(npc, player, year, month) {
  const affection = npc.relationship?.affection || 0;
  const personality = npc.personality?.label || null;
  const template = getChatTemplateByAffection(affection, personality);
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成赠礼日志
 */
export function generateGiftLog(npc, player, year, month, giftName, isLiked) {
  const personality = npc.personality?.label || null;
  const template = isLiked ? getGiftLikeTemplate(personality) : getGiftDislikeTemplate(personality);
  const content = fillTemplate(template, npc, player, { giftName });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成切磋日志
 */
export function generateSparLog(npc, player, year, month, npcWon) {
  const personality = npc.personality?.label || null;
  const template = npcWon ? getSparWinTemplate(personality) : getSparLoseTemplate(personality);
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成双修日志
 */
export function generateDualCultivationLog(npc, player, year, month) {
  const personality = npc.personality?.label || null;
  const template = getDualCultivationTemplate(personality);
  const content = fillTemplate(template, npc, player);
  
  // 双修日志标记为私密
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION, true);
}

/**
 * 生成吃醋日志（私密，只在日志中展现）
 */
export function generateJealousyLog(npc, player, year, month, targetNpc, jealousyLevel) {
  // 确定醋意等级类型
  let levelType = 'LOW';
  if (jealousyLevel >= 81) levelType = 'EXTREME';
  else if (jealousyLevel >= 61) levelType = 'HIGH';
  else if (jealousyLevel >= 41) levelType = 'MEDIUM';
  else if (jealousyLevel >= 21) levelType = 'LOW';
  else return npc; // 醋意太低，不生成日志
  
  // 获取性格
  const personality = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
  
  // 获取模板
  const templates = jealousyPrivateTemplates[levelType]?.[personality] || jealousyPrivateTemplates[levelType]?.['默认'];
  if (!templates || templates.length === 0) return npc;
  
  const template = randomPick(templates);
  const content = fillTemplate(template, npc, player, { targetName: targetNpc?.name || '那人' });
  
  // 吃醋日志标记为私密
  return addNpcLog(npc, year, month, content, LOG_TYPE.DAILY, true);
}

/**
 * 生成计划讨好玩家的日志（私密）
 */
export function generatePleasePlanLog(npc, player, year, month) {
  const personality = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
  
  const templates = pleasePlayerTemplates[personality] || pleasePlayerTemplates['默认'];
  if (!templates || templates.length === 0) return npc;
  
  const template = randomPick(templates);
  
  // 随机一个玩家喜欢的物品作为占位符
  const favoriteItem = npc.likes?.[0] || '心仪之物';
  const content = fillTemplate(template, npc, player, { favoriteItem });
  
  // 计划日志标记为私密
  return addNpcLog(npc, year, month, content, LOG_TYPE.DAILY, true);
}

/**
 * 生成男性怀孕决定日志（劝生成功后的第一条日志）
 */
export function generatePregnancyDecisionLog(npc, player, year, month) {
  const template = randomPick(malePregnancyDecisionTemplates);
  const content = fillTemplate(template, npc, player);
  
  // 怀孕决定日志标记为私密，为重大状态变更
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, true);
}

/**
 * 生成孕期月度日志
 */
export function generatePregnancyMonthlyLog(npc, player, year, month, pregnancyProgress) {
  // 根据孕期阶段选择模板
  let templates;
  if (pregnancyProgress <= 3) {
    templates = malePregnancyMonthlyTemplates.early;
  } else if (pregnancyProgress <= 6) {
    templates = malePregnancyMonthlyTemplates.mid;
  } else {
    templates = malePregnancyMonthlyTemplates.late;
  }
  
  const template = randomPick(templates);
  const content = fillTemplate(template, npc, player);
  
  // 孕期日志标记为私密，为状态变更
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, true);
}

/**
 * 生成男性分娩日志
 */
export function generateMaleBirthLog(npc, player, year, month, childName) {
  const template = randomPick(maleBirthTemplates);
  const content = fillTemplate(template, npc, player, { childName });
  
  // 分娩日志标记为私密，为重大状态变更
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, true);
}

// ==================== 二、状态变更日志生成 ====================

/**
 * 生成突破日志
 */
export function generateBreakthroughLog(npc, player, year, month, success, newTier) {
  const personality = npc.personality?.label || null;
  const template = success 
    ? getBreakthroughSuccessTemplate(personality) 
    : getBreakthroughFailTemplate(personality);
  const content = fillTemplate(template, npc, player, { 
    newTier: newTier || '未知境界',
    targetTier: newTier || '更高境界'
  });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE);
}

/**
 * 生成结婚日志
 */
export function generateMarriageLog(npc, player, year, month, spouseName) {
  const template = randomPick(marriageTemplates);
  const isMarryingPlayer = spouseName === player?.name;
  const content = fillTemplate(template, npc, player, { 
    spouseName: spouseName || '道侣'
  });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, isMarryingPlayer);
}

/**
 * 生成生子日志
 * 根据NPC性别选择不同的模板（男性使用特殊的生育日志）
 */
export function generateChildbornLog(npc, player, year, month, childName) {
  // 男性使用专门的男性生子模板
  const templates = npc.gender === '男' ? maleBirthTemplates : childbornTemplates;
  const template = randomPick(templates);
  const parentRole = npc.gender === '女' ? '母亲' : '父亲';
  const content = fillTemplate(template, npc, player, { 
    childName: childName || '我的孩子',
    parentRole
  });
  
  // 男性生子日志标记为私密
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, npc.gender === '男');
}

/**
 * 生成寿元将尽日志
 */
export function generateNearDeathLog(npc, player, year, month) {
  const template = randomPick(nearDeathTemplates);
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE, true);
}

/**
 * 生成受伤日志
 */
export function generateInjuryLog(npc, player, year, month, helperName = null) {
  const template = randomPick(severeInjuryTemplates);
  const content = fillTemplate(template, npc, player, { 
    helperName: helperName || '一位好心人'
  });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE);
}

// ==================== 三、日常日志生成（核心） ====================

/**
 * 生成日常模拟日志
 * 这是最复杂的部分，需要根据 NPC 的多种属性来决定内容
 */
export function generateDailyLog(npc, player, year, month) {
  if (!npc) return npc;
  
  // 检查是否处于孕期，如果是则生成孕期日志
  if (npc.isPregnant && npc.pregnancyProgress > 0) {
    return generatePregnancyMonthlyLog(npc, player, year, month, npc.pregnancyProgress);
  }
  
  const affection = npc.relationship?.affection || 0;
  const identity = npc.identity || '散修';
  const personality = npc.personality?.label || '温柔';
  const isSpouse = npc.relationship?.stage >= 3; // 假设 stage 3 表示道侣
  
  // 权重系统：决定这个月 NPC 主要在做什么
  // 增加性格权重,使性格对日志内容的影响更大
  const weights = {
    relationship: 0, // 提及玩家
    identity: 20,    // 身份相关活动（降低）
    personality: 35, // 性格相关活动（大幅提升！）
    event: 10,       // 特殊事件（降低）
    scenery: 35      // 通用场景/无事发生
  };
  
  // 根据关系调整权重
  if (isSpouse) {
    weights.relationship = 60;
    weights.scenery = 10;
  } else if (affection >= 80) {
    weights.relationship = 40;
  } else if (affection >= 50) {
    weights.relationship = 20;
  } else if (affection < 20) {
    weights.relationship = 0;
  }
  
  // 加权随机选择日志类型
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedType = 'scenery';
  
  for (const [type, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }
  
  // 根据选中的类型生成内容
  let template = null;
  let isSecret = false;
  
  switch (selectedType) {
    case 'relationship':
      template = getDailyTemplateByRelationship(npc.relationship?.stage, affection, isSpouse);
      isSecret = affection >= 80; // 暗恋内容标记为私密
      break;
      
    case 'identity':
      template = getDailyTemplateByIdentity(identity);
      break;
      
    case 'personality':
      template = getDailyTemplateByPersonality(personality);
      // 病娇的日志标记为私密
      isSecret = personality === '病娇';
      break;
      
    case 'event':
      // 随机选择一个事件类型
      const eventTypes = [
        sectMissionTemplates,
        adventureTemplates,
        shoppingTemplates,
        socialTemplates,
        seclusionTemplates
      ];
      template = randomPick(randomPick(eventTypes));
      break;
      
    case 'scenery':
    default:
      template = randomPick(sceneryTemplates);
      break;
  }
  
  // 如果模板为空，使用默认内容
  if (!template) {
    template = "今日无事，安心修炼了一整天。";
  }
  
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.DAILY, isSecret);
}

// ==================== 四、批量处理函数 ====================

/**
 * 为所有 NPC 生成本月日志
 * 在每月推进时调用
 * @param {Array} npcs - NPC 数组
 * @param {Object} player - 玩家对象
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @returns {Array} 更新后的 NPC 数组
 */
export function generateMonthlyLogsForAll(npcs, player, year, month) {
  if (!npcs || !Array.isArray(npcs)) return npcs;
  
  return npcs.map(npc => {
    // 检查本月是否已有日志标记（防止重复生成）
    if (npc._hasLogThisMonth) {
      // 重置标记，准备下个月
      const { _hasLogThisMonth, ...cleanNpc } = npc;
      return cleanNpc;
    }
    
    // 检查是否有重大状态变更（突破、结婚等）
    // 这些应该在相应事件发生时就已经添加了日志
    // 这里只处理日常日志
    
    // 生成日常日志
    return generateDailyLog(npc, player, year, month);
  });
}

/**
 * 标记 NPC 本月已有日志（用于交互后防止重复生成日常日志）
 */
export function markNpcLoggedThisMonth(npc) {
  return {
    ...npc,
    _hasLogThisMonth: true
  };
}

// ==================== 五、日志查询与过滤 ====================

/**
 * 获取 NPC 可见的日志（根据好感度过滤私密日志）
 * @param {Object} npc - NPC 对象
 * @param {number} playerAffection - 玩家与该 NPC 的好感度
 * @returns {Array} 可见的日志数组
 */
export function getVisibleLogs(npc, playerAffection = 0) {
  if (!npc || !npc.logs) return [];
  
  // 需要至少 30 好感度才能查看日志
  if (playerAffection < 30) return [];
  
  return npc.logs.filter(log => {
    // 非私密日志直接可见
    if (!log.isSecret) return true;
    
    // 私密日志需要高好感度（80+）才能查看
    return playerAffection >= 80;
  });
}

/**
 * 获取指定时间范围的日志
 */
export function getLogsByTimeRange(npc, startYear, startMonth, endYear, endMonth) {
  if (!npc || !npc.logs) return [];
  
  return npc.logs.filter(log => {
    const logTime = log.year * 12 + log.month;
    const startTime = startYear * 12 + startMonth;
    const endTime = endYear * 12 + endMonth;
    
    return logTime >= startTime && logTime <= endTime;
  });
}

/**
 * 按类型获取日志
 */
export function getLogsByType(npc, type) {
  if (!npc || !npc.logs) return [];
  
  return npc.logs.filter(log => log.type === type);
}

/**
 * 获取最近 N 条日志
 */
export function getRecentLogs(npc, count = 10) {
  if (!npc || !npc.logs) return [];
  
  return npc.logs.slice(0, count);
}
