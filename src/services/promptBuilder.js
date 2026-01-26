// Prompt 构建层
// 根据 NPC 属性动态生成角色扮演提示词

/**
 * 构建 System Prompt（人设提示词）
 * @param {Object} npc - NPC 对象
 * @param {Object} player - 玩家对象
 * @param {Object} gameState - 游戏状态（包含子女、关系历史等）
 * @returns {string} System Prompt
 */
export const buildSystemPrompt = (npc, player, gameState = {}) => {
  // 根据好感度判断关系
  const affection = npc.relationship?.affection || 0;
  let relation = "陌生";
  if (affection >= 80) relation = "深爱";
  else if (affection >= 60) relation = "亲密";
  else if (affection >= 40) relation = "熟络";
  else if (affection >= 20) relation = "认识";
  
  // 获取性格标签
  const personality = npc.personality?.label || "普通";
  const personalityDesc = npc.personality?.desc || npc.desc || "性格平和";
  
  // 获取身份和境界
  const identity = npc.identity || "修士";
  const tierTitle = npc.tierTitle || "凡人";
  
  // 构建关系状态信息
  let relationshipContext = "";
  
  // 1. 检查是否是道侣关系
  const isSpouse = gameState.npcs?.some(n => 
    n.id === npc.id && n.relationship?.stage >= 3
  );
  if (isSpouse || affection >= 90) {
    relationshipContext += "\n你们已结为道侣，是彼此最亲密的伴侣。";
  }
  
  // 2. 检查是否有共同的子女
  const children = gameState.children?.filter(child => {
    // 匹配方式1: 通过 parentId（用于孙子辈）
    if (child.parentId === npc.id) return true;
    
    // 匹配方式2: 通过父母ID（如果有这些字段）
    if (child.fatherId === npc.id || child.motherId === npc.id) return true;
    
    // 匹配方式3: 通过父母名字（最常用的方式）
    if (child.fatherName === npc.name || child.motherName === npc.name) return true;
    
    return false;
  }) || [];
  
  if (children.length > 0) {
    const childrenNames = children.map(c => `${c.name}（${c.age}岁，${c.tierTitle || '凡人'}）`).join('、');
    relationshipContext += `\n你们共同养育了${children.length}个孩子：${childrenNames}。`;
    
    // 添加子女的详细信息
    const childDetails = children.map(c => {
      let details = `${c.name}`;
      if (c.sect) details += `已拜入${c.sect.name}`;
      if (c.spouse) details += `，并已婚配于${c.spouse.name}`;
      if (c.trait) details += `，天生【${c.trait.name}】特质`;
      return details;
    }).join('；');
    
    if (childDetails) {
      relationshipContext += `\n子女近况：${childDetails}。`;
    }
  }
  
  // 3. 检查是否见过家长或有重要事件历史
  const relationshipStage = npc.relationship?.stage || 1;
  if (relationshipStage >= 2 && relationshipStage < 3) {
    relationshipContext += "\n你们的关系已得到双方家长的认可。";
  }
  
  // 4. 检查是否怀孕
  if (npc.isPregnant) {
    const progress = npc.pregnancyProgress || 0;
    relationshipContext += `\n你正在孕育你们的孩子（已有${progress}个月身孕）。`;
  }
  
  // 5. 检查重要事件历史
  if (gameState.eventHistory && gameState.eventHistory.length > 0) {
    const recentEvents = gameState.eventHistory
      .filter(e => e.npcId === npc.id)
      .slice(-3) // 最近3个事件
      .map(e => e.description)
      .join('；');
    
    if (recentEvents) {
      relationshipContext += `\n\n【最近经历】\n${recentEvents}`;
    }
  }
  
  // 构建人设提示词
  return `【角色扮演指令】
你正在扮演一个修仙世界中的角色，请完全沉浸在这个身份中。

【你的身份】
姓名：${npc.name}
身份：${identity}
修为境界：${tierTitle}
年龄：${npc.age || "不详"}岁
性格特质：${personality}（${personalityDesc}）

【玩家信息】
玩家姓名：${player.name}
玩家境界：${player.tierTitle || "凡人"}
你对玩家的态度：${relation}（好感度：${affection}/100）
${relationshipContext ? '\n【你们的关系】' + relationshipContext : ''}

【对话风格要求】
1. 必须严格保持"${personality}"的说话语气和行为方式
   - 若是高冷：话少、冷淡、惜字如金
   - 若是温柔：语气柔和、关心体贴
   - 若是病娇：占有欲强、情绪波动大
   - 若是豪爽：直率、大方、不拘小节
   - 其他性格请自行把握特点

2. 使用修仙界/古风用语：
   - 称呼：道友、在下、本座、贫道、阁下等
   - 用词：灵力、法宝、修为、突破、渡劫等
   - 避免现代网络用语

3. 回复长度控制：
   - 一般对话：30-50字
   - 重要剧情：可适当延长至80字
   - 严禁长篇大论

4. 根据好感度调整态度：
   - 好感度低（<30）：冷淡、敷衍、甚至不耐烦
   - 好感度中（30-60）：平和、礼貌、正常交流
   - 好感度高（60-80）：友好、主动、关心
   - 好感度极高（>80）：亲昵、依赖、深情
   ${children.length > 0 ? '- 谈及子女时：表现出为人父母的温情和关切' : ''}

5. 严格禁止：
   - 跳出角色说话
   - 提及"我是AI"、"我是助手"等
   - 讨论现代科技、政治等不相关话题
   - 突然改变性格设定

【当前场景】
玩家正通过传音符或面对面与你交谈，请自然回应。${children.length > 0 ? '你可以在合适时提及你们的孩子。' : ''}`;
};

/**
 * 构建带有上下文事件的 Prompt（用于特殊场景）
 * @param {Object} npc 
 * @param {Object} player 
 * @param {string} recentEvent - 最近发生的事件描述
 * @param {Object} gameState - 游戏状态
 * @returns {string}
 */
export const buildContextualPrompt = (npc, player, recentEvent, gameState = {}) => {
  const basePrompt = buildSystemPrompt(npc, player, gameState);
  
  if (recentEvent) {
    return `${basePrompt}

【最新事件】
${recentEvent}
请在接下来的对话中自然地提及或回应这个事件。`;
  }
  
  return basePrompt;
};

/**
 * 构建带有记忆的 Prompt（用于持续对话）
 * @param {Object} npc 
 * @param {Object} player 
 * @param {Array} previousTopics - 之前讨论过的话题
 * @param {Object} gameState - 游戏状态
 * @returns {string}
 */
export const buildMemoryPrompt = (npc, player, previousTopics = [], gameState = {}) => {
  const basePrompt = buildSystemPrompt(npc, player, gameState);
  
  if (previousTopics.length > 0) {
    const topicsText = previousTopics.map((t, i) => `${i + 1}. ${t}`).join('\n');
    return `${basePrompt}

【对话记忆】
你们之前讨论过以下话题：
${topicsText}

请在必要时自然地引用这些记忆，让对话更连贯。`;
  }
  
  return basePrompt;
};
