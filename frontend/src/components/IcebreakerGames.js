import React, { useState } from 'react';

const IcebreakerGames = ({ onSendMessage, onClose }) => {
  const [activeGame, setActiveGame] = useState(null);

  const games = {
    wouldYouRather: {
      title: 'Would You Rather?',
      emoji: '🤔',
      questions: [
        'Would you rather have the ability to fly or be invisible?',
        'Would you rather live in the past or the future?',
        'Would you rather be famous or rich?',
        'Would you rather have unlimited pizza or unlimited ice cream?',
        'Would you rather speak all languages or play all instruments?',
        'Would you rather live in a treehouse or underwater?',
        'Would you rather have super strength or super speed?',
        'Would you rather never use social media again or never watch TV again?',
        'Would you rather always be 10 minutes late or 20 minutes early?',
        'Would you rather be able to talk to animals or read minds?'
      ]
    },
    twoTruths: {
      title: 'Two Truths, One Lie',
      emoji: '🕵️',
      description: 'Share 3 statements about yourself - 2 true, 1 false. Your partner has to guess the lie!',
      examples: [
        'I once ate 50 chicken nuggets in one sitting',
        'I can speak 4 languages fluently',
        'I have never broken a bone',
        'I met a celebrity at a coffee shop',
        'I can solve a Rubik\'s cube in under 2 minutes',
        'I have been to 15 different countries',
        'I once won a hot dog eating contest',
        'I can play 3 musical instruments'
      ]
    },
    quickFire: {
      title: 'Quick Fire Questions',
      emoji: '⚡',
      questions: [
        'What\'s your dream vacation destination?',
        'Coffee or tea?',
        'What\'s your favorite movie genre?',
        'Beach or mountains?',
        'What\'s your biggest fear?',
        'Sweet or salty snacks?',
        'What superpower would you choose?',
        'Morning person or night owl?',
        'What\'s your favorite season?',
        'Dogs or cats?',
        'What\'s your go-to karaoke song?',
        'Favorite Filipino food?',
        'What makes you laugh the most?',
        'Favorite subject in school?',
        'What\'s your hidden talent?'
      ]
    },
    pinoyEdition: {
      title: 'Pinoy Edition',
      emoji: '🇵🇭',
      questions: [
        'Jollibee or McDonald\'s?',
        'Adobo or Sinigang?',
        'Beach in Palawan or Baguio mountains?',
        'Jeepney or tricycle?',
        'Manny Pacquiao or Jose Rizal as your dinner guest?',
        'Rice or bread with every meal?',
        'Tagalog movies or Korean dramas?',
        'Halo-halo or mais con yelo?',
        'Basketball or volleyball?',
        'Lechon or crispy pata?',
        'OPM or foreign music?',
        'Mall or beach for a date?',
        'Text or call?',
        'Pancit canton or lucky me?',
        'Christmas or New Year celebration?'
      ]
    },
    storytelling: {
      title: 'Story Starters',
      emoji: '📖',
      prompts: [
        'Tell me about the weirdest dream you\'ve ever had',
        'Share your most embarrassing moment',
        'What\'s the best compliment you\'ve ever received?',
        'Describe your perfect day',
        'Tell me about a time you helped someone',
        'What\'s the most adventurous thing you\'ve done?',
        'Share a childhood memory that makes you smile',
        'What\'s something you\'re really proud of?',
        'Tell me about your biggest accomplishment',
        'Share a funny family story'
      ]
    }
  };

  const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const handleGameSelect = (gameKey) => {
    setActiveGame(gameKey);
  };

  const handleSendQuestion = (question) => {
    onSendMessage(`🎮 ${games[activeGame].title}: ${question}`, 'game');
    onClose();
  };

  const handleSendPrompt = (prompt) => {
    onSendMessage(`📖 Story Time: ${prompt}`, 'game');
    onClose();
  };

  if (activeGame) {
    const game = games[activeGame];
    return (
      <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-6 w-96 max-h-96 overflow-hidden animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{game.emoji}</span>
            <h3 className="text-white font-semibold">{game.title}</h3>
          </div>
          <button
            onClick={() => setActiveGame(null)}
            className="text-gray-300 hover:text-white text-xl"
          >
            ←
          </button>
        </div>

        {game.description && (
          <p className="text-gray-300 text-sm mb-4">{game.description}</p>
        )}

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {game.questions && game.questions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSendQuestion(question)}
              className="w-full text-left p-3 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20 transition-colors"
            >
              {question}
            </button>
          ))}

          {game.prompts && game.prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSendPrompt(prompt)}
              className="w-full text-left p-3 bg-white/10 rounded-xl text-white text-sm hover:bg-white/20 transition-colors"
            >
              {prompt}
            </button>
          ))}

          {game.examples && (
            <div>
              <p className="text-pastel-blue text-sm mb-3">Example statements:</p>
              {game.examples.map((example, index) => (
                <div key={index} className="p-2 bg-white/5 rounded-lg text-gray-300 text-xs mb-2">
                  "{example}"
                </div>
              ))}
              <button
                onClick={() => handleSendQuestion('Let\'s play Two Truths and One Lie! I\'ll start with 3 statements about myself.')}
                className="w-full p-3 bg-pastel-purple text-gray-800 rounded-xl font-medium hover:bg-opacity-80 transition-colors"
              >
                Start the Game!
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => {
              if (game.questions) {
                handleSendQuestion(getRandomItem(game.questions));
              } else if (game.prompts) {
                handleSendPrompt(getRandomItem(game.prompts));
              }
            }}
            className="flex-1 bg-pastel-pink text-gray-800 py-2 px-4 rounded-full font-medium hover:bg-opacity-80 transition-colors"
          >
            🎲 Random
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white py-2 px-4 rounded-full font-medium hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-6 w-80 animate-slide-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold">Icebreaker Games 🎮</h3>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(games).map(([key, game]) => (
          <button
            key={key}
            onClick={() => handleGameSelect(key)}
            className="w-full flex items-center space-x-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-left"
          >
            <span className="text-2xl">{game.emoji}</span>
            <div>
              <div className="text-white font-medium">{game.title}</div>
              <div className="text-gray-300 text-sm">
                {game.questions ? `${game.questions.length} questions` : 
                 game.prompts ? `${game.prompts.length} prompts` : 'Interactive game'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default IcebreakerGames;