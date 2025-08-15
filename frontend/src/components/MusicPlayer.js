import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = ({ onMusicShare, socket, status, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const [showPlayer, setShowPlayer] = useState(false);
  const [musicMode, setMusicMode] = useState('ambient'); // ambient, shared, off
  const audioRef = useRef(null);

  // Free background music tracks (using actual working sources)
  const ambientTracks = [
    {
      id: 'lofi1',
      name: 'Chill Lo-fi Beats',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', 
      genre: 'Lo-fi',
      mood: 'chill',
      isWorking: false // Will show as demo mode
    },
    {
      id: 'rain',
      name: 'Rain Sounds',
      url: 'https://freesound.org/data/previews/316/316847_5123451-lq.mp3',
      genre: 'Nature', 
      mood: 'calm',
      isWorking: false // Most external audio needs CORS
    },
    {
      id: 'cafe',
      name: 'Coffee Shop Ambience',
      url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjGH0fPMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsdBjiR1/XLcy0GLX/N8++USQoWY7zs5Z5TEw5Nr+X0wGgdCSpq8ux4RAYX', // Silent audio data URI
      genre: 'Ambient',
      mood: 'focus',
      isWorking: true
    }
  ];

  // OPM and popular tracks for sharing (YouTube/Spotify integration would be ideal)
  const sharableTracks = [
    { id: 'opm1', name: 'Tadhana - Up Dharma Down', artist: 'OPM', mood: 'chill' },
    { id: 'opm2', name: 'Kathang Isip - Ben&Ben', artist: 'OPM', mood: 'romantic' },
    { id: 'kpop1', name: 'Dynamite - BTS', artist: 'K-Pop', mood: 'hyper' },
    { id: 'pop1', name: 'Good 4 U - Olivia Rodrigo', artist: 'Pop', mood: 'hyper' },
    { id: 'indie1', name: 'Heat Waves - Glass Animals', artist: 'Indie', mood: 'chill' }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playAmbient = (track) => {
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.loop = true;
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setCurrentTrack(track);
        })
        .catch((error) => {
          console.log('Audio playback failed:', error);
          // Show demo mode instead
          setCurrentTrack({ ...track, demo: true });
          setIsPlaying(true);
          
          // Simulate playing for demo purposes
          setTimeout(() => {
            if (onMusicShare) {
              onMusicShare(`🎵 Demo: Playing ${track.name} (${track.genre} vibes)`, 'music');
            }
          }, 500);
        });
    }
  };

  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const shareTrack = (track) => {
    if (onMusicShare && socket && status === 'connected') {
      onMusicShare(`🎵 Now playing: ${track.name} by ${track.artist}`, 'music');
      socket.emit('musicShare', {
        track: track,
        action: 'share'
      });
    }
  };

  const handleMusicModeChange = (mode) => {
    setMusicMode(mode);
    if (mode === 'off') {
      pauseMusic();
      setCurrentTrack(null);
    }
  };

  // Always show the player when component is rendered
  // The show/hide logic is handled by parent component

  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 p-4 w-80 max-h-96 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold flex items-center">
          🎵 Music Vibes
        </h3>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Music Mode Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => handleMusicModeChange('ambient')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            musicMode === 'ambient'
              ? 'bg-pastel-blue text-gray-800'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          🌙 Ambient
        </button>
        <button
          onClick={() => handleMusicModeChange('shared')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            musicMode === 'shared'
              ? 'bg-pastel-pink text-gray-800'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          🎧 Share Music
        </button>
        <button
          onClick={() => handleMusicModeChange('off')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            musicMode === 'off'
              ? 'bg-gray-500 text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
        >
          🔇 Off
        </button>
      </div>

      {/* Current Track Display */}
      {currentTrack && (
        <div className="bg-white/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium text-sm">
                {currentTrack.name}
                {currentTrack.demo && <span className="text-pastel-yellow text-xs ml-2">DEMO</span>}
              </div>
              <div className="text-gray-300 text-xs">
                {currentTrack.genre}
                {currentTrack.demo && ' • Simulated playback'}
              </div>
            </div>
            <button
              onClick={isPlaying ? pauseMusic : () => playAmbient(currentTrack)}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          </div>
        </div>
      )}

      {/* Volume Control */}
      <div className="mb-4">
        <label className="text-white text-sm mb-2 block">Volume: {Math.round(volume * 100)}%</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Content based on mode */}
      <div className="max-h-48 overflow-y-auto">
        {musicMode === 'ambient' && (
          <div className="space-y-2">
            <h4 className="text-pastel-blue text-sm font-medium mb-2">Ambient Sounds</h4>
            <p className="text-gray-400 text-xs mb-3">
              💡 Demo mode - To add real music, replace URLs in code with your audio files
            </p>
            {ambientTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => playAmbient(track)}
                className={`w-full text-left p-3 rounded-xl transition-colors ${
                  currentTrack?.id === track.id
                    ? 'bg-pastel-blue text-gray-800'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <div className="font-medium text-sm">
                  {track.name}
                  {!track.isWorking && <span className="text-pastel-yellow text-xs ml-2">DEMO</span>}
                </div>
                <div className="text-xs opacity-70">{track.genre} • {track.mood}</div>
              </button>
            ))}
            
            {/* Instructions for real audio */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-gray-300 text-xs mb-2">🎵 To add real music:</p>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• Add audio files to /public/audio/ folder</li>
                <li>• Update URLs in MusicPlayer.js</li>
                <li>• Use royalty-free music for legal use</li>
              </ul>
            </div>
          </div>
        )}

        {musicMode === 'shared' && (
          <div className="space-y-2">
            <h4 className="text-pastel-pink text-sm font-medium mb-2">Share with Tambay</h4>
            <p className="text-gray-300 text-xs mb-3">Share what you're vibing to!</p>
            {sharableTracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                <div>
                  <div className="text-white font-medium text-sm">{track.name}</div>
                  <div className="text-gray-300 text-xs">{track.artist} • {track.mood}</div>
                </div>
                <button
                  onClick={() => shareTrack(track)}
                  disabled={status !== 'connected'}
                  className="bg-pastel-pink text-gray-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-opacity-80 transition-colors disabled:opacity-50"
                >
                  Share
                </button>
              </div>
            ))}
            
            {/* Custom music share */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl">
              <p className="text-gray-300 text-xs mb-2">Share custom music:</p>
              <button
                onClick={() => {
                  const customSong = prompt("What song are you listening to?");
                  if (customSong && status === 'connected') {
                    onMusicShare(`🎵 I'm vibing to: ${customSong}`, 'music');
                  }
                }}
                disabled={status !== 'connected'}
                className="w-full bg-pastel-purple text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors disabled:opacity-50"
              >
                Share Custom Song 🎤
              </button>
            </div>
          </div>
        )}

        {musicMode === 'off' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔇</div>
            <p className="text-gray-300 text-sm">Music is off</p>
            <p className="text-gray-400 text-xs">Choose ambient or shared mode to start!</p>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer;