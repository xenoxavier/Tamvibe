import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import StickerPicker from '../components/StickerPicker';
import ThemeSelector from '../components/ThemeSelector';
import IcebreakerGames from '../components/IcebreakerGames';
import MusicPlayer from '../components/MusicPlayer';

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
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [showMusicDropdown, setShowMusicDropdown] = useState(false);
  const [chatTheme, setChatTheme] = useState('default');
  const [waitingMusicPlaying, setWaitingMusicPlaying] = useState(false);
  const [customMusic, setCustomMusic] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');

  const handleThemeChange = (theme) => {
    setChatTheme(theme);
  };

  // Music player functions
  const defaultTracks = [
    {
      id: 'default1',
      title: 'Add Your First Song!',
      artist: 'Click + to add YouTube music',
      url: '',
      isDefault: true
    }
  ];

  const allTracks = customMusic.length > 0 ? customMusic : defaultTracks;

  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const playMusic = () => {
    const track = allTracks[currentTrack];
    if (track && !track.isDefault) {
      setIsPlaying(true);
      
      if (playerRef.current && track.videoId) {
        playerRef.current.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&loop=1&playlist=${track.videoId}`;
      }
      
      if (sendMessage) {
        sendMessage(`🎵 Now playing: "${track.title}" 🎶`, 'music');
      }
    }
  };

  const pauseMusic = () => {
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.src = '';
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % allTracks.length;
    setCurrentTrack(next);
    if (isPlaying) {
      setTimeout(() => playMusic(), 500);
    }
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? allTracks.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    if (isPlaying) {
      setTimeout(() => playMusic(), 500);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (playerRef.current) {
      playerRef.current.style.display = !isMuted ? 'none' : 'block';
    }
  };

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const playerRef = useRef(null);

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

    newSocket.on('timerUpdate', (seconds) => {
      setTimeLeft(seconds);
      // Show extend button when 30 seconds or less remain
      if (seconds <= 30 && seconds > 0 && !hasRequestedExtend) {
        setShowExtendButton(true);
      } else {
        setShowExtendButton(false);
      }
    });

    return () => {
      newSocket.close();
      stopTimer();
    };
  }, [SERVER_URL]);

  // Timer is now controlled by server via 'timerUpdate' events

  const stopTimer = () => {
    // Timer cleanup if needed (server controls main timer now)
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
    default: 'linear-gradient(135deg, #e879f9, #f9a8d4, #bfdbfe)',
    sunset: 'linear-gradient(135deg, #fed7aa, #fecaca, #f9a8d4)',
    ocean: 'linear-gradient(135deg, #bfdbfe, #a7f3d0, #e0e7ff)',
    forest: 'linear-gradient(135deg, #bbf7d0, #fef3c7, #fed7aa)',
    galaxy: 'linear-gradient(135deg, #ddd6fe, #e0e7ff, #bfdbfe)',
    warm: 'linear-gradient(135deg, #fef3c7, #fed7aa, #fecaca)',
    cool: 'linear-gradient(135deg, #a7f3d0, #bfdbfe, #ddd6fe)'
  };

  const getReactionEmojis = () => ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ 
        background: chatThemes[chatTheme] || chatThemes.default 
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-pastel-lavender rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pastel-mint rounded-full mix-blend-soft-light filter blur-xl opacity-30 animate-pulse-soft"></div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-pastel-peach rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-pulse-soft"></div>
      </div>

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/30 p-4 flex justify-between items-center shadow-lg">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-800 hover:text-gray-900 transition-colors duration-200 group"
        >
          <span className="text-xl group-hover:transform group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium">Home</span>
        </button>
        
        <div className="flex items-center space-x-3">
          {/* Music Player Button */}
          <div className="relative">
            <button
              onClick={() => setShowMusicDropdown(!showMusicDropdown)}
              className={`flex items-center space-x-2 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 transition-all duration-200 hover:bg-white/30 ${
                showMusicDropdown ? 'bg-white/30' : isPlaying ? 'bg-green-500/30 border-green-400' : 'bg-white/20'
              }`}
              title={isPlaying ? `Playing: ${allTracks[currentTrack]?.title || 'Music'}` : "YouTube Music Player"}
            >
              <span className="text-lg">
                {isPlaying ? (isMuted ? '🔇' : '🎵') : '🎵'}
              </span>
              <span className={`text-sm font-medium ${isPlaying ? 'text-green-800' : 'text-gray-800'}`}>
                {isPlaying ? 'Now Playing' : 'Add Music'}
              </span>
              {isPlaying && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevTrack();
                    }}
                    className="text-green-700 hover:text-green-900 text-xs"
                    title="Previous track"
                  >
                    ⏮️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      isPlaying ? pauseMusic() : playMusic();
                    }}
                    className="text-green-700 hover:text-green-900 text-xs"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextTrack();
                    }}
                    className="text-green-700 hover:text-green-900 text-xs"
                    title="Next track"
                  >
                    ⏭️
                  </button>
                </div>
              )}
            </button>

            {/* Music Dropdown */}
            {showMusicDropdown && (
              <div className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-white p-4 z-50 w-80 shadow-2xl max-h-96 overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-gray-800 font-semibold text-sm">
                    🎵 YouTube Music Player
                  </h3>
                  <div className="flex items-center space-x-2">
                    {isPlaying && (
                      <div className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">
                        ♪ Playing
                      </div>
                    )}
                    <button
                      onClick={() => setShowMusicDropdown(false)}
                      className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
                      title="Minimize player (music continues playing)"
                    >
                      ➖
                    </button>
                  </div>
                </div>

                {/* Current Track & Controls */}
                {!allTracks[currentTrack]?.isDefault && (
                  <div className="bg-gray-100 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-gray-800 font-medium text-sm flex items-center space-x-2">
                          <span>{allTracks[currentTrack].title}</span>
                          {isMuted && <span className="text-red-500 text-xs">(Muted)</span>}
                        </div>
                        <div className="text-gray-600 text-xs">{allTracks[currentTrack].artist}</div>
                      </div>
                      <button
                        onClick={toggleMute}
                        className={`p-2 rounded-lg transition-colors ${
                          isMuted ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                        }`}
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? '🔇' : '🔊'}
                      </button>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={prevTrack}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        ⏮️
                      </button>
                      
                      <button
                        onClick={isPlaying ? pauseMusic : playMusic}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-600 transition-colors"
                      >
                        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                      </button>
                      
                      <button
                        onClick={nextTrack}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        ⏭️
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Music Form */}
                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    placeholder="Song title (e.g., Shape of You)"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border"
                  />
                  <input
                    type="text"
                    placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                    value={newSongUrl}
                    onChange={(e) => setNewSongUrl(e.target.value)}
                    className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border"
                  />
                  <button
                    onClick={() => {
                      if (newSongTitle.trim() && newSongUrl.trim()) {
                        const videoId = getYouTubeID(newSongUrl);
                        if (videoId) {
                          const newSong = {
                            id: Date.now(),
                            title: newSongTitle.trim(),
                            artist: 'Added by you',
                            url: newSongUrl.trim(),
                            videoId: videoId,
                            isDefault: false
                          };
                          setCustomMusic(prev => [...prev, newSong]);
                          setNewSongTitle('');
                          setNewSongUrl('');
                          
                          // Share with partner
                          if (sendMessage) {
                            sendMessage(`🎵 Added "${newSong.title}" to playlist`, 'music');
                          }
                        } else {
                          alert('Please enter a valid YouTube URL');
                        }
                      }
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Add Song
                  </button>
                </div>

                {/* Playlist */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="text-gray-700 text-xs mb-2">
                    {customMusic.length > 0 ? '🎵 Your Playlist:' : '➕ Add your favorite YouTube music!'}
                  </div>
                  
                  {allTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                        currentTrack === index && !track.isDefault
                          ? 'bg-blue-500 text-white shadow-lg'
                          : track.isDefault
                          ? 'bg-gray-200 text-gray-500 border-2 border-dashed border-gray-400'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        if (!track.isDefault) {
                          setCurrentTrack(index);
                          if (isPlaying) {
                            setTimeout(() => playMusic(), 100);
                          }
                        }
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{track.title}</div>
                        <div className="opacity-70">{track.artist}</div>
                      </div>
                      
                      {!track.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomMusic(prev => prev.filter(s => s.id !== track.id));
                            if (currentTrack >= customMusic.length - 1) {
                              setCurrentTrack(0);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Remove song"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {customMusic.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-xs mb-1">
                        🎵 Add your favorite songs from YouTube!
                      </p>
                      <p className="text-gray-400 text-xs">
                        Perfect for waiting and sharing with your tambay buddy
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Theme Selector */}
          <ThemeSelector 
            onThemeChange={handleThemeChange} 
            selectedTheme={chatTheme}
          />

          {timeLeft > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <div className="text-gray-800 font-mono text-lg font-bold">
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
            <span className="text-gray-800 font-medium capitalize">
              {status === 'connected' ? '💫 Connected' :
               status === 'searching' ? '🔍 Finding tambay buddy...' :
               status === 'disconnected' ? '👋 Partner Left' :
               status === 'ended' ? '⏰ Chat Ended' :
               '🔄 Connecting...'}
            </span>
          </div>

          {/* Disconnect Button - Only show when connected */}
          {status === 'connected' && (
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm rounded-full px-4 py-2 border border-red-300 transition-all duration-200 transform hover:scale-105"
              title="Disconnect and find new partner"
            >
              <span className="text-white text-sm font-medium">
                ⏹️ Disconnect
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Hidden YouTube Player - Outside dropdown so it persists when dropdown closes */}
      <iframe
        ref={playerRef}
        style={{ 
          display: isMuted || !isPlaying ? 'none' : 'block',
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px'
        }}
        allow="autoplay"
      />

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 pt-24 space-y-4">
        {messages.length === 0 && status === 'searching' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="text-6xl mb-4 animate-bounce-gentle">🔍</div>
              <p className="text-gray-800 text-lg font-medium">Finding your tambay buddy...</p>
              {userInterests.length > 0 && (
                <p className="text-gray-700 text-sm mt-2">
                  Looking for people who vibe with: {userInterests.map(interest => 
                    interest.charAt(0).toUpperCase() + interest.slice(1)
                  ).join(', ')}
                </p>
              )}
              <div className="mt-4 text-gray-600 text-sm">
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
                  ? 'bg-white/20 backdrop-blur-sm text-gray-800 text-sm border border-white/30'
                  : 'bg-white/30 backdrop-blur-sm text-gray-800 border border-white/20'
              } ${message.type === 'sticker' ? 'text-3xl text-center' : ''} ${
                message.type === 'game' ? 'border-l-4 border-pastel-yellow' : ''
              }`}>
                <div className={message.type === 'emoji' ? 'text-2xl' : ''}>
                  {message.text}
                </div>
                <div className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-gray-700' : 'text-gray-600'
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
        </div>
        
        {status === 'connected' && (
          <div className="mt-3 text-center">
            <p className="text-gray-700 text-xs">
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
          <div className="absolute top-16 left-4 pointer-events-auto">
            <MusicPlayer 
              onMusicShare={sendMessage}
              socket={socket}
              status={status}
              onClose={() => setShowMusicPlayer(false)}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;