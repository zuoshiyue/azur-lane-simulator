/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 或 'media' 如果想跟随系统
  theme: {
    extend: {
      colors: {
        // 优化后的游戏主题配色 - 柔和的海军风格
        navy: {
          dark: '#2a2f45',      // 柔和的深蓝色背景
          primary: '#3a425a',   // 温和的海军蓝主色
          light: '#4a546d',     // 柔和的浅海军蓝
          accent: '#5a6580',    // 轻柔的强调色
          gold: '#d4af37',      // 优雅的金色
          goldHover: '#e6c052',
        },
        ocean: {
          DEFAULT: '#5d8aa8',   // 经典的海洋蓝
          light: '#7fbce6',
          dark: '#3a6d8c',
        },
        metal: {
          gray: '#5a6478',      // 柔和的金属灰
        },
        // 深色模式的替代颜色
        dark: {
          navy: {
            dark: '#1a1c23',
            primary: '#222631',
            light: '#2d3342',
            accent: '#3a4255',
            gold: '#f5d76e',
          },
          ocean: {
            DEFAULT: '#6bb8f1',
            light: '#8fc9ff',
            dark: '#4a86c5',
          },
        },
        // 保持 azur 别名兼容
        azur: {
          light: '#4a546d',
          DEFAULT: '#3a425a',
          dark: '#2a2f45',
          blue: '#5d8aa8',
        }
      },
    },
  },
  plugins: [],
}
