// src/game/worldEventsSystem.js
// 修仙大陆纪事生成系统

import {
  getAllEventPools,
  getEventPoolByType,
  randomPick
} from '../data/worldEvents.js';

/**
 * 生成本月的修仙大陆事件
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @param {Object} player - 玩家对象（可用于根据玩家状态影响事件）
 * @returns {Array} 事件数组
 */
export const generateMonthlyWorldEvents = (year, month, player = null) => {
  const events = [];
  const allPools = getAllEventPools();
  
  // 每月有概率生成1-3个大陆事件
  const eventCount = getMonthlyEventCount(year, month);
  
  for (let i = 0; i < eventCount; i++) {
    const event = generateSingleWorldEvent(year, month, player);
    if (event) {
      events.push(event);
    }
  }
  
  return events;
};

/**
 * 生成单个世界事件
 */
const generateSingleWorldEvent = (year, month, player) => {
  const allPools = getAllEventPools();
  
  // 根据概率选择事件池
  const selectedPool = selectEventPoolByProbability(allPools);
  if (!selectedPool || !selectedPool.templates || selectedPool.templates.length === 0) {
    return null;
  }
  
  // 从选中的池中随机选择一个模板
  const template = randomPick(selectedPool.templates);
  if (!template) return null;
  
  return {
    type: selectedPool.type,
    category: '大陆纪事', // 用于前端分类显示
    title: selectedPool.title,
    message: template,
    year,
    month,
    importance: getEventImportance(selectedPool.type), // 重要度（用于排序和显示）
    timestamp: Date.now()
  };
};

/**
 * 根据概率选择事件池
 */
const selectEventPoolByProbability = (pools) => {
  // 计算总概率
  const totalProb = pools.reduce((sum, pool) => sum + (pool.probability || 0), 0);
  
  // 生成随机数
  let random = Math.random() * totalProb;
  
  // 选择事件池
  for (const pool of pools) {
    random -= pool.probability || 0;
    if (random <= 0) {
      return pool;
    }
  }
  
  // 如果没有选中（理论上不会发生），返回第一个
  return pools[0];
};

/**
 * 决定本月生成多少个事件
 */
const getMonthlyEventCount = (year, month) => {
  // 春节（第1月）和特殊月份可能有更多事件
  if (month === 1 || month === 7) {
    const rand = Math.random();
    if (rand < 0.3) return 3; // 30% 概率3个事件
    if (rand < 0.7) return 2; // 40% 概率2个事件
    return 1; // 30% 概率1个事件
  }
  
  // 普通月份
  const rand = Math.random();
  if (rand < 0.5) return 1; // 50% 概率1个事件
  if (rand < 0.8) return 2; // 30% 概率2个事件
  return 0; // 20% 概率没有事件
};

/**
 * 获取事件重要度（用于UI展示优先级）
 */
const getEventImportance = (type) => {
  const importanceMap = {
    DISASTER: 5,    // 最重要
    POLITICS: 4,
    GENIUS: 4,
    SECT: 3,
    REALM: 3,
    TREASURE: 3,
    FAMOUS: 2,
    DAILY: 1        // 最不重要
  };
  return importanceMap[type] || 2;
};

/**
 * 生成特殊事件（用于剧情触发）
 * @param {string} eventType - 事件类型
 * @param {string} customMessage - 自定义消息
 */
export const generateSpecialWorldEvent = (eventType, customMessage, year, month) => {
  return {
    type: eventType,
    category: '大陆纪事',
    title: '特殊事件',
    message: customMessage,
    year,
    month,
    importance: 5,
    timestamp: Date.now()
  };
};

/**
 * 根据玩家行为生成关联事件
 * 例如：玩家子女加入某宗门后，可能触发该宗门的相关事件
 */
export const generatePlayerRelatedEvent = (player, children, year, month) => {
  // 如果玩家有子女在顶级宗门
  const childrenInTopSects = children.filter(child => 
    child.sect && ['TOP', 'HIGH'].includes(child.sect.level)
  );
  
  if (childrenInTopSects.length > 0 && Math.random() < 0.2) {
    const child = randomPick(childrenInTopSects);
    const sectName = child.sect.name;
    
    const messages = [
      `【${sectName}】今日宗门大比，弟子${child.name}表现出色，引起长老关注。`,
      `【${sectName}】${child.name}在秘境试炼中表现优异，获得宗门奖励。`,
      `【${sectName}】${child.name}与同门切磋，展现出不俗实力。`
    ];
    
    return {
      type: 'SECT',
      category: '大陆纪事',
      title: '宗门动态',
      message: randomPick(messages),
      year,
      month,
      importance: 3,
      relatedChild: child.id, // 关联的子女ID
      timestamp: Date.now()
    };
  }
  
  return null;
};

/**
 * 过滤和排序事件
 */
export const sortEventsByImportance = (events) => {
  return events.sort((a, b) => {
    // 先按重要度排序
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    // 再按时间排序（新的在前）
    return b.timestamp - a.timestamp;
  });
};

/**
 * 获取事件的图标
 */
export const getEventIcon = (type) => {
  const iconMap = {
    SECT: '🏛️',
    GENIUS: '⚔️',
    TREASURE: '💎',
    REALM: '🌌',
    DISASTER: '⚠️',
    POLITICS: '📜',
    DAILY: '📰',
    FAMOUS: '👑'
  };
  return iconMap[type] || '📝';
};

/**
 * 获取事件的颜色
 */
export const getEventColor = (type) => {
  const colorMap = {
    SECT: '#4A90E2',      // 蓝色
    GENIUS: '#E74C3C',    // 红色
    TREASURE: '#F39C12',  // 金色
    REALM: '#9B59B6',     // 紫色
    DISASTER: '#E67E22',  // 橙色
    POLITICS: '#16A085',  // 青色
    DAILY: '#95A5A6',     // 灰色
    FAMOUS: '#D4AF37'     // 金黄色
  };
  return colorMap[type] || '#7F8C8D';
};
