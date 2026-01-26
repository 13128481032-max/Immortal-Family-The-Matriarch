// src/data/npcPool.js
import { calculateStats, getSectById } from '../game/cultivationSystem.js'; // 引入计算公式确保数据同步

// 预设的陆昭数据 (手动补全了新版本需要的字段)
const luZhaoStats = {
  aptitude: 85, // 单灵根资质
  looks: 90,    // 帅
  intelligence: 80
};

export const initialNpcs = [
  {
    id: 1,
    name: "陆昭",
    age: 25,
    identity: "落魄散修",
    desc: "沉稳坚韧，正为购买筑基丹奔波。眉头总有一丝化不开的忧愁。曾是【凌霄宗】外门弟子，因资质被看轻而心灰意冷，选择离开宗门独自闯荡。",
    // 头像 DNA (如果你用了像素版或SVG版)
    avatar: { base: 0, skinColor: 1, hair: 0, hairColor: 0, eye: 0, eyeColor: 0, mouth: 1 },
    
    // --- 境界与修为 ---
    tier: "炼气后期",
    currentExp: 800,
    maxExp: 2000,
    
    // --- 新增：核心属性 ---
    stats: luZhaoStats,
    
    // --- 新增：灵根数据 (必须补上这个！) ---
    spiritRoot: {
      type: "单灵根",
      elements: ["金"],
      desc: "五行归一，虽不及天灵根纯净，亦是人中龙凤。",
      color: "#9C27B0",
      multiplier: 1.8
    },

    // --- 新增：战斗属性 (手动写死或计算) ---
    combatStats: {
      hp: 2000,
      maxHp: 2000,
      atk: 180,
      mp: 800
    },

    // --- 新增：宗门信息 ---
    sect: getSectById('SWORD'),
    sectId: 'SWORD',
    sectRank: '外门弟子',
    sectStatus: 'defected', // 已离开宗门

    // 其他旧属性保持不变
    appearance: "眉目清俊似远山，一袭洗得发白的青衫...",
    personality: { label: "坚韧", tag: "🪨", desc: "百折不挠" },
    relationship: {
      stage: 1,
      affection: 10,
      trust: 20,
      jealousy: 0
    },
    likes: ["疗伤丹药", "剑谱"],
    dislikes: ["施舍"],
    isPregnant: false
  }
  ,
  // 新增: 一位示例男性佛修 NPC
  {
    id: 2,
    name: "慧空",
    age: 38,
    identity: "佛修",
    desc: "法号慧空，常年闭关佛寺，面容清瘦，举止如水。来自西域金刚寺，佛法高深，不问世事。",
    avatar: { base: 0, skinColor: 2, hair: -1, hairColor: null, eye: 0, eyeColor: 0, mouth: 1 }, // hair: -1 表示光头
    
    // --- 境界与修为 ---
    tier: "筑基初期",
    currentExp: 5000,
    maxExp: 20000,
    
    stats: { aptitude: 95, looks: 40, intelligence: 95 },
    spiritRoot: { type: "天灵根", elements: ["木"], desc: "与佛理契合，天资极佳。", color: "#FFD700", multiplier: 2.5 },
    combatStats: { hp: 1800, maxHp: 1800, atk: 200, mp: 1200 },
    
    // --- 宗门信息：佛修不属于修仙宗门体系 ---
    sect: null,
    sectId: null,
    sectRank: '金刚寺僧人',
    sectStatus: 'mysterious', // 佛门独立，神秘不透露
    
    personality: { label: "平和", tag: "🕊️", desc: "心如止水" },
    relationship: { stage: 1, affection: 5, trust: 10, jealousy: 0 },
    likes: ["心经"],
    dislikes: [],
    isPregnant: false
  }
];
