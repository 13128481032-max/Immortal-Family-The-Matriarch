import React, { useEffect, useRef } from 'react';
import { SKIN_PALETTES, HAIR_COLORS, EYE_COLORS, BASES, EYES, MOUTHS, HAIRS } from '../../data/pixelAssets.js';

// 辅助组件：渲染一组像素点
const PixelGroup = ({ pixels, color }) => (
  <>
    {pixels.map((p, i) => (
      // x={p[0]} y={p[1]} 定位，宽高都是1个单位
      <rect key={i} x={p[0]} y={p[1]} width="1" height="1" fill={color} />
    ))}
  </>
);

const Avatar = ({ dna, size = 64, gender }) => {
  // 默认DNA
  const config = dna || {
    base: 0, skinColor: 0,
    eye: 0, eyeColor: 0,
    mouth: 0,
    hair: 0, hairColor: 0
  };

  // 优先使用 assets 图片层叠（male/female），回退到像素矢量渲染
  const hairIdx = config.hair ?? config.hairId ?? 0;
  const tzoneIdx = config.tZoneId ?? config.eye ?? 0;
  const mouthIdx = config.mouth ?? config.mouthId ?? 0;

  const resolvedGender = gender || config.gender;
  const isFemale = resolvedGender === 'female' || resolvedGender === '女' || resolvedGender === 'F';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: '8px',
    border: '3px solid #3e2723',
    background: '#8d6e63',
    imageRendering: 'pixelated',
    position: 'relative',
    overflow: 'hidden'
  };

  const layerStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    imageRendering: 'pixelated',
    pointerEvents: 'none'
  };

  // 构造资源路径（使用 public 目录，Vite 会将其复制到构建输出的根目录）
  const getMalePath = (part, idx) => {
    if (part === 'base') return `/assets/male/base_face.png`;
    // 支持传入 -1 来表示无发型（光头）
    if (idx == null || idx < 0) return null;
    const num = String((idx || 0) + 1).padStart(2, '0');
    return `/assets/male/${part}/${part}_${num}.png`;
  };

  // female 分层资源支持：base_face + tzone + mouth + hair
  const getFemalePath = (part, idx) => {
    if (part === 'base') return `/assets/female/base_face.png`;
    // female assets use names like tzone01.png, mouth01.png, hair01.png (no underscore)
    const num = String((idx || 0) + 1).padStart(2, '0');
    return `/assets/female/${part}/${part}${num}.png`;
  };

  // 如果是 female，使用分层渲染（并支持发色着色）
  if (isFemale) {
    const fBase = getFemalePath('base');
    const fTzone = getFemalePath('tzone', tzoneIdx);
    const fMouth = getFemalePath('mouth', mouthIdx);
    const fHair = getFemalePath('hair', hairIdx);

    // 解析发色（支持索引或直接 hex）
    let hairColorHex = '#2C2C2C';
    if (typeof config.hairColor === 'string' && config.hairColor.startsWith('#')) hairColorHex = config.hairColor;
    else if (typeof config.hairColor === 'number') hairColorHex = HAIR_COLORS[config.hairColor] || HAIR_COLORS[0];

    return (
      <div style={containerStyle}>
        <img src={fBase} alt="female-base" style={layerStyle} draggable={false} />
        <img src={fTzone} alt="female-tzone" style={layerStyle} draggable={false} />
        <img src={fMouth} alt="female-mouth" style={layerStyle} draggable={false} />
        {fHair ? <HairTintCanvas src={fHair} color={hairColorHex} size={size} style={layerStyle} /> : null}
      </div>
    );
  }

  // male 分层渲染：base -> tzone -> mouth -> hair
  const baseSrc = getMalePath('base');
  const tzoneSrc = getMalePath('tzone', tzoneIdx);
  const mouthSrc = getMalePath('mouth', mouthIdx);
  const hairSrc = getMalePath('hair', hairIdx);
  // male hair color parsing (support index or hex)
  let hairColorHex = '#2C2C2C';
  if (typeof config.hairColor === 'string' && config.hairColor.startsWith('#')) hairColorHex = config.hairColor;
  else if (typeof config.hairColor === 'number') hairColorHex = HAIR_COLORS[config.hairColor] || HAIR_COLORS[0];

  return (
    <div style={containerStyle}>
      <img src={baseSrc} alt="base" style={layerStyle} draggable={false} />
      <img src={tzoneSrc} alt="tzone" style={layerStyle} draggable={false} />
      <img src={mouthSrc} alt="mouth" style={layerStyle} draggable={false} />
      {/* hair: 使用 canvas 对灰度发图进行着色 (tint) */}
      {hairSrc ? <HairTintCanvas src={hairSrc} color={hairColorHex} size={size} style={layerStyle} /> : null}
    </div>
  );
};

// 小组件：把灰度图片绘制到 canvas 并用指定颜色填充 (source-in)
const HairTintCanvas = ({ src, color, size, style }) => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // 高 DPI 处理
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 将原图绘制到临时画布，然后用 source-in 填充颜色，再绘制回主 canvas
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width;
      tmp.height = canvas.height;
      const tctx = tmp.getContext('2d');
      tctx.imageSmoothingEnabled = false;
      tctx.drawImage(img, 0, 0, tmp.width, tmp.height);

      // 为避免过饱和/色偏，先调整颜色的饱和度与亮度
      const adjustHexColor = (hex) => {
        // hex to rgb
        const c = hex.replace('#','');
        const r = parseInt(c.substring(0,2),16)/255;
        const g = parseInt(c.substring(2,4),16)/255;
        const b = parseInt(c.substring(4,6),16)/255;
        // rgb to hsl
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        let h=0,s=0,l=(max+min)/2;
        if(max!==min){
          const d = max-min;
          s = l>0.5? d/(2-max-min) : d/(max+min);
          switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }
        // reduce saturation slightly and increase lightness modestly for better match
        s = Math.max(0, Math.min(1, s * 0.9));
        l = Math.max(0, Math.min(1, l * 1.05));
        return { h, s, l };
      };

      const hsl = adjustHexColor(color);
      const h = Math.round(hsl.h * 360);
      const s = Math.round(hsl.s * 100);
      const l = Math.round(hsl.l * 100);

      // 创建一个纯色画布并用原图作为蒙版，之后与原图做 multiply 混合，保留阴影细节
      const colorCanvas = document.createElement('canvas');
      colorCanvas.width = tmp.width;
      colorCanvas.height = tmp.height;
      const cctx = colorCanvas.getContext('2d');
      cctx.imageSmoothingEnabled = false;
      cctx.fillStyle = `hsl(${h} ${s}% ${l}%)`;
      cctx.fillRect(0, 0, colorCanvas.width, colorCanvas.height);

      // 使用原图 alpha 作为蒙版（destination-in）
      cctx.globalCompositeOperation = 'destination-in';
      cctx.drawImage(tmp, 0, 0);

      // 在主 canvas 上先绘制原始灰度图（保留亮暗），然后 multiply 色层以着色但保留阴影
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tmp, 0, 0);
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(colorCanvas, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
    };
    img.onerror = () => {
      // 如果图片加载失败，清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [src, color, size]);

  return <canvas ref={ref} style={style} />;
};

export default Avatar;