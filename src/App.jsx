import { useState, useEffect, useRef, useCallback } from 'react';
// 引入新组件
import TopStatusBar from './components/TopStatusBar/index.jsx';
import BottomNav from './components/BottomNav/index.jsx';
// 引入旧组件
import NpcCard from './components/NpcCard/index.jsx';
import NpcDetailModal from './components/NpcDetailModal/index.jsx';
import FamilyTree from './components/FamilyTree/index.jsx';
import FamilyTreeChart from './components/FamilyTreeChart/index.jsx';
import ZoomableTree from './components/FamilyTree/ZoomableTree.jsx';
import GameLog from './components/GameLog/index.jsx';
// 引入序章组件
import Prologue from './components/Prologue/index.jsx';
// 引入新面板
import BusinessPanel from './components/Panels/BusinessPanel.jsx';
import ChallengePanel from './components/Panels/ChallengePanel.jsx';
import RevengePanel from './components/Panels/RevengePanel.jsx';
import SystemPanel from './components/Panels/SystemPanel.jsx';
import PlayerPanel from './components/PlayerPanel/index.jsx';
// 引入新弹窗
import GiftModal from './components/Modals/GiftModal.jsx';
import NegotiationModal from './components/Modals/NegotiationModal.jsx';
import ResultModal from './components/Modals/ResultModal.jsx';
import SpiritRootTestModal from './components/Modals/SpiritRootTestModal.jsx';
import ChildDetailModal from './components/ChildDetailModal/index.jsx';
import SortBar from './components/Common/SortBar.jsx';
import EventModal from './components/Modals/EventModal.jsx'; // 引入事件弹窗组件
import InventoryModal from './components/Modals/InventoryModal.jsx';
import ChildSelectorModal from './components/Modals/ChildSelectorModal.jsx';
// 引入文本引擎
import { getChatText, getGiftReaction, getPersuadeText, createMonkScriptureEvent, getRandomInteractionEvent, getUnifiedInteractionEvent } from './game/textEngine.js';
// 引入数据和逻辑
import { initialPlayer } from './data/initialPlayer.js';
import { initialNpcs } from './data/npcPool.js';
import { generateChild, processChildrenGrowth, generateSpouse, calculateChildFeedback, attemptBreakthrough, calculateBusinessIncome, exploreRealm } from './game/mechanics.js';
import { getTierConfig, calculateStats, getRootConfigByValue, MUTANT_ELEMENTS, ELEMENTS, getSectById } from './game/cultivationSystem.js';
import { generateRandomNpc } from './game/npcGenerator.js'; // 引入生成器
import { calculateCombatPower } from './game/challengeSystem.js'; // 复用战力计算
import { simulateCombat } from './game/combatEngine.js'; // 引入战斗引擎
import { saveGameToStorage, loadGameFromStorage } from './utils/saveSystem.js';
import { getRandomEvent } from './data/eventLibrary.js'; // 引入随机事件生成函数
import CombatModal from './components/Modals/CombatModal.jsx'; // 引入战斗弹窗组件
import ExplorationModal from './components/ExplorationModal/index.jsx'; // 新增：探险模态
import { getRandomExplorationEvent, getBossEvent, generateRealmEnemy } from './game/explorationEvents.js';
import GuideModal from './components/Modals/GuideModal.jsx'; // 引入指南弹窗组件
import SectSelectionModal from './components/Modals/SectSelectionModal.jsx';
import { createItemInstance, isEquipment, getItemTemplate } from './data/itemLibrary.js';

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
    businesses: [] // 新增：玩家拥有的产业
  });
  const [activeNpcs, setActiveNpcs] = useState(initialNpcs);
  const [children, setChildren] = useState([]);
  const [inventory, setInventory] = useState([]); // 全局背包
  
  // 2. 新增：宿敌状态
  const [rival, setRival] = useState({
    name: "楚清瑶",
    tier: "炼气六层", // 开局比你强
    combatPower: 800,
    threat: 30, // 初始威胁
    status: "alive", // alive | defeated
    logs: ["楚清瑶夺走了你的筑基丹。", "楚清瑶成为了家族重点培养对象。"]
  });
  
  // 初始化日志，直接使用初始日志数据，避免依赖rival对象
  const [logs, setLogs] = useState([
    { turn: 0, message: "楚清瑶夺走了你的筑基丹。" },
    { turn: 0, message: "楚清瑶成为了家族重点培养对象。" }
  ]);
  
  const [activeTab, setActiveTab] = useState('FAMILY'); // 默认显示家族树
  const [selectedNpc, setSelectedNpc] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null); // 当前选中的孩子
  const [isAuto, setIsAuto] = useState(false); // 新增：自动播放开关
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

  // 3. 新增：待测灵的孩子队列
  const [testQueue, setTestQueue] = useState([]);
  // 4. 新增：待处理的宗门选择队列（12岁触发）
  const [pendingSectChoices, setPendingSectChoices] = useState([]);
  
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

    // 2. 修复 NPC 数据 (防止 relationship 缺失)
    if (activeNpcs.some(n => !n.relationship)) {
      console.log("检测到旧 NPC 数据缺失，正在修复...");
      setActiveNpcs(prev => prev.map(n => {
        if (!n.relationship) {
          return {
            ...n,
            relationship: { stage: 0, affection: 0, trust: 0, jealousy: 0 }
          };
        }
        return n;
      }));
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

  // --- 1. 自动检测是否需要显示新手教程 ---
  useEffect(() => {
    // 检查本地存储中是否有标记
    const hasReadTutorial = localStorage.getItem('has_read_tutorial_v1');
    
    // 如果是序章刚结束进入 MAIN 阶段，且没读过教程
    if (gameStage === 'MAIN' && !hasReadTutorial) {
      // 稍微延迟一点弹出，不要和序章结束动画冲突
      setTimeout(() => {
        setShowGuide(true);
      }, 1000);
    }
  }, [gameStage]);

  // 关闭教程时的处理
  const handleCloseGuide = () => {
    setShowGuide(false);
    localStorage.setItem('has_read_tutorial_v1', 'true'); // 标记为已读
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
  const addLog = (message) => {
    const turn = (player.time.year - 3572) * 12 + player.time.month;
    setLogs((prev) => [{ turn, message }, ...prev]);
  };

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
      // 打开劝生弹窗
      setModalState({ type: 'NEGOTIATE', data: targetNpc });
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
      
      setActiveNpcs(prev => prev.map(n => {
        if (n.id === npcId) {
          // 佛修不通过闲聊获得好感
          if (n.identity === '佛修') {
            return n;
          }
          const oldRel = n.relationship || {};
          const oldAff = oldRel.affection || 0;
          
          return {
            ...n,
            relationship: {
              ...oldRel,
              affection: oldAff + 2
            }
          };
        }
        return n;
      }));
      
      // 显示结果
      showResult(
        "闲聊",
        `你与 ${targetNpc.name} 攀谈。${targetNpc.gender === '女' ? '她' : '他'}道：\n"${chatText}"`,
        true,
        { 好感: 2 }
      );
    }

    // DETAIL 逻辑保持不变...
    if (actionType === 'DETAIL') {
      setSelectedNpc(targetNpc);
    }
  };

  // --- 2. 处理赠礼回调 ---
  const handleGiftConfirm = (gift) => {
    const npc = modalState.data;
    
    // 防御性编程：检查npc是否存在
    if (!npc) {
      console.warn('No NPC found in modalState.data');
      return;
    }
    
    // 1. 扣钱
    setPlayer(p => ({ ...p, resources: { ...p.resources, spiritStones: p.resources.spiritStones - gift.cost } }));
    
    // 2. --- 调用引擎获取反馈 ---
      const { msg, change } = getGiftReaction(npc, gift);

      // 如果对象是佛修且所赠为经典（经书），触发专属事件而不是直接结算好感
      const isScripture = (gift.name && /心经|经卷|佛经|法本/i.test(gift.name)) || (gift.tags && gift.tags.includes('scripture'));
      if (npc.identity === '佛修' && isScripture) {
        const event = createMonkScriptureEvent(npc, gift);
        setModalState({ type: 'EVENT', data: { npc, event } });
        // 已扣除费用（上面已处理），等待玩家在事件中选择后由 handleOptionSelect 应用变动
        return;
      }

      // 3. ✅ 严格修复版：更新 NPC 数据（普通礼物走原有流程）
      setActiveNpcs(prev => prev.map(n => {
        // 必须用 map 里的 n 来判断 id，确保改的是最新状态
        if (n.id === npc.id) {
          // 1. 获取旧关系，防止 undefined
          const oldRel = n.relationship || { affection: 0, trust: 0 };
        
          return {
            ...n,
            relationship: {
              ...oldRel,
              // 2. 安全读取并增加
              affection: (oldRel.affection || 0) + change
            }
          };
        }
        return n;
      }));

      // 4. 显示结果
      showResult(
        "赠礼",
        msg,
        change > 0, // 如果加好感就是成功，减好感就是失败
        { 灵石: -gift.cost, 好感: change }
      );
  };

  // --- 3. 处理劝生回调 ---
  const handleNegotiateConfirm = (strategy) => {
    const npc = modalState.data;
    
    // 防御性编程：检查npc是否存在
    if (!npc) {
      console.warn('No NPC found in modalState.data');
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
       setActiveNpcs(prev => prev.map(n => n.id === npc.id ? { ...n, isPregnant: true, pregnancyProgress: 0 } : n));
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

  // 2. 新增：外出游历逻辑
  const handleExplore = () => {
    // 1. 扣除消耗
    setPlayer(p => ({ ...p, resources: { ...p.resources, spiritStones: p.resources.spiritStones - 5 } }));
    
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
  const handlePrologueFinish = (choice) => {
    let bonus = {};
    if (choice === 'RELIC') {
      bonus = { stats: { ...player.stats, aptitude: player.stats.aptitude + 10 }, items: ["神秘古玉"] };
      addLog("你紧握母亲的古玉，感到一股暖流涌入经脉。(资质+10)");
    } else if (choice === 'MONEY') {
      bonus = { resources: { spiritStones: player.resources.spiritStones + 500, money: player.resources.money + 100 } };
      addLog("你带走了所有积蓄，这将是你翻身的资本。(灵石+500)");
    } else {
      bonus = { stats: { ...player.stats, cunning: player.stats.cunning + 10 }, buffs: ["神行"] };
      addLog("你利用神行符甩开了追兵。(初始闪避率提升)");
    }

    setPlayer(prev => ({ ...prev, ...bonus }));
    setGameStage('MAIN');
  };

  // --- 存档逻辑 ---
  const handleSave = () => {
    const gameState = {
      player,
      children,
      activeNpcs,
      rival,
      gameStage,
      logs,
      inventory,
      // 可以在这里加更多，比如 businesses 如果它是独立状态的话
    };
    return saveGameToStorage(gameState);
  };

  const handleLoad = () => {
    const savedData = loadGameFromStorage();
    if (savedData) {
      // 恢复数据
      setPlayer(savedData.player);
      setChildren(savedData.children || []);
      setActiveNpcs(savedData.activeNpcs || []);
      setRival(savedData.rival);
      setGameStage(savedData.gameStage || 'MAIN');
      setLogs(savedData.logs || []);
      setInventory(savedData.inventory || []);
      
      // 读档后通常需要重置一些UI状态
      setIsAuto(false); 
      alert("读取成功！欢迎回来，道友。");
    }
  };

  const handleResetGame = () => {
    // 强制刷新页面，这是最彻底的重置方式
    window.location.reload();
  };

  // --- 逻辑 B: 处理复仇行动 ---
  const handleRevengeAction = (action) => {
    if (action === 'SABOTAGE') {
      if (player.resources.spiritStones < 50) return alert("灵石不足！");
      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: p.resources.spiritStones - 50}}));
      setRival(r => ({
        ...r,
        combatPower: Math.max(0, r.combatPower - 100),
        logs: [`你散布的谣言让楚清瑶心境受损，修为倒退。`, ...r.logs]
      }));
      showResult("行动成功", "楚清瑶在家族中受到了长老的训斥。", true);
    }
    else if (action === 'DEFEND') {
      if (player.resources.spiritStones < 20) return alert("灵石不足！");
      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: p.resources.spiritStones - 20}}));
      setRival(r => ({ ...r, threat: Math.max(0, r.threat - 20) }));
      showResult("隐匿成功", "你更换了藏身之处，暂时避开了楚家的耳目。", true);
    }
    else if (action === 'DUEL') {
      const myCP = calculateCombatPower(player);
      if (myCP > rival.combatPower) {
        setRival(r => ({ ...r, status: "defeated" }));
        showResult("大仇得报！", "在决战中，你一剑刺穿了楚清瑶的气海。看着她难以置信的眼神，你终于夺回了属于你的一切！", true, null, false);
        addLog("【结局】你击败了宿敌楚清瑶，心魔尽去，大道可期！");
      } else {
        // 失败惩罚：重伤掉修为
        setPlayer(p => ({ ...p, currentExp: 0, stats: {...p.stats, health: 10} }));
        showResult("战败", "你技不如人，重伤逃遁，修为尽失！", false);
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

    // 计算收益 (基础收益 * (1 + 掌柜智力/100))
    const manager = children.find(c => c.id === childId);
    const income = Math.floor(biz.baseIncome * (1 + manager.stats.intelligence / 100));

    // 更新玩家数据
    setPlayer(prev => ({
      ...prev,
      resources: {
        ...prev.resources,
        spiritStones: prev.resources.spiritStones - biz.cost
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
      showResult("探索失败", "灵石不足", false);
      return;
    }

    // 扣费并初始化探险状态机
    setPlayer(prev => ({
      ...prev,
      resources: { ...prev.resources, spiritStones: prev.resources.spiritStones - realm.cost }
    }));

    setExploreRealmState({ id: realm.id, name: realm.name, total: 10 });
    setExploreTeamIds(team);
    setExploreProgress(1);
    setExploreLog([`你踏入【${realm.name}】的边缘，小心翼翼前行。`]);
    const firstEvent = getRandomExplorationEvent({ realmId: realm.id, progress: 1 });
    setCurrentExploreEvent(firstEvent);
    setIsExploring(true);
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

    // 移出队列
    setTestQueue(prev => prev.filter(c => c.id !== child.id));
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
    const updatedNpcs = activeNpcs.map(npc => {
      if (npc.isPregnant) {
        const newProgress = npc.pregnancyProgress + 1;
        if (newProgress >= 9) { // 9个月怀孕期
          // 生成孩子
          const child = generateChild(player, npc, player.time.year);
          newBabies.push(child);
          newLogs.push(`【诞子】${npc.name}为你诞下一子：${child.name}（${child.gender}，天赋${child.tier}）`);
          // 重置NPC状态
          return { ...npc, isPregnant: false, pregnancyProgress: 0 };
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
    const readyToTest = finalChildren.filter(c => Math.floor(c.age * 12) === 72 && !c.isTested);
    if (readyToTest.length > 0) {
      // 为每个准备测灵的孩子生成灵根
      finalChildren = finalChildren.map(child => {
        // 如果是准备测灵的孩子，且还没有灵根，生成灵根
        if (readyToTest.some(c => c.id === child.id) && !child.spiritRoot) {
          // 生成灵根
          const aptitude = child.stats.aptitude;
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

          return { ...child, spiritRoot: spiritRoot };
        }
        return child;
      });
      
      // 加入测试队列
      const testQueueChildren = finalChildren.filter(c => readyToTest.some(r => r.id === c.id));
      setTestQueue(prev => [...prev, ...testQueueChildren]);
    }
    
    // 5. 添加新出生的孩子到最终列表
    if (newBabies.length > 0) {
      finalChildren = [...finalChildren, ...newBabies];
    }
    
    // 6. 最终统一更新children状态（不再需要去重，因为newBabies是新生成的，ID唯一）
    setChildren(finalChildren);
    
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

    // 3. 宿敌成长 (如果是活的)
    if (rival.status === 'alive') {
      // 庶妹是天才，成长速度很快
      const growth = 20 + Math.floor(Math.random() * 30);
      let newThreat = rival.threat + 2; // 威胁增长快一点

      // 触发战斗：威胁度 >= 100
      if (newThreat >= 100) {
         if (isAutoMode) setIsAuto(false); // 强制暂停
         
         // 1. 构造敌人实体 (简单将战力转化为攻防)
         const enemyCombatPower = rival.combatPower || 100; // 确保有默认值
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
         setRival(prev => ({ ...prev, threat: 0 }));
         
         // return; // 如果想完全阻断本月后续逻辑，可以return，但建议继续运行
      } else {
         // 没满100，正常更新
         setRival(prev => ({
           ...prev,
           combatPower: prev.combatPower + growth,
           threat: Math.min(100, newThreat),
           // 简单模拟境界提升
           tier: prev.combatPower > 20000 ? "金丹初期" : (prev.combatPower > 5000 ? "筑基后期" : prev.tier)
         }));
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
      
      // 获取当前境界配置
      const tierConf = getTierConfig(prevPlayer.tier);
      
      // 计算新经验
      let newExp = prevPlayer.currentExp + 5 + totalFeedback; // 5是基础自然增长
      
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
  }, [children, player, activeNpcs, rival, testQueue, isAuto]);

  // 回调：玩家为子嗣选择宗门并分配职位
  const handleAssignSect = (childId, sectId, rank = '外门弟子') => {
    const sectObj = getSectById(sectId);

    // 检查互斥：若已有其他子嗣在互斥宗门，则拒绝并提示
    const conflict = children.find(c => c.sect && sectObj.exclusiveWith && sectObj.exclusiveWith.includes(c.sect.id));
    if (conflict) {
      showResult('入门失败', `${conflict.name} 已在互斥宗门中，无法同时收录两者。`, false);
      return;
    }

    setChildren(prev => prev.map(c => {
      if (c.id === childId) {
        const updated = { ...c, sect: sectObj, rank };
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
        timer = setTimeout(runAuto, 1000); // 加快速度：1000毫秒(1秒) = 1个月，方便测试
      };
      timer = setTimeout(runAuto, 1000);
    }
    return () => clearTimeout(timer);
  }, [isAuto, handleNextMonth]); // 依赖isAuto和handleNextMonth函数

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

  // 2. 新增：处理婚配
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

    setChildren(prev => prev.map(c => {
      if (c.id === childId) {
        // 生成对应境界的强力配偶，确保是异性
        const spouse = generateSpouse(c.tierTitle || '凡人', c.gender);
        return { ...c, spouse: spouse };
      }
      return c;
    }));

    setPlayer(p => ({...p, resources: {...p.resources, spiritStones: p.resources.spiritStones - 500}}));
    addLog(`💍 花费500灵石，为子嗣操办了婚事，家族开枝散叶指日可待！`);
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
      if (player.resources.spiritStones < 100) return showResult("失败", "灵石不足 100", false);

      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: p.resources.spiritStones - 100}}));
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
      if (player.resources.spiritStones < 50) return showResult("失败", "灵石不足 50", false);

      setPlayer(p => ({...p, resources: {...p.resources, spiritStones: p.resources.spiritStones - 50}}));
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
    if (!item || item.type !== 'consumable') return showResult("使用失败", "该物品不可使用", false);

    const target = children.find(c => c.id === childId);
    if (!target) return showResult("使用失败", "未找到子嗣", false);

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
              <div style={{textAlign:'center', marginBottom:'15px', color:'#666', fontSize:'12px'}}>
                 🖱️ 滚轮缩放 • 👆 拖拽移动 • 点击头像查看详情
              </div>
              
              {/* 替换原来的 FamilyTree 为 ZoomableTree */}
              <ZoomableTree
                player={player}
                children={children} // 传入所有子嗣（包括孙子）
                pregnantNpcs={activeNpcs.filter(n => n.isPregnant)}
                onChildClick={(child) => setSelectedChild(child)}
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
                  <button onClick={handleExplore} style={styles.actionButton}>
                    外出游历 (30%遇新男主，-5灵石)
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
              rival={rival}
              onAction={handleRevengeAction}
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
              onOpenInventory={() => setInventoryModal({ open: true, mode: 'VIEW', slot: null, childId: null })}
            />
          )}
        </div>
      )}

      {/* 3. 弹窗层 */}
      {modalState.type === 'GIFT' && (
        <GiftModal
          npc={modalState.data}
          player={player}
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
        />
      )}

      {/* 渲染测灵弹窗 (如果有队列) */}
      {testQueue.length > 0 && (
        <SpiritRootTestModal
          child={testQueue[0]} // 每次只测第一个
          onFinish={handleTestFinish}
          onClose={() => setTestQueue(prev => prev.slice(1))} // 关闭弹窗时移除队列中的第一个元素
        />
      )}

      {/* 子女选择弹窗 */}
      {childSelectorModal.open && (
        <ChildSelectorModal
          children={children}
          item={childSelectorModal.item}
          onSelect={(child) => {
            if (!childSelectorModal.item) return;
            handleUseConsumable(child.id, childSelectorModal.item.instanceId);
            setChildSelectorModal({ open: false, item: null });
            setInventoryModal({ open: false, mode: 'VIEW', slot: null, childId: null });
          }}
          onClose={() => setChildSelectorModal({ open: false, item: null })}
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

      {/* 4. 底部导航栏 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 5. 升级版悬浮控制台 */}
      <div style={styles.fabContainer}>
        
        {/* 自动播放开关 (小按钮) */}
        <button
          onClick={() => setIsAuto(!isAuto)}
          style={{
            ...styles.autoBtn,
            backgroundColor: isAuto ? '#76ff03' : '#e0e0e0', // 亮绿色表示开启
            color: isAuto ? '#33691e' : '#757575'
          }}
        >
          {isAuto ? '⏸ 停止' : '▶ 闭关'}
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
              <span style={{fontSize:'20px'}}>🌙</span>
              <span style={{fontSize:'10px'}}>下月</span>
            </>
          )}
        </button>
      </div>

      {/* 6. NPC详情弹窗 (保持不变) */}
      {selectedNpc && (
        <NpcDetailModal
          npc={selectedNpc}
          onClose={() => setSelectedNpc(null)}
          onOptionSelect={handleOptionSelect}
          player={player}
          children={children}
          npcs={activeNpcs}
        />
      )}

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
            
            // 选择完选项后自动推进到下一个事件
            setTimeout(() => {
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
            }, 500);
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

      {/* 9. 渲染指南弹窗 */}
      {showGuide && <GuideModal onClose={handleCloseGuide} />}
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh', // 占满整个屏幕高度
    backgroundColor: '#f5f0e8', // 古色古香的背景色
    maxWidth: '600px', // 在大屏幕上限制宽度，模拟手机
    margin: '0 auto',
    boxShadow: '0 0 30px rgba(0,0,0,0.15)', // 柔和阴影
    position: 'relative',
    backgroundImage: 'linear-gradient(rgba(245, 240, 232, 0.8), rgba(245, 240, 232, 0.8))',
    backgroundSize: '100% 100%'
  },
  mainContent: {
    flex: 1,
    padding: '15px', // 更大的内边距
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
    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)', // 渐变背景
    color: 'white',
    border: 'none',
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // 柔和阴影
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  },
  // 外出游历按钮
  exploreBtn: {
    padding: '15px 30px',
    background: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)', // 渐变背景
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // 柔和阴影
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '300px',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }
  },
  // 新增容器：把两个按钮包起来
  fabContainer: {
    position: 'absolute',
    bottom: '90px',
    right: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    zIndex: 90
  },

  // 自动播放小开关
  autoBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid #d7ccc8', // 古色边框
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // 柔和阴影
    transition: 'all 0.3s ease',
    backgroundColor: '#f5f0e8', // 古色背景
    color: '#5d4037' // 古色文字
  },

  // 修改主按钮样式
  fabBtn: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    backgroundColor: 'linear-gradient(135deg, #8d6e63 0%, #6d4c41 100%)', // 渐变背景
    color: '#fff',
    border: '4px solid #f5f0e8', // 古色边框
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)', // 柔和阴影
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
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
    border: '2px solid #d7ccc8', // 古色边框
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    backgroundColor: '#f5f0e8', // 古色背景
    color: '#5d4037', // 古色文字
    ':hover': {
      background: 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 100%)',
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
    backgroundColor: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)', // 渐变背景
    borderRadius: '16px', // 圆角
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // 柔和阴影
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '2px solid #d7ccc8', // 古色边框
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
    }
  },

  // 返回按钮
  backButton: {
    marginBottom: '15px',
    padding: '8px 16px',
    backgroundColor: 'linear-gradient(135deg, #f5f0e8 0%, #e0e0e0 100%)', // 渐变背景
    border: '2px solid #d7ccc8', // 古色边框
    borderRadius: '12px', // 圆角
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#5d4037', // 古色文字
    transition: 'all 0.3s ease',
    ':hover': {
      background: 'linear-gradient(135deg, #d7ccc8 0%, #bcaaa4 100%)',
      transform: 'translateY(-2px)'
    }
  },
  // 修为进度条区域
  cultivationSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)', // 渐变背景
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // 柔和阴影
    border: '2px solid #d7ccc8' // 古色边框
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
  }
};

export default App;
