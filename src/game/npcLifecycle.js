// src/game/npcLifecycle.js
// NPC 生命周期系统：寿元、年龄、修为推进

import { getTierConfig, getNextTier } from './cultivationSystem.js';
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
  
  // 使用与主角相同的修炼速度计算公式（但NPC没有子嗣反哺）
  // 基础速度：10/月
  let speed = 10;
  
  // 1. 资质影响
  const aptitude = updated.stats?.aptitude || 50;
  speed *= (aptitude / 50);
  
  // 2. 灵根影响
  const rootMultiplier = updated.spiritRoot?.multiplier || 0.5;
  speed *= rootMultiplier;
  
  // 3. 功法影响（NPC暂时使用基础功法，系数1.0）
  // 未来可扩展：根据NPC身份和宗门分配特殊功法
  
  // 4. 词条影响（NPC暂时无词条）
  
  // 5. 宗门资源加成
  if (updated.sect && updated.sect.level !== 'NONE' && updated.sectStatus === 'active') {
    speed *= 1.5;
  }
  
  // 6. 攻略对象加成：根据好感度提供修为加成
  const affection = updated.relationship?.affection || 0;
  if (affection >= 20) {
    // 好感度20-39：初步关注，+10%修炼速度
    if (affection < 40) {
      speed *= 1.1;
    }
    // 好感度40-59：好感相关，+20%修炼速度
    else if (affection < 60) {
      speed *= 1.2;
    }
    // 好感度60-79：深度亲密，+30%修炼速度
    else if (affection < 80) {
      speed *= 1.3;
    }
    // 好感度80+：情深意重，+50%修炼速度（道侣级别）
    else {
      speed *= 1.5;
    }
  }
  
  const expGain = Math.floor(speed);
  updated.currentExp = (updated.currentExp || 0) + expGain;
  
  // 记录修炼速度（用于UI显示）
  updated.cultivationSpeed = speed;
  
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
  const nextTier = getNextTier(updated.tier);
  
  if (!tierConfig || !nextTier) {
    return { npc: updated, events };
  }
  
  // 计算突破成功率
  const aptitude = updated.stats?.aptitude || 50;
  const rootMultiplier = updated.spiritRoot?.multiplier || 0.5;
  
  // 基础成功率：从境界配置中获取，随着境界升高而降低
  let successRate = tierConfig.chance || 0.3;
  
  // 资质加成：每10点资质增加3%成功率（降低资质影响）
  successRate += (aptitude / 10) * 0.03;
  
  // 灵根加成：天灵根额外+20%，单灵根+10%等（降低灵根影响）
  successRate += rootMultiplier * 0.2;
  
  // 限制在5%-95%之间
  successRate = Math.max(0.05, Math.min(0.95, successRate));
  
  const success = Math.random() < successRate;
  
  if (success) {
    // 突破成功
    updated.tier = nextTier.name;
    updated.tierTitle = nextTier.name; // 保持兼容性
    updated.currentExp = 0;
    updated.maxExp = nextTier.maxExp;
    
    // 境界突破增加寿命
    if (updated.stats) {
      let lifespanIncrease = 0;
      const newTier = nextTier.name;
      
      // 根据突破的境界增加不同的寿命
      if (newTier.includes('炼气')) {
        lifespanIncrease = 20; // 炼气期每阶+20年
      } else if (newTier.includes('筑基')) {
        lifespanIncrease = 50; // 筑基期每阶+50年
      } else if (newTier.includes('金丹')) {
        lifespanIncrease = 200; // 金丹期每阶+200年
      } else if (newTier.includes('元婴')) {
        lifespanIncrease = 500; // 元婴期+500年
      } else if (newTier.includes('化神')) {
        lifespanIncrease = 1000; // 化神期+1000年
      } else if (newTier.includes('炼虚')) {
        lifespanIncrease = 2000; // 炼虚期+2000年
      } else if (newTier.includes('合体')) {
        lifespanIncrease = 5000; // 合体期+5000年
      } else if (newTier.includes('大乘')) {
        lifespanIncrease = 10000; // 大乘期+10000年
      } else if (newTier.includes('渡劫')) {
        lifespanIncrease = 50000; // 渡劫期+50000年
      }
      
      updated.stats = {
        ...updated.stats,
        lifespan: (updated.stats.lifespan || 100) + lifespanIncrease
      };
    }
    
    // 更新战斗属性
    if (updated.combatStats) {
      const hpBonus = Math.floor(updated.combatStats.maxHp * 0.5);
      const atkBonus = Math.floor(updated.combatStats.atk * 0.3);
      const defBonus = Math.floor((updated.combatStats.def || 0) * 0.2);
      
      updated.combatStats = {
        ...updated.combatStats,
        maxHp: updated.combatStats.maxHp + hpBonus,
        hp: updated.combatStats.maxHp + hpBonus,
        atk: updated.combatStats.atk + atkBonus,
        def: (updated.combatStats.def || 0) + defBonus
      };
    }
    
    // 生成突破成功日志
    updated = generateBreakthroughLog(updated, player, year, month, true, nextTier.name);
    
    events.push({
      type: 'NPC_BREAKTHROUGH',
      npcName: updated.name,
      newTier: nextTier.name,
      message: `${updated.name} 成功突破至 ${nextTier.name}！`
    });
  } else {
    // 突破失败：经验清零，从头开始
    updated.currentExp = 0;
    
    // 生成突破失败日志
    updated = generateBreakthroughLog(updated, player, year, month, false, nextTier.name);
    
    events.push({
      type: 'NPC_BREAKTHROUGH_FAIL',
      npcName: updated.name,
      tier: updated.tier,
      message: `${updated.name} 突破失败，修为散尽，需从头修炼！`
    });
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
    
    // 修为推进（每月都进行持续修炼）
    const result = progressNpcCultivation(updated, player, year, month);
    updated = result.npc;
    allEvents.push(...result.events);
    
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
 * @returns {Object} { allowed, reason, requiresCheck, checkRate }
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
      
      // 佛修特殊判定：第一次双修只有1%概率同意
      if (npc.identity === '佛修') {
        const dualCultivationCount = npc.dualCultivationCount || 0;
        if (dualCultivationCount === 0) {
          // 第一次，需要进行概率判定
          return { allowed: true, requiresCheck: true, checkRate: 0.01 };
        }
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
