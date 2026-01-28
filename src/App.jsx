import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import theme from './styles/theme.js';
// 引入新组件
import TopStatusBar from './components/TopStatusBar/index.jsx';
import BottomNav from './components/BottomNav/index.jsx';
// 引入旧组件
import NpcCard from './components/NpcCard/index.jsx';
import NpcDetailModal from './components/NpcDetailModal/index.jsx';
import FamilyTree from './components/FamilyTree/index.jsx';
import FamilyTreeChart from './components/FamilyTreeChart/index.jsx';
import FamilyViewWrapper from './components/FamilyTree/FamilyViewWrapper.jsx';
import GameLog from './components/GameLog/index.jsx';
// 引入日志系统
import { 
  generateMonthlyLogsForAll, 
  generateChatLog, 
  generateGiftLog,
  generateSparLog,
  generateDualCultivationLog,
  markNpcLoggedThisMonth,
  generatePregnancyDecisionLog,
  generateMaleBirthLog,
  generateFirstMeetLog,
  generateJealousyLog,
  generatePleasePlanLog,
  generateMarriageLog
} from './game/npcLogSystem.js';
// 引入记忆系统
import MemoryManager from './game/memoryManager.js';
// 引入文本引擎（已整合）
import { 
  getChatText, 
  getGiftReaction, 
  getPersuadeText, 
  createMonkScriptureEvent, 
  getRandomInteractionEvent, 
  getUnifiedInteractionEvent 
} from './game/textEngine.js';
// 引入生命周期系统
import { 
  processNpcLifecycles, 
  checkInteractionAllowed,
  getRelationshipStatus,
  getRelationshipStatusDisplay
} from './game/npcLifecycle.js';
// 引入吃醋系统
import {
  checkWitnessEvent,
  calculateJealousyIncrease,
  applyJealousyIncrease,
  generateJealousyLogContent,
  getJealousyLevel,
  checkNeglect
} from './game/jealousySystem.js';
// 引入消息中心系统
import MessageManager, { 
  createObituaryMessage, 
  createLetterMessage, 
  shouldSendLetter 
} from './game/messageCenter.js';
import MessageCenterModal from './components/MessageCenterModal/index.js';
// 引入序章组件
import Prologue from './components/Prologue/index.jsx';
// 引入新面板
import BusinessPanel from './components/Panels/BusinessPanel.jsx';
import ChallengePanel from './components/Panels/ChallengePanel.jsx';
import RevengePanel from './components/Panels/RevengePanel.jsx';
import SystemPanel from './components/Panels/SystemPanel.jsx';
import PlayerPanel from './components/PlayerPanel/index.jsx';
// 引入复仇系统
import { updateThreatLevel, checkAssassinationEvent, updateRivalTimeline } from './game/revengeSystem.js';
// 引入新弹窗
import GiftModal from './components/Modals/GiftModal.jsx';
import SpouseSelectionModal from './components/SpouseSelectionModal/index.jsx';
import NegotiationModal from './components/Modals/NegotiationModal.jsx';
import ResultModal from './components/Modals/ResultModal.jsx';
import SpiritRootTestModal from './components/Modals/SpiritRootTestModal.jsx';
import ChildDetailModal from './components/ChildDetailModal/index.jsx';
import SortBar from './components/Common/SortBar.jsx';
import EventModal from './components/Modals/EventModal.jsx'; // 引入事件弹窗组件
import InventoryModal from './components/Modals/InventoryModal.jsx';
import ChildSelectorModal from './components/Modals/ChildSelectorModal.jsx';
import NpcLogModal from './components/Modals/NpcLogModal.jsx'; // NPC 日志模态框
import GazetteModal from './components/GazetteModal/index.jsx'; // 修真界邸报弹窗
// 引入邸报系统
import { generateGazette, pushToNewsBuffer } from './game/gazetteSystem.js';
// 引入世界名人池系统
import { generateWorldElites, evolveWorldNpcs, findEliteByCondition, getEliteRanking } from './game/worldNpcGenerator.js';
// 引入功法系统
import { assignSectManual, changeManual, getRecommendedManuals } from './game/manualSystem.js';
// 引入存档系统
import { saveGameToStorage, loadGameFromStorage, hasSaveFile, clearSave } from './utils/saveSystem.js';
// 引入数据和逻辑
import { initialPlayer } from './data/initialPlayer.js';
import { initialNpcs } from './data/npcPool.js';
import { generateChild, processChildrenGrowth, generateSpouse, generateSpouseCandidates, calculateChildFeedback, attemptBreakthrough, calculateBusinessIncome } from './game/mechanics.js';
import { getTierConfig, calculateStats, getRootConfigByValue, MUTANT_ELEMENTS, ELEMENTS, getSectById, calculateCultivationSpeed } from './game/cultivationSystem.js';
import { generateRandomNpc } from './game/npcGenerator.js'; // 引入生成器
import { calculateCombatPower } from './game/challengeSystem.js'; // 复用战力计算
import { simulateCombat } from './game/combatEngine.js'; // 战斗引擎仍在使用中
import { getRandomEvent } from './data/eventLibrary.js'; // 引入随机事件生成函数
import CombatModal from './components/Modals/CombatModal.jsx'; // 引入战斗弹窗组件
import ExplorationModal from './components/ExplorationModal/index.jsx'; // 新增：探险模态
import { getRandomExplorationEvent, getBossEvent, generateRealmEnemy } from './game/explorationEvents.js';
import GuideModal from './components/Modals/GuideModal.jsx'; // 引入指南弹窗组件
import TutorialModal from './components/Modals/TutorialModal.jsx'; // 引入新手引导弹窗组件
import SectSelectionModal from './components/Modals/SectSelectionModal.jsx';
import { createItemInstance, isEquipment, getItemTemplate } from './data/itemLibrary.js';
import { MANUALS } from './data/manualData.js'; // 引入功法数据
import { generateMonthlyWorldEvents, generatePlayerRelatedEvent } from './game/worldEventsSystem.js'; // 引入世界事件系统

// 排序配置
const NPC_SORT_OPTIONS = [
  { value: 'DEFAULT', label: '默认 (相识时间)' },
  { value: 'AFFECTION_DESC', label: '好感度 (高→低)' },
  { value: 'APTITUDE_DESC', label: '天资 (高→低)' },
  { value: 'TRUST_DESC', label: '信任度 (高→低)' },
];

const CHILD_SORT_OPTIONS = [
  { value: 'AGE_DESC', label: '长幼 (长→幼)' },
  { value: 'AGE_ASC', label: '长幼 (幼→长)' },
  { value: 'APTITUDE_DESC', label: '资质 (高→低)' },
  { value: 'CULTIVATION_DESC', label: '修为 (高→低)' },
  { value: 'TIER_DESC', label: '境界 (高→低)' },
];

function App() {
  // --- 状态管理 ---
  const [gameStage, setGameStage] = useState('PROLOGUE'); // 'PROLOGUE' | 'MAIN' | 'ENDING'
  const [player, setPlayer] = useState({
    ...initialPlayer,
    businesses: [], // 新增：玩家拥有的产业
    gazetteHistory: [], // 邸报历史记录
    gazetteIssue: 0, // 邸报期数
    hasUnreadGazette: false, // 是否有未读邸报
    newsBuffer: [] // 新闻缓冲区
  });
  const [activeNpcs, setActiveNpcs] = useState(initialNpcs);
  const [deadNpcs, setDeadNpcs] = useState([]); // 新增：已死亡的NPC列表
  const [children, setChildren] = useState([]);
  const [inventory, setInventory] = useState([]); // 全局背包
  
  // 2. 新增：宿敌状态（使用player.rival字段，这里只是备用）
  const [rival, setRival] = useState({
    name: "楚清瑶",
    tier: "炼气八层", // 天灵根，开局更强
    status: "alive", // alive | defeated
    logs: ["楚清瑶觉醒天灵根，震惊全城。", "楚清瑶夺走了你的筑基丹。", "楚清瑶成为了家族重点培养对象。"]
  });
  
  // 初始化日志，直接使用初始日志数据，避免依赖rival对象
  const [logs, setLogs] = useState([
    { turn: 0, message: "楚清瑶觉醒天灵根，震惊全城。" },
    { turn: 0, message: "楚清瑶夺走了你的筑基丹。" },
    { turn: 0, message: "楚清瑶成为了家族重点培养对象。" }
  ]);
  
  const [activeTab, setActiveTab] = useState('FAMILY'); // 默认显示家族树
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null); // 当前选中的孩子
  const [npcLogModal, setNpcLogModal] = useState({ open: false, npc: null }); // NPC 日志查看
  const [isAuto, setIsAuto] = useState(false); // 新增：自动播放开关
  const [autoSpeed, setAutoSpeed] = useState(1); // 自动速度倍率：0.3, 1, 3
  const [showBizPanel, setShowBizPanel] = useState(false); // 新增：产业面板显示状态
  const [showChallengePanel, setShowChallengePanel] = useState(false); // 新增：探险面板显示状态
  const [npcSort, setNpcSort] = useState('DEFAULT');
  const [childSort, setChildSort] = useState('AGE_DESC');
  const [combatData, setCombatData] = useState(null); // 存储当前战斗信息 { result, enemy, context }
  // --- 探险状态机 ---
  const [isExploring, setIsExploring] = useState(false);
  const [exploreRealmState, setExploreRealmState] = useState({ id: null, name: '', total: 0 });
  const [exploreProgress, setExploreProgress] = useState(0);
  const [exploreLog, setExploreLog] = useState([]);
  const [currentExploreEvent, setCurrentExploreEvent] = useState(null);
  const [exploreTeamIds, setExploreTeamIds] = useState([]);
  const [showGuide, setShowGuide] = useState(false); // 控制指南弹窗显示
  const [showTutorial, setShowTutorial] = useState(false); // 控制新手引导弹窗显示
  const [showGazette, setShowGazette] = useState(false); // 控制邸报弹窗显示
  const [currentGazette, setCurrentGazette] = useState(null); // 当前邸报数据

  // 消息中心相关状态
  const [messageManager] = useState(() => new MessageManager());
  const [messages, setMessages] = useState([]);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [lastMessageCheck, setLastMessageCheck] = useState({}); // 记录每个NPC上次发送消息的月份

  // 3. 新增：待测灵的孩子队列
  const [testQueue, setTestQueue] = useState([]);
  // 4. 新增：待处理的宗门选择队列（12岁触发）
  const [pendingSectChoices, setPendingSectChoices] = useState([]);
  // 5. 新增：配偶选择相关状态
  const [showSpouseSelection, setShowSpouseSelection] = useState(false);
  const [spouseCandidates, setSpouseCandidates] = useState([]);
  const [marryingChild, setMarryingChild] = useState(null);
  
  // --- 🚑 数据自动修复补丁 ---
  useEffect(() => {
    // 1. 修复玩家 (Player) 数据
    if (player && !player.combatStats) {
      console.log("检测到旧存档数据，正在自动修复战斗属性...");
      
      // 1. 确保有基本属性和灵根
      const safeStats = player.stats || { aptitude: 50, luck: 50, lifespan: 100 };
      const rootType = player.spiritRoot?.type || "五灵根";
      
      // 2. 重新计算战斗属性
      const newStats = calculateStats(player.tier || "凡人", safeStats.aptitude, rootType);
      
      // 3. 更新 player
      setPlayer(prev => ({
        ...prev,
        // 补全基本属性
        stats: prev.stats || safeStats,
        // 补全灵根
        spiritRoot: prev.spiritRoot || {
            type: "五灵根", elements: ["金","木","水","火","土"], color: "#9E9E9E", multiplier: 0.5
        },
        // 补全战斗属性
        combatStats: newStats
      }));
    }

    // 2. 修复 NPC 数据（补全修为经验字段）
    if (activeNpcs.some(n => !n.relationship || n.currentExp === undefined)) {
      console.log("检测到旧 NPC 数据缺失，正在修复...");
      setActiveNpcs(prev => prev.map(n => {
        const fixed = { ...n };
        
        // 修复关系数据
        if (!fixed.relationship) {
          fixed.relationship = { stage: 0, affection: 0, trust: 0, jealousy: 0 };
        }
        
        // 修复修为经验数据
        if (fixed.currentExp === undefined) {
          const npcTier = fixed.tier || '炼气初期';
          const tierConfig = getTierConfig(npcTier);
          fixed.tier = npcTier;
          fixed.currentExp = Math.floor(Math.random() * tierConfig.maxExp * 0.3);
          fixed.maxExp = tierConfig.maxExp;
        }
        
        return fixed;
      }));
    }
    
    // 🆕 初始化所有 NPC 的记忆系统
    if (activeNpcs.some(n => !n.memories)) {
      console.log("初始化 NPC 记忆系统...");
      setActiveNpcs(prev => {
        const initialized = prev.map(n => {
          MemoryManager.initializeAllNpcs([n]);
          
          // 为已有子女的 NPC 补录记忆
          const npcChildren = children.filter(c => 
            c.fatherName === n.name || c.motherName === n.name
          );
          if (npcChildren.length > 0) {
            MemoryManager.backfillChildrenMemories(n, npcChildren);
          }
          
          return n;
        });
        return initialized;
      });
    }

    // 3. 修复旧子嗣数据的装备槽
    if (children.some(c => !c.equipment)) {
      setChildren(prev => prev.map(c => ensureEquipmentSlots(c)));
    }

    // 4. 修复旧子嗣数据的灵根结构
    if (children.some(c => c.spiritRoot && !c.spiritRoot.elements)) {
      console.log("检测到旧子女灵根数据缺失，正在修复...");
      setChildren(prev => prev.map(c => {
        if (c.spiritRoot && !c.spiritRoot.elements) {
          return {
            ...c,
            spiritRoot: {
              type: "五灵根",
              elements: ["金", "木", "水", "火", "土"],
              desc: "五行杂驳",
              color: "#9E9E9E",
              multiplier: 0.5
            }
          };
        }
        return c;
      }));
    }
  }, [player, activeNpcs, children]);

  // --- 🌟 世界名人池初始化 ---
  useEffect(() => {
    // 如果玩家的worldNpcs为空，初始化世界名人池
    if (player.worldNpcs && player.worldNpcs.length === 0) {
      console.log('初始化世界名人池...');
      const worldElites = generateWorldElites(30);
      setPlayer(prev => ({
        ...prev,
        worldNpcs: worldElites
      }));
    }
  }, [player.worldNpcs]);

  // --- 1. 自动检测是否需要显示新手教程 ---
  useEffect(() => {
    // 检查本地存储中是否有标记
    const hasReadTutorial = localStorage.getItem('has_read_tutorial_v2');
    
    // 如果是序章刚结束进入 MAIN 阶段，且没读过教程
    if (gameStage === 'MAIN' && !hasReadTutorial) {
      // 稍微延迟一点弹出，不要和序章结束动画冲突
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
    }
  }, [gameStage]);

  // 关闭新手引导时的处理
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('has_read_tutorial_v2', 'true'); // 标记为已读
  };

  // 完成新手引导时的处理
  const handleCompleteTutorial = () => {
    localStorage.setItem('has_read_tutorial_v2', 'true'); // 标记为已读
  };

  // 关闭详细指南时的处理
  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  // --- 新增：弹窗控制状态 ---
  const [modalState, setModalState] = useState({
    type: null, // 'GIFT' | 'NEGOTIATE' | 'RESULT'
    data: null  // 传递给弹窗的数据(如当前NPC)
  });

  // 背包/装备弹窗状态
  const [inventoryModal, setInventoryModal] = useState({
    open: false,
    mode: 'VIEW', // VIEW: 通用背包 | SELECT: 装备选择
    slot: null,
    childId: null
  });
  
  // 子女选择弹窗状态
  const [childSelectorModal, setChildSelectorModal] = useState({
    open: false,
    item: null
  });

  // --- 辅助函数 ---
  const addLog = (message, category = '个人', type = null, title = null) => {
    const turn = (player.time.year - 3572) * 12 + player.time.month;
    setLogs((prev) => [{ turn, message, category, type, title }, ...prev]);
  };

  // 计算子嗣反馈总和（用于显示在玩家面板）
  const totalChildFeedback = useMemo(() => {
    let total = 0;
    children.forEach(child => {
      total += calculateChildFeedback(child);
    });
    return total;
  }, [children]);

  // 辅助：关闭所有弹窗
  const closeModal = () => setModalState({ type: null, data: null });

  // 辅助：显示结果弹窗
  const showResult = (title, msg, success=true, changes=null, autoClose=true) => {
    setModalState({
      type: 'RESULT',
      data: { title, msg, success, changes, autoClose }
    });
    // 日志依然记录简略版
    addLog(msg.length > 20 ? `【剧情】${title}` : msg); 
  };

  // --- 装备&战斗属性辅助 ---
  const ensureEquipmentSlots = (entity) => {
    const baseEquip = entity.equipment || { weapon: null, armor: null, accessory: null };
    return { ...entity, equipment: baseEquip };
  };

  const recalcCombatStatsWithEquip = (entity) => {
    const normalized = ensureEquipmentSlots(entity);
    const tierName = normalized.tierTitle || normalized.tier || '凡人';
    const apt = normalized.stats?.aptitude || 50;
    const rootType = normalized.spiritRoot?.type || '五灵根';
    return {
      ...normalized,
      combatStats: calculateStats(tierName, apt, rootType, normalized.equipment)
    };
  };

  // --- 背包辅助 ---
  const addItemsToInventory = (itemIds = []) => {
    const instances = itemIds
      .map(id => createItemInstance(id))
      .filter(Boolean);
    if (instances.length === 0) return [];
    setInventory(prev => [...instances, ...prev]);
    return instances;
  };

  const removeItemFromInventory = (instanceId) => {
    const item = inventory.find(i => i.instanceId === instanceId);
    if (!item) return null;
    setInventory(prev => prev.filter(i => i.instanceId !== instanceId));
    return item;
  };

  // --- 1. NPC交互逻辑 (更新为弹窗版本) ---
  const handleNpcInteract = (npcId, actionType) => {
    const targetNpc = activeNpcs.find(n => n.id === npcId);

    if (actionType === 'GIFT') {
      // 打开赠礼弹窗
      setModalState({ type: 'GIFT', data: targetNpc });
      return;
    }

    if (actionType === 'PROPOSE') {
      // 打开劝生弹窗前检查条件
      const check = checkInteractionAllowed(targetNpc, 'PERSUADE');
      if (!check.allowed) {
        showResult('无法劝生', check.reason, false);
        return;
      }
      setModalState({ type: 'NEGOTIATE', data: targetNpc });
      return;
    }

    if (actionType === 'SPAR') {
      // 切磋：友好切磋，不会死亡，增加好感和经验
      const check = checkInteractionAllowed(targetNpc, 'SPAR');
      if (!check.allowed) {
        showResult('无法切磋', check.reason, false);
        return;
      }
      
      // 使用战斗引擎模拟切磋
      const playerWithStats = {
        ...player,
        combatStats: player.combatStats || { maxHp: 100, maxMp: 50, atk: 10, def: 5, hp: 100, mp: 50 }
      };
      
      const npcWithStats = {
        ...targetNpc,
        combatStats: targetNpc.combatStats || { maxHp: 100, maxMp: 50, atk: 10, def: 5, hp: 100, mp: 50 }
      };
      
      const battleResult = simulateCombat(playerWithStats, npcWithStats);
      const playerWon = battleResult.winner === 'player';
      
      // 更新NPC状态和生成日志
      setActiveNpcs(prev => prev.map(n => {
        if (n.id === npcId) {
          const oldRel = n.relationship || {};
          const oldAff = oldRel.affection || 0;
          
          // 切磋增加好感（胜负都增加，但程度不同）
          const affectionGain = playerWon ? 3 : 5; // 输了反而增加更多好感（心服口服）
          
          let updated = {
            ...n,
            relationship: {
              ...oldRel,
              affection: Math.min(100, oldAff + affectionGain)
            }
          };
          
          // 生成切磋日志
          updated = generateSparLog(updated, player, Math.floor(player.age), player.time.month, !playerWon);
          updated = markNpcLoggedThisMonth(updated);
          return updated;
        }
        return n;
      }));
      
      // 玩家获得经验
      setPlayer(p => ({
        ...p,
        currentExp: (p.currentExp || 0) + (playerWon ? 3 : 5) // 切磋获得经验
      }));
      
      // === 使用textEngine生成切磋文本 ===
      // 原代码保留作为备份：
      // showResult(
      //   playerWon ? '切磋胜利' : '切磋落败',
      //   playerWon 
      //     ? `你在切磋中战胜了 ${targetNpc.name}，${targetNpc.gender === '女' ? '她' : '他'}对你心服口服。`
      //     : `你在切磋中败给了 ${targetNpc.name}，但你从中学到了很多。`,
      //   true,
      //   { 好感: playerWon ? 3 : 5, 经验: playerWon ? 3 : 5 }
      // );
      
      const sparEvent = getUnifiedInteractionEvent(targetNpc, player, 'SPAR');
      showResult(
        playerWon ? '切磋胜利' : '切磋落败',
        sparEvent.description || (playerWon 
          ? `你在切磋中战胜了 ${targetNpc.name}，${targetNpc.gender === '女' ? '她' : '他'}对你心服口服。`
          : `你在切磋中败给了 ${targetNpc.name}，但你从中学到了很多。`),
        true,
        { 好感: playerWon ? 3 : 5, 经验: playerWon ? 3 : 5 }
      );
      
      // 检测是否被其他NPC目击
      handleWitnessCheck(targetNpc, 'SPAR');
      return;
    }

    if (actionType === 'DUAL_CULTIVATION') {
      // 双修：需要亲密关系，大幅提升双方修为
      const check = checkInteractionAllowed(targetNpc, 'DUAL_CULTIVATION');
      if (!check.allowed) {
        showResult('无法双修', check.reason, false);
        return;
      }
      
      // 佛修特殊判定：第一次双修只有1%概率同意
      const isBuddhaFirstTime = check.requiresCheck;
      if (isBuddhaFirstTime) {
        const success = Math.random() < check.checkRate;
        if (!success) {
          showResult(
            '双修被拒',
            `${targetNpc.name}闭目摇头："施主，贫僧虽对你动了凡心，但此事关乎戒律，贫僧...还需再思量。"你能感受到${targetNpc.gender === '女' ? '她' : '他'}内心的挣扎与矛盾。`,
            false
          );
          return;
        }
      }
      
      // 双修消耗灵石
      const cost = 50;
      if (player.resources.spiritStones < cost) {
        showResult('灵石不足', `双修需要消耗 ${cost} 灵石来布置阵法，当前灵石: ${player.resources.spiritStones}`, false);
        return;
      }
      
      // 计算修为增益 - 根据好感度提供额外加成
      const affection = targetNpc.relationship?.affection || 0;
      let baseGain = 20; // 基础修为增益
      let npcGainMultiplier = 1.0; // NPC获得的倍率
      
      // 好感度越高，双修效果越好
      if (affection >= 80) {
        npcGainMultiplier = 2.0; // 道侣级别，NPC获得双倍修为
        baseGain = 30; // 玩家也获得更多
      } else if (affection >= 60) {
        npcGainMultiplier = 1.5;
        baseGain = 25;
      } else if (affection >= 40) {
        npcGainMultiplier = 1.2;
        baseGain = 22;
      }
      
      const npcExpGain = Math.floor(baseGain * npcGainMultiplier);
      
      // 扣除灵石
      setPlayer(p => ({
        ...p,
        resources: {
          ...p.resources,
          spiritStones: Math.max(0, p.resources.spiritStones - cost)
        },
        // 玩家获得修为
        currentExp: (p.currentExp || 0) + baseGain
      }));
      
      // 更新NPC
      setActiveNpcs(prev => prev.map(n => {
        if (n.id === npcId) {
          const oldRel = n.relationship || {};
          const oldAff = oldRel.affection || 0;
          
          let updated = {
            ...n,
            // NPC根据好感度获得不同的修为增益
            currentExp: (n.currentExp || 0) + npcExpGain,
            relationship: {
              ...oldRel,
              affection: Math.min(100, oldAff + 5) // 双修增加亲密度
            },
            // 记录双修次数（用于佛修首次判定）
            dualCultivationCount: (n.dualCultivationCount || 0) + 1
          };
          
          // 生成双修日志（私密）
          updated = generateDualCultivationLog(updated, player, Math.floor(player.age), player.time.month);
          updated = markNpcLoggedThisMonth(updated);
          return updated;
        }
        return n;
      }));
      
      // 佛修初次双修的专属剧情
      let dualCultivationText;
      if (isBuddhaFirstTime) {
        dualCultivationText = `烛火摇曳，${targetNpc.name}似乎正在忍受极大的痛苦，额角冷汗滴落。你刚想靠近，却被${targetNpc.gender === '女' ? '她' : '他'}猛地拽入怀中，滚烫的体温几乎将你灼伤。\n\n向来洁白的僧袍凌乱不堪，${targetNpc.gender === '女' ? '她' : '他'}埋首在你颈窝，一口咬在你的锁骨上，既是惩罚也是索取。\n\n"什么清规戒律，什么大道飞升……"${targetNpc.gender === '女' ? '她' : '他'}声音破碎，带着绝望的沉沦，"若修佛的尽头没有你，这佛……不修也罢。"`;
      } else {
        dualCultivationText = `你与 ${targetNpc.name} 共修大道，灵气在经脉中交融流转。${affection >= 80 ? '心意相通，修为大增！' : affection >= 60 ? '灵犀相映，效果显著。' : '互有增益，略有所得。'}`;
      }
      
      showResult(
        '双修',
        dualCultivationText,
        true,
        { 
          好感: 5, 
          '你的经验': baseGain, 
          [`${targetNpc.name}的经验`]: npcExpGain,
          灵石: -cost 
        },
        true // 不自动关闭，因为是重要事件
      );
      
      // 🆕 推送新闻：双修事件（高好感度时有概率）
      if (affection >= 70 && Math.random() < 0.3) {
        pushToNewsBuffer(
          player.newsBuffer,
          'DUAL_CULTIVATION',
          {
            actor: player.name,
            target: targetNpc.name
          }
        );
      }
      
      // 检测是否被其他NPC目击（双修被目击概率很低但醋意很高）
      handleWitnessCheck(targetNpc, 'DUAL_CULTIVATION');
      return;
    }

    if (actionType === 'CHAT') {
      // 统一剧情触发系统
      // 整体概率：70%普通闲聊，30%专属事件（包括浪漫/亲情/身份专属/选项事件）
      
      // 1. 尝试触发统一剧情事件（子女/浪漫/身份专属）
      const unifiedEvent = getUnifiedInteractionEvent(targetNpc, player);
      
      if (unifiedEvent) {
        // 触发了专属剧情（浪漫/亲情/身份专属）
        setActiveNpcs(prev => prev.map(n => {
          if (n.id === npcId) {
            const oldRel = n.relationship || {};
            const oldAff = oldRel.affection || 0;
            
            return {
              ...n,
              relationship: {
                ...oldRel,
                affection: Math.min(100, oldAff + (unifiedEvent.affectionBonus || 2))
              }
            };
          }
          return n;
        }));
        
        // 显示剧情结果
        showResult(
          unifiedEvent.title || "互动",
          unifiedEvent.text,
          true,
          { 好感: unifiedEvent.affectionBonus || 2 }
        );
        return;
      }
      
      // 2. 如果没有触发统一剧情，尝试触发选项事件（15%概率）
      if (Math.random() < 0.15) {
        const event = getRandomEvent(targetNpc, player);
        
        if (event) {
          // 显示带选项的事件弹窗
          setModalState({
            type: 'EVENT',
            data: {
              npc: targetNpc,
              event: event
            }
          });
          return;
        }
      }
      
      // 3. 普通闲聊（大概率：约70-85%）
      const chatText = getChatText(targetNpc);
      const isBuddha = targetNpc.identity === '佛修';
      
      setActiveNpcs(prev => prev.map(n => {
        if (n.id === npcId) {
          // 佛修不通过闲聊获得好感
          if (n.identity === '佛修') {
            // 佛修也记录日志，但不增加好感
            let updated = generateChatLog(n, player, Math.floor(player.age), player.time.month);
            updated = markNpcLoggedThisMonth(updated);
            return updated;
          }
          const oldRel = n.relationship || {};
          const oldAff = oldRel.affection || 0;
          
          // 更新好感并生成日志
          let updated = {
            ...n,
            relationship: {
              ...oldRel,
              affection: oldAff + 2
            }
          };
          updated = generateChatLog(updated, player, Math.floor(player.age), player.time.month);
          updated = markNpcLoggedThisMonth(updated);
          return updated;
        }
        return n;
      }));
      
      // 显示结果 - 佛修不显示好感增加
      showResult(
        "闲聊",
        `你与 ${targetNpc.name} 攀谈。${targetNpc.gender === '女' ? '她' : '他'}道：\n"${chatText}"`,
        true,
        isBuddha ? {} : { 好感: 2 }
      );
      
      // 检测是否被其他NPC目击，触发吃醋
      handleWitnessCheck(targetNpc, 'CHAT');
    }

    // DETAIL 逻辑保持不变...
    if (actionType === 'DETAIL') {
      setSelectedNpc(targetNpc);
    }
  };
  
  // --- 处理互动被目击（吃醋系统）---
  const handleWitnessCheck = (targetNpc, actionType) => {
    // 检测是否有其他NPC目击
    const witnesses = checkWitnessEvent(player, targetNpc, activeNpcs, actionType);
    
    if (witnesses.length > 0) {
      setActiveNpcs(prev => prev.map(npc => {
        // 找到目击者
        const witness = witnesses.find(w => w.id === npc.id);
        if (!witness) return npc;
        
        // 计算醋意增加
        const increase = calculateJealousyIncrease(npc, targetNpc, actionType);
        if (increase === 0) return npc;
        
        // 应用醋意增加
        const event = applyJealousyIncrease(npc, targetNpc, actionType, increase);
        let updated = { ...npc, relationship: event.witnessName ? npc.relationship : npc.relationship };
        
        // 更新醋意值
        const oldJealousy = npc.relationship?.jealousy || 0;
        const newJealousy = Math.min(100, oldJealousy + increase);
        updated.relationship = {
          ...updated.relationship,
          jealousy: newJealousy,
          lastInteraction: player.time.month
        };
        
        // 记录情敌
        if (!updated.relationship.rivalNpcs) {
          updated.relationship.rivalNpcs = [];
        }
        if (!updated.relationship.rivalNpcs.includes(targetNpc.id)) {
          updated.relationship.rivalNpcs.push(targetNpc.id);
        }
        
        // 生成吃醋日志（私密）
        updated = generateJealousyLog(updated, player, player.time.year, player.time.month, targetNpc, newJealousy);
        
        // 中等醋意以上，有概率生成计划讨好的日志
        if (newJealousy >= 41 && Math.random() < 0.3) {
          updated = generatePleasePlanLog(updated, player, player.time.year, player.time.month);
        }
        
        // 🆕 推送新闻：吃醋事件（醋意较高时有概率）
        if (newJealousy >= 60 && Math.random() < 0.25) {
          pushToNewsBuffer(
            player.newsBuffer,
            'NPC_JEALOUSY',
            {
              actor: npc.name,
              target: player.name,
              rival: targetNpc.name
            }
          );
        }
        
        return updated;
      }));
      
      // 如果有高醋意的目击者，在日志中提示
      const highJealousyWitness = witnesses.find(w => {
        const j = w.relationship?.jealousy || 0;
        return j >= 60;
      });
      
      if (highJealousyWitness) {
        const level = getJealousyLevel(highJealousyWitness.relationship?.jealousy || 0);
        addLog(`你感觉到有人在注视着你...空气中似乎弥漫着一股微妙的气息。`);
      }
    }
  };

  // --- 2. 处理赠礼回调 ---
  const handleGiftConfirm = (item) => {
    const npc = modalState.data;
    
    // 防御性编程：检查npc是否存在
    if (!npc) {
      console.warn('No NPC found in modalState.data');
      return;
    }
    
    // 1. 从背包中移除物品
    const removedItem = removeItemFromInventory(item.instanceId);
    if (!removedItem) {
      showResult("赠礼失败", "物品不存在", false);
      return;
    }
    
    // 2. 根据物品计算好感变化（根据稀有度和类型）
    const rarityValue = {
      common: 5,
      uncommon: 10,
      rare: 20,
      epic: 35,
      legendary: 50
    };
    
    let baseChange = rarityValue[item.rarity] || 5;
    
    // 消耗品（丹药）额外加成
    if (item.type === 'consumable') {
      baseChange += 5;
    }
    
    // 武器、防具稀有度高的更受欢迎
    if (item.type === 'weapon' || item.type === 'armor') {
      baseChange += 3;
    }
    
    const change = Math.min(baseChange, 50); // 最多50好感
    
    // === 使用textEngine生成赠礼反应 ===
    // 原代码保留作为备份：
    // const msg = `你将 ${item.name} 赠予 ${npc.name}，${npc.gender === '女' ? '她' : '他'}${change > 15 ? '欣喜若狂' : change > 8 ? '非常高兴' : '表示感谢'}！`;
    
    const giftReaction = getGiftReaction(npc, item, player);
    const msg = giftReaction.description || `你将 ${item.name} 赠予 ${npc.name}，${npc.gender === '女' ? '她' : '他'}${change > 15 ? '欣喜若狂' : change > 8 ? '非常高兴' : '表示感谢'}！`;

    // 3. 更新 NPC 数据
    setActiveNpcs(prev => prev.map(n => {
      if (n.id === npc.id) {
        const oldRel = n.relationship || { affection: 0, trust: 0 };
      
        let updated = {
          ...n,
          relationship: {
            ...oldRel,
            affection: Math.min(100, (oldRel.affection || 0) + change)
          }
        };
        // 生成赠礼日志
        updated = generateGiftLog(updated, player, Math.floor(player.age), player.time.month, item.name, true);
        updated = markNpcLoggedThisMonth(updated);
        
        // 🆕 记录记忆：收到礼物
        MemoryManager.onReceiveGift(updated, { name: item.name }, change);
        
        return updated;
      }
      return n;
    }));

    // 4. 显示结果
    showResult(
      "赠礼",
      msg,
      true,
      { 好感: change }
    );
    
    // 检测是否被其他NPC目击
    handleWitnessCheck(npc, 'GIFT');
    
    // 🆕 推送新闻：高好感度送礼事件
    if (npc.relationship?.affection >= 60 && Math.random() < 0.3) {
      pushToNewsBuffer(
        player.newsBuffer,
        'NPC_PURSUIT',
        {
          actor: player.name,
          target: npc.name
        }
      );
    }
    
    // 5. 关闭弹窗
    setModalState({ type: null, data: null });
  };

  // --- 3. 处理劝生回调 ---
  const handleNegotiateConfirm = (strategy) => {
    const npc = modalState.data;
    
    // 防御性编程：检查npc是否存在
    if (!npc) {
      console.warn('No NPC found in modalState.data');
      return;
    }
    
    // 佛修特殊规则：必须先有过双修才能劝生
    const isBuddha = npc.identity === '佛修';
    const hasDualCultivated = (npc.dualCultivationCount || 0) > 0;
    
    if (isBuddha && !hasDualCultivated) {
      // 佛修未双修前劝生必定失败
      const failText = `${npc.name}轻声叹息："施主，诞子之事关乎清规戒律...贫僧心中虽有情愫，却仍放不下这身袈裟。还请施主莫要为难贫僧。"`;
      showResult("劝生失败", failText, false, null, false);
      return;
    }
    
    // 基础概率计算 (保持原有的逻辑，或者稍微优化)
    let successRate = npc.relationship?.affection || 0;
    if (strategy.strongAgainst.includes(npc.personality?.label || "")) successRate += 30;
    else if (strategy.weakAgainst.includes(npc.personality?.label || "")) successRate -= 20;
    
    // 判定成功/失败
    const isSuccess = Math.random() * 100 < successRate;

    // --- 调用引擎获取剧情文案 ---
    const storyText = getPersuadeText(npc, strategy, isSuccess);

    if (isSuccess) {
       // 生成男性怀孕决定日志
       const updatedNpc = generatePregnancyDecisionLog(npc, player, Math.floor(player.age), player.time.month);
       
       // 🆕 记录记忆：怀孕开始
       MemoryManager.onPregnancyStart(updatedNpc);
       
       setActiveNpcs(prev => prev.map(n => n.id === npc.id ? { 
         ...updatedNpc, 
         isPregnant: true, 
         pregnancyProgress: 0 
       } : n));
       showResult("劝生成功", storyText, true, null, false); // 不自动关闭，让玩家看完感人的话
    } else {
       showResult("劝生失败", storyText, false, null, false);
    }
  };

  // --- 4. 优化日常操作 (Action Tab) ---
  const handleDailyAction = (type) => {
    if (type === 'CULTIVATE') {
      const gain = 10 + Math.floor(Math.random() * 5);
      setPlayer(p => ({ ...p, currentExp: p.currentExp + gain }));
      showResult("修炼完毕", "你运转周天，感觉灵气在经脉中奔涌。", true, { 修为: gain });
    }
    if (type === 'WORK') {
      const wage = 15;
      setPlayer(p => ({ ...p, resources: { ...p.resources, spiritStones: p.resources.spiritStones + wage } }));
      showResult("打工结束", "你在坊市帮人画了一天的低级符箓，腰酸背痛。", true, { 灵石: wage });
    }
  };

  // 2. 新增：下山采购逻辑
  const handleShopping = () => {
    // 1. 扣除消耗
    const cost = 10;
    if (player.resources.spiritStones < cost) {
      showResult("灵石不足", `下山采购需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
      return;
    }
    
    setPlayer(p => ({ ...p, resources: { ...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost) } }));
    
    // 2. 随机生成3-5个商品
    const itemCount = 3 + Math.floor(Math.random() * 3);
    const shopItems = [];
    
    // 商品池（根据物品等级）
    const shopPool = {
      common: [
        { id: 'herb_bandage', basePrice: 15 },
        { id: 'rice_ball', basePrice: 10 }
      ],
      uncommon: [
        { id: 'beast_fang', basePrice: 80 },
        { id: 'beast_core', basePrice: 120 },
        { id: 'iron_sword', basePrice: 100 }
      ],
      rare: [
        { id: 'foundation_pill', basePrice: 350 },
        { id: 'thunder_wood', basePrice: 400 },
        { id: 'iron_armor', basePrice: 450 }
      ],
      epic: [
        { id: 'core_pill', basePrice: 800 },
        { id: 'artifact_supreme', basePrice: 1200 },
        { id: 'marrow_wash', basePrice: 900 }
      ],
      legendary: [
        { id: 'nascent_fruit', basePrice: 2500 },
        { id: 'heaven_manual', basePrice: 3000 }
      ]
    };
    
    // 根据玩家境界调整商品品质概率
    const tierLevel = getTierLevel(player.tier);
    let rarityWeights = { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 };
    
    // 高境界玩家遇到高品质物品概率更高
    if (tierLevel >= 5) { // 筑基及以上
      rarityWeights = { common: 20, uncommon: 35, rare: 30, epic: 12, legendary: 3 };
    } else if (tierLevel >= 10) { // 金丹及以上
      rarityWeights = { common: 10, uncommon: 20, rare: 35, epic: 25, legendary: 10 };
    }
    
    // 生成商品
    for (let i = 0; i < itemCount; i++) {
      const rarity = weightedRandomRarity(rarityWeights);
      const pool = shopPool[rarity];
      if (pool && pool.length > 0) {
        const template = pool[Math.floor(Math.random() * pool.length)];
        const item = createItemInstance(template.id);
        if (item) {
          // 价格波动 ±20%
          const priceVariation = 0.8 + Math.random() * 0.4;
          item.price = Math.floor(template.basePrice * priceVariation);
          shopItems.push(item);
        }
      }
    }
    
    // 3. 打开商店弹窗
    setModalState({
      type: 'SHOP',
      data: { items: shopItems }
    });
  };
  
  // 辅助函数：获取境界等级
  const getTierLevel = (tierName) => {
    const tiers = [
      '凡人', '炼气初期', '炼气中期', '炼气后期', '炼气圆满',
      '筑基初期', '筑基中期', '筑基后期', '筑基圆满',
      '金丹初期', '金丹中期', '金丹后期', '金丹圆满',
      '元婴初期', '元婴中期', '元婴后期', '元婴圆满'
    ];
    const index = tiers.indexOf(tierName);
    return index >= 0 ? index : 0;
  };
  
  // 辅助函数：根据权重随机选择稀有度
  const weightedRandomRarity = (weights) => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (const [rarity, weight] of Object.entries(weights)) {
      if (random < weight) return rarity;
      random -= weight;
    }
    return 'common';
  };

  // 3. 保留原有的外出游历逻辑（用于情缘面板）
  const handleExplore = () => {
    // 1. 检查并扣除消耗
    const cost = 5;
    if (player.resources.spiritStones < cost) {
      showResult("灵石不足", `外出游历需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
      return;
    }
    setPlayer(p => ({ ...p, resources: { ...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost) } }));
    
    // 2. 概率判定
    if (Math.random() < 0.4) { // 提高一点概率方便测试
      const newNpc = generateRandomNpc(player.tier);
      
      // 添加到列表
      setActiveNpcs(prev => [newNpc, ...prev]);

      // 生成初识剧情文案
      let meetDesc = "";
      if (newNpc.identity === "落魄散修") meetDesc = `你在荒山破庙避雨，看见一名${newNpc.identity}正对着篝火发呆。他${newNpc.appearance}，虽衣衫褴褛，却难掩眉宇间的英气。`;
      else if (newNpc.identity === "宗门天骄") meetDesc = `宗门大比的看台上，你远远瞥见一位${newNpc.identity}。${newNpc.appearance}，所到之处众星捧月，但他似乎对周遭的喧嚣毫无兴趣。`;
      else if (newNpc.identity === "魔教护法") meetDesc = `夜探黑市时，你无意撞破了一场交易。那${newNpc.identity}转过身来，${newNpc.appearance}，嘴角噙着一抹危险的笑意。`;
      else meetDesc = `在坊市熙攘的人群中，你不小心撞到了一位${newNpc.identity}。他${newNpc.appearance}，正低头把玩着手中的${newNpc.desc.includes("玉") ? "玉佩" : "法器"}。`;

      // 3. 弹出初识剧情窗 (autoClose: false)
      showResult(
        `偶遇：${newNpc.name}`, 
        meetDesc, 
        true, 
        null, 
        false // 关键：禁止自动关闭，让玩家慢慢看
      );

    } else {
      showResult("游历归来", "你游历了一番，看了看风景，心情略微舒畅，但并未遇到特别之人。", false, { 灵石: -5 });
    }
  };

  // 剧情回调
  const handleOptionSelect = (npcId, option) => {
    // 处理条件检查，带成功/失败分支
    let outcome = option;
    if (option.check) {
      const passed = option.check(player);
      outcome = passed ? option.success : option.fail;
    }

    // 防御性编程：确保 change 存在
    const changes = outcome?.change || {};
    const resultFlag = outcome?.result || option.result;

    // 更新NPC状态
    setActiveNpcs(prev => prev.map(n => {
      if (n.id === npcId) {
        // 防御性编程：确保relationship存在
        const oldRel = n.relationship || { affection: 0, trust: 0, jealousy: 0, stage: 0 };
        const newStats = { ...oldRel };
        
        if (changes.affection !== undefined) {
          newStats.affection = Math.min(100, Math.max(0, (newStats.affection || 0) + changes.affection));
        }
        if (changes.trust !== undefined) {
          newStats.trust = Math.min(100, Math.max(0, (newStats.trust || 0) + changes.trust));
        }
        if (changes.jealousy !== undefined) {
          newStats.jealousy = Math.min(100, Math.max(0, (newStats.jealousy || 0) + changes.jealousy));
        }
        
        // 处理 stageUp
        let newStage = oldRel.stage || 0;
        if (changes.stageUp) {
          const currentAffection = newStats.affection || 0;
          if (currentAffection >= 80) newStage = 3;
          else if (currentAffection >= 50) newStage = 2;
          else if (currentAffection >= 20) newStage = 1;
          else newStage = 0;
        }
        
        return { ...n, relationship: { ...newStats, stage: newStage } };
      }
      return n;
    }));
    
    const msg = outcome?.msg || "";
    addLog(`【互动】${msg}`);
    
    // 显示结果弹窗，showResult会自动覆盖modalState，无需手动关闭事件弹窗
    showResult(
      "事件结果", 
      msg, 
      resultFlag === "good", 
      {
        好感: changes.affection || 0,
        信任: changes.trust || 0,
        醋意: changes.jealousy || 0
      }, 
      false
    );
    
    setSelectedNpc(null);
  };

  // --- 逻辑 A: 处理开局选择 ---
  const handlePrologueFinish = () => {
    // 直接开始游戏，不再有选择奖励
    addLog("你的逆天之路由此开启...");
    
    // 为初始NPC生成初遇剧情日志
    setActiveNpcs(prev => prev.map(npc => {
      if (npc.id === 1 || npc.id === 2) {
        return generateFirstMeetLog(npc, player, player.time.year, player.time.month);
      }
      return npc;
    }));
    
    setGameStage('MAIN');
  };

  // --- 存档逻辑 ---
  const handleSave = () => {
    // === 使用saveSystem统一管理存档 ===
    // 原代码保留作为备份：
    // const gameState = {
    //   player,
    //   children,
    //   activeNpcs,
    //   deadNpcs,
    //   gameStage,
    //   logs,
    //   inventory,
    //   messages: messageManager.toJSON(),
    //   lastMessageCheck,
    // };
    // return saveGameToStorage(gameState);
    
    const gameState = {
      player,
      children,
      activeNpcs,
      deadNpcs,
      gameStage,
      logs,
      inventory,
      messages: messageManager.toJSON(),
      lastMessageCheck,
      // 新增：保存更多游戏状态
      pendingSectChoices,
      testQueue,
      worldEvents: player.worldEvents || [],
      newsBuffer: player.newsBuffer || []
    };
    
    const result = saveGameToStorage(gameState);
    if (result.success) {
      alert(`游戏已保存！\\n保存时间：${result.time}`);
    } else {
      alert('保存失败：' + (result.error?.message || '未知错误'));
    }
    return result;
  };

  const handleLoad = () => {
    // === 使用saveSystem统一管理读档 ===
    // 原代码保留作为备份（见上方handleSave注释）
    
    const savedData = loadGameFromStorage();
    if (!savedData) {
      alert('没有找到存档！');
      return;
    }
    
    try {
      // 恢复数据
      setPlayer(savedData.player);
      setChildren(savedData.children || []);
      setActiveNpcs(savedData.activeNpcs || []);
      setDeadNpcs(savedData.deadNpcs || []);
      setGameStage(savedData.gameStage || 'MAIN');
      setLogs(savedData.logs || []);
      setInventory(savedData.inventory || []);
      
      // 恢复消息中心数据
      if (savedData.messages) {
        messageManager.loadFromData(savedData.messages);
        setMessages(messageManager.getAllMessages());
      }
      if (savedData.lastMessageCheck) {
        setLastMessageCheck(savedData.lastMessageCheck);
      }
      
      // 恢复其他状态
      if (savedData.pendingSectChoices) {
        setPendingSectChoices(savedData.pendingSectChoices);
      }
      if (savedData.testQueue) {
        setTestQueue(savedData.testQueue);
      }
      
      // 读档后重置UI状态
      setIsAuto(false);
      setSelectedChild(null);
      setModalState({ type: null, data: null });
      
      alert(`读取成功！欢迎回来，道友。\\n存档时间：${savedData.saveDate || '未知'}`);
    } catch (error) {
      console.error('读档失败:', error);
      alert('读档失败：数据可能已损坏');
    }
  };

  const handleResetGame = () => {
    // 强制刷新页面，这是最彻底的重置方式
    window.location.reload();
  };

  // --- 逻辑 B: 处理复仇行动 ---
  const handleRevengeAction = (action) => {
    if (action === 'SABOTAGE') {
      const cost = 50;
      if (player.resources.spiritStones < cost) {
        showResult("灵石不足", `散布谣言需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
        return;
      }
      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost)}}));
      // 散布谣言削弱宿敌修为
      setPlayer(prev => ({
        ...prev,
        rival: {
          ...prev.rival,
          currentExp: Math.max(0, (prev.rival?.currentExp || 0) - 100)
        }
      }));
      showResult("行动成功", "楚清瑶在家族中受到了长老的训斥，修为受损。", true);
    }
    else if (action === 'DEFEND') {
      const cost = 20;
      if (player.resources.spiritStones < cost) {
        showResult("灵石不足", `布置防御需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
        return;
      }
      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost)}}));
      // 注意：应该使用 player.rival.threatLevel，这个rival状态已废弃
      setPlayer(prev => ({
        ...prev,
        rival: {
          ...prev.rival,
          threatLevel: Math.max(0, (prev.rival?.threatLevel || 0) - 20)
        }
      }));
      showResult("隐匿成功", "你更换了藏身之处，暂时避开了楚家的耳目。", true);
    }
    else if (action === 'DUEL') {
      const myCP = calculateCombatPower(player);
      // 计算宿敌战力
      const rivalEntity = {
        currentExp: player.rival?.currentExp || 300,
        stats: { aptitude: 80 },
        constitution: true
      };
      const rivalCP = calculateCombatPower(rivalEntity);
      
      if (myCP > rivalCP) {
        // 更新player.rival状态为已死亡
        setPlayer(prev => ({
          ...prev,
          rival: {
            ...prev.rival,
            isDead: true,
            state: "DEAD",
            threatLevel: 0
          }
        }));
        showResult("大仇得报！", "在决战中，你一剑刺穿了楚清瑶的气海。看着她难以置信的眼神，你终于夺回了属于你的一切！", true, null, false);
        addLog("【结局】你击败了宿敌楚清瑶，心魔尽去，大道可期！");
      } else {
        // 失败惩罚：重伤掉修为
        setPlayer(p => ({ ...p, currentExp: 0, stats: {...p.stats, health: 10} }));
        showResult("战败", "你技不如人，重伤遁逃，修为尽失！", false);
      }
    }
  };

  // 3. 新增：自动时间流逝的副作用
  // 使用 setTimeout 递归调用，比 setInterval 更安全，防止状态闭包问题
  // --- 新增：产业相关处理函数 ---
  /**
   * 购买产业
   * @param {Object} biz 产业对象
   * @param {String} childId 掌柜ID
   */
  const handleBuyBusiness = (biz, childId) => {
    // 检查是否有足够的灵石
    if (player.resources.spiritStones < biz.cost) {
      showResult("购买失败", "灵石不足", false);
      return;
    }

    // 检查是否满足境界要求
    // 这里简化处理，实际应该比较境界等级
    
    // 检查灵石是否足够
    if (player.resources.spiritStones < biz.cost) {
      showResult("灵石不足", `购买${biz.name}需要 ${biz.cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
      return;
    }

    // 计算收益 (基础收益 * (1 + 掌柜智力/100))
    const manager = children.find(c => c.id === childId);
    const income = Math.floor(biz.baseIncome * (1 + manager.stats.intelligence / 100));

    // 更新玩家数据
    setPlayer(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        spiritStones: Math.max(0, prev.resources.spiritStones - biz.cost)
      },
      businesses: [
        ...prev.businesses,
        {
          id: `${biz.id}-${Date.now()}`,
          name: biz.name,
          managerId: childId,
          baseIncome: biz.baseIncome,
          income: income,
          type: biz.id
        }
      ]
    }));

    // 更新子嗣状态，标记为有工作
    setChildren(prev => prev.map(c => c.id === childId ? {...c, job: biz.id} : c));

    showResult(
      "产业购买成功",
      `你花费${biz.cost}灵石购买了【${biz.name}】，并任命${manager.name}为掌柜。预计月收入: ${income}灵石`,
      true
    );
  };

  /**
   * 探索秘境
   * @param {Object} realm 秘境对象
   * @param {Array} team 队伍成员
   */
  const handleExploreRealm = (realm, team) => {
    // 检查灵石
    if (player.resources.spiritStones < realm.cost) {
      showResult("探索失败", `探索${realm.name}需要 ${realm.cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
      return;
    }

    // === 🆕 优化探险事件生成 ===
    // 原代码保留作为备份：
    // const firstEvent = getRandomExplorationEvent({ realmId: realm.id, progress: 1 });
    
    // 扣费并初始化探险状态机
    setPlayer(prev => ({
      ...prev,
      resources: { ...prev.resources, spiritStones: Math.max(0, prev.resources.spiritStones - realm.cost) }
    }));

    setExploreRealmState({ id: realm.id, name: realm.name, total: 10 });
    setExploreTeamIds(team);
    setExploreProgress(1);
    
    // 生成更详细的探险日志
    const teamNames = team.map(id => children.find(c => c.id === id)?.name).filter(Boolean).join('、');
    const startLog = `【${realm.name}】探险开始！队伍成员：${teamNames || '独自一人'}`;
    setExploreLog([
      startLog,
      `你踏入【${realm.name}】的边缘，感受到浓郁的灵气扑面而来。`,
      `秘境难度：${realm.difficulty}，推荐战力：${realm.recommendCP}`
    ]);
    
    // 使用explorationEvents生成首个事件，传入完整上下文
    const firstEvent = getRandomExplorationEvent({ 
      realmId: realm.id, 
      progress: 1,
      player,
      inventory,
      team
    });
    
    setCurrentExploreEvent(firstEvent);
    setIsExploring(true);
    
    // 记录探险日志到主日志
    addLog(startLog, 'exploration');
  };

  // 处理测灵完成
  const handleTestFinish = (child) => {
    // 1. 标记为已测试
    // 2. 根据灵根重新计算属性 (之前是凡人属性，现在觉醒了)
    // 3. 这里的 child 是测试后的完整数据，包含spiritRoot等信息
    
    setChildren(prev => prev.map(c => {
      if (c.id === child.id) {
        const updated = {
          ...c,
          isTested: true,
          spiritRoot: child.spiritRoot
        };
        return recalcCombatStatsWithEquip(updated);
      }
      return c;
    }));

    // 不在这里移出队列，由 onClose 统一处理
    // setTestQueue(prev => prev.filter(c => c.id !== child.id));
  };

  // --- 核心时间推进逻辑 (修改为支持自动模式) ---
  const handleNextMonth = useCallback((isAutoMode = false) => {
    let newLogs = [];

    // --- 自动模式下的日志优化 ---
    // 如果是自动模式，普通月份不记录日志，只有重要事件才记录
    const shouldLog = (msg) => {
      if (!isAutoMode) return true; // 手动模式全记录
      // 自动模式下，过滤掉“岁月静好”这种废话，只留重要事件
      return !msg.includes("岁月静好");
    };

    // 1. NPC怀孕进度 - 先收集所有需要出生的孩子
    let newBabies = [];
    let newSkillPoints = 0; // 记录本次新增的技能点
    const updatedNpcs = activeNpcs.map(npc => {
      if (npc.isPregnant) {
        const newProgress = npc.pregnancyProgress + 1;
        if (newProgress >= 9) { // 9个月怀孕期
          // 生成孩子（使用云澜历年份）
          const child = generateChild(player, npc, Math.floor(player.age));
          newBabies.push(child);
          newLogs.push(`【诞子】${npc.name}为你诞下一子：${child.name}（${child.gender}，天赋${child.tier}）`);
          
          // 📰 添加到新闻缓存
          pushToNewsBuffer(
            player.newsBuffer || [],
            'BIRTH',
            { actor: player.name, target: child.name, detail: child.gender }
          );
          
          // 每生一个子嗣，主角获得1点技能点
          newSkillPoints += 1;
          
          // 生成男性分娩日志（重大事件，私密）
          // 注：玩家是女性，攻略对象都是男修，所以只有男性会生子
          let updatedNpc = generateMaleBirthLog(npc, player, Math.floor(player.age), player.time.month, child.name);
          
          // 🆕 记录记忆：生子里程碑
          const birthDifficulty = Math.random() > 0.7 ? "难产" : "顺利";
          const hasSacrifice = Math.random() > 0.85; // 15% 概率损耗修为
          MemoryManager.onChildBirth(updatedNpc, child, {
            difficulty: birthDifficulty,
            sacrifice: hasSacrifice
          });
          
          // 重置NPC状态
          return { ...updatedNpc, isPregnant: false, pregnancyProgress: 0 };
        }
        return { ...npc, pregnancyProgress: newProgress };
      }
      return npc;
    });
    
    // 更新NPC状态
    setActiveNpcs(updatedNpcs);

    // 2. 孩子成长
    // 调用成长逻辑，传入玩家当前资源
    const { newChildren: grownChildren, totalCost, logs: growLogs, events: childEvents } = processChildrenGrowth(children, player.resources);
    
    // 3. 统一处理所有孩子 - 合并+去重
    // 直接使用成长后的所有孩子作为基础
    let finalChildren = [...grownChildren];
    
    // 4. 处理灵根生成和测试队列
    // 修改：使用范围判断而不是严格相等，确保6岁到6岁半之间都能触发
    const readyToTest = finalChildren.filter(c => {
      const ageInMonths = Math.floor(c.age * 12);
      return ageInMonths >= 72 && ageInMonths < 78 && !c.isTested && !c.spiritRoot;
    });
    if (readyToTest.length > 0) {
      // 为每个准备测灵的孩子生成灵根
      finalChildren = finalChildren.map(child => {
        // 如果是准备测灵的孩子，且还没有灵根，生成灵根
        if (readyToTest.some(c => c.id === child.id) && !child.spiritRoot) {
          // 生成灵根
          const aptitude = child.stats?.aptitude || 50;
          // 这里需要调用generateSpiritRootDetails函数，但是它在mechanics.js中是未导出的
          // 所以我们直接复制该函数的逻辑
          const config = getRootConfigByValue(aptitude);
          let elements = [];
          let typeName = config.name;
          let typeDesc = config.desc;

          if (config.id === 'NONE') {
            elements = [];
          } else if (config.id === 'MUTANT') {
            // 变异灵根：随机取一个变异属性
            elements = [MUTANT_ELEMENTS[Math.floor(Math.random() * MUTANT_ELEMENTS.length)]];
          } else {
            // 普通灵根：从五行里随机抽 config.elementCount 个
            const shuffled = [...ELEMENTS].sort(() => 0.5 - Math.random());
            elements = shuffled.slice(0, config.elementCount);
          }

          const spiritRoot = {
            type: typeName,
            elements: elements,
            desc: typeDesc,
            color: config.color,
            multiplier: config.multiplier // 战斗力加成系数
          };
          
          // 标记为已测灵
          const updatedChild = { ...child, spiritRoot: spiritRoot, isTested: true };
          
          // 孙辈自动测灵，不弹窗
          if ((child.generation || 1) > 1) {
            newLogs.push(`🔮 【自动测灵】${child.name} 已满六岁，灵根为【${spiritRoot.type}】（资质${aptitude}）`);
          }
          
          return updatedChild;
        }
        return child;
      });
      
      // 只有第一代子嗣才加入测试队列（需要弹窗）
      const testQueueChildren = finalChildren.filter(c => 
        readyToTest.some(r => r.id === c.id) && (c.generation || 1) === 1
      );
      if (testQueueChildren.length > 0) {
        setTestQueue(prev => [...prev, ...testQueueChildren]);
        // 如果是自动模式，有测灵事件时暂停
        if (isAuto) setIsAuto(false);
      }
    }
    
    // 5. 添加新出生的孩子到最终列表
    if (newBabies.length > 0) {
      finalChildren = [...finalChildren, ...newBabies];
    }
    
    // 6. 最终统一更新children状态（不再需要去重，因为newBabies是新生成的，ID唯一）
    setChildren(finalChildren);
    
    // 统计孙辈出生数量，每个孙辈增加1技能点
    const grandchildBirthEvents = childEvents.filter(e => e.type === 'GRANDCHILD_BIRTH');
    newSkillPoints += grandchildBirthEvents.length;
    
    // 如果有新增技能点，给予提示
    if (newSkillPoints > 0) {
      newLogs.push(`🎁 【家族繁荣】新增后代${newSkillPoints}人，获得${newSkillPoints}点技能点！可在玩家面板分配。`);
    }
    
    // 合并成长日志
    newLogs = [...newLogs, ...growLogs];
    
    // 处理子嗣特殊事件 (如抓周、入宗门)
    if (childEvents.length > 0) {
      // 抓周类事件仍然即时弹窗
      childEvents.filter(e => e.type === 'ZHAOZHOU').forEach(event => {
        showResult(event.title, event.message, true, null, false);
      });

      // 入宗事件统一入队，按名字排序后一次性合并到队列，保证每个子嗣都会被依次处理
      const joinEvents = childEvents.filter(e => e.type === 'JOIN_SECT');
      if (joinEvents.length > 0) {
        // 合并旧队列与新事件后按子嗣名字排序
        setPendingSectChoices(prev => {
          const merged = [...prev, ...joinEvents];
          merged.sort((a, b) => {
            const n1 = (a.child?.name || '').localeCompare(b.child?.name || '');
            return n1;
          });
          return merged;
        });
        if (isAuto) setIsAuto(false);
      }
    }
    
    // --- 新增：计算产业收益 ---
    if (player.businesses.length > 0) {
      // 使用最新的子嗣列表计算产业收益
      const { income: businessIncome, logs: businessLogs } = calculateBusinessIncome(player.businesses, finalChildren);
      newLogs = [...newLogs, ...businessLogs];
      
      // 如果有收益，添加到日志
      if (businessIncome > 0) {
        newLogs.push(`💰 产业收益: ${businessIncome} 灵石`);
      }
    }
    
    // --- 核心修改：计算所有子嗣的反哺总和 ---
     let totalFeedback = 0;
     // 遍历成长后的孩子，累加高质量反哺
     finalChildren.forEach(child => {
       totalFeedback += calculateChildFeedback(child);
     });

    // 3. 复仇系统更新（新版）
    // 3.1 更新宿敌威胁度（缓慢上升）
    if (player.rival && !player.rival.isDead) {
      updateThreatLevel(player);
      
      // 3.2 检查刺杀事件
      const assassinEvent = checkAssassinationEvent(player);
      if (assassinEvent) {
        if (assassinEvent.survived) {
          // 逃脱刺杀
          newLogs.push(`【危险】${assassinEvent.message}`);
          pushToNewsBuffer(
            player.newsBuffer || [],
            'ASSASSINATION_SURVIVED',
            { actor: player.name }
          );
        } else {
          // 被刺杀 - Game Over
          if (isAutoMode) setIsAuto(false);
          alert(assassinEvent.message);
          // 可以在这里添加游戏结束逻辑
        }
      }
      
      // 3.3 年度时间线事件（每12月触发）
      if (player.time.month === 12) {
        const timelineEvent = updateRivalTimeline(player);
        if (timelineEvent) {
          pushToNewsBuffer(
            player.newsBuffer || [],
            timelineEvent.type,
            timelineEvent.data
          );
        }
      }
    }
    
    // 4. 宿敌系统 - 威胁度增长和杀手追杀
    if (!player.rival?.isDead) {
      // 庶妹是天灵根绝世天才，成长速度极快
      const growth = 20 + Math.floor(Math.random() * 30);
      const currentThreat = player.rival?.threatLevel || 0;
      let newThreat = currentThreat + 2; // 威胁增长快一点

      // 触发战斗：威胁度必须 == 100（满值）才触发
      if (newThreat >= 100 && currentThreat < 100) {
         if (isAutoMode) setIsAuto(false); // 强制暂停
         
         // 1. 构造敌人实体 - 使用calculateCombatPower动态计算战力
         const rivalEntity = {
           currentExp: player.rival?.currentExp || 300,
           stats: { aptitude: 80 }, // 高资质
           constitution: true // 特殊体质加成
         };
         const enemyCombatPower = calculateCombatPower(rivalEntity);
         const enemyStats = {
           name: "杀手首领",
           combatStats: {
             hp: Math.floor(enemyCombatPower * 2.5), // 血量是战力的2.5倍
             atk: Math.floor(enemyCombatPower * 0.4), // 攻击是战力的0.4倍
             def: Math.floor(enemyCombatPower * 0.2), // 防御是战力的0.2倍
             mp: 0,
             maxHp: Math.floor(enemyCombatPower * 2.5),
             maxMp: 0
           }
         };

         // 2. 运行战斗引擎
         // 确保玩家有完整的combatStats属性
         const playerWithCombatStats = {
           ...player,
           combatStats: player.combatStats || {
             maxHp: 100,
             maxMp: 50,
             atk: 10,
             def: 5,
             hp: 100,
             mp: 50
           }
         };
         const battleResult = simulateCombat(playerWithCombatStats, enemyStats);

         // 3. 弹出窗口，等待玩家确认
         setCombatData({
           enemy: enemyStats,
           result: battleResult,
           context: 'rival'
         });

         // 暂时不在这里结算资源扣除，等玩家在弹窗点“确定”
         // 这里只重置威胁度，防止连续触发
         setPlayer(prev => ({
           ...prev,
           rival: {
             ...prev.rival,
             threatLevel: 0
           }
         }));
         
         // return; // 如果想完全阻断本月后续逻辑，可以return，但建议继续运行
      } else {
         // 没满100，正常更新宿敌修为和威胁度
         setPlayer(prev => {
           const newExp = (prev.rival?.currentExp || 0) + growth;
           return {
             ...prev,
             rival: {
               ...prev.rival,
               currentExp: newExp,
               threatLevel: Math.min(100, newThreat),
               // 简单模拟境界提升
               tier: newExp > 20000 ? "金丹初期" : (newExp > 5000 ? "筑基后期" : (prev.rival?.tier || "炼气初期"))
             }
           };
         });
      }
    }

    // 5. 玩家成长与资源结算
    setPlayer(prevPlayer => {
      // 时间更新
      const newTime = { ...prevPlayer.time };
      newTime.month += 1;
      if (newTime.month > 12) {
        newTime.month = 1;
        newTime.year += 1;
      }
      
      // 主角年龄增长（每月增加1/12岁）
      const newAge = (prevPlayer.age || 16) + 1/12;
      
      // 获取当前境界配置
      const tierConf = getTierConfig(prevPlayer.tier);
      
      // 使用统一的修炼速度计算函数（按月计算）
      const playerSpeed = calculateCultivationSpeed(prevPlayer, true);
      
      // 计算新经验：修炼速度 + 子嗣反馈
      let newExp = prevPlayer.currentExp + playerSpeed + totalFeedback;
      
      // 锁死上限：如果满了，就卡在 maxExp，强制玩家去点突破
      if (newExp >= tierConf.maxExp) {
        newExp = tierConf.maxExp;
        // 如果是自动模式，可以在这里自动暂停，或者提示
        if (isAuto) {
             // 可选：满级自动停止挂机
             // setIsAuto(false);
        }
      }

      // 计算产业收益
      const { income: businessIncome } = calculateBusinessIncome(prevPlayer.businesses, finalChildren);

      return {
        ...prevPlayer,
        age: newAge, // 更新年龄
        skillPoints: (prevPlayer.skillPoints || 0) + newSkillPoints, // 更新技能点
        time: newTime,
        currentExp: newExp, // 使用新经验
        maxExp: tierConf.maxExp, // 确保 maxExp 同步
        resources: {
          ...prevPlayer.resources,
          spiritStones: Math.max(0, prevPlayer.resources.spiritStones - totalCost + 10 + businessIncome)
        }
      };
    });

    // 6. 添加日志
    if (newLogs.length === 0) newLogs.push("岁月静好，无事发生...");
    
    newLogs.forEach(msg => {
      if (shouldLog(msg)) addLog(msg);
    });

    // --- 新增：为所有 NPC 生成本月日志 ---
    const nextMonth = player.time.month === 12 ? 1 : player.time.month + 1;
    // 使用玩家年龄作为年份（云澜历）
    const nextAge = player.time.month === 12 ? Math.floor(player.age) + 1 : Math.floor(player.age);
    
    // 先处理 NPC 生命周期（年龄、寿元、修为推进）
    const lifecycleResult = processNpcLifecycles(updatedNpcs, player, nextAge, nextMonth);
    const npcsAfterLifecycle = lifecycleResult.npcs;
    const lifecycleEvents = lifecycleResult.events;
    
    // 分离存活和死亡的NPC
    const aliveNpcs = npcsAfterLifecycle.filter(npc => !npc.isDead);
    const newlyDeadNpcs = npcsAfterLifecycle.filter(npc => npc.isDead);
    
    // 将新死亡的NPC添加到死亡列表，并生成遗言消息
    if (newlyDeadNpcs.length > 0) {
      setDeadNpcs(prev => [...prev, ...newlyDeadNpcs]);
      
      // 为每个新死亡的NPC生成遗言
      newlyDeadNpcs.forEach(deadNpc => {
        const obituaryMsg = createObituaryMessage(deadNpc, player, { year: nextAge, month: nextMonth });
        messageManager.addMessage(obituaryMsg);
      });
      
      // 更新消息列表
      setMessages(messageManager.getAllMessages());
    }
    
    // --- 家书生成逻辑 ---
    // 每3个月检查一次是否有NPC发送家书
    if (nextMonth % 3 === 0) {
      aliveNpcs.forEach(npc => {
        // 只有不在玩家身边的NPC才会发送家书
        const isAway = npc.sect || npc.status === 'away';
        if (!isAway) return;
        
        // 检查距离上次发送消息的时间
        const lastCheck = lastMessageCheck[npc.id] || 0;
        const currentMonthIndex = nextAge * 12 + nextMonth;
        const monthsSinceLastMessage = currentMonthIndex - lastCheck;
        
        // 判断是否应该发送家书
        if (shouldSendLetter(npc, monthsSinceLastMessage)) {
          // 异步生成家书
          createLetterMessage(
            npc, 
            player, 
            { year: nextAge, month: nextMonth }, 
            true,
            {
              apiKey: localStorage.getItem('game_api_key') || '',
              apiUrl: localStorage.getItem('game_api_url') || 'https://api.deepseek.com/chat/completions',
              apiModel: localStorage.getItem('game_api_model') || 'deepseek-chat',
              useAIForLetter: localStorage.getItem('useAIForLetter') !== 'false'
            }
          ).then(letterMsg => {
            messageManager.addMessage(letterMsg);
            setMessages(messageManager.getAllMessages());
          }).catch(err => {
            console.error('生成家书失败:', err);
          });
          
          // 更新上次检查时间
          setLastMessageCheck(prev => ({
            ...prev,
            [npc.id]: currentMonthIndex
          }));
        }
      });
      
      // 更新消息列表（在外层更新一次即可）
      setMessages(messageManager.getAllMessages());
    }
    
    // 记录生命周期事件日志
    lifecycleEvents.forEach(event => {
      if (event.type === 'NPC_DEATH') {
        newLogs.push(`💀 ${event.message}`);
        // 📰 添加到新闻缓存
        pushToNewsBuffer(
          player.newsBuffer || [],
          'DEATH',
          { 
            actor: event.npcName,
            detail: event.age || 0,
            location: '某地'
          }
        );
      } else if (event.type === 'NPC_BREAKTHROUGH') {
        newLogs.push(`⚡ ${event.message}`);
        // 📰 添加到新闻缓存
        pushToNewsBuffer(
          player.newsBuffer || [],
          'NPC_BREAKTHROUGH',
          {
            actor: event.npcName,
            detail: event.newTier
          }
        );
        
        // 🆕 高好感度NPC突破时，额外推送亲密新闻
        const npc = aliveNpcs.find(n => n.name === event.npcName);
        if (npc && npc.relationship?.affection >= 70 && Math.random() < 0.4) {
          pushToNewsBuffer(
            player.newsBuffer || [],
            'NPC_AFFECTION_HIGH',
            {
              actor: player.name,
              target: npc.name
            }
          );
        }
      } else if (event.type === 'NPC_BREAKTHROUGH_FAIL') {
        // 📰 添加到新闻缓存
        pushToNewsBuffer(
          player.newsBuffer || [],
          'BREAKTHROUGH_FAIL',
          {
            actor: event.npcName,
            detail: event.tier
          }
        );
      }
    });
    
    // 然后为所有存活的 NPC 生成日志
    const npcsWithLogs = generateMonthlyLogsForAll(aliveNpcs, player, nextAge, nextMonth);
    
    // --- 🆕 每月醋意检测和衰减 ---
    const npcsAfterJealousy = npcsWithLogs.map(npc => {
      if (!npc.jealousy) {
        npc.jealousy = 0; // 初始化醋意值
      }
      if (!npc.lastInteraction) {
        npc.lastInteraction = { year: nextAge, month: nextMonth }; // 初始化最后互动时间
      }
      
      // 检查长期冷落（3个月以上未互动）
      const currentMonthIndex = nextAge * 12 + nextMonth;
      const lastMonthIndex = npc.lastInteraction.year * 12 + npc.lastInteraction.month;
      const monthsSinceInteraction = currentMonthIndex - lastMonthIndex;
      
      // 如果超过3个月未互动，触发冷落检测
      if (monthsSinceInteraction >= 3) {
        const { jealousyGain, shouldLog: logNeglect } = checkNeglect(npc, monthsSinceInteraction);
        if (jealousyGain > 0) {
          npc.jealousy = Math.min(100, (npc.jealousy || 0) + jealousyGain);
          
          // 只在首次触发或每6个月提醒一次时生成日志
          if (logNeglect) {
            const neglectLog = generateJealousyLog(
              npc,
              npc.jealousy,
              { year: nextAge, month: nextMonth },
              player.name,
              'neglect'
            );
            if (neglectLog) {
              npc.logs = [...(npc.logs || []), neglectLog];
            }
          }
        }
      }
      
      // 醋意自然衰减（每月）
      if (npc.jealousy > 0) {
        const decay = calculateJealousyDecay(npc);
        npc.jealousy = Math.max(0, npc.jealousy - decay);
      }
      
      return npc;
    });
    
    setActiveNpcs(npcsAfterJealousy);
    
    // --- 新增：生成修仙大陆纪事（包含NPC相关事件） ---
    const worldEvents = generateMonthlyWorldEvents(nextAge, nextMonth, player, npcsWithLogs);
    
    // 尝试生成与玩家相关的事件（如子女在宗门的表现）
    const playerRelatedEvent = generatePlayerRelatedEvent(player, finalChildren, nextAge, nextMonth);
    if (playerRelatedEvent) {
      worldEvents.push(playerRelatedEvent);
    }
    
    // 将世界事件添加到日志，但不在 newLogs 中，直接添加到 logs 状态
    worldEvents.forEach(event => {
      addLog(event.message, event.category, event.type, event.title);
    });

    // --- 🆕 修真界邸报系统 ---
    // 每3个月（每季度）生成一期邸报
    
    if (nextMonth % 3 === 0) { // 每季度（3、6、9、12月）
      // 检查设置：是否启用邸报功能
      const gazetteEnabled = localStorage.getItem('enableGazette') !== 'false'; // 默认开启
      
      if (gazetteEnabled) {
        // 获取新闻缓存
        const newsBuffer = player.newsBuffer || [];
        
        // 如果新闻太少，添加填充新闻
        const finalNewsBuffer = newsBuffer.length > 0 ? newsBuffer : [
          { type: 'FILLER', data: {}, timestamp: Date.now() }
        ];
        
        // 获取设置
        const apiKey = localStorage.getItem('game_api_key') || '';
        const apiUrl = localStorage.getItem('game_api_url') || '';
        const apiModel = localStorage.getItem('game_api_model') || '';
        const useAIForGazette = localStorage.getItem('useAIForGazette') !== 'false';
        
        const settings = {
          enableGazette: true,
          apiKey,
          apiUrl,
          apiModel,
          useAIForGazette
        };
        
        // 异步生成邸报（不阻塞游戏流程）
        // 先清空新闻缓存，但不显示红点
        setPlayer(prev => ({
          ...prev,
          newsBuffer: [], // 清空新闻缓存
          hasUnreadGazette: false // 暂时不显示红点，等生成完成
        }));
        
        // generateGazette 返回的是对象而不是 Promise，需要包装为 Promise
        Promise.resolve(generateGazette(finalNewsBuffer, player, npcsWithLogs, (player.gazetteIssue || 0) + 1, settings))
          .then(gazette => {
            if (gazette) {
              // 生成完成后才更新状态并显示红点
              setPlayer(prev => ({
                ...prev,
                gazetteHistory: [...(prev.gazetteHistory || []), gazette], // 保存到历史
                gazetteIssue: gazette.issue,
                hasUnreadGazette: true // 内容已生成，显示红点
              }));
              
              // 设置当前邸报，但不自动弹出
              setCurrentGazette(gazette);
              // ❌ 不再自动弹窗，用户需手动点击左下角按钮查看
            }
          })
          .catch(error => {
            console.error('生成邸报失败:', error);
            // 失败时也要确保清空缓存
            setPlayer(prev => ({
              ...prev,
              newsBuffer: []
            }));
          });
      } else {
        // 即使不生成邸报，也要清空新闻缓存，避免堆积
        setPlayer(prev => ({
          ...prev,
          newsBuffer: []
        }));
      }
    }

    // --- 🌟 世界名人演化（每年执行一次）---
    if (nextMonth === 1) { // 每年1月
      const evolvedWorldNpcs = evolveWorldNpcs(player.worldNpcs || [], nextAge);
      setPlayer(prev => ({
        ...prev,
        worldNpcs: evolvedWorldNpcs
      }));
      
      // 检查是否有名人陨落，添加到新闻
      evolvedWorldNpcs.forEach(npc => {
        if (npc.status === 'DEAD' && npc.deathYear === nextAge) {
          pushToNewsBuffer(
            player.newsBuffer || [],
            'DEATH',
            {
              actor: `${npc.title} ${npc.name}`,
              detail: npc.age,
              location: npc.deathReason || '某地'
            }
          );
          addLog(`💀 震惊！天机榜${npc.rank ? `第${npc.rank}名` : ''}【${npc.title} ${npc.name}】${npc.deathReason}！`);
        }
      });
    }
  }, [children, player, activeNpcs, rival, testQueue, isAuto]);

  // 回调：玩家为子嗣选择宗门并分配职位
  const handleAssignSect = (childId, sectId, rank = '外门弟子') => {
    const sectObj = getSectById(sectId);

    // 检查互斥：若已有其他子嗣在互斥宗门，则拒绝并提示
    const conflict = children.find(c => c.sect && sectObj.exclusiveWith && sectObj.exclusiveWith.includes(c.sect.id));
    if (conflict) {
      showResult('入门失败', `${conflict.name} 已在【${conflict.sect.name}】，与【${sectObj.name}】互为敌对宗门，无法同时拜入。`, false);
      return;
    }

    setChildren(prev => prev.map(c => {
      if (c.id === childId) {
        const updated = { ...c, sect: sectObj, rank };
        
        // 🆕 为父母 NPC 记录子女拜师事件
        const parentNpc = activeNpcs.find(n => 
          n.name === c.fatherName || n.name === c.motherName
        );
        if (parentNpc) {
          MemoryManager.onChildJoinSect(parentNpc, c, sectObj.name);
        }
        
        // 生成离别消息（子女前往宗门）
        createLetterMessage(
          { 
            id: c.id, 
            name: c.name, 
            gender: c.gender,
            sect: sectObj.name,
            tier: c.tierTitle,
            affection: 100, // 子女对父母的好感度默认很高
          },
          player,
          { year: Math.floor(player.age), month: player.time.month },
          true,
          {
            apiKey: localStorage.getItem('game_api_key') || '',
            apiUrl: localStorage.getItem('game_api_url') || 'https://api.deepseek.com/chat/completions',
            apiModel: localStorage.getItem('game_api_model') || 'deepseek-chat',
            useAIForLetter: localStorage.getItem('useAIForLetter') !== 'false'
          }
        ).then(departureMsg => {
          messageManager.addMessage(departureMsg);
          setMessages(messageManager.getAllMessages());
        }).catch(err => {
          console.error('生成离别消息失败:', err);
        });
        
        // 📰 添加到新闻缓存
        pushToNewsBuffer(
          player.newsBuffer || [],
          'JOIN_SECT',
          {
            actor: player.name,
            target: c.name,
            detail: sectObj.name
          }
        );
        
        // === 🆕 自动分配宗门功法 ===
        const manualMessage = assignSectManual(updated, sectObj.name);
        if (manualMessage) {
          addLog(manualMessage, 'cultivation');
        }
        
        return recalcCombatStatsWithEquip(updated);
      }
      return c;
    }));

    // 从待选队列移除该事件
    setPendingSectChoices(prev => prev.filter(e => e.child.id !== childId));

    // 记录日志
    const childName = children.find(c => c.id === childId)?.name || '子嗣';
    addLog(`✅ ${childName} 已被收录入宗门（${sectObj.name}），开始享受宗门资源。`);
  };

  // --- 自动播放useEffect (放在handleNextMonth定义之后) ---
  useEffect(() => {
    let timer;
    if (isAuto) {
      const runAuto = () => {
        handleNextMonth(true); // 传入 true，表示这是自动触发的
        // 使用autoSpeed来控制速度：基础1秒除以速度倍率
        // 0.3倍速 = 3333ms, 1倍速 = 1000ms, 3倍速 = 333ms
        timer = setTimeout(runAuto, 1000 / autoSpeed);
      };
      timer = setTimeout(runAuto, 1000 / autoSpeed);
    }
    return () => clearTimeout(timer);
  }, [isAuto, autoSpeed, handleNextMonth]); // 依赖isAuto、autoSpeed和handleNextMonth函数

  // --- 排序改变时更新selectedChild ---
  useEffect(() => {
    if (selectedChild) {
      // 当排序改变时，确保selectedChild指向最新的子嗣数据
      const currentChild = children.find(c => c.id === selectedChild.id);
      if (currentChild && (
        currentChild.name !== selectedChild.name ||
        currentChild.cultivation !== selectedChild.cultivation ||
        currentChild.stats?.aptitude !== selectedChild.stats?.aptitude
      )) {
        setSelectedChild(currentChild);
      }
    }
  }, [childSort, children, selectedChild]);

  // 2. 新增：处理婚配 - 显示配偶选择界面
  const handleMarry = (childId) => {
    // 先查找子嗣
    const child = children.find(c => c.id === childId);
    if (!child) return;
    
    // 检查年龄是否满18岁（216个月）
    if (Math.floor(child.age * 12) < 216) {
      alert("子嗣尚未成年（需满18岁），无法安排婚配！");
      return;
    }
    
    // 扣除彩礼/嫁妆
    if (player.resources.spiritStones < 500) {
      alert("灵石不足500，无法操办婚事！");
      return;
    }

    // 生成三个候选配偶
    const candidates = generateSpouseCandidates(child.tierTitle || '凡人', child.gender);
    
    setSpouseCandidates(candidates);
    setMarryingChild(child);
    setShowSpouseSelection(true);
  };

  // 3. 新增：确认选择配偶
  const handleSpouseSelect = (selectedSpouse) => {
    if (!marryingChild) return;

    setChildren(prev => prev.map(c => {
      if (c.id === marryingChild.id) {
        // 🆕 为父母 NPC 记录子女成婚里程碑
        const parentNpc = activeNpcs.find(n => 
          n.name === c.fatherName || n.name === c.motherName
        );
        if (parentNpc) {
          MemoryManager.onChildMarriage(parentNpc, c, selectedSpouse.name);
          // 🆕 为父母 NPC 生成结婚日志
          const updatedParentNpc = generateMarriageLog(
            parentNpc, 
            player, 
            Math.floor(player.age), 
            player.time.month, 
            selectedSpouse.name
          );
          // 更新 activeNpcs 中的父母 NPC
          setActiveNpcs(npcs => npcs.map(n => 
            n.id === parentNpc.id ? updatedParentNpc : n
          ));
        }
        
        return { ...c, spouse: selectedSpouse };
      }
      return c;
    }));

    const cost = 500;
    if (player.resources.spiritStones < cost) {
      showResult("灵石不足", `安排婚事需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
      return;
    }
    setPlayer(p => ({...p, resources: {...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost)}}));
    addLog(`💍 花费500灵石，为 ${marryingChild.name} 选择了 ${selectedSpouse.name} 作为配偶，家族开枝散叶指日可待！`);
    
    // 关闭弹窗并清空状态
    setShowSpouseSelection(false);
    setSpouseCandidates([]);
    setMarryingChild(null);
  };

  // --- 新增：子嗣操作逻辑 ---
  const handleChildAction = (childId, actionType, payload) => {
    // 0. 闲聊 - 触发子女亲情剧情
    if (actionType === 'CHAT') {
      const targetChild = children.find(c => c.id === childId);
      if (!targetChild) return;

      // 标记为子女
      const childNpc = { 
        ...targetChild, 
        isChild: true,
        relationship: { affection: 100 } // 子女默认好感度100
      };

      // 调用统一剧情触发函数
      const unifiedEvent = getUnifiedInteractionEvent(childNpc, player);
      
      if (unifiedEvent) {
        // 触发了子女亲情剧情
        showResult(
          unifiedEvent.title || "亲子时光",
          unifiedEvent.text,
          true,
          null
        );
        return;
      }
      
      // 如果没有触发特殊剧情，显示普通闲聊
      const casualChats = [
        `${targetChild.name}拉着你的衣角，仰着小脸笑得很开心。`,
        `${targetChild.name}正在认真修炼，看到你来了，连忙起身行礼。`,
        `你摸了摸${targetChild.name}的头，${targetChild.gender === '男' ? '他' : '她'}害羞地笑了。`,
        `${targetChild.name}说："${player.gender === '女' ? '娘亲' : '爹爹'}，我今天又进步了一点点！"`,
        `${targetChild.name}缠着你讲修仙界的故事，听得津津有味。`
      ];
      
      showResult(
        "日常互动",
        casualChats[Math.floor(Math.random() * casualChats.length)],
        true,
        null
      );
      return;
    }

    // 0.5. 安排婚事
    if (actionType === 'MARRY') {
      handleMarry(childId);
      return;
    }

    // 1. 改名
    if (actionType === 'RENAME') {
      setChildren(prev => prev.map(c => c.id === childId ? { ...c, name: payload } : c));
      // 同时更新当前选中的对象，防止弹窗内容不跳
      setSelectedChild(prev => prev && prev.id === childId ? { ...prev, name: payload } : prev);
      showResult("更名成功", "族谱已更新。", true);
    }

    // 2. 赐予丹药 (花钱换修为)
    if (actionType === 'FEED_PILL') {
      const cost = 100;
      if (player.resources.spiritStones < cost) {
        showResult("失败", `赐予丹药需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
        return;
      }

      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost)}}));
      setChildren(prev => prev.map(c => {
        if (c.id === childId) {
          const gain = 500 * (1 + c.stats.aptitude / 100); // 资质越高，吸收越好
          const updated = { ...c, cultivation: c.cultivation + gain };
          return recalcCombatStatsWithEquip(updated);
        }
        return c;
      }));

      // 更新选中状态的数值（视觉反馈）
      setSelectedChild(prev => {
        if (prev && prev.id === childId) {
          const gain = 500 * (1 + prev.stats.aptitude / 100);
          return recalcCombatStatsWithEquip({ ...prev, cultivation: prev.cultivation + gain });
        }
        return prev;
      });

      showResult("赐药", `服下丹药，修为精进！`, true);
    }

    // 3. 亲自教导 (花钱换资质)
    if (actionType === 'EDUCATE') {
      const cost = 50;
      if (player.resources.spiritStones < cost) {
        showResult("失败", `亲自教导需要 ${cost} 灵石，当前灵石: ${player.resources.spiritStones}`, false);
        return;
      }

      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: Math.max(0, p.resources.spiritStones - cost)}}));
      setChildren(prev => prev.map(c => {
        if (c.id === childId) {
          const gain = 1;
          const newApt = Math.min(100, c.stats.aptitude + gain);
          const updated = { ...c, stats: { ...c.stats, aptitude: newApt } };
          return recalcCombatStatsWithEquip(updated);
        }
        return c;
      }));

      // 更新选中状态
      setSelectedChild(prev => {
        if (prev && prev.id === childId) {
          const newApt = Math.min(100, prev.stats.aptitude + 1);
          return recalcCombatStatsWithEquip({ ...prev, stats: { ...prev.stats, aptitude: newApt } });
        }
        return prev;
      });

      showResult("教导", `你悉心指点，${selectedChild?.name || '子嗣'} 似有所悟。(资质+1)`, true);
    }

    // 4. 打开背包/装备选择
    if (actionType === 'OPEN_INVENTORY') {
      setInventoryModal({
        open: true,
        mode: payload?.mode || 'VIEW',
        slot: payload?.slot || null,
        childId
      });
    }

    // 5. 卸下装备
    if (actionType === 'UNEQUIP') {
      const slot = payload?.slot;
      if (!slot) return;
      const target = children.find(c => c.id === childId);
      if (!target) return;
      const normalized = ensureEquipmentSlots(target);
      const oldItem = normalized.equipment[slot];
      if (!oldItem) return;

      setInventory(prev => [oldItem, ...prev]);
      setChildren(prev => prev.map(c => {
        if (c.id === childId) {
          const updated = { ...normalized, equipment: { ...normalized.equipment, [slot]: null } };
          return recalcCombatStatsWithEquip(updated);
        }
        return c;
      }));

      setSelectedChild(prev => {
        if (prev && prev.id === childId) {
          const updated = { ...normalized, equipment: { ...normalized.equipment, [slot]: null } };
          return recalcCombatStatsWithEquip(updated);
        }
        return prev;
      });
    }
    
    // === 🆕 6. 更换功法 ===
    if (actionType === 'CHANGE_MANUAL') {
      // 打开功法选择界面（可以通过modal实现）
      // 这里先实现一个简单版本：显示推荐功法列表
      const child = children.find(c => c.id === childId);
      if (!child) return;
      
      const recommended = getRecommendedManuals(child.spiritRoot);
      
      if (recommended.length === 0) {
        showResult('无可用功法', '当前没有适合的功法可供选择', false);
        return;
      }
      
      // TODO: 这里应该打开一个功法选择modal
      // 暂时实现为自动选择最推荐的功法
      const bestManual = recommended[0];
      const result = changeManual(child, bestManual.id);
      
      if (result.success) {
        setChildren(prev => prev.map(c => c.id === childId ? child : c));
        setSelectedChild(prev => prev && prev.id === childId ? child : prev);
        showResult('更换功法', result.message, true, { 契合度: result.compatibility });
      } else {
        showResult('更换失败', result.message, false);
      }
    }
  };

  // --- 装备/道具逻辑 ---
  const handleEquipToChild = (childId, slot, instanceId) => {
    const item = inventory.find(i => i.instanceId === instanceId);
    if (!item) return showResult("装备失败", "未找到该物品", false);
    if (item.slot !== slot) return showResult("装备失败", "物品类型不匹配", false);

    const target = children.find(c => c.id === childId);
    if (!target) return;
    const normalized = ensureEquipmentSlots(target);
    const oldItem = normalized.equipment[slot];

    // 更新孩子数据
    setChildren(prev => prev.map(c => {
      if (c.id === childId) {
        const updated = {
          ...normalized,
          equipment: { ...normalized.equipment, [slot]: item }
        };
        return recalcCombatStatsWithEquip(updated);
      }
      return c;
    }));

    // 更新选中态
    setSelectedChild(prev => {
      if (prev && prev.id === childId) {
        const updated = {
          ...normalized,
          equipment: { ...normalized.equipment, [slot]: item }
        };
        return recalcCombatStatsWithEquip(updated);
      }
      return prev;
    });

    // 更新背包：移除新装备，归还旧装备
    setInventory(prev => {
      const withoutNew = prev.filter(i => i.instanceId !== instanceId);
      return oldItem ? [oldItem, ...withoutNew] : withoutNew;
    });

    setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });
    showResult("装备成功", `${target.name} 装备了 ${item.name}`, true);
  };

  const handleUseConsumable = (childId, instanceId) => {
    const item = inventory.find(i => i.instanceId === instanceId);
    if (!item) return showResult("使用失败", "未找到该物品", false);

    const target = children.find(c => c.id === childId);
    if (!target) return showResult("使用失败", "未找到子嗣", false);

    // 处理功法类型物品
    if (item.type === 'manual') {
      // 功法秘籍：让玩家选择一个功法
      const manualIds = item.manualIds || [];
      if (manualIds.length === 0) {
        return showResult("学习失败", "该秘籍中没有可学习的功法", false);
      }

      // 随机选择一个功法（或者可以让玩家选择）
      const randomManualId = manualIds[Math.floor(Math.random() * manualIds.length)];
      const manual = MANUALS[randomManualId];
      
      if (!manual) {
        return showResult("学习失败", "功法数据异常", false);
      }

      // 使用功法系统更换功法
      const result = changeManual(target, manual);
      
      // 更新子嗣
      setChildren(prev => prev.map(c => {
        if (c.id === childId) {
          return { ...c, cultivationMethod: manual };
        }
        return c;
      }));

      // 更新选中的子嗣
      setSelectedChild(prev => {
        if (prev && prev.id === childId) {
          return { ...prev, cultivationMethod: manual };
        }
        return prev;
      });

      // 移除物品
      setInventory(prev => prev.filter(i => i.instanceId !== instanceId));
      setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });

      addLog(result.message);
      showResult("学习功法", result.message, true);
      return;
    }

    // 处理消耗品
    if (item.type !== 'consumable') {
      return showResult("使用失败", "该物品不可使用", false);
    }

    const effect = item.effect || {};
    setChildren(prev => prev.map(c => {
      if (c.id === childId) {
        let updated = { ...c };
        if (effect.kind === 'exp') {
          updated.cultivation = (updated.cultivation || 0) + (effect.amount || 0);
        } else if (effect.kind === 'aptitude') {
          const newApt = Math.min(100, (updated.stats?.aptitude || 50) + (effect.amount || 0));
          updated = { ...updated, stats: { ...updated.stats, aptitude: newApt } };
        } else if (effect.kind === 'heal') {
          updated.cultivation = (updated.cultivation || 0) + Math.floor((effect.amount || 0) * 2);
        }
        return recalcCombatStatsWithEquip(updated);
      }
      return c;
    }));

    setSelectedChild(prev => {
      if (prev && prev.id === childId) {
        let updated = { ...prev };
        if (effect.kind === 'exp') {
          updated.cultivation = (updated.cultivation || 0) + (effect.amount || 0);
        } else if (effect.kind === 'aptitude') {
          const newApt = Math.min(100, (updated.stats?.aptitude || 50) + (effect.amount || 0));
          updated = { ...updated, stats: { ...updated.stats, aptitude: newApt } };
        } else if (effect.kind === 'heal') {
          updated.cultivation = (updated.cultivation || 0) + Math.floor((effect.amount || 0) * 2);
        }
        return recalcCombatStatsWithEquip(updated);
      }
      return prev;
    });

    // 移除物品
    setInventory(prev => prev.filter(i => i.instanceId !== instanceId));
    setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });

    let msg = `${target.name} 使用了 ${item.name}`;
    if (effect.kind === 'exp') msg += `，修为+${effect.amount}`;
    if (effect.kind === 'aptitude') msg += `，资质+${effect.amount}`;
    if (effect.kind === 'heal') msg += `，恢复精气神。`;
    showResult("使用道具", msg, true);
  };

  // --- 处理战斗弹窗关闭（结算） ---
  const handleCombatClose = () => {
    if (!combatData) return;
    const { success, remainingHp } = combatData.result;
    const context = combatData.context || 'rival';

    if (context === 'rival') {
      if (success) {
        setPlayer(p => ({
          ...p,
          resources: { ...p.resources, spiritStones: p.resources.spiritStones + 500 },
          stats: { ...p.stats, health: Math.min(100, Math.ceil((remainingHp / (p.combatStats?.maxHp || 100)) * 100)) }
        }));
        addLog("⚔️ 你击败了追杀者，从尸体上搜出了 500 灵石！");
      } else {
        setPlayer(p => ({
          ...p,
          currentExp: 0,
          resources: { ...p.resources, spiritStones: Math.floor(p.resources.spiritStones * 0.5) },
          stats: { ...p.stats, health: 10 }
        }));
        addLog("💀 你被追杀者重创，修为尽散，钱财被抢，侥幸捡回一条命...");
      }
      setCombatData(null);
      return;
    }

    // 探险战斗结算
    if (success) {
      const enemyDrops = combatData.enemy?.drops || [];
      const dropId = enemyDrops.length ? enemyDrops[Math.floor(Math.random() * enemyDrops.length)] : null;
      const added = dropId ? addItemsToInventory([dropId]) : [];
      const lootMsg = added.length ? `，所得：${added.map(i => i.name).join(', ')}` : '';
      setExploreLog(prev => [...prev, `战斗胜利${lootMsg}`]);
    } else {
      setExploreLog(prev => [...prev, '你在秘境中重伤败退，探险被迫结束。']);
      setIsExploring(false);
    }
    setCombatData(null);
  };

  // --- 辅助函数：根据规则对数据进行排序 ---
  const getSortedNpcs = () => {
    const list = [...activeNpcs];
    switch (npcSort) {
      case 'AFFECTION_DESC':
        // 🛡️ 绝对安全写法：先用 ?. 判断是否存在，再用 || 0 给默认值
        return list.sort((a, b) => {
          const valA = a.relationship?.affection || 0;
          const valB = b.relationship?.affection || 0;
          return valB - valA;
        });
      
      case 'TRUST_DESC':
        // 🛡️ 绝对安全写法
        return list.sort((a, b) => {
          const valA = a.relationship?.trust || 0;
          const valB = b.relationship?.trust || 0;
          return valB - valA;
        });
        
      case 'APTITUDE_DESC':
        // 🛡️ 绝对安全写法 (防止 stats 也不存在)
        return list.sort((a, b) => {
          const valA = a.stats?.aptitude || 0;
          const valB = b.stats?.aptitude || 0;
          return valB - valA;
        });
        
      default:
        return list;
    }
  };

  const getSortedChildren = () => {
    const list = [...children]; // 创建副本
    switch (childSort) {
      case 'AGE_DESC': // 年龄大排前面
        return list.sort((a, b) => b.age - a.age);
      case 'AGE_ASC': // 年龄小排前面
        return list.sort((a, b) => a.age - b.age);
      case 'APTITUDE_DESC':
        return list.sort((a, b) => (b.stats?.aptitude || 0) - (a.stats?.aptitude || 0));
      case 'CULTIVATION_DESC':
        return list.sort((a, b) => (b.cultivation || 0) - (a.cultivation || 0));
      // 简单粗暴按境界名排序不太准，这里假设你有 tierLevel 数字，没有就按修为排
      default:
        return list;
    }
  };

  // 3. 新增：处理突破
  const handleBreakthroughClick = () => {
    // 调用机制层的判定
    const result = attemptBreakthrough(player);

    if (result.success) {
      setPlayer(prev => ({
        ...prev,
        tier: result.newTier,
        currentExp: 0, // 突破后经验归零
        maxExp: result.newMaxExp // 更新上限
      }));
      
      // 📰 添加到新闻缓存
      pushToNewsBuffer(
        player.newsBuffer || [],
        'LEVEL_UP',
        {
          actor: player.name,
          detail: result.newTier
        }
      );
      
      // 弹窗报喜 (不自动关闭)
      showResult("境界突破", result.msg, true, { 境界: "提升" }, false);
    } else {
      setPlayer(prev => ({
        ...prev,
        currentExp: Math.max(0, prev.currentExp - result.penalty) // 扣除经验
      }));
      // 弹窗报忧
      showResult("突破失败", result.msg, false, { 修为: -result.penalty }, false);
    }
  };

  // 4. 新增：处理技能点分配
  const handleAllocateSkillPoint = (type) => {
    if ((player.skillPoints || 0) <= 0) {
      addLog('❌ 没有可分配的技能点！');
      return;
    }

    setPlayer(prev => {
      const newPlayer = { ...prev, skillPoints: prev.skillPoints - 1 };
      
      if (type === 'aptitude') {
        // 增加资质
        newPlayer.stats = {
          ...newPlayer.stats,
          aptitude: Math.min(100, (newPlayer.stats.aptitude || 20) + 1)
        };
        addLog(`✨ 使用1点技能点，资质提升至 ${newPlayer.stats.aptitude}！`);
      } else if (type === 'combatPower') {
        // 增加战斗属性
        newPlayer.combatStats = {
          ...newPlayer.combatStats,
          maxHp: newPlayer.combatStats.maxHp + 50,
          hp: newPlayer.combatStats.maxHp + 50,
          atk: newPlayer.combatStats.atk + 5,
          def: (newPlayer.combatStats.def || 0) + 3
        };
        addLog(`⚔️ 使用1点技能点，战力提升！（生命+50，攻击+5，防御+3）`);
      }
      
      return newPlayer;
    });
  };

  // 调试：随机化玩家头像以验证 Avatar 渲染（生成与 Avatar.jsx 兼容的 DNA）
  const handleRandomizeAvatar = () => {
    const rand = (n) => Math.floor(Math.random() * n);
    const newAvatar = {
      base: rand(3),
      skinColor: rand(5),
      eye: rand(3),
      eyeColor: rand(5),
      mouth: rand(3),
      hair: rand(3),
      hairColor: rand(5)
    };
    setPlayer(prev => ({ ...prev, avatar: newAvatar }));
  };

  // --- 渲染 ---
  return (
    <div style={styles.appContainer}>
      {/* 1. 顶部栏 */}
      <TopStatusBar player={player} isAuto={isAuto} onBreakthrough={handleBreakthroughClick} onRandomizeAvatar={handleRandomizeAvatar} />

      {/* 0. 如果在序章阶段，显示序章 */}
      {gameStage === 'PROLOGUE' ? (
        <Prologue onFinish={handlePrologueFinish} onLoadGame={handleLoad} />
      ) : (
        /* 1. 主内容区 */
        <div style={styles.mainContent}>
          {/* 修为进度条与突破按钮 - 放置在主内容区顶部，所有标签页都可见 */}
          <div style={styles.cultivationSection}>
            <div style={styles.expContainer}>
              <div style={styles.expLabel}>修为</div>
              <div style={styles.expBar}>
                <div 
                  style={{
                    ...styles.expBarFill,
                    width: `${Math.min(100, (player.currentExp / player.maxExp) * 100)}%`,
                    background: (player.currentExp / player.maxExp) >= 1 ? 
                      'linear-gradient(90deg, #ff6f00 0%, #ff8f00 100%)' : 
                      'linear-gradient(90deg, #76ff03 0%, #64dd17 100%)'
                  }}
                ></div>
                <span style={styles.expText}>
                  {player.currentExp} / {player.maxExp}
                </span>
              </div>
            </div>
            
            {/* 突破按钮 - 仅在修为满时显示 */}
            {(player.currentExp / player.maxExp) >= 1 && (
              <button 
                onClick={handleBreakthroughClick} 
                style={styles.breakthroughBtn}
              >
                ⚡ 点击突破！
              </button>
            )}
          </div>
          
          {activeTab === 'FAMILY' && (
            <div style={styles.tabContent}>
              {/* 使用新的家族视图包装器，支持树形图和列表切换 */}
              <FamilyViewWrapper
                player={player}
                children={children} // 传入所有子嗣（包括孙子）
                pregnantNpcs={activeNpcs.filter(n => n.isPregnant)}
                onChildClick={(child) => {
                  // 如果是胚胎，显示特殊提示
                  if (child.isEmbryo) {
                    showResult(
                      '胚胎详情',
                      `${child.npc.name} 正在孕育中...\n\n🥚 生命正在悄然成长\n\n进度: ${child.npc.pregnancyProgress || 0}/9月`,
                      true,
                      null,
                      false
                    );
                  } else {
                    setSelectedChild(child);
                  }
                }}
              />
              
              {/* 统计信息 */}
              <div style={{padding:'15px', textAlign:'center', fontSize:'13px', color:'#555', borderTop:'1px dashed #e0e0e0', marginTop:'15px'}}>
                家族总人口: {children.length + 1} | 孙辈数量: {children.filter(c => c.generation > 1).length}
              </div>
            </div>
          )}

          {activeTab === 'NPC' && (
            <div style={styles.npcPanel}>
              <h3>情缘</h3>
              <div style={{padding: '10px', textAlign: 'center'}}>
                <button onClick={handleExplore} style={styles.exploreBtn}>
                  🏞️ 外出游历 (寻觅良人)
                </button>
              </div>

              {/* 存活的NPC */}
              <div style={{marginBottom: '20px'}}>
                <h4 style={{padding: '10px', background: '#f5f5f5', margin: 0}}>
                  💚 在世情缘 ({activeNpcs.length})
                </h4>
                
                {/* 插入排序条 */}
                <SortBar
                  options={NPC_SORT_OPTIONS}
                  currentSort={npcSort}
                  onSortChange={setNpcSort}
                />

                <div style={styles.npcList}>
                  {getSortedNpcs().map(npc => (
                    <div key={npc.id} style={{position: 'relative'}}>
                      <NpcCard
                        npc={{
                          ...npc,
                          affection: npc.relationship?.affection || 0
                        }}
                        onInteract={handleNpcInteract}
                      />
                      <button
                        onClick={() => handleNpcInteract(npc.id, 'DETAIL')}
                        style={styles.detailBtn}
                      >
                        🔍 详情
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 死亡的NPC */}
              {deadNpcs.length > 0 && (
                <div style={{marginTop: '20px', borderTop: '2px solid #333'}}>
                  <h4 style={{padding: '10px', background: '#424242', color: '#fff', margin: 0}}>
                    💀 已故之人 ({deadNpcs.length})
                  </h4>
                  <div style={styles.deadNpcList}>
                    {deadNpcs.map(npc => (
                      <div key={npc.id} style={styles.deadNpcCard}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          <span style={{fontSize: '24px', opacity: 0.5}}>💀</span>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: 'bold', color: '#666'}}>
                              {npc.name} ({npc.identity})
                            </div>
                            <div style={{fontSize: '12px', color: '#999'}}>
                              {npc.tier} · 享年 {npc.age} 岁
                            </div>
                            <div style={{fontSize: '11px', color: '#999', marginTop: '4px', fontStyle: 'italic'}}>
                              {npc.deathReason || '寿元耗尽'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ACTION' && (
            <div style={styles.actionPanel}>
              {showBizPanel ? (
                <div>
                  <button onClick={() => setShowBizPanel(false)} style={styles.backButton}>← 返回</button>
                  <BusinessPanel
                    player={player}
                    children={children}
                    onBuy={handleBuyBusiness}
                  />
                </div>
              ) : showChallengePanel ? (
                <div>
                  <button onClick={() => setShowChallengePanel(false)} style={styles.backButton}>← 返回</button>
                  <ChallengePanel
                    player={player}
                    children={children}
                    onChallenge={handleExploreRealm}
                  />
                </div>
              ) : (
                <div>
                  <h3>修炼</h3>
                  <button onClick={() => handleDailyAction('CULTIVATE')} style={styles.actionButton}>
                    修炼 (+10-15修为)
                  </button>
                  <button onClick={() => handleDailyAction('WORK')} style={styles.actionButton}>
                    打工 (+15灵石)
                  </button>
                  <button onClick={handleShopping} style={styles.actionButton}>
                    下山采购 (购买资源，-10灵石)
                  </button>

                  <div style={{marginTop: '20px', borderTop: '1px dashed #ccc', paddingTop: '20px'}}>
                    <h4>🏛️ 家族经营</h4>
                    <div style={styles.actionGrid}>
                      <button style={styles.actionCard} onClick={() => setShowBizPanel(true)}>
                        <div style={{fontSize: '30px'}}>💰</div>
                        <div>产业管理</div>
                      </button>
                      <button style={styles.actionCard} onClick={() => setShowChallengePanel(true)}>
                        <div style={{fontSize: '30px'}}>⚔️</div>
                        <div>秘境探险</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'REVENGE' && (
            <RevengePanel
              player={player}
              setPlayer={setPlayer}
            />
          )}

          {activeTab === 'SYSTEM' && (
            <SystemPanel 
              player={player} 
              onSave={handleSave} 
              onLoad={handleLoad} 
              onReset={handleResetGame}
              onOpenGuide={() => setShowGuide(true)} // 传进去指南打开函数
            />
          )}

          {activeTab === 'LOG' && <GameLog logs={logs} />}
          
          {activeTab === 'PLAYER' && (
            <PlayerPanel 
              player={player} 
              childFeedback={totalChildFeedback}
              onOpenInventory={() => setInventoryModal({ open: true, mode: 'VIEW', slot: null, childId: null })}
              onAllocateSkillPoint={handleAllocateSkillPoint}
            />
          )}
        </div>
      )}

      {/* 3. 弹窗层 */}
      {modalState.type === 'GIFT' && (
        <GiftModal
          npc={modalState.data}
          inventory={inventory}
          onGift={handleGiftConfirm}
          onClose={closeModal}
        />
      )}

      {modalState.type === 'NEGOTIATE' && (
        <NegotiationModal
          npc={modalState.data}
          onNegotiate={handleNegotiateConfirm}
          onClose={closeModal}
        />
      )}
      
      {/* 商店弹窗 */}
      {modalState.type === 'SHOP' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '16px',
            maxWidth: '600px',
            maxHeight: '80vh',
            width: '90%',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            border: '2px solid #8d6e63',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{marginTop: 0, color: '#5d4037', textAlign: 'center', marginBottom: '10px'}}>
              🏪 山下商铺
            </h2>
            <p style={{color: '#666', textAlign: 'center', fontSize: '13px', marginBottom: '15px'}}>
              今日商品如下，价格公道，童叟无欺！
            </p>
            
            <div style={{
              flex: 1,
              overflowY: 'auto',
              marginBottom: '15px'
            }}>
              {modalState.data.items.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                  今日商品已售罄
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {modalState.data.items.map((item) => {
                    const canAfford = player.resources.spiritStones >= item.price;
                    const rarityColors = {
                      common: '#9e9e9e',
                      uncommon: '#4caf50',
                      rare: '#2196f3',
                      epic: '#9c27b0',
                      legendary: '#ff9800'
                    };
                    
                    return (
                      <div
                        key={item.instanceId}
                        style={{
                          padding: '12px',
                          border: `2px solid ${rarityColors[item.rarity] || '#ddd'}`,
                          borderRadius: '10px',
                          backgroundColor: canAfford ? '#fafafa' : '#f5f5f5',
                          opacity: canAfford ? 1 : 0.6,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px'}}>
                          <span style={{fontSize: '15px', fontWeight: 'bold', color: rarityColors[item.rarity]}}>
                            {item.name}
                          </span>
                          <span style={{fontSize: '14px', color: '#f57c00', fontWeight: 'bold'}}>
                            💰 {item.price} 灵石
                          </span>
                        </div>
                        <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                          {item.desc}
                        </div>
                        {item.stats && (
                          <div style={{fontSize: '11px', color: '#1976d2', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px'}}>
                            {item.stats.atk && <span>攻击+{item.stats.atk}</span>}
                            {item.stats.hp && <span>气血+{item.stats.hp}</span>}
                            {item.stats.def && <span>防御+{item.stats.def}</span>}
                            {item.stats.mp && <span>灵力+{item.stats.mp}</span>}
                          </div>
                        )}
                        {item.effect && (
                          <div style={{fontSize: '11px', color: '#388e3c', marginBottom: '8px'}}>
                            {item.effect.kind === 'heal' && `恢复${item.effect.amount}气血`}
                            {item.effect.kind === 'exp' && `修为+${item.effect.amount}`}
                            {item.effect.kind === 'aptitude' && `资质+${item.effect.amount}`}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (!canAfford) {
                              showResult('灵石不足', `购买 ${item.name} 需要 ${item.price} 灵石`, false);
                              return;
                            }
                            
                            // 扣除灵石
                            setPlayer(p => ({
                              ...p,
                              resources: {
                                ...p.resources,
                                spiritStones: Math.max(0, p.resources.spiritStones - item.price)
                              }
                            }));
                            
                            // 添加到背包
                            setInventory(prev => [item, ...prev]);
                            
                            // 从商店移除该物品
                            setModalState(prev => ({
                              ...prev,
                              data: {
                                items: prev.data.items.filter(i => i.instanceId !== item.instanceId)
                              }
                            }));
                            
                            showResult(
                              '购买成功',
                              `你购买了 ${item.name}，已存入背包`,
                              true,
                              { 灵石: -item.price }
                            );
                          }}
                          disabled={!canAfford}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: canAfford ? '#8d6e63' : '#ccc',
                            color: 'white',
                            cursor: canAfford ? 'pointer' : 'not-allowed',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          购买
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div style={{marginTop: '10px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '8px', fontSize: '12px', color: '#666', textAlign: 'center'}}>
              💡 你当前拥有 <span style={{fontWeight: 'bold', color: '#f57c00'}}>{player.resources.spiritStones}</span> 灵石
            </div>
            
            <button
              onClick={closeModal}
              style={{
                marginTop: '15px',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              离开商铺
            </button>
          </div>
        </div>
      )}
      
      {modalState.type === 'RESULT' && (
        <ResultModal
          result={modalState.data}
          onClose={closeModal}
        />
      )}

      {modalState.type === 'EVENT' && (
        <EventModal
          event={modalState.data.event}
          npc={modalState.data.npc}
          onClose={closeModal}
          onOptionSelect={handleOptionSelect}
        />
      )}

      {inventoryModal.open && (
        <InventoryModal
          items={inventory}
          mode={inventoryModal.mode}
          slot={inventoryModal.slot}
          childId={inventoryModal.childId}
          children={children}
          onClose={() => setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null })}
          onEquip={(instanceId) => handleEquipToChild(inventoryModal.childId, inventoryModal.slot, instanceId)}
          onUse={(instanceId) => handleUseConsumable(inventoryModal.childId, instanceId)}
          onGiveToChild={(instanceId) => {
            const item = inventory.find(i => i.instanceId === instanceId);
            if (!item) return;
            
            // 打开子女选择界面
            setChildSelectorModal({ open: true, item });
          }}
          onBatchGive={(instanceIds) => {
            // 批量赠送处理
            if (instanceIds.length === 0) return;
            
            // 获取所有要赠送的物品
            const itemsToGive = instanceIds.map(id => inventory.find(i => i.instanceId === id)).filter(Boolean);
            
            if (itemsToGive.length === 0) return;
            
            // 打开批量子女选择界面
            setChildSelectorModal({ open: true, items: itemsToGive, isBatch: true });
          }}
        />
      )}

      {/* 渲染测灵弹窗 (如果有队列) */}
      {testQueue.length > 0 && (
        <SpiritRootTestModal
          child={testQueue[0]} // 每次只测第一个
          onFinish={handleTestFinish}
          onClose={() => {
            // 关闭弹窗时也要标记为已测试，防止重复触发
            const childToMark = testQueue[0];
            if (childToMark) {
              setChildren(prev => prev.map(c => 
                c.id === childToMark.id ? { ...c, isTested: true } : c
              ));
            }
            setTestQueue(prev => prev.slice(1));
          }}
        />
      )}

      {/* 子女选择弹窗 */}
      {childSelectorModal.open && (
        <ChildSelectorModal
          children={children}
          item={childSelectorModal.item}
          items={childSelectorModal.items}
          isBatch={childSelectorModal.isBatch}
          onSelect={(child) => {
            if (childSelectorModal.isBatch && childSelectorModal.items) {
              // 批量处理
              let successCount = 0;
              childSelectorModal.items.forEach(itm => {
                handleUseConsumable(child.id, itm.instanceId);
                successCount++;
              });
              
              showResult(
                '批量分配成功',
                `已将 ${successCount} 件物品分配给 ${child.name}`,
                true
              );
              
              setChildSelectorModal({ open: false, item: null, items: null, isBatch: false });
              setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });
            } else if (childSelectorModal.item) {
              // 单个处理
              handleUseConsumable(child.id, childSelectorModal.item.instanceId);
              setChildSelectorModal({ open: false, item: null, items: null, isBatch: false });
              setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });
            }
          }}
          onClose={() => setChildSelectorModal({ open: false, item: null, items: null, isBatch: false })}
        />
      )}

      {/* 渲染子嗣详情弹窗 */}
      {selectedChild && (
        <ChildDetailModal
          child={selectedChild}
          onClose={() => setSelectedChild(null)}
          onAction={(type, payload) => handleChildAction(selectedChild.id, type, payload)}
        />
      )}

      {/* 渲染配偶选择弹窗 */}
      {showSpouseSelection && marryingChild && (
        <SpouseSelectionModal
          child={marryingChild}
          candidates={spouseCandidates}
          onSelect={handleSpouseSelect}
          onClose={() => {
            setShowSpouseSelection(false);
            setSpouseCandidates([]);
            setMarryingChild(null);
          }}
        />
      )}

      {/* 4. 底部导航栏 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 5. 升级版悬浮控制台 */}
      <div style={styles.fabContainer}>
        
        {/* 速度选择按钮组 */}
        {isAuto && (
          <div style={styles.speedSelector}>
            <button
              onClick={() => setAutoSpeed(0.3)}
              style={{
                ...styles.speedBtn,
                backgroundColor: autoSpeed === 0.3 ? '#4CAF50' : '#e0e0e0',
                color: autoSpeed === 0.3 ? 'white' : '#666'
              }}
            >
              ×0.3
            </button>
            <button
              onClick={() => setAutoSpeed(1)}
              style={{
                ...styles.speedBtn,
                backgroundColor: autoSpeed === 1 ? '#4CAF50' : '#e0e0e0',
                color: autoSpeed === 1 ? 'white' : '#666'
              }}
            >
              ×1
            </button>
            <button
              onClick={() => setAutoSpeed(3)}
              style={{
                ...styles.speedBtn,
                backgroundColor: autoSpeed === 3 ? '#4CAF50' : '#e0e0e0',
                color: autoSpeed === 3 ? 'white' : '#666'
              }}
            >
              ×3
            </button>
          </div>
        )}
        
        {/* 自动播放开关 (小按钮) */}
        <button
          onClick={() => setIsAuto(!isAuto)}
          style={{
            ...styles.autoBtn,
            backgroundColor: isAuto ? '#76ff03' : '#e0e0e0', // 亮绿色表示开启
            color: isAuto ? '#33691e' : '#757575'
          }}
        >
          {isAuto ? '⏸ 停止' : '⏩ 推进时间'}
        </button>

        {/* 主按钮 (手动下一月) */}
        <button
          onClick={() => handleNextMonth(false)}
          style={{
            ...styles.fabBtn,
            transform: isAuto ? 'scale(0.9)' : 'scale(1)', // 自动时稍微缩小
            opacity: isAuto ? 0.8 : 1
          }}
          disabled={isAuto} // 自动时禁用手动点击
        >
          {isAuto ? (
            <div style={styles.spinner}>⏳</div> // 自动时显示沙漏动画
          ) : (
            <>
              <span style={{fontSize:'18px'}}>🌙</span>
              <span style={{fontSize:'9px'}}>下月</span>
            </>
          )}
        </button>
      </div>

      {/* 📰 邸报按钮 (左下角) */}
      <button
        onClick={() => {
          console.log('打开邸报，当前数据:', { 
            currentGazette, 
            gazetteHistory: player.gazetteHistory,
            hasUnreadGazette: player.hasUnreadGazette 
          });
          setShowGazette(true);
          // 标记已读
          setPlayer(prev => ({ ...prev, hasUnreadGazette: false }));
        }}
        style={styles.gazetteBtn}
        title="修真界邸报"
      >
        📰
        {player.hasUnreadGazette && <span style={styles.redDot}></span>}
      </button>

      {/* 📜 传书馆按钮 (左下角，邸报按钮上方) */}
      <button
        onClick={() => {
          setShowMessageCenter(true);
        }}
        style={styles.messageCenterBtn}
        title="传书馆 - 查看家书与遗言"
      >
        📜
        {messageManager.getUnreadCount() > 0 && (
          <span style={styles.redDot}>{messageManager.getUnreadCount()}</span>
        )}
      </button>

      {/* 6. NPC详情弹窗 (保持不变) */}
      {selectedNpc && (
        <NpcDetailModal
          npc={selectedNpc}
          onClose={() => setSelectedNpc(null)}
          onOptionSelect={handleOptionSelect}
          player={player}
          children={children}
          npcs={activeNpcs}
          onViewLog={(npc) => setNpcLogModal({ open: true, npc })}
        />
      )}

      {/* NPC 日志查看弹窗 */}
      {npcLogModal.open && npcLogModal.npc && (
        <NpcLogModal
          npc={npcLogModal.npc}
          playerAffection={npcLogModal.npc.relationship?.affection || 0}
          onClose={() => setNpcLogModal({ open: false, npc: null })}
        />
      )}

      {/* 📜 传书馆弹窗 */}
      <MessageCenterModal
        isOpen={showMessageCenter}
        onClose={() => setShowMessageCenter(false)}
        messages={messages}
        onMarkAsRead={(messageId) => {
          messageManager.markAsRead(messageId);
          setMessages(messageManager.getAllMessages());
        }}
        onDeleteMessage={(messageId) => {
          messageManager.deleteMessage(messageId);
          setMessages(messageManager.getAllMessages());
        }}
      />

      {/* 7. 战斗弹窗 */}
      {combatData && (
        <CombatModal
          player={player}
          enemy={combatData.enemy}
          result={combatData.result}
          onClose={handleCombatClose}
        />
      )}

      {isExploring && (
        <ExplorationModal
          open={isExploring}
          realmName={exploreRealmState.name}
          progress={exploreProgress}
          total={exploreRealmState.total}
          event={currentExploreEvent}
          log={exploreLog}
          onSelectOption={(opt) => {
            const ctx = { player, inventory, realmId: exploreRealmState.id, progress: exploreProgress };
            if (opt.condition && !opt.condition(ctx)) {
              setExploreLog(prev => [...prev, '条件不足，无法执行该选项。']);
              return;
            }
            const outcome = opt.action ? opt.action(ctx) : { type: 'LOG', msg: '你没有采取任何行动。' };
            if (outcome.type === 'START_COMBAT') {
              const enemy = generateRealmEnemy(exploreRealmState.id, exploreProgress);
              const playerWithCombatStats = {
                ...player,
                combatStats: player.combatStats || { maxHp: 100, maxMp: 50, atk: 10, def: 5, hp: 100, mp: 50 }
              };
              const battleResult = simulateCombat(playerWithCombatStats, enemy);
              setCombatData({ enemy, result: battleResult, context: 'exploration' });
            } else if (outcome.type === 'LOOT') {
              const added = addItemsToInventory(outcome.items || []);
              const names = added.map(i => i.name).join(', ');
              setExploreLog(prev => [...prev, outcome.msg || '获得战利品', names ? `战利品：${names}` : '']);
            } else if (outcome.type === 'NPC_JOIN') {
              setActiveNpcs(prev => [outcome.npc, ...prev]);
              if (outcome.removeItemId) {
                const inst = inventory.find(i => i.id === outcome.removeItemId);
                if (inst) setInventory(prev => prev.filter(x => x.instanceId !== inst.instanceId));
              }
              setExploreLog(prev => [...prev, outcome.msg || '一名修士与你结缘。']);
            } else if (outcome.type === 'HP_CHANGE') {
              const delta = outcome.hpDelta || 0;
              setPlayer(p => ({ ...p, stats: { ...p.stats, health: Math.max(1, Math.min(100, (p.stats?.health || 50) + Math.floor(delta / (p.combatStats?.maxHp || 100) * 100))) } }));
              setExploreLog(prev => [...prev, outcome.msg || (delta < 0 ? '你受了伤。' : '你感觉更有精神。')]);
            } else if (outcome.type === 'EXP_GAIN') {
              setPlayer(p => ({ ...p, currentExp: (p.currentExp || 0) + (outcome.amount || 0) }));
              setExploreLog(prev => [...prev, outcome.msg || '修为有所精进。']);
            } else if (outcome.type === 'LOG' || outcome.type === 'NONE') {
              setExploreLog(prev => [...prev, outcome.msg || '你谨慎推进。']);
            }
            // 不再自动推进，由组件内部的结果弹窗控制
          }}
          onStartCombat={() => {
            const enemy = generateRealmEnemy(exploreRealmState.id, exploreProgress);
            const playerWithCombatStats = {
              ...player,
              combatStats: player.combatStats || { maxHp: 100, maxMp: 50, atk: 10, def: 5, hp: 100, mp: 50 }
            };
            const battleResult = simulateCombat(playerWithCombatStats, enemy);
            setCombatData({ enemy, result: battleResult, context: 'exploration' });
          }}
          onNext={() => {
            if (exploreProgress >= exploreRealmState.total) {
              setExploreLog(prev => [...prev, '你抵达秘境尽头，带着满载的收获离开。']);
              setIsExploring(false);
              showResult('探索结束', '你顺利通关，满载而归！', true, null, false);
              return;
            }
            const next = exploreProgress + 1;
            setExploreProgress(next);
            const ev = next === exploreRealmState.total ? getBossEvent(exploreRealmState.id) : getRandomExplorationEvent({ realmId: exploreRealmState.id, progress: next });
            setCurrentExploreEvent(ev);
            setExploreLog(prev => [...prev, `你继续深入 (${next}/${exploreRealmState.total})。`]);
          }}
          onClose={() => {
            setIsExploring(false);
            setExploreLog(prev => [...prev, '你结束了此次探险。']);
          }}
        />
      )}

      {/* 8. 渲染指南弹窗 */}
      {/* 宗门选择弹窗（优先处理队列首项） */}
      {pendingSectChoices.length > 0 && (
        <SectSelectionModal
          event={pendingSectChoices[0]}
          onClose={() => setPendingSectChoices(prev => prev.slice(1))}
          onAssign={handleAssignSect}
        />
      )}

      {/* 9. 渲染新手引导弹窗 */}
      {showTutorial && (
        <TutorialModal 
          onClose={handleCloseTutorial}
          onComplete={handleCompleteTutorial}
        />
      )}

      {/* 10. 渲染详细指南弹窗 */}
      {showGuide && <GuideModal onClose={handleCloseGuide} />}

      {/* 11. 修真界邸报弹窗 */}
      {showGazette && (
        <GazetteModal
          gazette={currentGazette}
          history={player.gazetteHistory || []}
          playerName={player.name}
          onClose={() => setShowGazette(false)}
        />
      )}
    </div>
  );
};

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Noto Serif SC', serif",
    backgroundColor: theme.colors.background,
    backgroundImage: 'linear-gradient(rgba(245, 240, 232, 0.6), rgba(245, 240, 232, 0.6))',
    backgroundSize: '100% 100%'
  },
  mainContent: {
    flex: 1,
    padding: '15px', // 更大的内边距
    paddingBottom: '70px', // 为底部导航栏留出空间（56px高度 + 14px额外空间）
    overflowY: 'auto'
  },
  tabContent: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  actionPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px' // 更大的间距
  },
  npcPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px' // 更大的间距
  },
  npcList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px' // 更大的间距
  },
  actionButton: {
    padding: '15px',
    background: theme.gradients.subtle,
    color: theme.colors.ink,
    border: 'none',
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${theme.colors.shadow}`
    }
  },
  // 外出游历按钮
  exploreBtn: {
    padding: '15px 30px',
    background: theme.gradients.subtle,
    color: theme.colors.ink,
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '300px',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${theme.colors.shadow}`
    }
  },
  // 新增容器：把两个按钮包起来
  fabContainer: {
    position: 'absolute',
    bottom: '70px',
    right: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    zIndex: 90
  },

  // 自动播放小开关
  autoBtn: {
    padding: '6px 12px',
    borderRadius: '18px',
    border: `2px solid ${theme.colors.border}`,
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: `0 2px 6px ${theme.colors.shadow}`,
    transition: 'all 0.3s ease',
    backgroundColor: theme.colors.parchment,
    color: theme.colors.ink
  },

  // 邸报按钮 (左下角)
  gazetteBtn: {
    position: 'absolute',
    bottom: '70px',
    left: '20px',
    width: theme.sizes.smallBtn,
    height: theme.sizes.smallBtn,
    borderRadius: '50%',
    background: theme.gradients.subtle,
    border: `2px solid ${theme.colors.border}`,
    fontSize: '22px',
    cursor: 'pointer',
    boxShadow: `0 3px 12px ${theme.colors.shadow}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 90,
    ':hover': {
      transform: 'scale(1.05)'
    }
  },

  // 传书馆按钮 (左下角，邸报上方)
  messageCenterBtn: {
    position: 'absolute',
    bottom: '130px', // 在邸报按钮上方
    left: '20px',
    width: theme.sizes.smallBtn,
    height: theme.sizes.smallBtn,
    borderRadius: '50%',
    background: theme.gradients.subtle,
    border: `2px solid ${theme.colors.border}`,
    fontSize: '22px',
    cursor: 'pointer',
    boxShadow: `0 3px 12px ${theme.colors.shadow}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    zIndex: 90,
    ':hover': {
      transform: 'scale(1.05)'
    }
  },

  // 红点提示（使用较低饱和度的警示色）
  redDot: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#b33',
    border: '2px solid white',
    animation: 'pulse 2s infinite'
  },

  // 速度选择器容器
  speedSelector: {
    display: 'flex',
    gap: '5px',
    marginBottom: '10px',
    padding: '8px',
    background: theme.gradients.subtle,
    borderRadius: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    border: `2px solid ${theme.colors.border}`
  },

  // 速度按钮
  speedBtn: {
    padding: '8px 14px',
    fontSize: '12px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    minWidth: '50px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },

  // 修改主按钮样式
  fabBtn: {
    width: theme.sizes.fabSize,
    height: theme.sizes.fabSize,
    borderRadius: '50%',
    background: theme.gradients.subtle,
    color: theme.colors.ink,
    border: `3px solid ${theme.colors.parchment}`,
    boxShadow: `0 3px 12px ${theme.colors.shadow}`,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)'
    }
  },

  // 简单的旋转动画效果
  spinner: {
    fontSize: '24px',
    animation: 'spin 1s linear infinite'
  },

  // 面板切换按钮
  tabButton: {
    padding: '10px 20px',
    border: `2px solid ${theme.colors.border}`, // 古色边框
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    backgroundColor: theme.colors.parchment, // 古色背景
    color: theme.colors.ink, // 古色文字
    ':hover': {
      background: theme.gradients.subtle,
      transform: 'translateY(-2px)'
    }
  },

  // 家族经营网格
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '20px'
  },

  // 家族经营卡片
  actionCard: {
    background: theme.gradients.subtle,
    borderRadius: '16px', // 圆角
    padding: '20px',
    boxShadow: `0 4px 15px ${theme.colors.shadow}`,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: `2px solid ${theme.colors.border}`,
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 8px 25px ${theme.colors.shadow}`
    }
  },

  // 返回按钮
    backButton: {
    marginBottom: '15px',
    padding: '8px 16px',
    backgroundColor: theme.gradients.subtle,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.ink,
    transition: 'all 0.3s ease',
    ':hover': {
      background: theme.gradients.subtle,
      transform: 'translateY(-2px)'
    }
  },
  // 修为进度条区域
  cultivationSection: {
    background: theme.gradients.subtle,
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: `0 4px 15px ${theme.colors.shadow}`,
    border: `2px solid ${theme.colors.border}` // 古色边框
  },
  expContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  expLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#5d4037', // 古色文字
    textAlign: 'center'
  },
  expBar: {
    width: '100%',
    height: '20px',
    background: 'rgba(0,0,0,0.08)',
    borderRadius: '10px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' // 内阴影
  },
  expBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease-out',
    boxShadow: '0 0 10px rgba(118, 255, 3, 0.3)' // 光效
  },
  expText: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#5d4037', // 古色文字
    textShadow: '1px 1px 2px rgba(255,255,255,0.8)' // 文字阴影
  },
  // 突破按钮 - 放置在黄金操作区
  breakthroughBtn: {
    marginTop: '15px',
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)', // 渐变背景
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 111, 0, 0.3)', // 橙色阴影
    transition: 'all 0.3s ease',
    animation: 'breathe 1.5s infinite', // 呼吸效果
    alignSelf: 'center',
    width: '100%',
    maxWidth: '300px',
    ':hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 6px 20px rgba(255, 111, 0, 0.4)'
    },
    ':active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(255, 111, 0, 0.2)'
    }
  },

  // 🌟 天机榜按钮
  eliteRankingBtn: {
    marginTop: '10px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 3px 12px rgba(141, 110, 99, 0.3)',
    transition: 'all 0.3s ease',
    alignSelf: 'center',
    width: '100%',
    maxWidth: '300px'
  },
  
  // 死亡NPC列表样式
  deadNpcList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '15px',
    background: '#f5f5f5'
  },
  
  deadNpcCard: {
    background: 'linear-gradient(135deg, #eeeeee 0%, #e0e0e0 100%)',
    border: '2px solid #9e9e9e',
    borderRadius: '12px',
    padding: '12px',
    opacity: 0.7,
    cursor: 'not-allowed',
    transition: 'all 0.3s'
  }
};

export default App;
