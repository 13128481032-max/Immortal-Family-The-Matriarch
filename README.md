# Shengzi - Cultivation Game

A React-based cultivation game inspired by Chinese xianxia novels.

## 🎮 Game Features

### 🧠 AI Memory Palace System (v1.0.1 - NEW!)
- **🏛️ Layered Memory Storage**: NPCs remember everything important
  - 💎 Milestones: Permanent memories (childbirth, marriage, life-death moments)
  - 📝 Recent Events: Short-term memory (last 20 interactions)
  - 📜 Long-term Summary: Compressed memories (auto-generated)
- **🎯 Intelligent Context Injection**: 
  - Keyword detection triggers relevant memories
  - Dynamic prompt construction based on conversation context
  - Emotional impact levels (Unforgettable, Profound, Significant)
- **💬 Enhanced Dialogue Quality**:
  - Before: "I don't regret it." (generic)
  - After: "Watching our child grow up, the pain of childbirth was all worth it." (specific & emotional)
- **🔄 Auto-Integration**: 
  - Automatically records memories during key game events
  - Backfills memories for existing save files
  - Zero additional code required
- **🔧 Backend-Only**: Runs in the background to enhance AI dialogue (no additional UI)

See [记忆系统快速开始](docs/记忆系统快速开始.md) for quick start guide.

### 🤖 AI Dialogue System (v1.1.0)
- **💬 Intelligent NPC Conversations**: Every NPC has a unique "soul" powered by LLM
  - Dynamic personality-based roleplay (Cold, Gentle, Yandere, etc.)
  - Affection-based attitude adjustments
  - Ancient Chinese/Xianxia linguistic style
  - Chat history memory system
- **🎮 Game State Integration**: AI now knows your relationship status
  - 👶 Recognizes your shared children (names, ages, cultivation levels)
  - 💕 Knows if you're married/partners
  - 🥚 Aware of pregnancy status and progress
  - 📜 Remembers important relationship milestones
  - 🎭 References children naturally in conversations
- **🔮 Easy Setup**: 
  - Support for DeepSeek, OpenAI, Tongyi Qianwen, and more
  - Low cost (~¥0.0003 per conversation with DeepSeek)
  - Player-configured API keys for privacy
- **🎭 Immersive Experience**:
  - Beautiful ancient-style chat UI
  - Auto-saved chat history per NPC
  - Seamless integration with NPC detail pages

See [AI对话系统使用指南](docs/AI对话系统使用指南.md) and [AI对话游戏状态集成](docs/AI对话游戏状态集成.md) for detailed setup.

### 🎭 Story System v2.0
- **🌹 Romance Events**: 20 romantic storylines based on NPC personality types
  - Cold/Restrained Type | Yandere/Possessive Type
  - Gentle/Loyal Type | Flirty/Charming Type
- **👨‍👩‍👧 Family Events**: 15 heartwarming parent-child stories
  - Toddler Period (0-10) | Teen Period (11-18) | Adult Period (18+)
- **🎯 Identity Events**: 21 unique storylines based on NPC identity
  - Sword Cultivator | Alchemist | Buddhist Monk
  - Demon Cultivator | Half-Demon | Healer | Musician

**v2.0 Major Update**:
- 🎲 All events now trigger through "Chat" button
- 📛 200+ name database (compound surnames, male/female names)
- 🏛️ 20 identity types (from 5 to 20)
- 🎭 20 personality types (from 5 to 20)
- 📖 56 total storylines (35 → 56, +60%)

See [剧情系统使用指南 v2.0](docs/剧情系统使用指南.md) for detailed guide.

### 🗺️ Roguelike Exploration
- Enter secret realms with your team
- 10 floors of random events (combat, encounters, choices)
- Boss fights and treasure rewards

### 👥 NPC Relationship System
- Chat, gift, and build relationships
- Unlock special events at high affection levels
- Propose and have children

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Project Structure

- `src/assets/`: Static assets like icons
- `src/components/`: UI components (Dashboard, FamilyTree, etc.)
- `src/data/`: Game data (initial player, NPCs, events)
- `src/game/`: Game logic (engine, mechanics, utils)
- `src/styles/`: CSS styles

## Build

```bash
npm run build
```

## Roguelike 秘境探险（Text Adventure）

- 入口：进入 ACTION 页 → 秘境探险 → 选择秘境与队伍 → 出发。
- 流程：秘境分层推进（默认 10 层），每层触发随机事件（战斗、奇遇、机缘、剧情抉择）。
- 战斗：事件选择“开始战斗”后自动结算，胜利可随机获得秘境掉落；失败则结束探险。
- Boss：最后一层触发镇守者战斗，胜利通关并返回。
- 日志：探险过程中的简要结果会记录在模态框底部日志区。