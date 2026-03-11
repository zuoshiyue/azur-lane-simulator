import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'auto':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Sun className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (theme) {
      case 'light':
        return '切换到深色模式';
      case 'dark':
        return '切换到自动模式';
      case 'auto':
        return '切换到浅色模式';
      default:
        return '切换主题';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-navy-light hover:bg-navy-accent text-white transition-colors"
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
};