// 记忆宫殿系统 - Memory Palace System
// 让 LLM "记得" NPC 经历的一切重要事情

/**
 * 记忆层级枚举
 */
export const MemoryType = {
  MILESTONE: "milestone",      // 人生里程碑（永久记忆）
  RECENT: "recent",           // 近期事件流（短期记忆）
  SUMMARY: "summary"          // 长期摘要（压缩记忆）
};

/**
 * 情感烙印等级
 */
export const EmotionalImpact = {
  UNFORGETTABLE: "刻骨铭心",  // 生子、结缘、生死关头
  PROFOUND: "深刻",           // 重伤、突破境界
  SIGNIFICANT: "重要",        // 结拜、拜师
  NOTABLE: "值得记住"         // 送珍贵礼物、一起战斗
};

/**
 * 初始化 NPC 记忆结构
 * @param {Object} npc - NPC 对象
 * @returns {Object} 带有记忆结构的 NPC
 */
export const initializeMemory = (npc) => {
  if (!npc.memories) {
    npc.memories = {
      // A. 基础档案（静态，不会改变）
      profile: {
        name: npc.name,
        personality: npc.personality?.label || "普通",
        identity: npc.identity || "修士",
        firstMeet: new Date().toISOString()
      },
      
      // B. 关系里程碑（核心记忆 - 重点！）
      milestones: [
        // 示例结构:
        // {
        //   id: 1,
        //   event: "为你生子",
        //   time: "天元5年春",
        //   detail: "难产，甚至为此损耗了修为，孩子取名张小凡",
        //   emotionalImpact: "刻骨铭心",
        //   category: "family",
        //   tags: ["生子", "牺牲", "爱"]
        // }
      ],
      
      // C. 近期事件流（短期记忆，最多保留 20 条）
      recentEvents: [
        // 示例结构:
        // {
        //   id: 1,
        //   description: "收到了玩家赠送的飞剑",
        //   time: Date,
        //   affectionChange: +10,
        //   context: "玩家正在讨好我"
        // }
      ],
      
      // D. 长期摘要（自动生成的压缩记忆）
      longTermSummary: "",
      
      // E. 元数据
      meta: {
        totalEvents: 0,
        lastSummaryTime: null,
        needsSummary: false
      }
    };
  }
  return npc;
};

/**
 * 添加里程碑记忆（重大人生节点）
 * @param {Object} npc 
 * @param {Object} milestone - { event, time, detail, emotionalImpact, category, tags }
 */
export const addMilestone = (npc, milestone) => {
  initializeMemory(npc);
  
  const newMilestone = {
    id: Date.now(),
    event: milestone.event,
    time: milestone.time || formatGameTime(),
    detail: milestone.detail,
    emotionalImpact: milestone.emotionalImpact || EmotionalImpact.SIGNIFICANT,
    category: milestone.category || "other", // family, relationship, cultivation, combat
    tags: milestone.tags || [],
    createdAt: new Date().toISOString()
  };
  
  npc.memories.milestones.push(newMilestone);
  console.log(`[记忆系统] ${npc.name} 新增里程碑: ${milestone.event}`);
  
  return newMilestone;
};

/**
 * 记录近期事件
 * @param {Object} npc 
 * @param {Object} event - { description, affectionChange, context }
 */
export const recordRecentEvent = (npc, event) => {
  initializeMemory(npc);
  
  const newEvent = {
    id: Date.now(),
    description: event.description,
    time: new Date().toISOString(),
    affectionChange: event.affectionChange || 0,
    context: event.context || ""
  };
  
  npc.memories.recentEvents.push(newEvent);
  npc.memories.meta.totalEvents++;
  
  // 保持最多 20 条近期事件
  if (npc.memories.recentEvents.length > 20) {
    npc.memories.recentEvents.shift();
  }
  
  // 检查是否需要生成摘要（每 50 个事件）
  if (npc.memories.meta.totalEvents % 50 === 0) {
    npc.memories.meta.needsSummary = true;
  }
  
  return newEvent;
};

/**
 * 提取记忆用于 Prompt 构建
 * @param {Object} npc 
 * @param {Object} options - { includeMilestones, includeRecent, maxRecent, contextKeywords }
 * @returns {string} 格式化的记忆文本
 */
export const extractMemories = (npc, options = {}) => {
  const {
    includeMilestones = true,
    includeRecent = true,
    maxRecent = 5,
    contextKeywords = [] // 用于触发特定记忆的关键词
  } = options;
  
  initializeMemory(npc);
  let memoryText = "";
  
  // 1. 提取里程碑记忆
  if (includeMilestones && npc.memories.milestones.length > 0) {
    memoryText += "\n\n【刻骨铭心的记忆】\n";
    
    // 按情感烙印等级排序（最深刻的排前面）
    const sortedMilestones = [...npc.memories.milestones].sort((a, b) => {
      const impactOrder = {
        "刻骨铭心": 4,
        "深刻": 3,
        "重要": 2,
        "值得记住": 1
      };
      return (impactOrder[b.emotionalImpact] || 0) - (impactOrder[a.emotionalImpact] || 0);
    });
    
    sortedMilestones.forEach((m, index) => {
      memoryText += `${index + 1}. **${m.event}**（${m.time}）\n   ${m.detail}\n   情感烙印：${m.emotionalImpact}\n`;
    });
  }
  
  // 2. 提取近期事件
  if (includeRecent && npc.memories.recentEvents.length > 0) {
    memoryText += "\n【近期经历】\n";
    const recentSlice = npc.memories.recentEvents.slice(-maxRecent);
    recentSlice.forEach((e) => {
      const timeAgo = getTimeAgo(e.time);
      memoryText += `- ${timeAgo}: ${e.description}`;
      if (e.affectionChange !== 0) {
        memoryText += ` (好感度${e.affectionChange > 0 ? '+' : ''}${e.affectionChange})`;
      }
      memoryText += "\n";
    });
  }
  
  // 3. 关键词触发特定记忆
  if (contextKeywords.length > 0) {
    const triggeredMilestones = npc.memories.milestones.filter(m => 
      contextKeywords.some(keyword => 
        m.event.includes(keyword) || 
        m.detail.includes(keyword) || 
        m.tags.includes(keyword)
      )
    );
    
    if (triggeredMilestones.length > 0) {
      memoryText += "\n【相关回忆被唤起】\n";
      triggeredMilestones.forEach(m => {
        memoryText += `想起了${m.time}${m.event}的往事...${m.detail}\n`;
      });
    }
  }
  
  // 4. 添加长期摘要（如果存在）
  if (npc.memories.longTermSummary) {
    memoryText += `\n【往事概述】\n${npc.memories.longTermSummary}\n`;
  }
  
  return memoryText;
};

/**
 * 生成长期记忆摘要（需要调用 AI）
 * @param {Object} npc 
 * @param {Function} aiSummarizer - AI 摘要函数
 * @returns {Promise<string>}
 */
export const generateMemorySummary = async (npc, aiSummarizer) => {
  initializeMemory(npc);
  
  if (npc.memories.recentEvents.length === 0) {
    return "";
  }
  
  // 构建需要摘要的事件文本
  const eventsText = npc.memories.recentEvents
    .map(e => `${formatTime(e.time)}: ${e.description}`)
    .join("\n");
  
  try {
    // 调用 AI 进行摘要（需要传入 AI 摘要函数）
    const summary = await aiSummarizer(eventsText, {
      maxLength: 150,
      style: "narrative" // 叙事风格
    });
    
    // 更新摘要并清空已摘要的事件
    npc.memories.longTermSummary = summary;
    npc.memories.recentEvents = [];
    npc.memories.meta.lastSummaryTime = new Date().toISOString();
    npc.memories.meta.needsSummary = false;
    
    console.log(`[记忆系统] ${npc.name} 的记忆已压缩为摘要`);
    return summary;
    
  } catch (error) {
    console.error("生成记忆摘要失败:", error);
    return "";
  }
};

/**
 * 检测关键词并返回建议的记忆标签
 * @param {string} text - 对话内容
 * @returns {Array<string>} 关键词列表
 */
export const detectContextKeywords = (text) => {
  const keywordMap = {
    family: ["孩子", "子女", "儿子", "女儿", "父亲", "母亲", "爹娘", "孕", "怀孕", "生子", "诞下"],
    relationship: ["道侣", "结缘", "婚配", "夫妻", "爱", "情", "思念", "想念"],
    cultivation: ["突破", "境界", "修炼", "功法", "灵力", "渡劫", "飞升"],
    combat: ["战斗", "厮杀", "受伤", "重伤", "生死", "救命", "护你"],
    emotion: ["疼", "痛", "苦", "难", "后悔", "幸福", "快乐", "悲伤"]
  };
  
  const detected = [];
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => text.includes(kw))) {
      detected.push(...keywords.filter(kw => text.includes(kw)));
    }
  }
  
  return [...new Set(detected)]; // 去重
};

/**
 * 智能推荐：将事件升级为里程碑
 * @param {Object} npc 
 * @param {Object} event - 近期事件对象
 * @returns {boolean} 是否成功升级
 */
export const promoteToMilestone = (npc, event, customDetail = null) => {
  initializeMemory(npc);
  
  // 查找事件
  const eventIndex = npc.memories.recentEvents.findIndex(e => e.id === event.id);
  if (eventIndex === -1) return false;
  
  const targetEvent = npc.memories.recentEvents[eventIndex];
  
  // 转换为里程碑
  const milestone = {
    event: targetEvent.description,
    time: formatTime(targetEvent.time),
    detail: customDetail || targetEvent.context || "此事意义深远",
    emotionalImpact: Math.abs(targetEvent.affectionChange) >= 20 
      ? EmotionalImpact.PROFOUND 
      : EmotionalImpact.SIGNIFICANT,
    category: "other",
    tags: detectContextKeywords(targetEvent.description)
  };
  
  addMilestone(npc, milestone);
  
  // 从近期事件中移除
  npc.memories.recentEvents.splice(eventIndex, 1);
  
  console.log(`[记忆系统] 事件已升级为里程碑: ${targetEvent.description}`);
  return true;
};

// ==================== 工具函数 ====================

/**
 * 格式化游戏时间（可以根据游戏实际时间系统调整）
 * @returns {string}
 */
const formatGameTime = () => {
  // 这里简化处理，实际可以接入游戏的时间系统
  const year = 5; // 假设天元5年
  const season = ["春", "夏", "秋", "冬"][Math.floor(Math.random() * 4)];
  return `天元${year}年${season}`;
};

/**
 * 格式化时间戳
 * @param {string|Date} time 
 * @returns {string}
 */
const formatTime = (time) => {
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * 计算相对时间（多久之前）
 * @param {string|Date} time 
 * @returns {string}
 */
const getTimeAgo = (time) => {
  const now = new Date();
  const past = new Date(time);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "刚才";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatTime(time);
};

// ==================== 预设记忆模板 ====================

/**
 * 快捷添加"生子"里程碑
 * @param {Object} npc 
 * @param {Object} child - 子女对象
 * @param {Object} options - { difficulty: "难产"|"顺利", sacrifice: boolean }
 */
export const addBirthMilestone = (npc, child, options = {}) => {
  const { difficulty = "顺利", sacrifice = false } = options;
  
  let detail = `为你诞下${child.name}`;
  if (difficulty === "难产") {
    detail += "，历经生死劫难";
    if (sacrifice) {
      detail += "，甚至为此损耗了修为根基";
    }
  } else {
    detail += "，母子平安";
  }
  
  detail += `。看着孩儿一天天长大，${sacrifice ? '当年的痛，便都不算什么了' : '心中满是喜悦'}。`;
  
  return addMilestone(npc, {
    event: "为你生子",
    detail: detail,
    emotionalImpact: EmotionalImpact.UNFORGETTABLE,
    category: "family",
    tags: ["生子", "孩子", child.name, sacrifice ? "牺牲" : "幸福"]
  });
};

/**
 * 快捷添加"结为道侣"里程碑
 * @param {Object} npc 
 * @param {string} place - 结缘地点
 */
export const addMarriageMilestone = (npc, place = "天都峰") => {
  return addMilestone(npc, {
    event: "与你结为道侣",
    detail: `在${place}立下誓言，愿与你共度余生，生死相依，永不分离。`,
    emotionalImpact: EmotionalImpact.UNFORGETTABLE,
    category: "relationship",
    tags: ["道侣", "结缘", "婚配", "誓言"]
  });
};

/**
 * 快捷添加"生死时刻"里程碑
 * @param {Object} npc 
 * @param {string} situation - 情况描述
 */
export const addLifeDeathMilestone = (npc, situation) => {
  return addMilestone(npc, {
    event: "生死攸关的时刻",
    detail: situation,
    emotionalImpact: EmotionalImpact.UNFORGETTABLE,
    category: "combat",
    tags: ["生死", "救命", "患难"]
  });
};

// ==================== 导出所有功能 ====================

export default {
  MemoryType,
  EmotionalImpact,
  initializeMemory,
  addMilestone,
  recordRecentEvent,
  extractMemories,
  generateMemorySummary,
  detectContextKeywords,
  promoteToMilestone,
  // 快捷函数
  addBirthMilestone,
  addMarriageMilestone,
  addLifeDeathMilestone
};
