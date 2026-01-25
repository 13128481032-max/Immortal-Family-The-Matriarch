// src/game/manualSystem.js
// 功法系统相关的辅助函数

import { SECT_MANUALS, MANUALS, calculateCompatibility, getManualFullInfo } from '../data/manualData.js';

/**
 * 处理子嗣加入宗门，自动学习该宗门的功法
 * @param {Object} child - 子嗣对象
 * @param {string} sectName - 宗门名称
 * @returns {string|null} 功法获得消息
 */
export const assignSectManual = (child, sectName) => {
  // 检查宗门是否有对应的功法
  if (SECT_MANUALS[sectName]) {
    const manualId = SECT_MANUALS[sectName];
    child.cultivationMethod = manualId;
    const manualName = MANUALS[manualId]?.name || manualId;
    return `${child.name} 加入 ${sectName}，习得【${manualName}】！`;
  }
  
  return null;
};

/**
 * 更换子嗣的修炼功法
 * @param {Object} child - 子嗣对象
 * @param {string} manualId - 新功法ID
 * @returns {Object} {success: boolean, message: string}
 */
export const changeManual = (child, manualId) => {
  const manual = MANUALS[manualId];
  if (!manual) {
    return { success: false, message: '功法不存在！' };
  }
  
  const oldManualId = child.cultivationMethod;
  const oldManual = MANUALS[oldManualId];
  
  child.cultivationMethod = manualId;
  
  // 计算新功法的契合度
  const compatibility = calculateCompatibility(manualId, child.spiritRoot);
  
  return {
    success: true,
    message: `${child.name} 从【${oldManual?.name || '吐纳法'}】改修【${manual.name}】`,
    compatibility: compatibility
  };
};

/**
 * 获取功法与灵根的契合度信息（用于UI显示）
 * @param {string} manualId - 功法ID
 * @param {Object} spiritRoot - 灵根对象
 * @returns {Object} 契合度信息
 */
export const getManualCompatibilityInfo = (manualId, spiritRoot) => {
  const manual = getManualFullInfo(manualId);
  if (!manual) {
    return {
      manual: null,
      compatibility: null
    };
  }
  
  const compatibility = calculateCompatibility(manualId, spiritRoot);
  
  return {
    manual,
    compatibility,
    speedBonus: `${((compatibility.compatibility * manual.baseBuff) * 100).toFixed(0)}%`
  };
};

/**
 * 获取推荐功法列表
 * @param {Object} spiritRoot - 灵根对象
 * @param {Array} availableManuals - 可用功法ID列表（玩家拥有的功法）
 * @returns {Array} 推荐功法列表，按契合度排序
 */
export const getRecommendedManuals = (spiritRoot, availableManuals = null) => {
  const manualsToCheck = availableManuals || Object.keys(MANUALS);
  
  const recommendations = manualsToCheck.map(manualId => {
    const info = getManualCompatibilityInfo(manualId, spiritRoot);
    return {
      ...info,
      manualId
    };
  }).filter(item => item.manual !== null);
  
  // 按契合度排序（从高到低）
  recommendations.sort((a, b) => {
    return b.compatibility.compatibility - a.compatibility.compatibility;
  });
  
  return recommendations;
};
