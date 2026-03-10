import { useState, useEffect, lazy, Suspense, ComponentType } from 'react';
import { LoginModal } from './components/LoginModal';
import { authManager } from './utils/auth';
import { Users, Anchor, Database, LogOut, Menu, X } from 'lucide-react';

// 懒加载大型组件 - 使用包装函数处理动态 import
const FleetSimulator: ComponentType = lazy(async () => {
  const { FleetSimulator } = await import('./components/FleetSimulator');
  return { default: FleetSimulator };
});
const CharacterPoolManager: ComponentType = lazy(async () => {
  const { CharacterPoolManager } = await import('./components/CharacterPoolManager');
  return { default: CharacterPoolManager };
});

// 加载占位组件
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-azur-dark to-azur flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">加载中...</p>
    </div>
  </div>
);

function App() {
  const [currentView, setCurrentView] = useState<'simulator' | 'pool'>('simulator');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 初始化时检查认证状态
  useEffect(() => {
    const checkAuth = () => {
      const auth = authManager.isAuthenticated();
      setIsAuthenticated(auth);
      // 如果未认证且 3 秒内没有操作，显示登录框
      if (!auth) {
        setTimeout(() => {
          if (!authManager.isAuthenticated()) {
            setShowLogin(true);
          }
        }, 3000);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    authManager.logout();
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    setShowLogin(true);
  };

  const handleNavClick = (view: 'simulator' | 'pool') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  // 显示登录 modal
  if (!isAuthenticated && showLogin) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <nav className="bg-azur-dark border-b border-azur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-azur flex items-center justify-center flex-shrink-0">
                <Anchor className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">碧蓝航线</h1>
                <p className="text-xs text-gray-400 hidden xs:block">阵容模拟器</p>
              </div>
            </div>

            {/* 桌面端导航按钮 */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleNavClick('simulator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'simulator'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>阵容模拟</span>
              </button>
              <button
                onClick={() => handleNavClick('pool')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'pool'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>角色池管理</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:bg-azur-dark hover:text-white rounded-lg transition-colors"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:bg-azur-dark hover:text-white rounded-lg transition-colors"
              title="菜单"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-azur bg-azur-dark/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => handleNavClick('simulator')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'simulator'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">阵容模拟</span>
              </button>
              <button
                onClick={() => handleNavClick('pool')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'pool'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-azur-dark hover:text-white'
                }`}
              >
                <Database className="w-5 h-5" />
                <span className="font-medium">角色池管理</span>
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-azur-dark hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">登出</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 主内容 */}
      <main>
        <Suspense fallback={<LoadingFallback />}>
          {currentView === 'simulator' ? (
            <FleetSimulator />
          ) : (
            <CharacterPoolManager />
          )}
        </Suspense>
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
