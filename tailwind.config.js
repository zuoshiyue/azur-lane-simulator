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
        // 游戏主题配色 - 军武灰 + 海军金 + 海洋蓝
        navy: {
          dark: '#1a1a2e',      // 军武深蓝背景
          primary: '#16213e',   // 海军蓝主色
          light: '#1f2940',     // 浅军武灰
          accent: '#0f3460',    // 海军强调色
          gold: '#c9a227',      // 海军金
          goldHover: '#e0b636',
        },
        ocean: {
          DEFAULT: '#1e40af',   // 海洋蓝
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        metal: {
          gray: '#2d3748',      // 金属灰
        },
        // 深色模式的替代颜色
        dark: {
          navy: {
            dark: '#0a0a1a',
            primary: '#0f172a',
            light: '#1e293b',
            accent: '#1e263a',
            gold: '#facc15',
          },
          ocean: {
            DEFAULT: '#3b82f6',
            light: '#60a5fa',
            dark: '#1d4ed8',
          },
        },
        // 保持 azur 别名兼容
        azur: {
          light: '#1f2940',
          DEFAULT: '#16213e',
          dark: '#1a1a2e',
          blue: '#1e40af',
        }
      },
    },
  },
  plugins: [],
}
