import React, { useState, useEffect } from 'react';
import { Fleet } from '../types';
import { Save, Upload, Download, Trash2, Copy, Edit3 } from 'lucide-react';

interface SavedFleet {
  id: string;
  name: string;
  fleet: Fleet;
  createdAt: number;
}

interface FleetSaveLoadPanelProps {
  fleet: Fleet;
  onFleetChange: (fleet: Fleet) => void;
  fleetType: 'surface' | 'submarine';
}

export const FleetSaveLoadPanel: React.FC<FleetSaveLoadPanelProps> = ({
  fleet,
  onFleetChange,
  fleetType
}) => {
  const [savedFleets, setSavedFleets] = useState<SavedFleet[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // 从 localStorage 加载保存的阵容
  useEffect(() => {
    const saved = localStorage.getItem(`azur_lane_saved_fleets_${fleetType}`);
    if (saved) {
      try {
        setSavedFleets(JSON.parse(saved));
      } catch {
        setSavedFleets([]);
      }
    }
  }, [fleetType]);

  // 保存到 localStorage
  const saveToFavorites = () => {
    if (!saveName.trim()) return;

    const newFleet: SavedFleet = {
      id: `saved_${Date.now()}`,
      name: saveName.trim(),
      fleet: { ...fleet, id: `saved_${Date.now()}` }, // 更新ID避免冲突
      createdAt: Date.now(),
    };

    const updatedFleets = [newFleet, ...savedFleets];
    setSavedFleets(updatedFleets);
    localStorage.setItem(`azur_lane_saved_fleets_${fleetType}`, JSON.stringify(updatedFleets));

    setSaveName('');
    setIsSaving(false);
  };

  const loadFleet = (savedFleet: SavedFleet) => {
    onFleetChange(savedFleet.fleet);
  };

  const deleteFleet = (id: string) => {
    const updatedFleets = savedFleets.filter(f => f.id !== id);
    setSavedFleets(updatedFleets);
    localStorage.setItem(`azur_lane_saved_fleets_${fleetType}`, JSON.stringify(updatedFleets));
  };

  const startEdit = (savedFleet: SavedFleet) => {
    setEditingId(savedFleet.id);
    setEditName(savedFleet.name);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;

    const updatedFleets = savedFleets.map(f =>
      f.id === editingId ? { ...f, name: editName.trim() } : f
    );

    setSavedFleets(updatedFleets);
    localStorage.setItem(`azur_lane_saved_fleets_${fleetType}`, JSON.stringify(updatedFleets));
    setEditingId(null);
    setEditName('');
  };

  const exportFleet = (savedFleet: SavedFleet) => {
    const json = JSON.stringify(savedFleet.fleet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${savedFleet.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const duplicateFleet = (savedFleet: SavedFleet) => {
    const duplicatedFleet: SavedFleet = {
      ...savedFleet,
      id: `dup_${Date.now()}`,
      name: `${savedFleet.name} (副本)`,
      fleet: {
        ...savedFleet.fleet,
        id: `dup_${Date.now()}`,
        name: `${savedFleet.name} (副本)`
      }
    };

    const updatedFleets = [duplicatedFleet, ...savedFleets];
    setSavedFleets(updatedFleets);
    localStorage.setItem(`azur_lane_saved_fleets_${fleetType}`, JSON.stringify(updatedFleets));
  };

  return (
    <div className="bg-navy-light/30 rounded-xl p-4 border border-navy-gold/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Save className="w-5 h-5 text-yellow-400" />
          阵容收藏
        </h3>
      </div>

      {/* 保存功能 */}
      <div className="mb-4">
        {!isSaving ? (
          <button
            onClick={() => setIsSaving(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存当前阵容
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="请输入阵容名称"
              className="flex-1 bg-navy-primary border border-navy-gold/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && saveToFavorites()}
            />
            <button
              onClick={saveToFavorites}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              保存
            </button>
            <button
              onClick={() => {
                setIsSaving(false);
                setSaveName('');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        )}
      </div>

      {/* 已保存的阵容列表 */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {savedFleets.length === 0 ? (
          <div className="text-center text-gray-400 py-4 text-sm">
            暂无保存的阵容
          </div>
        ) : (
          savedFleets.map((savedFleet) => (
            <div
              key={savedFleet.id}
              className="bg-navy-primary rounded-lg p-3 border border-navy-gold/10 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0">
                {editingId === savedFleet.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-navy-light border border-navy-gold/20 rounded px-2 py-1 text-white text-sm focus:outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <button
                      onClick={saveEdit}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-white truncate">
                      {savedFleet.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(savedFleet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => loadFleet(savedFleet)}
                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded"
                  title="加载阵容"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => duplicateFleet(savedFleet)}
                  className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded"
                  title="复制阵容"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startEdit(savedFleet)}
                  className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded"
                  title="重命名"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => exportFleet(savedFleet)}
                  className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded"
                  title="导出阵容"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteFleet(savedFleet.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                  title="删除阵容"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};