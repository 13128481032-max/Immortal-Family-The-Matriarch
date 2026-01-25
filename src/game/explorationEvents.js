// 探险事件库与辅助方法
import { REALMS } from './challengeSystem.js';
import { generateRandomNpc } from './npcGenerator.js';

// 基础工具
const pickWeighted = (items) => {
  const sum = items.reduce((s, it) => s + (it.weight || 1), 0);
  let r = Math.random() * sum;
  for (const it of items) {
    r -= (it.weight || 1);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
};

const realmById = (id) => REALMS.find(r => r.id === id);

// 依据秘境与层数生成敌人
export const generateRealmEnemy = (realmId, progress = 1) => {
  const realm = realmById(realmId) || { recommendCP: 300, drops: ['herb_bandage'] };
  const baseCP = realm.recommendCP || 300;
  // 随层数微增强度
  const cp = Math.floor(baseCP * (0.6 + progress * 0.06));
  const enemyName = progress >= 10 ? '镇守妖王' : '拦路妖兽';
  return {
    name: enemyName,
    combatStats: {
      hp: Math.floor(cp * 2.2),
      atk: Math.floor(cp * 0.35),
      def: Math.floor(cp * 0.18),
      mp: 0,
      maxHp: Math.floor(cp * 2.2),
      maxMp: 0
    },
    drops: realm.drops || ['herb_bandage']
  };
};

// 检查背包中是否存在某类物品 (通过模板ID)
export const hasItemId = (inventory, itemId) => !!inventory?.find(i => i.id === itemId);

// 事件库
export const EXPLORATION_EVENTS = [
  {
    id: 'combat_beast',
    kind: 'COMBAT',
    realm: 'ANY',
    weight: 3,
    title: '拦路妖兽',
    desc: '前路忽有低吼，一只通体黝黑的妖兽拦住去路，獠牙滴着粘稠的毒液。',
    options: [
      { label: '开始战斗', action: (ctx) => ({ type: 'START_COMBAT' }) },
      { label: '绕路而行', action: () => ({ type: 'LOG', msg: '你谨慎绕行，虽耗费时间，但保住了性命。' }) }
    ]
  },
  {
    id: 'loot_array',
    kind: 'LOOT',
    realm: 'ANY',
    weight: 2,
    title: '上古残阵',
    desc: '脚下刻纹隐约发光，似有古阵残留。阵眼处灵光闪烁。',
    options: [
      {
        label: '强行破阵 (考验攻击)',
        action: (ctx) => {
          const atk = ctx.player?.combatStats?.atk || 10;
          if (atk > 80) return { type: 'LOOT', items: ['beast_core'], msg: '你以力破阵，灵光炸裂，拾得一枚兽丹。' };
          return { type: 'HP_CHANGE', hpDelta: -150, msg: '阵纹反噬，灵力震荡，你受了不小的伤。' };
        }
      },
      {
        label: '巧解阵法 (考验悟性)',
        action: (ctx) => {
          const intel = ctx.player?.stats?.intelligence || 40;
          if (intel >= 70) return { type: 'LOOT', items: ['foundation_pill'], msg: '你以悟性识阵路，顺利取出一枚筑基丹。' };
          return { type: 'LOG', msg: '你思索良久未得其解，决定暂且离开。' };
        }
      }
    ]
  },
  {
    id: 'encounter_injured',
    kind: 'ENCOUNTER',
    realm: 'ANY',
    weight: 1,
    title: '林间呻吟',
    desc: '草丛间一名修士伤势严重，衣着华贵，眉宇间透着不凡。',
    options: [
      {
        label: '赠药救治 (-1 止血草)',
        condition: (ctx) => hasItemId(ctx.inventory, 'herb_bandage'),
        action: (ctx) => {
          const npc = generateRandomNpc('炼气中期');
          npc.stats.aptitude = Math.max(npc.stats.aptitude, 90);
          return { type: 'NPC_JOIN', npc, removeItemId: 'herb_bandage', msg: '对方服下灵药，虽虚弱仍致谢，留传讯符。' };
        }
      },
      {
        label: '趁火打劫',
        action: () => ({ type: 'LOOT', items: ['spirit_stones_500'], msg: '你摸走了他的储物袋，扬长而去。' })
      },
      { label: '视而不见', action: () => ({ type: 'LOG', msg: '多一事不如少一事，你悄然离开。' }) }
    ]
  },
  {
    id: 'fruit_unknown',
    kind: 'LOOT',
    realm: 'ANY',
    weight: 1,
    title: '不知名灵果',
    desc: '藤蔓上挂着一枚晶莹的灵果，香气四溢，却不见记录。',
    options: [
      {
        label: '吃下试试',
        action: () => {
          const r = Math.random();
          if (r < 0.4) return { type: 'EXP_GAIN', amount: 1200, msg: '灵气化作暖流，修为暴涨！' };
          if (r < 0.8) return { type: 'HP_CHANGE', hpDelta: -120, msg: '苦涩袭喉，你中毒受创……' };
          return { type: 'LOG', msg: '灵根一阵发烫，但很快平息（未发生异变）。' };
        }
      },
      { label: '谨慎离开', action: () => ({ type: 'LOG', msg: '你按捺好奇心，继续前行。' }) }
    ]
  },
  {
    id: 'story_two_beasts',
    kind: 'STORY',
    realm: 'ANY',
    weight: 1,
    title: '两难境地',
    desc: '前方山坳，两只妖兽撕咬成团，腥风扑面，血肉横飞。',
    options: [
      { label: '渔翁得利', action: () => ({ type: 'LOOT', items: ['beast_fang'], msg: '你伺机而动，拾得一枚妖兽毒牙。' }) },
      { label: '悄悄溜走', action: () => ({ type: 'LOG', msg: '你贴着岩壁缓步离开，未惊动双方。' }) }
    ]
  }
];

// 最终层的Boss事件 (根据秘境定制标题)
export const getBossEvent = (realmId) => {
  const realm = realmById(realmId);
  const title = realm?.name ? `${realm.name} · 镇守者` : '镇守者';
  return {
    id: 'boss_guard',
    kind: 'BOSS',
    realm: realmId,
    weight: 1,
    title,
    desc: '一路艰险，你终于逼近秘境深处，只见巨兽盘踞，双眸如炬。',
    options: [
      { label: '与守护者决战！', action: () => ({ type: 'START_COMBAT' }) },
      { label: '观望退却', action: () => ({ type: 'LOG', msg: '你权衡再三，决定保命为上。' }) }
    ]
  };
};

// 依据当前上下文抽取事件
export const getRandomExplorationEvent = (ctx) => {
  const { realmId, progress } = ctx;
  // 普通层：从事件池中按权重抽取
  const pool = EXPLORATION_EVENTS.filter(e => e.realm === 'ANY' || e.realm === realmId);
  // 适度调整：前期偏向LOOT/ENCOUNTER，中后期偏向COMBAT
  const adjusted = pool.map(e => {
    let w = e.weight || 1;
    if (progress <= 3 && (e.kind === 'LOOT' || e.kind === 'ENCOUNTER')) w *= 1.5;
    if (progress >= 7 && e.kind === 'COMBAT') w *= 1.5;
    return { ...e, weight: w };
  });
  return pickWeighted(adjusted);
};
