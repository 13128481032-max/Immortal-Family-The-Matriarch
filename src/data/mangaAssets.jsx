// src/data/mangaAssets.js

// 🎨 唯美配色板
export const COLORS = {
  skin: ["#FFF0E5", "#FCE4D6", "#FAD0C4", "#E6C7C2"], // 冷白/粉白/暖白
  hair: ["#2C3E50", "#E6C9A8", "#8E44AD", "#C0392B", "#BDC3C7", "#1A1A1A"], // 黑/金/紫/红/银/深黑
  eye:  ["#3498DB", "#2ECC71", "#9B59B6", "#F1C40F", "#E74C3C", "#34495E"]  // 蓝/绿/紫/金/红/灰
};

// 1. 脸型 (Anime Face Shape)
// 日漫通常是瓜子脸，线条要利落
export const BASES = [
  // 0: 标准美少年 (尖下巴)
  <path d="M25 40 Q 25 75 50 92 Q 75 75 75 40 Q 75 15 50 15 Q 25 15 25 40 Z" stroke="#DEB887" strokeWidth="1" />,
  // 1: 温润鹅蛋脸
  <path d="M22 40 Q 22 70 50 88 Q 78 70 78 40 Q 78 15 50 15 Q 22 15 22 40 Z" stroke="#DEB887" strokeWidth="1" />
];

// 2. 眼睛 (Soul of Anime) - 包含眼白、瞳孔、高光、睫毛
export const EYES = [
  // 0: 桃花眼 (深情)
  <g>
    {/* 睫毛/眼线 */}
    <path d="M32 52 Q 40 46 48 52" stroke="#333" strokeWidth="2" fill="none" />
    <path d="M52 52 Q 60 46 68 52" stroke="#333" strokeWidth="2" fill="none" />
    {/* 瞳孔 */}
    <circle cx="40" cy="53" r="3.5" />
    <circle cx="60" cy="53" r="3.5" />
    {/* 高光 */}
    <circle cx="42" cy="51" r="1.5" fill="white" />
    <circle cx="62" cy="51" r="1.5" fill="white" />
  </g>,

  // 1: 丹凤眼 (高冷)
  <g>
    <path d="M30 50 Q 38 45 46 48" stroke="#333" strokeWidth="2.5" fill="none" />
    <path d="M54 48 Q 62 45 70 50" stroke="#333" strokeWidth="2.5" fill="none" />
    <ellipse cx="38" cy="49" rx="3" ry="2.5" />
    <ellipse cx="62" cy="49" rx="3" ry="2.5" />
    <circle cx="39" cy="48" r="1" fill="white" />
    <circle cx="63" cy="48" r="1" fill="white" />
  </g>,

  // 2: 狗狗眼 (少年感)
  <g>
    <path d="M32 48 Q 40 42 48 48" stroke="#333" strokeWidth="2" fill="none" />
    <path d="M52 48 Q 60 42 68 48" stroke="#333" strokeWidth="2" fill="none" />
    <circle cx="40" cy="50" r="4.5" />
    <circle cx="60" cy="50" r="4.5" />
    <circle cx="38" cy="48" r="2" fill="white" />
    <circle cx="58" cy="48" r="2" fill="white" />
  </g>
];

// 3. 眉毛
export const BROWS = [
  // 0: 剑眉
  <g><path d="M30 42 L 48 38" stroke="#555" strokeWidth="1.5" /><path d="M52 38 L 70 42" stroke="#555" strokeWidth="1.5" /></g>,
  // 1: 平眉
  <g><path d="M32 40 Q 40 40 46 41" stroke="#555" strokeWidth="1.5" fill="none" /><path d="M54 41 Q 60 40 68 40" stroke="#555" strokeWidth="1.5" fill="none" /></g>
];

// 4. 嘴巴
export const MOUTHS = [
  // 0: 微笑
  <path d="M45 75 Q 50 78 55 75" stroke="#444" strokeWidth="1.5" fill="none" />,
  // 1: 冷淡
  <path d="M47 76 L 53 76" stroke="#444" strokeWidth="1.5" fill="none" />,
  // 2: 傲娇
  <path d="M46 76 Q 50 74 54 76" stroke="#444" strokeWidth="1.5" fill="none" />
];

// 5. 后发 (Back Hair) - 垫在脸后面，制造长发效果
export const HAIR_BACKS = [
  // 0: 短发 (无后发)
  null,
  // 1: 长直发
  <path d="M15 40 Q 10 90 20 100 L 80 100 Q 90 90 85 40 Z" />,
  // 2: 飘逸高马尾
  <path d="M20 50 Q 0 80 30 110 L 40 60 Z" />
];

// 6. 前发 (Front Hair) - 刘海，灵魂所在
export const HAIR_FRONTS = [
  // 0: 中分碎发 (修仙常见)
  <path d="M20 50 Q 25 10 50 10 Q 75 10 80 50 Q 80 20 50 20 Q 20 20 20 50 L 25 30 L 35 55 L 45 25 L 50 40 L 55 25 L 65 55 L 75 30 Z" />,
  // 1: 侧分刘海 (贵公子)
  <path d="M18 45 Q 20 5 50 5 Q 80 5 82 45 Q 80 20 50 15 Q 20 20 18 45 L 30 55 L 40 30 L 80 50 Z" />,
  // 2: 凌乱狂野 (魔尊风)
  <path d="M15 50 Q 20 0 50 5 Q 80 0 85 50 L 70 30 L 60 60 L 50 30 L 40 60 L 30 30 Z" />
];

// 7. 衣服 (简单领口)
export const CLOTHES = [
  <path d="M20 90 Q 50 110 80 90 L 80 120 L 20 120 Z" fill="#444" /> // 简单道袍
];