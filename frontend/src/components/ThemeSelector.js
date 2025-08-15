import React from 'react';

const ThemeSelector = ({ onThemeChange, selectedTheme }) => {
  const themes = [
    { id: 'default', emoji: '🌙', label: 'Default' },
    { id: 'sunset', emoji: '🌅', label: 'Sunset' },
    { id: 'ocean', emoji: '🌊', label: 'Ocean' },
    { id: 'forest', emoji: '🌲', label: 'Forest' },
    { id: 'galaxy', emoji: '🌌', label: 'Galaxy' },
    { id: 'warm', emoji: '🔥', label: 'Warm' },
    { id: 'cool', emoji: '❄️', label: 'Cool' }
  ];

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(theme => theme.id === selectedTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    console.log('Theme cycling from', selectedTheme, 'to', nextTheme.id);
    onThemeChange(nextTheme.id);
  };

  const selectedThemeData = themes.find(theme => theme.id === selectedTheme) || themes[0];

  return (
    <button
      onClick={handleThemeChange}
      className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 transition-all duration-200 hover:bg-white/30"
      title={`Current theme: ${selectedThemeData.label}. Click to change theme!`}
    >
      <span className="text-lg">
        {selectedThemeData.emoji}
      </span>
      <span className="text-gray-800 text-sm font-medium">
        Change Theme
      </span>
    </button>
  );
};

export default ThemeSelector;