import { useState } from 'react';
import { FleetSimulator } from './components/FleetSimulator';
import { CharacterDatabase } from './components/CharacterDatabase';
import { CharacterPoolManager } from './components/CharacterPoolManager';
import { Users, BookOpen, Anchor, Database } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'simulator' | 'database' | 'pool'>('simulator');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <nav className="bg-azur-dark border-b border-azur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-azur flex items-center justify-center">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">碧蓝航线</h1>
                <p className="text-xs text-gray-400">阵容模拟器</p>
              </div>
            </div>

            {/* 导航按钮 */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'simulator'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">阵容模拟</span>
              </button>
              <button
                onClick={() => setCurrentView('database')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'database'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">角色数据库</span>
              </button>
              <button
                onClick={() => setCurrentView('pool')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'pool'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">角色池管理</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main>
        {currentView === 'simulator' ? (
          <FleetSimulator />
        ) : currentView === 'pool' ? (
          <CharacterPoolManager />
        ) : (
          <CharacterDatabase />
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-azur-dark border-t border-azur mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>碧蓝航线阵容模拟器 · 数据来源于 B 站碧蓝航线 Wiki</p>
          <p className="mt-1">仅供学习交流使用</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
