// src/data/eventLibrary.js

export const eventLibrary = [
  // --- 阶段0：初识 (好感 < 20) ---
  // 普通性格
  {
    id: "meet_normal_1",
    stage: 0,
    text: "{name} 正独自在湖边修炼，感受到你的气息后睁开眼睛，礼貌地点头示意。",
    options: [
      { label: "上前自我介绍", result: "neutral", msg: "你们简单交谈了几句，他对你留下了不错的印象。(好感+5)", change: { affection: 5 } },
      { label: "默默离开", result: "neutral", msg: "你不想打扰他修炼，悄悄离开了。", change: {} }
    ]
  },
  {
    id: "meet_normal_2",
    stage: 0,
    text: "{name} 在坊市中挑选灵草，似乎对某株草药犹豫不决。",
    options: [
      {
        label: "主动上前推荐合适的草药",
        check: (player) => player.stats.intelligence > 60,
        success: { msg: "你的建议让他很满意，他对你刮目相看。(好感+8)", change: { affection: 8 } },
        fail: { msg: "你的推荐似乎不太合适，他礼貌地拒绝了。(好感+2)", change: { affection: 2 } }
      },
      { label: "冷眼旁观", result: "neutral", msg: "你没有打扰他的选择。", change: {} }
    ]
  },
  {
    id: "meet_normal_3",
    stage: 0,
    text: "{name} 被几个地痞修士纠缠，似乎在争执什么。",
    options: [
      {
        label: "仗义出手相助",
        check: (player) => player.combatStats.atk > 50,
        success: { msg: "你轻松击退了地痞，他对你感激不尽。(好感+10)", change: { affection: 10 } },
        fail: { msg: "你虽然尽力了，但还是被地痞嘲笑了一番。(好感+3)", change: { affection: 3 } }
      },
      { label: "假装没看见", result: "neutral", msg: "你不想惹麻烦，悄悄离开了。", change: {} }
    ]
  },
  {
    id: "meet_normal_4",
    stage: 0,
    text: "{name} 正在酒楼中独自饮酒，眼神中透露出一丝孤寂。",
    options: [
      { label: "过去陪他喝一杯", result: "neutral", msg: "你们一起喝了几杯，聊了些修炼心得。(好感+6)", change: { affection: 6 } },
      { label: "独自用餐", result: "neutral", msg: "你选择了另一张桌子用餐。", change: {} }
    ]
  },
  {
    id: "meet_normal_5",
    stage: 0,
    text: "{name} 丢失了重要的修炼功法，正在焦急地寻找。",
    options: [
      { label: "帮忙一起寻找", result: "neutral", msg: "你们一起找到了功法，他对你十分感谢。(好感+7)", change: { affection: 7 } },
      { label: "擦肩而过", result: "neutral", msg: "你没有注意到他的焦急。", change: {} }
    ]
  },
  {
    id: "meet_normal_6",
    stage: 0,
    text: "{name} 正在向路人打听某个地方，看起来是第一次来这里。",
    options: [
      { label: "主动为他指路", result: "neutral", msg: "你的指引很详细，他顺利找到了目的地。(好感+4)", change: { affection: 4 } },
      { label: "摇头表示不知道", result: "neutral", msg: "你也不知道那个地方，只能摇头。", change: {} }
    ]
  },

  // 高冷性格
  {
    id: "meet_cold_1",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 周身散发着冰冷的气息，周围的修士都不敢靠近他。",
    options: [
      { label: "鼓起勇气上前打招呼", result: "neutral", msg: "他只是冷冷地看了你一眼，没有回应。(好感+1)", change: { affection: 1 } },
      { label: "识趣地离开", result: "neutral", msg: "你感受到了他的冰冷气息，选择了离开。", change: {} }
    ]
  },
  {
    id: "meet_cold_2",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 正在山顶打坐，周围风雪交加，他却纹丝不动。",
    options: [
      {
        label: "在远处默默陪伴",
        check: (player) => player.stats.luck > 50,
        success: { msg: "他结束修炼后注意到了你，眼神中闪过一丝惊讶。(好感+5)", change: { affection: 5 } },
        fail: { msg: "他没有注意到你，直接离开了。", change: {} }
      },
      { label: "悄悄离开", result: "neutral", msg: "你不想打扰他的修炼。", change: {} }
    ]
  },
  {
    id: "meet_cold_3",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 拒绝了一位修士的求道，对方显得很尴尬。",
    options: [
      { label: "上前缓解尴尬", result: "neutral", msg: "你得体地缓解了尴尬，他看了看你，没有说话。(好感+3)", change: { affection: 3 } },
      { label: "远远观看", result: "neutral", msg: "你只是远远地看着这一幕。", change: {} }
    ]
  },
  {
    id: "meet_cold_4",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 正在擦拭自己的宝剑，眼神专注而冰冷。",
    options: [
      { label: "赞叹他的宝剑", result: "neutral", msg: "他微微点头，继续擦拭宝剑。(好感+2)", change: { affection: 2 } },
      { label: "默默离开", result: "neutral", msg: "你没有打扰他。", change: {} }
    ]
  },
  {
    id: "meet_cold_5",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 独自在林中猎杀妖兽，出手果断，不留情面。",
    options: [
      {
        label: "出手相助",
        check: (player) => player.combatStats.atk > 60,
        success: { msg: "你们配合默契，轻松击败了妖兽。他对你的实力表示认可。(好感+7)", change: { affection: 7 } },
        fail: { msg: "你的帮助似乎多余，他独自解决了妖兽。(好感+1)", change: { affection: 1 } }
      },
      { label: "旁观学习", result: "neutral", msg: "你学到了一些战斗技巧。", change: {} }
    ]
  },
  {
    id: "meet_cold_6",
    stage: 0,
    reqTrait: "高冷",
    text: "{name} 正在研究一本古老的功法，眉头紧锁。",
    options: [
      {
        label: "尝试解答他的疑惑",
        check: (player) => player.stats.intelligence > 70,
        success: { msg: "你的见解让他豁然开朗，他对你的印象有所改观。(好感+8)", change: { affection: 8 } },
        fail: { msg: "你的解答并不正确，他摇了摇头。(好感+0)", change: { affection: 0 } }
      },
      { label: "不打扰他", result: "neutral", msg: "你没有打扰他的研究。", change: {} }
    ]
  },

  // 温柔性格
  {
    id: "meet_gentle_1",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在照顾一只受伤的小鸟，动作轻柔。",
    options: [
      { label: "主动提供帮助", result: "neutral", msg: "你们一起救治了小鸟，他对你露出了温暖的笑容。(好感+7)", change: { affection: 7 } },
      { label: "静静观看", result: "neutral", msg: "你被他的温柔所打动，悄悄离开了。(好感+3)", change: { affection: 3 } }
    ]
  },
  {
    id: "meet_gentle_2",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在为一位受伤的修士治疗，手法娴熟。",
    options: [
      { label: "帮忙打下手", result: "neutral", msg: "你的帮助让治疗更加顺利，他对你表示感谢。(好感+6)", change: { affection: 6 } },
      { label: "默默离开", result: "neutral", msg: "你不想打扰他的治疗。", change: {} }
    ]
  },
  {
    id: "meet_gentle_3",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在分发食物给流浪修士，脸上带着善意的笑容。",
    options: [
      { label: "加入他的行列", result: "neutral", msg: "你们一起帮助了流浪修士，他对你的善良很欣赏。(好感+9)", change: { affection: 9 } },
      { label: "离开", result: "neutral", msg: "你没有参与，但对他的行为表示赞赏。(好感+2)", change: { affection: 2 } }
    ]
  },
  {
    id: "meet_gentle_4",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在花园中照料灵花，细心地为花朵浇水施肥。",
    options: [
      { label: "上前请教养花技巧", result: "neutral", msg: "他耐心地教你养花技巧，你们聊得很开心。(好感+5)", change: { affection: 5 } },
      { label: "欣赏花朵", result: "neutral", msg: "你欣赏了一会儿美丽的花朵。", change: {} }
    ]
  },
  {
    id: "meet_gentle_5",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在安慰哭泣的小女孩，声音柔和。",
    options: [
      { label: "帮忙一起安慰", result: "neutral", msg: "你们一起哄好了小女孩，他对你露出了感激的笑容。(好感+8)", change: { affection: 8 } },
      { label: "离开", result: "neutral", msg: "你没有打扰他们。", change: {} }
    ]
  },
  {
    id: "meet_gentle_6",
    stage: 0,
    reqTrait: "温柔",
    text: "{name} 正在为修士们演奏乐曲，琴声悠扬，令人陶醉。",
    options: [
      { label: "上前称赞他的琴技", result: "neutral", msg: "他停下琴，对你微笑道谢。(好感+6)", change: { affection: 6 } },
      { label: "默默聆听", result: "neutral", msg: "你听完了整首曲子，心情愉悦。(好感+3)", change: { affection: 3 } }
    ]
  },

  // --- 阶段1：好感 (20 ≤ 好感 < 60) ---
  // 普通互动
  {
    id: "phase1_normal_1",
    stage: 1,
    text: "{name} 邀请你一起去寻宝，据说附近有一处神秘的洞府。",
    options: [
      { label: "欣然同意", result: "good", msg: "你们一起探索了洞府，收获颇丰，关系更进一步。(好感+10，信任+5)", change: { affection: 10, trust: 5 } },
      { label: "委婉拒绝", result: "neutral", msg: "你有事在身，只能婉拒。(好感+2)", change: { affection: 2 } }
    ]
  },
  {
    id: "phase1_normal_2",
    stage: 1,
    text: "{name} 向你请教修炼上的问题，看起来很困惑。",
    options: [
      {
        label: "详细解答",
        check: (player) => player.stats.intelligence > 65,
        success: { msg: "你的解答让他受益匪浅，他对你更加信任。(好感+8，信任+8)", change: { affection: 8, trust: 8 } },
        fail: { msg: "你的解答有些模糊，但他还是很感谢你。(好感+4，信任+3)", change: { affection: 4, trust: 3 } }
      },
      { label: "坦言自己也不懂", result: "neutral", msg: "你如实相告，他表示理解。(好感+1)", change: { affection: 1 } }
    ]
  },
  {
    id: "phase1_normal_3",
    stage: 1,
    text: "{name} 正在准备突破境界，邀请你为他护法。",
    options: [
      { label: "答应护法", result: "good", msg: "你成功为他护法，他突破成功。(好感+12，信任+10)", change: { affection: 12, trust: 10 } },
      { label: "因事婉拒", result: "neutral", msg: "你有事不能帮忙，他有些失望。(好感-1)", change: { affection: -1 } }
    ]
  },
  {
    id: "phase1_normal_4",
    stage: 1,
    text: "{name} 做了一些美味的灵食，想要请你品尝。",
    options: [
      { label: "开心品尝", result: "good", msg: "灵食味道绝佳，你赞不绝口。(好感+7，信任+4)", change: { affection: 7, trust: 4 } },
      { label: "委婉推辞", result: "neutral", msg: "你最近胃口不好，只能婉拒。(好感+1)", change: { affection: 1 } }
    ]
  },
  {
    id: "phase1_normal_5",
    stage: 1,
    text: "{name} 遇到了麻烦，需要你的帮助。",
    options: [
      {
        label: "全力相助",
        check: (player) => player.combatStats.atk > 70,
        success: { msg: "你成功帮他解决了麻烦，他对你感激不尽。(好感+15，信任+12)", change: { affection: 15, trust: 12 } },
        fail: { msg: "你们一起努力解决了问题，虽然过程艰难。(好感+8，信任+6)", change: { affection: 8, trust: 6 } }
      },
      { label: "无能为力", result: "bad", msg: "你帮不上忙，他很失望。(好感-2)", change: { affection: -2 } }
    ]
  },
  {
    id: "phase1_normal_6",
    stage: 1,
    text: "{name} 想要带你去一个特别的地方，说是他常去的秘密基地。",
    options: [
      { label: "好奇前往", result: "good", msg: "那是一个美丽的地方，你们度过了愉快的时光。(好感+9，信任+7)", change: { affection: 9, trust: 7 } },
      { label: "找借口不去", result: "neutral", msg: "你今天没心情，他有些失落。(好感+0)", change: { affection: 0 } }
    ]
  },

  // 傲娇性格
  {
    id: "phase1_tsundere_1",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 别别扭扭地递给你一份礼物，脸涨得通红：\"才、才不是特意给你的呢！只是顺路买多了而已！\"",
    options: [
      { label: "开心收下，真诚道谢", result: "good", msg: "你开心的样子让他耳根都红了。(好感+10，信任+5)", change: { affection: 10, trust: 5 } },
      { label: "调侃他", result: "neutral", msg: "你调侃了他两句，他气得转身就走，但偷偷笑了。(好感+8)", change: { affection: 8 } }
    ]
  },
  {
    id: "phase1_tsundere_2",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 嘴上说着不想和你一起修炼，却总是在你附近出现。",
    options: [
      { label: "主动邀请他一起修炼", result: "good", msg: "他虽然嘴上不情愿，还是答应了。(好感+9，信任+4)", change: { affection: 9, trust: 4 } },
      { label: "假装没看见", result: "neutral", msg: "你们各自修炼，但距离越来越近。(好感+5)", change: { affection: 5 } }
    ]
  },
  {
    id: "phase1_tsundere_3",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 对你的某个缺点指手画脚，显得很不满。",
    options: [
      { label: "虚心接受建议", result: "good", msg: "你认真的态度让他很意外，对你刮目相看。(好感+12，信任+6)", change: { affection: 12, trust: 6 } },
      { label: "反驳他", result: "neutral", msg: "你们吵了一架，但感情反而更好了。(好感+7)", change: { affection: 7 } }
    ]
  },
  {
    id: "phase1_tsundere_4",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 听说你生病了，特意来看你，却嘴硬说只是路过。",
    options: [
      { label: "感激地接受他的关心", result: "good", msg: "他虽然嘴上不说，但眼里满是担忧。(好感+11，信任+8)", change: { affection: 11, trust: 8 } },
      { label: "调侃他口是心非", result: "neutral", msg: "他恼羞成怒，放下药就走了。(好感+6)", change: { affection: 6 } }
    ]
  },
  {
    id: "phase1_tsundere_5",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 想和你比试一番，却说是为了检验你的实力。",
    options: [
      {
        label: "接受挑战",
        check: (player) => player.combatStats.atk > 75,
        success: { msg: "你们打成平手，他对你的实力表示认可。(好感+15，信任+10)", change: { affection: 15, trust: 10 } },
        fail: { msg: "你输了，但他还是表扬了你。(好感+8，信任+5)", change: { affection: 8, trust: 5 } }
      },
      { label: "委婉拒绝", result: "bad", msg: "他觉得你看不起他，很生气。(好感-3)", change: { affection: -3 } }
    ]
  },
  {
    id: "phase1_tsundere_6",
    stage: 1,
    reqTrait: "傲娇",
    text: "{name} 为你准备了惊喜，却假装不知道。",
    options: [
      { label: "假装惊喜", result: "good", msg: "你表现得很惊喜，他心里乐开了花。(好感+10，信任+7)", change: { affection: 10, trust: 7 } },
      { label: "拆穿他", result: "neutral", msg: "你拆穿了他的小把戏，他害羞地跑了。(好感+9)", change: { affection: 9 } }
    ]
  },

  // 重利性格
  {
    id: "phase1_greedy_1",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 向你提出一个合作机会，说是能赚不少灵石。",
    options: [
      { label: "答应合作", result: "good", msg: "合作很成功，你们都赚了不少。(好感+12，信任+3)", change: { affection: 12, trust: 3 } },
      { label: "谨慎拒绝", result: "neutral", msg: "你觉得风险太大，婉拒了。(好感+2)", change: { affection: 2 } }
    ]
  },
  {
    id: "phase1_greedy_2",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 发现了一处灵矿，想要和你一起开采。",
    options: [
      {
        label: "出资合作",
        check: (player) => player.resources.spiritStones > 500,
        success: { msg: "你出资合作，获得了丰厚的回报。(好感+15，信任+5)", change: { affection: 15, trust: 5 } },
        fail: { msg: "你资金不足，只能放弃。(好感+1)", change: { affection: 1 } }
      },
      { label: "拒绝", result: "neutral", msg: "你对灵矿不感兴趣。(好感+0)", change: { affection: 0 } }
    ]
  },
  {
    id: "phase1_greedy_3",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 想要购买一件宝物，但资金不够，向你借钱。",
    options: [
      {
        label: "慷慨借钱",
        check: (player) => player.resources.spiritStones > 300,
        success: { msg: "他按时归还了借款，并额外给了你利息。(好感+10，信任+8)", change: { affection: 10, trust: 8 } },
        fail: { msg: "你资金不足，只能婉拒。(好感+1)", change: { affection: 1 } }
      },
      { label: "拒绝", result: "bad", msg: "他很失望，认为你不够仗义。(好感-2)", change: { affection: -2 } }
    ]
  },
  {
    id: "phase1_greedy_4",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 告诉你一个内幕消息，说是能在坊市淘到宝贝。",
    options: [
      { label: "相信他", result: "good", msg: "你按照他的消息淘到了宝贝，赚了一笔。(好感+12，信任+6)", change: { affection: 12, trust: 6 } },
      { label: "半信半疑", result: "neutral", msg: "你没有完全相信，只买了一点，小有收获。(好感+5)", change: { affection: 5 } }
    ]
  },
  {
    id: "phase1_greedy_5",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 想要和你一起垄断某种资源，获取高额利润。",
    options: [
      { label: "同意合作", result: "good", msg: "垄断很成功，你们赚得盆满钵满。(好感+15，信任+4)", change: { affection: 15, trust: 4 } },
      { label: "拒绝", result: "neutral", msg: "你觉得太冒险，婉拒了。(好感+2)", change: { affection: 2 } }
    ]
  },
  {
    id: "phase1_greedy_6",
    stage: 1,
    reqTrait: "重利",
    text: "{name} 为你提供了一个赚取灵石的机会，但需要你帮他一个忙。",
    options: [
      { label: "答应帮忙", result: "good", msg: "你帮了他的忙，也赚了不少灵石。(好感+10，信任+5)", change: { affection: 10, trust: 5 } },
      { label: "拒绝", result: "neutral", msg: "你不想卷入他的事情。(好感+0)", change: { affection: 0 } }
    ]
  },

  // --- 阶段2：暧昧 (好感 ≥ 60) ---
  // 普通暧昧
  {
    id: "phase2_normal_1",
    stage: 2,
    text: "{name} 约你在月光下见面，眼神中充满了柔情。",
    options: [
      { label: "赴约", result: "good", msg: "你们在月光下互诉衷肠，关系更加亲密。(好感+15，信任+10)", change: { affection: 15, trust: 10 } },
      { label: "迟到", result: "neutral", msg: "你迟到了一会儿，他一直在等你。(好感+8)", change: { affection: 8 } }
    ]
  },
  {
    id: "phase2_normal_2",
    stage: 2,
    text: "{name} 为你写了一首诗，字里行间充满了对你的感情。",
    options: [
      { label: "回赠一首诗", result: "good", msg: "你们以诗传情，感情迅速升温。(好感+20，信任+15)", change: { affection: 20, trust: 15 } },
      { label: "真诚感谢", result: "neutral", msg: "你真诚地感谢了他，他很开心。(好感+10，信任+5)", change: { affection: 10, trust: 5 } }
    ]
  },
  {
    id: "phase2_normal_3",
    stage: 2,
    text: "{name} 想要和你结为道侣，一起修炼，共同进步。",
    options: [
      { label: "答应", result: "good", msg: "你们结为道侣，感情更加深厚。(好感+25，信任+20)", change: { affection: 25, trust: 20 } },
      { label: "暂时考虑", result: "neutral", msg: "你需要时间考虑，他表示理解。(好感+10)", change: { affection: 10 } }
    ]
  },
  {
    id: "phase2_normal_4",
    stage: 2,
    text: "{name} 为了救你，不顾自身安危，挡下了致命一击。",
    options: [
      { label: "悉心照料他", result: "good", msg: "你悉心照料他，他感动不已。(好感+30，信任+25)", change: { affection: 30, trust: 25 } },
      { label: "感激不尽", result: "neutral", msg: "你对他的救命之恩感激不尽。(好感+15，信任+10)", change: { affection: 15, trust: 10 } }
    ]
  },
  {
    id: "phase2_normal_5",
    stage: 2,
    text: "{name} 想要带你见他的家人，介绍给他们认识。",
    options: [
      { label: "欣然同意", result: "good", msg: "他的家人很喜欢你，你们的关系得到了认可。(好感+20，信任+15)", change: { affection: 20, trust: 15 } },
      { label: "找借口推迟", result: "neutral", msg: "你还没准备好，他表示理解。(好感+5)", change: { affection: 5 } }
    ]
  },
  {
    id: "phase2_normal_6",
    stage: 2,
    text: "{name} 想要和你一起度过一个特别的节日，准备了惊喜。",
    options: [
      { label: "开心参与", result: "good", msg: "你们度过了一个难忘的节日，感情更加甜蜜。(好感+18，信任+12)", change: { affection: 18, trust: 12 } },
      { label: "有事不能参加", result: "bad", msg: "他精心准备的惊喜泡汤了，很失望。(好感-5)", change: { affection: -5 } }
    ]
  },

  // 病娇性格
  {
    id: "phase2_yandere_1",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 紧紧抱着你，眼神痴迷：\"你是我的，只属于我一个人！谁都不能抢走你！\"",
    options: [
      { label: "温柔安抚他", result: "good", msg: "你的安抚让他平静下来，更加依赖你。(好感+20，信任+15)", change: { affection: 20, trust: 15 } },
      { label: "轻轻推开他", result: "bad", msg: "他的眼神变得阴郁，让你有些害怕。(好感-10，信任-5)", change: { affection: -10, trust: -5 } }
    ]
  },
  {
    id: "phase2_yandere_2",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 送给你一个小盒子，里面是他的一缕头发：\"这样我们就永远在一起了！\"",
    options: [
      { label: "收下并表示珍惜", result: "good", msg: "你真诚的态度让他欣喜若狂。(好感+25，信任+20)", change: { affection: 25, trust: 20 } },
      { label: "犹豫着收下", result: "neutral", msg: "你虽然有些害怕，但还是收下了。(好感+10，信任+5)", change: { affection: 10, trust: 5 } }
    ]
  },
  {
    id: "phase2_yandere_3",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 发现你和其他异性修士交谈，眼神变得危险起来：\"你为什么要和别人说话？你只能看着我！\"",
    options: [
      { label: "耐心解释", result: "good", msg: "你解释清楚后，他的眼神恢复了温柔。(好感+15，信任+10)", change: { affection: 15, trust: 10 } },
      { label: "不耐烦地回应", result: "bad", msg: "你的态度让他很受伤，他哭着跑开了。(好感-15，信任-10)", change: { affection: -15, trust: -10 } }
    ]
  },
  {
    id: "phase2_yandere_4",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 为了你，伤害了对你有好感的修士，手染鲜血地站在你面前：\"我为了你什么都愿意做！\"",
    options: [
      { label: "温柔地抱住他", result: "good", msg: "你没有责怪他，他更加爱你了。(好感+30，信任+25)", change: { affection: 30, trust: 25 } },
      { label: "惊讶地后退", result: "bad", msg: "你的反应让他心碎，他发誓要变得更加强大来保护你。(好感-5，信任+10)", change: { affection: -5, trust: 10 } }
    ]
  },
  {
    id: "phase2_yandere_5",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 想要和你永远在一起，甚至想要用禁术将你们的灵魂绑定。",
    options: [
      { label: "同意", result: "good", msg: "你们的灵魂绑定在了一起，永远无法分离。(好感+35，信任+30)", change: { affection: 35, trust: 30 } },
      { label: "委婉拒绝", result: "neutral", msg: "你说服他放弃了这个想法，但他还是有些失落。(好感+10，信任+5)", change: { affection: 10, trust: 5 } }
    ]
  },
  {
    id: "phase2_yandere_6",
    stage: 2,
    reqTrait: "病娇",
    text: "{name} 用充满爱意的眼神看着你：\"如果有一天你离开我，我会陪你一起下地狱！\"",
    options: [
      { label: "发誓永远不离开他", result: "good", msg: "你的誓言让他安心，他紧紧抱住了你。(好感+25，信任+20)", change: { affection: 25, trust: 20 } },
      { label: "沉默不语", result: "neutral", msg: "你不知道该说什么，只能默默拥抱他。(好感+15，信任+10)", change: { affection: 15, trust: 10 } }
    ]
  },

  // 正直性格
  {
    id: "phase2_justice_1",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 告诉你他要去铲除一个作恶多端的魔头，可能会有生命危险。",
    options: [
      { label: "陪他一起去", result: "good", msg: "你们一起铲除了魔头，成为了人人称赞的侠侣。(好感+25，信任+20)", change: { affection: 25, trust: 20 } },
      { label: "在家等他归来", result: "neutral", msg: "你在家焦急等待，他平安归来后更加珍惜你。(好感+15，信任+15)", change: { affection: 15, trust: 15 } }
    ]
  },
  {
    id: "phase2_justice_2",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 想要建立一个正义的门派，保护弱小，惩恶扬善，邀请你一起。",
    options: [
      { label: "全力支持", result: "good", msg: "你们一起建立了门派，成为了受人尊敬的掌门夫妇。(好感+30，信任+25)", change: { affection: 30, trust: 25 } },
      { label: "表示支持但不参与", result: "neutral", msg: "你支持他的理想，但有自己的事情要做。(好感+10，信任+5)", change: { affection: 10, trust: 5 } }
    ]
  },
  {
    id: "phase2_justice_3",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 发现有人在暗中谋害你，决定追查到底，找出幕后真凶。",
    options: [
      { label: "一起追查", result: "good", msg: "你们一起找出了真凶，他对你更加保护。(好感+20，信任+18)", change: { affection: 20, trust: 18 } },
      { label: "让他小心", result: "neutral", msg: "你担心他的安全，让他小心行事。(好感+12，信任+10)", change: { affection: 12, trust: 10 } }
    ]
  },
  {
    id: "phase2_justice_4",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 为了救一个素不相识的孩子，差点丢了性命，醒来后第一句话就是问你有没有事。",
    options: [
      { label: "心疼地责备他", result: "good", msg: "你的关心让他很温暖，他发誓以后会更加小心。(好感+22，信任+20)", change: { affection: 22, trust: 20 } },
      { label: "感谢他的善良", result: "neutral", msg: "你感谢他的善良，他觉得这是应该做的。(好感+15，信任+15)", change: { affection: 15, trust: 15 } }
    ]
  },
  {
    id: "phase2_justice_5",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 想要和你一起云游天下，行侠仗义，帮助需要帮助的人。",
    options: [
      { label: "答应一起云游", result: "good", msg: "你们一起云游天下，留下了许多佳话。(好感+28，信任+25)", change: { affection: 28, trust: 25 } },
      { label: "想要安定下来", result: "neutral", msg: "你想要安定下来，他尊重你的选择。(好感+10，信任+8)", change: { affection: 10, trust: 8 } }
    ]
  },
  {
    id: "phase2_justice_6",
    stage: 2,
    reqTrait: "正直",
    text: "{name} 因为坚持正义，得罪了权贵，面临着巨大的压力。",
    options: [
      { label: "和他站在一起", result: "good", msg: "你坚定地站在他身边，他更加坚定了自己的信念。(好感+30，信任+30)", change: { affection: 30, trust: 30 } },
      { label: "劝他暂时妥协", result: "neutral", msg: "你劝他暂时妥协，保存实力，他虽然不情愿，但还是听了你的话。(好感+15，信任+12)", change: { affection: 15, trust: 12 } }
    ]
  }
];

// 升级版随机事件函数
export const getRandomEvent = (npc, player) => {
  // 筛选符合 阶段 + 性格 + 特殊条件 的事件
  const validEvents = eventLibrary.filter(evt => {
    // 1. 阶段判定
    let stage = 0;
    const affection = npc.relationship?.affection || 0;
    if(affection >= 20) stage = 1;
    if(affection >= 60) stage = 2;
    if(evt.stage !== stage) return false;

    // 2. 性格判定 (如果有要求)
    if(evt.reqTrait) {
      // 兼容两种personality格式：对象或数组
      const traits = typeof npc.personality === 'object' && npc.personality !== null && 'label' in npc.personality 
        ? [npc.personality.label] 
        : Array.isArray(npc.personality) ? npc.personality : [];
      
      // 检查是否匹配任一性格
      if(!traits.includes(evt.reqTrait)) return false;
    }

    // 3. 自定义条件判定 (比如属性要求)
    if(evt.condition && !evt.condition(npc)) return false;

    return true;
  });

  if(validEvents.length === 0) return null;

  // 随机取一个，并替换文本中的 {name}
  const evt = validEvents[Math.floor(Math.random() * validEvents.length)];
  return {
    ...evt,
    text: evt.text.replace(/{name}/g, npc.name)
  };
};