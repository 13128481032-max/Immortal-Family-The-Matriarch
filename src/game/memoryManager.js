// 记忆管理器 - 集成到游戏引擎的工具函数
// 提供便捷的 API 用于在游戏事件中记录 NPC 记忆

import { 
  initializeMemory, 
  addMilestone, 
  recordRecentEvent,
  addBirthMilestone,
  addMarriageMilestone,
  addLifeDeathMilestone,
  EmotionalImpact 
} from './memorySystem.js';

/**
 * 游戏事件自动记忆录入器
 * 在游戏关键节点自动为 NPC 记录记忆
 */
export class MemoryManager {
  
  /**
   * 当 NPC 生子时调用
   * @param {Object} npc - NPC 对象
   * @param {Object} child - 子女对象
   * @param {Object} options - { difficulty: "难产"|"顺利", sacrifice: boolean }
   */
  static onChildBirth(npc, child, options = {}) {
    initializeMemory(npc);
    
    // 添加里程碑
    const milestone = addBirthMilestone(npc, child, options);
    
    // 同时记录到近期事件
    recordRecentEvent(npc, {
      description: `诞下${child.name}`,
      affectionChange: 0,
      context: `生产${options.difficulty === '难产' ? '艰难' : '顺利'}`
    });
    
    console.log(`[记忆管理器] ${npc.name} 已记录生子事件: ${child.name}`);
    return milestone;
  }
  
  /**
   * 当结为道侣时调用
   * @param {Object} npc 
   * @param {string} place 
   */
  static onMarriage(npc, place = "天都峰") {
    initializeMemory(npc);
    
    const milestone = addMarriageMilestone(npc, place);
    
    recordRecentEvent(npc, {
      description: `与你结为道侣`,
      affectionChange: 30,
      context: "立下誓言，永不分离"
    });
    
    console.log(`[记忆管理器] ${npc.name} 已记录结缘事件`);
    return milestone;
  }
  
  /**
   * 当送礼物时调用
   * @param {Object} npc 
   * @param {Object} item - 物品对象
   * @param {number} affectionChange - 好感度变化
   */
  static onReceiveGift(npc, item, affectionChange) {
    initializeMemory(npc);
    
    const event = recordRecentEvent(npc, {
      description: `收到你赠送的${item.name}`,
      affectionChange: affectionChange,
      context: item.tier >= 3 ? "这是珍贵的礼物" : "普通礼物"
    });
    
    // 如果是非常贵重的礼物（好感度变化大于20），升级为里程碑
    if (Math.abs(affectionChange) >= 20) {
      addMilestone(npc, {
        event: `收到珍贵的${item.name}`,
        detail: `你送我${item.name}，这份心意我永远记在心里。`,
        emotionalImpact: EmotionalImpact.SIGNIFICANT,
        category: "relationship",
        tags: ["礼物", item.name, "感动"]
      });
    }
    
    return event;
  }
  
  /**
   * 当一起战斗时调用
   * @param {Object} npc 
   * @param {string} enemyName - 敌人名字
   * @param {boolean} wasRescued - NPC 是否被救
   */
  static onCombatTogether(npc, enemyName, wasRescued = false) {
    initializeMemory(npc);
    
    if (wasRescued) {
      // 生死救援，升级为里程碑
      return addLifeDeathMilestone(npc, 
        `在与${enemyName}的殊死搏杀中，你奋不顾身救下了我。这份恩情，此生难忘。`
      );
    } else {
      // 普通并肩作战
      return recordRecentEvent(npc, {
        description: `与你并肩击败${enemyName}`,
        affectionChange: 5,
        context: "并肩作战"
      });
    }
  }
  
  /**
   * 当突破境界时调用
   * @param {Object} npc 
   * @param {string} newTier - 新境界名称
   */
  static onBreakthrough(npc, newTier) {
    initializeMemory(npc);
    
    return addMilestone(npc, {
      event: `突破至${newTier}`,
      detail: `历经万般磨难，终于突破桎梏，踏入${newTier}之境。`,
      emotionalImpact: EmotionalImpact.PROFOUND,
      category: "cultivation",
      tags: ["突破", "修炼", newTier]
    });
  }
  
  /**
   * 当怀孕时调用
   * @param {Object} npc 
   */
  static onPregnancyStart(npc) {
    initializeMemory(npc);
    
    return recordRecentEvent(npc, {
      description: `得知怀上了你的骨肉`,
      affectionChange: 15,
      context: "怀孕初期，心情复杂"
    });
  }
  
  /**
   * 当孩子拜入宗门时调用
   * @param {Object} npc - 父母 NPC
   * @param {Object} child - 子女对象
   * @param {string} sectName - 宗门名称
   */
  static onChildJoinSect(npc, child, sectName) {
    initializeMemory(npc);
    
    return recordRecentEvent(npc, {
      description: `${child.name}拜入${sectName}`,
      affectionChange: 0,
      context: "为人父母的骄傲与不舍"
    });
  }
  
  /**
   * 当子女成婚时调用
   * @param {Object} npc - 父母 NPC
   * @param {Object} child - 子女对象
   * @param {string} spouseName - 配偶名字
   */
  static onChildMarriage(npc, child, spouseName) {
    initializeMemory(npc);
    
    return addMilestone(npc, {
      event: `${child.name}成亲`,
      detail: `看着${child.name}与${spouseName}结为道侣，既欣慰又感慨岁月流逝。`,
      emotionalImpact: EmotionalImpact.SIGNIFICANT,
      category: "family",
      tags: ["子女", "婚配", child.name]
    });
  }
  
  /**
   * 批量初始化 NPCs 的记忆系统
   * @param {Array} npcs - NPC 数组
   */
  static initializeAllNpcs(npcs) {
    npcs.forEach(npc => {
      initializeMemory(npc);
    });
    console.log(`[记忆管理器] 已为 ${npcs.length} 个 NPC 初始化记忆系统`);
  }
  
  /**
   * 为已有子女的 NPC 补录历史记忆
   * @param {Object} npc 
   * @param {Array} children - 子女数组
   */
  static backfillChildrenMemories(npc, children) {
    initializeMemory(npc);
    
    children.forEach(child => {
      // 检查是否已存在该子女的记忆
      const hasMemory = npc.memories.milestones.some(m => 
        m.tags.includes(child.name)
      );
      
      if (!hasMemory) {
        addBirthMilestone(npc, child, {
          difficulty: "顺利",
          sacrifice: false
        });
        console.log(`[记忆管理器] 为 ${npc.name} 补录了 ${child.name} 的生子记忆`);
      }
    });
  }
  
  /**
   * 获取 NPC 的记忆摘要（用于 UI 展示）
   * @param {Object} npc 
   * @returns {Object} { milestones, recentEvents, summary }
   */
  static getMemorySummary(npc) {
    if (!npc.memories) {
      initializeMemory(npc);
    }
    
    return {
      milestoneCount: npc.memories.milestones.length,
      milestones: npc.memories.milestones,
      recentEventCount: npc.memories.recentEvents.length,
      recentEvents: npc.memories.recentEvents,
      longTermSummary: npc.memories.longTermSummary,
      totalEvents: npc.memories.meta.totalEvents
    };
  }
  
  /**
   * 清空某个 NPC 的所有记忆（慎用！）
   * @param {Object} npc 
   */
  static clearAllMemories(npc) {
    if (npc.memories) {
      npc.memories.milestones = [];
      npc.memories.recentEvents = [];
      npc.memories.longTermSummary = "";
      npc.memories.meta.totalEvents = 0;
      console.log(`[记忆管理器] 已清空 ${npc.name} 的所有记忆`);
    }
  }
}

export default MemoryManager;
