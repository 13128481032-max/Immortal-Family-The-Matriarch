/**
 * 数组辅助函数
 * 统一管理所有数组操作相关的工具函数
 */

/**
 * 随机从数组中选择一个元素
 * @param {Array} array - 源数组
 * @returns {*} 随机选中的元素，如果数组为空返回null
 */
export const randomPick = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 随机从数组中选择多个不重复的元素
 * @param {Array} array - 源数组
 * @param {number} count - 要选择的元素数量
 * @returns {Array} 随机选中的元素数组
 */
export const randomPickMultiple = (array, count) => {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
};

/**
 * 根据权重随机选择
 * @param {Array} items - 项目数组
 * @param {Function} weightFn - 权重函数，接收item返回权重值
 * @returns {*} 随机选中的元素
 */
export const randomPickWeighted = (items, weightFn) => {
  if (!items || items.length === 0) return null;
  
  const weights = items.map(weightFn);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  let random = Math.random() * totalWeight;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[items.length - 1];
};
