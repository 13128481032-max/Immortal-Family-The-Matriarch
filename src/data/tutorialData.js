// src/data/tutorialData.js

export const TUTORIAL_CHAPTERS = [
  {
    id: 'INTRO',
    title: '📜 仙途总纲 (核心玩法)',
    content: `
      <p>欢迎踏入《嫡女仙途》。这是一个结合了<strong>家族繁衍</strong>与<strong>个人修仙</strong>的游戏。</p>
      <p>你的终极目标是：<strong>复仇</strong>。击败宿敌楚清瑶，夺回属于你的一切。</p>
      <ul>
        <li><strong>游历</strong>：结识不同身份、资质的伴侣。</li>
        <li><strong>繁衍</strong>：生下子嗣，扩大家族规模。</li>
        <li><strong>反哺</strong>：子嗣的修为会按比例<strong>反哺</strong>给你，助你突破境界。</li>
        <li><strong>经营</strong>：派遣子嗣打理产业，赚取灵石。</li>
      </ul>
    `
  },
  {
    id: 'FEEDBACK',
    title: '⚡ 修为反哺机制 (重要)',
    content: `
      <p>为何前期修为增长缓慢？因为<strong>凡人子嗣的反哺微乎其微</strong>。</p>
      <div style="background:#eee; padding:10px; border-radius:5px; margin:10px 0;">
        <strong>反哺公式：</strong><br/>
        基础值 × 资质加成 × <strong>境界系数</strong>
      </div>
      <p><strong>境界系数详解：</strong></p>
      <ul>
        <li>👶 <strong>凡人/炼气期</strong>：效率极低 (10%)。数量再多也难以质变。</li>
        <li>🧒 <strong>筑基期</strong>：效率中等 (50%)。家族的中坚力量。</li>
        <li>🧑 <strong>金丹期及以上</strong>：效率全开 (100%)。一个金丹子嗣顶得上百个凡人。</li>
      </ul>
      <p><strong>策略建议：</strong>前期不要盲目生孩子，尽快通过丹药、教导提升子嗣境界，或者寻找高资质伴侣改良后代基因。</p>
    `
  },
  {
    id: 'COMBAT',
    title: '⚔️ 追杀与战斗',
    content: `
      <p>你的宿敌<strong>楚清瑶</strong>在时刻注视着你。请关注【复仇】面板的<strong>威胁度</strong>。</p>
      <ul>
        <li><strong>威胁度增长</strong>：随着时间流逝，或者你行事过于张扬，威胁度会上升。</li>
        <li><strong>触发战斗</strong>：当威胁度达到 <strong>100</strong> 时，庶妹会派出杀手进行截杀！</li>
        <li><strong>战斗结算</strong>：战斗采用回合制，对比双方 <strong>HP(气血)</strong> 和 <strong>ATK(攻击)</strong>。</li>
      </ul>
      <p><strong>如何应对？</strong><br/>1. 在复仇面板花费灵石<strong>“隐匿行踪”</strong>降低威胁。<br/>2. 提升自身战力，正面反杀杀手（可获得大量战利品）。</p>
    `
  },
  {
    id: 'ROOTS',
    title: '🔮 灵根与资质',
    content: `
      <p>灵根决定了修仙的上限。6岁测灵时揭晓。</p>
      <ul>
        <li><span style="color:#FFD700">天灵根 (90-100)</span>：修炼神速，战斗力极强。</li>
        <li><span style="color:#00BCD4">变异灵根 (80-89)</span>：雷/冰/风属性，杀伐第一。</li>
        <li><span style="color:#9C27B0">单/双灵根</span>：可入大宗门，前途无量。</li>
        <li><span style="color:#9E9E9E">四/五灵根</span>：资质平庸，建议从事家族产业。</li>
      </ul>
    `
  }
];
