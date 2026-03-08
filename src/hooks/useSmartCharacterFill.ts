/**
 * 智能角色数据填充 Hook
 */

import { useState, useCallback } from 'react';
import { Character } from '../types';
import { findTemplateByName, searchTemplate } from '../data/characterTemplates';

interface FetchResult {
  success: boolean;
  data?: Partial<Character>;
  error?: string;
  source: 'template' | 'wiki' | 'manual';
}

export function useSmartCharacterFill() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearchQuery, setLastSearchQuery] = useState('');

  /**
   * 从本地模板库获取角色数据
   */
  const fetchFromTemplate = useCallback(async (characterName: string): Promise<FetchResult> => {
    try {
      const template = findTemplateByName(characterName);
      
      if (template) {
        return {
          success: true,
          data: template,
          source: 'template',
        };
      }

      // 模糊搜索
      const matches = searchTemplate(characterName);
      if (matches.length > 0) {
        return {
          success: true,
          data: matches[0],
          source: 'template',
        };
      }

      return {
        success: false,
        error: '未在模板库中找到该角色',
        source: 'template',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '模板查询失败',
        source: 'template',
      };
    }
  }, []);

  /**
   * 从 Wiki 获取角色数据
   */
  const fetchFromWiki = useCallback(async (characterName: string): Promise<FetchResult> => {
    try {
      // 注意：在实际浏览器环境中，需要处理跨域问题
      // 这里使用一个简化的实现
      const response = await fetch(`/api/wiki/fetch?character=${encodeURIComponent(characterName)}`);
      
      if (!response.ok) {
        throw new Error('Wiki 数据获取失败');
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.data,
          source: 'wiki',
        };
      } else {
        return {
          success: false,
          error: data.error || 'Wiki 数据解析失败',
          source: 'wiki',
        };
      }
    } catch (error) {
      // Wiki 获取失败时，降级到模板库
      console.log('Wiki 获取失败，尝试模板库:', error);
      return fetchFromTemplate(characterName);
    }
  }, [fetchFromTemplate]);

  /**
   * 智能填充 - 优先 Wiki，降级到模板
   */
  const smartFill = useCallback(async (characterName: string): Promise<FetchResult> => {
    if (!characterName.trim()) {
      return {
        success: false,
        error: '请输入角色名称',
        source: 'manual',
      };
    }

    setIsLoading(true);
    setLastSearchQuery(characterName);

    try {
      // 方案 1：先尝试 Wiki（需要后端支持）
      // 暂时注释，使用模板库
      // const wikiResult = await fetchFromWiki(characterName);
      // if (wikiResult.success) {
      //   return wikiResult;
      // }

      // 方案 2：使用本地模板库
      const templateResult = await fetchFromTemplate(characterName);
      return templateResult;
    } finally {
      setIsLoading(false);
    }
  }, [fetchFromTemplate]);

  /**
   * 搜索建议
   */
  const searchSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) return [];
    
    const matches = searchTemplate(query);
    return matches.map(t => t.nameCn || t.name || '').filter(Boolean);
  }, []);

  return {
    isLoading,
    lastSearchQuery,
    smartFill,
    fetchFromTemplate,
    fetchFromWiki,
    searchSuggestions,
  };
}
