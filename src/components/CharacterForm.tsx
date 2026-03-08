import React, { useState, useEffect } from 'react';
import { Character, ShipType, Stats, Skill, EquipmentSlot } from '../types';
import { X } from 'lucide-react';

interface CharacterFormProps {
  character?: Character;
  onSubmit: (character: Character) => void;
  onCancel: () => void;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Character>>({
    name: '',
    nameCn: '',
    rarity: 4,
    type: '驱逐',
    faction: '',
    stats: {
      hp: 500,
      fire: 50,
      torpedo: 50,
      aviation: 0,
      reload: 50,
      armor: '中型',
      speed: 30,
      luck: 50,
      antiAir: 50,
      detection: 50
    },
    skills: [{ name: '', description: '', type: 'passive' }],
    equipment: [
      { slot: 1, type: '', efficiency: 100 },
      { slot: 2, type: '', efficiency: 100 },
      { slot: 3, type: '', efficiency: 100 }
    ]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (character) {
      setFormData(character);
    }
  }, [character]);

  const shipTypes: ShipType[] = [
    '驱逐', '轻巡', '重巡', '超巡', 
    '战列', '战巡', '航母', '轻母', 
    '潜艇', '维修', '运输'
  ];

  const factions = [
    '白鹰', '皇家', '铁血', '重樱', 
    '东煌', '自由鸢尾', '维希教廷', 
    '撒丁帝国', '北方联合', '其他'
  ];

  const armorTypes = ['轻型', '中型', '重型'];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '请输入英文名';
    }
    if (!formData.nameCn?.trim()) {
      newErrors.nameCn = '请输入中文名';
    }
    if (!formData.faction?.trim()) {
      newErrors.faction = '请选择阵营';
    }
    if (!formData.stats?.hp || formData.stats.hp <= 0) {
      newErrors.hp = '耐久必须大于 0';
    }
    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = '至少需要一个技能';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const newCharacter: Character = {
      id: character?.id || `char_${Date.now()}`,
      name: formData.name!.trim(),
      nameCn: formData.nameCn!.trim(),
      rarity: formData.rarity || 4,
      type: formData.type as ShipType,
      faction: formData.faction!.trim(),
      stats: formData.stats as Stats,
      skills: (formData.skills || []).filter(s => s.name.trim()),
      equipment: (formData.equipment || []).filter(e => e.type.trim()),
      image: formData.image
    };

    onSubmit(newCharacter);
  };

  const updateStats = (key: keyof Stats, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      stats: { ...prev.stats!, [key]: value }
    }));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), { name: '', description: '', type: 'passive' }]
    }));
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index)
    }));
  };

  const updateEquipment = (index: number, field: keyof EquipmentSlot, value: any) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.map((e, i) => 
        i === index ? { ...e, [field]: value } : e
      )
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...(prev.equipment || []), { 
        slot: (prev.equipment?.length || 0) + 1, 
        type: '', 
        efficiency: 100 
      }]
    }));
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.filter((_, i) => i !== index)
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onCancel}
    >
      <div 
        className="bg-azur-dark rounded-2xl max-w-4xl w-full my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="bg-azur p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {character ? '编辑角色' : '添加新角色'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 基本信息 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">基本信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">英文名 *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full bg-azur-dark border ${errors.name ? 'border-red-500' : 'border-azur'} rounded-lg px-3 py-2 text-white focus:outline-none`}
                  placeholder="Enterprise"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">中文名 *</label>
                <input
                  type="text"
                  value={formData.nameCn || ''}
                  onChange={e => setFormData(prev => ({ ...prev, nameCn: e.target.value }))}
                  className={`w-full bg-azur-dark border ${errors.nameCn ? 'border-red-500' : 'border-azur'} rounded-lg px-3 py-2 text-white focus:outline-none`}
                  placeholder="企业"
                />
                {errors.nameCn && <p className="text-red-500 text-xs mt-1">{errors.nameCn}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">稀有度</label>
                <select
                  value={formData.rarity}
                  onChange={e => setFormData(prev => ({ ...prev, rarity: Number(e.target.value) }))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(r => (
                    <option key={r} value={r}>{'★'.repeat(r)} ({r}星)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">舰种 *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ShipType }))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {shipTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">阵营 *</label>
                <select
                  value={formData.faction}
                  onChange={e => setFormData(prev => ({ ...prev, faction: e.target.value }))}
                  className={`w-full bg-azur-dark border ${errors.faction ? 'border-red-500' : 'border-azur'} rounded-lg px-3 py-2 text-white focus:outline-none`}
                >
                  <option value="">请选择</option>
                  {factions.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                {errors.faction && <p className="text-red-500 text-xs mt-1">{errors.faction}</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">图片 URL</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* 属性 */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-4">基础属性</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">耐久</label>
                <input
                  type="number"
                  value={formData.stats?.hp || 0}
                  onChange={e => updateStats('hp', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">火力</label>
                <input
                  type="number"
                  value={formData.stats?.fire || 0}
                  onChange={e => updateStats('fire', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">鱼雷</label>
                <input
                  type="number"
                  value={formData.stats?.torpedo || 0}
                  onChange={e => updateStats('torpedo', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">航空</label>
                <input
                  type="number"
                  value={formData.stats?.aviation || 0}
                  onChange={e => updateStats('aviation', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">装填</label>
                <input
                  type="number"
                  value={formData.stats?.reload || 0}
                  onChange={e => updateStats('reload', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">装甲</label>
                <select
                  value={formData.stats?.armor || '中型'}
                  onChange={e => updateStats('armor', e.target.value)}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {armorTypes.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">航速</label>
                <input
                  type="number"
                  value={formData.stats?.speed || 0}
                  onChange={e => updateStats('speed', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">幸运</label>
                <input
                  type="number"
                  value={formData.stats?.luck || 0}
                  onChange={e => updateStats('luck', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">防空</label>
                <input
                  type="number"
                  value={formData.stats?.antiAir || 0}
                  onChange={e => updateStats('antiAir', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">侦察</label>
                <input
                  type="number"
                  value={formData.stats?.detection || 0}
                  onChange={e => updateStats('detection', Number(e.target.value))}
                  className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 技能 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">技能</h3>
              <button
                type="button"
                onClick={addSkill}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                + 添加技能
              </button>
            </div>
            {errors.skills && <p className="text-red-500 text-xs mb-2">{errors.skills}</p>}
            <div className="space-y-3">
              {(formData.skills || []).map((skill, index) => (
                <div key={index} className="bg-azur/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={e => updateSkill(index, 'name', e.target.value)}
                      placeholder="技能名称"
                      className="flex-1 bg-azur-dark border border-azur rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                    />
                    <select
                      value={skill.type}
                      onChange={e => updateSkill(index, 'type', e.target.value)}
                      className="bg-azur-dark border border-azur rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                    >
                      <option value="passive">被动</option>
                      <option value="active">主动</option>
                    </select>
                    {skill.type === 'active' && (
                      <input
                        type="number"
                        value={skill.cooldown || 0}
                        onChange={e => updateSkill(index, 'cooldown', Number(e.target.value))}
                        placeholder="CD"
                        className="w-16 bg-azur-dark border border-azur rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={skill.description}
                    onChange={e => updateSkill(index, 'description', e.target.value)}
                    placeholder="技能描述"
                    rows={2}
                    className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 装备 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">装备槽</h3>
              <button
                type="button"
                onClick={addEquipment}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                + 添加装备槽
              </button>
            </div>
            <div className="space-y-3">
              {(formData.equipment || []).map((eq, index) => (
                <div key={index} className="flex items-center gap-3 bg-azur/30 rounded-lg p-3">
                  <div className="w-12">
                    <label className="block text-xs text-gray-400 mb-1">槽位</label>
                    <input
                      type="number"
                      value={eq.slot}
                      onChange={e => updateEquipment(index, 'slot', Number(e.target.value))}
                      className="w-full bg-azur-dark border border-azur rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">装备类型</label>
                    <input
                      type="text"
                      value={eq.type}
                      onChange={e => updateEquipment(index, 'type', e.target.value)}
                      placeholder="战斗机/主炮/鱼雷等"
                      className="w-full bg-azur-dark border border-azur rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-400 mb-1">效率 (%)</label>
                    <input
                      type="number"
                      value={eq.efficiency}
                      onChange={e => updateEquipment(index, 'efficiency', Number(e.target.value))}
                      className="w-full bg-azur-dark border border-azur rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEquipment(index)}
                    className="mt-4 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 justify-end pt-4 border-t border-azur">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-azur-dark hover:bg-azur text-white rounded-lg transition-colors border border-azur"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {character ? '保存修改' : '添加角色'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
