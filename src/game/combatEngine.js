// src/game/combatEngine.js

/**
 * 回合制战斗引擎
 * 核心功能：处理玩家与敌人之间的战斗逻辑
 */

/**
 * 初始化战斗状态
 * @param {Object} player 玩家对象
 * @param {Object} enemy 敌人对象
 * @returns {Object} 战斗状态对象
 */
export const initCombat = (player, enemy) => {
  // 安全获取玩家combatStats属性，添加默认值
  const playerCombatStats = player.combatStats || { maxHp: 100, maxMp: 50 };
  const enemyCombatStats = enemy.combatStats || { maxHp: 100, maxMp: 50 };
  
  return {
    player: {
      ...player,
      currentHp: playerCombatStats.maxHp,
      currentMp: playerCombatStats.maxMp
    },
    enemy: {
      ...enemy,
      currentHp: enemyCombatStats.maxHp,
      currentMp: enemyCombatStats.maxMp
    },
    turn: 0,
    logs: [],
    result: null // null: 战斗进行中, 'win': 玩家胜利, 'lose': 玩家失败
  };
};

/**
 * 执行一回合战斗
 * @param {Object} combatState 当前战斗状态
 * @param {String} playerAction 玩家选择的动作：'attack' | 'defend' | 'skill'
 * @param {String} skillId 技能ID (如果使用技能)
 * @returns {Object} 更新后的战斗状态
 */
export const executeTurn = (combatState, playerAction, skillId = null) => {
  const { player, enemy } = combatState;
  const newLogs = [...combatState.logs];
  let newPlayer = { ...player };
  let newEnemy = { ...enemy };
  let result = null;

  // 增加回合数
  const turn = combatState.turn + 1;
  newLogs.push(`=== 第 ${turn} 回合 ===`);

  // 1. 玩家行动阶段
  const playerResult = executePlayerAction(newPlayer, newEnemy, playerAction, skillId);
  newPlayer = playerResult.player;
  newEnemy = playerResult.enemy;
  newLogs.push(...playerResult.logs);

  // 检查敌人是否被击败
  if (newEnemy.currentHp <= 0) {
    newLogs.push(`${newEnemy.name} 被击败！`);
    result = 'win';
    return {
      player: newPlayer,
      enemy: newEnemy,
      turn,
      logs: newLogs,
      result
    };
  }

  // 2. 敌人行动阶段
  const enemyResult = executeEnemyAction(newEnemy, newPlayer);
  newEnemy = enemyResult.enemy;
  newPlayer = enemyResult.player;
  newLogs.push(...enemyResult.logs);

  // 检查玩家是否被击败
  if (newPlayer.currentHp <= 0) {
    newLogs.push(`${newPlayer.name} 被击败！`);
    result = 'lose';
    return {
      player: newPlayer,
      enemy: newEnemy,
      turn,
      logs: newLogs,
      result
    };
  }

  return {
    player: newPlayer,
    enemy: newEnemy,
    turn,
    logs: newLogs,
    result
  };
};

/**
 * 执行玩家动作
 * @param {Object} player 玩家对象
 * @param {Object} enemy 敌人对象
 * @param {String} action 动作类型
 * @param {String} skillId 技能ID
 * @returns {Object} 包含更新后的玩家、敌人和日志
 */
const executePlayerAction = (player, enemy, action, skillId) => {
  const logs = [];

  switch (action) {
    case 'attack':
      // 基础攻击
      const attackDamage = calculateDamage(player, enemy);
      enemy.currentHp -= attackDamage;
      logs.push(`${player.name} 发起攻击，对 ${enemy.name} 造成 ${attackDamage} 点伤害！`);
      break;

    case 'defend':
      // 防御，减少下一回合受到的伤害
      player.isDefending = true;
      logs.push(`${player.name} 进入防御姿态，下一回合受到的伤害减少！`);
      break;

    case 'skill':
      // 技能攻击 (简单实现，后续可扩展技能系统)
      const skillDamage = calculateDamage(player, enemy) * 1.5;
      enemy.currentHp -= skillDamage;
      player.currentMp -= 50; // 消耗灵力
      logs.push(`${player.name} 使用技能，对 ${enemy.name} 造成 ${skillDamage} 点伤害！`);
      break;

    default:
      // 默认攻击
      const defaultDamage = calculateDamage(player, enemy);
      enemy.currentHp -= defaultDamage;
      logs.push(`${player.name} 发起攻击，对 ${enemy.name} 造成 ${defaultDamage} 点伤害！`);
  }

  return { player, enemy, logs };
};

/**
 * 执行敌人动作
 * @param {Object} enemy 敌人对象
 * @param {Object} player 玩家对象
 * @returns {Object} 包含更新后的敌人、玩家和日志
 */
const executeEnemyAction = (enemy, player) => {
  const logs = [];

  // 敌人简单AI：总是发起攻击
  const enemyDamage = calculateDamage(enemy, player);
  
  // 如果玩家处于防御状态，减少伤害
  const finalDamage = player.isDefending ? Math.floor(enemyDamage * 0.5) : enemyDamage;
  player.currentHp -= finalDamage;
  
  // 重置防御状态
  player.isDefending = false;
  
  logs.push(`${enemy.name} 发起攻击，对 ${player.name} 造成 ${finalDamage} 点伤害！`);

  return { enemy, player, logs };
};

/**
 * 计算伤害
 * @param {Object} attacker 攻击者
 * @param {Object} defender 防御者
 * @returns {Number} 伤害值
 */
const calculateDamage = (attacker, defender) => {
  // 安全获取攻击和防御属性，添加默认值
  const attackerAtk = attacker.combatStats?.atk || 10;
  const defenderDef = defender.combatStats?.def || 5;
  
  // 基础伤害 = 攻击力 - 防御力/2
  const baseDamage = attackerAtk - Math.floor(defenderDef / 2);
  
  // 确保至少造成1点伤害
  const finalDamage = Math.max(1, baseDamage);
  
  return finalDamage;
};

/**
 * 计算战斗奖励
 * @param {Object} combatState 战斗状态
 * @returns {Object} 奖励对象
 */
export const calculateRewards = (combatState) => {
  if (combatState.result !== 'win') {
    return { exp: 0, items: [] };
  }

  // 基础经验 = 敌人总属性 * 0.1
  const baseExp = Math.floor(
    (combatState.enemy.currentExp + 
     combatState.enemy.combatStats.atk + 
     combatState.enemy.combatStats.def) * 0.1
  );

  // 简单的物品掉落逻辑：随机从敌人掉落池中选择
  const items = combatState.enemy.drops ? 
    [combatState.enemy.drops[Math.floor(Math.random() * combatState.enemy.drops.length)]] : 
    [];

  return { exp: baseExp, items };
};

/**
 * 生成战斗结果报告
 * @param {Object} combatState 战斗状态
 * @returns {String} 战斗结果报告
 */
export const generateCombatReport = (combatState) => {
  let report = '=== 战斗结果 ===\n';
  
  if (combatState.result === 'win') {
    report += `🎉 战斗胜利！\n`;
  } else if (combatState.result === 'lose') {
    report += `💀 战斗失败！\n`;
  } else {
    report += `⏸ 战斗进行中...\n`;
  }
  
  report += `\n战斗日志：\n`;
  report += combatState.logs.join('\n');
  
  report += `\n\n当前状态：\n`;
  report += `${combatState.player.name}: ${combatState.player.currentHp}/${combatState.player.combatStats.maxHp} HP, ${combatState.player.currentMp}/${combatState.player.combatStats.maxMp} MP\n`;
  report += `${combatState.enemy.name}: ${combatState.enemy.currentHp}/${combatState.enemy.combatStats.maxHp} HP, ${combatState.enemy.currentMp}/${combatState.enemy.combatStats.maxMp} MP\n`;
  
  return report;
};

/**
 * 模拟完整战斗流程（自动战斗）
 * @param {Object} player 玩家对象
 * @param {Object} enemy 敌人对象
 * @returns {Object} 战斗结果
 */
export const simulateCombat = (player, enemy) => {
  // 初始化战斗状态
  let combatState = initCombat(player, enemy);
  
  // 自动战斗逻辑：循环执行回合，直到有一方失败
  while (!combatState.result) {
    // 玩家总是选择攻击（简单AI）
    combatState = executeTurn(combatState, 'attack');
  }
  
  // 返回战斗结果
  return {
    success: combatState.result === 'win',
    logs: combatState.logs,
    remainingHp: combatState.player.currentHp
  };
};
