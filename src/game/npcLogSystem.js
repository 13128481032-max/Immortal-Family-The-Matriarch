// src/game/npcLogSystem.js
// NPC 第一人称日志生成系统

import {
  getChatTemplateByAffection,
  giftLikeTemplates,
  giftDislikeTemplates,
  sparWinTemplates,
  sparLoseTemplates,
  dualCultivationTemplates,
  breakthroughSuccessTemplates,
  breakthroughFailTemplates,
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
 * 生成闲聊日志
 */
export function generateChatLog(npc, player, year, month) {
  const affection = npc.relationship?.affection || 0;
  const template = getChatTemplateByAffection(affection);
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成赠礼日志
 */
export function generateGiftLog(npc, player, year, month, giftName, isLiked) {
  const templates = isLiked ? giftLikeTemplates : giftDislikeTemplates;
  const template = randomPick(templates);
  const content = fillTemplate(template, npc, player, { giftName });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成切磋日志
 */
export function generateSparLog(npc, player, year, month, npcWon) {
  const templates = npcWon ? sparWinTemplates : sparLoseTemplates;
  const template = randomPick(templates);
  const content = fillTemplate(template, npc, player);
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION);
}

/**
 * 生成双修日志
 */
export function generateDualCultivationLog(npc, player, year, month) {
  const template = randomPick(dualCultivationTemplates);
  const content = fillTemplate(template, npc, player);
  
  // 双修日志标记为私密
  return addNpcLog(npc, year, month, content, LOG_TYPE.INTERACTION, true);
}

// ==================== 二、状态变更日志生成 ====================

/**
 * 生成突破日志
 */
export function generateBreakthroughLog(npc, player, year, month, success, newTier) {
  const templates = success ? breakthroughSuccessTemplates : breakthroughFailTemplates;
  const template = randomPick(templates);
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
 */
export function generateChildbornLog(npc, player, year, month, childName) {
  const template = randomPick(childbornTemplates);
  const parentRole = npc.gender === '女' ? '母亲' : '父亲';
  const content = fillTemplate(template, npc, player, { 
    childName: childName || '我的孩子',
    parentRole
  });
  
  return addNpcLog(npc, year, month, content, LOG_TYPE.STATE_CHANGE);
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
  
  const affection = npc.relationship?.affection || 0;
  const identity = npc.identity || '散修';
  const personality = npc.personality?.label || '温柔';
  const isSpouse = npc.relationship?.stage >= 3; // 假设 stage 3 表示道侣
  
  // 权重系统：决定这个月 NPC 主要在做什么
  const weights = {
    relationship: 0, // 提及玩家
    identity: 30,    // 身份相关活动
    personality: 20, // 性格相关活动
    event: 15,       // 特殊事件（任务、探险等）
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
