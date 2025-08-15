import React, { useState } from 'react';

const MoodSelector = ({ onMoodChange, selectedMood }) => {
  const [showMoods, setShowMoods] = useState(false);

  const moods = [
    { id: 'chill', emoji: '😌', label: 'Chill', color: 'bg-pastel-blue' },
    { id: 'hyper', emoji: '🤩', label: 'Hyper', color: 'bg-pastel-yellow' },
    { id: 'study', emoji: '📚', label: 'Study Mode', color: 'bg-pastel-mint' },
    { id: 'creative', emoji: '🎨', label: 'Creative', color: 'bg-pastel-purple' },
    { id: 'music', emoji: '🎵', label: 'Music Vibes', color: 'bg-pastel-pink' },
    { id: 'gaming', emoji: '🎮', label: 'Gaming', color: 'bg-pastel-coral' },
    { id: 'sleepy', emoji: '😴', label: 'Sleepy', color: 'bg-pastel-lavender' },
    { id: 'excited', emoji: '🔥', label: 'Excited', color: 'bg-pastel-peach' },
    { id: 'deep', emoji: '🤔', label: 'Deep Talk', color: 'bg-gray-600' },
    { id: 'funny', emoji: '😂', label: 'Funny', color: 'bg-pastel-yellow' }
  ];

  const handleMoodSelect = (mood) => {
    onMoodChange(mood);
    setShowMoods(false);
  };

  const selectedMoodData = moods.find(mood => mood.id === selectedMood);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMoods(!showMoods)}
        className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 transition-all duration-200 hover:bg-white/30"
      >
        <span className="text-lg">
          {selectedMoodData ? selectedMoodData.emoji : '😊'}
        </span>
        <span className="text-white text-sm font-medium">
          {selectedMoodData ? selectedMoodData.label : 'Set Mood'}
        </span>
        <span className="text-gray-300 text-sm">
          {showMoods ? '▲' : '▼'}
        </span>
      </button>

      {showMoods && (
        <div className="absolute top-full mt-2 left-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-4 z-50 w-80 animate-slide-up">
          <h3 className="text-white font-semibold mb-3 text-center">What's your vibe? ✨</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className={`
                  flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 transform hover:scale-105
                  ${selectedMood === mood.id
                    ? `${mood.color} text-gray-800 shadow-lg ring-2 ring-white/30`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                <span className="text-xl">{mood.emoji}</span>
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                onMoodChange(null);
                setShowMoods(false);
              }}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Clear Mood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSelector;