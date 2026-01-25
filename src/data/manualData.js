// src/data/manualData.js
// 功法系统数据库

/**
 * 功法等级说明：
 * - 黄阶 (Yellow): +20% 基础加成，市面流通的大路货
 * - 玄阶 (Black): +50% 基础加成，普通宗门入门功法
 * - 地阶 (Earth): +100% 基础加成，大宗门镇派绝学
 * - 天阶 (Heaven): +200% 基础加成，传说仙法
 * 
 * 契合度系统：
 * - 完美契合 (1.5): 天灵根且属性完全对应
 * - 相生/包含 (1.0): 灵根中包含功法属性
 * - 相克/不含 (0.5): 灵根中不包含功法属性
 * - 无属性功法 (0.8): 通用但效果略打折扣
 */

export const MANUAL_TIERS = {
  YELLOW: { name: '黄阶', baseBuff: 0.2, color: '#D4AF37' },
  BLACK: { name: '玄阶', baseBuff: 0.5, color: '#4A4A4A' },
  EARTH: { name: '地阶', baseBuff: 1.0, color: '#8B4513' },
  HEAVEN: { name: '天阶', baseBuff: 2.0, color: '#9B30FF' }
};

// 功法数据库
export const MANUALS = {
  // ==================== 基础功法 ====================
  basic_breath: {
    id: 'basic_breath',
    name: '吐纳法',
    tier: 'YELLOW',
    element: 'NONE',
    desc: '凡人流传的强身健体之法，修炼速度极慢但胜在安全。',
    rarity: 'common',
    source: '散修必备'
  },

  cloud_breath: {
    id: 'cloud_breath',
    name: '行云诀',
    tier: 'YELLOW',
    element: 'NONE',
    desc: '无属性通用功法，虽无特别加成，但老少咸宜。',
    rarity: 'common',
    source: '各大城镇均有售'
  },

  // ==================== 五行单系功法 ====================
  // 金系
  golden_light: {
    id: 'golden_light',
    name: '金光护体诀',
    tier: 'YELLOW',
    element: '金',
    desc: '凝聚金系灵气护体，防御力强但修炼速度平平。',
    rarity: 'common',
    source: '金元门传承'
  },

  azure_sword_art: {
    id: 'azure_sword_art',
    name: '青云剑诀',
    tier: 'BLACK',
    element: '金',
    desc: '青云宗入门心法，修出锐金之气，剑修首选。',
    rarity: 'rare',
    source: '青云剑宗'
  },

  // 木系
  evergreen_art: {
    id: 'evergreen_art',
    name: '长春功',
    tier: 'YELLOW',
    element: '木',
    desc: '木系功法，修炼后气血旺盛，能延年益寿。',
    rarity: 'common',
    source: '丹鼎阁外门'
  },

  spring_birth: {
    id: 'spring_birth',
    name: '春生万物诀',
    tier: 'BLACK',
    element: '木',
    desc: '木系高阶功法，生机盎然，疗伤恢复效果极佳。',
    rarity: 'rare',
    source: '百草谷真传'
  },

  // 水系
  water_flow: {
    id: 'water_flow',
    name: '流水心经',
    tier: 'YELLOW',
    element: '水',
    desc: '水系功法，以柔克刚，修炼时心境平和。',
    rarity: 'common',
    source: '沧溟岛'
  },

  ocean_heart: {
    id: 'ocean_heart',
    name: '沧海归心诀',
    tier: 'BLACK',
    element: '水',
    desc: '水系上乘功法，修成后法力深厚如大海。',
    rarity: 'rare',
    source: '东海龙宫遗迹'
  },

  // 火系
  fire_control: {
    id: 'fire_control',
    name: '弄焰诀',
    tier: 'BLACK',
    element: '火',
    desc: '丹鼎阁必修功法，能精准控火炼丹，火候掌控一流。',
    rarity: 'rare',
    source: '丹鼎阁'
  },

  nine_turns_fire: {
    id: 'nine_turns_fire',
    name: '九转控火诀',
    tier: 'EARTH',
    element: '火',
    desc: '丹鼎阁镇阁功法，只有真传弟子可学，火系修炼速度极快。',
    rarity: 'epic',
    source: '丹鼎阁真传'
  },

  vermillion_bird: {
    id: 'vermillion_bird',
    name: '朱雀焚天功',
    tier: 'EARTH',
    element: '火',
    desc: '传说得自上古神兽朱雀，修成后浴火重生。',
    rarity: 'epic',
    source: '南荒遗迹'
  },

  // 土系
  earth_shield: {
    id: 'earth_shield',
    name: '厚土诀',
    tier: 'YELLOW',
    element: '土',
    desc: '土系防御功法，增强体魄，适合体修。',
    rarity: 'common',
    source: '散修常用'
  },

  mountain_body: {
    id: 'mountain_body',
    name: '不动如山功',
    tier: 'BLACK',
    element: '土',
    desc: '土系炼体功法，防御无双但灵活不足。',
    rarity: 'rare',
    source: '巨石门'
  },

  // ==================== 变异灵根功法 ====================
  thunder_引: {
    id: 'thunder_guide',
    name: '九天引雷术',
    tier: 'HEAVEN',
    element: '雷',
    desc: '引九天神雷锻体，杀伤力冠绝天下，非大毅力者不可修。',
    rarity: 'legendary',
    source: '天雷宗禁地'
  },

  heavenly_demon: {
    id: 'heavenly_demon',
    name: '大自在天魔经',
    tier: 'HEAVEN',
    element: '雷',
    desc: '天魔教至高功法，雷系变异灵根可大成，修成后威震修真界。',
    rarity: 'legendary',
    source: '天魔教'
  },

  ice_heart: {
    id: 'ice_heart',
    name: '玄冰诀',
    tier: 'BLACK',
    element: '冰',
    desc: '冰系功法，修炼后心境冰冷，不为外物所动。',
    rarity: 'rare',
    source: '极北冰原'
  },

  wind_freedom: {
    id: 'wind_freedom',
    name: '逍遥御风诀',
    tier: 'BLACK',
    element: '风',
    desc: '风系身法功法，修炼后身轻如燕，速度极快。',
    rarity: 'rare',
    source: '逍遥派'
  },

  // ==================== 双修/特殊功法 ====================
  yin_yang_harmony: {
    id: 'yin_yang_harmony',
    name: '阴阳和合散',
    tier: 'BLACK',
    element: 'NONE',
    desc: '合欢宗双修功法，男女双修可加速修炼，无属性限制。',
    rarity: 'rare',
    source: '合欢宗'
  },

  blood_demon: {
    id: 'blood_demon',
    name: '血魔大法',
    tier: 'EARTH',
    element: 'NONE',
    desc: '魔道功法，吞噬他人修为提升自身，速度极快但易走火入魔。',
    rarity: 'epic',
    source: '魔道传承'
  },

  // ==================== 传说功法 ====================
  chaos_origin: {
    id: 'chaos_origin',
    name: '混沌初开诀',
    tier: 'HEAVEN',
    element: 'NONE',
    desc: '传说中的仙界功法，无视灵根限制，包容万物。',
    rarity: 'legendary',
    source: '上古遗迹'
  },

  five_elements_supreme: {
    id: 'five_elements_supreme',
    name: '五行至尊经',
    tier: 'HEAVEN',
    element: 'ALL',
    desc: '需五行灵根具备方可修炼，五灵根者的救赎之法。',
    rarity: 'legendary',
    source: '五行秘境'
  }
};

// 宗门功法配置：加入宗门后自动学会的功法
export const SECT_MANUALS = {
  '青云剑宗': 'azure_sword_art',
  '丹鼎阁': 'fire_control',
  '合欢宗': 'yin_yang_harmony',
  '天魔教': 'heavenly_demon',
  '百草谷': 'spring_birth',
  '东海龙宫': 'ocean_heart',
  '巨石门': 'mountain_body',
  '天雷宗': 'thunder_guide',
  '逍遥派': 'wind_freedom'
};

/**
 * 计算功法契合度
 * @param {Object} manual - 功法对象
 * @param {Object} spiritRoot - 灵根对象 {type, elements, multiplier}
 * @returns {Object} {compatibility: 契合度系数, level: 契合等级, desc: 描述}
 */
export function calculateCompatibility(manual, spiritRoot) {
  const manualData = MANUALS[manual];
  if (!manualData) return { compatibility: 0.5, level: 'poor', desc: '未知功法' };
  
  // 如果灵根未测试，返回默认契合度
  if (!spiritRoot || !spiritRoot.elements) {
    return { compatibility: 0.8, level: 'neutral', desc: '灵根未测', color: '#999' };
  }

  const { element } = manualData;
  const { elements, type } = spiritRoot;

  // 无属性功法：通用但略打折扣
  if (element === 'NONE') {
    return {
      compatibility: 0.8,
      level: 'neutral',
      desc: '相性平平',
      color: '#FFFFFF'
    };
  }

  // 特殊：五行至尊经需要五灵根
  if (manualData.id === 'five_elements_supreme') {
    if (elements.length === 5) {
      return {
        compatibility: 1.5,
        level: 'perfect',
        desc: '天命所归',
        color: '#FFD700'
      };
    }
    return {
      compatibility: 0.1,
      level: 'impossible',
      desc: '无法修炼',
      color: '#FF0000'
    };
  }

  // 判断灵根中是否包含功法属性
  const hasElement = elements.includes(element);

  if (!hasElement) {
    // 不包含对应属性：效果减半
    return {
      compatibility: 0.5,
      level: 'poor',
      desc: '格格不入',
      color: '#FF6B6B'
    };
  }

  // 包含对应属性
  if (elements.length === 1 && elements[0] === element) {
    // 天灵根/单灵根且完美对应：效果1.5倍
    return {
      compatibility: 1.5,
      level: 'perfect',
      desc: '完美契合',
      color: '#4CAF50'
    };
  }

  // 多灵根但包含：正常发挥
  return {
    compatibility: 1.0,
    level: 'good',
    desc: '相性尚可',
    color: '#2196F3'
  };
}

/**
 * 根据功法和灵根计算最终修炼速度倍率
 * @param {string} manualId - 功法ID
 * @param {Object} spiritRoot - 灵根对象
 * @returns {number} 速度倍率
 */
export function getManualSpeedMultiplier(manualId, spiritRoot) {
  const manual = MANUALS[manualId];
  if (!manual) return 1.0;

  const tierData = MANUAL_TIERS[manual.tier];
  const { compatibility } = calculateCompatibility(manualId, spiritRoot);

  // 最终倍率 = 1 + (功法加成 * 契合度)
  return 1 + (tierData.baseBuff * compatibility);
}

// 获取功法完整信息（包括等阶数据）
export function getManualFullInfo(manualId) {
  const manual = MANUALS[manualId];
  if (!manual) return null;

  const tierData = MANUAL_TIERS[manual.tier];
  return {
    ...manual,
    tierName: tierData.name,
    tierColor: tierData.color,
    baseBuff: tierData.baseBuff
  };
}
