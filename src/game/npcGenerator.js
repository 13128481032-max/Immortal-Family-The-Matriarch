// src/game/npcGenerator.js
import { generateSpiritRoot } from './mechanics.js';
import { calculateStats, SECTS, getInitialRankForChild, TIERS } from './cultivationSystem.js';
import { SKIN_PALETTES, HAIR_COLORS, EYE_COLORS, BASES, EYES, MOUTHS, HAIRS } from '../data/pixelAssets.js';

// 1. 扩充词库：更有修仙味
// 男性名字库
const maleFirstNames = [
  "清寒", "绝", "风", "云", "澜", "逸", "尘", "离", "墨", "凌", "渊", "玄", "玉", "苍",
  "轩", "辰", "夜", "寒", "霄", "煜", "炎", "霖", "泽", "宸", "煊", "瑾", "枫", "潇",
  "昊", "羽", "翊", "珏", "琰", "璟", "曜", "烨", "熠", "焱", "晟", "暄", "旭", "炫",
  "北", "南", "东", "西", "冥", "幽", "寂", "绝尘", "无极", "无双", "无涯", "天择"
];

// 女性名字库
const femaleFirstNames = [
  "清歌", "若兮", "婉仪", "思雨", "晓月", "凝霜", "醉梦", "慕雪", "语嫣", "芷若",
  "倾城", "红袖", "紫烟", "青鸾", "白凤", "玄霜", "冰心", "素手", "流光", "落霞",
  "采薇", "如画", "含烟", "寻梅", "笑寒", "惜春", "怜花", "舞袖", "轻歌", "微雨",
  "眉黛", "颦儿", "婵娟", "姣姣", "嫣然", "浅浅", "盈盈", "娉婷", "窈窕", "绰约"
];

// 单姓库
const singleLastNames = [
  "陆", "沈", "顾", "萧", "叶", "楚", "苏", "温", "莫", "夜", "白", "柳",
  "云", "风", "雪", "霜", "冰", "寒", "凌", "凤", "龙", "虎", "狼", "鹰",
  "剑", "刀", "枪", "戟", "琴", "棋", "书", "画", "花", "月", "星", "辰",
  "天", "地", "玄", "黄", "宇", "宙", "洪", "荒", "日", "月", "盈", "昃"
];

// 复姓库
const compoundLastNames = [
  "慕容", "上官", "欧阳", "司徒", "司马", "诸葛", "轩辕", "夏侯", "公孙", "独孤",
  "南宫", "东方", "西门", "北冥", "令狐", "皇甫", "长孙", "宇文", "百里", "呼延"
];

const identities = [
  // 正道宗门
  { label: "落魄散修", baseApt: 20, desc: "四海为家，为了几块灵石奔波。" },
  { label: "世家庶子", baseApt: 40, desc: "虽出身名门，却因庶出备受冷落。" },
  { label: "宗门天骄", baseApt: 80, desc: "天之骄子，众星捧月，眼高于顶。" },
  { label: "剑修传人", baseApt: 75, desc: "剑道天才，一剑破万法，杀伐果断。" },
  { label: "丹道奇才", baseApt: 70, desc: "精通炼丹，手握无数灵丹妙药。" },
  { label: "阵法大师", baseApt: 65, desc: "精通阵法，布阵困敌，神鬼莫测。" },
  { label: "符箓高手", baseApt: 60, desc: "符箓造诣极高，一符镇山河。" },
  { label: "佛修", baseApt: 70, desc: "心如明镜，六根清净，普渡众生。" },
  
  // 魔道宗门
  { label: "魔教护法", baseApt: 70, desc: "行事乖张，亦正亦邪，危险而迷人。" },
  { label: "血海魔君", baseApt: 75, desc: "以血炼魔功，杀人如麻，凶威赫赫。" },
  { label: "幻术高手", baseApt: 65, desc: "精通幻术，虚实难辨，扑朔迷离。" },
  { label: "炼尸宗徒", baseApt: 60, desc: "操控僵尸，驱使尸傀，阴森可怖。" },
  
  // 散修/特殊
  { label: "凡间书生", baseApt: 10, desc: "满腹经纶，却无缘仙途，误入修真界。" },
  { label: "妖族半妖", baseApt: 80, desc: "妖族血脉，天生神力，野性难驯。" },
  { label: "古族遗民", baseApt: 85, desc: "上古血脉，觉醒特殊神通。" },
  { label: "器修天才", baseApt: 70, desc: "精通炼器，打造神兵利器。" },
  { label: "医修圣手", baseApt: 65, desc: "妙手回春，起死回生，悬壶济世。" },
  { label: "毒修鬼才", baseApt: 60, desc: "精通毒道，百毒不侵，谈毒色变。" },
  { label: "音修琴者", baseApt: 65, desc: "以音入道，琴音杀人，余音绕梁。" },
  { label: "剑冢守墓人", baseApt: 55, desc: "世代守护剑冢，得剑灵相助。" }
];

// 特殊体质池 (极低概率获得)
const specialConstitutions = [
  { name: "纯阳之体", desc: "修炼火系功法一日千里，子嗣多为火灵根。", rarity: "SR" },
  { name: "天生道体", desc: "容貌出尘，气质超然，极易获得他人好感，子嗣容貌极高。", rarity: "SSR" },
  { name: "荒古圣体", desc: "肉身成圣，同阶无敌，子嗣体质极强。", rarity: "UR" },
  null, null, null, null, null, null, null // 大部分人没有
];

// 2. 性格矩阵 (影响剧情选项)
const personalities = [
  { label: "高冷", tag: "🧊", desc: "拒人千里" },
  { label: "温柔", tag: "🌸", desc: "如沐春风" },
  { label: "傲娇", tag: "😼", desc: "口是心非" },
  { label: "病娇", tag: "🔪", desc: "占有欲强" },
  { label: "正直", tag: "⚔️", desc: "眼里揉不得沙子" },
  { label: "清冷", tag: "❄️", desc: "清心寡欲" },
  { label: "忠犬", tag: "🐕", desc: "至死不渝" },
  { label: "深情", tag: "💖", desc: "情深意重" },
  { label: "风流", tag: "🌹", desc: "风流倜傥" },
  { label: "魅惑", tag: "💋", desc: "气质迷人" },
  { label: "坚韧", tag: "🪨", desc: "百折不挠" },
  { label: "偏执", tag: "🔥", desc: "执念深重" },
  { label: "温润", tag: "☁️", desc: "温文尔雅" },
  { label: "狂傲", tag: "🦅", desc: "狂傲不羁" },
  { label: "腹黑", tag: "😈", desc: "笑里藏刀" },
  { label: "呆萌", tag: "🐰", desc: "天真可爱" },
  { label: "冷酷", tag: "🗡️", desc: "冷酷无情" },
  { label: "慵懒", tag: "😴", desc: "慵懒散漫" },
  { label: "狡黠", tag: "🦊", desc: "狡猾机智" },
  { label: "重利", tag: "💰", desc: "唯利是图" }
];

/**
 * 根据NPC的资质、灵根和身份匹配合适的宗门
 * @param {Object} npcData NPC的基础数据
 * @returns {Object} 宗门信息 {sect, rank, status}
 */
const assignSectToNpc = (npcData) => {
  const { stats, spiritRoot, identity } = npcData;
  const aptitude = stats?.aptitude || 50;
  const elements = spiritRoot?.elements || [];
  
  // 1. 特殊身份直接匹配宗门
  const identityToSectMap = {
    '宗门天骄': ['SWORD', 'HEAVEN_EMPEROR', 'THUNDER'],
    '剑修传人': ['SWORD'],
    '丹道奇才': ['DAN'],
    '阵法大师': ['NINE_STAR'],
    '符箓高手': ['NINE_STAR', 'FLOWER'],
    '佛修': null, // 佛修独立，不属于任何宗门
    '魔教护法': ['DEMON'],
    '血海魔君': ['BLOOD'],
    '幻术高手': ['DEMON', 'GHOST'],
    '炼尸宗徒': ['GHOST'],
    '器修天才': ['STONE'],
    '医修圣手': ['GRASS'],
    '毒修鬼才': ['GHOST', 'BLOOD'],
    '音修琴者': ['FLOWER'],
    '妖族半妖': null, // 妖族不入人族宗门
    '古族遗民': null, // 古族神秘，不透露宗门
    '落魄散修': 'NONE',
    '凡间书生': Math.random() < 0.3 ? 'random' : 'NONE', // 30%进入低级宗门
    '世家庶子': 'random', // 世家庶子通常会被送入宗门
    '剑冢守墓人': null // 守墓人不入宗门
  };
  
  let possibleSects = identityToSectMap[identity.label];
  
  // 2. 如果身份没有指定宗门，根据资质和灵根分配
  if (possibleSects === 'random') {
    // 筛选符合资质要求的宗门
    possibleSects = SECTS.filter(sect => {
      if (sect.id === 'NONE') return false;
      // 资质必须达到宗门最低要求
      if (aptitude < sect.minApt) return false;
      
      // 如果宗门有偏好元素，检查是否匹配
      if (sect.prefElements && sect.prefElements.length > 0) {
        const hasMatch = elements.some(el => sect.prefElements.includes(el));
        if (!hasMatch && aptitude < sect.minApt + 10) return false; // 不匹配则需要更高资质
      }
      
      return true;
    }).map(s => s.id);
    
    // 如果没有合适的宗门，成为散修
    if (possibleSects.length === 0) {
      possibleSects = 'NONE';
    }
  }
  
  // 3. 处理特殊情况：不透露宗门或无宗门
  if (possibleSects === null) {
    return {
      sect: null,
      sectId: null,
      rank: null,
      status: 'mysterious' // 神秘不透露
    };
  }
  
  if (possibleSects === 'NONE') {
    return {
      sect: SECTS.find(s => s.id === 'NONE'),
      sectId: 'NONE',
      rank: '散修',
      status: 'rogue' // 散修
    };
  }
  
  // 4. 随机选择一个合适的宗门
  const sectId = Array.isArray(possibleSects) 
    ? possibleSects[Math.floor(Math.random() * possibleSects.length)]
    : possibleSects;
    
  const sect = SECTS.find(s => s.id === sectId);
  
  if (!sect) {
    return {
      sect: SECTS.find(s => s.id === 'NONE'),
      sectId: 'NONE',
      rank: '散修',
      status: 'rogue'
    };
  }
  
  // 5. 根据资质和宗门规则确定职位
  const rank = getInitialRankForChild(npcData, sect);
  
  // 6. 确定状态 (10%概率已经叛出宗门, 5%隐藏身份)
  let status = 'active'; // active: 在宗, defected: 叛出, hidden: 隐藏身份
  
  if (Math.random() < 0.1) {
    status = 'defected'; // 叛徒
  } else if (Math.random() < 0.05 && (sect.level === 'RECKLESS' || identity.label.includes('魔'))) {
    status = 'hidden'; // 隐藏身份的魔修
  }
  
  return {
    sect,
    sectId: sect.id,
    rank,
    status
  };
};

// 辅助函数：随机生成像素风 DNA
const generateFaceDNA = () => {
  return {
    base: Math.floor(Math.random() * BASES.length),
    skinColor: Math.floor(Math.random() * SKIN_PALETTES.length),
    eye: Math.floor(Math.random() * EYES.length),
    eyeColor: Math.floor(Math.random() * EYE_COLORS.length),
    mouth: Math.floor(Math.random() * MOUTHS.length),
    hair: Math.floor(Math.random() * HAIRS.length),
    hairColor: Math.floor(Math.random() * HAIR_COLORS.length),
  };
};

// 外貌描述池 (根据身份生成)
const appearancePools = {
  "落魄散修": [
    "眉目清俊似远山，一袭洗得发白的青衫，腰间挂着把缺口的铁剑",
    "面容憔悴，却难掩眉宇间的英气，衣服补丁摞补丁",
    "身材高大，皮肤黝黑，手掌粗糙，一看就是经常劳作的人"
  ],
  "世家庶子": [
    "面如冠玉，身着精致的锦袍，眼神中带着一丝忧郁",
    "眉清目秀，气质儒雅，虽衣着华丽却难掩自卑",
    "容貌俊美，举止得体，只是眼底总有化不开的愁绪"
  ],
  "宗门天骄": [
    "丰神俊朗，一袭白衣胜雪，周身隐约有灵气环绕",
    "剑眉星目，气势非凡，走到哪里都带着一股骄傲",
    "容貌绝世，气质出尘，仿佛谪仙下凡"
  ],
  "魔教护法": [
    "邪魅狂狷，暗红色长袍猎猎作响，眼神中带着危险的笑意",
    "面容阴鸷，浑身散发着阴冷的气息，让人不寒而栗",
    "容貌妖异，眼角一颗泪痣，嘴角总是挂着邪笑"
  ],
  "凡间书生": [
    "眉清目秀，身着青衫，腰间挂着一块玉佩，一看就是饱读诗书的人",
    "文质彬彬，气质儒雅，手里拿着一卷书，眼神专注",
    "面容白净，略显瘦弱，一副弱不禁风的样子，但眼神坚定"
  ],
  "剑修传人": [
    "眉目如画，腰悬三尺青锋，浑身剑意凌厉，不怒自威",
    "剑眉入鬓，双目如电，一身白衣如雪，宛如出鞘之剑"
  ],
  "丹道奇才": [
    "面容清秀，身着道袍，袖口绣着丹炉图案，指尖隐约有药香",
    "温文尔雅，眉宇间带着从容，腰间挂着几个精致的丹瓶"
  ],
  "阵法大师": [
    "清瘦儒雅，眼神深邃如星空，手中握着一枚罗盘",
    "气质沉稳，指尖常在虚空勾画，似在推演阵法"
  ],
  "符箓高手": [
    "面容俊朗，指尖沾着朱砂，腰间挂满各色符纸",
    "眼神锐利，动作干脆利落，周身隐约有符文闪烁"
  ],
  "佛修": [
    "宝相庄严，眉心有戒疤，一袭袈裟，眼神慈悲",
    "面容俊美，却无半点凡尘气息，如佛前青莲"
  ],
  "血海魔君": [
    "眼神猩红，浑身煞气滔天，所过之处草木枯萎",
    "面容俊美却透着诡异，指甲殷红如血"
  ],
  "幻术高手": [
    "眼神迷离如梦似幻，周身隐约有虚影浮动，真假难辨",
    "面容朦胧，气质飘渺不定，仿佛随时会化作幻影消失"
  ],
  "炼尸宗徒": [
    "面无血色，眼神阴森，浑身散发着腐朽的气息",
    "黑袍加身，指甲漆黑，走路无声如幽魂"
  ],
  "妖族半妖": [
    "野性十足，眼中闪烁兽瞳，偶尔露出尖牙和利爪",
    "身材修长，耳后隐约有兽耳，身后似有尾巴晃动"
  ],
  "古族遗民": [
    "眉心有神秘符文，双瞳异色，气质超然脱俗",
    "周身隐约有古老的气息流转，宛如从远古走来"
  ],
  "器修天才": [
    "身材健硕，手臂有炼器留下的疤痕，眼神坚毅",
    "衣着朴素，腰间挂着精巧的锻锤，指甲缝隙有金属屑"
  ],
  "医修圣手": [
    "温润如玉，身着白衣，腰间挂着药囊，指尖常有药香",
    "眉目慈祥，眼神温柔，举手投足间透着医者仁心"
  ],
  "毒修鬼才": [
    "面色苍白，眼神阴冷，指甲呈诡异的紫黑色",
    "身材瘦削，浑身散发着淡淡的毒香，让人不敢靠近"
  ],
  "音修琴者": [
    "气质飘逸，怀抱古琴，眼神深邃如潭，周身有音律流转",
    "白衣如雪，一袭青衣，抚琴之时气势凌然，杀意蕴于音律"
  ],
  "剑冢守墓人": [
    "沧桑孤寂，身着破旧道袍，眼中藏着万千剑意",
    "面容枯槁，却有一股锋锐之气，仿佛本身就是一柄剑"
  ]
};

/**
 * 生成一个随机男主
 * @param {String} playerTier 玩家当前境界 (影响遇到的NPC强度)
 * @param {String} gender 生成的NPC性别 ('男' 或 '女')
 */
export const generateRandomNpc = (playerTier, gender = '男') => {
  const id = Date.now() + Math.random().toString().slice(2, 6);
  
  // 生成姓氏（有概率生成复姓）
  const useCompoundName = Math.random() < 0.15; // 15%概率复姓
  const lastName = useCompoundName 
    ? compoundLastNames[Math.floor(Math.random() * compoundLastNames.length)]
    : singleLastNames[Math.floor(Math.random() * singleLastNames.length)];
  
  // 根据性别选择名字库
  const firstNamePool = gender === '女' ? femaleFirstNames : maleFirstNames;
  const firstName = firstNamePool[Math.floor(Math.random() * firstNamePool.length)];
  
  // 1. 随机生成资质 (正态分布，稍微偏向中间)
  // 既然是修仙者，至少要有灵根 (1-100)
  // Math.random() * 80 + 10 -> 20~80分段居多
  let aptitude = Math.floor(Math.random() * 80) + 10;
  
  // 极小概率生成天灵根 NPC
  if (Math.random() < 0.05) aptitude = 90 + Math.floor(Math.random() * 10);

  // 2. 随机属性 (核心遗传数据)
  const stats = {
    aptitude: aptitude,  // 灵根资质 (决定子嗣修炼上限)
    looks: 50 + Math.floor(Math.random() * 50), // 容貌 (50-100)
    intelligence: 40 + Math.floor(Math.random() * 60), // 悟性 (决定领悟功法速度)
    health: 80 // 健康
  };

  // 3. 随机特殊体质
  const constitution = specialConstitutions[Math.floor(Math.random() * specialConstitutions.length)];

  // 4. 生成 DNA
  const faceDNA = generateFaceDNA();

  // 5. 根据DNA特征生成对应的文字描述 (增强一致性)
  let eyeDesc = "眼若繁星";
  if (faceDNA.eye === 1) eyeDesc = "眼尾上挑";
  if (faceDNA.eye === 2) eyeDesc = "杏眼圆睁";

  const appearance = `肤色${faceDNA.skin === 0 ? '白皙' : '健康'}，${eyeDesc}。`;

  // 6. 生成灵根
  const spiritRoot = generateSpiritRoot(stats.aptitude, null, null);

  // 7. 计算战斗属性
  const combatStats = calculateStats(playerTier, stats.aptitude, spiritRoot.type);
  
  // 7.5 初始化修为经验值
  const tierConfig = TIERS.find(t => t.name === playerTier) || TIERS[1]; // 默认炼气初期
  const currentExp = Math.floor(Math.random() * tierConfig.maxExp * 0.3); // 随机初始经验 0-30%
  const maxExp = tierConfig.maxExp;
  
  // 8. 随机选择身份，并确保身份和介绍匹配
  const selectedIdentity = identities[Math.floor(Math.random() * identities.length)];

  // 9. 根据身份、资质、灵根分配宗门
  const npcBaseData = {
    stats,
    spiritRoot,
    identity: selectedIdentity
  };
  
  const sectInfo = assignSectToNpc(npcBaseData);
  
  // 10. 根据宗门身份生成更详细的描述
  let fullDesc = selectedIdentity.desc;
  if (sectInfo.status === 'mysterious') {
    fullDesc += " 来历神秘，从不透露宗门。";
  } else if (sectInfo.status === 'rogue') {
    fullDesc += " 独来独往，无门无派。";
  } else if (sectInfo.status === 'defected') {
    fullDesc += ` 曾是【${sectInfo.sect.name}】${sectInfo.rank}，后因故叛出宗门。`;
  } else if (sectInfo.status === 'hidden') {
    fullDesc += ` 表面身份是${sectInfo.rank}，实则隐藏着不可告人的秘密。`;
  } else if (sectInfo.status === 'active' && sectInfo.sect) {
    fullDesc += ` 现为【${sectInfo.sect.name}】${sectInfo.rank}。`;
  }

  return {
    id,
    name: lastName + firstName,
    age: 18 + Math.floor(Math.random() * 100), // 修仙者年龄跨度大
    identity: selectedIdentity.label,
    desc: fullDesc,
    avatar: faceDNA, // 这里不再存 Emoji，而是存对象
    appearance: appearance, 
    
    // 境界与修为
    tier: playerTier,
    currentExp: currentExp,
    maxExp: maxExp,
    
    // 核心属性
    stats: stats,
    constitution: constitution, 
    spiritRoot: spiritRoot,
    cultivationMethod: 'basic_breath', // 初始修炼吐纳法
    combatStats: combatStats,
    personality: personalities[Math.floor(Math.random() * personalities.length)],

    // 宗门信息
    sect: sectInfo.sect,
    sectId: sectInfo.sectId,
    sectRank: sectInfo.rank,
    sectStatus: sectInfo.status, // active, defected, hidden, mysterious, rogue

    // 互动数据
    relationship: {
      stage: 0, // 0:初识 1:熟悉 2:暧昧 3:恋人
      affection: 0, // 好感度
      trust: 0,     // 信任度
      jealousy: 0   // 醋意值 (修罗场用)
    },
    isPregnant: false
  };
};