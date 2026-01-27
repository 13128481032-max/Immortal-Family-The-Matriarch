// src/game/gazetteSystem.js
// 修真界邸报生成系统

import { fillNewsTemplate, generatePowerRanking } from '../data/newsTemplates';
import { sendMessageToAI } from '../services/aiService';
import { generateThreatWarning, updateRivalTimeline } from './revengeSystem';

/**
 * 生成本地模板版邸报（增强版 - 支持复仇系统优先级）
 * @param {Array} newsBuffer - 新闻事件缓存数组
 * @param {Object} player - 玩家数据
 * @param {Array} npcs - NPC列表
 * @param {Number} issue - 期号
 * @returns {Object} - 生成的邸报对象
 */
export function generateLocalGazette(newsBuffer, player, npcs, issue) {
  const headlines = [];
  const rumors = [];
  
  // ========== 优先级1：高威胁预警（Gameplay关键）==========
  const threatWarning = generateThreatWarning(player.rival);
  if (threatWarning) {
    const warningText = fillNewsTemplate(threatWarning.type, threatWarning.data);
    if (warningText) {
      headlines.unshift(warningText); // 强制置顶
    }
  }
  
  // ========== 优先级2：宿敌时间线事件 ==========
  const timelineEvent = updateRivalTimeline(player);
  if (timelineEvent) {
    const timelineText = fillNewsTemplate(timelineEvent.type, timelineEvent.data);
    if (timelineText) {
      headlines.unshift(timelineText); // 插入到头条前列
    }
  }
  
  // ========== 优先级3：玩家操作反馈（谣言、隐匿等）==========
  // 从 newsBuffer 中优先处理复仇相关事件
  const revengeEvents = [];
  const normalEvents = [];
  
  newsBuffer.forEach(event => {
    if (event.type.startsWith('RIVAL_')) {
      revengeEvents.push(event);
    } else {
      normalEvents.push(event);
    }
  });
  
  // 复仇事件优先放入头条
  revengeEvents.forEach(event => {
    const newsText = fillNewsTemplate(event.type, event.data);
    if (newsText) {
      headlines.push(newsText);
    }
  });

  // ========== 优先级4：日常新闻 ==========
  // 区分玩家相关和其他事件
  const playerRelatedEvents = [];
  const otherEvents = [];
  
  normalEvents.forEach(event => {
    // 判断是否与玩家相关
    const isPlayerRelated = event.data.actor === player.name || 
                           event.data.target === player.name ||
                           event.type === 'LEVEL_UP' || // 玩家突破
                           event.type === 'MARRIAGE' || // 玩家结婚
                           event.type === 'BIRTH' || // 玩家生子
                           event.type === 'COMBAT'; // 玩家战斗
    
    if (isPlayerRelated) {
      playerRelatedEvents.push(event);
    } else {
      otherEvents.push(event);
    }
  });
  
  // 计算需要的玩家新闻数量（按1:3比例，玩家新闻占25%）
  const totalNewsNeeded = 8; // 期望的总新闻数
  const playerNewsLimit = Math.ceil(totalNewsNeeded * 0.25); // 玩家新闻限制为2条
  const fillerNewsNeeded = Math.ceil(totalNewsNeeded * 0.75); // 填充新闻需要6条
  
  // 添加玩家相关事件（限制数量）
  let playerNewsCount = 0;
  playerRelatedEvents.forEach(event => {
    if (playerNewsCount < playerNewsLimit) {
      const newsText = fillNewsTemplate(event.type, event.data);
      if (newsText) {
        headlines.push(newsText);
        playerNewsCount++;
      }
    }
  });
  
  // 添加其他事件
  otherEvents.forEach(event => {
    const newsText = fillNewsTemplate(event.type, event.data);
    if (newsText) {
      if (headlines.length < 5) {
        headlines.push(newsText);
      } else {
        rumors.push(newsText);
      }
    }
  });

  // 添加填充新闻达到3:1比例
  const currentNewsCount = headlines.length + rumors.length;
  const fillersToAdd = Math.max(0, fillerNewsNeeded - (currentNewsCount - playerNewsCount));
  
  for (let i = 0; i < fillersToAdd; i++) {
    const fillerNews = fillNewsTemplate('FILLER', {});
    if (headlines.length < 5) {
      headlines.push(fillerNews);
    } else {
      rumors.push(fillerNews);
    }
  }

  // 生成天机榜
  const powerRanking = generatePowerRanking(npcs, player);

  return {
    issue,
    year: player.age,
    month: player.month || 1,
    headlines,
    rumors,
    powerRanking,
    timestamp: Date.now()
  };
}

/**
 * 使用AI生成邸报
 * @param {Array} newsBuffer - 新闻事件缓存数组
 * @param {Object} player - 玩家数据
 * @param {Array} npcs - NPC列表
 * @param {Number} issue - 期号
 * @param {Object} settings - 设置对象（包含apiKey等）
 * @returns {Promise<Object>} - 生成的邸报对象
 */
export async function generateAIGazette(newsBuffer, player, npcs, issue, settings) {
  try {
    // 准备事件描述
    let eventsDescription = '';
    if (newsBuffer.length === 0) {
      eventsDescription = '近期风平浪静，无重大事件发生。';
    } else {
      eventsDescription = newsBuffer.map((event, index) => {
        return `${index + 1}. ${formatEventForAI(event)}`;
      }).join('\n');
    }

    // 准备玩家信息
    const playerName = player.name || '楚清辞';
    const playerInfo = `主角：${playerName}（${player.tier || '凡人'}）`;
    
    // 构建 Prompt
    const messages = [{
      role: 'system',
      content: '你是修真界\'天机阁\'发行的《修真界邸报》主笔，擅长以幽默风趣、带有修仙风味的语言撰写八卦新闻。你特别关注主角的动向和成就。'
    }, {
      role: 'user',
      content: `请根据以下近期发生的事件，生成一份修真界邸报：

**主角信息：**
${playerInfo}

**近期事件列表：**
${eventsDescription}

**重要要求：**
1. 将最重要的3-5件事放入【头版头条】
2. 其余事件放入【坊间传闻】
3. 与${playerName}相关的新闻不超过2条，其他内容要丰富多样
4. 如果事件太少，可以适当添加一些江湖趣闻或市场行情作为填充
5. 语气要惊叹、幽默，符合修真世界观
6. 使用"震惊！"、"听闻"、"据说"等八卦用语
7. 每条新闻控制在30-50字
8. 整体新闻中，填充内容和主角相关内容的比例约为3:1

请以JSON格式返回，格式如下：
{
  "headlines": ["头条1", "头条2", ...],
  "rumors": ["传闻1", "传闻2", ...]
}`
    }];

    // 调用AI服务
    const response = await sendMessageToAI(
      messages,
      settings.apiKey,
      settings.apiUrl || localStorage.getItem('game_api_url') || 'https://api.deepseek.com/chat/completions',
      {
        model: settings.apiModel || localStorage.getItem('game_api_model') || 'deepseek-chat',
        temperature: 0.9,
        maxTokens: 800
      }
    );
    
    // 解析AI返回的JSON
    let aiResult;
    try {
      // 尝试从返回文本中提取JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI返回结果');
      }
    } catch (parseError) {
      console.error('AI返回结果解析失败:', parseError);
      // 降级到本地模板
      return generateLocalGazette(newsBuffer, player, npcs, issue);
    }

    // 生成天机榜
    const powerRanking = generatePowerRanking(npcs, player);

    return {
      issue,
      year: player.age,
      month: player.month || 1,
      headlines: aiResult.headlines || [],
      rumors: aiResult.rumors || [],
      powerRanking,
      timestamp: Date.now(),
      isAI: true
    };

  } catch (error) {
    console.error('AI生成邸报失败，降级到本地模板:', error);
    // 失败时降级到本地模板
    return generateLocalGazette(newsBuffer, player, npcs, issue);
  }
}

/**
 * 将事件格式化为适合AI理解的描述
 */
function formatEventForAI(event) {
  const { type, data } = event;
  
  const descriptions = {
    LEVEL_UP: `${data.actor}突破至${data.detail}境界`,
    NPC_BREAKTHROUGH: `${data.actor}成功突破至${data.detail}`,
    BREAKTHROUGH_FAIL: `${data.actor}尝试突破${data.detail}失败`,
    MARRIAGE: `${data.actor}与${data.target}结为道侣`,
    BIRTH: `${data.actor}诞下子嗣${data.target}`,
    DEATH: `${data.actor}在${data.location || '某地'}陨落，享年${data.detail}岁`,
    COMBAT: `${data.actor}在${data.location}击败${data.target}`,
    JOIN_SECT: `${data.target}加入${data.detail}宗门`,
    GRANDCHILD: `${data.actor}家族添丁，第${data.detail}代诞生`,
    EXPLORATION: `${data.actor}在${data.location}获得${data.detail}`,
    // 复仇系统事件
    RIVAL_RISE: `宿敌${data.actor}天才崛起，突破至${data.detail}`,
    RIVAL_ENGAGED: `宿敌${data.actor}与${data.target}订婚`,
    RIVAL_MARRIAGE: `宿敌${data.actor}与${data.target}结为道侣`,
    RIVAL_HEIR: `宿敌${data.actor}诞下子嗣${data.target}，被立为家主继承人`,
    RIVAL_LIGHT_RUMOR: `宿敌${data.actor}遭遇谣言，声誉受损`,
    RIVAL_HEAVY_RUMOR: `宿敌${data.actor}遭遇重大丑闻，修为倒退`,
    RIVAL_THREAT_MEDIUM: `${data.actor}发布悬赏令，搜捕${data.playerName || '某神秘人'}`,
    RIVAL_THREAT_HIGH: `${data.actor}全城搜捕，誓要找出${data.playerName || '某神秘人'}`,
    RIVAL_THREAT_CRITICAL: `血榜杀手现身，据传目标是${data.playerName || '某神秘人'}`,
    RIVAL_HIDE_SUCCESS: `${data.actor}搜捕失败，颜面尽失`,
    RIVAL_DEFEATED: `${data.actor}击败宿敌${data.target}，复仇成功`,
    RIVAL_VICTORY: `${data.target}挑战${data.actor}失败，身受重伤`
  };

  return descriptions[type] || '发生了某件事';
}

/**
 * 主生成函数：邸报始终使用本地模板
 */
export function generateGazette(newsBuffer, player, npcs, issue, settings) {
  // 检查是否启用邸报
  if (!settings.enableGazette) {
    return null;
  }

  // 邸报始终使用本地模板生成
  return generateLocalGazette(newsBuffer, player, npcs, issue);
}

/**
 * 添加事件到新闻缓存
 */
export function pushToNewsBuffer(newsBuffer, type, data) {
  newsBuffer.push({
    type,
    data,
    timestamp: Date.now()
  });
}
