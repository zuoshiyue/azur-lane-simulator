import React, { useState, useMemo } from 'react';
import { Character, Fleet, FleetRecommendation } from '../types';
import { recommendFleet } from '../utils/recommender';
import { Sparkles, Trophy, Users, Heart, X, Check } from 'lucide-react';

interface FleetRecommendationPanelProps {
  ownedCharacters: Character[];
  onApplyFleet: (fleet: Fleet) => void;
  onClose: () => void;
}

type RecommendationMode = 'strongest' | 'faction' | 'beginner' | 'custom';
type FleetTypeSelection = 'surface' | 'submarine';

export const FleetRecommendationPanel: React.FC<FleetRecommendationPanelProps> = ({
  ownedCharacters,
  onApplyFleet,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<RecommendationMode>('strongest');
  const [selectedFleetType, setSelectedFleetType] = useState<FleetTypeSelection>('surface');
  const [selectedFaction, setSelectedFaction] = useState<string>('白鹰');
  const [recommendations, setRecommendations] = useState<FleetRecommendation[]>([]);
  const [selectedRecIndex, setSelectedRecIndex] = useState<number>(0);

  // 获取所有阵营
  const factions = useMemo(() => {
    const f = new Set(ownedCharacters.map(c => c.faction));
    return Array.from(f).sort();
  }, [ownedCharacters]);

  // 生成推荐
  const handleGenerate = () => {
    let recs: FleetRecommendation[] = [];
    
    switch (selectedMode) {
      case 'strongest':
        recs = recommendFleet(ownedCharacters, 'strongest', selectedFleetType);
        break;
      case 'faction':
        recs = recommendFleet(ownedCharacters, 'faction', selectedFleetType, { preferredFaction: selectedFaction });
        break;
      case 'beginner':
        recs = recommendFleet(ownedCharacters, 'beginner', selectedFleetType);
        break;
      case 'custom':
        recs = recommendFleet(ownedCharacters, 'custom', selectedFleetType);
        break;
    }
    
    setRecommendations(recs);
    setSelectedRecIndex(0);
  };

  // 应用阵容
  const handleApply = () => {
    if (recommendations[selectedRecIndex]) {
      onApplyFleet(recommendations[selectedRecIndex].fleet);
      onClose();
    }
  };

  // 当前选中的推荐
  const currentRec = recommendations[selectedRecIndex];

  // 模式选项
  const modeOptions = [
    { id: 'strongest', label: '最强阵容', icon: Trophy, desc: '基于强度的最优解' },
    { id: 'faction', label: '阵营队', icon: Users, desc: '单一阵营加成' },
    { id: 'beginner', label: '新手友好', icon: Heart, desc: '容易获取的角色' },
    { id: 'custom', label: '自定义', icon: Sparkles, desc: '用户指定条件' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">智能编队推荐</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* 左侧：设置面板 */}
          <div className="lg:w-72 p-6 border-r border-gray-700 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">编队类型</h3>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                onClick={() => setSelectedFleetType('surface')}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedFleetType === 'surface'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-bold">水面编队</div>
                <div className="text-xs mt-1">先锋3+主力3</div>
              </button>
              <button
                onClick={() => setSelectedFleetType('submarine')}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedFleetType === 'submarine'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-bold">潜艇编队</div>
                <div className="text-xs mt-1">潜艇6</div>
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">推荐模式</h3>
            
            <div className="space-y-2 mb-6">
              {modeOptions.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id as RecommendationMode)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedMode === mode.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-bold">{mode.label}</span>
                    </div>
                    <p className="text-xs mt-1 opacity-75">{mode.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* 阵营选择（仅阵营队模式显示） */}
            {selectedMode === 'faction' && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">选择阵营</h3>
                <div className="space-y-1">
                  {factions.map((faction) => (
                    <button
                      key={faction}
                      onClick={() => setSelectedFaction(faction)}
                      className={`w-full p-2 rounded text-left transition-colors ${
                        selectedFaction === faction
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {faction}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400 mb-2">可用角色</div>
              <div className="text-2xl font-bold text-white">{ownedCharacters.length}</div>
              <div className="text-xs text-gray-500 mt-1">
                SSR: {ownedCharacters.filter(c => c.rarity === 5).length} | 
                SR: {ownedCharacters.filter(c => c.rarity === 4).length} | 
                R: {ownedCharacters.filter(c => c.rarity <= 3).length}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              生成推荐
            </button>
          </div>

          {/* 右侧：推荐结果 */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {recommendations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl">点击"生成推荐"查看智能推荐阵容</p>
                  <p className="text-sm mt-2">根据你的角色拥有情况定制</p>
                </div>
              </div>
            ) : (
              <>
                {/* 推荐列表 */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">
                      推荐结果 ({recommendations.length}个)
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <button
                        key={rec.fleet.id}
                        onClick={() => setSelectedRecIndex(index)}
                        className={`w-full p-4 rounded-lg text-left transition-all ${
                          index === selectedRecIndex
                            ? 'bg-purple-900 border-2 border-purple-400'
                            : 'bg-gray-700 border-2 border-transparent hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === selectedRecIndex ? 'bg-purple-600' : 'bg-gray-600'
                            }`}>
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <div className="font-bold text-white">{rec.fleet.name}</div>
                              <div className="text-sm text-gray-400">{rec.reason}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">{rec.power}</div>
                            <div className="text-xs text-gray-500">战力评分</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 选中推荐详情 */}
                {currentRec && (
                  <div className="border-t border-gray-700 p-6 bg-gray-750">
                    <h3 className="text-lg font-bold text-white mb-4">阵容详情</h3>
                    
                    {/* 阵容成员 */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
                      {currentRec.fleet.characters.map((char, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg text-center ${
                            index < 3 ? 'bg-blue-900' : 'bg-red-900'
                          }`}
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            {index < 3 ? '先锋' : '主力'} #{index < 3 ? index + 1 : index - 2}
                          </div>
                          {char ? (
                            <>
                              <div className="font-bold text-white text-sm">{char.nameCn}</div>
                              <div className="text-xs text-gray-400">{char.type}</div>
                              <div className="text-xs text-yellow-400">
                                {'★'.repeat(Math.min(5, char.rarity))}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 text-sm">空位</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* 推荐理由 */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-purple-400 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-bold text-sm">推荐理由</span>
                      </div>
                      <p className="text-gray-300 text-sm">{currentRec.reason}</p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleApply}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        应用此阵容
                      </button>
                      <button
                        onClick={onClose}
                        className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
