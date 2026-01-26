// src/game/cultivationSystem.js
import { getManualSpeedMultiplier } from '../data/manualData.js';

// 1. 灵根定义
export const SPIRIT_ROOTS = {
  HEAVEN: {
    id: "HEAVEN", name: "天灵根", color: "#FFD700", // 金色
    min: 90, max: 100, elementCount: 1,
    multiplier: 2.5, desc: "天道宠儿，单一五行圆满，修炼一日千里。"
  },
  MUTANT: {
    id: "MUTANT", name: "变异灵根", color: "#00BCD4", // 青色
    min: 80, max: 89, elementCount: 1, // 通常也是单系变异
    multiplier: 2.0, desc: "灵根发生异变(雷/冰/风)，杀伐战力第一。"
  },
  SINGLE: {
    id: "SINGLE", name: "单灵根", color: "#9C27B0", // 紫色
    min: 80, max: 89, elementCount: 1,
    multiplier: 1.8, desc: "五行归一，虽不及天灵根纯净，亦是人中龙凤。"
  },
  DOUBLE: {
    id: "DOUBLE", name: "双灵根", color: "#2196F3", // 蓝色
    min: 60, max: 79, elementCount: 2,
    multiplier: 1.5, desc: "双系调和，互为表里，乃宗门中坚力量。"
  },
  TRIPLE: {
    id: "TRIPLE", name: "三灵根", color: "#4CAF50", // 绿色
    min: 40, max: 59, elementCount: 3,
    multiplier: 1.0, desc: "三系驳杂，修炼平平，需勤能补拙。"
  },
  QUAD:   {
    id: "QUAD", name: "四灵根", color: "#FF9800", // 橙色/土黄
    min: 20, max: 39, elementCount: 4,
    multiplier: 0.8, desc: "四系混乱，灵气难聚，筑基艰难。"
  },
  WASTE:  {
    id: "WASTE", name: "五灵根", color: "#9E9E9E", // 灰色
    min: 1, max: 19, elementCount: 5,
    multiplier: 0.5, desc: "五行俱全却如杂草，伪灵根也，仙途无望。"
  },
  NONE:   {
    id: "NONE", name: "凡人", color: "#000000",
    min: 0, max: 0, elementCount: 0,
    multiplier: 0, desc: "无灵根，无法感应天地灵气。"
  }
};

export const ELEMENTS = ["金", "木", "水", "火", "土"];
export const MUTANT_ELEMENTS = ["雷", "冰", "风"];

// 辅助函数：根据具体数值返回对应的灵根配置
export const getRootConfigByValue = (val) => {
  if (val <= 0) return SPIRIT_ROOTS.NONE;
  // 特殊处理：80-89区间有概率是变异，大部分是单灵根
  if (val >= 80 && val < 90) {
    return Math.random() < 0.2 ? SPIRIT_ROOTS.MUTANT : SPIRIT_ROOTS.SINGLE;
  }
  
  return Object.values(SPIRIT_ROOTS).find(r => val >= r.min && val <= r.max) || SPIRIT_ROOTS.WASTE;
};

// 2. 境界数值设定
export const TIERS = [
  // 炼气期：容易突破，反哺低
  { name: "凡人", maxExp: 100, feedback: 0, chance: 1.0, desc: "肉体凡胎" },
  { name: "炼气初期", maxExp: 500, feedback: 1, chance: 0.95, desc: "引气入体" },
  { name: "炼气中期", maxExp: 1000, feedback: 2, chance: 0.90, desc: "气行周天" },
  { name: "炼气后期", maxExp: 2000, feedback: 3, chance: 0.85, desc: "灵气充盈" },
  { name: "炼气圆满", maxExp: 5000, feedback: 5, chance: 0.80, desc: "瓶颈将至" },
  
  // 筑基期：难度陡增
  { name: "筑基初期", maxExp: 20000, feedback: 20, chance: 0.60, desc: "铸就道基" },
  { name: "筑基中期", maxExp: 50000, feedback: 30, chance: 0.50, desc: "道基稳固" },
  { name: "筑基后期", maxExp: 80000, feedback: 40, chance: 0.40, desc: "准备结丹" },
  
  // 金丹期：分水岭
  { name: "金丹初期", maxExp: 200000, feedback: 100, chance: 0.30, desc: "金丹大道" },
  { name: "金丹中期", maxExp: 500000, feedback: 150, chance: 0.25, desc: "丹纹九转" },
  
  // 元婴期：极难
  { name: "元婴老祖", maxExp: 2000000, feedback: 500, chance: 0.10, desc: "碎丹成婴" }
];

// 辅助：获取下一阶
export const getNextTier = (currentName) => {
  const idx = TIERS.findIndex(t => t.name === currentName);
  if (idx === -1 || idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
};

// 辅助：获取当前阶的配置
export const getTierConfig = (currentName) => {
  return TIERS.find(t => t.name === currentName) || TIERS[0];
};

// 2. 战斗属性计算公式
// 战力 = 境界基础值 * (1 + 灵根加成) * (1 + 资质加成) + 装备加成
// equipment: { weapon, armor, accessory }
export const calculateStats = (tierName, aptitude, spiritRootType, equipment = null) => {
  // 基础模版 (随境界指数提升)
  const baseStats = {
    "凡人":      { hp: 100, atk: 5, mp: 0 },
    "炼气初期":  { hp: 500, atk: 50, mp: 200 },
    "炼气中期":  { hp: 800, atk: 80, mp: 400 },
    "炼气后期":  { hp: 1200, atk: 120, mp: 600 },
    "炼气圆满":  { hp: 2000, atk: 200, mp: 1000 },
    "筑基初期":  { hp: 10000, atk: 1000, mp: 5000 },
    "筑基中期":  { hp: 15000, atk: 1500, mp: 8000 },
    "筑基后期":  { hp: 20000, atk: 2000, mp: 12000 },
    "金丹初期":  { hp: 100000, atk: 10000, mp: 50000 }
  };

  const base = baseStats[tierName] || baseStats["凡人"];
  
  // 灵根修正
  let mod = 1.0;
  Object.values(SPIRIT_ROOTS).forEach(r => {
    if(r.name === spiritRootType) mod = r.multiplier;
  });

  // 资质修正 (aptitude 0-100)
  const aptMod = 1 + (aptitude / 100);

  let hp = Math.floor(base.hp * mod * aptMod);
  let atk = Math.floor(base.atk * mod * aptMod);
  let mp = Math.floor(base.mp * mod * aptMod);

  // 装备累加（允许空值）
  const equips = equipment ? Object.values(equipment).filter(Boolean) : [];
  equips.forEach(item => {
    const bonus = item.stats || {};
    hp += bonus.hp || 0;
    atk += bonus.atk || 0;
    mp += bonus.mp || 0;
  });

  return {
    hp,
    maxHp: hp,
    atk,
    mp,
    maxMp: mp
  };
};

// 2. 抓周词条库
export const TRAITS = [
  // --- 🔴 神话 ---
  { name: "转世大能", rarity: "RED", effect: 3.0, desc: "修炼速度+200%，无视瓶颈", cost: 0 },
  { name: "天道私生子", rarity: "RED", effect: 2.5, desc: "气运加身，出门必捡宝", cost: 0 },
  // --- 🟠 绝世 ---
  { name: "过目不忘", rarity: "ORANGE", effect: 2.0, desc: "修炼速度+100%", cost: 0 },
  { name: "剑心通明", rarity: "ORANGE", effect: 1.8, desc: "剑修宗门晋升率100%", cost: 0 },
  // --- 🟣 极品 ---
  { name: "天生神力", rarity: "PURPLE", effect: 1.5, desc: "修炼速度+50%", cost: 0 },
  { name: "玲珑七窍", rarity: "PURPLE", effect: 1.5, desc: "悟性极高", cost: 0 },
  // --- 🔵 上品 ---
  { name: "早慧", rarity: "BLUE", effect: 1.2, desc: "修炼速度+20%", cost: 0 },
  { name: "专注", rarity: "BLUE", effect: 1.2, desc: "心无旁骛", cost: 0 },
  // --- 🟢 良品 ---
  { name: "强壮", rarity: "GREEN", effect: 1.1, desc: "身体健康", cost: 0 },
  { name: "机灵", rarity: "GREEN", effect: 1.1, desc: "讨人喜欢", cost: 0 },
  // --- ⚪ 凡品 ---
  { name: "贪吃", rarity: "WHITE", effect: 0.9, desc: "消耗更多灵石", cost: 5 },
  { name: "懒惰", rarity: "WHITE", effect: 0.8, desc: "修炼速度-20%", cost: 0 },
];

// 3. 宗门设定
export const SECTS = [
  // === 顶级宗门 (minApt: 80+) ===
  {
    id: 'SWORD', name: "凌霄宗", level: "TOP", minApt: 80, tuition: 500,
    prefElements: ['金'], buff: 1.5, risk: 0.02,
    resourceTypes: ['剑法秘籍','灵器宝石'],
    initialRankProb: { '真传弟子': 0.15, '内门弟子': 0.35, '外门弟子': 0.5 },
    exclusiveWith: ['DEMON','GHOST'],
    desc: "天下第一剑宗，偏好金灵根、高悟性。"
  },
  {
    id: 'HEAVEN_EMPEROR', name: "天帝宗", level: "TOP", minApt: 85, tuition: 600,
    prefElements: ['雷','火'], buff: 1.6, risk: 0.03,
    resourceTypes: ['帝经传承','天材地宝'],
    initialRankProb: { '真传弟子': 0.2, '内门弟子': 0.4, '外门弟子': 0.4 },
    exclusiveWith: ['DEMON','GHOST'],
    desc: "修仙界最强正道宗门，只收天灵根或变异灵根。"
  },
  
  // === 高级宗门 (minApt: 60-79) ===
  {
    id: 'DAN', name: "丹鼎阁", level: "HIGH", minApt: 60, tuition: 300,
    prefElements: ['火','木'], buff: 1.25, risk: 0.03,
    resourceTypes: ['丹药','炼丹材料'],
    initialRankProb: { '真传弟子': 0.1, '内门弟子': 0.4, '外门弟子': 0.5 },
    exclusiveWith: [],
    desc: "炼丹圣地，提供丹药与稳健增益。偏好火木灵根。"
  },
  {
    id: 'OCEAN_PALACE', name: "东海龙宫", level: "HIGH", minApt: 65, tuition: 350,
    prefElements: ['水'], buff: 1.3, risk: 0.02,
    resourceTypes: ['水系宝珠','海族秘法'],
    initialRankProb: { '真传弟子': 0.12, '内门弟子': 0.38, '外门弟子': 0.5 },
    exclusiveWith: [],
    desc: "水下龙族建立的宗门，只收水灵根弟子。"
  },
  {
    id: 'THUNDER', name: "天雷宗", level: "HIGH", minApt: 70, tuition: 400,
    prefElements: ['雷'], buff: 1.4, risk: 0.04,
    resourceTypes: ['雷霆精华','天劫秘法'],
    initialRankProb: { '真传弟子': 0.15, '内门弟子': 0.35, '外门弟子': 0.5 },
    exclusiveWith: [],
    desc: "专修雷法，偏好变异雷灵根，攻击第一。"
  },
  
  // === 中级宗门 (minApt: 40-59) ===
  {
    id: 'FLOWER', name: "百花谷", level: "MID", minApt: 40, tuition: 100,
    prefElements: ['木','水'], buff: 1.15, risk: 0.01,
    resourceTypes: ['灵草','仙术仪式'],
    initialRankProb: { '真传弟子': 0.05, '内门弟子': 0.25, '外门弟子': 0.7 },
    exclusiveWith: [],
    desc: "只收容貌端正者，擅长辅助与阵法。偏好木水灵根。"
  },
  {
    id: 'NINE_STAR', name: "九星门", level: "MID", minApt: 45, tuition: 120,
    prefElements: ['金','土'], buff: 1.18, risk: 0.02,
    resourceTypes: ['星盘秘术','阵法宝图'],
    initialRankProb: { '真传弟子': 0.06, '内门弟子': 0.24, '外门弟子': 0.7 },
    exclusiveWith: [],
    desc: "专研星辰阵法与占卜之术，偏好金土灵根。"
  },
  {
    id: 'WIND', name: "逍遥派", level: "MID", minApt: 50, tuition: 150,
    prefElements: ['风'], buff: 1.2, risk: 0.015,
    resourceTypes: ['身法秘籍','遁术心法'],
    initialRankProb: { '真传弟子': 0.08, '内门弟子': 0.27, '外门弟子': 0.65 },
    exclusiveWith: [],
    desc: "崇尚自由，身法天下第一，偏好风灵根。"
  },
  {
    id: 'HARMONY', name: "合欢宗", level: "MID", minApt: 35, tuition: 80,
    prefElements: ['木','水'], buff: 1.12, risk: 0.01,
    resourceTypes: ['双修秘法','媚术心经'],
    initialRankProb: { '真传弟子': 0.04, '内门弟子': 0.21, '外门弟子': 0.75 },
    exclusiveWith: [],
    desc: "双修法门，不拘灵根，但需容貌姣好。"
  },
  
  // === 低级宗门 (minApt: 20-39) ===
  {
    id: 'IRON', name: "金刚门", level: "LOW", minApt: 20, tuition: 50,
    prefElements: ['土'], buff: 1.1, risk: 0.005,
    resourceTypes: ['武学训练','炼体术'],
    initialRankProb: { '真传弟子': 0.02, '内门弟子': 0.15, '外门弟子': 0.83 },
    exclusiveWith: [],
    desc: "炼体苦修，偏向肉体与防御。适合土灵根。"
  },
  {
    id: 'GRASS', name: "百草谷", level: "LOW", minApt: 25, tuition: 60,
    prefElements: ['木'], buff: 1.08, risk: 0.005,
    resourceTypes: ['草药种植','医术典籍'],
    initialRankProb: { '真传弟子': 0.03, '内门弟子': 0.17, '外门弟子': 0.8 },
    exclusiveWith: [],
    desc: "医道宗门，擅长炼药与治疗。偏好木灵根。"
  },
  {
    id: 'STONE', name: "巨石门", level: "LOW", minApt: 20, tuition: 40,
    prefElements: ['土','金'], buff: 1.05, risk: 0.003,
    resourceTypes: ['采矿术','锻造心法'],
    initialRankProb: { '真传弟子': 0.01, '内门弟子': 0.12, '外门弟子': 0.87 },
    exclusiveWith: [],
    desc: "以炼器和采矿闻名，偏好土金灵根。"
  },
  
  // === 魔道宗门 (激进型) ===
  {
    id: 'DEMON', name: "天魔教", level: "RECKLESS", minApt: 30, tuition: 0,
    prefElements: ['雷','火'], buff: 2.0, risk: 0.10,
    resourceTypes: ['禁术魔功','速成心法'],
    initialRankProb: { '真传弟子': 0.08, '内门弟子': 0.22, '外门弟子': 0.7 },
    exclusiveWith: ['SWORD','HEAVEN_EMPEROR'],
    desc: "走火入魔风险高，但速度极快，偏好变异灵根。"
  },
  {
    id: 'GHOST', name: "阴煞宗", level: "RECKLESS", minApt: 35, tuition: 0,
    prefElements: ['冰'], buff: 1.8, risk: 0.08,
    resourceTypes: ['鬼修秘典','阴魂炼化'],
    initialRankProb: { '真传弟子': 0.1, '内门弟子': 0.25, '外门弟子': 0.65 },
    exclusiveWith: ['SWORD','HEAVEN_EMPEROR'],
    desc: "修炼鬼道之法，偏好冰灵根，与正道为敌。"
  },
  {
    id: 'BLOOD', name: "血河派", level: "RECKLESS", minApt: 25, tuition: 0,
    prefElements: ['水','火'], buff: 1.7, risk: 0.12,
    resourceTypes: ['血炼之术','生机掠夺'],
    initialRankProb: { '真传弟子': 0.05, '内门弟子': 0.2, '外门弟子': 0.75 },
    exclusiveWith: [],
    desc: "以血为道，吸食生机，修炼极快但易走火入魔。"
  },
  
  // === 散修 ===
  {
    id: 'NONE', name: "散修", level: "NONE", minApt: 0, tuition: 0,
    prefElements: [], buff: 0.8, risk: 0.0,
    resourceTypes: ['自行摸索'],
    initialRankProb: { '杂役弟子': 1.0 },
    exclusiveWith: [],
    desc: "自生自灭，无宗门加成。"
  }
];

// 根据 id 获取宗门
export const getSectById = (id) => SECTS.find(s => s.id === id) || SECTS.find(s => s.id === 'NONE');

// 根据子嗣属性和宗门概率/偏好决定初始职位（简单概率分配+资质提升改写概率）
export const getInitialRankForChild = (child, sect) => {
  if (!sect || !sect.initialRankProb) return '外门弟子';
  const probs = { ...sect.initialRankProb };

  // 资质提升：资质高于门槛会按比例提升高位概率
  const apt = child.stats?.aptitude || 50;
  if (apt >= (sect.minApt || 0) + 20) {
    if (probs['外门弟子'] !== undefined) {
      const shift = Math.min(probs['外门弟子'], 0.3);
      probs['外门弟子'] -= shift;
      probs['内门弟子'] = (probs['内门弟子'] || 0) + shift * 0.6;
      probs['真传弟子'] = (probs['真传弟子'] || 0) + shift * 0.4;
    }
  }

  // 元素匹配加成
  if (Array.isArray(child.spiritRoot?.elements) && Array.isArray(sect.prefElements)) {
    child.spiritRoot.elements.forEach(el => {
      if (sect.prefElements.includes(el)) {
        probs['内门弟子'] = (probs['内门弟子'] || 0) + 0.05;
        probs['真传弟子'] = (probs['真传弟子'] || 0) + 0.03;
        if (probs['外门弟子']) probs['外门弟子'] = Math.max(0, probs['外门弟子'] - 0.08);
      }
    });
  }

  // 归一化并随机选取
  const keys = Object.keys(probs);
  let sum = keys.reduce((acc, k) => acc + (probs[k] || 0), 0);
  if (sum <= 0) return '外门弟子';
  keys.forEach(k => probs[k] = (probs[k] || 0) / sum);

  const r = Math.random();
  let acc = 0;
  for (const k of keys) {
    acc += probs[k];
    if (r <= acc) return k;
  }
  return keys[keys.length-1];
};

export const getSectResourceSummary = (sect) => {
  if (!sect) return [];
  return sect.resourceTypes || [];
};

// 4. 宗门职位
export const RANKS = ["杂役弟子", "外门弟子", "内门弟子", "真传弟子", "执事", "长老", "太上长老"];

/**
 * 计算修炼速度（统一的速度计算函数）
 * @param {Object} character - 人物对象（玩家或子嗣）
 * @param {boolean} isMonthly - 是否按月计算（子嗣）
 * @returns {number} 修炼速度
 */
export const calculateCultivationSpeed = (character, isMonthly = false) => {
  // 基础速度：按年10点经验，按月则除以12
  let speed = isMonthly ? 10 : 120;
  
  // 1. 资质影响
  const aptitude = character.stats?.aptitude || 50;
  speed *= (aptitude / 50);
  
  // 2. 灵根影响
  if (character.spiritRoot?.multiplier) {
    speed *= character.spiritRoot.multiplier;
  }
  
  // 3. 功法影响（核心新增逻辑）
  if (character.cultivationMethod && character.spiritRoot) {
    const manualMultiplier = getManualSpeedMultiplier(
      character.cultivationMethod,
      character.spiritRoot
    );
    speed *= manualMultiplier;
  }
  
  // 4. 词条影响
  if (character.trait?.effect) {
    speed *= character.trait.effect;
  }
  
  // 5. 宗门资源加成
  if (character.sect && character.sect.level !== "NONE") {
    speed *= 1.5;
  }
  
  return Math.floor(speed);
};

/**
 * 计算子嗣反哺数值
 * @param {Object} child - 子嗣对象
 * @returns {number} 反哺的修为值
 */
export const calculateChildFeedback = (child) => {
  if (child.age < 6) return 0; // 6岁以下未开始修炼，不反哺
  
  // 凡人不反馈
  if (child.tier === "凡人" || child.tierTitle === "凡人") return 0;
  
  const tierConfig = getTierConfig(child.tierTitle || child.tier || "凡人");
  if (!tierConfig) return 0;
  
  let baseFeedback = tierConfig.feedback || 0;
  if (baseFeedback === 0) return 0;
  
  // --- ⚖️ 境界衰减 ---
  // 炼气期基础反馈太低，直接给固定值
  let feedback = 0;
  if (child.tierTitle && child.tierTitle.includes("炼气")) {
    // 炼气期：基础2点（少年期1点）
    feedback = child.age < 16 ? 1 : 2;
  } else if (child.tierTitle && child.tierTitle.includes("筑基")) {
    // 筑基期：baseFeedback * 0.7
    feedback = baseFeedback * 0.7;
  } else if (child.tierTitle && (child.tierTitle.includes("金丹") || child.tierTitle.includes("元婴"))) {
    // 金丹期及以上：baseFeedback * 1.0
    feedback = baseFeedback * 1.0;
  } else {
    // 其他境界默认处理
    feedback = baseFeedback * 0.5;
  }
  
  // 年龄衰减：6-16岁（少年期）对筑基及以上额外打折
  if (child.age < 16 && child.tierTitle && !child.tierTitle.includes("炼气")) {
    feedback *= 0.5; // 少年期筑基以上反哺减半
  }
  
  // 资质修正 (资质50为基准)
  const aptitudeMod = (child.stats?.aptitude || 50) / 50;
  feedback *= aptitudeMod;
  
  // 宗门职位修正
  let rankMod = 1.0;
  if (child.rank === "内门弟子") rankMod = 1.2;
  if (child.rank === "真传弟子") rankMod = 1.5;
  if (child.rank === "长老") rankMod = 2.0;
  feedback *= rankMod;
  
  // 功法加成（反哺也受功法影响）
  let manualMod = 1.0;
  if (child.cultivationMethod && child.spiritRoot) {
    manualMod = getManualSpeedMultiplier(
      child.cultivationMethod,
      child.spiritRoot
    );
  }
  feedback *= manualMod;
  
  // 向上取整，确保至少有点反馈
  return Math.max(0, Math.floor(feedback));
};