import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InterestSelector from '../components/InterestSelector';

const Home = () => {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showInterests, setShowInterests] = useState(false);

  const handleStartChat = () => {
    navigate('/chat', { state: { interests: selectedInterests } });
  };

  const handleInterestsChange = (interests) => {
    setSelectedInterests(interests);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pastel-pink rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-soft"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pastel-blue rounded-full mix-blend-multiply filter blur-xl opacity-10"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo and Title */}
          <div className="animate-fade-in">
            <div className="mb-6">
              <span className="text-6xl md:text-8xl animate-bounce-gentle">💬</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pastel-pink via-pastel-purple to-pastel-blue bg-clip-text text-transparent mb-4">
              TamVibe
            </h1>
            <p className="text-pastel-blue text-xl md:text-2xl mb-8 font-medium">
              Tambay • Vibe • Connect ✨
            </p>
          </div>

          {/* Description */}
          <div className="animate-slide-up mb-8">
            <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
              Tambay with awesome people who share your vibes! Pick your interests or create custom ones. 
              Anonymous, safe, and totally fun for making new friends worldwide! 🌍
            </p>
          </div>

          {/* Interest Selection Toggle */}
          <div className="mb-8">
            <button
              onClick={() => setShowInterests(!showInterests)}
              className="bg-gradient-to-r from-deep-purple to-deep-pink text-white font-semibold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg mb-4"
            >
              {showInterests ? '🎯 Hide Interests' : '🎯 Pick Your Interests'}
            </button>
            
            {showInterests && (
              <div className="mt-6">
                <InterestSelector 
                  onInterestsChange={handleInterestsChange}
                  selectedInterests={selectedInterests}
                />
              </div>
            )}
          </div>

          {/* Start Chat Button */}
          <div className="animate-slide-up">
            <button
              onClick={handleStartChat}
              className="bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-900 font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl active:scale-95 mb-6"
            >
              Start Tambay! 🚀
            </button>
            
            {selectedInterests.length > 0 && (
              <p className="text-pastel-mint text-sm animate-fade-in">
                Ready to match with {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}!
              </p>
            )}
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-pastel-pink font-semibold mb-2">100% Anonymous</h3>
              <p className="text-gray-300 text-sm">No sign-ups, no personal info needed</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-pastel-blue font-semibold mb-2">Instant Matching</h3>
              <p className="text-gray-300 text-sm">Find people with similar interests instantly</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🎊</div>
              <h3 className="text-pastel-purple font-semibold mb-2">Fun & Safe</h3>
              <p className="text-gray-300 text-sm">Moderated chats, extend or skip anytime</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-gray-400 text-sm">
            <p className="mb-2">Made with 💜 for awesome conversations</p>
            <div className="flex justify-center space-x-4 text-xs">
              <span>• 5min chat sessions</span>
              <span>• Extend option</span>
              <span>• Skip anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;