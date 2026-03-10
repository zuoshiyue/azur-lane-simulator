import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { authManager } from '../utils/auth';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟网络延迟
    setTimeout(() => {
      if (authManager.login(password)) {
        onLoginSuccess();
      } else {
        setError('密码错误，请重试');
        setPassword('');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-azur-dark rounded-2xl p-8 max-w-md w-full border border-azur shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-azur flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">碧蓝航线阵容模拟器</h1>
          <p className="text-gray-400 text-sm">请输入访问密码</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-2">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入访问密码"
              className="w-full bg-azur border border-azur-dark rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                验证中...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                登录
              </>
            )}
          </button>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>此页面受密码保护，未经授权禁止访问</p>
          <p className="mt-1">会话有效期：24 小时</p>
        </div>
      </div>
    </div>
  );
};
