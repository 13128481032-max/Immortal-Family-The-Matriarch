/**
 * 统一消息中心系统 (Message Center System)
 * 整合所有文字剧情类信息：家书、遗言、报平安等
 * 采用非阻塞式后台生成，通过红点驱动玩家主动查看
 */
import { sendMessageToAI } from '../services/aiService.js';
// 消息类型常量
export const MESSAGE_TYPES = {
  LETTER: 'LETTER',           // 日常家书
  OBITUARY: 'OBITUARY',       // 遗言/绝笔
  DEPARTURE: 'DEPARTURE',     // 离别告知
  ACHIEVEMENT: 'ACHIEVEMENT', // 成就通报
};

// 消息状态常量
export const MESSAGE_STATUS = {
  PENDING: 'PENDING',     // 生成中
  READY: 'READY',         // 已生成，未读
  READ: 'READ',           // 已读
};

/**
 * 创建消息对象
 * @param {Object} params - 消息参数
 * @returns {Object} 消息对象
 */
export function createMessage({
  type,
  senderId,
  senderName,
  title,
  content = '',
  timestamp,
  extras = {},
  status = MESSAGE_STATUS.READY,
}) {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    senderId,
    senderName,
    title,
    content,
    isRead: status === MESSAGE_STATUS.READ,
    status,
    timestamp,
    extras,
    createdAt: Date.now(),
  };
}

/**
 * 消息管理器类
 */
export class MessageManager {
  constructor(maxMessages = 100, maxLetters = 50) {
    this.messages = [];
    this.maxMessages = maxMessages;
    this.maxLetters = maxLetters; // 普通家书的上限
    this.recentContents = new Map(); // 记录最近发送的内容，防止重复
  }

  /**
   * 添加消息（带去重检查）
   * @param {Object} message - 消息对象
   */
  addMessage(message) {
    // 检查是否与最近的消息内容重复
    if (message.type === MESSAGE_TYPES.LETTER && message.senderId) {
      const recentContent = this.recentContents.get(message.senderId);
      if (recentContent === message.content) {
        // 内容重复，跳过添加
        console.log(`[MessageManager] 跳过重复内容的家书: ${message.senderName}`);
        return false;
      }
      // 记录这次的内容
      this.recentContents.set(message.senderId, message.content);
    }
    
    this.messages.unshift(message); // 新消息放在前面
    this.cleanup();
    return true;
  }

  /**
   * 标记消息为已读
   * @param {string} messageId - 消息ID
   */
  markAsRead(messageId) {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isRead = true;
      message.status = MESSAGE_STATUS.READ;
    }
  }

  /**
   * 获取所有未读消息数量
   * @returns {number}
   */
  getUnreadCount() {
    return this.messages.filter(m => !m.isRead && m.status === MESSAGE_STATUS.READY).length;
  }

  /**
   * 获取指定类型的消息
   * @param {string} type - 消息类型
   * @returns {Array}
   */
  getMessagesByType(type) {
    return this.messages.filter(m => m.type === type);
  }

  /**
   * 获取所有消息
   * @returns {Array}
   */
  getAllMessages() {
    return [...this.messages];
  }

  /**
   * 清理旧消息（保护遗言类型）
   */
  cleanup() {
    // 分离遗言和普通消息
    const obituaries = this.messages.filter(m => m.type === MESSAGE_TYPES.OBITUARY);
    const regularMessages = this.messages.filter(m => m.type !== MESSAGE_TYPES.OBITUARY);

    // 只清理普通消息
    if (regularMessages.length > this.maxLetters) {
      const toKeep = regularMessages.slice(0, this.maxLetters);
      this.messages = [...obituaries, ...toKeep];
    }

    // 总数量限制
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(0, this.maxMessages);
    }
  }

  /**
   * 删除消息
   * @param {string} messageId - 消息ID
   */
  deleteMessage(messageId) {
    this.messages = this.messages.filter(m => m.id !== messageId);
  }

  /**
   * 从JSON恢复状态
   * @param {Array} messagesData - 消息数据数组
   */
  loadFromData(messagesData) {
    this.messages = messagesData || [];
  }

  /**
   * 导出为JSON
   * @returns {Array}
   */
  toJSON() {
    return this.messages;
  }
}

/**
 * 生成家书内容模板
 */
export const letterTemplates = {
  // 子女报平安
  childSafety: (npc, player, gameTime) => {
    const greetings = ['娘亲亲启', '父亲亲启', '双亲大人'];
    const bodies = [
      `孩儿已抵达${npc.sect || '宗门'}，一切安好，勿念。师门对我颇为照顾，近日修为略有精进。`,
      `在宗门修行日久，想念家中。此番筑基${npc.cultivation?.stage || '修炼'}顺利，多亏您当年教诲。`,
      `近日参悟功法有所突破，达${npc.cultivation?.stage || '新境界'}。宗门长老夸赞不已，孩儿定不负您期望。`,
      `宗门大比在即，孩儿已做好准备。无论结果如何，都是您教导有方。待我学成归来，必定光耀门楣。`,
    ];
    const endings = ['敬上', '叩首', '拜上'];

    return `${greetings[Math.floor(Math.random() * greetings.length)]}\n\n${
      bodies[Math.floor(Math.random() * bodies.length)]
    }\n\n您的${npc.gender === 'female' ? '女儿' : '儿子'} ${npc.name} ${
      endings[Math.floor(Math.random() * endings.length)]
    }\n\n${gameTime.year}年${gameTime.month}月`;
  },

  // 伴侣思念
  spouseMissing: (npc, player, gameTime) => {
    const openings = ['夫君', '娘子', '道侣'];
    const bodies = [
      `别来已久，甚是想念。我在外游历平安，近日突破至${npc.cultivation?.stage || '新境界'}，心中第一个想到的便是你。`,
      `今日观云海，忽忆当年与你共赏之景。修行路漫漫，有你相伴，便不觉孤寂。`,
      `闻你近日闭关，特以传书问候。我在外一切安好，只盼早日归来，与你共话修行心得。`,
      `得一奇遇，获珍宝一件，特留予你。待我归来之时，定要与你细说这一路见闻。`,
    ];
    const endings = ['念', '盼归', '勿忘'];

    const opening = openings[Math.floor(Math.random() * openings.length)];
    return `${opening}：\n\n${bodies[Math.floor(Math.random() * bodies.length)]}\n\n${npc.name} ${
      endings[Math.floor(Math.random() * endings.length)]
    }\n\n${gameTime.year}年${gameTime.month}月`;
  },

  // 默认模板（多个变体）
  default: (npc, player, gameTime) => {
    const greetings = [`${player.name}：`, `${player.name}敬启：`, `${player.name}大人：`];
    const bodies = [
      '近来可好？我在外一切平安，勿念。',
      '别来经月，甚是想念。近日修行颇有进境，望家中一切安好。',
      '游历在外，偶遇奇景，心中总会想起你。修行之路虽艰辛，但想到有你等待，便觉一切值得。',
      '闻你近况尚可，心中甚慰。我在外游历，见识颇丰，待归来时定要与你细说。',
      '此番外出，收获良多。虽身在异乡，心却常念故人。望你珍重。',
      '近日修为有所突破，心中第一个想到的便是你。愿你安康，勿挂念。',
      '久别重逢，不知何时。这些时日在外历练，时常想起往日种种，倍感温馨。',
      '游历四方，见过许多风景，却不及与你相伴的时光。盼早日归来。'
    ];
    const endings = ['敬上', '念', '拜上', '书'];

    return `${greetings[Math.floor(Math.random() * greetings.length)]}\n\n${
      bodies[Math.floor(Math.random() * bodies.length)]
    }\n\n${npc.name} ${endings[Math.floor(Math.random() * endings.length)]}\n\n${gameTime.year}年${gameTime.month}月`;
  },
};

/**
 * 生成遗言内容模板
 */
export const obituaryTemplates = {
  // 子女遗言
  child: (npc, player, gameTime) => {
    const openings = ['娘亲', '父亲', '双亲'];
    const bodies = [
      `孩儿不孝，未能尽孝膝前。此生最大的遗憾，便是不能再听您的教诲。若有来世，定当图报养育之恩。`,
      `修行路上遭遇强敌，孩儿自知时日无多。多谢您这些年的养育之恩，来世再见……`,
      `渡劫失败，神魂俱散。只恨不能再见您一面。您教我的功法，我会传给师弟妹们，让它永世流传。`,
      `战至最后一刻，孩儿无愧于心。只是再也不能陪在您身边了。保重身体，来世再续父子/母女缘分。`,
    ];

    return `${openings[Math.floor(Math.random() * openings.length)]}：\n\n${
      bodies[Math.floor(Math.random() * bodies.length)]
    }\n\n您的${npc.gender === 'female' ? '女儿' : '儿子'} ${npc.name} 绝笔\n\n${gameTime.year}年${
      gameTime.month
    }月`;
  },

  // 伴侣遗言
  spouse: (npc, player, gameTime) => {
    const bodies = [
      `这一生最大的遗憾，就是没能和你走到最后……记得照顾好自己，也要照顾好孩子们。`,
      `道侣之缘，止于今日。若有来世，我定会寻到你，再续前缘。`,
      `我的修行路到此为止了。你要好好活着，替我看看这世间的精彩。我们的孩子，就拜托你了。`,
      `不要为我悲伤太久。你还有漫长的修行路要走，还有家族需要你守护。此生能与你相伴，我已无憾。`,
    ];

    return `${player.name}：\n\n${bodies[Math.floor(Math.random() * bodies.length)]}\n\n${
      npc.name
    } 遗言\n\n${gameTime.year}年${gameTime.month}月`;
  },

  // 好友遗言
  friend: (npc, player, gameTime) => {
    const bodies = [
      `道友，我先走一步了。你要保重，修行路上多加小心。`,
      `能结识你这样的道友，此生无憾。替我好好活着，看看这修真界的尽头。`,
      `天命如此，我也无可奈何。你要继续走下去，不要辜负我们曾经的约定。`,
      `修行路漫长而凶险，我终究是走不到终点了。你一定要小心，不要重蹈我的覆辙。`,
    ];

    return `${player.name}道友：\n\n${bodies[Math.floor(Math.random() * bodies.length)]}\n\n${
      npc.name
    } 绝笔\n\n${gameTime.year}年${gameTime.month}月`;
  },

  // 默认遗言
  default: (npc, player, gameTime) => {
    return `${player.name}：\n\n此生能相识，已是缘分。我先走一步，你要保重。\n\n${
      npc.name
    } 遗言\n\n${gameTime.year}年${gameTime.month}月`;
  },
};

/**
 * 使用AI生成家书内容
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameTime - 游戏时间
 * @param {string} relation - 关系类型
 * @param {Object} settings - AI配置
 * @returns {Promise<string>}
 */
export async function generateLetterContentWithAI(npc, player, gameTime, relation = 'default', settings) {
  try {
    // 构建角色背景信息
    let relationDesc = '';
    let tone = '';
    
    switch(relation) {
      case 'child':
        relationDesc = `你是${player.name}的${npc.gender === 'female' ? '女儿' : '儿子'}${npc.name}，现在在${npc.sect || '宗门'}修行，境界${npc.tier || '炼气期'}。`;
        tone = '语气要孝顺、尊敬，略带思念之情。';
        break;
      case 'spouse':
        relationDesc = `你是${player.name}的道侣${npc.name}，境界${npc.tier || '炼气期'}，目前在外游历。`;
        tone = '语气要温柔、思念，充满夫妻情深。';
        break;
      case 'friend':
        relationDesc = `你是${player.name}的道友${npc.name}，境界${npc.tier || '炼气期'}。你们是修行路上的挚友。`;
        tone = '语气要真诚、豪爽，体现道友情谊。';
        break;
      default:
        relationDesc = `你是${npc.name}，境界${npc.tier || '炼气期'}，与${player.name}相识已久。`;
        tone = '语气要礼貌、友善。';
    }

    const messages = [{
      role: 'system',
      content: `你是修真世界的一位修士，正在给朋友写一封家书。${relationDesc}\n\n你的性格特点：${npc.trait?.name || '平和稳重'}。\n\n写作要求：
1. 使用古风文言文风格，但要浅显易懂
2. ${tone}
3. 字数控制在100-150字
4. 要提及近期修炼进展或见闻
5. 表达对收信人的关心或思念
6. 落款格式："您的XX ${npc.name} 敬上\\n\\n${gameTime.year}年${gameTime.month}月"`
    }, {
      role: 'user',
      content: `请以${npc.name}的身份，给${player.name}写一封家书。当前时间是${gameTime.year}年${gameTime.month}月。`
    }];

    const content = await sendMessageToAI(
      messages,
      settings.apiKey,
      settings.apiUrl || 'https://api.deepseek.com/chat/completions',
      {
        model: settings.apiModel || 'deepseek-chat',
        temperature: 0.9,
        maxTokens: 300
      }
    );

    return content;
  } catch (error) {
    console.error('AI生成家书失败，使用模板:', error);
    // 失败时降级到模板
    return generateLetterContent(npc, player, gameTime, relation);
  }
}

/**
 * 生成家书内容（本地模板）
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameTime - 游戏时间
 * @param {string} relation - 关系类型
 * @returns {string}
 */
export function generateLetterContent(npc, player, gameTime, relation = 'default') {
  const template = letterTemplates[relation] || letterTemplates.default;
  return template(npc, player, gameTime);
}

/**
 * 生成遗言内容
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameTime - 游戏时间
 * @param {string} relation - 关系类型
 * @returns {string}
 */
export function generateObituaryContent(npc, player, gameTime, relation = 'default') {
  const template = obituaryTemplates[relation] || obituaryTemplates.default;
  return template(npc, player, gameTime);
}

/**
 * 判断是否应该发送家书
 * @param {Object} npc - NPC对象
 * @param {number} monthsSinceLastMessage - 距离上次消息的月数
 * @returns {boolean}
 */
export function shouldSendLetter(npc, monthsSinceLastMessage = 3) {
  // 基础概率：每3个月检查一次
  if (monthsSinceLastMessage < 3) return false;

  // 根据好感度和性格调整概率
  let probability = 0.3; // 基础30%

  // 好感度加成
  const affection = npc.affection || 0;
  if (affection > 80) probability += 0.3;
  else if (affection > 60) probability += 0.2;
  else if (affection > 40) probability += 0.1;

  // 性格加成
  if (npc.traits?.includes('粘人') || npc.traits?.includes('重情重义')) {
    probability += 0.2;
  }
  if (npc.traits?.includes('高冷') || npc.traits?.includes('孤僻')) {
    probability -= 0.2;
  }

  return Math.random() < Math.max(0.1, Math.min(0.9, probability));
}

/**
 * 确定NPC与玩家的关系
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @returns {string}
 */
export function determineRelation(npc, player) {
  if (npc.id === player.spouse?.id) return 'spouse';
  if (player.children?.some(c => c.id === npc.id)) return 'child';
  if (npc.affection > 60) return 'friend';
  return 'default';
}

/**
 * 创建死亡通知消息（立即生成，不异步）
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameTime - 游戏时间
 * @returns {Object}
 */
export function createObituaryMessage(npc, player, gameTime) {
  const relation = determineRelation(npc, player);
  const content = generateObituaryContent(npc, player, gameTime, relation);

  let title = '绝笔';
  if (relation === 'child') title = `${npc.name}的遗言`;
  else if (relation === 'spouse') title = `${npc.name}的诀别`;
  else if (relation === 'friend') title = `${npc.name}的最后留言`;

  return createMessage({
    type: MESSAGE_TYPES.OBITUARY,
    senderId: npc.id,
    senderName: npc.name,
    title,
    content,
    timestamp: { ...gameTime },
    extras: {
      npcId: npc.id,
      relation,
      deathCause: npc.deathCause || '不详',
    },
    status: MESSAGE_STATUS.READY,
  });
}

/**
 * 创建家书消息（支持AI生成）
 * @param {Object} npc - NPC对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameTime - 游戏时间
 * @param {boolean} immediate - 是否立即生成内容
 * @param {Object} settings - 设置对象（包含AI配置）
 * @returns {Promise<Object>|Object}
 */
export async function createLetterMessage(npc, player, gameTime, immediate = true, settings = {}) {
  const relation = determineRelation(npc, player);

  let title = '来信';
  if (relation === 'child') title = '子女家书';
  else if (relation === 'spouse') title = '道侣传书';
  else if (relation === 'friend') title = '好友来信';

  let content = '';
  
  if (immediate) {
    // 检查是否使用AI生成
    const useAI = settings.useAIForLetter && settings.apiKey && settings.apiKey.trim().length > 0;
    
    if (useAI) {
      try {
        content = await generateLetterContentWithAI(npc, player, gameTime, relation, settings);
      } catch (error) {
        console.error('AI生成失败，使用模板:', error);
        content = generateLetterContent(npc, player, gameTime, relation);
      }
    } else {
      content = generateLetterContent(npc, player, gameTime, relation);
    }
  }

  const message = createMessage({
    type: MESSAGE_TYPES.LETTER,
    senderId: npc.id,
    senderName: npc.name,
    title: `${npc.name}的${title}`,
    content,
    timestamp: { ...gameTime },
    extras: {
      npcId: npc.id,
      relation,
    },
    status: immediate ? MESSAGE_STATUS.READY : MESSAGE_STATUS.PENDING,
  });

  return message;
}

export default MessageManager;
