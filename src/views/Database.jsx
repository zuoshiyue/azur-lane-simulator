import { useState } from 'react';
import { useCharacterStore } from '../stores/characterStore';

function CharacterCard({ character, onClick }) {
  const rarityColors = {
    SSR: 'bg-gradient-to-br from-orange-400 to-red-500',
    UR: 'bg-gradient-to-br from-purple-400 to-pink-500',
    SR: 'bg-gradient-to-br from-purple-400 to-purple-600',
    R: 'bg-gradient-to-br from-blue-400 to-blue-600',
    N: 'bg-gradient-to-br from-gray-400 to-gray-600'
  };

  return (
    <div
      onClick={() => onClick(character)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer group"
    >
      <div className={`h-2 ${rarityColors[character.rarity] || 'bg-gray-400'}`} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg group-hover:text-azur-blue transition">
              {character.name}
            </h3>
            <p className="text-sm text-gray-500">{character.nameEn}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-bold text-white ${rarityColors[character.rarity]}`}>
            {character.rarity}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded">{character.shipTypeName}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{character.nation}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="text-gray-500">火力</div>
            <div className="font-bold text-red-600">{character.stats.fire}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">航空</div>
            <div className="font-bold text-blue-600">{character.stats.aviation}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">血量</div>
            <div className="font-bold text-green-600">{character.stats.hp}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterDetail({ character, onClose }) {
  if (!character) return null;

  const rarityColors = {
    SSR: 'border-orange-500',
    UR: 'border-purple-500',
    SR: 'border-purple-400',
    R: 'border-blue-400',
    N: 'border-gray-400'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 ${rarityColors[character.rarity]}`}>
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">{character.name}</h2>
              <p className="text-gray-500">{character.nameEn}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* 基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">舰种</div>
              <div className="font-bold">{character.shipTypeName}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">稀有度</div>
              <div className="font-bold">{character.rarity}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">阵营</div>
              <div className="font-bold">{character.nation}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">获取方式</div>
              <div className="font-bold">{character.obtain}</div>
            </div>
          </div>

          {/* 属性 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">基础属性</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div key={stat} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-500 capitalize">
                    {stat === 'hp' ? '血量' :
                     stat === 'fire' ? '火力' :
                     stat === 'torpedo' ? '鱼雷' :
                     stat === 'aviation' ? '航空' :
                     stat === 'reload' ? '装填' :
                     stat === 'antiAir' ? '防空' :
                     stat === 'antiSub' ? '反潜' :
                     stat === 'speed' ? '航速' :
                     stat === 'luck' ? '幸运' :
                     stat === 'armor' ? '装甲' : stat}
                  </div>
                  <div className="font-bold text-lg">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 技能 */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-3">技能</h3>
            <div className="space-y-3">
              {character.skills.map((skill, index) => (
                <div key={index} className="bg-azur-light p-4 rounded-lg">
                  <div className="font-bold text-azur-dark mb-1">
                    {index + 1}. {skill.name}
                    {skill.cooldown > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        CD: {skill.cooldown}s
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 text-sm">{skill.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 装备推荐 */}
          <div>
            <h3 className="text-xl font-bold mb-3">装备推荐</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(character.equipment).map(([slot, items]) => (
                <div key={slot} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">
                    {slot === 'main' ? '主炮' :
                     slot === 'secondary' ? '副炮/鱼雷' :
                     slot === 'antiAir' ? '防空炮' :
                     slot === 'torpedo' ? '鱼雷机' :
                     slot === 'special' ? '特殊装备' : slot}
                  </div>
                  <div className="font-bold text-sm">
                    {Array.isArray(items) ? items.join(', ') : items}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Database() {
  const charStore = useCharacterStore();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [localSearch, setLocalSearch] = useState('');

  const filteredCharacters = charStore.getFilteredCharacters();
  const shipTypeList = charStore.getShipTypeList();
  const rarityList = charStore.getRarityList();
  const nationList = charStore.getNationList();

  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
    charStore.setSearch(e.target.value);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">角色数据库</h1>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 搜索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
            <input
              type="text"
              value={localSearch}
              onChange={handleSearch}
              placeholder="角色名称..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azur-blue focus:border-transparent"
            />
          </div>

          {/* 舰种 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">舰种</label>
            <select
              value={charStore.filters.shipType}
              onChange={(e) => charStore.setShipType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azur-blue"
            >
              <option value="">全部</option>
              {shipTypeList.map(type => (
                <option key={type.code} value={type.code}>
                  {type.name} ({type.count})
                </option>
              ))}
            </select>
          </div>

          {/* 稀有度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">稀有度</label>
            <select
              value={charStore.filters.rarity}
              onChange={(e) => charStore.setRarity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azur-blue"
            >
              <option value="">全部</option>
              {rarityList.map(r => (
                <option key={r.name} value={r.name}>
                  {r.name} ({r.count})
                </option>
              ))}
            </select>
          </div>

          {/* 国家 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">阵营</label>
            <select
              value={charStore.filters.nation}
              onChange={(e) => charStore.setNation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azur-blue"
            >
              <option value="">全部</option>
              {nationList.map(n => (
                <option key={n.name} value={n.name}>
                  {n.name} ({n.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 清除筛选 */}
        {(charStore.filters.search || charStore.filters.shipType || charStore.filters.rarity || charStore.filters.nation) && (
          <button
            onClick={() => {
              charStore.clearFilters();
              setLocalSearch('');
            }}
            className="mt-4 text-azur-blue hover:underline text-sm"
          >
            清除所有筛选
          </button>
        )}
      </div>

      {/* 结果统计 */}
      <div className="mb-4 text-gray-600">
        共 {filteredCharacters.length} 个角色
      </div>

      {/* 角色列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCharacters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            onClick={setSelectedCharacter}
          />
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500">没有找到符合条件的角色</p>
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedCharacter && (
        <CharacterDetail
          character={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </div>
  );
}

export default Database;
