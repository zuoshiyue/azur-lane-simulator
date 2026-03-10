import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';
import { FleetSlot } from './FleetSlot';
import { CharacterSearchModal } from './CharacterSearchModal';
import { FleetRecommendationPanel } from './FleetRecommendationPanel';
import { Character, Fleet, FleetType } from '../types';
import { Users, Download, Sparkles, PlusCircle, Database } from 'lucide-react';

export const FleetSimulator: React.FC = () => {
  const [currentFleet, setCurrentFleet] = useState<Fleet>(() =>
    dataManager.createFleet('我的阵容')
  );
  const [fleetType, setFleetType] = useState<FleetType>('surface');
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [localCharacters, setLocalCharacters] = useState<Character[]>(
    dataManager.getCharacters()
  );
  
  // 获取已拥有的角色
  const ownedCharacterIds = dataManager.getOwnedCharacterIds();
  const ownedCharacters = localCharacters.filter(c => ownedCharacterIds.includes(c.id));

  const characters = localCharacters.filter(char => {
    const q = searchQuery.toLowerCase();
    // 搜索匹配（支持名称、别称、类型、阵营）
    return char.name.toLowerCase().includes(q) ||
      char.nameCn.includes(searchQuery) ||
      char.type.includes(searchQuery) ||
      char.faction.includes(searchQuery) ||
      (char.aliases && char.aliases.some(alias => alias.toLowerCase().includes(q))); // 别称搜索
  });

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

      const character = localCharacters.find(c => c.id === characterId);
      if (character) {
        const newFleet = { ...currentFleet };
        newFleet.characters = [...newFleet.characters];

        const existingChar = newFleet.characters[slotIndex];
        const oldIndex = newFleet.characters.findIndex(c => c?.id === characterId);

        newFleet.characters[slotIndex] = character;

        if (oldIndex !== -1 && oldIndex !== slotIndex) {
          newFleet.characters[oldIndex] = existingChar;
        }

        setCurrentFleet(newFleet);
        dataManager.updateFleet(newFleet);
      }
    }
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

  const handleAddCharacter = (character: Character) => {
    if (!localCharacters.find(c => c.id === character.id)) {
      const newCharacters = [...localCharacters, character];
      setLocalCharacters(newCharacters);
      dataManager.addCharacter(character);
    }
  };

  const existingCharacterIds = localCharacters.map(c => c.id);

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
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            添加角色
          </button>
          <button
            onClick={() => setShowRecommendationPanel(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            智能推荐
          </button>
          <button
            onClick={exportFleet}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            导出阵容
          </button>
          <div className="bg-azur-dark rounded-lg px-4 py-2 text-white flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>角色池：</span>
            <span className="font-bold text-yellow-400">{localCharacters.length}</span>
          </div>
          <div className="bg-azur-dark rounded-lg px-4 py-2 text-white">
            总战力：<span className="font-bold text-yellow-400">{calculatePower()}</span>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：角色列表 */}
            <div className="lg:col-span-1">
              <div className="bg-azur-dark/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">编队类型</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFleetType('surface')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        fleetType === 'surface'
                          ? 'bg-blue-600 text-white'
                          : 'bg-azur-dark text-gray-400 hover:bg-azur'
                      }`}
                    >
                      水面编队
                    </button>
                    <button
                      onClick={() => setFleetType('submarine')}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        fleetType === 'submarine'
                          ? 'bg-purple-600 text-white'
                          : 'bg-azur-dark text-gray-400 hover:bg-azur'
                      }`}
                    >
                      潜艇编队
                    </button>
                  </div>
                </div>
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
                  {[0, 1, 2].map(i => (
                    <FleetSlot
                      key={`slot-${i + 1}`}
                      id={`slot-${i + 1}`}
                      position={i + 1}
                      slotType={fleetType === 'submarine' ? '潜艇' : i < 3 ? '先锋' : '主力'}
                      fleetType={fleetType}
                      character={fleetType === 'submarine' ? currentFleet.characters[i + 3] : currentFleet.characters[i]}
                      onRemove={() => {
                        const	idx = fleetType === 'submarine' ? i + 3 : i;
                        const newFleet = { ...currentFleet };
                        newFleet.characters[idx] = null;
                        setCurrentFleet(newFleet);
                        dataManager.updateFleet(newFleet);
                      }}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[3, 4, 5].map(i => (
                    <FleetSlot
                      key={`slot-${i + 1}`}
                      id={`slot-${i + 1}`}
                      position={i + 1}
                      slotType={fleetType === 'submarine' ? '潜艇' : i >= 3 ? '主力' : '先锋'}
                      fleetType={fleetType}
                      character={fleetType === 'submarine' ? null : currentFleet.characters[i]}
                      onRemove={() => {
                        const newFleet = { ...currentFleet };
                        newFleet.characters[i] = null;
                        setCurrentFleet(newFleet);
                        dataManager.updateFleet(newFleet);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* 推荐阵容提示 */}
              <div className="mt-6 bg-purple-900/30 rounded-xl p-6 text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">智能编队推荐</h3>
                <p className="text-gray-300 text-sm mb-4">
                  根据你拥有的角色、舰种搭配、阵营协同，智能推荐最强阵容
                </p>
                <button
                  onClick={() => setShowRecommendationPanel(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  打开推荐面板
                </button>
              </div>
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

        {/* 角色搜索模态框 */}
        <CharacterSearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onAddCharacter={handleAddCharacter}
          existingCharacterIds={existingCharacterIds}
        />

        {/* 智能推荐面板 */}
        {showRecommendationPanel && (
          <FleetRecommendationPanel
            ownedCharacters={ownedCharacters}
            onApplyFleet={(fleet) => {
              setCurrentFleet(fleet);
              dataManager.updateFleet(fleet);
            }}
            onClose={() => setShowRecommendationPanel(false)}
          />
        )}
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
