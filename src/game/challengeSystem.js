// src/game/challengeSystem.js

// 1. 家族产业配置
export const BUSINESSES = [
  { id: 'farm', name: '灵草园', cost: 500, baseIncome: 50, desc: '种植低阶灵草，收益稳定', minTier: '凡人' },
  { id: 'mine', name: '玄铁矿', cost: 2000, baseIncome: 200, desc: '开采矿石，需要炼气期坐镇', minTier: '炼气初期' },
  { id: 'auction', name: '拍卖行', cost: 10000, baseIncome: 1500, desc: '经营宝物买卖，暴利但需强者', minTier: '筑基初期' },
  { id: 'sect_branch', name: '宗门分舵', cost: 50000, baseIncome: 8000, desc: '建立势力范围，称霸一方', minTier: '金丹初期' }
];

// 2. 秘境挑战配置 (扩充版)
export const REALMS = [
  {
    id: 'peach_island',
    name: '桃花岛',
    reqTier: '凡人',
    recommendCP: 150,
    cost: 10,
    drops: ['herb_bandage', 'iron_sword', 'rice_ball'],
    risk: 0.05,
    desc: '风景优美的小岛，只有些许野兽，适合带孩子练手。'
  },
  {
    id: 'snake_valley',
    name: '万蛇谷',
    reqTier: '炼气中期',
    recommendCP: 1000,
    cost: 50,
    drops: ['foundation_pill', 'beast_core', 'beast_fang'],
    risk: 0.15,
    desc: '毒蛇遍布的峡谷，稍有不慎就会中毒。'
  },
  {
    id: 'thunder_peak',
    name: '落雷峰',
    reqTier: '筑基初期',
    recommendCP: 8000,
    cost: 300,
    drops: ['thunder_wood', 'core_pill', 'iron_armor'],
    risk: 0.25,
    desc: '常年被雷霆笼罩的山峰，是体修的绝佳试炼地。'
  },
  {
    id: 'ancient_tomb',
    name: '古修遗府',
    reqTier: '筑基后期',
    recommendCP: 15000,
    cost: 500,
    drops: ['artifact_supreme', 'milk_millennium', 'marrow_wash'],
    risk: 0.4,
    desc: '上古修士的洞府，机关重重，非死即伤。'
  },
  {
    id: 'demon_domain',
    name: '天魔域',
    reqTier: '金丹初期',
    recommendCP: 50000,
    cost: 2000,
    drops: ['nascent_fruit', 'heaven_manual', 'divine_egg'],
    risk: 0.6,
    desc: '域外天魔盘踞之地，十死无生，唯有大能可探。'
  }
];

// 简单的战力计算公式
// 战力 = 修为XP * 0.1 + 资质 * 10 + 宗门加成
export const calculateCombatPower = (entity) => {
  // 兼容不同的经验字段：子嗣用cultivation，玩家/NPC用currentExp
  const exp = entity.cultivation || entity.currentExp || 0;
  let cp = Math.floor(exp * 0.1) + (entity.stats?.aptitude || 10) * 10;
  
  // 宗门职位加成
  if (entity.rank === '内门弟子') cp *= 1.2;
  if (entity.rank === '真传弟子') cp *= 1.5;
  if (entity.rank === '长老') cp *= 2.0;
  
  // 特殊体质加成
  if (entity.constitution) cp *= 1.5;

  return Math.floor(cp);
};