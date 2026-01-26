import React from 'react';

// 假设你引入了一个库或者自己写了一个函数来转换颜色
// import { hexToFilter } from 'some-color-lib'; 

// 临时替代方案：简易的 CSS 样式生成，需要你根据实际发色去调整参数
const getHairColorStyle = (hexColor) => {
  // 这里只是示意，真正的颜色转换很复杂。
  return {};
};

const Avatar = ({ dna }) => {
  if (!dna) return null;

  const layerStyle = {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    objectFit: 'contain' // 保持比例
  };

  const containerStyle = {
    width: '200px', height: '200px', position: 'relative'
  };

  if (dna.gender === 'female') {
    return (
      <div style={containerStyle}>
        <img src={`/assets/female/full_face_${dna.faceId}.png`} style={layerStyle} alt="female" />
      </div>
    );
  } else {
    return (
      <div style={containerStyle}>
        <img src="/assets/male/base_face.png" style={{...layerStyle, zIndex: 1}} alt="base" />
        <img src={`/assets/male/mouth/mouth_${dna.mouthId}.png`} style={{...layerStyle, zIndex: 2}} alt="mouth" />
        <img src={`/assets/male/t_zone/tzone_${dna.tZoneId}.png`} style={{...layerStyle, zIndex: 3}} alt="tzone" />
        <div style={{...layerStyle, zIndex: 4, ...getHairColorStyle(dna.hairColor)}}>
           <img src={`/assets/male/hair/hair_${dna.hairId}.png`} style={{width: '100%', height: '100%'}} alt="hair" />
        </div>
      </div>
    );
  }
};

export default Avatar;