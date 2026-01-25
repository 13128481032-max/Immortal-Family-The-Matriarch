// src/data/initialPlayer.js
export const initialPlayer = {
  name: "楚清辞",
  age: 16,
  gender: "女",
  avatar: { base:0, skinColor:0, hair:1, hairColor:0, eye:0, eyeColor:1, mouth:0 },
  tier: "炼气初期",
  currentExp: 0,
  maxExp: 500,
  resources: {
    spiritStones: 100,
    money: 50
  },
  stats: {
    looks: 80,
    cunning: 60,
    aptitude: 20,
    intelligence: 70,
    health: 100
  },
  
  // 必须补全的关键属性
  spiritRoot: {
    type: "五灵根",
    elements: ["金", "木", "水", "火", "土"],
    desc: "五行杂驳",
    color: "#9E9E9E",
    multiplier: 0.5
  },
  
  // 功法系统
  cultivationMethod: "basic_breath", // 当前修炼的功法ID
  
  combatStats: {
    hp: 500,
    maxHp: 500,
    atk: 50,
    def: 20,
    mp: 200,
    maxMp: 200
  },

  // 游戏时间和状态
  time: {
    year: 3572,
    month: 9,
    season: "秋"
  },
  status: ["心如死灰", "饥寒交迫"] // 初始状态
};

// 预定义一些发色 (Hex 颜色码)
const HAIR_COLORS = [
  "#2c2c2c", // 黑色
  "#5c3a21", // 深褐
  "#a88b45", // 金色
  "#8d2323", // 红棕
  "#f2f2f2"  // 银白
];

// 男性 DNA 范例
const maleDNA = {
  gender: 'male',
  hairId: 2,      // 0-3
  tZoneId: 5,     // 0-6
  mouthId: 3,     // 0-5
  hairColor: "#a88b45" // 从颜色池中选一个
  // 注意：因为脸型只有一个，不需要存 ID，默认都用那个
};

// 女性 DNA 范例 (基于你现有的素材)
const femaleDNA = {
  gender: 'female',
  faceId: 0, // 只有一个全脸，所以只能是 0
  // 女性目前无法换发色，因为头发和脸画在一起了
};

// 工具函数：获取随机整数
const randInt = (max) => Math.floor(Math.random() * max);
const randArr = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomMale = () => {
  return {
    gender: 'male',
    hairId: randInt(4), // 现有4个发型
    tZoneId: randInt(7), // 现有7个眉眼鼻
    mouthId: randInt(6), // 现有6个嘴巴
    hairColor: randArr(HAIR_COLORS)
  };
};

// 如果需要生成女性 NPC，直接返回固定的 femaleDNA 即可。

const generateChildDNA = (fatherDNA, motherDNA) => {
  // 1. 随机决定性别
  const gender = Math.random() > 0.5 ? 'male' : 'female';

  // 2. 决定发色 (唯一可以父母混合的特征)
  const momHairColor = motherDNA.hairColor || HAIR_COLORS[0]; // 假设母亲是黑发作为默认
  const childHairColor = Math.random() > 0.5 ? fatherDNA.hairColor : momHairColor;
  
  if (gender === 'female') {
    // --- 生了女儿 ---
    return {
      gender: 'female',
      faceId: 0
      // 无法应用 childHairColor，因为头发和脸画在一起了
    };
  } else {
    // --- 生了儿子 ---
    const inheritOrMutate = (dadFeatureId, totalOptions) => {
      const mutationRate = 0.1; // 10% 变异概率
      if (Math.random() < mutationRate) {
        return randInt(totalOptions); // 变异：随机生成
      }
      return dadFeatureId; // 继承：随父亲
    };

    return {
      gender: 'male',
      hairId: inheritOrMutate(fatherDNA.hairId, 4),
      tZoneId: inheritOrMutate(fatherDNA.tZoneId, 7),
      mouthId: inheritOrMutate(fatherDNA.mouthId, 6),
      hairColor: childHairColor
    };
  }
};