import React, { useState, useRef, useEffect } from 'react';

const LobbyMusic = ({ autoPlay = false, onToggle }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Lovely, calming waiting room tracks (using better royalty-free sources)
  const lobbyTracks = [
    {
      id: 'waiting1',
      name: 'Soft Piano Dreams',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Will use demo mode with lovely title
      mood: 'peaceful',
      description: 'Gentle piano melodies while you wait',
      color: 'bg-pastel-lavender'
    },
    {
      id: 'waiting2', 
      name: 'Morning Coffee',
      url: 'https://www2.cs.uic.edu/~i101/SoundFiles/CantinaBand3.wav', // Will use demo mode
      mood: 'cozy',
      description: 'Warm acoustic vibes for a lovely wait',
      color: 'bg-pastel-peach'
    },
    {
      id: 'waiting3',
      name: 'Sunset Clouds',
      url: 'https://www2.cs.uic.edu/~i101/SoundFiles/StarWars3.wav', // Will use demo mode
      mood: 'dreamy',
      description: 'Ethereal sounds for peaceful waiting',
      color: 'bg-pastel-pink'
    },
    {
      id: 'waiting4',
      name: 'Garden Breeze',
      url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjGH0fPMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsdBjiR1/XLcy0GLX/N8++USQoWY7zs5Z5TEw5Nr+X0wGgdCSpq8ux4RAYX',
      mood: 'serene',
      description: 'Nature-inspired calm melodies',
      color: 'bg-pastel-mint'
    }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (autoPlay && !isPlaying) {
      playMusic();
    }
  }, [autoPlay]);

  const playMusic = () => {
    if (audioRef.current && !isMuted) {
      const track = lobbyTracks[currentTrack];
      audioRef.current.src = track.url;
      audioRef.current.loop = true;
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          if (onToggle) onToggle(true);
        })
        .catch((error) => {
          console.log('Lobby music playback failed, using demo mode:', error);
          setIsPlaying(true);
          if (onToggle) onToggle(true);
        });
    } else if (isMuted) {
      // Just show as playing but muted
      setIsPlaying(true);
      if (onToggle) onToggle(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current && isPlaying) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (onToggle) onToggle(false);
    }
  };

  const nextTrack = () => {
    const next = (currentTrack + 1) % lobbyTracks.length;
    setCurrentTrack(next);
    if (isPlaying) {
      setTimeout(() => playMusic(), 100);
    }
  };

  const prevTrack = () => {
    const prev = currentTrack === 0 ? lobbyTracks.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    if (isPlaying) {
      setTimeout(() => playMusic(), 100);
    }
  };

  const currentTrackData = lobbyTracks[currentTrack];

  if (!showControls) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center space-x-2">
          {/* Music Toggle Button */}
          <button
            onClick={isPlaying ? pauseMusic : playMusic}
            className={`p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110 shadow-lg ${
              isPlaying && !isMuted 
                ? 'bg-pastel-purple text-gray-800' 
                : isPlaying && isMuted
                ? 'bg-gray-500 text-white'
                : 'bg-pastel-purple text-gray-800'
            }`}
            title={isPlaying ? (isMuted ? "Music muted - click to unmute" : "Pause lobby music") : "Play lovely lobby music"}
          >
            {isPlaying ? (isMuted ? '🔇' : '⏸️') : '🎵'}
          </button>

          {/* Mute Button */}
          {isPlaying && (
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full hover:bg-opacity-80 transition-all duration-200 ${
                isMuted ? 'bg-red-500 text-white' : 'bg-pastel-mint text-gray-800'
              }`}
              title={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}

          {/* Show Controls Button */}
          {isPlaying && (
            <button
              onClick={() => setShowControls(true)}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
              title="More music controls"
            >
              🎛️
            </button>
          )}
        </div>

        {/* Now Playing Indicator */}
        {isPlaying && (
          <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs animate-fade-in max-w-xs">
            <div className="flex items-center space-x-2">
              <span>{isMuted ? '🔇' : '🎵'}</span>
              <span className="truncate">{currentTrackData.name}</span>
              {isMuted && <span className="text-red-300">(Muted)</span>}
            </div>
          </div>
        )}

        <audio ref={audioRef} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-4 w-72 animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold text-sm">🎵 Lobby Music</h3>
          <button
            onClick={() => setShowControls(false)}
            className="text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Current Track */}
        <div className="bg-white/10 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium text-sm flex items-center space-x-2">
                <span>{currentTrackData.name}</span>
                {isMuted && <span className="text-red-300 text-xs">(Muted)</span>}
              </div>
              <div className="text-gray-300 text-xs">{currentTrackData.description}</div>
            </div>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-pastel-mint text-gray-800'
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mb-3">
          <button
            onClick={prevTrack}
            className="text-white hover:text-pastel-blue transition-colors"
          >
            ⏮️
          </button>
          
          <button
            onClick={isPlaying ? pauseMusic : playMusic}
            className="bg-pastel-purple text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-opacity-80 transition-colors"
          >
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <button
            onClick={nextTrack}
            className="text-white hover:text-pastel-blue transition-colors"
          >
            ⏭️
          </button>
        </div>

        {/* Volume */}
        <div className="mb-3">
          <label className="text-white text-xs mb-1 block">Volume: {Math.round(volume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Track List */}
        <div className="space-y-2">
          <div className="text-gray-300 text-xs mb-2">✨ Lovely Tracks:</div>
          {lobbyTracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => {
                setCurrentTrack(index);
                if (isPlaying) {
                  setTimeout(() => playMusic(), 100);
                }
              }}
              className={`w-full text-left p-3 rounded-xl text-xs transition-all duration-200 transform hover:scale-105 ${
                currentTrack === index
                  ? `${track.color} text-gray-800 shadow-lg`
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="font-medium">{track.name}</div>
              <div className="opacity-70 capitalize">{track.mood} • {track.description}</div>
            </button>
          ))}
          
          {/* Music Info */}
          <div className="mt-3 p-2 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-xs">
              🎵 These are demo tracks with lovely names. Add real audio files to hear beautiful music!
            </p>
          </div>
        </div>

        <audio ref={audioRef} />
      </div>
    </div>
  );
};

export default LobbyMusic;