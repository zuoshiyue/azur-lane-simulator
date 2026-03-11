import React from 'react';
import { EquipmentSlot } from '../types';
import { Swords, Percent } from 'lucide-react';

interface EquipmentDisplayProps {
  equipment: EquipmentSlot[];
}

export const EquipmentDisplay: React.FC<EquipmentDisplayProps> = ({ equipment }) => {
  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-gray-400 italic py-2">
        暂无装备信息
      </div>
    );
  }

  // 按照槽位排序
  const sortedEquipment = [...equipment].sort((a, b) => a.slot - b.slot);

  return (
    <div className="space-y-3">
      {sortedEquipment.map((eq, index) => (
        <div
          key={index}
          className="bg-navy-light/30 rounded-lg p-3 border border-navy-gold/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                             flex items-center justify-center">
                  <Swords className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <div className="font-medium text-white flex items-center gap-2">
                  槽位 {eq.slot}
                  <span className="text-xs text-gray-400">-</span>
                  <span>{eq.type}</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  效率: {eq.efficiency}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-400">装备类型</div>
                <div className="text-sm font-medium text-white">{eq.type}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};