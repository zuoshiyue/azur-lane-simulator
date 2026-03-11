import React from 'react';
import { Skill } from '../types';
import { Zap, Clock } from 'lucide-react';

interface SkillDisplayProps {
  skills: Skill[];
}

export const SkillDisplay: React.FC<SkillDisplayProps> = ({ skills }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="text-gray-400 italic py-2">
        暂无技能信息
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((skill, index) => (
        <div
          key={index}
          className="bg-navy-light/30 rounded-lg p-4 border border-navy-gold/10"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500
                           flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                  {skill.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    skill.type === 'active'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {skill.type === 'active' ? '主动' : '被动'}
                  </span>
                </h4>
              </div>

              <p className="text-gray-300 leading-relaxed mb-2">
                {skill.description}
              </p>

              {skill.cooldown && (
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>冷却: {skill.cooldown}秒</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};