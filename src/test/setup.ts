import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 每个测试后清理 DOM
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => { localStorageMock.data.set(key, value) }),
  removeItem: vi.fn((key: string) => { localStorageMock.data.delete(key) }),
  clear: vi.fn(() => { localStorageMock.data.clear() }),
  key: vi.fn((index: number) => Array.from(localStorageMock.data.keys())[index] || null),
  get length() { return localStorageMock.data.size }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
