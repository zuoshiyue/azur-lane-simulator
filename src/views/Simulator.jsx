import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useCharacterStore } from '../stores/characterStore';
import { useFleetStore, FLEET_SLOTS } from '../stores/fleetStore';
import { exportAsText, copyToClipboard, downloadFile } from '../utils/exporter';

// 阵容槽位组件
function FleetSlot({ slot, character, level, onUnequip, onLevelChange }) {
  const charStore = useCharacterStore();
  
  const positionColors = {
    main: 'bg-red-50 border-red-200',
    vanguard: 'bg-blue-50 border-blue-200'
  };

  if (!character) {
    return (
      <div className={`h-32 rounded-xl border-2 border-dashed ${positionColors[slot.position]} flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-1">+</div>
          <div className="text-sm">{slot.label}</div>
          <div className="text-xs">
            {slot.allowedTypes.map(type => charStore.shipTypes.types[type]).join('/')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-32 rounded-xl border-2 ${positionColors[slot.position]} p-3 relative`}>
      <button
        onClick={() => onUnequip(slot.id)}
        className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
      >
        ✕
      </button>
      
      <div className="font-bold text-sm mb-1">{character.name}</div>
      <div className="text-xs text-gray-500 mb-2">{character.shipTypeName}</div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <span className={`px-2 py-1 rounded text-white text-xs ${
            character.rarity === 'SSR' ? 'bg-orange-500' :
            character.rarity === 'SR' ? 'bg-purple-500' :
            'bg-blue-500'
          }`}>
            {character.rarity}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onLevelChange(character.id, level - 1)}
            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm font-bold w-8 text-center">Lv.{level}</span>
          <button
            onClick={() => onLevelChange(character.id, level + 1)}
            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// 角色列表项
function CharacterItem({ character, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, character)}
      className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-sm">{character.name}</div>
          <div className="text-xs text-gray-500">{character.shipTypeName}</div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
          character.rarity === 'SSR' ? 'bg-orange-500' :
          character.rarity === 'SR' ? 'bg-purple-500' :
          'bg-blue-500'
        }`}>
          {character.rarity}
        </span>
      </div>
    </div>
  );
}

function Simulator() {
  const charStore = useCharacterStore();
  const fleetStore = useFleetStore();
  const [draggedCharacter, setDraggedCharacter] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const [showExport, setShowExport] = useState(false);

  const fleetCharacters = fleetStore.getFleetCharacters();
  const fleetStats = fleetStore.getFleetStats();
  const fleetScore = fleetStore.getFleetScore();
  const synergyEffects = fleetStore.getSynergyEffects();
  const filteredCharacters = charStore.getFilteredCharacters();

  const handleDragStart = (e, character) => {
    setDraggedCharacter(character);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e, slotId) => {
    e.preventDefault();
    setDragOverSlot(slotId);
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    setDragOverSlot(null);
    
    if (draggedCharacter) {
      const success = fleetStore.equipCharacter(slotId, draggedCharacter.id);
      if (!success) {
        alert('该角色不符合此位置的舰种要求!');
      }
      setDraggedCharacter(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedCharacter(null);
    setDragOverSlot(null);
  };

  const handleUnequip = (slotId) => {
    fleetStore.unequipCharacter(slotId);
  };

  const handleLevelChange = (characterId, level) => {
    fleetStore.setCharacterLevel(characterId, level);
  };

  const handleExport = () => {
    const fleetData = fleetStore.exportFleet();
    const characters = charStore.characters;
    const text = exportAsText(fleetData, characters);
    copyToClipboard(text);
    alert('阵容配置已复制到剪贴板!');
  };

  const handleDownload = () => {
    const fleetData = fleetStore.exportFleet();
    const json = JSON.stringify(fleetData, null, 2);
    downloadFile(json, `${fleetData.name}.json`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">阵容模拟器</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-azur-blue text-white rounded-lg hover:bg-navy-light transition"
          >
            📋 复制配置
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            💾 下载 JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：阵容构建区 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">舰队编成</h2>
            
            <DndContext
              onDragStart={(e) => handleDragStart(e, draggedCharacter)}
              onDragOver={(e) => {}}
              onDrop={(e) => {}}
              onDragEnd={handleDragEnd}
            >
              {/* 主力舰队 */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-red-600 mb-3">主力舰队</h3>
                <div className="grid grid-cols-3 gap-4">
                  {FLEET_SLOTS.filter(s => s.position === 'main').map(slot => {
                    const charData = fleetCharacters.find(fc => fc.slotId === slot.id);
                    return (
                      <div
                        key={slot.id}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={dragOverSlot === slot.id ? 'ring-2 ring-azur-blue' : ''}
                      >
                        <FleetSlot
                          slot={slot}
                          character={charData?.character}
                          level={charData?.level || 1}
                          onUnequip={handleUnequip}
                          onLevelChange={handleLevelChange}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 前卫舰队 */}
              <div>
                <h3 className="text-lg font-bold text-blue-600 mb-3">前卫舰队</h3>
                <div className="grid grid-cols-3 gap-4">
                  {FLEET_SLOTS.filter(s => s.position === 'vanguard').map(slot => {
                    const charData = fleetCharacters.find(fc => fc.slotId === slot.id);
                    return (
                      <div
                        key={slot.id}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDrop={(e) => handleDrop(e, slot.id)}
                        className={dragOverSlot === slot.id ? 'ring-2 ring-azur-blue' : ''}
                      >
                        <FleetSlot
                          slot={slot}
                          character={charData?.character}
                          level={charData?.level || 1}
                          onUnequip={handleUnequip}
                          onLevelChange={handleLevelChange}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </DndContext>
          </div>

          {/* 协同效果 */}
          {synergyEffects.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold text-green-700 mb-3">✨ 协同效果</h3>
              <div className="space-y-2">
                {synergyEffects.map((effect, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-green-600">✓</span>
                    <span className="text-green-800">{effect.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：角色选择 + 属性面板 */}
        <div className="space-y-6">
          {/* 角色选择 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">角色选择</h2>
            
            <input
              type="text"
              placeholder="搜索角色..."
              value={charStore.filters.search}
              onChange={(e) => charStore.setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-azur-blue"
            />

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredCharacters.slice(0, 20).map(character => (
                <CharacterItem
                  key={character.id}
                  character={character}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
            
            {filteredCharacters.length > 20 && (
              <div className="text-center text-gray-500 text-sm mt-4">
                还有 {filteredCharacters.length - 20} 个角色，请使用搜索筛选
              </div>
            )}
          </div>

          {/* 阵容属性 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">阵容属性</h2>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-azur-blue">{Math.round(fleetScore)}</div>
              <div className="text-gray-500">综合评分</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">火力</div>
                <div className="font-bold text-red-600">{fleetStats.fire}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">航空</div>
                <div className="font-bold text-blue-600">{fleetStats.aviation}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">血量</div>
                <div className="font-bold text-green-600">{fleetStats.hp}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">装填</div>
                <div className="font-bold text-purple-600">{fleetStats.reload}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">鱼雷</div>
                <div className="font-bold text-yellow-600">{fleetStats.torpedo}</div>
              </div>
              <div className="bg-cyan-50 p-3 rounded-lg text-center">
                <div className="text-sm text-gray-500">防空</div>
                <div className="font-bold text-cyan-600">{fleetStats.antiAir}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">阵容完成度</span>
                <span className="font-bold">
                  {Math.round((fleetCharacters.length / 6) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Simulator;
