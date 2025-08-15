import React, { useState } from 'react';

const StickerPicker = ({ onStickerSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('emojis');

  const emojiStickers = [
    '😂', '🤣', '😭', '🥺', '😍', '🤩', '😎', '🤪', '😅', '🙃',
    '😊', '☺️', '😌', '😉', '😏', '🤔', '🤨', '😮', '😱', '🤯',
    '🔥', '💯', '✨', '⭐', '💫', '🌟', '🎉', '🎊', '💕', '💖',
    '👍', '👎', '👌', '✌️', '🤟', '🤝', '🙏', '💪', '🎵', '🎶'
  ];

  const reactionStickers = [
    { emoji: '🤝', label: 'Agree' },
    { emoji: '🤔', label: 'Thinking' },
    { emoji: '😂', label: 'LOL' },
    { emoji: '😱', label: 'OMG' },
    { emoji: '👍', label: 'Nice' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '💯', label: 'Facts' },
    { emoji: '🤯', label: 'Mind Blown' },
    { emoji: '😅', label: 'Awkward' },
    { emoji: '🙄', label: 'Eye Roll' },
    { emoji: '🤷', label: 'Shrug' }
  ];

  const pinoyStickers = [
    { emoji: '🍚', label: 'Kanin' },
    { emoji: '🏖️', label: 'Beach' },
    { emoji: '🌺', label: 'Sampaguita' },
    { emoji: '🥭', label: 'Mangga' },
    { emoji: '🏀', label: 'Basketball' },
    { emoji: '🎤', label: 'Karaoke' },
    { emoji: '⛪', label: 'Simbahan' },
    { emoji: '🌴', label: 'Coconut' },
    { emoji: '🍖', label: 'Lechon' },
    { emoji: '☀️', label: 'Araw' },
    { emoji: '🌊', label: 'Dagat' },
    { emoji: '🎊', label: 'Fiesta' }
  ];

  const handleStickerClick = (sticker) => {
    if (typeof sticker === 'string') {
      onStickerSelect(sticker, 'emoji');
    } else {
      onStickerSelect(sticker.emoji, 'sticker', sticker.label);
    }
    onClose();
  };

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-4 w-80 max-h-96 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Pick a Sticker</h3>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('emojis')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'emojis'
              ? 'bg-pastel-pink text-gray-800'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          Emojis
        </button>
        <button
          onClick={() => setActiveTab('reactions')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'reactions'
              ? 'bg-pastel-purple text-gray-800'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          Reactions
        </button>
        <button
          onClick={() => setActiveTab('pinoy')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTab === 'pinoy'
              ? 'bg-pastel-blue text-gray-800'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          Pinoy
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-60">
        {activeTab === 'emojis' && (
          <div className="grid grid-cols-8 gap-2">
            {emojiStickers.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleStickerClick(emoji)}
                className="text-2xl p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'reactions' && (
          <div className="grid grid-cols-3 gap-2">
            {reactionStickers.map((sticker, index) => (
              <button
                key={index}
                onClick={() => handleStickerClick(sticker)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                <span className="text-2xl mb-1">{sticker.emoji}</span>
                <span className="text-xs text-gray-300">{sticker.label}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'pinoy' && (
          <div className="grid grid-cols-3 gap-2">
            {pinoyStickers.map((sticker, index) => (
              <button
                key={index}
                onClick={() => handleStickerClick(sticker)}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-white/20 transition-colors"
              >
                <span className="text-2xl mb-1">{sticker.emoji}</span>
                <span className="text-xs text-gray-300">{sticker.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerPicker;