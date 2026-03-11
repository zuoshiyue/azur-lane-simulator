import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';
import { useFleetStore } from '../stores/fleetStore';
import { recommendFleet, recommendForActivity } from '../utils/recommender';

function RecommendationCard({ recommendation, onApply }) {
  const charStore = useCharacterStore();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{recommendation.name}</h3>
          <p className="text-gray-500 text-sm">{recommendation.description}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-azur-blue">{recommendation.totalScore}</div>
          <div className="text-xs text-gray-500">综合评分</div>
        </div>
      </div>

      {/* 阵容成员 */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {recommendation.characters.map((char, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded flex items-center justify-between">
              <div>
                <div className="font-bold text-sm">{char.name}</div>
                <div className="text-xs text-gray-500">
                  {char.shipType} · Lv.{char.level}
                </div>
              </div>
              <div className="text-xs font-bold text-azur-blue">
                {char.score}分
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 完成度 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">阵容完成度</span>
          <span className="font-bold">{recommendation.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-azur-blue h-2 rounded-full transition-all"
            style={{ width: `${recommendation.completionRate}%` }}
          />
        </div>
      </div>

      {/* 应用按钮 */}
      <button
        onClick={() => onApply(recommendation)}
        disabled={!recommendation.isComplete}
        className="w-full py-2 rounded-lg font-bold transition
          {recommendation.isComplete
            ? 'bg-azur-blue text-white hover:bg-navy-light'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }"
      >
        {recommendation.isComplete ? '应用此阵容' : '阵容不完整'}
      </button>
    </div>
  );
}

function ActivityRecommendation({ activityType, characters, onApply }) {
  const charStore = useCharacterStore();
  const recommendation = recommendForActivity(
    characters.map(c => c.id),
    activityType
  );

  if (!recommendation.success) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-2">{recommendation.template}</h3>
      <p className="text-gray-600 text-sm mb-4">{recommendation.description}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {recommendation.characters.map((char, index) => (
          <div key={index} className="bg-white p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400">#{char.rank}</span>
              <span className="text-xs bg-azur-blue text-white px-2 py-1 rounded">
                {char.score}分
              </span>
            </div>
            <div className="font-bold text-sm mt-1">{char.name}</div>
            <div className="text-xs text-gray-500">{char.shipType}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        总分：{recommendation.totalScore}
      </div>
    </div>
  );
}

function Recommendation() {
  const charStore = useCharacterStore();
  const fleetStore = useFleetStore();
  const [selectedActivity, setSelectedActivity] = useState('clearing');
  const [recommendations, setRecommendations] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // 模拟用户拥有所有角色（实际项目中应从用户数据获取）
  const userCharacters = charStore.characters.map(c => c.id);

  const handleGenerate = () => {
    const result = recommendFleet(userCharacters, fleetStore.characterLevels);
    if (result.success) {
      setRecommendations(result.recommendations);
      setHasGenerated(true);
    }
  };

  const handleApplyFleet = (recommendation) => {
    // 应用阵容到 store
    Object.entries(recommendation.slots).forEach(([slotId, charId]) => {
      fleetStore.equipCharacter(slotId, charId);
    });
    fleetStore.setFleetName(recommendation.name);
    alert(`已应用阵容：${recommendation.name}`);
  };

  const activities = [
    { id: 'clearing', name: '🗺️ 日常推图', description: '均衡配置，适合大多数关卡' },
    { id: 'boss', name: '💀 BOSS 战', description: '高输出单体爆发' },
    { id: 'pvp', name: '⚔️ PVP 对战', description: '先手优势快速解决' },
    { id: 'event', name: '🎯 活动挑战', description: '应对高难度活动关卡' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">智能推荐</h1>

      {/* 用户角色池设置 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">我的角色池</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-bold text-azur-blue">{userCharacters.length}</div>
            <div className="text-gray-500">已拥有角色</div>
          </div>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-azur-blue text-white rounded-lg font-bold hover:bg-navy-light transition"
          >
            ✨ 生成阵容推荐
          </button>
        </div>
        <p className="text-sm text-gray-500">
          💡 提示：实际使用时可以连接游戏数据 API 自动同步您的角色池
        </p>
      </div>

      {/* 活动推荐 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">活动针对性推荐</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {activities.map(activity => (
            <button
              key={activity.id}
              onClick={() => setSelectedActivity(activity.id)}
              className={`p-4 rounded-lg text-left transition ${
                selectedActivity === activity.id
                  ? 'bg-azur-blue text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-bold">{activity.name}</div>
              <div className={`text-xs mt-1 ${
                selectedActivity === activity.id ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {activity.description}
              </div>
            </button>
          ))}
        </div>

        <ActivityRecommendation
          activityType={selectedActivity}
          characters={charStore.characters}
          onApply={() => {}}
        />
      </div>

      {/* 阵容推荐结果 */}
      {hasGenerated && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">推荐阵容</h2>
          
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={rec}
                  onApply={handleApplyFleet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              暂无推荐阵容
            </div>
          )}
        </div>
      )}

      {/* 使用指南 */}
      <div className="mt-8 bg-azur-light rounded-xl p-6">
        <h3 className="font-bold text-azur-dark mb-3">💡 使用指南</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• 点击"生成阵容推荐"根据您的角色池自动生成最优配置</li>
          <li>• 选择不同活动类型获取针对性推荐</li>
          <li>• 点击"应用此阵容"将推荐配置应用到模拟器</li>
          <li>• 在模拟器中可以手动调整角色和等级</li>
        </ul>
      </div>
    </div>
  );
}

export default Recommendation;
