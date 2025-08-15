import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import StickerPicker from '../components/StickerPicker';
import MoodSelector from '../components/MoodSelector';
import IcebreakerGames from '../components/IcebreakerGames';
import MusicPlayer from '../components/MusicPlayer';
import CustomMusicPlayer from '../components/CustomMusicPlayer';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [status, setStatus] = useState('connecting');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [hasRequestedExtend, setHasRequestedExtend] = useState(false);
  const [userInterests, setUserInterests] = useState([]);
  const [userMood, setUserMood] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [chatTheme, setChatTheme] = useState('default');
  const [waitingMusicPlaying, setWaitingMusicPlaying] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001';

  useEffect(() => {
    const interests = location.state?.interests || [];
    setUserInterests(interests);
    
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit('findPartner', { interests });

    newSocket.on('searching', () => {
      setStatus('searching');
      addSystemMessage('Finding your tambay buddy...');
      // Auto-start waiting music if user has songs
      setWaitingMusicPlaying(true);
    });

    newSocket.on('partnerFound', () => {
      setStatus('connected');
      setHasRequestedExtend(false);
      // Stop waiting music when partner found
      setWaitingMusicPlaying(false);
    });

    newSocket.on('message', (data) => {
      addMessage(data.text, 'partner', data.type, data.id);
    });

    newSocket.on('reaction', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, reactions: { ...msg.reactions, [data.sender]: data.emoji } }
          : msg
      ));
    });

    newSocket.on('musicShare', (data) => {
      addSystemMessage(`🎵 Partner is listening to: ${data.track.name} by ${data.track.artist}`);
    });

    newSocket.on('systemMessage', (message) => {
      addSystemMessage(message);
    });

    newSocket.on('partnerDisconnected', () => {
      setStatus('disconnected');
      stopTimer();
      setShowExtendButton(false);
      setHasRequestedExtend(false);
      setWaitingMusicPlaying(false);
    });

    newSocket.on('chatEnded', () => {
      setStatus('ended');
      stopTimer();
      setShowExtendButton(false);
      setHasRequestedExtend(false);
      setWaitingMusicPlaying(false);
    });

    newSocket.on('chatExtended', () => {
      setShowExtendButton(false);
      setHasRequestedExtend(false);
      setTimeLeft(300);
    });

    newSocket.on('timerStarted', (duration) => {
      startTimer(duration / 1000);
    });

    return () => {
      newSocket.close();
      stopTimer();
    };
  }, [SERVER_URL]);

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setShowExtendButton(false);
    setHasRequestedExtend(false);
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 31 && prev > 1) {
          setShowExtendButton(true);
        }
        if (prev <= 1) {
          setShowExtendButton(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(0);
    setShowExtendButton(false);
  };

  const addMessage = (text, sender, type = 'text', messageId = null) => {
    const newMessage = {
      id: messageId || Date.now() + Math.random(),
      text,
      sender,
      type,
      timestamp: new Date().toLocaleTimeString(),
      reactions: {}
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addSystemMessage = (text) => {
    const systemMessage = {
      id: Date.now(),
      text,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = (customText = null, messageType = 'text') => {
    const messageText = customText || inputMessage.trim();
    if (messageText && socket && status === 'connected') {
      const messageId = Date.now() + Math.random();
      addMessage(messageText, 'user', messageType, messageId);
      socket.emit('message', { text: messageText, type: messageType, id: messageId });
      if (!customText) setInputMessage('');
    }
  };

  const sendReaction = (messageId, emoji) => {
    if (socket && status === 'connected') {
      socket.emit('reaction', { messageId, emoji });
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, reactions: { ...msg.reactions, user: emoji } }
          : msg
      ));
    }
  };

  const handleStickerSelect = (sticker, type, label) => {
    if (type === 'sticker' && label) {
      sendMessage(`${sticker} ${label}`, 'sticker');
    } else {
      sendMessage(sticker, 'emoji');
    }
  };

  const handleNext = () => {
    if (socket) {
      setMessages([]);
      setStatus('searching');
      stopTimer();
      setShowExtendButton(false);
      setHasRequestedExtend(false);
      setWaitingMusicPlaying(true); // Start waiting music again
      socket.emit('next');
    }
  };

  const handleExtendChat = () => {
    if (socket && !hasRequestedExtend) {
      socket.emit('extendRequest');
      setHasRequestedExtend(true);
      addSystemMessage('You requested to extend the chat. Waiting for partner...');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const chatThemes = {
    default: 'from-gray-900 via-purple-900 to-gray-900',
    sunset: 'from-orange-400 via-pink-500 to-purple-600',
    ocean: 'from-blue-400 via-blue-600 to-purple-700',
    forest: 'from-green-400 via-green-600 to-blue-700',
    galaxy: 'from-purple-900 via-blue-900 to-indigo-900',
    warm: 'from-yellow-400 via-orange-500 to-red-500',
    cool: 'from-teal-400 via-blue-500 to-indigo-600'
  };

  const getReactionEmojis = () => ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${chatThemes[chatTheme]} flex flex-col relative overflow-hidden`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-pastel-purple rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-soft"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pastel-pink rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-soft"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 p-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-pastel-blue hover:text-white transition-colors duration-200 group"
        >
          <span className="text-xl group-hover:transform group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium">Home</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {/* Music Player */}
          <div className="relative">
            {!showMusicPlayer ? (
              <button
                onClick={() => setShowMusicPlayer(true)}
                className="bg-pastel-purple text-gray-800 p-2 rounded-full hover:bg-opacity-80 transition-colors"
                title="Music Player"
              >
                🎵
              </button>
            ) : null}
          </div>

          {/* Mood Selector */}
          <MoodSelector 
            onMoodChange={setUserMood} 
            selectedMood={userMood}
          />

          {/* Theme Selector */}
          <div className="relative">
            <select
              value={chatTheme}
              onChange={(e) => setChatTheme(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-pastel-pink"
            >
              <option value="default">🌙 Default</option>
              <option value="sunset">🌅 Sunset</option>
              <option value="ocean">🌊 Ocean</option>
              <option value="forest">🌲 Forest</option>
              <option value="galaxy">🌌 Galaxy</option>
              <option value="warm">🔥 Warm</option>
              <option value="cool">❄️ Cool</option>
            </select>
          </div>

          {timeLeft > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="text-pastel-yellow font-mono text-lg font-bold">
                ⏰ {formatTime(timeLeft)}
              </div>
            </div>
          )}
          
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <div className={`w-3 h-3 rounded-full mr-2 animate-pulse ${
              status === 'connected' ? 'bg-pastel-mint' :
              status === 'searching' ? 'bg-pastel-yellow' :
              'bg-pastel-coral'
            }`}></div>
            <span className="text-white font-medium capitalize">
              {status === 'connected' ? '💫 Connected' :
               status === 'searching' ? '🔍 Finding tambay buddy...' :
               status === 'disconnected' ? '👋 Partner Left' :
               status === 'ended' ? '⏰ Chat Ended' :
               '🔄 Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && status === 'searching' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce-gentle">🔍</div>
              <p className="text-pastel-blue text-lg font-medium">Finding your tambay buddy...</p>
              {userInterests.length > 0 && (
                <p className="text-pastel-purple text-sm mt-2">
                  Looking for people who vibe with: {userInterests.map(interest => 
                    interest.charAt(0).toUpperCase() + interest.slice(1)
                  ).join(', ')}
                </p>
              )}
              <div className="mt-4 text-gray-300 text-sm">
                <p>🎵 Add your YouTube music while you wait</p>
                <p className="text-xs mt-1 opacity-70">
                  Click ➕ in bottom-right to add songs • Share with your tambay buddy
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex animate-slide-up ${
              message.sender === 'user' ? 'justify-end' :
              message.sender === 'system' ? 'justify-center' :
              'justify-start'
            }`}
          >
            <div className={`max-w-xs md:max-w-md group ${
              message.sender !== 'system' ? 'relative' : ''
            }`}>
              <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                message.sender === 'user' 
                  ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-900 font-medium'
                  : message.sender === 'system'
                  ? 'bg-white/20 backdrop-blur-sm text-pastel-blue text-sm border border-white/30'
                  : 'bg-white/30 backdrop-blur-sm text-white border border-white/20'
              } ${message.type === 'sticker' ? 'text-3xl text-center' : ''} ${
                message.type === 'game' ? 'border-l-4 border-pastel-yellow' : ''
              }`}>
                <div className={message.type === 'emoji' ? 'text-2xl' : ''}>
                  {message.text}
                </div>
                <div className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  {message.timestamp}
                </div>
              </div>

              {/* Reactions */}
              {message.reactions && Object.keys(message.reactions).length > 0 && (
                <div className="flex space-x-1 mt-1 justify-center">
                  {Object.entries(message.reactions).map(([sender, emoji]) => (
                    <span key={sender} className="text-lg bg-white/20 rounded-full px-2 py-1">
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              {/* Reaction Buttons */}
              {message.sender !== 'system' && status === 'connected' && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                    {getReactionEmojis().slice(0, 4).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => sendReaction(message.id, emoji)}
                        className="text-sm hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Extend Chat Button */}
      {showExtendButton && !hasRequestedExtend && status === 'connected' && (
        <div className="relative z-10 p-4 bg-gradient-to-r from-pastel-yellow to-pastel-peach border-t border-white/20 animate-slide-up">
          <button
            onClick={handleExtendChat}
            className="w-full bg-gradient-to-r from-pastel-yellow to-pastel-coral text-gray-900 font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            ⏰ Extend Chat (+5 min) ✨
          </button>
          <p className="text-center text-gray-800 text-xs mt-2">Both users must agree to continue!</p>
        </div>
      )}

      {/* Input Area */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20 p-4">
        {/* Feature Buttons Row */}
        {status === 'connected' && (
          <div className="flex justify-center space-x-3 mb-4">
            <button
              onClick={() => setShowStickerPicker(!showStickerPicker)}
              className="bg-pastel-yellow text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-opacity-80 transition-colors"
            >
              😊 Stickers
            </button>
            <button
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              className="bg-pastel-mint text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-opacity-80 transition-colors"
            >
              🎮 Games
            </button>
          </div>
        )}

        {/* Main Input Row */}
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={status === 'connected' ? '💬 Share your vibe...' : '⏳ Waiting for tambay buddy...'}
            disabled={status !== 'connected'}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-gray-300 px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-pastel-pink border border-white/30 disabled:opacity-50 transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            disabled={status !== 'connected' || !inputMessage.trim()}
            className="bg-gradient-to-r from-pastel-pink to-pastel-purple disabled:from-gray-600 disabled:to-gray-600 text-gray-900 disabled:text-gray-400 font-bold px-6 py-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
          >
            🚀
          </button>
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-pastel-coral to-pastel-peach text-gray-900 font-bold px-4 py-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            ⏭️ Next
          </button>
        </div>
        
        {status === 'connected' && (
          <div className="mt-3 text-center">
            <p className="text-pastel-blue text-xs">
              💡 Tip: Keep the good vibes flowing! Use games and stickers to break the ice!
            </p>
          </div>
        )}
      </div>

      {/* Floating Components */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {showStickerPicker && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <StickerPicker 
              onStickerSelect={handleStickerSelect}
              onClose={() => setShowStickerPicker(false)}
            />
          </div>
        )}

        {showIcebreakers && (
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <IcebreakerGames 
              onSendMessage={sendMessage}
              onClose={() => setShowIcebreakers(false)}
            />
          </div>
        )}

        {showMusicPlayer && (
          <div className="absolute top-20 right-4 pointer-events-auto">
            <MusicPlayer 
              onMusicShare={sendMessage}
              socket={socket}
              status={status}
              onClose={() => setShowMusicPlayer(false)}
            />
          </div>
        )}
      </div>

      {/* Custom Music Player - Available all the time */}
      <CustomMusicPlayer 
        autoPlay={status === 'searching' && waitingMusicPlaying}
        onToggle={setWaitingMusicPlaying}
        onMusicShare={sendMessage}
        status={status}
      />
    </div>
  );
};

export default Chat;