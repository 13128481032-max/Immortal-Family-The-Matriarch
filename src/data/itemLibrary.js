// src/data/itemLibrary.js
// 物品静态配置与工厂

export const ITEM_LIBRARY = {
  herb_bandage: {
    id: 'herb_bandage',
    name: '止血草',
    type: 'consumable',
    rarity: 'common',
    desc: '服用后小幅恢复气血。',
    effect: { kind: 'heal', amount: 100 }
  },
  rice_ball: {
    id: 'rice_ball',
    name: '饭团',
    type: 'consumable',
    rarity: 'common',
    desc: '充饥恢复少量气血。',
    effect: { kind: 'heal', amount: 60 }
  },
  iron_sword: {
    id: 'iron_sword',
    name: '凡铁剑',
    type: 'weapon',
    slot: 'weapon',
    rarity: 'common',
    desc: '普通的铁剑，略微提升攻击。',
    stats: { atk: 25 }
  },
  beast_fang: {
    id: 'beast_fang',
    name: '毒牙',
    type: 'accessory',
    slot: 'accessory',
    rarity: 'uncommon',
    desc: '嵌有毒液的尖牙饰品，提升攻击。',
    stats: { atk: 35 }
  },
  beast_core: {
    id: 'beast_core',
    name: '一阶兽丹',
    type: 'consumable',
    rarity: 'uncommon',
    desc: '蕴含妖兽精华，服用后精进修为。',
    effect: { kind: 'exp', amount: 1200 }
  },
  foundation_pill: {
    id: 'foundation_pill',
    name: '筑基丹',
    type: 'consumable',
    rarity: 'rare',
    desc: '关键突破丹药，显著提升修为。',
    effect: { kind: 'exp', amount: 4000 }
  },
  thunder_wood: {
    id: 'thunder_wood',
    name: '雷击木',
    type: 'accessory',
    slot: 'accessory',
    rarity: 'rare',
    desc: '蕴含雷霆之力的木料，提升攻击与灵力。',
    stats: { atk: 60, mp: 200 }
  },
  iron_armor: {
    id: 'iron_armor',
    name: '玄铁铠甲',
    type: 'armor',
    slot: 'armor',
    rarity: 'rare',
    desc: '厚重的铠甲，大幅提升气血。',
    stats: { hp: 600 }
  },
  core_pill: {
    id: 'core_pill',
    name: '结金丹',
    type: 'consumable',
    rarity: 'epic',
    desc: '金丹前的关键丹药，巨幅提升修为。',
    effect: { kind: 'exp', amount: 9000 }
  },
  artifact_supreme: {
    id: 'artifact_supreme',
    name: '极品法宝',
    type: 'weapon',
    slot: 'weapon',
    rarity: 'epic',
    desc: '灵光流转的法宝，显著提升攻击与气血。',
    stats: { atk: 180, hp: 300 }
  },
  milk_millennium: {
    id: 'milk_millennium',
    name: '千年灵乳',
    type: 'consumable',
    rarity: 'epic',
    desc: '温润如玉的灵乳，恢复大量气血。',
    effect: { kind: 'heal', amount: 500 }
  },
  marrow_wash: {
    id: 'marrow_wash',
    name: '洗髓丹',
    type: 'consumable',
    rarity: 'epic',
    desc: '洗去杂质，提升根骨资质。',
    effect: { kind: 'aptitude', amount: 2 }
  },
  nascent_fruit: {
    id: 'nascent_fruit',
    name: '元婴果',
    type: 'consumable',
    rarity: 'legendary',
    desc: '蕴含元婴气息的仙果，大幅提升修为。',
    effect: { kind: 'exp', amount: 20000 }
  },
  heaven_manual: {
    id: 'heaven_manual',
    name: '天阶功法',
    type: 'accessory',
    slot: 'accessory',
    rarity: 'legendary',
    desc: '蕴含大道真意的功法卷，提升灵力与攻击。',
    stats: { mp: 800, atk: 120 }
  },
  divine_egg: {
    id: 'divine_egg',
    name: '神兽蛋',
    type: 'armor',
    slot: 'armor',
    rarity: 'legendary',
    desc: '仍在酝酿的神兽之卵，强大的生命力护主。',
    stats: { hp: 1200 }
  },
  // 功法类物品
  basic_manual: {
    id: 'basic_manual',
    name: '基础功法秘籍',
    type: 'manual',
    rarity: 'common',
    desc: '黄阶功法秘籍，包含吐纳法、行云诀等基础功法。',
    manualIds: ['basic_breath', 'cloud_breath'] // 可选的功法ID列表
  },
  advanced_manual: {
    id: 'advanced_manual',
    name: '进阶功法秘籍',
    type: 'manual',
    rarity: 'rare',
    desc: '玄阶功法秘籍，包含青云剑诀、流水心经等进阶功法。',
    manualIds: ['azure_sword_art', 'water_flow', 'flame_sun', 'earth_mountain'] // 可选的功法ID列表
  },
  expert_manual: {
    id: 'expert_manual',
    name: '高级功法秘籍',
    type: 'manual',
    rarity: 'epic',
    desc: '地阶功法秘籍，包含绝世功法，极为稀有。',
    manualIds: ['yin_yang_dual', 'five_elements_unity'] // 可选的功法ID列表
  }
};

export const createItemInstance = (itemId) => {
  const tpl = ITEM_LIBRARY[itemId];
  if (!tpl) return null;
  return {
    ...tpl,
    instanceId: `${itemId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`
  };
};

export const isEquipment = (item) => ['weapon', 'armor', 'accessory'].includes(item?.type);

export const getItemTemplate = (itemId) => ITEM_LIBRARY[itemId];
