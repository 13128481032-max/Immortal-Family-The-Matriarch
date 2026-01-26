// src/data/logTemplates.js
// NPC 第一人称日志模板库

// ==================== 一、交互日志模板 ====================

// 1. 闲聊
export const chatTemplates = {
  // 按好感度分组
  low: [
    "今日{playerName}与我攀谈，言谈间颇为生疏，我只是随意应付了几句。",
    "{playerName}又来找我闲聊，不知此人葫芦里卖的什么药？",
    "与{playerName}闲聊片刻，此人似乎对我颇感兴趣，只是我对{gender_ta}并无太多好感。",
    "{playerName}今日来访，言谈中提及修炼之事，我只是随口应答。"
  ],
  medium: [
    "与{playerName}闲聊甚欢，{gender_ta}提到的修炼心得倒是颇有见地。",
    "今日{playerName}来访，我们聊了许久，觉得此人言谈风趣，可以深交。",
    "{playerName}讲了个奇闻趣事，竟让我忍不住笑出声来，许久未这般轻松过了。",
    "与{playerName}论道片刻，{gender_ta}的见解独到，让我颇受启发。"
  ],
  high: [
    "今日与{playerName}谈心，不觉日落西山，竟有些依依不舍。",
    "{playerName}来访时带了我喜欢的茶点，知我者莫若{gender_ta}也。",
    "与{playerName}促膝长谈，窗外雨声淅沥，室内却温暖如春。",
    "今日{playerName}提到{gender_ta}遇到的困境，我竟不由自主地想为{gender_ta}分忧..."
  ]
};

// 2. 赠礼（喜欢）
export const giftLikeTemplates = [
  "今日{playerName}送了一份{giftName}给我，甚是欢喜，没想到{gender_ta}还记得我的喜好！",
  "{playerName}竟然送我{giftName}，此物我寻觅已久，{gender_ta}真是有心了。",
  "收到{playerName}赠送的{giftName}，心中暖意融融，看来{gender_ta}对我确实上心。",
  "{giftName}正是我所需之物，{playerName}能送我此物，说明{gender_ta}必是打听过我的喜好。感激之余，又有些窃喜。"
];

// 3. 赠礼（讨厌）
export const giftDislikeTemplates = [
  "{playerName}竟然送我{giftName}，此人莫不是来羞辱我的？真是不知所谓！",
  "今日{playerName}送来{giftName}，我最厌恶此物，{gender_ta}到底是真心还是故意为之？",
  "收到{playerName}的{giftName}，我勉强收下了，但心中颇不是滋味...",
  "{playerName}送的{giftName}让我哭笑不得，{gender_ta}难道完全不了解我吗？"
];

// 4. 切磋（胜利）
export const sparWinTemplates = [
  "今日与{playerName}切磋，我略胜一筹。{gender_ta}的身法确实独特，值得我深思。",
  "与{playerName}比试，我险胜半招。{gender_ta}实力不俗，下次若再交手，胜负难料。",
  "切磋时{playerName}使出的那一招让我眼前一亮，虽然我最终获胜，但收获颇丰。",
  "今日比武，{playerName}败于我手。不过{gender_ta}那股不服输的劲头倒是让我刮目相看。"
];

// 5. 切磋（失败）
export const sparLoseTemplates = [
  "今日与{playerName}切磋，我输了...{gender_ta}的实力比我想象中强得多。我要更加努力才行！",
  "败在{playerName}手下，虽不甘心，但...确实痛快！{gender_ta}那一招我从未见过，我要想办法破解。",
  "{playerName}今日将我击败，心中虽有不甘，但{gender_ta}确实技高一筹。我需要闭关苦修了。",
  "与{playerName}比试落败，心中五味杂陈。{gender_ta}最后那一剑，竟让我有些心跳加速..."
];

// 6. 双修
export const dualCultivationTemplates = [
  "今夜与{playerName}双修，感觉灵气在经脉中流转顺畅，{gender_ta}的真元竟与我如此契合...",
  "双修之时，{playerName}的气息温和纯净，让我感到前所未有的安心。",
  "与{playerName}共修，不知不觉间竟已天明。{gender_ta}的修为又精进了，我也受益良多。",
  "今日双修，{playerName}的真元几乎与我水乳交融，这种感觉...难以言喻。"
];

// ==================== 二、重大状态变更日志模板 ====================

// 1. 境界突破成功
export const breakthroughSuccessTemplates = [
  "闭关三月，终于冲破瓶颈，踏入{newTier}！天道酬勤，我的努力没有白费！",
  "今日突破成功，迈入{newTier}！感受到体内灵力奔涌，仿佛脱胎换骨一般。",
  "终于突破了！{newTier}的境界果然不同凡响，我能感受到天地灵气的流动更加清晰了。",
  "苦修数载，今日终成{newTier}！回想起当初的艰辛，一切都值得了。",
  "突破的那一刻，雷劫降临，我硬抗下来了！如今已是{newTier}，距离那个目标又近了一步。"
];

// 2. 境界突破失败
export const breakthroughFailTemplates = [
  "该死！明明只差一线，为何灵气突然逆流？咳咳...看来又要修养数月了。",
  "尝试突破失败，经脉受损。这次失败让我明白，修炼不可急躁。",
  "突破失败，心魔反噬...我差点走火入魔。看来我的道心还不够坚定。",
  "冲击{targetTier}失败，灵力在关键时刻紊乱。或许是我准备不足，需要更多时间沉淀。"
];

// 3. 结婚
export const marriageTemplates = [
  "今日我与{spouseName}结为道侣，从此携手共修大道。望此生不负彼此。",
  "大婚之日，{spouseName}一袭红衣，美得让我移不开眼。愿与{gender_ta}白首不相离。",
  "与{spouseName}结为连理，心中既欢喜又忐忑。往后余生，请多关照。",
  "今日成婚，{spouseName}的笑容如春日暖阳。我发誓，定要护{gender_ta}周全。"
];

// 4. 生子
export const childbornTemplates = [
  "今日我也做了{parentRole}，看着孩子稚嫩的脸庞，只觉肩上责任更重了。",
  "孩儿降生，啼哭声响彻整个院落。我的{childName}，愿你平安喜乐。",
  "为人{parentRole}的感觉真是奇妙...看着怀中的小生命，我发誓要给{gender_ta}最好的。",
  "孩子出生了，{childName}长得真可爱。希望{gender_ta}能健康成长，不必走我走过的弯路。"
];

// 5. 寿元将尽
export const nearDeathTemplates = [
  "近日总感气血衰败，大限将至了吗...还有好多事没做完。",
  "手脚越来越不听使唤，修为也在衰退。我的时间不多了。",
  "今日对镜梳妆，竟发现鬓角已全白。岁月不饶人啊...",
  "感觉到寿元在流失，每一次呼吸都比以前更加吃力。我还能坚持多久？",
  "若真的大限将至，我还有什么放不下的呢？{playerName}的面容浮现在脑海，或许...这就是羁绊吧。"
];

// 6. 受重伤
export const severeInjuryTemplates = [
  "今日遭人偷袭，身受重伤。若非{helperName}相救，我恐怕已命丧黄泉了。",
  "伤势太重，连站起来都困难...这次真是大意了。",
  "差点死掉...那一剑若再偏一寸，我就回不来了。",
  "身上的伤口还在渗血，但比肉体的痛苦更难受的是...我竟然这么弱。"
];

// ==================== 三、日常模拟日志模板 ====================

// 按身份分类
export const dailyTemplatesByIdentity = {
  // 宗门弟子
  "宗门天骄": [
    "今日在演武场练剑三千次，师兄们都说我太拼命了，但不努力怎么配得上'天骄'二字？",
    "宗门大比将至，最近竞争氛围很浓。我必须保持第一，不能让人小瞧了。",
    "师父今日传授了一门新剑法，我演练了一整天才勉强入门。路还很长。",
    "有师弟在背后议论我，说我仗着天赋好就目中无人。哼，实力强本就该有傲气！"
  ],
  
  "剑修传人": [
    "今日练剑，心神不宁。师父说我心中有杂念，难道是因为上次欠了{playerName}的人情未还？",
    "剑道一途，唯快不破。今日悟出了新的招式，待找个对手试试威力。",
    "后山的瀑布下是最好的修炼场所，水声如雷，能磨砺心境。",
    "师门传承的这把剑越来越重了，不是剑重，是我背负的期望太重。"
  ],

  "丹道奇才": [
    "今日炼制筑基丹，终于成功了！虽然只是下品，但也是一大进步。",
    "药材不够了，明日要去坊市采购一批。希望那个奸商别再坑我。",
    "炼丹炉又炸了...这已经是本月第三次了。看来火候还是掌握得不够好。",
    "听说最近有人在黑市高价求购疗伤丹，要不要去赚一笔？"
  ],

  "落魄散修": [
    "灵石又不够了...明日要去接任务，希望能遇到报酬高点的。",
    "在拍卖行捡了个漏，花五块灵石买到一本残缺剑谱，不知道有没有用。",
    "今日遭遇妖兽，差点丧命，好不容易逃了回来。散修的命就是这么不值钱吗？",
    "听说东边秘境开启了，要不要去碰碰运气？但以我这修为，恐怕九死一生..."
  ],

  "佛修": [
    "今日诵经百遍，心如止水，渐入禅定。",
    "山下村民送来香火钱，我已婉拒。出家人要这些外物何用？",
    "傍晚时分，夕阳西下，看着云海翻涌，忽然悟到一丝天地真谛。",
    "今日有施主来询问佛法，我为其讲解半日，望能助其解脱烦恼。"
  ],

  "凡间书生": [
    "今日在客栈听说江湖中又有大事发生，那些修真者的世界真是精彩。",
    "寒窗苦读十年，却在科举中名落孙山。或许我该考虑其他出路了？",
    "偶然得到一本奇书，书中记载的竟是修炼之法！难道我也有机会踏入仙途？",
    "在集市上遇到一位修真者，{gender_ta}飘然若仙的模样让我心驰神往。"
  ]
};

// 按性格分类（与身份无关的通用日常）
export const dailyTemplatesByPersonality = {
  "高冷": [
    "今日无事，独坐山巅观云海。",
    "又有人来烦我，我已闭门谢客。清静最好。",
    "世人皆醉我独醒，与其与庸人纠缠，不如独自修行。",
    "今日翻阅古籍，看到一句'高处不胜寒'，竟有些感触。"
  ],
  
  "温柔": [
    "今日去后山采了些灵药，准备炼制疗伤药送给需要的师兄弟。",
    "看到小师妹摔倒了，我扶她起来并帮她处理了伤口。希望她没事。",
    "傍晚时分做了些糕点，分给了邻居们，大家都说好吃，我很开心。",
    "今日遇到一只受伤的小兽，我为它疗伤后将它放归山林了。"
  ],
  
  "傲娇": [
    "今日有人夸我实力强，哼，这不是理所当然的吗？才不是因为高兴呢！",
    "明明是担心{playerName}，却说成是顺路...{gender_ta}应该没看出来吧？",
    "我才不是想见{playerName}，只是刚好路过{gender_ta}那里而已！",
    "听说{playerName}受伤了...我、我才不担心呢！只是刚好炼了些疗伤药而已！"
  ],
  
  "病娇": [
    "偷偷去看了{playerName}一眼，{gender_ta}身边那个人是谁？真想杀掉...",
    "今日{playerName}没有来找我，是不是{gender_ta}不喜欢我了？不行，我要去找{gender_ta}！",
    "只要能和{playerName}在一起，让我做什么都可以...就算是堕入魔道也无妨。",
    "今日做了一个梦，梦见{playerName}和别人在一起...不，那只是梦，{gender_ta}是我的！"
  ],
  
  "正直": [
    "今日见义勇为，制止了一起恶霸欺凌百姓的事件。虽然得罪了人，但我不后悔。",
    "听说有人违反门规，我已向长老禀报。规矩就是规矩，不可徇私。",
    "有人劝我睁一只眼闭一只眼，但我做不到。对就是对，错就是错！",
    "今日修炼时突然想到，何为正道？除了实力，更重要的是那颗赤诚之心吧。"
  ],
  
  "活泼": [
    "隔壁师兄养的灵鹤太肥了，好想偷偷烤了吃！不过还是算了，会被打的。",
    "今日偷溜下山去集市玩，买了好多好吃的！希望师父不要发现...",
    "和师兄弟们玩了一整天，真开心！明天又是崭新的一天，期待！",
    "今日恶作剧把师兄的剑藏起来了，看{gender_ta}急成那样笑死我了哈哈哈！"
  ]
};

// 按关系状态分类（提及玩家的日常）
export const dailyTemplatesByRelationship = {
  // 陌生/低好感（不提玩家）
  stranger: [
    "今日平平无奇，修炼、打坐、吃饭、睡觉，日复一日。",
    "出去采购了一些物资，遇到几个熟人打了招呼。",
    "今日天气不错，心情也还可以。",
    "在藏书阁看了一整天的书，收获颇丰。"
  ],
  
  // 暗恋/高好感
  crush: [
    "今日在坊市远远看到一个背影很像{playerName}，追上去却认错人了，怅然若失。",
    "不知道{playerName}现在在做什么？{gender_ta}有没有好好修炼？有没有受伤？",
    "梦到{playerName}了...醒来后却是空荡荡的房间，有些失落。",
    "听说{playerName}最近闭关了，也不知道{gender_ta}什么时候出关。真想见{gender_ta}...",
    "今日炼了一炉丹药，想着下次见到{playerName}时送给{gender_ta}。"
  ],
  
  // 仇恨
  hatred: [
    "听说{playerName}最近风头很盛，哼，且让{gender_ta}得意几天。",
    "我一定要变强，强到能让{playerName}匍匐在我脚下的程度！",
    "今日修炼时想到{playerName}，怒火中烧，差点走火入魔...我要冷静！",
    "{playerName}...等我突破之日，就是{gender_ta}的死期！"
  ],
  
  // 道侣
  spouse: [
    "{playerName}今日又去忙了，虽然知道{gender_ta}是为了我们的未来，但还是有些寂寞...",
    "今日为{playerName}煲了汤，希望{gender_ta}回来时能趁热喝。",
    "有{playerName}在身边，即使是普通的日子也觉得很幸福。",
    "夜深了，{playerName}还在修炼。我给{gender_ta}披上外衣，{gender_ta}回头对我笑，我的心都化了。"
  ]
};

// ==================== 四、特殊事件日志模板 ====================

// 宗门任务
export const sectMissionTemplates = [
  "师门派我去后山采药，那守护妖兽甚是难缠，好在有惊无险。换了些灵石，正好攒着买飞剑。",
  "今日完成宗门任务，击杀了一头三阶妖兽。虽然受了些伤，但报酬还算丰厚。",
  "长老派我去护送商队，路上遇到山贼劫掠，我出手将其击退。商队领头的掌柜多给了我一些灵石。",
  "宗门派发的巡山任务真是无聊，在山里转了一整天什么都没发现。白跑一趟。"
];

// 探险
export const adventureTemplates = [
  "今日闯入一处古老洞府，虽然机关重重，但我还是找到了一本功法秘籍！",
  "在秘境中遭遇强敌，差点丧命。幸亏关键时刻突破了，才侥幸逃生。",
  "进入一座废弃的宗门遗址，满地的骸骨诉说着曾经的惨烈。不知道当年发生了什么...",
  "秘境中的宝物确实诱人，但更要小心命丧其中。今日险象环生，收获倒也不少。"
];

// 购物/拍卖会
export const shoppingTemplates = [
  "在坊市淘到一件不错的法器，花了大价钱，心疼...",
  "今日参加拍卖会，看到了许多罕见的宝物，可惜囊中羞涩，只能看着别人竞拍。",
  "去灵药铺补充了一些丹药，老板还是那么黑心，价格又涨了！",
  "遇到一个小摊贩兜售古籍，我随手翻了翻，竟发现是失传已久的阵法心得！果断买下！"
];

// 社交活动
export const socialTemplates = [
  "今日参加师兄弟的聚会，大家推杯换盏，好不热闹。",
  "有位同门来找我切磋，我们比试了几招，不分胜负，倒是惺惺相惜。",
  "今日去拜访了一位前辈，聆听{gender_ta}讲述修炼心得，受益匪浅。",
  "遇到一位有趣的散修，我们在茶馆聊了一下午，交换了不少修炼经验。"
];

// 闭关
export const seclusionTemplates = [
  "今日入关，希望这次能有所突破。",
  "闭关第十日，感觉快要突破了，再坚持一下！",
  "出关了，虽然没能突破，但对功法的理解更深了一层。",
  "闭关期间心境平和，感悟颇多。修炼不只是提升修为，更是磨砺心性。"
];

// 天气/景色描写（填充用）
export const sceneryTemplates = [
  "今日阴雨连绵，独坐窗前听雨声，心中宁静。",
  "窗外下雪了，银装素裹的世界美得让人心醉。",
  "春日暖阳，万物复苏，让人心情舒畅。",
  "秋风萧瑟，落叶纷飞，不知为何有些伤感。",
  "今夜月色如水，独自在庭院中舞了一曲剑，算是给自己的慰藉吧。"
];

// ==================== 五、辅助函数 ====================

/**
 * 随机从数组中选择一个元素
 */
export function randomPick(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 根据好感度获取对应的闲聊模板
 */
export function getChatTemplateByAffection(affection) {
  if (affection < 30) return randomPick(chatTemplates.low);
  if (affection < 70) return randomPick(chatTemplates.medium);
  return randomPick(chatTemplates.high);
}

/**
 * 根据身份获取日常模板
 */
export function getDailyTemplateByIdentity(identity) {
  const templates = dailyTemplatesByIdentity[identity];
  if (!templates) {
    // 如果没有对应身份的模板，返回通用模板
    return "今日无事，安心修炼了一整天。";
  }
  return randomPick(templates);
}

/**
 * 根据性格获取日常模板
 */
export function getDailyTemplateByPersonality(personality) {
  const templates = dailyTemplatesByPersonality[personality];
  if (!templates) {
    return randomPick(sceneryTemplates); // 降级到通用场景描写
  }
  return randomPick(templates);
}

/**
 * 根据关系状态获取日常模板
 */
export function getDailyTemplateByRelationship(relationshipStage, affection, isSpouse) {
  if (isSpouse) {
    return randomPick(dailyTemplatesByRelationship.spouse);
  }
  
  if (affection < 20) {
    return randomPick(dailyTemplatesByRelationship.stranger);
  }
  
  if (affection >= 80) {
    return randomPick(dailyTemplatesByRelationship.crush);
  }
  
  // 中等好感度可能不提及玩家
  return null; // 返回 null 表示不使用关系模板
}
