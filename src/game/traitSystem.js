// src/game/traitSystem.js

// 稀有度颜色配置
export const RARITY_CONFIG = {
  GRAY:   { color: '#9e9e9e', bg: '#eeeeee', border: '#bdbdbd', label: '下品' },
  WHITE:  { color: '#616161', bg: '#f5f5f5', border: '#e0e0e0', label: '凡品' },
  GREEN:  { color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', label: '良品' },
  BLUE:   { color: '#1565c0', bg: '#e3f2fd', border: '#90caf9', label: '上品' },
  PURPLE: { color: '#7b1fa2', bg: '#f3e5f5', border: '#ce93d8', label: '极品' },
  ORANGE: { color: '#ef6c00', bg: '#fff3e0', border: '#ffcc80', label: '绝世' },
  RED:    { color: '#c62828', bg: '#ffebee', border: '#ef9a9a', label: '神话', shadow: '0 0 5px rgba(198, 40, 40, 0.5)' }
};

// 1. 容貌词条库 (0-100+)
const LOOKS_TIERS = [
  { min: 0,  max: 20,  text: "面目全非", rarity: "GRAY" },
  { min: 21, max: 40,  text: "其貌不扬", rarity: "WHITE" },
  { min: 41, max: 60,  text: "五官端正", rarity: "GREEN" },
  { min: 61, max: 79,  text: "眉清目秀", rarity: "BLUE" },
  { min: 80, max: 89,  text: "玉树临风", rarity: "PURPLE" }, // 女版需做区分，见下文函数
  { min: 90, max: 99,  text: "倾国倾城", rarity: "ORANGE" },
  { min: 100, max: 999, text: "谪仙降世", rarity: "RED" }
];

// 2. 悟性/智力词条库 (0-100+)
const INT_TIERS = [
  { min: 0,  max: 20,  text: "愚不可及", rarity: "GRAY" },
  { min: 21, max: 40,  text: "资质平庸", rarity: "WHITE" },
  { min: 41, max: 60,  text: "略有慧根", rarity: "GREEN" },
  { min: 61, max: 79,  text: "颖悟绝伦", rarity: "BLUE" },
  { min: 80, max: 89,  text: "七窍玲珑", rarity: "PURPLE" },
  { min: 90, max: 99,  text: "生而知之", rarity: "ORANGE" },
  { min: 100, max: 999, text: "道法自然", rarity: "RED" }
];

/**
 * 核心转换函数
 * @param {Number} value 数值
 * @param {String} type 类型 'LOOKS' | 'INT'
 * @param {String} gender 性别 '男' | '女' (仅容貌需要)
 */
export const getTraitByValue = (value, type, gender = '男') => {
  let tiers = type === 'INT' ? INT_TIERS : LOOKS_TIERS;

  // 查找匹配的区间
  let trait = tiers.find(t => value >= t.min && value <= t.max) || tiers[0];

  // 处理性别差异 (仅针对容貌的高级词条)
  let text = trait.text;
  if (type === 'LOOKS' && gender === '女') {
    if (text === "玉树临风") text = "亭亭玉立";
    if (text === "面目全非") text = "东施效颦";
  }

  return {
    text: text,
    rarity: trait.rarity,
    value: value, // 保留原始数值用于debug或悬浮显示
    style: RARITY_CONFIG[trait.rarity]
  };
};