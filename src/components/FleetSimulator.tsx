import React, { useState, useMemo } from 'react';
import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';
import { FleetSlot } from './FleetSlot';
import { CharacterSearchModal } from './CharacterSearchModal';
import { FleetRecommendationPanel } from './FleetRecommendationPanel';
import { CharacterDetailModal } from './CharacterDetailModal';
import { FleetSaveLoadPanel } from './FleetSaveLoadPanel';
import { FleetComparisonPanel } from './FleetComparisonPanel';
import { PositionImportPanel } from './PositionImportPanel';
import { Character, Fleet, FleetType } from '../types';
import { Users, Download, Sparkles, PlusCircle, Database, Copy, RotateCcw, Eye, Camera } from 'lucide-react';

export const FleetSimulator: React.FC = () => {
  // 双阵容支持
  const [activeTab, setActiveTab] = useState<'fleet1' | 'fleet2' | 'sub'>('fleet1');
  const [fleets, setFleets] = useState<{
    fleet1: Fleet;
    fleet2: Fleet;
    sub: Fleet;
  }>(() => ({
    fleet1: dataManager.createFleet('海上阵容 1'),
    fleet2: dataManager.createFleet('海上阵容 2'),
    sub: dataManager.createFleet('潜艇阵容')
  }));

  const [fleetType, setFleetType] = useState<FleetType>('surface');
  const [activeCharacter, setActiveCharacter] = useState<Character | null>(null);
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  // 位置截图导入相关
  const [showPositionImportPanel, setShowPositionImportPanel] = useState(false);
  // 角色详情弹窗相关
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [localCharacters, setLocalCharacters] = useState<Character[]>(
    dataManager.getCharacters()
  );

  // 计算被占用的角色ID
  const occupiedCharacterIds = useMemo(() => {
    const ids = new Set<string>();
    fleets.fleet1.characters.forEach(char => {
      if (char) ids.add(char.id);
    });
    fleets.fleet2.characters.forEach(char => {
      if (char) ids.add(char.id);
    });
    fleets.sub.characters.forEach(char => {
      if (char) ids.add(char.id);
    });
    return Array.from(ids);
  }, [fleets]);

  // 打开角色详情弹窗
  const handleShowCharacterDetails = (character: Character) => {
    setSelectedCharacter(character);
    setShowDetailModal(true);
  };

  // 当前活跃阵容
  const currentFleet = activeTab === 'fleet1' ? fleets.fleet1 : activeTab === 'fleet2' ? fleets.fleet2 : fleets.sub;

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
        const newFleets = { ...fleets };
        const currentFleetIndex = activeTab === 'fleet1' ? 'fleet1' : activeTab === 'fleet2' ? 'fleet2' : 'sub';
        newFleets[currentFleetIndex] = { ...newFleets[currentFleetIndex] };
        newFleets[currentFleetIndex].characters = [...newFleets[currentFleetIndex].characters];

        const existingChar = newFleets[currentFleetIndex].characters[slotIndex];
        const oldIndex = newFleets[currentFleetIndex].characters.findIndex(c => c?.id === characterId);

        newFleets[currentFleetIndex].characters[slotIndex] = character;

        if (oldIndex !== -1 && oldIndex !== slotIndex) {
          newFleets[currentFleetIndex].characters[oldIndex] = existingChar;
        }

        setFleets(newFleets);
        dataManager.updateFleet(newFleets[currentFleetIndex]);
      }
    }
  };

  // 复制阵容到另一个
  const copyFleet = (from: 'fleet1' | 'fleet2', to: 'fleet1' | 'fleet2') => {
    const newFleets = { ...fleets };
    const sourceFleet = newFleets[from];
    newFleets[to] = {
      ...sourceFleet,
      id: to === 'fleet1' ? 'fleet1' : 'fleet2',
      name: to === 'fleet1' ? '海上阵容 1' : '海上阵容 2',
      characters: sourceFleet.characters.map(c => c ? { ...c } : null)
    };
    setFleets(newFleets);
    dataManager.updateFleet(newFleets[to]);
  };

  const updateCurrentFleet = (updatedFleet: Fleet) => {
    const newFleets = { ...fleets };
    const currentFleetIndex = activeTab === 'fleet1' ? 'fleet1' : activeTab === 'fleet2' ? 'fleet2' : 'sub';
    newFleets[currentFleetIndex] = updatedFleet;
    setFleets(newFleets);
    dataManager.updateFleet(newFleets[currentFleetIndex]);
  };

  // 清空当前阵容
  const clearFleet = () => {
    const newFleets = { ...fleets };
    const currentFleetIndex = activeTab === 'fleet1' ? 'fleet1' : activeTab === 'fleet2' ? 'fleet2' : 'sub';
    newFleets[currentFleetIndex] = dataManager.createFleet(
      currentFleetIndex === 'fleet1' ? '海上阵容 1' : currentFleetIndex === 'fleet2' ? '海上阵容 2' : '潜艇阵容'
    );
    setFleets(newFleets);
    dataManager.updateFleet(newFleets[currentFleetIndex]);
  };

  const exportFleet = () => {
    // 导出所有阵容
    const allFleets = {
      fleet1: fleets.fleet1,
      fleet2: fleets.fleet2,
      sub: fleets.sub
    };
    const json = JSON.stringify(allFleets, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleets-${Date.now()}.json`;
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

  const handlePositionImportComplete = (_characterIds: string[]) => {
    // Refresh the character list after import
    setLocalCharacters(dataManager.getCharacters());
  };

  const existingCharacterIds = localCharacters.map(c => c.id);

  // 可拖拽角色组件 - 定义在主组件内部以便访问状态和函数
  const DraggableCharacter: React.FC<{ character: Character }> = ({ character }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: character.id
    });

    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
    } : undefined;

    return (
      <div className="relative group">
        <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
          <CharacterCard
            character={character}
            draggable
            compact
            onShowDetails={(char) => handleShowCharacterDetails(char)}
          />
        </div>
        {/* 查看详情按钮 */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShowCharacterDetails(character);
            }}
            className="p-1 bg-purple-600/90 text-white rounded-md hover:bg-purple-700 transition-colors shadow-lg"
            title="查看详情"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-dark via-navy-primary to-navy-accent p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题栏 */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-2 sm:gap-3">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="hidden xs:inline">双阵容模拟器</span>
            <span className="xs:hidden">阵容</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">拖拽角色组建你的最强舰队（支持双海上阵容 + 潜艇）</p>
        </div>

        {/* 阵容标签页 */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* 标签页切换 */}
            <div className="flex bg-navy-light/50 rounded-lg p-1 border border-navy-gold/20">
              <button
                onClick={() => setActiveTab('fleet1')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all btn-base ${
                  activeTab === 'fleet1'
                    ? 'bg-gradient-to-r from-navy-gold to-ocean-light text-white shadow-lg font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-navy-light'
                }`}
              >
                海上 1
              </button>
              <button
                onClick={() => setActiveTab('fleet2')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all btn-base ${
                  activeTab === 'fleet2'
                    ? 'bg-gradient-to-r from-navy-gold to-ocean-light text-white shadow-lg font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-navy-light'
                }`}
              >
                海上 2
              </button>
              <button
                onClick={() => setActiveTab('sub')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-all btn-base ${
                  activeTab === 'sub'
                    ? 'bg-gradient-to-r from-navy-gold to-ocean-light text-white shadow-lg font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-navy-light'
                }`}
              >
                潜艇
              </button>
            </div>

            {/* 阵容操作按钮 */}
            <div className="flex flex-wrap gap-2 ml-auto">
              {activeTab !== 'sub' && (
                <>
                  <button
                    onClick={() => copyFleet(activeTab, activeTab === 'fleet1' ? 'fleet2' : 'fleet1')}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                    title="复制到另一个阵容"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">复制到</span>
                    <span className="sm:hidden">复制</span>
                  </button>
                </>
              )}
              <button
                onClick={clearFleet}
                className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="清空当前阵容"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">清空</span>
              </button>
              <button
                onClick={exportFleet}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="导出所有阵容"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">导出</span>
              </button>
            </div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4 sm:mb-6">
          <input
            type="text"
            placeholder="搜索角色..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:flex-1 sm:min-w-[200px] bg-navy-light border border-navy-gold/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSearchModal(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">添加角色</span>
              <span className="xs:hidden">添加</span>
            </button>
            <button
              onClick={() => setShowPositionImportPanel(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden xs:inline">识别截图</span>
              <span className="xs:hidden">截图</span>
            </button>
            <button
              onClick={() => setShowRecommendationPanel(true)}
              className="flex items-center justify-center gap-1 sm:gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden xs:inline">智能推荐</span>
              <span className="xs:hidden">推荐</span>
            </button>
          </div>
          <div className="flex gap-2">
            <div className="bg-navy-light rounded-lg px-3 sm:px-4 py-2 text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">已拥有：</span>
              <span className="font-bold text-yellow-400">{ownedCharacters.length}</span>
            </div>
            <div className="bg-navy-light rounded-lg px-3 sm:px-4 py-2 text-white text-xs sm:text-sm">
              战力：<span className="font-bold text-yellow-400">{Math.round(calculatePower())}</span>
            </div>
          </div>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 左侧：角色列表 */}
            <div className="lg:col-span-1">
              <div className="bg-navy-light/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">编队类型</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFleetType('surface')}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                        fleetType === 'surface'
                          ? 'bg-blue-600 text-white'
                          : 'bg-navy-light text-gray-400 hover:bg-azur'
                      }`}
                    >
                      水面
                    </button>
                    <button
                      onClick={() => setFleetType('submarine')}
                      className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm transition-colors ${
                        fleetType === 'submarine'
                          ? 'bg-purple-600 text-white'
                          : 'bg-navy-light text-gray-400 hover:bg-azur'
                      }`}
                    >
                      潜艇
                    </button>
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">
                  角色池 ({characters.length})
                </h2>
                <div className="space-y-2 sm:space-y-3 max-h-[50vh] sm:max-h-[600px] overflow-y-auto">
                  {characters.map(char => (
                    <DraggableCharacter key={char.id} character={char} />
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：阵容槽位 */}
            <div className="lg:col-span-2">
              <div className="bg-navy-light/30 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    {currentFleet.name}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={clearFleet}
                      className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                      title="清空当前阵容"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">清空</span>
                    </button>
                  </div>
                </div>

                {/* 潜艇阵容 - 单排显示 */}
                {activeTab === 'sub' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <FleetSlot
                        key={`slot-${i + 1}`}
                        id={`slot-${i + 1}`}
                        position={i + 1}
                        slotType="潜艇"
                        fleetType="submarine"
                        character={currentFleet.characters[i]}
                        onRemove={() => {
                          const newFleets = { ...fleets };
                          newFleets.sub.characters[i] = null;
                          setFleets(newFleets);
                          dataManager.updateFleet(newFleets.sub);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  /* 水面阵容 - 两排显示 */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                      {[0, 1, 2].map(i => (
                        <FleetSlot
                          key={`slot-${i + 1}`}
                          id={`slot-${i + 1}`}
                          position={i + 1}
                          slotType="先锋"
                          fleetType="surface"
                          character={currentFleet.characters[i]}
                          onRemove={() => {
                            const newFleets = { ...fleets };
                            const key = activeTab === 'fleet1' ? 'fleet1' : 'fleet2';
                            newFleets[key].characters[i] = null;
                            setFleets(newFleets);
                            dataManager.updateFleet(newFleets[key]);
                          }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {[3, 4, 5].map(i => (
                        <FleetSlot
                          key={`slot-${i + 1}`}
                          id={`slot-${i + 1}`}
                          position={i + 1}
                          slotType="主力"
                          fleetType="surface"
                          character={currentFleet.characters[i]}
                          onRemove={() => {
                            const newFleets = { ...fleets };
                            const key = activeTab === 'fleet1' ? 'fleet1' : 'fleet2';
                            newFleets[key].characters[i] = null;
                            setFleets(newFleets);
                            dataManager.updateFleet(newFleets[key]);
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 保存/加载面板 */}
              <div className="mt-4">
                <FleetSaveLoadPanel
                  fleet={currentFleet}
                  onFleetChange={updateCurrentFleet}
                  fleetType={activeTab === 'sub' ? 'submarine' : 'surface'}
                />
              </div>

              {/* 阵容对比面板 - 仅在查看海上阵容时显示 */}
              {activeTab !== 'sub' && (
                <div className="mt-4">
                  <FleetComparisonPanel
                    fleet1={fleets.fleet1}
                    fleet2={fleets.fleet2}
                  />
                </div>
              )}

              {/* 推荐阵容提示 - 移动端隐藏 */}
              <div className="hidden sm:block mt-4 sm:mt-6 bg-purple-900/30 rounded-xl p-4 sm:p-6 text-center">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-2 sm:mb-3" />
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">智能编队推荐</h3>
                <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                  根据你拥有的角色、舰种搭配、阵营协同，智能推荐最强阵容
                </p>
                <button
                  onClick={() => setShowRecommendationPanel(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
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
            occupiedCharacterIds={occupiedCharacterIds}
            onApplyFleet={(fleet) => {
              const newFleets = { ...fleets };
              const key = activeTab === 'fleet1' ? 'fleet1' : activeTab === 'fleet2' ? 'fleet2' : 'sub';
              newFleets[key] = { ...fleet, id: newFleets[key].id, name: newFleets[key].name };
              setFleets(newFleets);
              dataManager.updateFleet(newFleets[key]);
            }}
            onClose={() => setShowRecommendationPanel(false)}
          />
        )}

        {/* 位置导入面板 */}
        {showPositionImportPanel && (
          <PositionImportPanel
            onClose={() => setShowPositionImportPanel(false)}
            onImportComplete={handlePositionImportComplete}
          />
        )}
      </div>

      {/* 角色详情弹窗 */}
      <CharacterDetailModal
        character={selectedCharacter!}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

