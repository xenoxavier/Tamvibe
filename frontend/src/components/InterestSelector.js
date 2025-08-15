import React, { useState } from 'react';

const InterestSelector = ({ onInterestsChange, selectedInterests = [] }) => {
  const [interests, setInterests] = useState(selectedInterests);
  const [customInterest, setCustomInterest] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const availableInterests = [
    { id: 'music', label: '🎵 Music', color: 'bg-pastel-purple' },
    { id: 'gaming', label: '🎮 Gaming', color: 'bg-pastel-blue' },
    { id: 'art', label: '🎨 Art', color: 'bg-pastel-pink' },
    { id: 'movies', label: '🎬 Movies', color: 'bg-pastel-coral' },
    { id: 'books', label: '📚 Books', color: 'bg-pastel-mint' },
    { id: 'sports', label: '⚽ Sports', color: 'bg-pastel-yellow' },
    { id: 'travel', label: '✈️ Travel', color: 'bg-pastel-peach' },
    { id: 'food', label: '🍕 Food', color: 'bg-pastel-lavender' },
    { id: 'tech', label: '💻 Tech', color: 'bg-pastel-blue' },
    { id: 'fashion', label: '👗 Fashion', color: 'bg-pastel-pink' },
    { id: 'fitness', label: '💪 Fitness', color: 'bg-pastel-mint' },
    { id: 'anime', label: '🌸 Anime', color: 'bg-pastel-purple' },
    { id: 'photography', label: '📸 Photography', color: 'bg-pastel-coral' },
    { id: 'memes', label: '😂 Memes', color: 'bg-pastel-yellow' },
    { id: 'pets', label: '🐕 Pets', color: 'bg-pastel-peach' },
    { id: 'study', label: '📖 Study', color: 'bg-pastel-lavender' }
  ];

  const toggleInterest = (interestId) => {
    const newInterests = interests.includes(interestId)
      ? interests.filter(id => id !== interestId)
      : [...interests, interestId];
    
    setInterests(newInterests);
    onInterestsChange(newInterests);
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim().toLowerCase())) {
      const newCustomInterest = customInterest.trim().toLowerCase();
      const newInterests = [...interests, newCustomInterest];
      setInterests(newInterests);
      onInterestsChange(newInterests);
      setCustomInterest('');
      setShowCustomInput(false);
    }
  };

  const handleCustomKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomInterest();
    } else if (e.key === 'Escape') {
      setCustomInterest('');
      setShowCustomInput(false);
    }
  };

  const removeCustomInterest = (interestToRemove) => {
    const newInterests = interests.filter(interest => interest !== interestToRemove);
    setInterests(newInterests);
    onInterestsChange(newInterests);
  };

  const getCustomInterests = () => {
    const predefinedIds = availableInterests.map(interest => interest.id);
    return interests.filter(interest => !predefinedIds.includes(interest));
  };

  const customInterests = getCustomInterests();

  return (
    <div className="animate-slide-up">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        ✨ Pick your interests to find like-minded tambay!
      </h3>
      
      {/* Predefined Interests */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-4">
        {availableInterests.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`
              p-3 rounded-xl text-sm font-medium transition-all duration-200 transform
              ${interests.includes(interest.id)
                ? `${interest.color} text-gray-800 scale-105 shadow-lg ring-2 ring-white/30`
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
              }
              hover:shadow-lg active:scale-95
            `}
          >
            {interest.label}
          </button>
        ))}
        
        {/* Add Custom Interest Button */}
        <button
          onClick={() => setShowCustomInput(!showCustomInput)}
          className="p-3 rounded-xl text-sm font-medium transition-all duration-200 transform bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-800 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          ➕ Add Custom
        </button>
      </div>

      {/* Custom Interest Input */}
      {showCustomInput && (
        <div className="mb-4 flex justify-center animate-slide-up">
          <div className="flex space-x-2 max-w-md w-full">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={handleCustomKeyPress}
              placeholder="Type your interest..."
              className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-pastel-pink border border-white/30"
              maxLength={20}
            />
            <button
              onClick={addCustomInterest}
              disabled={!customInterest.trim()}
              className="bg-pastel-mint text-gray-800 font-medium px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
            >
              Add
            </button>
            <button
              onClick={() => {
                setCustomInterest('');
                setShowCustomInput(false);
              }}
              className="bg-pastel-coral text-gray-800 font-medium px-4 py-2 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Custom Interests Display */}
      {customInterests.length > 0 && (
        <div className="mb-4">
          <h4 className="text-pastel-purple text-sm font-medium text-center mb-2">Your Custom Interests:</h4>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {customInterests.map((interest) => (
              <div
                key={interest}
                className="bg-pastel-lavender text-gray-800 px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 animate-slide-up"
              >
                <span>🎯 {interest}</span>
                <button
                  onClick={() => removeCustomInterest(interest)}
                  className="text-gray-600 hover:text-gray-800 font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {interests.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-pastel-blue text-sm">
            Selected: {interests.length} interest{interests.length !== 1 ? 's' : ''}
          </p>
          <p className="text-pastel-purple text-xs mt-1">
            💡 Tip: Add unique interests to find your perfect tambay buddy!
          </p>
        </div>
      )}
    </div>
  );
};

export default InterestSelector;