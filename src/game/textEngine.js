// src/game/textEngine.js

/**
 * 1. 闲聊系统：根据NPC属性生成对话
 */
export const getChatText = (npc) => {
  const { identity, personality, stats, relationship } = npc;
  // 兼容两种personality结构：对象(label属性)或数组(第一个元素)
  const trait = typeof personality === 'object' && personality !== null && 'label' in personality 
    ? personality.label 
    : (Array.isArray(personality) ? personality[0] : "普通");
  
  // 兼容stats.aptitude可能不存在的情况
  const hasHighAptitude = stats.aptitude && stats.aptitude >= 90;

  // --- A. 优先判定：特殊高资质/特殊体质 ---
  if (hasHighAptitude) {
    const lines = [
      "近日观星，忽感天道浩渺，你我皆如蝼蚁。",
      "昨夜修炼时，丹田内似有紫气东来，妙不可言。",
      "凡俗之事休要提，我只想尽快突破瓶颈。"
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  }

  // --- B. 身份专属对话 ---
  const identityDialogs = {
    "落魄散修": [
      "唉，最近坊市的辟谷丹又涨价了，这日子没法过了。",
      "道友可知附近哪里有无主的洞府？在下想借宿几宿。",
      "若能筑基，我定要回乡让那些看不起我的人瞧瞧！",
      "修仙路难，散修更难，但我不会放弃。"
    ],
    "世家庶子": [
      "嫡兄昨日又克扣了我的修炼资源……呵，早晚有一天……",
      "家族荣耀？与我何干？我只想活下去。",
      "道友请自重，若被家族执法堂看到你我私交过密，恐惹麻烦。",
      "庶出之子，终究是外人。我早已看淡了。"
    ],
    "宗门天骄": [
      "师尊昨日赐下的法宝虽然珍贵，但我却觉得并不趁手。",
      "此次宗门大比，第一名非我莫属。",
      "你且退后，莫要挡了我吸收天地灵气的方位。",
      "天才的世界，凡人不懂。"
    ],
    "魔教护法": [
      "你身上的血气……闻起来很美味。",
      "正道那些伪君子，满口仁义道德，看着就作呕。",
      "怎么？怕我？放心，今日我心情好，不杀人。",
      "魔道修士，亦有情义。只是这世界不懂。"
    ],
    "凡间书生": [
      "子曰：逝者如斯夫……哎，这修仙口诀怎么比八股文还难背？",
      "姑娘……哦不，仙师，小生这厢有礼了。",
      "不知这仙界，可有科举？",
      "百无一用是书生，唉……"
    ],
    "剑修传人": [
      "剑者，杀伐之器也。我之剑，只为守护。",
      "天下剑法，唯快不破。",
      "剑道一途，需心无旁骛。",
      "我的剑，从不轻易出鞘。"
    ],
    "丹道奇才": [
      "这炉丹药的火候还差一分，可惜了。",
      "炼丹如人生，需要耐心和时机。",
      "你身上有伤？我这里正好有疗伤丹。",
      "药材难得，且用且珍惜。"
    ],
    "阵法大师": [
      "此地风水不佳，若布阵，当改之。",
      "阵法之道，讲究天时地利。",
      "你可知，一个好阵，胜过千军万马。",
      "我观此地灵脉走向，颇为奇特。"
    ],
    "符箓高手": [
      "这符纸材质不错，可惜朱砂品质差了些。",
      "符道一途，需心手合一。",
      "你若遇险，捏碎这符，我必至。",
      "天地符文，蕴含大道至理。"
    ],
    "佛修": [
      "阿弥陀佛，施主有何贵干？",
      "佛曰：不可说，不可说。",
      "贫僧观施主面相，近日恐有劫难。",
      "红尘万丈，唯我佛慈悲。"
    ],
    "血海魔君": [
      "鲜血的味道……让我沉醉。",
      "杀人，是我的修行之道。",
      "你很特别，让我不忍杀你。",
      "血海无边，我为君王。"
    ],
    "幻术高手": [
      "呵呵，你能分辨真假吗？",
      "幻术之道，真真假假，虚虚实实。",
      "你的心事，我已看透。",
      "凡人皆困于幻境，唯智者能破。"
    ],
    "炼尸宗徒": [
      "我的僵尸，可比活人听话多了。",
      "死亡，才是永恒。",
      "你怕尸体吗？别怕，它们很乖。",
      "人死如灯灭？不，他们可以重生。"
    ],
    "妖族半妖": [
      "人类的规矩，我不懂也不想懂。",
      "妖族血脉，让我天生异于常人。",
      "你身上没有那种讨厌的味道，不错。",
      "月圆之夜，我的妖力最强。"
    ],
    "古族遗民": [
      "上古之秘，非汝等所能知。",
      "我族血脉，流淌着远古的力量。",
      "这个时代，已经不属于我们了。",
      "你可知，上古时代的辉煌？"
    ],
    "器修天才": [
      "这把剑的材质不错，若让我重铸，必成神兵。",
      "炼器之道，需百炼成钢。",
      "我的锻锤，敲出过无数神兵。",
      "好器配好主，可惜世间难觅。"
    ],
    "医修圣手": [
      "你的脉象有些虚弱，需要调养。",
      "医者仁心，救人一命胜造七级浮屠。",
      "这伤虽重，但不致命，放心。",
      "药到病除，手到病除，这是我的自信。"
    ],
    "毒修鬼才": [
      "毒药和仙丹，往往只在一线之间。",
      "你可知，世间最美的花，往往最毒。",
      "我的毒，无色无味，防不胜防。",
      "百毒不侵？呵，那是因为没遇到我。"
    ],
    "音修琴者": [
      "琴音可杀人，亦可救人。",
      "我这一曲，可解你心中烦忧。",
      "知音难觅，若你懂我的琴声，便是知音。",
      "琴道一途，需心如止水。"
    ],
    "剑冢守墓人": [
      "这剑冢中，埋葬着千百柄神兵。",
      "我世代守护于此，只为等待有缘人。",
      "剑有灵，择主而从。",
      "你可知，每一柄剑，都有自己的故事。"
    ]
  };

  // --- C. 性格修饰 (如果没有匹配到身份，或者随机覆盖) ---
  if (Math.random() > 0.5 || !identityDialogs[identity]) {
    switch (trait) {
      case "高冷": return "……（他只是冷冷看了你一眼，没有说话）";
      case "温柔": return "今日风光甚好，能与道友在此闲谈，也是一种缘分。";
      case "傲娇": return "哼，既然你诚心诚意地问了，我就大发慈悲地陪你聊两句。";
      case "病娇": return "你的眼睛很漂亮……真想挖出来收藏呢，开玩笑的，别怕。";
      case "重利": return "闲聊？我不做无利可图之事。除非……你有内幕消息？";
      case "正直": return "修仙路漫漫，道友切不可懈怠，当勤勉修行。";
      default: return "道友今日气色不错。";
    }
  }

  // 返回身份对话
  const pool = identityDialogs[identity] || ["今天天气不错。"];
  return pool[Math.floor(Math.random() * pool.length)];
};


/**
 * 2. 赠礼反馈：根据礼物价值与NPC性格生成
 */
export const getGiftReaction = (npc, gift) => {
  // 兼容两种personality结构：对象(label属性)或数组(第一个元素)
  const trait = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");
  
  const isLike = npc.likes && npc.likes.includes(gift.name); // 是否命中喜好（需在数据中配合）

  // 基础好感加成
  let affectionChange = gift.value;
  let msg = "";

  // 佛修特殊规则：普通礼物大多不起作用，只有传法类/经典（例如名为“心经”的物品）会触动好感
  if (npc.identity === '佛修') {
    const isScripture = (gift.name && /心经|经卷|佛经|法本/i.test(gift.name)) || (gift.tags && gift.tags.includes('scripture'));
    if (!isScripture) {
      return { msg: `${npc.name} 双手合十，淡然道：“在下心无尘事，此物无益。”`, change: 0 };
    }
    // 对于佛修，经典类物品效果放大
    affectionChange = Math.floor(gift.value * 3);
    msg = `${npc.name} 低眉受法，闭目片刻后缓缓道：『阿弥陀佛，多谢道友。』`;
    return { msg, change: affectionChange };
  }

  // 这里的逻辑：如果礼物太便宜(value < 10)，高冷/傲娇的人会生气
  if (gift.value < 10) {
    if (["高冷", "宗门天骄", "傲娇"].includes(trait) || ["宗门天骄"].includes(npc.identity)) {
      return { msg: `${npc.name} 瞥了一眼${gift.name}，面露讥讽：“拿这种垃圾来羞辱我？”`, change: -5 };
    }
  }

  // 命中喜好
  if (isLike) {
    affectionChange *= 2;
    msg = `${npc.name} 眼前一亮，难得露出了笑容：“这${gift.name}正是我苦寻已久的！多谢！”`;
  }
  // 重利性格对贵重礼物加成
  else if (trait === "重利" && gift.cost >= 300) {
    affectionChange *= 1.5;
    msg = `${npc.name} 掂了掂${gift.name}的分量，态度立刻变得热情：“道友果然大方！这朋友我交定了！”`;
  }
  // 通用反馈
  else {
    switch (trait) {
      case "高冷": msg = `${npc.name} 默默收下礼物，淡淡道：“有心了。”`; break;
      case "温柔": msg = `${npc.name} 接过礼物，耳根微红：“这……怎么好意思让道友破费。”`; break;
      case "傲娇": msg = `${npc.name} 扭过头：“哼，别以为送我这个我就会高兴……不过既然你硬要送，我就勉强收下吧。”`; break;
      default: msg = `${npc.name} 收下了${gift.name}，并向你道谢。`;
    }
  }

  return { msg, change: Math.floor(affectionChange) };
};


/**
 * 3. 劝生反馈：根据策略与性格的碰撞
 */
export const getPersuadeText = (npc, strategy, success) => {
  // 兼容两种personality结构：对象(label属性)或数组(第一个元素)
  const trait = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");

  if (success) {
    // 成功文案
    if (strategy.id === "PROFIT") { // 诱之以利
      return `${npc.name} 看着你列出的资源清单，呼吸急促。最终他咬牙道："人为财死……若能助我筑基，为你孕育子嗣又何妨！虽为男儿之身，但修真界自有秘法，我愿意。"`;
    }
    if (strategy.id === "EMOTION") { // 动之以情
      if (trait === "高冷") return `${npc.name} 冰封的心似乎裂开了一道缝隙，他低下头，声音沙哑："从未有人如此待我……为你孕育血脉，便是我的回应。虽为男子，但修真之人，何惧世俗之见？"`;
      return `${npc.name} 眼眶微红，紧紧握住你的手："愿得一人心，白首不相离。修真界虽罕见男子孕育，但为了你，为了我们的未来，我愿意承受这份特殊的使命。"`;
    }
    if (strategy.id === "REASON") { // 晓之以理
      return `${npc.name} 沉思良久，点头道："道友所言极是。阴阳调和乃天道至理，传承血脉亦是修行的一环。虽男子孕育罕见，但上古典籍早有记载，我愿为你一试。"`;
    }
  } else {
    // 失败文案
    if (trait === "高冷") return `${npc.name} 眼神如刀：“吾辈修士，当斩断尘缘，一心向道。道友请自重！”`;
    if (trait === "重利" && strategy.id === "EMOTION") return `${npc.name} 不耐烦地打断你：“感情能当灵石花吗？别跟我谈这些虚的。”`;
    if (trait === "傲娇") return `${npc.name} 满脸通红地跳起来："谁、谁要为你怀孕啊！不知羞耻！"`;
    if (strategy.id === "PROFIT") return `${npc.name} 感到受到了侮辱：“你把我当成什么人了？勾栏里的男宠吗？”`;
    
    return `${npc.name} 婉拒了你的请求："此事关系重大，让我……再考虑考虑。"`;
  }
  
  return success ? "他同意了。" : "他拒绝了。";
};


/**
 * 为佛修赠送经典时生成的专属事件
 * 返回 { text, options: [{ label, msg, change }] }
 */
export const createMonkScriptureEvent = (npc, gift) => {
  const title = `${npc.name} 接受经书`; // not currently used by modal content but helpful
  const baseText = `你将「${gift.name}」恭敬呈于 ${npc.name} 之前。对方闭目片刻，略微颔首，似乎在衡量你的诚意。你可以选择如何行事：`;

  const options = [
    {
      label: '恭敬供奉法本（献礼）',
      msg: `${npc.name} 双手合十，缓缓念诵佛号，对你露出慈悲的目光。`,
      change: { trust: 30, affection: 10 },
      result: 'good'
    },
    {
      label: '请其传法一炷香（请教）',
      msg: `${npc.name} 见你诚心，点头示意，传授了些片段口诀，虽寥寥数语却令你茅塞顿开。`,
      change: { trust: 15, affection: 5 },
      result: 'good'
    },
    {
      label: '婉言说明并退还（谨慎）',
      msg: `${npc.name} 微微一笑，接过后却似乎并未动容，轻声道：『若心不诚，法亦难入。』你将礼物收回。`,
      change: { trust: -5, affection: 0 },
      result: 'neutral'
    }
  ];

  return { text: baseText, options };
};


// ============================================
// 【红尘羁绊·伴侣篇】浪漫剧情库
// ============================================

/**
 * 高冷/禁欲型 - 克制后的失控，冰山下的暗火
 */
const coldTypeRomance = [
  {
    title: "疗伤",
    text: (name) => `${name}眉头紧锁，微凉的指尖沾着药膏，轻轻划过你背后的伤口。当你因刺痛而轻颤时，${name}动作一顿，声音比平日暗哑了几分："忍着点……别乱动，否则我不敢保证还能止乎礼。"`,
    affectionBonus: 5
  },
  {
    title: "传道",
    text: (name) => `${name}站在你身后指导剑式，气息将你完全笼罩。为了纠正你的姿势，${name}的胸膛几乎贴上你的后背，温热的呼吸喷洒在你耳侧："心不静，剑便不稳。你在想什么？……还是在想我？"`,
    affectionBonus: 5
  },
  {
    title: "醉酒",
    text: (name) => `向来清醒克制的${name}，此刻眼尾泛红，将头埋在你的颈窝处，温热的唇瓣若即若离地擦过你的锁骨。${name}呢喃着，像是在压抑着什么："大道无情，可你……是我的劫。"`,
    affectionBonus: 8
  },
  {
    title: "深夜独处",
    text: (name) => `月光透过窗棂洒落，${name}坐在榻边凝视着你，眸光复杂。半晌，${name}低声道："若我心中还有一丝柔软，那便是因为你。可这份柔软……终会成为我的破绽。"`,
    affectionBonus: 6
  },
  {
    title: "共渡心魔",
    text: (name) => `${name}走火入魔，识海中杀意翻涌。是你的声音将${name}拉回，${name}睁开眼，第一次露出脆弱的神色："若有一日我真的失控……动手杀了我。但在此之前，让我……再多看你一眼。"`,
    affectionBonus: 10
  },
  {
    title: "孕育决心",
    text: (name) => `${name}抚摸着自己尚且平坦的腹部，眼神复杂："从未想过以男儿之身孕育生命...但既已答应了你，我便不会退缩。只是...若宗门中人知晓，恐怕会笑话我吧。"你握住他的手，${name}抬眸看你，眼中是前所未有的温柔："但能为你，值得。"`,
    affectionBonus: 12,
    requirePregnant: true
  },
  {
    title: "孕中坚持",
    text: (name) => `${name}强撑着修炼，腹部的隆起让他的动作显得有些笨拙。汗水滑落额角，${name}固执地不肯停下："区区怀胎之苦...岂能让我倒下。我说过要陪你登临大道，这点考验算什么。"见你心疼地上前扶住他，${name}罕见地靠在你肩上："...有你在，我不累。"`,
    affectionBonus: 13,
    requirePregnant: true
  }
];

/**
 * 病娇/占有型 - 危险的试探，强烈的排他性
 */
const yandereTypeRomance = [
  {
    title: "吃醋",
    text: (name) => `见你与旁人谈笑，${name}嘴角的笑意未减，眼底却是一片寒潭。${name}猛地扣住你的手腕，将你拉入怀中，手指摩挲着你的后颈，力道带着一丝惩罚意味："还要看他多久？是不是只有把你藏起来，你的眼里才会有我？"`,
    affectionBonus: 6
  },
  {
    title: "对视",
    text: (name) => `${name}凑得很近，近到你能看清${name}瞳孔中倒映的自己。${name}伸出舌尖轻轻舔过嘴角，目光像是在审视猎物，声音低沉而危险："真想把你的心剖出来看看，上面到底有没有刻着我的名字。"`,
    affectionBonus: 7
  },
  {
    title: "索取",
    text: (name) => `"修仙路漫漫，若是累了……"${name}缠绕着你的一缕青丝，在指尖把玩，随即放到唇边轻吻，"不如随我入魔？我会为你打造一座金笼，让你日日夜夜，只属于我一人。"`,
    affectionBonus: 8
  },
  {
    title: "标记",
    text: (name) => `${name}突然咬住你的耳垂，力道不重却足够留下痕迹。${name}满意地看着那抹嫣红，舔了舔唇："这样，其他人就知道你是我的了。"`,
    affectionBonus: 7
  },
  {
    title: "囚禁威胁",
    text: (name) => `${name}将你逼在墙角，双手撑在你两侧，气息灼热："你想去哪里？离开我？"${name}的笑容有些扭曲，"若你敢走……我就打断你的腿，这样你就只能永远留在我身边了。"`,
    affectionBonus: 5
  },
  {
    title: "病态依恋",
    text: (name) => `${name}抚摸着已经显怀的腹部，眼神迷离而危险："这个孩子...是我和你的羁绊，是把你永远绑在我身边的证明。现在你跑不掉了吧？你永远...都是我的。"语气中透着病态的占有欲，却又带着脆弱的不安。`,
    affectionBonus: 10,
    requirePregnant: true
  },
  {
    title: "孕中执念",
    text: (name) => `${name}盯着镜中隆起的腹部，自嘲地笑了："堂堂男儿，竟为人怀胎...要是被那些仇家知道了，定会笑掉大牙。"但转瞬间，${name}眼神变得疯狂而坚定："可这是你我的孩子。谁敢嘲笑...我就杀了谁全家。"`,
    affectionBonus: 11,
    requirePregnant: true
  }
];

/**
 * 温润/忠犬型 - 无微不至的呵护
 */
const gentleTypeRomance = [
  {
    title: "晨起",
    text: (name) => `晨光微熹，你刚睁眼，便对上${name}温柔的视线。${name}似乎看了你许久，见你醒来，耳根微红，替你理了理凌乱的鬓发："昨夜风大，怕你着凉，便守了一夜。……若是累，便再睡会儿。"`,
    affectionBonus: 6
  },
  {
    title: "赠礼",
    text: (name) => `${name}从怀中小心翼翼地取出一支并不名贵但打磨得极其光滑的木簪，有些局促地放入你手心："我见这块雷击木纹理极好，便想着刻来送你。虽不及那些法宝贵重，但……它能辟邪，我想护你平安。"`,
    affectionBonus: 7
  },
  {
    title: "承诺",
    text: (name) => `${name}握住你的手，掌心温暖干燥，坚定有力。"无论你想登临大道，还是归隐田园，我都会是你手中的剑，身前的盾。你只管往前走，别回头，我一直在。"`,
    affectionBonus: 8
  },
  {
    title: "披衣",
    text: (name) => `夜风渐凉，你正凝神观星，一件温暖的外袍悄然披在肩上。${name}站在你身后，声音轻柔："夜深露重，小心着凉。我在这里陪你，想看多久都可以。"`,
    affectionBonus: 5
  },
  {
    title: "受伤代价",
    text: (name) => `看到你受伤，向来温和的${name}眼中闪过一丝戾气。${name}轻柔地为你包扎伤口，却冷冷道："伤你的人，我已记下。你安心养伤，其余的……交给我。"`,
    affectionBonus: 9
  },
  {
    title: "孕育守护",
    text: (name) => `${name}轻轻抚摸着微微隆起的腹部，眼神温柔得能滴出水来。感受到你关切的目光，他柔声道："别担心...虽然男子怀胎世所罕见，但能孕育我们的孩子，是我的荣幸。你的守护让我安心，有你在，我什么都不怕。"`,
    affectionBonus: 12,
    requirePregnant: true
  },
  {
    title: "胎动安抚",
    text: (name) => `深夜，${name}忽然握住你的手，轻轻放在他腹部："孩子在动...感觉到了吗？"你惊喜地感受到那微弱的律动，${name}眼中闪过一丝泪光："我每天都在想，这个小生命会长成什么样子。一定很像你吧...温柔、善良，让人想要用生命去守护。"`,
    affectionBonus: 14,
    requirePregnant: true
  }
];

/**
 * 风流/魅惑型 - 言语挑逗，若即若离
 */
const flirtyTypeRomance = [
  {
    title: "调笑",
    text: (name) => `${name}慵懒地倚在榻上，衣襟半敞，露出一大片精壮的胸膛。见你进来，${name}勾唇一笑，眼波流转："道友深夜造访，可是长夜漫漫，无心睡眠？刚好，在下修习了一门双修妙法，正缺一位道侣验证一番。"`,
    affectionBonus: 6
  },
  {
    title: "共浴",
    text: (name) => `水雾缭绕间，一双手臂从水中揽住了你的腰。${name}贴着你的耳朵吹气，笑声低沉震动着胸腔："水温正好，道友何不下来共浴？放心，我什么都不做……除非，你想。"`,
    affectionBonus: 7
  },
  {
    title: "品酒",
    text: (name) => `${name}斜倚在你身旁，举起酒杯凑到你唇边："这灵酿须得美人唇温方能激发酒香，道友可愿助我一尝？"话音未落，${name}已经将酒杯贴上你的嘴唇。`,
    affectionBonus: 6
  },
  {
    title: "抚琴",
    text: (name) => `${name}拨动琴弦，琴音暧昧撩人。${name}抬眸看你，笑意盈盈："这曲《销魂引》，须得心中有人方能奏出神韵。你说……我心里想的是谁？"`,
    affectionBonus: 5
  },
  {
    title: "夜访",
    text: (name) => `${name}翻窗而入，落地无声。见你惊讶，${name}笑着解开披风："正门太慢，我想你了。怎么，不欢迎？那我……现在就走？"说着作势要离开，眼中却满是戏谑。`,
    affectionBonus: 8  },
  {
    title: "孕中魅惑",
    text: (name) => `${name}手抚着已显怀的腹部，媚眼如丝地看着你："都说男子怀胎千难万难，可我却甘之如饴...每当感受到胎动，就想起那晚的温存。你说，这孩子会不会像我一样...懂得如何让你心动？"说罢轻笑一声，那风情万种的模样让人移不开眼。`,
    affectionBonus: 13,
    requirePregnant: true
  },
  {
    title: "孕中撒娇",
    text: (name) => `${name}侧卧在榻上，一手托腮，一手轻抚隆起的腹部，慵懒地对你说："这身子越来越重了，连起身都费劲...道友不来扶我一把吗？"见你走近，他突然拉住你的手贴在腹部："感受到了吗？小家伙也在想你呢。啧，为了你们父子，我可是豁出去了这副身段..."眼波流转间，竟有几分真情流露。`,
    affectionBonus: 12,
    requirePregnant: true  }
];


// ============================================
// 【血脉温情·子女篇】亲情剧情库
// ============================================

/**
 * 幼年期 (0-10岁) - 依赖、童言无忌
 */
const childToddlerEvents = [
  {
    title: "分享",
    text: (name, gender) => `小小的${name}满身泥土地跑回来，献宝似的摊开脏兮兮的小手，掌心里躺着一颗被捏得有些变形的灵果："${gender === '女' ? '娘亲' : '爹爹'}吃！这是我在后山找到的最甜的一颗，我不吃，都给${gender === '女' ? '娘亲' : '爹爹'}！"`,
    affectionBonus: 8
  },
  {
    title: "噩梦",
    text: (name, gender) => `深夜，一个小小的身影抱着枕头钻进你的被窝，瑟瑟发抖地缩在你怀里。${name}带着哭腔说："${gender === '女' ? '娘亲' : '爹爹'}，我梦见大怪兽把你抓走了……我要快点长大，长大了就能打跑怪兽保护${gender === '女' ? '娘亲' : '爹爹'}了。"`,
    affectionBonus: 10
  },
  {
    title: "模仿",
    text: (name, gender) => `你发现${name}正拿着一根树枝，像模像样地模仿你练剑的姿势，小脸绷得紧紧的。看到你来，${name}羞红了脸："我……我想变得像${gender === '女' ? '娘亲' : '爹爹'}一样厉害！"`,
    affectionBonus: 7
  },
  {
    title: "撒娇",
    text: (name, gender) => `${name}拉着你的衣角，仰起小脸用软糯的声音说："${gender === '女' ? '娘亲' : '爹爹'}，我今天很乖的，你可不可以讲个故事给我听？就讲你小时候斩妖除魔的故事！"`,
    affectionBonus: 6
  },
  {
    title: "第一次御剑",
    text: (name, gender) => `${name}第一次成功御起小木剑，激动得手舞足蹈，差点从半空摔下来。${name}稳住身形后，第一时间转头寻找你的身影："${gender === '女' ? '娘亲' : '爹爹'}，你看到了吗！我飞起来了！"`,
    affectionBonus: 9
  }
];

/**
 * 少年期 (11-18岁) - 叛逆、努力、证明自己
 */
const childTeenEvents = [
  {
    title: "受伤",
    text: (name, gender) => `${name}捂着流血的手臂回来，却在进门前拼命擦掉血迹，整理衣衫。面对你的询问，${name}故作轻松地把手藏在身后："没事，就是切磋时不小心……${gender === '女' ? '娘亲' : '爹爹'}别担心，我没输！我没给家族丢脸！"`,
    affectionBonus: 8
  },
  {
    title: "心事",
    text: (name, gender) => `总是叽叽喳喳的${name}最近变得沉默寡言，经常对着月亮发呆。当你走近时，${name}欲言又止，最后红着脸问："${gender === '女' ? '娘亲' : '爹爹'}……当初您和${gender === '女' ? '父亲' : '母亲'}，是怎么认识的呀？"`,
    affectionBonus: 6
  },
  {
    title: "远行",
    text: (name, gender) => `临行前，${name}背着行囊在门口跪下，重重地磕了三个响头。起身时，眼圈通红却目光坚定："孩儿此去宗门，定当勤勉修炼。待孩儿筑基归来，定要让修仙界都知道，我是您的孩子！"`,
    affectionBonus: 10
  },
  {
    title: "叛逆期",
    text: (name, gender) => `${name}固执地抬起头："${gender === '女' ? '娘亲' : '爹爹'}，我已经不是小孩子了！我有自己的想法！"话虽如此，${name}转身离开时，眼角却闪过一丝委屈和不舍。`,
    affectionBonus: 4
  },
  {
    title: "突破瓶颈",
    text: (name, gender) => `${name}闭关七天七夜，终于突破境界。出关后的第一件事，就是冲到你面前，虽然努力装出平静的样子，但眼中的兴奋藏都藏不住："${gender === '女' ? '娘亲' : '爹爹'}，我做到了！"`,
    affectionBonus: 9
  }
];

/**
 * 成年期 (18岁+) - 反哺、责任、孝心
 */
const childAdultEvents = [
  {
    title: "归家",
    text: (name, gender) => `已是金丹真人的${name}，在修仙界威名赫赫。可一回到你面前，${name}卸下所有防备，像小时候一样把头靠在你膝盖上："外面的修士都怕我敬我，只有在${gender === '女' ? '娘亲' : '爹爹'}这里，我才觉得是个有家的人。"`,
    affectionBonus: 10
  },
  {
    title: "护短",
    text: (name, gender) => `听闻有人在拍卖会上对你不敬，平时温文尔雅的${name}当场暴怒，直接祭出本命法宝震慑全场："家${gender === '女' ? '母' : '父'}喜静，不愿与尔等计较。但谁若敢对家${gender === '女' ? '母' : '父'}不敬，先问问我手中的剑答不答应！"`,
    affectionBonus: 12
  },
  {
    title: "寿礼",
    text: (name, gender) => `在你生辰之日，${name}风尘仆仆地赶回，拿出一株在这个界域几乎绝迹的延寿仙草。旁人不知${name}为此闯了多少秘境，受了多少伤，${name}只是轻描淡写地笑着："只要${gender === '女' ? '娘亲' : '爹爹'}能长生久视，这点小伤算什么。"`,
    affectionBonus: 15
  },
  {
    title: "传承",
    text: (name, gender) => `${name}将自己这些年的修炼心得整理成册，恭敬地呈给你："孩儿不才，这些是我在外闯荡所得。${gender === '女' ? '娘亲' : '爹爹'}当年教我修行，如今孩儿也想为您的修为尽一份力。"`,
    affectionBonus: 11
  },
  {
    title: "陪伴",
    text: (name, gender) => `${name}推掉了宗门的重要会议，只为陪你在后山喝茶观云。"${gender === '女' ? '娘亲' : '爹爹'}，孩儿这些年为了修炼，陪您的时间太少了。从今往后，无论多忙，我每月都会回来陪您。"`,
    affectionBonus: 10
  }
];


// ============================================
// 随机获取事件的辅助函数
// ============================================

/**
 * 根据性格类型获取浪漫事件
 */
const getRandomRomanceEvent = (type, npc) => {
  let pool = gentleTypeRomance; // 默认温柔型
  
  switch (type) {
    case 'COLD':
      pool = coldTypeRomance;
      break;
    case 'YANDERE':
      pool = yandereTypeRomance;
      break;
    case 'GENTLE':
      pool = gentleTypeRomance;
      break;
    case 'FLIRTY':
      pool = flirtyTypeRomance;
      break;
  }
  
  // 过滤掉需要怀孕状态但NPC未怀孕的剧情
  const availableEvents = pool.filter(event => {
    // 如果剧情要求怀孕状态，但NPC未怀孕，则过滤掉
    if (event.requirePregnant && !npc.isPregnant) {
      return false;
    }
    return true;
  });
  
  // 如果过滤后没有可用剧情，返回null（将触发普通闲聊）
  if (availableEvents.length === 0) {
    return null;
  }
  
  const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  return {
    title: event.title,
    text: event.text(npc.name),
    affectionBonus: event.affectionBonus
  };
};

/**
 * 根据年龄段获取子女事件
 */
const getRandomChildEvent = (ageGroup, npc, playerGender = '女') => {
  let pool = childToddlerEvents; // 默认幼年
  
  switch (ageGroup) {
    case 'TODDLER':
      pool = childToddlerEvents;
      break;
    case 'TEEN':
      pool = childTeenEvents;
      break;
    case 'ADULT':
      pool = childAdultEvents;
      break;
  }
  
  const event = pool[Math.floor(Math.random() * pool.length)];
  return {
    title: event.title,
    text: event.text(npc.name, playerGender),
    affectionBonus: event.affectionBonus
  };
};

/**
 * 主函数：获取随机互动事件
 * 根据 NPC 类型（子女/伴侣）和属性返回对应剧情
 */
export const getRandomInteractionEvent = (npc, player) => {
  // 1. 判断是否是子女
  if (npc.isChild) {
    let ageGroup = 'TODDLER';
    if (npc.age >= 18) {
      ageGroup = 'ADULT';
    } else if (npc.age >= 11) {
      ageGroup = 'TEEN';
    }
    return getRandomChildEvent(ageGroup, npc, player?.gender || '女');
  }

  // 2. 判断是否是伴侣/攻略对象（需要好感度达到一定阈值）
  if (npc.relationship?.affection >= 60) {
    // 获取性格标签
    const trait = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
      ? npc.personality.label 
      : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");

    // 根据性格匹配剧情类型
    let romanceType = 'GENTLE'; // 默认温柔型
    
    if (['高冷', '清冷', '禁欲', '冷淡'].includes(trait)) {
      romanceType = 'COLD';
    } else if (['病娇', '偏执', '疯批', '执念'].includes(trait)) {
      romanceType = 'YANDERE';
    } else if (['风流', '魅惑', '浪荡', '妖媚'].includes(trait)) {
      romanceType = 'FLIRTY';
    } else if (['温柔', '温润', '忠犬', '深情', '坚韧'].includes(trait)) {
      romanceType = 'GENTLE';
    }
    
    return getRandomRomanceEvent(romanceType, npc);
  }

  // 3. 兜底：返回普通互动
  return {
    title: "日常相处",
    text: `你与${npc.name}闲聊了一会儿，气氛融洽。`,
    affectionBonus: 2
  };
};


// ============================================
// 【身份专属剧情库】
// ============================================

/**
 * 剑修传人专属剧情
 */
const swordCultivatorEvents = [
  {
    title: "论剑",
    text: (name) => `${name}手按剑柄，眼神锐利如剑："你的剑意还不够凝练。来，与我过过招，我指点你一二。"一番切磋下来，你对剑道的理解更深了一层。`,
    affectionBonus: 5
  },
  {
    title: "赠剑",
    text: (name) => `${name}从怀中取出一柄三寸小剑，放入你掌心："这是我早年用的练剑，虽不及神兵，但也算趁手。你拿去防身吧。"`,
    affectionBonus: 7
  },
  {
    title: "剑心共鸣",
    text: (name) => `${name}盘坐于剑冢之前，感悟剑意。你静静陪在身旁，忽然间，你感觉到一股凌厉的剑意从${name}身上迸发，与你的心神产生共鸣。${name}睁眼，眼中闪过一丝惊讶："你的剑心……竟能与我共鸣？"`,
    affectionBonus: 10
  }
];

/**
 * 丹道奇才专属剧情
 */
const alchemistEvents = [
  {
    title: "炼丹失败",
    text: (name) => `${name}从丹房中走出，满身焦黑，显然是炸炉了。看到你，${name}苦笑："这炉丹药废了……唉，不过失败乃成功之母。你要不要尝尝这颗半成品？"`,
    affectionBonus: 4
  },
  {
    title: "赠丹",
    text: (name) => `${name}递给你一个精致的玉瓶："这是我新炼的破境丹，虽不敢说完美，但成色极佳。你拿去，突破时服用。"`,
    affectionBonus: 8
  },
  {
    title: "采药之行",
    text: (name) => `${name}邀你同去后山采药。一路上，${name}如数家珍地为你讲解各种灵草的药性。夕阳西下，你们坐在山头，${name}忽然说："能有人陪我采药，真好。"`,
    affectionBonus: 9
  }
];

/**
 * 魔教护法专属剧情
 */
const demonCultEvents = [
  {
    title: "魔功反噬",
    text: (name) => `${name}修炼魔功，气息紊乱，险些走火入魔。是你及时出现，以灵力帮${name}稳住心神。${name}苏醒后，眼神复杂："你……为何要救我？不怕被正道追杀？"`,
    affectionBonus: 10
  },
  {
    title: "血契",
    text: (name) => `${name}划破手指，鲜血滴落，在虚空中凝成一个诡异的符文："这是血契，从今往后，我们生死相连。你后悔吗？"`,
    affectionBonus: 12
  },
  {
    title: "月下魔音",
    text: (name) => `月黑风高，${name}独自站在悬崖边，吹奏一曲魔音。曲调诡异却又哀婉，仿佛在诉说着什么。你走近，${name}停下，淡淡道："这曲子……只吹给你一人听。"`,
    affectionBonus: 8
  }
];

/**
 * 佛修专属剧情
 */
const buddhistMonkEvents = [
  {
    title: "传经",
    text: (name) => `${name}于菩提树下诵经，声音空灵悠远。你听着听着，心中杂念尽去，仿佛得到洗涤。${name}诵毕，微笑道："施主慧根不浅，可愿听贫僧讲解经义？"`,
    affectionBonus: 6
  },
  {
    title: "破戒边缘",
    text: (name) => `${name}看着你，眼神第一次出现波动："你……让贫僧动了凡心。这是破戒之念，本该斩断。可是……"${name}闭上眼，深吸一口气，"贫僧做不到。"`,
    affectionBonus: 15
  },
  {
    title: "舍利相赠",
    text: (name) => `${name}从怀中取出一颗散发柔光的舍利子："这是贫僧师尊圆寂时留下的，能保你平安。你且收下。"`,
    affectionBonus: 10
  }
];

/**
 * 妖族半妖专属剧情
 */
const halfDemonEvents = [
  {
    title: "兽性爆发",
    text: (name) => `${name}受伤，妖力失控，兽瞳闪烁，利爪探出。你没有退缩，反而上前抱住${name}。片刻后，${name}恢复人形，喘着粗气："你……不怕我失控伤了你？"`,
    affectionBonus: 10
  },
  {
    title: "化形之难",
    text: (name) => `${name}因妖力不稳，耳朵和尾巴显露出来。见你看着，${name}有些窘迫地想要藏起来。你伸手轻轻抚摸${name}的耳朵，${name}浑身一颤："别……别摸那里……"`,
    affectionBonus: 8
  },
  {
    title: "妖丹相护",
    text: (name) => `${name}从口中吐出内丹，递给你："这是我的妖丹，若遇危险，捏碎它，我必会感应到。"这意味着${name}将性命托付于你。`,
    affectionBonus: 15
  }
];

/**
 * 医修圣手专属剧情
 */
const healerEvents = [
  {
    title: "诊脉",
    text: (name) => `${name}握住你的手腕诊脉，指尖温热。片刻后，${name}微蹙眉："你最近劳累过度，需要好好休息。我给你开副方子，记得按时服药。"`,
    affectionBonus: 5
  },
  {
    title: "救人",
    text: (name) => `你陪${name}出诊，见到一个奄奄一息的孩童。${name}施针用药，忙碌了一整夜。当孩童转危为安，${name}疲惫地靠在你肩上："能救活一个人，就值得。"`,
    affectionBonus: 9
  },
  {
    title: "温泉疗养",
    text: (name) => `${name}带你去秘境温泉疗伤。水雾氤氲中，${name}为你按摩穴位，指尖传来温热："这里的灵泉能加速伤势愈合，你多泡一会儿。"`,
    affectionBonus: 11
  }
];

/**
 * 音修琴者专属剧情
 */
const musicianEvents = [
  {
    title: "抚琴",
    text: (name) => `${name}抚琴一曲，琴音如泣如诉。曲终，${name}看向你："这首《凤求凰》，是为你而奏。"`,
    affectionBonus: 12
  },
  {
    title: "琴心共鸣",
    text: (name) => `${name}教你弹琴，手把手纠正你的指法。当你们的琴音合奏，竟产生了奇妙的共鸣。${name}惊讶道："我们的琴心……竟能相通？"`,
    affectionBonus: 10
  },
  {
    title: "琴弦断裂",
    text: (name) => `${name}为你奏曲，忽然琴弦崩断，划破了${name}的指尖。你慌忙为${name}包扎，${name}却笑着说："琴弦断了，是因为情动心弦。"`,
    affectionBonus: 8
  }
];

/**
 * 获取身份专属事件
 */
const getIdentityEvent = (identity, npc) => {
  let pool = [];
  
  switch (identity) {
    case '剑修传人':
      pool = swordCultivatorEvents;
      break;
    case '丹道奇才':
      pool = alchemistEvents;
      break;
    case '魔教护法':
    case '血海魔君':
      pool = demonCultEvents;
      break;
    case '佛修':
      pool = buddhistMonkEvents;
      break;
    case '妖族半妖':
      pool = halfDemonEvents;
      break;
    case '医修圣手':
      pool = healerEvents;
      break;
    case '音修琴者':
      pool = musicianEvents;
      break;
    default:
      return null;
  }
  
  if (pool.length === 0) return null;
  
  const event = pool[Math.floor(Math.random() * pool.length)];
  return {
    title: event.title,
    text: event.text(npc.name),
    affectionBonus: event.affectionBonus
  };
};

/**
 * 统一的剧情触发函数（整合所有类型的剧情）
 * 概率分配：大概率普通闲聊（70%），小概率专属事件（30%）
 * 
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @returns {Object|null} - 剧情事件对象或null（返回null时使用普通闲聊）
 */
export const getUnifiedInteractionEvent = (npc, player) => {
  // 1. 子女剧情（子女有25%概率触发专属剧情，75%普通闲聊）
  if (npc.isChild) {
    if (Math.random() < 0.25) {
      let ageGroup = 'TODDLER';
      if (npc.age >= 18) {
        ageGroup = 'ADULT';
      } else if (npc.age >= 11) {
        ageGroup = 'TEEN';
      }
      return getRandomChildEvent(ageGroup, npc, player?.gender || '女');
    }
    return null; // 75%概率返回null，触发普通闲聊
  }

  // 总体专属事件触发率：30%
  const eventRoll = Math.random();
  
  if (eventRoll >= 0.3) {
    // 70%概率：直接返回null，触发普通闲聊
    return null;
  }

  // 进入30%的专属事件区间，根据条件分配不同类型的事件
  const affection = npc.relationship?.affection || 0;
  
  // 获取性格标签
  const trait = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
    ? npc.personality.label 
    : (Array.isArray(npc.personality) ? npc.personality[0] : "普通");

  // 2. 高好感度（80+）：优先触发浪漫剧情（70%浪漫，30%身份专属）
  if (affection >= 80) {
    if (Math.random() < 0.7) {
      let romanceType = 'GENTLE';
      
      if (['高冷', '清冷', '禁欲', '冷淡'].includes(trait)) {
        romanceType = 'COLD';
      } else if (['病娇', '偏执', '疯批', '执念'].includes(trait)) {
        romanceType = 'YANDERE';
      } else if (['风流', '魅惑', '浪荡', '妖媚'].includes(trait)) {
        romanceType = 'FLIRTY';
      } else if (['温柔', '温润', '忠犬', '深情', '坚韧'].includes(trait)) {
        romanceType = 'GENTLE';
      }
      
      return getRandomRomanceEvent(romanceType, npc);
    }
    // 30%尝试身份专属
    const identityEvent = getIdentityEvent(npc.identity, npc);
    if (identityEvent) return identityEvent;
    // 如果没有身份专属，返回null触发普通闲聊
    return null;
  }

  // 3. 中等好感度（60-79）：浪漫和身份专属各半
  if (affection >= 60) {
    if (Math.random() < 0.5) {
      let romanceType = 'GENTLE';
      
      if (['高冷', '清冷', '禁欲', '冷淡'].includes(trait)) {
        romanceType = 'COLD';
      } else if (['病娇', '偏执', '疯批', '执念'].includes(trait)) {
        romanceType = 'YANDERE';
      } else if (['风流', '魅惑', '浪荡', '妖媚'].includes(trait)) {
        romanceType = 'FLIRTY';
      } else if (['温柔', '温润', '忠犬', '深情', '坚韧'].includes(trait)) {
        romanceType = 'GENTLE';
      }
      
      return getRandomRomanceEvent(romanceType, npc);
    }
    // 50%尝试身份专属
    const identityEvent = getIdentityEvent(npc.identity, npc);
    if (identityEvent) return identityEvent;
    return null;
  }

  // 4. 低好感度（<60）：主要触发身份专属剧情
  const identityEvent = getIdentityEvent(npc.identity, npc);
  if (identityEvent) {
    return identityEvent;
  }

  // 5. 如果没有身份专属剧情，返回null触发普通闲聊
  return null;
};