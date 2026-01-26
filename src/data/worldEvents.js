// src/data/worldEvents.js
// 修仙大陆纪事事件模板库

/**
 * 事件类型说明：
 * - SECT: 宗门动态（宗门大比、宗门战争、长老更替等）
 * - GENIUS: 天才修士动态（天骄崛起、突破、战斗等）
 * - TREASURE: 天材地宝出世
 * - REALM: 秘境开启
 * - DISASTER: 天灾异象
 * - POLITICS: 修仙界政治事件
 * - NPC_RELATED: 与玩家认识的NPC相关的事件
 */

/**
 * 生成与特定NPC相关的宗门事件
 * @param {Object} npc 游戏中的NPC对象
 * @returns {String|null} 事件描述，如果NPC不适合返回null
 */
export const generateNpcRelatedSectEvent = (npc) => {
  if (!npc || !npc.sect || !npc.sectId || npc.sectId === 'NONE') {
    return null; // 散修或无宗门信息的NPC不生成宗门事件
  }
  
  const sectName = npc.sect.name;
  const npcName = npc.name;
  const rank = npc.sectRank || '弟子';
  const status = npc.sectStatus || 'active';
  
  // 根据NPC状态生成不同的事件
  const eventTemplates = [];
  
  if (status === 'active') {
    // 在宗的NPC事件
    eventTemplates.push(
      `【${sectName}】${rank}${npcName}在宗门大比中脱颖而出，获得长老青睐。`,
      `【${sectName}】${npcName}成功突破瓶颈，修为更进一步，宗门为其庆贺。`,
      `【${sectName}】${npcName}外出历练时遇险，幸得同门相助才化险为夷。`,
      `【${sectName}】${npcName}发现一处灵矿，为宗门立下功劳。`,
      `【${sectName}】${npcName}被选中参加宗门秘境试炼。`,
      `【${sectName}】${npcName}在藏经阁顿悟，修炼速度大增。`,
      `【${sectName}】${npcName}斩杀妖兽，获得宗门嘉奖。`,
      `【${sectName}】${npcName}炼制出稀有丹药，引起哄抢。`,
      `【${sectName}】${npcName}与同门切磋，技艺精进。`,
      `【${sectName}】传闻${npcName}获得上古传承，实力暴涨。`
    );
    
    if (rank === '真传弟子' || rank === '内门弟子') {
      eventTemplates.push(
        `【${sectName}】真传弟子${npcName}被长老收为亲传，地位大涨。`,
        `【${sectName}】${npcName}代表宗门出战，击败敌对宗门高手，扬名立万。`,
        `【${sectName}】${npcName}闭关三月，成功凝练本命法宝。`,
        `【${sectName}】宗主亲自指点${npcName}，众弟子艳羡不已。`
      );
    }
    
    // 魔道宗门特殊事件
    if (sectName.includes('魔') || sectName.includes('血') || sectName.includes('阴')) {
      eventTemplates.push(
        `【${sectName}】${npcName}修炼魔功走火入魔，幸好及时压制。`,
        `【${sectName}】${npcName}屠戮一村以炼魔功，正道震怒。`,
        `【江湖通缉】${npcName}(${sectName})作恶多端，被正道悬赏缉拿。`
      );
    }
  } else if (status === 'defected') {
    // 叛逃者事件
    eventTemplates.push(
      `【修仙界震动】${sectName}通缉叛徒${npcName}，悬赏十万灵石。`,
      `【江湖传闻】曾为【${sectName}】${rank}的${npcName}销声匿迹，不知所踪。`,
      `【${sectName}】派出追杀令，誓要将叛徒${npcName}缉拿归案。`,
      `【坊市消息】有人在黑市见到${npcName}，疑似改头换面。`,
      `【宗门悬赏】${sectName}发布追杀令，${npcName}成为通缉要犯。`,
      `【江湖快讯】${npcName}叛出${sectName}后，疑似投靠敌对势力。`
    );
  } else if (status === 'hidden') {
    // 隐藏身份者事件
    eventTemplates.push(
      `【${sectName}】${npcName}行事愈发诡异，引起同门怀疑。`,
      `【江湖传闻】有人在暗中调查【${sectName}】${npcName}的真实身份。`
    );
  }
  
  return eventTemplates.length > 0 
    ? eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
    : null;
};

/**
 * 生成涉及多个NPC的宗门冲突事件
 * @param {Array} npcs 游戏中的NPC数组
 * @returns {String|null} 事件描述
 */
export const generateNpcSectConflictEvent = (npcs) => {
  if (!npcs || npcs.length < 2) return null;
  
  // 筛选有宗门的NPC
  const sectNpcs = npcs.filter(npc => 
    npc.sect && npc.sectId && npc.sectId !== 'NONE' && npc.sectStatus === 'active'
  );
  
  if (sectNpcs.length < 2) return null;
  
  // 随机选两个不同宗门的NPC
  const npc1 = sectNpcs[Math.floor(Math.random() * sectNpcs.length)];
  let npc2 = sectNpcs[Math.floor(Math.random() * sectNpcs.length)];
  let attempts = 0;
  while (npc2.sectId === npc1.sectId && attempts < 10) {
    npc2 = sectNpcs[Math.floor(Math.random() * sectNpcs.length)];
    attempts++;
  }
  
  if (npc1.sectId === npc2.sectId) return null; // 同宗门不生成冲突
  
  const conflictTemplates = [
    `【宗门冲突】【${npc1.sect.name}】${npc1.name}与【${npc2.sect.name}】${npc2.name}在秘境中相遇，爆发激烈战斗。`,
    `【修仙界关注】${npc1.name}(${npc1.sect.name})与${npc2.name}(${npc2.sect.name})因资源争夺结下梁子。`,
    `【宗门对立】【${npc1.sect.name}】${npc1.name}击败【${npc2.sect.name}】${npc2.name}，两宗关系愈发紧张。`
  ];
  
  return conflictTemplates[Math.floor(Math.random() * conflictTemplates.length)];
};

// ==================== 一、宗门动态事件 ====================

export const sectEvents = [
  // 宗门大比
  {
    type: 'SECT',
    title: '宗门大比',
    templates: [
      "【凌霄宗】举办百年一度的宗门大比，内门弟子剑舞惊鸿，最终由真传弟子夺得魁首。",
      "【丹鼎阁】炼丹大会落幕，一位外门弟子炼出八品丹药，震惊全场。",
      "【天魔教】血池试炼开启，百名弟子进入，仅三十人生还，实力暴增。",
      "【东海龙宫】潮汐秘境开放，水系弟子纷纷突破，宗门整体实力大增。",
      "【天雷宗】引雷台试炼，数名弟子被天雷击中却突破瓶颈，成就雷体。",
      "【九星门】星盘大阵演练成功，阵法威力足以困住元婴修士。",
      "【百花谷】春季花宴，各宗弟子齐聚赏花，促成数对道侣。",
      "【逍遥派】身法大赛举办，一名弟子身化清风，连胜七场。",
      "【阴煞宗】幽冥祭典，炼化万鬼，宗门实力暴涨但引来正道围剿。",
      "【血河派】血池扩张，吞噬附近三个小宗门，引发正魔大战。"
    ],
    probability: 0.15
  },
  
  // 宗门战争/冲突
  {
    type: 'SECT',
    title: '宗门冲突',
    templates: [
      "【凌霄宗】与【天魔教】在云端秘境发生冲突，双方各损失数名真传弟子。",
      "【丹鼎阁】长老在炼丹时遭【血河派】偷袭，重伤垂危。",
      "【东海龙宫】海域领地遭人族宗门侵犯，龙太子震怒出手。",
      "【天帝宗】与【阴煞宗】爆发正魔大战，双方动用化神修士。",
      "【九星门】与【逍遥派】因矿脉归属发生纠纷，最终协商解决。",
      "【金刚门】山门遭妖兽围攻，弟子奋力抵抗，击退兽潮。",
      "【百花谷】遭遇魔修劫掠，幸得【凌霄宗】驰援才化险为夷。",
      "【天雷宗】引雷台遭神秘势力破坏，宗主震怒誓要揪出真凶。"
    ],
    probability: 0.1
  },
  
  // 宗门喜事
  {
    type: 'SECT',
    title: '宗门喜事',
    templates: [
      "【凌霄宗】宗主女儿成婚，邀请各大宗门前来观礼，盛况空前。",
      "【丹鼎阁】炼出传说中的九转金丹，引来各方势力觊觎。",
      "【天帝宗】太上长老闭关百年后成功突破分神期，震惊修仙界。",
      "【东海龙宫】龙王寿诞，各大势力纷纷送礼庆贺。",
      "【合欢宗】举办双修法会，吸引无数修士前来求道。",
      "【百草谷】培育出千年灵芝，可助金丹修士突破。",
      "【天雷宗】捕获一只雷劫兽，用于锻炼弟子。",
      "【巨石门】发现上古炼器遗址，挖出大量宝材。"
    ],
    probability: 0.12
  },
  
  // 宗门招收弟子
  {
    type: 'SECT',
    title: '宗门招徒',
    templates: [
      "【凌霄宗】开山收徒，测出三名天灵根弟子，轰动修仙界。",
      "【天帝宗】派出化神长老四处寻找天才，发现一名雷火双灵根少年。",
      "【丹鼎阁】炼丹大会上发现一名火木双灵根天才，当场收为真传。",
      "【天魔教】血池中诞生一具天生魔体，被教主亲自收徒。",
      "【东海龙宫】龙女巡游人间，收了一名水灵根女修为弟子。",
      "【阴煞宗】掘墓发现一具万年不腐之体，炼成鬼修。",
      "【百花谷】花仙子降临，点化一名容貌绝世的少女。"
    ],
    probability: 0.08
  }
];

// ==================== 二、天才修士动态 ====================

export const geniusEvents = [
  // 天骄崛起
  {
    type: 'GENIUS',
    title: '天骄崛起',
    templates: [
      "【天元大陆】惊现一位雷灵根天才，十岁筑基，号称'雷公子'。",
      "【北荒】剑修'一剑断江'横空出世，挑战各派剑修，未尝一败。",
      "【东海】一名散修以双灵根之资，逆天击败天灵根天才。",
      "【中州】炼丹天才'丹仙子'年仅二十便能炼制七品丹药。",
      "【西域】佛门金刚寺走出一位明心见性的小和尚。",
      "【南疆】蛊修少女驯服万毒之王，震慑南疆各族。",
      "【中原】一名书生修士以儒家浩然正气突破金丹，被称为'儒剑仙'。"
    ],
    probability: 0.1
  },
  
  // 天才突破
  {
    type: 'GENIUS',
    title: '天才突破',
    templates: [
      "【凌霄宗】剑首'凌云子'闭关三年，成功突破元婴期。",
      "【天帝宗】圣子引来九重雷劫，成功渡劫晋升化神。",
      "【丹鼎阁】药王谷主突破炼虚期，寿元增至千年。",
      "【天魔教】魔子吞噬百名修士精血，强行突破元婴中期。",
      "【东海龙宫】龙太子化身真龙，修为突破化神期。",
      "【百花谷】花仙子领悟生命法则，突破合体期。"
    ],
    probability: 0.08
  },
  
  // 天才对决
  {
    type: 'GENIUS',
    title: '天才对决',
    templates: [
      "【天元城】'雷公子'与'剑仙子'巅峰对决，大战三百回合不分胜负。",
      "【万剑崖】剑修'断江'挑战【凌霄宗】剑首，最终惜败半招。",
      "【黑风岭】正魔天才生死决斗，最终正道险胜。",
      "【星海秘境】各派天骄争夺传承，爆发惨烈混战。",
      "【龙门大会】年轻一辈比武招亲，引发连番战斗。",
      "【天梯试炼】百名天才登天梯，仅有三人登顶。"
    ],
    probability: 0.07
  },
  
  // 天才陨落
  {
    type: 'GENIUS',
    title: '天才陨落',
    templates: [
      "【修仙界震惊】'剑仙子'在秘境中遭伏击身亡，修仙界哀悼。",
      "【天魔教】魔子走火入魔，化作一滩血水。",
      "【东海龙宫】龙子渡劫失败，龙魂飞散。",
      "【中州】'丹仙子'为救同门，耗尽生机而逝。",
      "【北荒】剑修'断江'挑战化神修士，力战而亡。",
      "【天元城】一代天骄被宿敌暗算，含恨陨落。"
    ],
    probability: 0.05
  }
];

// ==================== 三、天材地宝出世 ====================

export const treasureEvents = [
  {
    type: 'TREASURE',
    title: '异宝出世',
    templates: [
      "【昆仑山】天降神石，内含上古功法，引发各派争夺。",
      "【东海】千年灵珠出世，散发五彩霞光，水族争抢。",
      "【死亡沙漠】沙暴过后，露出上古炼器宗遗址，宝物无数。",
      "【天元城】拍卖行现身一件先天灵宝，最终被神秘人以天价拍走。",
      "【幽冥谷】九幽冥火现世，引来魔修与鬼修疯抢。",
      "【雷霆峡】雷劫木现世，天雷宗封锁山谷。",
      "【百花林】万年灵药成精，化作人形逃遁。",
      "【星陨之地】天外陨石坠落，内有星辰精铁。",
      "【龙骨山】发现上古真龙遗骸，龙骨龙筋价值连城。"
    ],
    probability: 0.12
  }
];

// ==================== 四、秘境开启 ====================

export const realmEvents = [
  {
    type: 'REALM',
    title: '秘境开启',
    templates: [
      "【星海秘境】百年一度的星海秘境开启，各派弟子争相进入。",
      "【上古仙府】一座仙府突然显现，据说内有飞升仙人的传承。",
      "【幽冥鬼域】鬼域裂缝扩大，无数阴魂涌出，需各派联手镇压。",
      "【龙墓禁地】传说中的龙族墓地现世，龙宫封锁入口。",
      "【五行秘境】五行轮转，秘境再现，内有五行至宝。",
      "【剑冢遗迹】万剑齐鸣，上古剑冢开启，剑修朝圣。",
      "【丹神洞府】炼丹祖师洞府现世，内有失传丹方。",
      "【魔窟深渊】封印松动，魔气外泄，正道集结讨伐。"
    ],
    probability: 0.1
  }
];

// ==================== 五、天灾异象 ====================

export const disasterEvents = [
  {
    type: 'DISASTER',
    title: '天灾异象',
    templates: [
      "【天元大陆】血月当空，天降异象，预示大劫将至。",
      "【北荒】寒潮席卷，万里冰封，无数修士冻毙荒野。",
      "【东海】海啸滔天，沿海宗门损失惨重。",
      "【中州】旱魃为祸，赤地千里，修士出手降妖。",
      "【西域】沙暴遮天，妖兽暴动，佛门出手镇压。",
      "【南疆】瘴气爆发，百毒肆虐，蛊修趁机作乱。",
      "【天劫降临】修仙界同时有三位修士渡劫，引发天地异象。",
      "【空间裂缝】虚空裂开，有异界生物入侵。",
      "【灵气枯竭】某处灵脉断裂，方圆千里灵气稀薄。"
    ],
    probability: 0.08
  }
];

// ==================== 六、修仙界政治 ====================

export const politicsEvents = [
  {
    type: 'POLITICS',
    title: '修仙界政局',
    templates: [
      "【正魔联盟】正魔两道罕见联手，共同对抗妖族入侵。",
      "【宗门会盟】十大宗门齐聚天元城，商讨修仙界未来。",
      "【皇朝更替】凡人皇朝更迭，新帝拜访各大仙宗求庇护。",
      "【妖族入侵】妖族大军南下，修仙界组建联军抵抗。",
      "【魔道兴盛】魔道势力日益壮大，正道岌岌可危。",
      "【散修联盟】散修不满宗门垄断资源，组建联盟对抗。",
      "【家族崛起】一个修仙家族突然崛起，挑战宗门地位。",
      "【商会垄断】天元商会垄断丹药交易，各派不满。"
    ],
    probability: 0.07
  }
];

// ==================== 七、日常琐事（降低影响力） ====================

export const dailyEvents = [
  {
    type: 'DAILY',
    title: '修仙琐事',
    templates: [
      "【天元城】城主府举办修士交流会，促进资源交易。",
      "【坊市】一名炼器师摆摊，吸引无数修士围观。",
      "【拍卖行】今日拍卖罕见灵兽蛋，最终被一富商买走。",
      "【修仙学院】新生入学测试，今年灵根合格率创新高。",
      "【灵兽市场】一只罕见的灵狐以天价成交。",
      "【炼丹坊】丹师公开授课，讲解炼丹心得。",
      "【藏书阁】新到一批功法玉简，修士争相购买。"
    ],
    probability: 0.15
  }
];

// ==================== 八、知名人物特殊事件 ====================

export const famousPersonEvents = [
  {
    type: 'FAMOUS',
    title: '名宿动向',
    templates: [
      "【凌霄宗】剑圣'逍遥子'出关，震慑宵小之辈。",
      "【天帝宗】老祖宗突破渡劫期，引发天地异象。",
      "【丹鼎阁】药王外出采药，偶遇天材地宝。",
      "【东海龙宫】龙王闭关千年，终于苏醒。",
      "【散修联盟】传奇散修'独行侠'击败宗门长老。",
      "【魔道】魔帝现身，屠戮正道修士百余人。",
      "【佛门】金身罗汉涅槃重生，修为更进一步。",
      "【剑宗】剑祖领悟剑意极致，欲破碎虚空。"
    ],
    probability: 0.06
  }
];

// ==================== 工具函数 ====================

/**
 * 获取所有事件模板池
 */
export const getAllEventPools = () => [
  ...sectEvents,
  ...geniusEvents,
  ...treasureEvents,
  ...realmEvents,
  ...disasterEvents,
  ...politicsEvents,
  ...dailyEvents,
  ...famousPersonEvents
];

/**
 * 根据类型获取事件池
 */
export const getEventPoolByType = (type) => {
  const pools = {
    SECT: sectEvents,
    GENIUS: geniusEvents,
    TREASURE: treasureEvents,
    REALM: realmEvents,
    DISASTER: disasterEvents,
    POLITICS: politicsEvents,
    DAILY: dailyEvents,
    FAMOUS: famousPersonEvents
  };
  return pools[type] || [];
};

/**
 * 随机选择一个模板
 */
export const randomPick = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};
