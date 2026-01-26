# NPC 日志系统快速使用指南

## 🎮 玩家指南

### 如何查看 NPC 日志？

1. **点击任意 NPC 卡片**，打开详情页面
2. **滚动到底部**，找到"📖 查看 XX 的日志"按钮
3. **点击按钮**，进入日志查看界面

### 日志界面功能

#### 筛选按钮
- **📚 全部**：显示所有日志
- **💬 互动**：只显示与你的互动记录（闲聊、赠礼、切磋等）
- **⚡ 大事**：重大事件（突破、结婚、生子等）
- **📖 日常**：NPC 的日常生活记录

#### 日志类型标识
- 💬 绿色 = 互动日志
- ⚡ 红色 = 重大事件
- 📖 蓝色 = 日常记录
- 🔒 锁标 = 私密日志（需 80+ 好感度）

### 如何解锁私密日志？

将与 NPC 的好感度提升至 **80 以上**，即可查看：
- 暗恋心事
- 双修记录
- 内心挣扎
- 临终遗憾

---

## 🔧 开发者指南

### 添加新的日志模板

**位置**：`src/data/logTemplates.js`

**步骤**：
1. 找到对应的模板数组（如 `chatTemplates.high`）
2. 添加新文本，使用占位符：
   ```javascript
   "{playerName}今日送了{giftName}，{gender_ta}真是有心了。"
   ```
3. 保存即可，系统会自动随机选择

**可用占位符**：
- `{playerName}` - 玩家名字
- `{npcName}` - NPC 名字
- `{gender_ta}` - 性别代词（他/她）
- `{giftName}` - 礼物名称
- `{newTier}` - 新境界
- `{spouseName}` - 配偶名字
- `{childName}` - 孩子名字

### 手动触发日志生成

```javascript
import { 
  generateChatLog, 
  generateGiftLog,
  generateBreakthroughLog 
} from './game/npcLogSystem.js';

// 生成闲聊日志
const updatedNpc = generateChatLog(npc, player, year, month);

// 生成赠礼日志
const updatedNpc = generateGiftLog(npc, player, year, month, '灵石', true);

// 生成突破日志
const updatedNpc = generateBreakthroughLog(npc, player, year, month, true, '筑基期');
```

### 查询日志

```javascript
import { 
  getVisibleLogs, 
  getLogsByType,
  getRecentLogs 
} from './game/npcLogSystem.js';

// 根据好感度获取可见日志
const logs = getVisibleLogs(npc, playerAffection);

// 只获取互动日志
const interactionLogs = getLogsByType(npc, LOG_TYPE.INTERACTION);

// 获取最近 10 条
const recentLogs = getRecentLogs(npc, 10);
```

---

## 💡 创意玩法建议

### 1. 日记收集
- 收集所有 NPC 的日志，拼凑出完整的宗门故事

### 2. 暗恋侦探
- 通过观察日志，发现哪些 NPC 暗恋你

### 3. 心理分析
- 根据日志内容，判断 NPC 的性格和喜好

### 4. 情感反馈
- 看到 NPC 因为你的行为而开心/难过，增强代入感

---

## 📖 示例场景

### 场景 1：发现暗恋
**操作**：与某个温柔 NPC 频繁互动，好感达到 85
**结果**：解锁她的私密日志，发现她一直在默默关注你

**日志内容**：
> "今日在坊市远远看到一个背影很像{playerName}，追上去却认错人了，怅然若失。"

### 场景 2：巧合的惊喜
**NPC 日志（上个月）**：
> "最近修炼遇到瓶颈，若能有一颗筑基丹就好了..."

**玩家行动（本月）**：
恰好送了筑基丹

**NPC 日志（本月）**：
> "{playerName}竟然送我筑基丹！此物我寻觅已久，{gender_ta}真是有心了！"

### 场景 3：病娇警告
**操作**：与病娇 NPC 好感达到 80，解锁私密日志
**日志内容**：
> "偷偷去看了{playerName}一眼，{gender_ta}身边那个人是谁？真想杀掉..."

---

## ⚠️ 注意事项

1. **旧存档兼容**：从旧存档加载后，NPC 会从当前月开始记录日志，之前的月份没有记录是正常的

2. **日志上限**：每个 NPC 最多保留 50 条日志，旧记录会自动清理

3. **好感度门槛**：私密日志需要 80+ 好感才能查看，请持续互动提升关系

4. **文本随机**：同一事件可能生成不同文本，这是设计的一部分，增加真实感

---

**祝你玩得开心！发现 NPC 们的秘密吧 🔍**
