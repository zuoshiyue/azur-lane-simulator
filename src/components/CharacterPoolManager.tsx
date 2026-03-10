import React, { useState, useMemo, useRef } from 'react';
import dataManager from '../data/dataManager';
import { CharacterCard } from './CharacterCard';
import { CharacterForm } from './CharacterForm';
import { Character, ShipType } from '../types';
import { 
  Plus, Search, Filter, Trash2, Edit2, Download, Upload, 
  Grid, List, Database, Star, X, CheckCircle, AlertTriangle 
} from 'lucide-react';

export const CharacterPoolManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ShipType | '全部'>('全部');
  const [selectedFaction, setSelectedFaction] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState('');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allCharacters = dataManager.getAllCharacters();
  const ownedCharacterIds = dataManager.getOwnedCharacterIds();

  const factions = useMemo(() => {
    const f = new Set(allCharacters.map(c => c.faction));
    return ['全部', ...Array.from(f)];
  }, [allCharacters]);

  const types: (ShipType | '全部')[] = [
    '全部', '驱逐', '轻巡', '重巡', '超巡', 
    '战列', '战巡', '航母', '轻母', '潜艇', '维修', '运输'
  ];

  const filteredCharacters = useMemo(() => {
    return allCharacters.filter(char => {
      // 搜索匹配（支持名称、别称、类型、阵营）
      const matchSearch = searchQuery === '' ||
        char.nameCn.includes(searchQuery) ||
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.type.includes(searchQuery) ||
        char.faction.includes(searchQuery) ||
        (char.aliases && char.aliases.some(alias => alias.includes(searchQuery))); // 别称搜索

      const matchType = selectedType === '全部' || char.type === selectedType;
      const matchFaction = selectedFaction === '全部' || char.faction === selectedFaction;
      const matchOwned = !showOwnedOnly || ownedCharacterIds.includes(char.id);

      return matchSearch && matchType && matchFaction && matchOwned;
    });
  }, [allCharacters, searchQuery, selectedType, selectedFaction, showOwnedOnly, ownedCharacterIds]);

  const handleBatchAddOwned = () => {
    const idsToAdd = filteredCharacters.map(c => c.id);
    const addedCount = dataManager.batchAddOwned(idsToAdd);
    alert(`已批量添加 ${addedCount} 个角色到已拥有列表`);
  };

  // 统计信息
  const stats = useMemo(() => {
    const owned = allCharacters.filter(c => ownedCharacterIds.includes(c.id));
    return {
      total: allCharacters.length,
      owned: owned.length,
      ssr: owned.filter(c => c.rarity === 6).length,
      sr: owned.filter(c => c.rarity === 5).length,
      r: owned.filter(c => c.rarity === 4).length,
      n: owned.filter(c => c.rarity <= 3).length,
      filtered: filteredCharacters.length
    };
  }, [allCharacters, ownedCharacterIds, filteredCharacters]);

  const handleAddCharacter = (character: Character) => {
    dataManager.addCharacter(character);
    setShowForm(false);
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setShowForm(true);
  };

  const handleUpdateCharacter = (character: Character) => {
    dataManager.updateCharacter(character);
    setEditingCharacter(undefined);
    setShowForm(false);
  };

  const handleDeleteCharacter = (characterId: string) => {
    // 检查角色是否在阵容中
    const fleets = dataManager.getFleets();
    const inUse = fleets.some(fleet => 
      fleet.characters.some(char => char?.id === characterId)
    );

    if (inUse) {
      if (!confirm('该角色正在阵容中使用，删除后会自动从阵容中移除。确定要删除吗？')) {
        return;
      }
      // 从所有阵容中移除该角色
      fleets.forEach(fleet => {
        const charIndex = fleet.characters.findIndex(c => c?.id === characterId);
        if (charIndex !== -1) {
          fleet.characters[charIndex] = null;
          dataManager.updateFleet(fleet);
        }
      });
    }

    dataManager.deleteCharacter(characterId);
    setShowDeleteConfirm(null);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(characterId);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 个角色吗？此操作不可恢复！`)) {
      return;
    }

    selectedIds.forEach(id => handleDeleteCharacter(id));
    setSelectedIds(new Set());
  };

  const toggleSelectCharacter = (characterId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(characterId)) {
        next.delete(characterId);
      } else {
        next.add(characterId);
      }
      return next;
    });
  };

  const handleExport = () => {
    const json = JSON.stringify(allCharacters, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azur-characters-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const characters = JSON.parse(importText);
      if (Array.isArray(characters)) {
        dataManager.importCharacters(characters);
        setShowImportExport(false);
        setImportText('');
        alert(`成功导入 ${characters.length} 个角色！`);
      } else {
        alert('无效的 JSON 格式，应该是角色数组');
      }
    } catch (e) {
      alert('JSON 解析失败：' + (e as Error).message);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const characters = JSON.parse(event.target?.result as string);
        if (Array.isArray(characters)) {
          dataManager.importCharacters(characters);
          alert(`成功导入 ${characters.length} 个角色！`);
        }
      } catch (err) {
        alert('文件解析失败：' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-azur-dark to-azur p-6">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="w-8 h-8" />
            角色池管理
          </h1>
          <p className="text-gray-300">管理你的角色收藏，支持增删改查和批量操作</p>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          <StatCard 
            icon={Database} 
            label="总角色数" 
            value={stats.total} 
            color="bg-blue-600" 
          />
          <StatCard 
            icon={CheckCircle} 
            label="已拥有" 
            value={stats.owned} 
            color="bg-green-600" 
          />
          <StatCard 
            icon={Star} 
            label="SSR (6★)" 
            value={stats.ssr} 
            color="bg-yellow-500" 
          />
          <StatCard 
            icon={Star} 
            label="SR (5★)" 
            value={stats.sr} 
            color="bg-purple-500" 
          />
          <StatCard 
            icon={Star} 
            label="R (4★)" 
            value={stats.r} 
            color="bg-blue-400" 
          />
          <StatCard 
            icon={Star} 
            label="N (≤3★)" 
            value={stats.n} 
            color="bg-gray-500" 
          />
          <StatCard 
            icon={Filter} 
            label="筛选结果" 
            value={stats.filtered} 
            color="bg-pink-600" 
          />
        </div>

        {/* 操作栏 */}
        <div className="bg-azur-dark/50 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* 左侧：添加和批量操作 */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setEditingCharacter(undefined);
                  setShowForm(true);
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加角色
              </button>

              <button
                onClick={handleBatchAddOwned}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="将当前筛选结果中的所有角色添加到已拥有列表"
              >
                <CheckCircle className="w-4 h-4" />
                批量添加已拥有
              </button>

              <button
                onClick={() => setShowOwnedOnly(!showOwnedOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showOwnedOnly
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                title="只显示已拥有的角色"
              >
                <Database className="w-4 h-4" />
                {showOwnedOnly ? '已拥有' : '全部角色'}
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除选中 ({selectedIds.size})
                </button>
              )}

              <button
                onClick={() => setShowImportExport(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                导入/导出
              </button>
            </div>

            {/* 右侧：视图切换 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-azur-dark text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-azur-dark text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div className="flex flex-wrap gap-3 mt-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索角色名、类型、阵营..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-azur-dark border border-azur rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ShipType | '全部')}
                className="bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 阵营筛选 */}
            <select
              value={selectedFaction}
              onChange={(e) => setSelectedFaction(e.target.value)}
              className="bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
            >
              {factions.map(faction => (
                <option key={faction} value={faction}>{faction}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 角色列表 */}
        {filteredCharacters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-azur-dark/30 rounded-xl">
            <Search className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">没有找到匹配的角色</p>
            <p className="text-sm mt-2">尝试其他搜索词或清除筛选条件</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('全部');
                setSelectedFaction('全部');
              }}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              清除筛选
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCharacters.map(char => {
              const isSelected = selectedIds.has(char.id);
              const isOwned = ownedCharacterIds.includes(char.id);
              
              return (
                <div 
                  key={char.id} 
                  className={`relative group ${isSelected ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}
                >
                  <CharacterCard 
                    character={char} 
                    owned={isOwned}
                    showOwnedToggle={true}
                    onToggleOwned={(character) => {
                      if (isOwned) {
                        dataManager.deleteCharacter(character.id);
                      } else {
                        dataManager.addCharacter(character);
                      }
                    }}
                  />
                  
                  {/* 操作按钮 */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleSelectCharacter(char.id)}
                      className={`p-2 rounded-lg transition-colors shadow-lg ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700/90 text-gray-300 hover:bg-blue-600 hover:text-white'
                      }`}
                      title={isSelected ? '取消选择' : '选择'}
                    >
                      {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                    <div className="w-px bg-gray-600/50 my-1" />
                    <button
                      onClick={() => handleEditCharacter(char)}
                      className="p-2 bg-blue-600/90 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-gray-600/50 my-1" />
                    <button
                      onClick={() => setShowDeleteConfirm(char.id)}
                      className="p-2 bg-red-600/90 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCharacters.map(char => {
              const isSelected = selectedIds.has(char.id);
              
              return (
                <div 
                  key={char.id} 
                  className={`relative group bg-azur rounded-xl p-4 border border-azur-dark ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectCharacter(char.id)}
                      className="w-5 h-5 rounded bg-azur-dark border-azur text-blue-600 focus:ring-blue-500"
                    />
                    
                    {/* 角色信息 */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-bold text-white">{char.nameCn}</div>
                        <div className="text-sm text-gray-400">{char.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">舰种</div>
                        <div className="text-white">{char.type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">阵营</div>
                        <div className="text-white">{char.faction}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">稀有度</div>
                        <div className="text-yellow-400">{'★'.repeat(char.rarity)}</div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleSelectCharacter(char.id)}
                        className={`p-2 rounded-lg transition-colors shadow-lg ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700/90 text-gray-300 hover:bg-blue-600 hover:text-white'
                        }`}
                        title={isSelected ? '取消选择' : '选择'}
                      >
                        {isSelected ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                      <div className="w-px bg-gray-600/50 my-1" />
                      <button
                        onClick={() => handleEditCharacter(char)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <div className="w-px bg-gray-600/50 my-1" />
                      <button
                        onClick={() => setShowDeleteConfirm(char.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 角色表单弹窗 */}
      {showForm && (
        <CharacterForm
          character={editingCharacter}
          onSubmit={editingCharacter ? handleUpdateCharacter : handleAddCharacter}
          onCancel={() => {
            setShowForm(false);
            setEditingCharacter(undefined);
          }}
        />
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="bg-azur-dark rounded-2xl max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h3 className="text-xl font-bold text-white">确认删除</h3>
            </div>
            <p className="text-gray-300 mb-6">
              确定要删除这个角色吗？此操作不可恢复！
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-azur hover:bg-azur-light text-white rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDeleteCharacter(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 导入/导出弹窗 */}
      {showImportExport && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowImportExport(false)}
        >
          <div 
            className="bg-azur-dark rounded-2xl max-w-2xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-azur p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">导入/导出角色数据</h3>
              <button
                onClick={() => setShowImportExport(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* 导出 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  导出数据
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  将所有角色数据导出为 JSON 文件，可用于备份或分享
                </p>
                <button
                  onClick={handleExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  导出 JSON 文件
                </button>
              </div>

              {/* 导入 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  导入数据
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  从 JSON 文件导入角色数据，会自动合并到现有角色池
                </p>
                <div className="flex gap-3 mb-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    选择 JSON 文件
                  </button>
                </div>
              </div>

              {/* 文本导入 */}
              <div>
                <h4 className="text-lg font-bold text-white mb-3">或粘贴 JSON 文本</h4>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"id": "char_001", "name": "Enterprise", ...}]'
                  className="w-full h-40 bg-azur-dark border border-azur rounded-lg p-3 text-white font-mono text-sm focus:outline-none"
                />
                <button
                  onClick={handleImport}
                  className="mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  导入文本
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 统计卡片组件
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}> = ({ icon: Icon, label, value, color }) => (
  <div className={`${color} rounded-lg p-3 text-white`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 opacity-80" />
      <span className="text-xs opacity-80">{label}</span>
    </div>
    <div className="text-2xl font-bold">{value}</div>
  </div>
);
