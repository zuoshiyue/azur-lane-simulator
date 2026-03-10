/**
 * 简单的认证工具
 * 提供基础的密码验证和会话管理功能
 */

const STORAGE_KEY = 'azur_lane_auth';

/**
 * 认证状态
 */
export interface AuthState {
  isAuthenticated: boolean;
  loginTime?: number;
}

/**
 * 认证管理器
 */
export const authManager = {
  /**
   * 检查是否已认证
   */
  isAuthenticated(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const state: AuthState = JSON.parse(stored);
      // 检查会话是否过期（24 小时）
      if (state.loginTime) {
        const hoursSinceLogin = (Date.now() - state.loginTime) / (1000 * 60 * 60);
        if (hoursSinceLogin > 24) {
          this.logout();
          return false;
        }
      }
      return state.isAuthenticated;
    } catch {
      return false;
    }
  },

  /**
   * 验证密码
   */
  validatePassword(password: string): boolean {
    // 支持多个密码，用逗号分隔
    const validPasswords = 'admin'; // 默认密码，可通过环境变量配置
    return validPasswords.split(',').map((p) => p.trim()).includes(password);
  },

  /**
   * 登录
   */
  login(password: string): boolean {
    if (!this.validatePassword(password)) {
      return false;
    }

    const state: AuthState = {
      isAuthenticated: true,
      loginTime: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  },

  /**
   * 登出
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * 获取认证状态
   */
  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return { isAuthenticated: false };
      }
      return JSON.parse(stored);
    } catch {
      return { isAuthenticated: false };
    }
  },
};

export default authManager;
