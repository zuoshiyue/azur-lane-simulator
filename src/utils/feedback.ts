/**
 * 用户反馈收集与算法改进系统
 * 用于收集推荐算法的反馈、记录采纳率、优化权重等
 */

// 反馈类型枚举
export type FeedbackType = 'positive' | 'negative' | 'ignore' | 'adjust';

// 反馈数据结构
export interface RecommendationFeedback {
  id: string; // 唯一标识符
  recommendationId: string; // 推荐ID
  userId?: string; // 用户ID（如果可用）
  feedbackType: FeedbackType; // 反馈类型
  rating?: number; // 评分 (1-5)
  comment?: string; // 用户评论
  customWeights?: Record<string, number>; // 自定义权重调整
  timestamp: number; // 时间戳
  fleetComposition?: string[]; // 阵容构成（角色ID列表）
  applied?: boolean; // 是否应用了该推荐
  effectiveness?: number; // 实际效果评分
}

// 反馈统计结构
export interface FeedbackStats {
  total: number;
  positive: number;
  negative: number;
  ignore: number;
  averageRating: number;
  adoptionRate: number; // 采纳率
  effectiveness: number; // 平均效果
}

// 本地存储键
const FEEDBACK_STORAGE_KEY = 'azur_lane_feedback_data';

// 反馈管理类
class FeedbackManager {
  private feedbacks: RecommendationFeedback[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // 从本地存储加载反馈数据
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.feedbacks = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp).getTime()
        }));
      }
    } catch (error) {
      console.error('Failed to load feedback data from storage:', error);
      this.feedbacks = [];
    }
  }

  // 保存到本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(this.feedbacks));
    } catch (error) {
      console.error('Failed to save feedback data to storage:', error);
    }
  }

  // 添加反馈
  addFeedback(feedback: Omit<RecommendationFeedback, 'id' | 'timestamp'>): string {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newFeedback: RecommendationFeedback = {
      id,
      ...feedback,
      timestamp: Date.now()
    };

    this.feedbacks.push(newFeedback);
    this.saveToStorage();

    return id;
  }

  // 更新现有反馈
  updateFeedback(id: string, updates: Partial<RecommendationFeedback>): boolean {
    const index = this.feedbacks.findIndex(feedback => feedback.id === id);
    if (index !== -1) {
      this.feedbacks[index] = { ...this.feedbacks[index], ...updates };
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // 获取特定推荐的反馈
  getFeedbackForRecommendation(recommendationId: string): RecommendationFeedback[] {
    return this.feedbacks.filter(feedback => feedback.recommendationId === recommendationId);
  }

  // 获取用户所有反馈
  getUserFeedback(userId?: string): RecommendationFeedback[] {
    if (userId) {
      return this.feedbacks.filter(feedback => feedback.userId === userId);
    }
    return [...this.feedbacks];
  }

  // 获取反馈统计数据
  getFeedbackStats(): FeedbackStats {
    const total = this.feedbacks.length;
    if (total === 0) {
      return {
        total: 0,
        positive: 0,
        negative: 0,
        ignore: 0,
        averageRating: 0,
        adoptionRate: 0,
        effectiveness: 0
      };
    }

    const positive = this.feedbacks.filter(f => f.feedbackType === 'positive').length;
    const negative = this.feedbacks.filter(f => f.feedbackType === 'negative').length;
    const ignore = this.feedbacks.filter(f => f.feedbackType === 'ignore').length;

    const ratings = this.feedbacks
      .filter(f => f.rating !== undefined)
      .map(f => f.rating!) as number[];
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    const appliedFeedbacks = this.feedbacks.filter(f => f.applied === true);
    const adoptionRate = appliedFeedbacks.length / total;

    const effectivenessValues = appliedFeedbacks
      .filter(f => f.effectiveness !== undefined)
      .map(f => f.effectiveness!) as number[];
    const effectiveness = effectivenessValues.length > 0
      ? effectivenessValues.reduce((sum, eff) => sum + eff, 0) / effectivenessValues.length
      : 0;

    return {
      total,
      positive,
      negative,
      ignore,
      averageRating,
      adoptionRate,
      effectiveness
    };
  }

  // 获取需要调整权重的反馈
  getWeightAdjustmentFeedback(): RecommendationFeedback[] {
    return this.feedbacks.filter(feedback =>
      feedback.feedbackType === 'adjust' && feedback.customWeights
    );
  }

  // 计算调整权重的平均值
  getAverageWeightAdjustments(): Record<string, number> {
    const adjustments = this.getWeightAdjustmentFeedback();
    if (adjustments.length === 0) {
      return {};
    }

    // 简化的权重调整计算 - 在实际应用中，您可能需要更复杂的逻辑
    const weightSum: Record<string, number> = {};
    const count: Record<string, number> = {};

    adjustments.forEach(adj => {
      if (adj.customWeights) {
        Object.entries(adj.customWeights).forEach(([key, value]) => {
          weightSum[key] = (weightSum[key] || 0) + value;
          count[key] = (count[key] || 0) + 1;
        });
      }
    });

    const averages: Record<string, number> = {};
    Object.keys(weightSum).forEach(key => {
      averages[key] = weightSum[key] / count[key];
    });

    return averages;
  }

  // 清除旧的反馈数据（保留最近的）
  cleanupOldFeedback(daysToKeep: number = 30): number {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.feedbacks.length;

    this.feedbacks = this.feedbacks.filter(feedback => feedback.timestamp >= cutoffTime);
    this.saveToStorage();

    return initialCount - this.feedbacks.length;
  }
}

// 创建全局反馈管理器实例
export const feedbackManager = new FeedbackManager();

// 工具函数：根据反馈调整推荐权重
export function getAdjustedWeights(baseWeights: Record<string, number>): Record<string, number> {
  const adjustments = feedbackManager.getAverageWeightAdjustments();
  const result = { ...baseWeights };

  // 应用反馈调整（简单加权平均）
  Object.keys(result).forEach(key => {
    if (adjustments[key] !== undefined) {
      // 可以根据需要调整影响因子
      const influenceFactor = 0.1; // 影响因子，较小的值表示温和调整
      result[key] = result[key] * (1 + influenceFactor * adjustments[key]);
    }
  });

  return result;
}

// 工具函数：获取推荐采纳率
export function getRecommendationAdoptionRate(recommendationId?: string): number {
  if (recommendationId) {
    const feedbacks = feedbackManager.getFeedbackForRecommendation(recommendationId);
    if (feedbacks.length === 0) return 0;

    const appliedCount = feedbacks.filter(f => f.applied === true).length;
    return appliedCount / feedbacks.length;
  }

  const stats = feedbackManager.getFeedbackStats();
  return stats.adoptionRate;
}