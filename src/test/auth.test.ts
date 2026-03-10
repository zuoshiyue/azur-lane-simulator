import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authManager } from '../utils/auth'

describe('authManager', () => {
  beforeEach(() => {
    // 每个测试前清理 localStorage
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('应该返回 false 当没有存储认证状态时', () => {
      expect(authManager.isAuthenticated()).toBe(false)
    })

    it('应该返回 true 当有有效的认证状态时', () => {
      const mockState = {
        isAuthenticated: true,
        loginTime: Date.now()
      }
      localStorage.setItem('azur_lane_auth', JSON.stringify(mockState))
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该返回 false 当认证状态已过期（超过 24 小时）时', () => {
      const mockState = {
        isAuthenticated: true,
        loginTime: Date.now() - (25 * 60 * 60 * 1000) // 25 小时前
      }
      localStorage.setItem('azur_lane_auth', JSON.stringify(mockState))
      expect(authManager.isAuthenticated()).toBe(false)
    })

    it('应该返回 false 当存储的数据格式错误时', () => {
      localStorage.setItem('azur_lane_auth', 'invalid-json')
      expect(authManager.isAuthenticated()).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('应该验证正确的密码', () => {
      expect(authManager.validatePassword('admin')).toBe(true)
    })

    it('应该拒绝错误的密码', () => {
      expect(authManager.validatePassword('wrong')).toBe(false)
      expect(authManager.validatePassword('')).toBe(false)
    })
  })

  describe('login', () => {
    it('应该登录成功当密码正确时', () => {
      const result = authManager.login('admin')
      expect(result).toBe(true)
      expect(authManager.isAuthenticated()).toBe(true)
    })

    it('应该登录失败当密码错误时', () => {
      const result = authManager.login('wrong')
      expect(result).toBe(false)
      expect(authManager.isAuthenticated()).toBe(false)
    })

    it('应该存储登录时间', () => {
      authManager.login('admin')
      const stored = JSON.parse(localStorage.getItem('azur_lane_auth') || '{}')
      expect(stored.loginTime).toBeDefined()
      expect(typeof stored.loginTime).toBe('number')
    })
  })

  describe('logout', () => {
    it('应该清除认证状态', () => {
      authManager.login('admin')
      expect(authManager.isAuthenticated()).toBe(true)

      authManager.logout()
      expect(authManager.isAuthenticated()).toBe(false)
    })
  })

  describe('getAuthState', () => {
    it('应该返回未认证状态当没有存储数据时', () => {
      const state = authManager.getAuthState()
      expect(state.isAuthenticated).toBe(false)
    })

    it('应该返回存储的认证状态', () => {
      const mockState = {
        isAuthenticated: true,
        loginTime: 1234567890
      }
      localStorage.setItem('azur_lane_auth', JSON.stringify(mockState))
      const state = authManager.getAuthState()
      expect(state.isAuthenticated).toBe(true)
      expect(state.loginTime).toBe(1234567890)
    })
  })
})
