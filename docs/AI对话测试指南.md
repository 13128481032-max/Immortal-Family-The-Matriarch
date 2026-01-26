# AI对话系统游戏状态测试指南

## 🧪 如何测试AI是否能读取游戏状态

### 场景 1: 测试子女信息识别

**前置条件**：
1. 已有至少一个子女
2. 子女的 `fatherName` 字段包含NPC的名字

**测试步骤**：
1. 打开底部导航栏的【人脉】标签
2. 点击该NPC的卡片，打开详情弹窗
3. 切换到【传音】标签
4. 发送消息："我们的孩子怎么样？"

**期望结果**：
- AI会提及你们的孩子的名字
- AI可能会关心孩子的修炼进度或成长情况

**示例对话**：
```
玩家: 我们的孩子怎么样？
NPC AI: 天明在宗门修炼甚是勤奋，已是炼气中期了。为父甚是欣慰。
```

---

### 场景 2: 测试道侣关系识别

**前置条件**：
1. NPC的好感度 ≥ 90
2. 或者已触发过"结为道侣"的剧情事件

**测试步骤**：
1. 打开该NPC的详情弹窗
2. 切换到【传音】标签
3. 发送亲昵的称呼，如："夫君/娘子"

**期望结果**：
- AI会以道侣的身份回应
- 语气亲昵、关切

**示例对话**：
```
玩家: 夫君，今日修炼可有进展？
NPC AI: 娘子挂念，为夫今日小有突破。待我稳固境界，便来陪你。
```

---

### 场景 3: 测试怀孕状态识别

**前置条件**：
1. NPC 的 `isPregnant` 字段为 `true`
2. `pregnancyProgress` 字段有值（如 6）

**测试步骤**：
1. 打开该NPC的详情弹窗
2. 切换到【传音】标签
3. 发送消息："身体可还好？"

**期望结果**：
- AI会提及怀孕的事
- 可能会描述胎动、身体变化等

**示例对话**：
```
玩家: 身体可还好？
NPC AI: 多谢夫君挂念，腹中小儿今日又踢了我好几下，看来是个调皮的。
```

---

### 场景 4: 测试子女成年、婚配状态

**前置条件**：
1. 有子女年满18岁（216个月）
2. 已为该子女安排婚事，`child.spouse` 字段有值

**测试步骤**：
1. 打开父或母NPC的详情弹窗
2. 切换到【传音】标签
3. 询问子女的婚事

**期望结果**：
- AI知道子女已婚配
- 可能会提及儿媳/女婿的名字

**示例对话**：
```
玩家: 天明的婚事办得如何？
NPC AI: 天明娶了李家的灵儿为妻，两人琴瑟和鸣，我们可以放心了。
```

---

## 🔍 调试技巧

### 查看System Prompt内容

如果AI没有按预期回应，可以在浏览器控制台查看System Prompt：

1. 按 `F12` 打开开发者工具
2. 切换到 `Console` 标签
3. 在 ChatInterface 初始化时，临时添加日志输出：

```javascript
// 在 ChatInterface/index.jsx 的 useEffect 中添加
useEffect(() => {
  const systemPrompt = {
    role: "system",
    content: buildSystemPrompt(npc, player, gameState)
  };
  
  console.log("=== System Prompt ===");
  console.log(systemPrompt.content);
  console.log("=====================");
  
  // ... 其他代码
}, [npc.id, npc, player, gameState]);
```

4. 重新打开聊天界面，查看控制台输出的Prompt

### 常见问题排查

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| AI不知道有孩子 | `children` 数组未正确传递 | 检查 App.jsx → NpcDetailModal 的 props |
| 子女信息不匹配 | `fatherName` 字段不正确 | 检查 `generateChild()` 生成的数据 |
| AI不知道怀孕 | `npc.isPregnant` 为 false | 检查游戏时间推进逻辑 |
| Prompt过长导致错误 | 子女太多或历史事件太多 | 在 promptBuilder 中限制数量 |

---

## 📊 数据检查清单

使用浏览器控制台检查数据：

```javascript
// 检查NPC列表
console.log("NPC列表:", npcs);

// 检查子女列表
console.log("子女列表:", children);

// 检查某个NPC的详细信息
const targetNpc = npcs.find(n => n.name === "某NPC名字");
console.log("NPC详情:", targetNpc);

// 检查与某NPC的子女
const targetChildren = children.filter(c => 
  c.fatherName === "某NPC名字" || c.motherName === "某NPC名字"
);
console.log("共同子女:", targetChildren);
```

---

## ✅ 成功标志

功能正常时，你应该看到：

1. **AI自然提及子女**：无需玩家明确询问，AI在合适时会谈论孩子
2. **态度符合关系**：好感度高时更亲昵，有子女时更有家庭感
3. **记忆连贯**：多轮对话中AI能记住之前提到的子女信息
4. **角色一致**：即使有了家庭，AI仍保持原有性格（如高冷、温柔等）

---

**测试时间**: 建议在游戏进行30-60个月后测试，此时可能已有子女出生并成长  
**更新日期**: 2026年1月25日
