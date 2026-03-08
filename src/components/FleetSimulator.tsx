import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import { dataManager } from '../data/characterData';
import { CharacterCard } from './CharacterCard';
import { FleetSlot } from './FleetSlot';
import { Character, Fleet } from '../types';
import { Users, Download, Sparkles } from 'lucide-react';

export const FleetSimulator: React.FC = () => {
  const [currentFleet, setCurrentFleet] = useState<Fleet>(() => 
    dataManager.createFleet('我的阵容')
  );
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const characters = dataManager.searchCharacters(searchQuery);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const character = characters.find(c => c.id === active.id);
    setActiveCharacter(character || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveCharacter(null);

    if (over) {
      const characterId = active.id;
      const slotId = over.id;
      const slotIndex = parseInt(slotId.replace('slot-', '')) - 1;

      const character = dataManager.getCharacterById(characterId);
      if (character) {
        const newFleet = { ...currentFleet };
        newFleet.characters = [...newFleet.characters];
        
        // 检查该位置是否已有角色
        const existingChar = newFleet.characters[slotIndex];
        
        // 找到角色原来所在的位置
        const oldIndex = newFleet.characters.findIndex(c => c?.id === characterId);
        
        // 放置新角色
        newFleet.characters[slotIndex] = character;
        
        // 如果原来位置有角色，清空它（交换逻辑）
        if (oldIndex !== -1 && oldIndex !== slotIndex) {
          newFleet.characters[oldIndex] = existingChar;
        }

        setCurrentFleet(newFleet);
        dataManager.updateFleet(newFleet);
      }
    }
  };

  const removeCharacter = (slotIndex: number) => {
    const newFleet = { ...currentFleet };
    newFleet.characters = [...newFleet.characters];
    newFleet.characters[slotIndex] = null;
    setCurrentFleet(newFleet);
    dataManager.updateFleet(newFleet);
  };

  const exportFleet = () => {
    const json = dataManager.exportFleet(currentFleet);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-${currentFleet.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculatePower = () => {
    return dataManager.calculatePower(currentFleet);
  };

  const getRecommendations = () => {
    const recs = dataManager.recommendFleet('平衡');
    return recs;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-azur-dark to-azur p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题栏 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            阵容模拟器
          </h1>
          <p className="text-gray-300">拖拽角色组建你的最强舰队</p>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="搜索角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] bg-azur-dark border border-azur rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            智能推荐
          </button>
          <button
            onClick={exportFleet}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            导出阵容
          </button>
          <div className="bg-azur-dark rounded-lg px-4 py-2 text-white">
            总战力：<span className="font-bold text-yellow-400">{calculatePower()}</span>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：角色列表 */}
            <div className="lg:col-span-1">
              <div className="bg-azur-dark/50 rounded-xl p-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  角色池 ({characters.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {characters.map(char => (
                    <DraggableCharacter key={char.id} character={char} />
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：阵容槽位 */}
            <div className="lg:col-span-2">
              <div className="bg-azur-dark/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {currentFleet.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* 先锋舰队 */}
                  {[0, 1, 2].map(i => (
                    <FleetSlot
                      key={`slot-${i + 1}`}
                      id={`slot-${i + 1}`}
                      position={i + 1}
                      character={currentFleet.characters[i]}
                      onRemove={() => removeCharacter(i)}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 主力舰队 */}
                  {[3, 4, 5].map(i => (
                    <FleetSlot
                      key={`slot-${i + 1}`}
                      id={`slot-${i + 1}`}
                      position={i + 1}
                      character={currentFleet.characters[i]}
                      onRemove={() => removeCharacter(i)}
                    />
                  ))}
                </div>
              </div>

              {/* 推荐阵容 */}
              {showRecommendations && (
                <div className="mt-6 bg-purple-900/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    智能推荐阵容
                  </h3>
                  <div className="space-y-3">
                    {getRecommendations().map((rec, i) => (
                      <div key={i} className="bg-azur-dark/50 rounded-lg p-4">
                        <div className="text-white font-medium mb-2">{rec.reason}</div>
                        <div className="text-sm text-gray-300">
                          战力：{rec.power}
                        </div>
                        <button
                          onClick={() => setCurrentFleet(rec.fleet)}
                          className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          使用此阵容
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCharacter && (
              <div className="w-64">
                <CharacterCard character={activeCharacter} compact />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// 可拖拽角色组件
const DraggableCharacter: React.FC<{ character: Character }> = ({ character }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: character.id
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined;

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <CharacterCard character={character} draggable compact />
    </div>
  );
};
