/**
 * 颜色辅助函数
 * 统一管理所有颜色相关的工具函数
 */

/**
 * 根据资质返回颜色
 * @param {number} aptitude - 资质值
 * @returns {string} 十六进制颜色值
 */
export const getTierColor = (aptitude) => {
  if (aptitude >= 90) return '#FFD700'; // 金色 (天灵根)
  if (aptitude >= 80) return '#9C27B0'; // 紫色 (单灵根)
  if (aptitude >= 60) return '#2196F3'; // 蓝色 (双灵根)
  return '#4CAF50'; // 绿色 (凡人)
};

/**
 * 根据灵根类型返回颜色
 * @param {string} spiritRootType - 灵根类型
 * @returns {string} 十六进制颜色值
 */
export const getSpiritColor = (spiritRootType) => {
  const colorMap = {
    "天灵根": "#FFD700", // 金色
    "双灵根": "#9C27B0", // 紫色
    "三灵根": "#2196F3", // 蓝色
    "四灵根": "#4CAF50", // 绿色
    "五灵根": "#9E9E9E", // 灰色
    "变异灵根": "#00BCD4" // 青色
  };
  return colorMap[spiritRootType] || "#9E9E9E";
};
