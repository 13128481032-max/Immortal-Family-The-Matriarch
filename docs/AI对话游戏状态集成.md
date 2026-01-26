# AI对话游戏状态集成指南

## 📋 概述

本文档说明如何让AI对话系统实时读取游戏状态，使NPC能够了解与玩家的关系历史、子女信息、重要事件等。

## 🎯 功能特性

AI现在可以自动获取以下游戏状态信息：

### 1. **道侣关系** 🌹
- 检测是否已结为道侣（好感度≥90或关系阶段≥3）
- AI会知道你们是伴侣关系，对话时表现出相应的亲密度

### 2. **子女信息** 👶
- 自动识别与当前NPC共同养育的子女
- 包含每个孩子的详细信息：
  - 姓名、年龄、修为境界
  - 是否拜入宗门
  - 是否已婚配
  - 特殊天赋特质

### 3. **怀孕状态** 🥚
- 检测NPC是否正在孕育子女
- 显示怀孕进度（月数）

### 4. **关系阶段** 💕
- 识别关系发展阶段（如见家长、订婚等）
- AI会根据关系深度调整对话语气

### 5. **事件历史** 📜
- 记录与该NPC的重要互动历史
- AI可以在对话中自然提及过往经历

## 🔧 技术实现

### 修改的文件

1. **`src/services/promptBuilder.js`**
   - 更新 `buildSystemPrompt()` 函数，新增 `gameState` 参数
   - 新增关系状态分析逻辑
   - 自动构建上下文信息

2. **`src/components/ChatInterface/index.jsx`**
   - 新增 `gameState` prop
   - 初始化时传递游戏状态到 Prompt

3. **`src/components/NpcDetailModal/index.jsx`**
   - 接收 `children` 和 `npcs` props
   - 构建并传递 gameState 对象

4. **`src/App.jsx`**
   - 向 NpcDetailModal 传递子女列表和NPC列表

### 数据流程

```
App.jsx (游戏主状态)
    ↓ 传递 children, npcs
NpcDetailModal
    ↓ 构建 gameState = { children, npcs }
ChatInterface
    ↓ 传递到 Prompt Builder
buildSystemPrompt(npc, player, gameState)
    ↓ 分析并构建上下文
AI API (获得完整的游戏状态信息)
```

## 💡 使用示例

### 示例 1: 对话时自动提及子女

**场景**: 你与道侣对话，已有两个孩子

**AI Prompt 会包含**:
```
【你们的关系】
你们已结为道侣，是彼此最亲密的伴侣。
你们共同养育了2个孩子：楚天明（5岁，炼气中期）、楚灵儿（3岁，凡人）。
子女近况：楚天明已拜入青云宗，天生【剑道天才】特质；楚灵儿正在修炼基础。
```

**AI可能的回应**:
> "夫君，天明在青云宗传来书信，说他在剑道上又有突破了。灵儿这几日也在认真修炼，我们的孩子都很争气呢。"

### 示例 2: 怀孕时的对话

**场景**: NPC正在孕育你们的孩子（6个月）

**AI Prompt 会包含**:
```
【你们的关系】
你正在孕育你们的孩子（已有6个月身孕）。
```

**AI可能的回应**:
> "夫君，腹中的孩儿今日又踢了我好几下，看来资质不凡啊。"

### 示例 3: 见家长后的对话

**场景**: 关系阶段2（已见家长但未结为道侣）

**AI Prompt 会包含**:
```
【你们的关系】
你们的关系已得到双方家长的认可。
```

**AI可能的回应**:
> "上次家父见了你，对你赞不绝口呢。"

## 🎨 自定义扩展

如果你想添加更多游戏状态信息，可以在以下位置修改：

### 添加新的状态信息

在 `src/services/promptBuilder.js` 的 `buildSystemPrompt` 函数中添加：

```javascript
// 示例：添加宗门信息
if (npc.sect && player.sect) {
  if (npc.sect.name === player.sect.name) {
    relationshipContext += `\n你们是同门师兄弟/姐妹，都在${npc.sect.name}修炼。`;
  } else {
    relationshipContext += `\n你在${npc.sect.name}修炼，而玩家在${player.sect.name}。`;
  }
}

// 示例：添加修为境界对比
const tierDiff = getTierLevel(npc.tier) - getTierLevel(player.tier);
if (tierDiff > 2) {
  relationshipContext += `\n你的修为远高于玩家，应当保持前辈的风范。`;
}
```

### 添加事件历史记录

在游戏中关键事件发生时，记录到 `gameState.eventHistory`：

```javascript
// 在 App.jsx 中
const recordEvent = (npcId, description) => {
  setEventHistory(prev => [...prev, {
    npcId: npcId,
    description: description,
    timestamp: Date.now()
  }]);
};

// 示例：记录结为道侣事件
recordEvent(npc.id, "你们在月光下结为道侣，海誓山盟");
```

## 🐛 故障排除

### AI没有提及子女信息

**检查清单**:
1. 确保 `children` 数组正确传递到 NpcDetailModal
2. 检查子女的 `parentId` 或 `fatherId/motherId` 字段是否正确
3. 在浏览器控制台查看 System Prompt 是否包含子女信息

### AI不知道已经结为道侣

**检查清单**:
1. 确认 `npc.relationship.stage >= 3` 或 `affection >= 90`
2. 确保 `npcs` 数组包含当前NPC且关系状态已更新

### 游戏状态更新但AI不知道

**原因**: `useEffect` 依赖项问题

**解决方案**: ChatInterface 的 useEffect 依赖项包含了 `gameState`，但由于对象引用变化，可能触发过多重渲染。建议在 NpcDetailModal 中使用 `useMemo` 来稳定 gameState 对象：

```javascript
const gameState = useMemo(() => ({
  children: children,
  npcs: npcs
}), [children, npcs]);
```

## 📝 最佳实践

1. **保持Prompt简洁**: 只传递相关的状态信息，避免Prompt过长
2. **及时更新状态**: 重要事件发生后立即更新游戏状态
3. **测试对话质量**: 不同关系阶段都要测试AI的回应是否合理
4. **记录重要事件**: 使用 eventHistory 记录关键互动，提升对话连贯性

## 🚀 未来扩展方向

- [ ] 添加情绪状态（开心、生气、忧伤等）
- [ ] 记录完整的对话历史摘要
- [ ] 支持多代家族关系（孙子辈）
- [ ] 添加宗门关系网络
- [ ] 记录共同经历的重要战斗/历练
- [ ] 支持季节和时间对对话的影响

---

**更新日期**: 2026年1月25日  
**版本**: v1.0  
**状态**: ✅ 已实现并验证
