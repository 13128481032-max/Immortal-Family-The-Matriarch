// 记忆系统使用示例
// 演示如何在游戏中使用记忆宫殿系统

import MemoryManager from '../game/memoryManager.js';
import { addMilestone, recordRecentEvent, EmotionalImpact } from '../game/memorySystem.js';

// ==================== 示例 1: 生子记忆 ====================

/**
 * 当 NPC 生下孩子时（已集成到 App.jsx）
 */
function exampleChildBirth() {
  const npc = { id: 1, name: "陆昭", gender: "男" };
  const child = { id: 101, name: "张小凡", gender: "男" };
  
  // 自动记录里程碑
  MemoryManager.onChildBirth(npc, child, {
    difficulty: "难产",  // "难产" | "顺利"
    sacrifice: true      // 是否损耗修为
  });
  
  // 结果: npc.memories.milestones 中会新增：
  // {
  //   event: "为你生子",
  //   detail: "为你诞下张小凡，历经生死劫难，甚至为此损耗了修为根基。当年的痛，便都不算什么了。",
  //   emotionalImpact: "刻骨铭心",
  //   tags: ["生子", "孩子", "张小凡", "牺牲"]
  // }
}

// ==================== 示例 2: 对话效果演示 ====================

/**
 * 玩家与 NPC 对话时的记忆加载流程
 */
function exampleDialogue() {
  // 假设玩家问："你后悔吗？"
  const userMessage = "你后悔吗？";
  
  // ChatInterface 组件会自动：
  // 1. 检测关键词："后悔"
  // 2. 从 npc.memories.milestones 中提取相关记忆
  // 3. 构建 System Prompt:
  
  /*
  【刻骨铭心的记忆】
  1. **为你生子**（天元5年春）
     为你诞下张小凡，历经生死劫难，甚至为此损耗了修为根基。当年的痛，便都不算什么了。
     情感烙印：刻骨铭心
  
  ⚠️ 玩家在询问你的感受和态度，请结合你们的过往经历真诚地回应。
  */
  
  // 4. AI 据此生成回复:
  // "看着小凡一天天长大，当年的痛，便都不算什么了。"
  
  console.log("AI 会带着真实记忆回应，而不是空洞的客套话");
}

// ==================== 示例 3: 送珍贵礼物 ====================

/**
 * 当玩家送贵重礼物时（已集成到 App.jsx）
 */
function exampleExpensiveGift() {
  const npc = { id: 1, name: "陆昭" };
  const item = { name: "紫霄神剑", tier: 5, cost: 10000 };
  const affectionChange = 25;
  
  // 自动判断：好感度变化 >= 20，升级为里程碑
  MemoryManager.onReceiveGift(npc, item, affectionChange);
  
  // 结果: 会同时记录：
  // - 近期事件: "收到你赠送的紫霄神剑"
  // - 里程碑: "收到珍贵的紫霄神剑（这份心意我永远记在心里）"
}

// ==================== 示例 4: 普通礼物 ====================

function exampleNormalGift() {
  const npc = { id: 1, name: "陆昭" };
  const item = { name: "疗伤丹", tier: 1, cost: 50 };
  const affectionChange = 5;
  
  // 只记录到近期事件，不会升级为里程碑
  MemoryManager.onReceiveGift(npc, item, affectionChange);
  
  // 结果: npc.memories.recentEvents 新增一条普通记录
}

// ==================== 示例 5: 子女成婚 ====================

function exampleChildMarriage() {
  const parentNpc = { id: 1, name: "陆昭" };
  const child = { id: 101, name: "张小凡" };
  const spouse = { name: "碧瑶" };
  
  MemoryManager.onChildMarriage(parentNpc, child, spouse.name);
  
  // 结果: 里程碑记录
  // "张小凡成亲 - 看着张小凡与碧瑶结为道侣，既欣慰又感慨岁月流逝。"
}

// ==================== 示例 6: 自定义里程碑 ====================

/**
 * 如果你想记录特殊事件，可以手动添加
 */
function exampleCustomMilestone() {
  const npc = { id: 1, name: "陆昭" };
  
  addMilestone(npc, {
    event: "与你共闯禁地",
    time: "天元3年秋",
    detail: "在上古遗迹中，我们九死一生。你为我挡下致命一击，险些陨落。这份恩情，我永生难忘。",
    emotionalImpact: EmotionalImpact.UNFORGETTABLE,
    category: "combat",
    tags: ["禁地", "救命", "生死与共", "上古遗迹"]
  });
}

// ==================== 示例 7: 查看 NPC 记忆 ====================

function exampleViewMemories() {
  const npc = { id: 1, name: "陆昭" };
  
  // 获取记忆摘要
  const summary = MemoryManager.getMemorySummary(npc);
  
  console.log(`${npc.name} 的记忆:`);
  console.log(`- 里程碑: ${summary.milestoneCount} 个`);
  console.log(`- 近期事件: ${summary.recentEventCount} 条`);
  console.log(`- 总事件数: ${summary.totalEvents} 个`);
  
  // 详细查看
  summary.milestones.forEach(m => {
    console.log(`[${m.emotionalImpact}] ${m.event} - ${m.detail}`);
  });
}

// ==================== 示例 8: 关键词触发演示 ====================

/**
 * 演示关键词如何触发记忆
 */
function exampleKeywordTrigger() {
  const npc = {
    id: 1,
    name: "陆昭",
    memories: {
      milestones: [
        {
          event: "为你生子",
          detail: "难产，损耗修为，孩子取名张小凡",
          tags: ["生子", "孩子", "张小凡", "牺牲"]
        }
      ]
    }
  };
  
  // 玩家输入
  const userInputs = [
    "你记得当年生孩子的事吗？",  // 关键词: "生"、"孩子"
    "那次难产你受苦了吧？",      // 关键词: "难产"、"苦"
    "小凡现在怎么样？",          // 关键词: "小凡"（子女名字）
  ];
  
  userInputs.forEach(input => {
    // detectContextKeywords 会自动提取关键词
    // extractMemories 会匹配并唤起相关记忆
    console.log(`用户: ${input}`);
    console.log(`→ 系统会唤起"生子"相关的记忆`);
    console.log(`→ AI 会结合记忆回复，而不是空洞的"我不记得了"`);
  });
}

// ==================== 示例 9: 完整对话流程 ====================

/**
 * 完整演示：从生子到对话
 */
async function exampleCompleteFlow() {
  // 第 1 步: 游戏中发生了生子事件
  const npc = { id: 1, name: "陆昭", gender: "男" };
  const child = { id: 101, name: "张小凡", age: 0 };
  
  MemoryManager.onChildBirth(npc, child, {
    difficulty: "难产",
    sacrifice: true
  });
  
  console.log("✅ 生子记忆已记录");
  
  // 第 2 步: 几个月后，玩家点击"对话"
  // ChatInterface 组件会调用 buildSystemPrompt(npc, player, gameState, "")
  // 里程碑会被自动提取并注入
  
  // 第 3 步: 玩家输入 "你后悔吗？"
  const userMessage = "你后悔吗？";
  
  // buildSystemPrompt 会检测到关键词"后悔"
  // 添加指令: "请结合过往经历真诚回应"
  
  // 第 4 步: AI 回复
  // "看着小凡一天天长大，当年损耗修为、九死一生的痛，便都不算什么了。"
  
  console.log("✅ 对话中AI自然地提到了生子的经历");
}

// ==================== 示例 10: 记忆数据查看 ====================

/**
 * 在控制台查看 NPC 的完整记忆结构
 */
function exampleInspectMemory() {
  const npc = { id: 1, name: "陆昭" };
  
  // 初始化记忆
  MemoryManager.initializeAllNpcs([npc]);
  
  // 添加一些测试数据
  MemoryManager.onChildBirth(npc, { name: "张小凡" }, { difficulty: "难产", sacrifice: true });
  MemoryManager.onMarriage(npc, "天都峰");
  
  // 查看完整结构
  console.log("NPC 记忆结构:", JSON.stringify(npc.memories, null, 2));
  
  /*
  输出示例:
  {
    "profile": {
      "name": "陆昭",
      "personality": "坚韧",
      "firstMeet": "2026-01-26T..."
    },
    "milestones": [
      {
        "id": 1738056789123,
        "event": "为你生子",
        "time": "天元5年春",
        "detail": "...",
        "emotionalImpact": "刻骨铭心",
        "category": "family",
        "tags": ["生子", "孩子", "张小凡", "牺牲"]
      },
      {
        "event": "与你结为道侣",
        ...
      }
    ],
    "recentEvents": [...],
    "longTermSummary": "",
    "meta": {
      "totalEvents": 2,
      "needsSummary": false
    }
  }
  */
}

// ==================== 实际集成清单 ====================

/**
 * 你需要在以下位置调用记忆系统:
 * 
 * ✅ 已集成:
 * - App.jsx: 生子时（handleNextMonth）
 * - App.jsx: 怀孕开始时（handleNegotiateConfirm）
 * - App.jsx: 送礼时（handleGiftConfirm）
 * - App.jsx: 子女成婚时（handleMarry）
 * - App.jsx: 子女拜师时（handleAssignSect）
 * - App.jsx: 游戏初始化时（useEffect 补录）
 * - ChatInterface: 对话时自动提取记忆
 * 
 * 🔜 可选集成:
 * - 战斗系统: 调用 MemoryManager.onCombatTogether(npc, enemyName, wasRescued)
 * - 突破系统: 调用 MemoryManager.onBreakthrough(npc, newTier)
 * - 特殊剧情: 手动调用 addMilestone() 添加自定义记忆
 */

// ==================== 测试函数 ====================

/**
 * 完整测试流程（可以在浏览器控制台运行）
 */
export function testMemorySystem() {
  console.log("=== 开始测试记忆系统 ===");
  
  const testNpc = { 
    id: 999, 
    name: "测试NPC",
    gender: "男",
    personality: { label: "温柔" }
  };
  
  // 1. 初始化
  MemoryManager.initializeAllNpcs([testNpc]);
  console.log("✅ 初始化完成");
  
  // 2. 添加生子记忆
  MemoryManager.onChildBirth(testNpc, { name: "测试子女" }, {
    difficulty: "难产",
    sacrifice: true
  });
  console.log("✅ 生子记忆已添加");
  
  // 3. 添加送礼记录
  MemoryManager.onReceiveGift(testNpc, { name: "飞剑", tier: 3 }, 15);
  console.log("✅ 送礼记录已添加");
  
  // 4. 查看记忆
  const summary = MemoryManager.getMemorySummary(testNpc);
  console.log(`📊 记忆统计:`, summary);
  
  // 5. 模拟对话（带关键词触发）
  console.log("\n=== 模拟对话 ===");
  console.log("玩家: 你还记得当年生孩子的事吗？");
  console.log("→ 系统检测到关键词: ['孩子', '生']");
  console.log("→ 唤起记忆: 为你生子（难产、牺牲）");
  console.log("→ AI回复: (带有真实记忆的深情回复)");
  
  console.log("\n=== 测试完成 ===");
  return testNpc;
}

// 导出供控制台使用
if (typeof window !== 'undefined') {
  window.testMemorySystem = testMemorySystem;
}

export default {
  exampleChildBirth,
  exampleDialogue,
  exampleExpensiveGift,
  exampleNormalGift,
  exampleChildMarriage,
  exampleCustomMilestone,
  exampleViewMemories,
  exampleKeywordTrigger,
  exampleCompleteFlow,
  testMemorySystem
};
