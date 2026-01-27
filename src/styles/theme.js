const theme = {
  // 玄幻古风主色调，降低饱和度，统一风格
  colors: {
    background: '#F8F3EE', // 宣纸底色（接近米色、柔和）
    paper: '#F4EEE6',
    ink: '#2E2B26', // 深墨色，用于文字
    primary: '#6B513A', // 铜棕（主按钮、边框）
    accent: '#7AA893', // 青玉绿（点缀，较低饱和度）
    muted: '#A59786', // 柔和中性色
    parchment: '#EDE3D6',
    border: '#B8A895',
    shadow: 'rgba(34,28,22,0.12)'
  },
  // 小的纹理或渐变建议，组件可组合使用
  gradients: {
    subtle: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(240,235,230,0.6))',
    warm: 'linear-gradient(135deg, #EDE3D6 0%, #F4EEE6 100%)'
  },
  sizes: {
    navHeight: '56px',
    fabSize: '56px',
    smallBtn: '50px'
  }
};

export default theme;
