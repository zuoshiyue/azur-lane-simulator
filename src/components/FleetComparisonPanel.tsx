import React, { useState } from 'react';
import { Fleet } from '../types';
import { GitCompare, Star, Sword, Shield, Zap, Heart } from 'lucide-react';

interface FleetComparisonPanelProps {
  fleet1: Fleet;
  fleet2: Fleet;
}

export const FleetComparisonPanel: React.FC<FleetComparisonPanelProps> = ({ fleet1, fleet2 }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 计算阵容战力
  const calculateFleetPower = (fleet: Fleet): number => {
    let power = 0;
    fleet.characters.forEach(char => {
      if (char) {
        const stats = char.stats;
        power += (stats.hp * 0.5) + stats.fire + (stats.torpedo * 1.2) + (stats.aviation * 1.2) + (stats.reload * 0.8);
        power += char.rarity * 50; // 稀有度权重
      }
    });
    return Math.round(power);
  };

  // 计算阵容统计数据
  const getFleetStats = (fleet: Fleet) => {
    const stats = {
      totalCharacters: 0,
      SSRCount: 0,
      SRCount: 0,
      RCount: 0,
      totalHP: 0,
      totalFire: 0,
      totalAviation: 0,
      totalTorpedo: 0,
      factions: new Set<string>(),
      types: new Set<string>()
    };

    fleet.characters.forEach(char => {
      if (char) {
        stats.totalCharacters++;
        if (char.rarity >= 5) stats.SSRCount++;
        else if (char.rarity === 4) stats.SRCount++;
        else if (char.rarity <= 3) stats.RCount++;

        stats.totalHP += char.stats.hp;
        stats.totalFire += char.stats.fire;
        stats.totalAviation += char.stats.aviation;
        stats.totalTorpedo += char.stats.torpedo;

        stats.factions.add(char.faction);
        stats.types.add(char.type);
      }
    });

    return stats;
  };

  const stats1 = getFleetStats(fleet1);
  const stats2 = getFleetStats(fleet2);
  const power1 = calculateFleetPower(fleet1);
  const power2 = calculateFleetPower(fleet2);

  const compareValue = (val1: number, val2: number): 'equal' | 'better' | 'worse' => {
    if (val1 === val2) return 'equal';
    return val1 > val2 ? 'better' : 'worse';
  };

  const getValueClass = (comparison: ReturnType<typeof compareValue>) => {
    switch (comparison) {
      case 'better': return 'text-green-400';
      case 'worse': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="bg-navy-light/30 rounded-xl p-4 border border-navy-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-purple-400" />
          阵容对比
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <GitCompare className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          {/* 阵容概览对比 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-navy-primary/50 rounded-lg p-3">
              <h4 className="font-bold text-white mb-2 text-center">{fleet1.name}</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{power1.toLocaleString()}</div>
                <div className="text-xs text-gray-400">战力评分</div>
              </div>
            </div>
            <div className="bg-navy-primary/50 rounded-lg p-3">
              <h4 className="font-bold text-white mb-2 text-center">{fleet2.name}</h4>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{power2.toLocaleString()}</div>
                <div className="text-xs text-gray-400">战力评分</div>
              </div>
            </div>
          </div>

          {/* 详细对比 */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-300">
              <div>项目</div>
              <div className="text-center">{fleet1.name}</div>
              <div className="text-center">{fleet2.name}</div>
            </div>

            {/* 角色数量 */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>角色数</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.totalCharacters, stats2.totalCharacters))}`}>
                {stats1.totalCharacters}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.totalCharacters, stats1.totalCharacters))}`}>
                {stats2.totalCharacters}
              </div>
            </div>

            {/* SSR数量 */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>SSR</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.SSRCount, stats2.SSRCount))}`}>
                {stats1.SSRCount}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.SSRCount, stats1.SSRCount))}`}>
                {stats2.SSRCount}
              </div>
            </div>

            {/* HP */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                <span>总HP</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.totalHP, stats2.totalHP))}`}>
                {stats1.totalHP.toLocaleString()}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.totalHP, stats1.totalHP))}`}>
                {stats2.totalHP.toLocaleString()}
              </div>
            </div>

            {/* 火力 */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 text-orange-400" />
                <span>总火力</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.totalFire, stats2.totalFire))}`}>
                {stats1.totalFire.toLocaleString()}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.totalFire, stats1.totalFire))}`}>
                {stats2.totalFire.toLocaleString()}
              </div>
            </div>

            {/* 航空 */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-green-400" />
                <span>总航空</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.totalAviation, stats2.totalAviation))}`}>
                {stats1.totalAviation.toLocaleString()}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.totalAviation, stats1.totalAviation))}`}>
                {stats2.totalAviation.toLocaleString()}
              </div>
            </div>

            {/* 阵营多样性 */}
            <div className="grid grid-cols-3 gap-2 items-center p-2 bg-navy-primary/30 rounded">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span>阵营数</span>
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats1.factions.size, stats2.factions.size))}`}>
                {stats1.factions.size}
              </div>
              <div className={`text-center font-medium ${getValueClass(compareValue(stats2.factions.size, stats1.factions.size))}`}>
                {stats2.factions.size}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};