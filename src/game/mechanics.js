// src/game/mechanics.js
import { TIERS, TRAITS, SECTS, RANKS, getTierConfig, getNextTier, SPIRIT_ROOTS, ELEMENTS, MUTANT_ELEMENTS, getRootConfigByValue, calculateStats, calculateCultivationSpeed, calculateChildFeedback, getInitialRankForChild, getSectResourceSummary } from './cultivationSystem.js';
import { calculateCombatPower } from './challengeSystem.js';
import { getItemTemplate } from '../data/itemLibrary.js';

// 随机名字库
const firstNames = ["云", "天", "灵", "凡", "昊", "雪", "青", "瑶"];

const inheritFeature = (momTrait, dadTrait) => {
  // 50% 随爸，50% 随妈 (或者变异)
  return Math.random() > 0.5 ? momTrait : dadTrait;
};

/**
 * 核心：根据资质数值，生成匹配的灵根对象
 * @param {Number} aptitude 资质数值 (0-100)
 */
const generateSpiritRootDetails = (aptitude) => {
  // 1. 获取档位配置 (比如双灵根)
  const config = getRootConfigByValue(aptitude);
  
  let myElements = [];
  let typeName = config.name;
  let typeDesc = config.desc;

  // 2. 生成具体元素
  if (config.id === 'NONE') {
    myElements = [];
  }
  else if (config.id === 'MUTANT') {
    // 变异灵根：随机取一个变异属性
    myElements = [MUTANT_ELEMENTS[Math.floor(Math.random() * MUTANT_ELEMENTS.length)]];
  }
  else {
    // 普通灵根：从五行里随机抽 config.elementCount 个
    // 洗牌算法
    const shuffled = [...ELEMENTS].sort(() => 0.5 - Math.random());
    myElements = shuffled.slice(0, config.elementCount);
  }

  return {
    type: typeName,
    elements: myElements,
    desc: typeDesc,
    color: config.color,
    multiplier: config.multiplier // 战斗力加成系数
  };
};

// 辅助：生成随机灵根
export const generateSpiritRoot = (aptitude, parent1Root, parent2Root) => {
  return generateSpiritRootDetails(aptitude);
};

/**
 * 遗传算法：生成子嗣
 * @param {Object} mother 玩家对象
 * @param {Object} father 男主对象
 */
export const generateChild = (mother, father, currentYear) => {
  // 母亲的 DNA (如果玩家没有捏脸，给个默认值)
  const momDNA = mother.avatar || { base: 0, skinColor: 0, eye: 2, eyeColor: 0, mouth: 0, hair: 1, hairColor: 0 };
  const dadDNA = father.avatar;
  // 先决定性别，以便选择合适的发型范围
  const childGender = Math.random() > 0.5 ? '男' : '女';

  // 混合 DNA
  const childDNA = {
    base: inheritFeature(momDNA.base, dadDNA.base),
    skinColor: inheritFeature(momDNA.skinColor, dadDNA.skinColor),
    eye: inheritFeature(momDNA.eye, dadDNA.eye),
    eyeColor: inheritFeature(momDNA.eyeColor, dadDNA.eyeColor),
    mouth: inheritFeature(momDNA.mouth, dadDNA.mouth),
    // 发型数量：男性资源较多（假设4），女性资源较少（2）；佛修/光头用 -1 表示无发
    hair: childGender === '女' ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4),
    hairColor: inheritFeature(momDNA.hairColor, dadDNA.hairColor)
  };

  // 1. 灵根资质计算 (父母平均值 + 随机变异)
  // 公式：(母资质 + 父资质)/2 + 变异(-15 ~ +15)
  // 如果父亲有特殊体质，变异偏正向
  let baseApt = ((mother.stats?.aptitude || 50) + (father.stats?.aptitude || 50)) / 2;
  let variance = Math.floor(Math.random() * 31) - 15; 
  
  // 基因突变 (5%概率 大幅提升或降低)
  if (Math.random() < 0.05) variance += (Math.random() > 0.5 ? 20 : -20);
  
  if (father.constitution) variance += 5; // 良性变异加成
  
  const finalApt = Math.max(1, Math.min(100, Math.floor(baseApt + variance)));

  // 2. 容貌计算
  const finalLooks = Math.floor((mother.stats.looks + father.stats.looks) / 2 + (Math.random()*10 - 5));

  // 3. 特殊体质遗传 (5%概率遗传父亲，1%概率基因突变)
  let inheritedBody = null;
  const roll = Math.random();
  if (father.constitution && roll < 0.05) {
    inheritedBody = father.constitution; // 遗传父亲
  } else if (roll > 0.99) {
    inheritedBody = { name: "天赐道体", desc: "天道宠儿，万法亲和", rarity: "UR" }; // 基因突变
  }

  // 4. 根据资质生成灵根（保存资质值，但不生成具体灵根，等6岁测灵时再生成）
  // const spiritRoot = generateSpiritRootDetails(finalApt);

  // 5. 初始战斗属性 (凡人) —— 暂无装备
  const emptyEquip = { weapon: null, armor: null, accessory: null };
  const combatStats = calculateStats("凡人", finalApt, null, emptyEquip);

  return {
    id: `child_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name: `楚${getRandomChar()}`, // 随母姓
    fatherName: father.name,
    birthYear: currentYear,
    generation: 1, // 玩家的直接子嗣为第1代
    age: 0,
    gender: childGender,
    
    // 属性面板
    tier: "凡人",
    stats: {
      aptitude: finalApt,
      looks: finalLooks,
      intelligence: Math.floor((mother.stats.cunning + father.stats.intelligence)/2)
    },
    constitution: inheritedBody,
    spiritRoot: null, // 出生时未知灵根，6岁测灵时才生成
    cultivationMethod: 'basic_breath', // 初始修炼吐纳法
    equipment: emptyEquip,
    combatStats: combatStats,
    avatar: childDNA,
    isTested: false, // 标记是否测过灵根
    
    cultivation: 0,
    isAdult: false
  };
};

// 辅助：随机名字字
const getRandomChar = () => {
  const chars = ["灵", "念", "思", "忆", "安", "宁", "轩", "辕", "昊", "天", "雪", "月"];
  return chars[Math.floor(Math.random() * chars.length)];
};

// 辅助：获取当前境界对象
const getTierInfo = (exp) => {
  // 从低到高遍历境界，找到第一个 maxExp 大于当前 exp 的境界
  for (let i = 0; i < TIERS.length; i++) {
    if (exp < TIERS[i].maxExp) {
      return TIERS[i];
    }
  }
  // 如果修为超过所有境界的上限，返回最高境界
  return TIERS[TIERS.length - 1];
};

/**
 * 核心成长逻辑
 * @param {Array} children 子嗣列表
 * @param {Object} playerResources 玩家资源(用于扣学费)
 * @returns {Object} 更新后的数据和日志
 */
export const processChildrenGrowth = (children, playerResources) => {
  let totalFeedback = 0;
  let totalCost = 0;
  let logs = [];
  let events = []; // 新增：记录特殊事件，用于弹窗提示

  // 存储新增的孙子列表
  const newGrandchildren = [];
  
  const newChildren = children.map(child => {
    let newChild = { ...child };
    newChild.age += 1/12; // 修改：一个月对应一个月，年龄增加1/12岁
    
    // --- 初始化寿元（如果没有的话）---
    if (!newChild.lifespan) {
      // 根据灵根和境界设定初始寿元
      const rootMultiplier = newChild.spiritRoot?.multiplier || 1;
      const baseLif = 100;
      newChild.lifespan = Math.floor(baseLif * (1 + rootMultiplier)); // 灵根越好寿元越长
      newChild.maxLifespan = newChild.lifespan;
    }
    
    // --- 每月消耗寿元 ---
    if (newChild.age >= 0) {
      newChild.lifespan = Math.max(0, (newChild.lifespan || newChild.maxLifespan || 100) - (1/12));
    }

    // --- 事件 A: 12个月抓周 (抽取词条) ---
    if (Math.floor(newChild.age * 12) === 12 && !newChild.trait) { // 12个月且还没抓周
      // 随机抽取 1 个词条 (基于运气，这里简化为纯随机)
      // 权重逻辑：凡品40%, 良品30%, 上品20%, 极品9%, 绝世1%
      const roll = Math.random() * 100;
      let rarity = "WHITE";
      if (roll > 99) rarity = "RED";
      else if (roll > 95) rarity = "ORANGE";
      else if (roll > 85) rarity = "PURPLE";
      else if (roll > 65) rarity = "BLUE";
      else if (roll > 35) rarity = "GREEN";

      // 从对应稀有度里抽一个
      const pool = TRAITS.filter(t => t.rarity === rarity);
      const trait = pool[Math.floor(Math.random() * pool.length)] || TRAITS[0];
      
      newChild.trait = trait;
      const logMsg = `🎲 【周岁抓周】${newChild.name} 抓到了【${trait.name}】(${trait.desc})！`;
      logs.push(logMsg);
      
      // 新增：记录抓周事件，用于弹窗互动，增加趣味性和期待感
      events.push({
        type: "ZHAOZHOU",
        title: "周岁抓周",
        message: logMsg,
        child: newChild,
        trait: trait,
        showModal: true // 标记需要弹窗
      });
    }

    // --- 事件 B: 72个月(6岁)测灵根 ---
    // 注意：测灵根的触发现在在App.jsx中处理，这里不再触发事件
    // if (Math.floor(newChild.age * 12) === 72 && !newChild.isTested) {
    //   // 触发测灵大会事件
    //   events.push({
    //     type: "SPIRIT_ROOT_TEST",
    //     title: "测灵大会",
    //     message: `${newChild.name} 年已六岁，骨骼长成，今日开启测灵台！`,
    //     child: newChild
    //   });
    // }

    // --- 事件 C: 144个月(12岁)宗门抉择期（关键交互点） ---
    if (Math.floor(newChild.age * 12) === 144 && newChild.isTested && !newChild.sect) {
      // 1. 筛选出有门槛但孩子符合资质的宗门（包含散修作为选项）
      const candidateSects = SECTS.filter(s => (newChild.stats?.aptitude || 0) >= (s.minApt || 0));

      // 2. 为每个宗门计算契合度评分（基于灵根元素与资质差距）
      const scored = candidateSects.map(s => {
        let score = 0;
        
        // === 灵根元素匹配（最重要） ===
        if (Array.isArray(newChild.spiritRoot?.elements)) {
          newChild.spiritRoot.elements.forEach(el => {
            // 完全匹配宗门偏好元素，大幅加分
            if (s.prefElements && s.prefElements.includes(el)) {
              score += 50;
              
              // 单灵根或天灵根完全匹配，额外奖励
              if (newChild.spiritRoot.elements.length === 1) {
                score += 30;
              }
            }
          });
          
          // 特殊灵根类型加成
          if (newChild.spiritRoot.type === '天灵根') {
            // 天灵根优先推荐顶级宗门
            if (s.level === 'TOP') score += 50;
          } else if (newChild.spiritRoot.type === '变异灵根') {
            // 变异灵根在特定宗门更吃香
            if (s.id === 'DEMON') score += 60;
            if (s.id === 'THUNDER') score += 50;
            if (s.id === 'GHOST' && newChild.spiritRoot.elements.includes('冰')) score += 50;
            if (s.id === 'WIND' && newChild.spiritRoot.elements.includes('风')) score += 50;
            if (s.id === 'HEAVEN_EMPEROR') score += 40; // 天帝宗也喜欢变异灵根
          } else if (newChild.spiritRoot.type === '单灵根') {
            // 单灵根在高级宗门有优势
            if (s.level === 'HIGH' || s.level === 'TOP') score += 30;
          } else if (newChild.spiritRoot.type === '双灵根') {
            // 双灵根在中高级宗门平衡
            if (s.level === 'MID' || s.level === 'HIGH') score += 20;
          }
        }
        
        // === 资质匹配度 ===
        const aptitude = newChild.stats?.aptitude || 0;
        const aptGap = s.minApt - aptitude;
        
        if (aptGap <= 0) {
          // 资质超过门槛
          const excess = aptitude - s.minApt;
          score += Math.min(40, excess); // 最多加40分
          
          // 资质远超门槛，顶级宗门更有吸引力
          if (excess >= 20 && s.level === 'TOP') score += 20;
        } else {
          // 资质不足（理论上已被过滤，但保险起见）
          score -= aptGap * 2;
        }
        
        // === 宗门等级调整 ===
        if (s.level === 'TOP') {
          // 顶级宗门选拔严格，稍微降低基础分
          score -= 5;
        } else if (s.level === 'RECKLESS') {
          // 魔道宗门对特殊体质更感兴趣
          score += 15;
        } else if (s.level === 'LOW') {
          // 低级宗门门槛低，但吸引力也低
          score -= 10;
        }
        
        // === 容貌加成（部分宗门） ===
        if (s.id === 'FLOWER' || s.id === 'HARMONY') {
          // 百花谷和合欢宗看重容貌
          const looks = newChild.looks || 50;
          if (looks >= 80) score += 30;
          else if (looks >= 60) score += 15;
        }

        return { sect: s, score };
      });

      // 3. 根据得分排序并取前四（保证包含散修选项）
      scored.sort((a, b) => b.score - a.score);
      const topSects = scored.slice(0, 4).map(s => s.sect);
      
      // 确保散修选项始终存在
      if (!topSects.find(s => s.id === 'NONE')) {
        topSects.pop(); // 移除最后一个
        topSects.push(SECTS.find(s => s.id === 'NONE'));
      }

      // 为每个候选宗门附加预计初始职位与资源摘要，用于在 UI 中展示推荐
      const selectableSects = topSects.map(s => ({
        sect: s,
        predictedRank: getInitialRankForChild(newChild, s),
        resources: getSectResourceSummary(s),
        exclusiveWith: s.exclusiveWith || []
      }));

      // 4. 记录事件并请求玩家交互（游戏会暂停自动模式）
      const logMsg = `🏫 【宗门选拔】${newChild.name} 已满12岁，触发宗门选拔（需玩家选择）。`;
      logs.push(logMsg);

      events.push({
        type: "JOIN_SECT",
        title: "宗门选拔",
        message: logMsg,
        child: newChild,
        selectableSects: selectableSects,
        showModal: true
      });
    }

    // --- 事件 C: 年度修炼与晋升 ---
    if (newChild.age > 6) { // 6岁后开始修炼
      // 1. 使用统一的修炼速度计算函数（包含功法系统）
      const speed = calculateCultivationSpeed(newChild, true); // true表示按月计算
      
      newChild.cultivation = Math.floor(newChild.cultivation + speed);

      // 2. 更新境界名称
      const currentTier = getTierInfo(newChild.cultivation);
      newChild.tierTitle = currentTier.name;

      // 3. 计算反哺 (按月计算)
      totalFeedback += calculateChildFeedback(newChild) / 12;

      // 4. 宗门职位晋升 (每36个月检查一次)
      if (Math.floor(newChild.age * 12) % 36 === 0 && newChild.sect && newChild.sect.level !== "NONE") {
        const currentRankIdx = RANKS.indexOf(newChild.rank);
        // 晋升逻辑：境界越高，职位越高
        let targetRankIdx = 0;
        if (newChild.cultivation > 500) targetRankIdx = 1; // 外门
        if (newChild.cultivation > 2000 && (newChild.stats?.aptitude || 0) > 50) targetRankIdx = 2; // 内门
        if (newChild.cultivation > 20000 && (newChild.stats?.aptitude || 0) > 80) targetRankIdx = 3; // 真传
        if (newChild.cultivation > 100000) targetRankIdx = 5; // 长老

        if (targetRankIdx > currentRankIdx) {
          newChild.rank = RANKS[targetRankIdx];
          logs.push(`🎉 【宗门捷报】${newChild.name} 修为精进，晋升为【${newChild.sect.name} · ${newChild.rank}】！`);
        }
      }
    }
    
    // --- 事件 D: 216个月(18岁)成人礼/婚配机会 ---
    if (Math.floor(newChild.age * 12) === 216) {
       logs.push(`🎂 【成人礼】${newChild.name} 已成年，可以安排婚配了。`);
       newChild.isAdult = true;
    }
    
    // --- 新增：事件 E: 生育孙子 (已婚子嗣) ---
    // 条件：已婚、年龄<60(修仙者生育难)、每年10%概率
    if (newChild.isAdult && newChild.spouse && newChild.age < 60 && Math.random() < 0.1) {
      // 限制每个孩子最多生3个
      const currentKidsCount = children.filter(c => c.parentId === newChild.id).length;
      
      if (currentKidsCount < 3) {
        // 生1个 (确保一次只生一个)
        // 计算孙子资质 (父母资质平均值 + 变异)
        const parentApt = newChild.stats?.aptitude || 50;
        const spouseApt = newChild.spouse?.stats?.aptitude || newChild.spouse?.aptitude || 50;
        const baseApt = (parentApt + spouseApt) / 2;
        const variance = Math.floor(Math.random() * 31) - 15;
        const finalApt = Math.max(1, Math.min(100, Math.floor(baseApt + variance)));
        
        // 计算孙子容貌
        const parentLooks = newChild.stats.looks || 50;
        const spouseLooks = newChild.spouse.stats?.looks || newChild.spouse.looks || 50;
        const finalLooks = Math.max(1, Math.min(100, Math.floor((parentLooks + spouseLooks) / 2 + (Math.random()*10 - 5))));
        
        // 计算孙子智力
        const parentInt = newChild.stats.intelligence || 50;
        const spouseInt = newChild.spouse.stats?.intelligence || newChild.spouse.intelligence || 50;
        const finalInt = Math.max(1, Math.min(100, Math.floor((parentInt + spouseInt) / 2 + (Math.random()*10 - 5))));
        
        // 生成灵根
        const spiritRoot = generateSpiritRootDetails(finalApt);
        
        // 计算战斗属性
        const emptyEquip = { weapon: null, armor: null, accessory: null };
        const combatStats = calculateStats("凡人", finalApt, spiritRoot.type, emptyEquip);
        
        // 生成孙子
        const grandchildGender = Math.random() > 0.5 ? "男" : "女";

        const grandchild = {
          id: Date.now() + Math.random().toString().slice(2, 10),
          name: `${newChild.name.charAt(0)}${getRandomChar()}`, // 随父姓
          fatherName: newChild.name,
          motherName: newChild.spouse.name,
          parentId: newChild.id, // 关键：设置父ID，标记为孙子
          birthYear: Math.floor(newChild.age * 12 / 12), // 当前年份
          generation: (newChild.generation || 1) + 1, // 代数 +1
          age: 0,
          gender: grandchildGender,
          
          // 属性面板
          tier: "凡人",
          stats: {
            aptitude: finalApt,
            looks: finalLooks,
            intelligence: finalInt
          },
          spiritRoot: spiritRoot,
          cultivationMethod: 'basic_breath', // 初始修炼吐纳法
          equipment: emptyEquip,
          combatStats: combatStats,
          avatar: {
            base: Math.floor(Math.random() * 3),
            skinColor: Math.floor(Math.random() * 5),
            eye: Math.floor(Math.random() * 3),
            eyeColor: Math.floor(Math.random() * 5),
            mouth: Math.floor(Math.random() * 3),
            // 女孩使用较少发型（假设2），男孩使用较多（假设4）
            hair: grandchildGender === '女' ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4),
            hairColor: Math.floor(Math.random() * 5)
          },
          isTested: false,
          
          cultivation: 0,
          isAdult: false
        };
        
        newGrandchildren.push(grandchild);
        
        // 记录生育事件
        const logMsg = `👶 【喜添孙辈】${newChild.name} 与伴侣 ${newChild.spouse.name} 诞下一子/女，取名【${grandchild.name}】，家族添丁！`;
        logs.push(logMsg);
        events.push({
          type: "GRANDCHILD_BIRTH",
          title: "喜添孙辈",
          message: logMsg,
          child: newChild,
          grandchildCount: 1
        });
      }
    }

    return newChild;
  });
  
  // 合并原有子嗣和新生成的孙子
  const allChildren = [...newChildren, ...newGrandchildren];

  return { newChildren: allChildren, totalFeedback, totalCost, logs, events };
};

// 辅助：生成随机伴侣 (用于婚配)
export const generateSpouse = (childTier, childGender) => {
  // 小概率生成男性佛修（光头、高资质、特殊交互规则）
  if (Math.random() < 0.05) {
    const surnames = ["林", "慧", "释", "空", "达", "玄"];
    const name = surnames[Math.floor(Math.random()*surnames.length)] + getRandomChar();
    const aptitude = 90 + Math.floor(Math.random() * 10);
    const looks = 30 + Math.floor(Math.random() * 30);
    const intelligence = 80 + Math.floor(Math.random() * 20);
    const spiritRoot = generateSpiritRootDetails(aptitude);
    const emptyEquip = { weapon: null, armor: null, accessory: null };
    const combatStats = calculateStats("凡人", aptitude, spiritRoot.type, emptyEquip);
    return {
      id: Date.now() + Math.random().toString().slice(2,8),
      name,
      gender: '男',
      identity: '佛修',
      stats: { aptitude, looks, intelligence },
      spiritRoot,
      cultivationMethod: 'basic_breath',
      equipment: emptyEquip,
      combatStats,
      cultivation: 2000 + Math.floor(Math.random() * 5000),
      tierTitle: getTierInfo(2000).name,
      isTested: true,
      isAdult: true,
      avatar: { base: 0, skinColor: 2, hair: -1, hairColor: null, eye: 0, eyeColor: 0, mouth: 1 },
      stats: { aptitude, looks, intelligence },
      relationship: { stage: 1, affection: 0, trust: 0 },
      likes: ['心经'],
      isSpouse: true
    };
  }
  // 随机姓氏库
  const surnames = ["林", "萧", "叶", "苏", "陈", "李", "王", "张"];
  const name = surnames[Math.floor(Math.random()*surnames.length)] + getRandomChar();
  
  // 随机资质
  const aptitude = 40 + Math.floor(Math.random() * 50);
  
  // 随机容貌
  const looks = 50 + Math.floor(Math.random() * 40);
  
  // 随机智力
  const intelligence = 40 + Math.floor(Math.random() * 40);
  
  // 生成灵根
  const spiritRoot = generateSpiritRootDetails(aptitude);
  
  // 计算战斗属性
  const emptyEquip = { weapon: null, armor: null, accessory: null };
  const combatStats = calculateStats("凡人", aptitude, spiritRoot.type, emptyEquip);
  
  // 随机修为
  const cultivation = 500 + Math.floor(Math.random() * 1500);
  
  // 随机境界
  const tierTitle = getTierInfo(cultivation).name;
  
  // 随机生成avatar
  const avatar = {
    base: Math.floor(Math.random() * 3),
    skinColor: Math.floor(Math.random() * 5),
    eye: Math.floor(Math.random() * 3),
    eyeColor: Math.floor(Math.random() * 5),
    mouth: Math.floor(Math.random() * 3),
    hair: Math.floor(Math.random() * 3),
    hairColor: Math.floor(Math.random() * 5)
  };
  
  // 确保配偶是异性
  const spouseGender = childGender === "男" ? "女" : "男";
  
  return {
    id: Date.now() + Math.random().toString().slice(2, 8),
    name,
    gender: spouseGender,
    aptitude,
    looks,
    intelligence,
    spiritRoot,
    cultivationMethod: 'basic_breath', // 初始修炼吐纳法
    equipment: emptyEquip,
    combatStats,
    cultivation,
    tierTitle,
    isTested: true,
    isAdult: true,
    avatar: avatar,
    stats: {
      aptitude: aptitude,
      looks: looks,
      intelligence: intelligence
    },
    isSpouse: true // 标记身份
  };
};

/**
 * 2. 尝试突破
 * @param {Object} player 玩家对象
 * @returns {Object} { success: boolean, msg: string, newTier: string | null }
 */
export const attemptBreakthrough = (player) => {
  const currentTierConf = getTierConfig(player.tier);
  const nextTier = getNextTier(player.tier);

  if (!nextTier) return { success: false, msg: "已至修真界巅峰，无法再突破！" };

  // 核心判定：生成随机数 vs 成功率
  const roll = Math.random();
  const isSuccess = roll < currentTierConf.chance;

  if (isSuccess) {
    return {
      success: true,
      newTier: nextTier.name,
      newMaxExp: nextTier.maxExp,
      msg: `【突破成功】只觉灵台清明，浑身真元浩荡！恭喜晋升至【${nextTier.name}】！(寿元大幅增加)`
    };
  } else {
    // 失败惩罚：扣除 20% 当前经验
    const penaltyExp = Math.floor(currentTierConf.maxExp * 0.2);
    return {
      success: false,
      penalty: penaltyExp,
      msg: `【突破失败】心魔丛生，经脉受损！境界未能突破，且损失了 ${penaltyExp} 点修为。建议积累更多底蕴再试。`
    };
  }
};

/**
 * 处理产业收益
 * @param {Array} ownedBusinesses 玩家拥有的产业列表 [{type, managerId, level}]
 * @param {Array} children 子嗣列表 (用于查找管理者是否存活/成年)
 */
export const calculateBusinessIncome = (ownedBusinesses, children) => {
  let income = 0;
  let logs = [];

  ownedBusinesses.forEach(biz => {
    // 查找管理者
    const manager = children.find(c => c.id === biz.managerId);
    
    // 如果没有管理者，或者管理者死了，产业停摆
    if (!manager) {
      logs.push(`⚠️ 您的产业【${biz.name}】无人打理，暂停营业。`);
      return;
    }

    // 收益公式：基础收益 * (1 + 管理者资质/100)
    // 聪明人管店赚更多
    const realIncome = Math.floor(biz.baseIncome * (1 + manager.stats.intelligence / 100));
    income += realIncome;
  });

  return { income, logs };
};

/**
 * 执行秘境探索
 * @param {Object} realm 秘境对象
 * @param {Object} player 玩家
 * @param {Array} team 子嗣队员列表
 */
export const exploreRealm = (realm, player, team) => {
  let log = [`🚀 家族远征队进入了【${realm.name}】...`];
  let loot = [];
  let deadChildrenIds = []; // 阵亡名单
  
  // 1. 计算总战力
  const playerCP = calculateCombatPower(player);
  const teamCP = team.reduce((sum, member) => sum + calculateCombatPower(member), 0);
  const totalCP = playerCP + teamCP;

  log.push(`⚔️ 队伍总战力: ${totalCP} (推荐: ${realm.recommendCP})`);

  // 2. 判定胜负 (战力越高，胜率越高)
  const winRate = Math.min(0.95, Math.max(0.1, totalCP / (realm.recommendCP * 1.2)));
  const isWin = Math.random() < winRate;

  if (isWin) {
    // --- 胜利结算 ---
    log.push(`✅ 经过一番苦战，队伍成功扫荡了秘境！`);
    
    // 掉落奖励 (随机获得1-3个)
    const dropCount = 1 + Math.floor(Math.random() * 3);
    for(let i=0; i<dropCount; i++) {
      const item = realm.drops[Math.floor(Math.random() * realm.drops.length)];
      loot.push(item);
    }
    const lootNames = loot.map(id => getItemTemplate(id)?.name || id);
    log.push(`📦 获得战利品: ${lootNames.join(', ')}`);

  } else {
    // --- 失败结算 ---
    log.push(`❌ 遭遇强敌，队伍溃败而逃！`);
  }

  // 3. 伤亡判定 (无论输赢都有可能受伤，输了概率更大)
  // 基础风险 * (推荐战力/实际战力) -> 战力越低风险越大
  const dangerLevel = realm.risk * (realm.recommendCP / Math.max(1, totalCP));
  
  team.forEach(member => {
    if (Math.random() < dangerLevel) {
      // 悲剧发生：子嗣死亡
      deadChildrenIds.push(member.id);
      log.push(`💀 【噩耗】${member.name} 为了掩护家族撤退，不幸陨落！`);
    } else if (Math.random() < dangerLevel * 2) {
      // 轻伤
      log.push(`🩹 ${member.name} 受了轻伤，修为倒退。`);
      // 这里应该在外部处理修为减少，暂略
    }
  });

  return { success: isWin, loot, logs: log, deadIds: deadChildrenIds };
};

// 将 `calculateChildFeedback` 从 `cultivationSystem.js` 重新导出，供其他模块（如 App.jsx）直接从 mechanics.js 导入使用
export { calculateChildFeedback };