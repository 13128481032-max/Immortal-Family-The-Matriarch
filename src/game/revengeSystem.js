// src/game/revengeSystem.js
// 复仇系统 - 宿敌互动逻辑

/**
 * 散布谣言 - 削弱宿敌名望和修为
 * @param {Object} player - 玩家数据
 * @param {Number} cost - 消耗灵石数量（越多效果越好）
 * @returns {Object} - 操作结果
 */
export function spreadRumor(player, cost = 50) {
  const rival = player.rival;
  
  // 检查资源
  if (player.resources.spiritStones < cost) {
    return {
      success: false,
      message: "灵石不足，无法散布谣言！"
    };
  }
  
  // 检查冷却时间（每月只能散布一次）
  const currentMonth = (player.time.year * 12) + player.time.month;
  if (player.revengeActions.lastRumorMonth === currentMonth) {
    return {
      success: false,
      message: "本月已经散布过谣言，需等待下月！"
    };
  }
  
  // 扣除资源
  player.resources.spiritStones -= cost;
  
  // 计算成功率（基础60%，花费越多成功率越高，最高90%）
  const successRate = Math.min(0.9, 0.6 + (cost / 200));
  const isSuccess = Math.random() < successRate;
  
  if (!isSuccess) {
    // 失败：威胁度提升
    rival.threatLevel = Math.min(100, rival.threatLevel + 15);
    player.revengeActions.lastRumorMonth = currentMonth;
    
    return {
      success: true,
      effectType: "FAILED",
      message: "谣言散布失败！楚清瑶似乎察觉到了什么，对你的搜捕更加严密了...",
      threatIncrease: 15
    };
  }
  
  // 成功：根据花费决定效果等级
  let effectType = "";
  let damage = 0;
  
  if (cost >= 100) {
    // 重度谣言（100+灵石）
    effectType = "HEAVY";
    damage = 200;
    rival.state = "FURIOUS";
    rival.threatLevel = Math.min(100, rival.threatLevel + 25);
    rival.currentExp = Math.max(0, rival.currentExp - damage);
    rival.rumorCount += 2;
  } else {
    // 轻度谣言（50-99灵石）
    effectType = "LIGHT";
    damage = 100;
    rival.state = "ANXIOUS";
    rival.threatLevel = Math.min(100, rival.threatLevel + 10);
    rival.currentExp = Math.max(0, rival.currentExp - damage);
    rival.rumorCount += 1;
  }
  
  // 更新记录
  player.revengeActions.lastRumorMonth = currentMonth;
  player.revengeActions.totalRumors += 1;
  
  return {
    success: true,
    effectType,
    message: effectType === "HEAVY" 
      ? "重磅谣言散布成功！楚清瑶的名声和修为都受到了重创！" 
      : "谣言散布成功！楚清瑶开始焦虑不安，修炼进度受阻...",
    damage,
    threatIncrease: effectType === "HEAVY" ? 25 : 10,
    newsEvent: {
      type: effectType === "HEAVY" ? "RIVAL_HEAVY_RUMOR" : "RIVAL_LIGHT_RUMOR",
      data: {
        actor: rival.name,
        rumorCount: rival.rumorCount
      }
    }
  };
}

/**
 * 隐匿行踪 - 降低威胁度，避免被刺杀
 * @param {Object} player - 玩家数据
 * @param {Number} months - 隐匿月数（1-3月）
 * @param {Number} costPerMonth - 每月消耗灵石
 * @returns {Object} - 操作结果
 */
export function hideFromRival(player, months = 1, costPerMonth = 30) {
  const rival = player.rival;
  const totalCost = months * costPerMonth;
  
  // 检查资源
  if (player.resources.spiritStones < totalCost) {
    return {
      success: false,
      message: `灵石不足！隐匿${months}月需要${totalCost}灵石。`
    };
  }
  
  // 扣除资源
  player.resources.spiritStones -= totalCost;
  
  // 大幅降低威胁度
  const threatReduction = 40 * months;
  rival.threatLevel = Math.max(0, rival.threatLevel - threatReduction);
  
  // 如果威胁度降为0，宿敌状态恢复正常
  if (rival.threatLevel < 30) {
    rival.state = "NORMAL";
  }
  
  // 设置隐匿回合数
  rival.hiddenTurns = months;
  player.revengeActions.hidingMonths += months;
  
  return {
    success: true,
    message: `成功隐匿行踪${months}月！楚清瑶的搜捕失败，威胁度大幅降低。`,
    threatReduction,
    months,
    newsEvent: {
      type: "RIVAL_HIDE_SUCCESS",
      data: {
        actor: rival.name,
        months
      }
    }
  };
}

/**
 * 生死决斗 - 终极对决
 * @param {Object} player - 玩家数据
 * @returns {Object} - 战斗结果
 */
export function finalDuel(player) {
  const rival = player.rival;
  
  // 检查玩家修为是否足够（至少要筑基期）
  if (!player.tier.includes("筑基") && !player.tier.includes("金丹") && !player.tier.includes("元婴")) {
    return {
      success: false,
      message: "修为不足！至少需要达到筑基期才能挑战楚清瑶。"
    };
  }
  
  // 简单战力计算
  const playerPower = player.currentExp + (player.combatStats?.atk || 50) * 10;
  const rivalPower = rival.currentExp + 500; // 宿敌有额外加成
  
  // 考虑谣言的削弱效果（每次谣言-5%战力）
  const rivalDebuff = 1 - (rival.rumorCount * 0.05);
  const finalRivalPower = rivalPower * Math.max(0.5, rivalDebuff);
  
  const playerWinRate = playerPower / (playerPower + finalRivalPower);
  const isVictory = Math.random() < playerWinRate;
  
  if (isVictory) {
    // 胜利
    rival.isDead = true;
    rival.state = "DEAD";
    rival.threatLevel = 0;
    
    return {
      success: true,
      victory: true,
      message: "你终于战胜了楚清瑶，多年的仇恨在此刻得到了释放...",
      playerPower,
      rivalPower: Math.floor(finalRivalPower),
      newsEvent: {
        type: "RIVAL_DEFEATED",
        data: {
          actor: player.name,
          target: rival.name
        }
      }
    };
  } else {
    // 失败（玩家重伤但不死）
    player.combatStats.hp = Math.max(1, player.combatStats.hp * 0.3);
    player.currentExp = Math.max(0, player.currentExp * 0.7);
    
    return {
      success: true,
      victory: false,
      message: "你败给了楚清瑶，身受重伤，修为大损...",
      playerPower,
      rivalPower: Math.floor(finalRivalPower),
      newsEvent: {
        type: "RIVAL_VICTORY",
        data: {
          actor: rival.name,
          target: player.name
        }
      }
    };
  }
}

/**
 * 检查并触发刺杀事件
 * @param {Object} player - 玩家数据
 * @returns {Object} - 刺杀事件结果，如果没有触发返回null
 */
export function checkAssassinationEvent(player) {
  const rival = player.rival;
  
  // 如果正在隐匿中，不会触发刺杀
  if (rival.hiddenTurns > 0) {
    rival.hiddenTurns -= 1;
    return null;
  }
  
  // 威胁度超过80%有50%概率触发刺杀
  if (rival.threatLevel >= 80 && Math.random() < 0.5) {
    // 触发刺杀事件
    const survivalRate = 0.3 + (player.stats.cunning / 200); // 最多60%生存率
    const survived = Math.random() < survivalRate;
    
    if (survived) {
      // 侥幸逃脱，但受重伤
      player.combatStats.hp = Math.max(10, player.combatStats.hp * 0.4);
      rival.threatLevel = Math.max(30, rival.threatLevel - 20);
      
      return {
        type: "ASSASSINATION_SURVIVED",
        survived: true,
        message: "血榜杀手'无影'突然出现！你虽然侥幸逃脱，但身受重伤...",
        hpLoss: Math.floor(player.combatStats.maxHp * 0.6)
      };
    } else {
      // 被杀死 - Game Over
      return {
        type: "ASSASSINATION_KILLED",
        survived: false,
        message: "血榜杀手'无影'找到了你！你的复仇之路到此为止...",
        gameOver: true
      };
    }
  }
  
  return null;
}

/**
 * 更新宿敌的时间线事件（每年自动触发）
 * @param {Object} player - 玩家数据
 * @returns {Object} - 时间线事件，如果没有返回null
 */
export function updateRivalTimeline(player) {
  const rival = player.rival;
  const gameYear = player.time.year - 3572; // 游戏开局年份为3572
  
  // 如果宿敌已死，不再触发
  if (rival.isDead) {
    return null;
  }
  
  // 宿敌修为自然增长（每年+200，比玩家成长快）
  rival.currentExp += 200;
  
  // 检查生命阶段，触发对应事件
  let newsEvent = null;
  
  if (gameYear === 1 && rival.lifeStage < 1) {
    // 第1年：天才崛起
    rival.lifeStage = 1;
    rival.tier = "筑基期";
    rival.currentExp = 800;
    newsEvent = {
      type: "RIVAL_RISE",
      data: {
        actor: rival.name,
        detail: "筑基期"
      }
    };
  } else if (gameYear === 2 && rival.lifeStage < 2) {
    // 第2年：订婚
    rival.lifeStage = 2;
    newsEvent = {
      type: "RIVAL_ENGAGED",
      data: {
        actor: rival.name,
        target: "顾家少主顾寒渊"
      }
    };
  } else if (gameYear === 3 && rival.lifeStage < 3) {
    // 第3年：夺夫大婚
    rival.lifeStage = 3;
    rival.tier = "金丹初期";
    rival.currentExp = 1500;
    newsEvent = {
      type: "RIVAL_MARRIAGE",
      data: {
        actor: rival.name,
        target: "顾家少主顾寒渊"
      }
    };
  } else if (gameYear === 5 && rival.lifeStage < 4) {
    // 第5年：生子掌权
    rival.lifeStage = 4;
    rival.tier = "金丹中期";
    rival.currentExp = 2000;
    newsEvent = {
      type: "RIVAL_HEIR",
      data: {
        actor: rival.name,
        target: "顾青云"
      }
    };
  }
  
  return newsEvent;
}

/**
 * 威胁度自然增长（每月调用）
 * @param {Object} player - 玩家数据
 * @returns {Number} - 本月威胁度增量
 */
export function updateThreatLevel(player) {
  const rival = player.rival;
  
  // 如果宿敌已死亡，威胁度不再上升
  if (rival.isDead) {
    return 0;
  }
  
  // 如果正在隐匿中，威胁度不上升
  if (rival.hiddenTurns > 0) {
    return 0;
  }
  
  // 基础威胁度增长：每月+2
  const baseIncrease = 2;
  
  // 根据当前威胁度调整增长速度
  // 威胁度越高，增长越快（表示宿敌搜捕力度加大）
  let multiplier = 1;
  if (rival.threatLevel >= 60) {
    multiplier = 1.5; // 高威胁时增长快50%
  } else if (rival.threatLevel >= 30) {
    multiplier = 1.2; // 中等威胁时增长快20%
  }
  
  const increase = Math.ceil(baseIncrease * multiplier);
  rival.threatLevel = Math.min(100, rival.threatLevel + increase);
  
  return increase;
}

/**
 * 根据威胁度生成预警新闻
 * @param {Object} rival - 宿敌数据
 * @returns {Object} - 预警新闻事件，如果不需要预警返回null
 */
export function generateThreatWarning(rival) {
  if (rival.isDead) {
    return null;
  }
  
  // 高危预警（威胁度 >= 80）
  if (rival.threatLevel >= 80) {
    return {
      type: "RIVAL_THREAT_CRITICAL",
      data: {
        actor: rival.name
      }
    };
  }
  
  // 搜捕预警（威胁度 60-79）
  if (rival.threatLevel >= 60) {
    return {
      type: "RIVAL_THREAT_HIGH",
      data: {
        actor: rival.name
      }
    };
  }
  
  // 警觉预警（威胁度 30-59）
  if (rival.threatLevel >= 30) {
    return {
      type: "RIVAL_THREAT_MEDIUM",
      data: {
        actor: rival.name,
        playerName: "某神秘女修"
      }
    };
  }
  
  return null;
}
