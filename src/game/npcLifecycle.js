// src/game/npcLifecycle.js
// NPC 生命周期系统：寿元、年龄、修为推进

import { getTierConfig } from './cultivationSystem.js';
import { generateBreakthroughLog, generateNearDeathLog } from './npcLogSystem.js';

/**
 * 计算 NPC 的剩余寿元
 * @param {Object} npc - NPC对象
 * @returns {number} 剩余寿元（年）
 */
export function calculateRemainingLifespan(npc) {
  if (!npc || !npc.stats) return 0;
  
  const baseLifespan = npc.stats.lifespan || 100;
  const age = npc.age || 18;
  const remaining = baseLifespan - age;
  
  return Math.max(0, remaining);
}

/**
 * 检查 NPC 是否临近死亡（剩余寿元 < 10年）
 */
export function isNearDeath(npc) {
  return calculateRemainingLifespan(npc) < 10;
}

/**
 * NPC 年龄增长（每年调用一次）
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @returns {Object} 更新后的 NPC
 */
export function ageNpc(npc, player, year, month) {
  if (!npc) return npc;
  
  const newAge = (npc.age || 18) + 1;
  let updated = { ...npc, age: newAge };
  
  // 检查是否临近死亡（剩余寿元 < 10年）
  const remaining = calculateRemainingLifespan(updated);
  
  if (remaining <= 0) {
    // 寿元耗尽，NPC死亡
    updated = {
      ...updated,
      isDead: true,
      deathReason: '寿元耗尽，坐化而逝'
    };
  } else if (remaining < 10 && !npc._nearDeathLogged) {
    // 临近死亡，生成日志（只记录一次）
    updated = generateNearDeathLog(updated, player, year, month);
    updated._nearDeathLogged = true;
  }
  
  return updated;
}

/**
 * NPC 自动修为推进
 * 每月有一定概率获得经验，经验满后可能突破
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @returns {Object} 更新后的 NPC 和事件日志
 */
export function progressNpcCultivation(npc, player, year, month) {
  if (!npc || npc.isDead) {
    return { npc, events: [] };
  }
  
  const events = [];
  let updated = { ...npc };
  
  // 初始化经验值
  if (!updated.currentExp) updated.currentExp = 0;
  if (!updated.tier) updated.tier = '凡人';
  
  // 获取当前境界配置
  const tierConfig = getTierConfig(updated.tier);
  if (!tierConfig) {
    return { npc: updated, events };
  }
  
  // 根据资质和灵根计算修炼速度
  const aptitude = updated.stats?.aptitude || 50;
  const rootMultiplier = updated.spiritRoot?.multiplier || 0.5;
  
  // 基础经验增长：1-5点/月
  const baseGain = Math.floor(Math.random() * 5) + 1;
  // 资质加成：资质越高，增长越快
  const aptBonus = Math.floor(aptitude / 20);
  // 灵根加成
  const rootBonus = Math.floor(rootMultiplier * 3);
  
  const expGain = baseGain + aptBonus + rootBonus;
  updated.currentExp = (updated.currentExp || 0) + expGain;
  
  // 检查是否达到突破条件
  if (updated.currentExp >= tierConfig.maxExp) {
    // 尝试突破
    const breakthrough = attemptNpcBreakthrough(updated, player, year, month);
    updated = breakthrough.npc;
    events.push(...breakthrough.events);
  }
  
  return { npc: updated, events };
}

/**
 * NPC 尝试突破境界
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @returns {Object} { npc, events }
 */
function attemptNpcBreakthrough(npc, player, year, month) {
  const events = [];
  let updated = { ...npc };
  
  const tierConfig = getTierConfig(updated.tier);
  if (!tierConfig || !tierConfig.nextTier) {
    return { npc: updated, events };
  }
  
  // 计算突破成功率
  const aptitude = updated.stats?.aptitude || 50;
  const rootMultiplier = updated.spiritRoot?.multiplier || 0.5;
  
  // 基础成功率：30%
  let successRate = 0.3;
  // 资质加成：每10点资质增加5%成功率
  successRate += (aptitude / 10) * 0.05;
  // 灵根加成：天灵根额外+30%，单灵根+15%等
  successRate += rootMultiplier * 0.3;
  
  // 限制在10%-90%之间
  successRate = Math.max(0.1, Math.min(0.9, successRate));
  
  const success = Math.random() < successRate;
  
  if (success) {
    // 突破成功
    const nextTierConfig = getTierConfig(tierConfig.nextTier);
    updated.tier = tierConfig.nextTier;
    updated.tierTitle = tierConfig.nextTier; // 保持兼容性
    updated.currentExp = 0;
    updated.maxExp = nextTierConfig?.maxExp || 100;
    
    // 更新战斗属性
    if (updated.combatStats && nextTierConfig) {
      const hpBonus = Math.floor(updated.combatStats.maxHp * 0.5);
      const atkBonus = Math.floor(updated.combatStats.atk * 0.3);
      const defBonus = Math.floor(updated.combatStats.def * 0.2);
      
      updated.combatStats = {
        ...updated.combatStats,
        maxHp: updated.combatStats.maxHp + hpBonus,
        hp: updated.combatStats.maxHp + hpBonus,
        atk: updated.combatStats.atk + atkBonus,
        def: updated.combatStats.def + defBonus
      };
    }
    
    // 生成突破成功日志
    updated = generateBreakthroughLog(updated, player, year, month, true, tierConfig.nextTier);
    
    events.push({
      type: 'NPC_BREAKTHROUGH',
      npcName: updated.name,
      newTier: tierConfig.nextTier,
      message: `${updated.name} 成功突破至 ${tierConfig.nextTier}！`
    });
  } else {
    // 突破失败
    updated.currentExp = Math.floor(updated.currentExp * 0.7); // 损失30%经验
    
    // 生成突破失败日志
    updated = generateBreakthroughLog(updated, player, year, month, false, tierConfig.nextTier);
  }
  
  return { npc: updated, events };
}

/**
 * 批量处理所有 NPC 的生命周期
 * 在每月推进时调用
 * @param {Array} npcs - NPC数组
 * @param {Object} player - 玩家对象
 * @param {number} year - 当前年份
 * @param {number} month - 当前月份
 * @returns {Object} { npcs, events }
 */
export function processNpcLifecycles(npcs, player, year, month) {
  if (!npcs || !Array.isArray(npcs)) {
    return { npcs: npcs || [], events: [] };
  }
  
  const allEvents = [];
  
  // 每12个月（一年）处理一次年龄增长
  const shouldAge = month === 1; // 每年第一个月增长年龄
  
  const updatedNpcs = npcs.map(npc => {
    let updated = npc;
    
    // 跳过已死亡的 NPC
    if (updated.isDead) return updated;
    
    // 年龄增长
    if (shouldAge) {
      updated = ageNpc(updated, player, year, month);
      
      // 如果死亡，记录事件
      if (updated.isDead) {
        allEvents.push({
          type: 'NPC_DEATH',
          npcName: updated.name,
          reason: updated.deathReason,
          message: `${updated.name} ${updated.deathReason}。`
        });
        return updated;
      }
    }
    
    // 修为推进（每月都进行，但概率性）
    // 为了避免太快，只有20%概率进行修炼
    if (Math.random() < 0.2) {
      const result = progressNpcCultivation(updated, player, year, month);
      updated = result.npc;
      allEvents.push(...result.events);
    }
    
    return updated;
  });
  
  return { npcs: updatedNpcs, events: allEvents };
}

/**
 * 关系状态枚举
 */
export const RELATIONSHIP_STATUS = {
  HOSTILE: 'HOSTILE',   // 敌对（好感度 < 0）
  NEUTRAL: 'NEUTRAL',   // 中立（0 <= 好感度 < 50）
  FRIENDLY: 'FRIENDLY', // 友好（50 <= 好感度 < 80）
  INTIMATE: 'INTIMATE'  // 亲密（好感度 >= 80）
};

/**
 * 根据好感度获取关系状态
 * @param {number} affection - 好感度
 * @returns {string} 关系状态
 */
export function getRelationshipStatus(affection = 0) {
  if (affection < 0) return RELATIONSHIP_STATUS.HOSTILE;
  if (affection < 50) return RELATIONSHIP_STATUS.NEUTRAL;
  if (affection < 80) return RELATIONSHIP_STATUS.FRIENDLY;
  return RELATIONSHIP_STATUS.INTIMATE;
}

/**
 * 获取关系状态的显示文本和颜色
 * @param {string} status - 关系状态
 * @returns {Object} { text, color, icon }
 */
export function getRelationshipStatusDisplay(status) {
  const displays = {
    [RELATIONSHIP_STATUS.HOSTILE]: { text: '敌对', color: '#f44336', icon: '⚔️' },
    [RELATIONSHIP_STATUS.NEUTRAL]: { text: '中立', color: '#9e9e9e', icon: '🤝' },
    [RELATIONSHIP_STATUS.FRIENDLY]: { text: '友好', color: '#4caf50', icon: '😊' },
    [RELATIONSHIP_STATUS.INTIMATE]: { text: '亲密', color: '#e91e63', icon: '💖' }
  };
  
  return displays[status] || displays[RELATIONSHIP_STATUS.NEUTRAL];
}

/**
 * 检查是否可以进行某项互动（根据关系状态）
 * @param {Object} npc - NPC对象
 * @param {string} actionType - 互动类型
 * @returns {Object} { allowed, reason }
 */
export function checkInteractionAllowed(npc, actionType) {
  const affection = npc.relationship?.affection || 0;
  const status = getRelationshipStatus(affection);
  
  switch (actionType) {
    case 'DUAL_CULTIVATION':
      // 双修需要亲密关系（80+好感）
      if (status !== RELATIONSHIP_STATUS.INTIMATE) {
        return { allowed: false, reason: '需要亲密关系才能双修（好感度 >= 80）' };
      }
      break;
      
    case 'GIFT':
      // 敌对状态不能送礼
      if (status === RELATIONSHIP_STATUS.HOSTILE) {
        return { allowed: false, reason: '敌对状态无法赠礼' };
      }
      break;
      
    case 'SPAR':
      // 切磋需要至少中立关系
      if (status === RELATIONSHIP_STATUS.HOSTILE) {
        return { allowed: false, reason: '敌对状态只能生死搏杀，无法切磋' };
      }
      break;
      
    case 'CHAT':
      // 聊天任何状态都可以，但敌对状态会减好感
      break;
      
    default:
      break;
  }
  
  return { allowed: true };
}
