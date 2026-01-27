// src/game/worldNpcGenerator.js
// 世界名人池生成器

import { TIERS, SECTS } from './cultivationSystem.js';

// 姓氏库
const SURNAMES = [
  '赵', '钱', '孙', '李', '周', '吴', '郑', '王', '冯', '陈',
  '褚', '卫', '蒋', '沈', '韩', '杨', '朱', '秦', '尤', '许',
  '何', '吕', '施', '张', '孔', '曹', '严', '华', '金', '魏',
  '陶', '姜', '戚', '谢', '邹', '喻', '柏', '水', '窦', '章',
  '云', '苏', '潘', '葛', '奚', '范', '彭', '郎', '鲁', '韦',
  '昌', '马', '苗', '凤', '花', '方', '俞', '任', '袁', '柳',
  '酆', '鲍', '史', '唐', '费', '廉', '岑', '薛', '雷', '贺'
];

// 男性名字字库
const MALE_NAME_CHARS = [
  '轩', '昊', '宇', '泽', '瑞', '博', '峰', '辰', '宸', '逸',
  '霖', '睿', '翔', '鹏', '煜', '炎', '玄', '冥', '渊', '寒',
  '凌', '傲', '云', '风', '星', '月', '天', '极', '无', '玉',
  '墨', '尘', '羽', '剑', '龙', '虎', '麟', '凤', '鹤', '鲲',
  '浩', '刚', '强', '磊', '毅', '武', '勇', '威', '煌', '焱'
];

// 女性名字字库
const FEMALE_NAME_CHARS = [
  '嫣', '妍', '瑶', '怡', '萱', '悦', '婷', '琪', '涵', '雯',
  '诗', '梦', '莹', '洁', '雪', '霜', '冰', '凝', '韵', '灵',
  '婉', '柔', '颖', '馨', '蓉', '薇', '菲', '芸', '岚', '霞',
  '月', '星', '云', '烟', '雨', '露', '竹', '兰', '梅', '菊',
  '莲', '蝶', '燕', '凤', '鸾', '仙', '姬', '妃', '嫦', '娥'
];

// 称号前缀
const TITLE_PREFIXES = [
  '剑', '刀', '枪', '拳', '掌', '指', '爪', '腿', '剑气', '刀意',
  '神', '魔', '仙', '圣', '帝', '尊', '王', '皇', '霸', '狂',
  '冰', '火', '雷', '风', '水', '土', '光', '暗', '阴', '阳',
  '天', '地', '玄', '黄', '太', '上', '混', '元', '无', '极'
];

// 称号后缀
const TITLE_SUFFIXES = [
  '尊', '圣', '帝', '王', '君', '侠', '魔', '仙', '神', '祖',
  '宗', '师', '手', '客', '者', '人', '公', '主', '使', '真人'
];

// 生成随机名字
function generateRandomName(gender) {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const nameChars = gender === 'male' ? MALE_NAME_CHARS : FEMALE_NAME_CHARS;
  
  // 70%概率生成两字名，30%概率生成单字名
  const isTwoChar = Math.random() > 0.3;
  
  if (isTwoChar) {
    const char1 = nameChars[Math.floor(Math.random() * nameChars.length)];
    const char2 = nameChars[Math.floor(Math.random() * nameChars.length)];
    return surname + char1 + char2;
  } else {
    const char = nameChars[Math.floor(Math.random() * nameChars.length)];
    return surname + char;
  }
}

// 生成随机称号
function generateRandomTitle(tier) {
  const prefix = TITLE_PREFIXES[Math.floor(Math.random() * TITLE_PREFIXES.length)];
  const suffix = TITLE_SUFFIXES[Math.floor(Math.random() * TITLE_SUFFIXES.length)];
  
  // 高境界有更霸气的称号
  if (tier.includes('大乘') || tier.includes('渡劫')) {
    const epicPrefixes = ['混沌', '太古', '无上', '至尊', '天元'];
    const epicPrefix = epicPrefixes[Math.floor(Math.random() * epicPrefixes.length)];
    return epicPrefix + suffix;
  } else if (tier.includes('合体') || tier.includes('炼虚')) {
    const highPrefixes = ['真', '玄', '太', '上', '无极'];
    const highPrefix = highPrefixes[Math.floor(Math.random() * highPrefixes.length)];
    return highPrefix + suffix;
  }
  
  return prefix + suffix;
}

// 生成世界名人池
export function generateWorldElites(count = 30) {
  const elites = [];
  const usedNames = new Set();
  
  // 确定各境界的数量分配（使用实际存在的境界名称）
  const distribution = {
    '渡劫后期': Math.floor(count * 0.03),  // 1个
    '渡劫中期': Math.floor(count * 0.03),  // 1个
    '渡劫初期': Math.floor(count * 0.04),  // 1个
    '大乘后期': Math.floor(count * 0.05),  // 1-2个
    '大乘中期': Math.floor(count * 0.05),  // 1-2个
    '大乘初期': Math.floor(count * 0.07),  // 2个
    '合体后期': Math.floor(count * 0.07),  // 2个
    '合体中期': Math.floor(count * 0.10),  // 3个
    '炼虚后期': Math.floor(count * 0.10),  // 3个
    '化神后期': Math.floor(count * 0.13),  // 4个
    '元婴后期': Math.floor(count * 0.16),  // 5个
    '金丹后期': Math.floor(count * 0.17)   // 其余5个
  };
  
  let currentId = 1;
  
  // 按境界从高到低生成
  const tiers = [
    '渡劫后期', '渡劫中期', '渡劫初期',
    '大乘后期', '大乘中期', '大乘初期',
    '合体后期', '合体中期',
    '炼虚后期',
    '化神后期',
    '元婴后期',
    '金丹后期'
  ];
  
  tiers.forEach(tier => {
    const tierCount = distribution[tier] || 1;
    
    for (let i = 0; i < tierCount; i++) {
      const gender = Math.random() > 0.7 ? 'female' : 'male'; // 70%男30%女
      
      // 生成随机名字，确保不重复
      let name;
      let attempts = 0;
      do {
        name = generateRandomName(gender);
        attempts++;
      } while (usedNames.has(name) && attempts < 100);
      
      // 如果还是重复，添加数字后缀
      if (usedNames.has(name)) {
        name = name + currentId;
      }
      
      usedNames.add(name);
      
      // 生成称号
      const title = generateRandomTitle(tier);
      
      // 分配宗门（高境界更可能是宗门高层）
      let sect = null;
      if (Math.random() > 0.3) { // 70%概率属于某个宗门
        const availableSects = SECTS.filter(s => s.id !== 'SECT_NONE');
        sect = availableSects[Math.floor(Math.random() * availableSects.length)];
      }
      
      // 查找境界配置
      const tierIndex = TIERS.findIndex(t => t.name === tier);
      if (tierIndex === -1) {
        console.error(`未找到境界配置: ${tier}`);
        return;
      }
      
      const tierConfig = TIERS[tierIndex];
      
      // 计算战力
      const basePower = tierConfig.maxExp * 2;
      const powerVariation = basePower * (0.8 + Math.random() * 0.4); // ±20%变化
      
      const elite = {
        id: `world_npc_${currentId}`,
        name,
        title,
        gender,
        tier,
        tierIndex,
        sect: sect ? { id: sect.id, name: sect.name } : null,
        status: 'ALIVE',
        location: 'Unknown', // 行踪不定
        hasMetPlayer: false,
        firstMetYear: null,
        
        // 修为数据
        currentExp: Math.floor(Math.random() * tierConfig.maxExp * 0.8) + tierConfig.maxExp * 0.2,
        maxExp: tierConfig.maxExp,
        
        // 战斗属性
        combatPower: Math.floor(powerVariation),
        
        // 年龄（境界越高，年龄越大）
        age: 30 + (TIERS.length - tierIndex) * 50 + Math.floor(Math.random() * 100),
        
        // 性格特征
        personality: generatePersonality(),
        
        // 成名绝技
        signature: generateSignature(tier),
        
        // 外貌DNA（简化版）
        appearance: {
          description: generateAppearance(gender, tier)
        },
        
        // 关系网络
        relationships: {
          allies: [], // 盟友ID列表
          enemies: [], // 敌人ID列表
          disciples: [] // 弟子ID列表
        },
        
        // 事件记录
        majorEvents: [`在修真界崭露头角，被誉为【${title}】`],
        
        // 最后活跃时间
        lastActiveYear: 3572
      };
      
      elites.push(elite);
      currentId++;
    }
  });
  
  // 建立一些关系（师徒、敌对等）
  establishRelationships(elites);
  
  return elites;
}

// 生成性格
function generatePersonality() {
  const traits = [
    ['冷傲', '温和', '狂放', '沉稳', '阴险'],
    ['正义', '邪恶', '中立', '自私', '侠义'],
    ['好战', '平和', '冷静', '暴躁', '谨慎']
  ];
  
  return {
    temperament: traits[0][Math.floor(Math.random() * traits[0].length)],
    alignment: traits[1][Math.floor(Math.random() * traits[1].length)],
    attitude: traits[2][Math.floor(Math.random() * traits[2].length)]
  };
}

// 生成绝技
function generateSignature(tier) {
  const techniques = {
    '大乘老祖': ['混沌神拳', '毁天灭地掌', '开天辟地剑', '寰宇灭绝阵'],
    '渡劫真仙': ['九天玄雷', '太古龙象功', '万剑归宗', '天魔解体大法'],
    '元婴老祖': ['元神出窍术', '血神大法', '紫气东来诀', '北冥神功'],
    '化神期': ['天罡北斗阵', '炼神返虚诀', '神识攻击术', '灵魂分身法'],
    '元婴期': ['元婴期雷法', '太乙真经', '玄冰掌', '烈焰真诀'],
    '金丹期': ['金丹神通', '剑气纵横', '罡气护体', '御剑飞行术']
  };
  
  const pool = techniques[tier] || techniques['金丹期'];
  return pool[Math.floor(Math.random() * pool.length)];
}

// 生成外貌描述
function generateAppearance(gender, tier) {
  const maleDescriptions = [
    '剑眉星目，气宇轩昂',
    '身材魁梧，虎背熊腰',
    '丰神俊朗，风度翩翩',
    '相貌平平，但眼神深邃',
    '白发苍苍，仙风道骨'
  ];
  
  const femaleDescriptions = [
    '倾国倾城，美若天仙',
    '清丽脱俗，宛如仙子',
    '冷艳高贵，气质出众',
    '温婉动人，秀外慧中',
    '英姿飒爽，巾帼不让须眉'
  ];
  
  const descriptions = gender === 'male' ? maleDescriptions : femaleDescriptions;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// 建立关系网络
function establishRelationships(elites) {
  // 让一些NPC成为师徒关系
  const masters = elites.filter(e => ['大乘老祖', '渡劫真仙', '元婴老祖'].includes(e.tier));
  const juniors = elites.filter(e => ['金丹期', '元婴期'].includes(e.tier));
  
  juniors.forEach(junior => {
    if (Math.random() > 0.5 && masters.length > 0) {
      const master = masters[Math.floor(Math.random() * masters.length)];
      if (master.sect && junior.sect && master.sect.id === junior.sect.id) {
        master.relationships.disciples.push(junior.id);
        junior.majorEvents.push(`拜入【${master.name}】门下`);
      }
    }
  });
  
  // 创建一些敌对关系
  for (let i = 0; i < Math.min(5, elites.length / 3); i++) {
    const npc1 = elites[Math.floor(Math.random() * elites.length)];
    const npc2 = elites[Math.floor(Math.random() * elites.length)];
    
    if (npc1.id !== npc2.id && 
        !npc1.relationships.enemies.includes(npc2.id) &&
        Math.abs(npc1.tierIndex - npc2.tierIndex) <= 2) { // 境界相近才有恩怨
      npc1.relationships.enemies.push(npc2.id);
      npc2.relationships.enemies.push(npc1.id);
      npc1.majorEvents.push(`与【${npc2.name}】结下恩怨`);
      npc2.majorEvents.push(`与【${npc1.name}】结下恩怨`);
    }
  }
}

// 世界NPC演化（每年调用一次）
export function evolveWorldNpcs(worldNpcs, currentYear) {
  const updatedNpcs = worldNpcs.map(npc => {
    if (npc.status === 'DEAD') return npc;
    
    const updated = { ...npc };
    
    // 1. 年龄增长
    updated.age = (npc.age || 100) + 1;
    
    // 2. 修为增长（境界越高，增长越慢）
    const tierIndex = TIERS.findIndex(t => t.name === npc.tier);
    if (tierIndex === -1) {
      console.warn(`未找到境界: ${npc.tier}`);
      return npc;
    }
    
    const growthRate = 1 / Math.max(1, tierIndex * 0.5); // 越高越慢
    const expGain = Math.floor(npc.maxExp * 0.05 * growthRate * (0.8 + Math.random() * 0.4));
    
    updated.currentExp = Math.min(npc.maxExp, npc.currentExp + expGain);
    
    // 3. 突破境界（小概率，境界越高越难）
    const isReady = updated.currentExp >= updated.maxExp;
    const breakthroughChance = Math.max(0.02, 0.1 - tierIndex * 0.01); // 2%-10%
    
    if (isReady && Math.random() < breakthroughChance) {
      if (tierIndex < TIERS.length - 1) { // 还有更高境界
        const newTierIndex = tierIndex + 1;
        const newTier = TIERS[newTierIndex].name;
        updated.tier = newTier;
        updated.tierIndex = newTierIndex;
        updated.currentExp = 0;
        updated.maxExp = TIERS[newTierIndex].maxExp;
        updated.combatPower = Math.floor(updated.combatPower * 1.5);
        updated.majorEvents.push(`${currentYear}年：突破至【${newTier}】！`);
      }
    }
    
    // 4. 陨落（极小概率，境界越高概率越低）
    const baseDeathChance = 0.005; // 0.5%基础概率
    const deathChance = baseDeathChance / Math.max(1, tierIndex * 0.3); // 高境界降低
    
    if (Math.random() < deathChance) {
      updated.status = 'DEAD';
      updated.deathYear = currentYear;
      const reasons = ['走火入魔', '天劫失败', '仇家追杀', '寿元耗尽', '飞升而去'];
      updated.deathReason = reasons[Math.floor(Math.random() * reasons.length)];
      updated.majorEvents.push(`${currentYear}年：${updated.deathReason}，陨落！`);
    }
    
    // 5. 更新最后活跃时间
    updated.lastActiveYear = currentYear;
    
    return updated;
  });
  
  // 6. 如果有人陨落，可能生成新的天才补位（20%概率）
  const deadCount = updatedNpcs.filter(n => n.status === 'DEAD' && n.deathYear === currentYear).length;
  const newElites = [];
  
  for (let i = 0; i < deadCount; i++) {
    if (Math.random() < 0.2) { // 20%概率生成新星
      // 生成金丹后期的天才作为新星
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const name = generateRandomName(gender);
      const title = generateRandomTitle('金丹后期');
      
      const tierIndex = TIERS.findIndex(t => t.name === '金丹后期');
      const tierConfig = TIERS[tierIndex];
      
      const newElite = {
        id: `world_npc_new_${currentYear}_${i}`,
        name,
        title,
        gender,
        tier: '金丹后期',
        tierIndex,
        sect: null,
        status: 'ALIVE',
        location: 'Unknown',
        hasMetPlayer: false,
        firstMetYear: null,
        currentExp: Math.floor(tierConfig.maxExp * 0.5),
        maxExp: tierConfig.maxExp,
        combatPower: Math.floor(tierConfig.maxExp * 1.5),
        age: 50 + Math.floor(Math.random() * 50),
        personality: generatePersonality(),
        signature: generateSignature('金丹后期'),
        appearance: { description: generateAppearance(gender, '金丹后期') },
        relationships: { allies: [], enemies: [], disciples: [] },
        majorEvents: [`${currentYear}年：横空出世，震惊修真界！`],
        lastActiveYear: currentYear
      };
      
      newElites.push(newElite);
    }
  }
  
  return [...updatedNpcs, ...newElites];
}

// 根据条件筛选NPC（用于偶遇）
export function findEliteByCondition(worldNpcs, condition = {}) {
  const {
    minTierIndex = 0,
    maxTierIndex = 10,
    sectId = null,
    status = 'ALIVE',
    excludeIds = []
  } = condition;
  
  const candidates = worldNpcs.filter(npc => {
    if (npc.status !== status) return false;
    if (excludeIds.includes(npc.id)) return false;
    if (npc.tierIndex < minTierIndex || npc.tierIndex > maxTierIndex) return false;
    if (sectId && (!npc.sect || npc.sect.id !== sectId)) return false;
    return true;
  });
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// 获取天机榜数据（合并worldNpcs + activeNpcs + player）
export function getEliteRanking(worldNpcs, activeNpcs, player) {
  const allCharacters = [];
  
  // 添加玩家
  allCharacters.push({
    id: 'player',
    name: player.name,
    title: '主角',
    tier: player.tier,
    combatPower: player.combatStats?.atk * 10 || player.currentExp,
    isPlayer: true,
    status: 'ALIVE'
  });
  
  // 添加世界名人（只显示活着的）
  worldNpcs.filter(n => n.status === 'ALIVE').forEach(npc => {
    allCharacters.push({
      ...npc,
      isWorldElite: true
    });
  });
  
  // 添加认识的NPC（高境界的）
  activeNpcs.filter(n => !n.isDead).forEach(npc => {
    const tierIndex = TIERS.findIndex(t => t.name === npc.tier);
    if (tierIndex <= 5) { // 只有筑基期以上才能上榜
      allCharacters.push({
        id: npc.id,
        name: npc.name,
        title: npc.sect?.name || '散修',
        tier: npc.tier,
        combatPower: npc.currentExp || 0,
        isKnown: true,
        status: 'ALIVE'
      });
    }
  });
  
  // 按战力排序
  allCharacters.sort((a, b) => b.combatPower - a.combatPower);
  
  // 添加排名
  return allCharacters.map((char, index) => ({
    ...char,
    rank: index + 1
  }));
}
