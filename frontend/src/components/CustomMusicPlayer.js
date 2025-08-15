import React, { useState, useRef, useEffect } from 'react';

const CustomMusicPlayer = ({ autoPlay = false, onToggle, onMusicShare, status = 'idle' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [customMusic, setCustomMusic] = useState([]);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const playerRef = useRef(null);

  // Default songs to get started
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

  // Extract YouTube video ID from URL
  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Add new song to playlist
  const addSong = () => {
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
        setShowAddMusic(false);
        
        // Share with partner that you added a song
        if (onMusicShare) {
          onMusicShare(`🎵 Added "${newSong.title}" to playlist`, 'music');
        }
      } else {
        alert('Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=...)');
      }
    }
  };

  // Remove song from playlist
  const removeSong = (id) => {
    setCustomMusic(prev => prev.filter(song => song.id !== id));
    if (currentTrack >= customMusic.length - 1) {
      setCurrentTrack(0);
    }
  };

  // Play current track
  const playMusic = () => {
    const track = allTracks[currentTrack];
    if (track && !track.isDefault) {
      setIsPlaying(true);
      if (onToggle) onToggle(true);
      
      // Create YouTube embed for audio
      if (playerRef.current && track.videoId) {
        playerRef.current.src = `https://www.youtube.com/embed/${track.videoId}?autoplay=1&loop=1&playlist=${track.videoId}`;
      }
      
      // Share with partner what you're playing
      if (onMusicShare) {
        onMusicShare(`🎵 Now playing: "${track.title}" 🎶`, 'music');
      }
    }
  };

  const pauseMusic = () => {
    setIsPlaying(false);
    if (onToggle) onToggle(false);
    if (playerRef.current) {
      playerRef.current.src = '';
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (playerRef.current) {
      playerRef.current.style.display = !isMuted ? 'none' : 'block';
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

  useEffect(() => {
    if (autoPlay && customMusic.length > 0 && !isPlaying && status === 'searching') {
      playMusic();
    }
    // Auto-stop music when partner is found
    if (status === 'connected' && isPlaying) {
      pauseMusic();
    }
  }, [autoPlay, customMusic, status]);

  const currentTrackData = allTracks[currentTrack];

  if (!showControls) {
    return (
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
        <div className="flex items-center space-x-2">
          {/* Music Toggle Button */}
          <button
            onClick={allTracks[currentTrack]?.isDefault ? () => setShowControls(true) : (isPlaying ? pauseMusic : playMusic)}
            className={`p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 transform hover:scale-110 shadow-lg backdrop-blur-sm border border-white/30 ${
              isPlaying && !isMuted 
                ? 'bg-gradient-to-r from-pastel-pink/70 to-pastel-purple/70 text-gray-800' 
                : isPlaying && isMuted
                ? 'bg-gray-500/70 text-white'
                : allTracks[currentTrack]?.isDefault
                ? 'bg-pastel-blue/70 text-gray-800'
                : 'bg-gradient-to-r from-pastel-pink/70 to-pastel-purple/70 text-gray-800'
            }`}
            title={
              allTracks[currentTrack]?.isDefault 
                ? status === 'searching' ? "Add music for waiting!" : "Add your YouTube music!" 
                : isPlaying 
                ? (isMuted ? "Music muted - click to unmute" : "Pause your music") 
                : status === 'searching' ? "Play music while waiting" : "Play your music"
            }
          >
            {allTracks[currentTrack]?.isDefault ? '➕' : isPlaying ? (isMuted ? '🔇' : '⏸️') : '🎵'}
          </button>

          {/* Mute Button */}
          {isPlaying && !allTracks[currentTrack]?.isDefault && (
            <button
              onClick={toggleMute}
              className={`p-2 rounded-full hover:bg-opacity-80 transition-all duration-200 backdrop-blur-sm border border-white/30 ${
                isMuted ? 'bg-red-500/70 text-white' : 'bg-pastel-mint/70 text-gray-800'
              }`}
              title={isMuted ? "Unmute music" : "Mute music"}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          )}

          {/* Show Controls Button */}
          <button
            onClick={() => setShowControls(true)}
            className={`backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors border border-white/30 ${
              status === 'searching' ? 'bg-pastel-yellow/30 animate-pulse' : 'bg-white/10'
            }`}
            title={status === 'searching' ? "Add waiting music!" : "Music controls & add songs"}
          >
            {status === 'searching' ? '🎵➕' : '🎛️'}
          </button>
        </div>

        {/* Now Playing Indicator */}
        {isPlaying && !allTracks[currentTrack]?.isDefault && (
          <div className={`mt-2 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs animate-fade-in max-w-xs border border-white/30 ${
            status === 'searching' ? 'bg-pastel-purple/30 border-pastel-pink/50' : 'bg-white/10'
          }`}>
            <div className="flex items-center space-x-2">
              <span>{isMuted ? '🔇' : '🎵'}</span>
              <span className="truncate">{currentTrackData.title}</span>
              {status === 'searching' && <span className="text-pastel-yellow">(Waiting)</span>}
              {isMuted && <span className="text-red-300">(Muted)</span>}
            </div>
          </div>
        )}

        {/* Waiting Message */}
        {status === 'searching' && customMusic.length === 0 && (
          <div className="mt-2 bg-pastel-yellow/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs animate-fade-in max-w-xs border border-pastel-yellow/50">
            <div className="flex items-center space-x-1">
              <span>⏳</span>
              <span>Add music for waiting!</span>
            </div>
          </div>
        )}

        {/* Hidden YouTube Player */}
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
      </div>
    );
  }

  return (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 p-4 w-80 max-h-96 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold text-sm">
            {status === 'searching' ? '⏳ Waiting Music' : '🎵 Your Music'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddMusic(!showAddMusic)}
              className={`px-3 py-1 rounded-full text-xs font-medium hover:bg-opacity-80 transition-colors ${
                status === 'searching' 
                  ? 'bg-pastel-yellow text-gray-800 animate-pulse' 
                  : 'bg-pastel-mint text-gray-800'
              }`}
            >
              ➕ {status === 'searching' ? 'Add Waiting Music' : 'Add Song'}
            </button>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Add Music Form */}
        {showAddMusic && (
          <div className="bg-white/10 rounded-xl p-3 mb-3 space-y-3">
            <h4 className="text-white text-sm font-medium">Add YouTube Music</h4>
            <input
              type="text"
              placeholder="Song title (e.g., Shape of You)"
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink border border-white/30"
            />
            <input
              type="text"
              placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
              value={newSongUrl}
              onChange={(e) => setNewSongUrl(e.target.value)}
              className="w-full bg-white/20 text-white placeholder-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pastel-pink border border-white/30"
            />
            <div className="flex space-x-2">
              <button
                onClick={addSong}
                className="flex-1 bg-pastel-purple text-gray-800 py-2 rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors"
              >
                Add Song
              </button>
              <button
                onClick={() => setShowAddMusic(false)}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Track */}
        {!allTracks[currentTrack]?.isDefault && (
          <div className="bg-white/10 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium text-sm flex items-center space-x-2">
                  <span>{currentTrackData.title}</span>
                  {isMuted && <span className="text-red-300 text-xs">(Muted)</span>}
                </div>
                <div className="text-gray-300 text-xs">{currentTrackData.artist}</div>
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
        )}

        {/* Controls */}
        {!allTracks[currentTrack]?.isDefault && (
          <div className="flex items-center justify-center space-x-4 mb-3">
            <button
              onClick={prevTrack}
              className="text-white hover:text-pastel-blue transition-colors"
            >
              ⏮️
            </button>
            
            <button
              onClick={isPlaying ? pauseMusic : playMusic}
              className="bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-800 px-4 py-2 rounded-full font-medium hover:bg-opacity-80 transition-colors"
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
        )}

        {/* Playlist */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          <div className="text-gray-300 text-xs mb-2">
            {customMusic.length > 0 ? '🎵 Your Playlist:' : '➕ Add your favorite YouTube music!'}
          </div>
          
          {allTracks.map((track, index) => (
            <div
              key={track.id}
              className={`flex items-center justify-between p-3 rounded-xl text-xs transition-all duration-200 ${
                currentTrack === index && !track.isDefault
                  ? 'bg-gradient-to-r from-pastel-pink to-pastel-purple text-gray-800 shadow-lg'
                  : track.isDefault
                  ? 'bg-white/10 text-gray-300 border-2 border-dashed border-pastel-blue'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div 
                className={`flex-1 cursor-pointer ${track.isDefault ? '' : 'hover:text-white'}`}
                onClick={() => {
                  if (!track.isDefault) {
                    setCurrentTrack(index);
                    if (isPlaying) {
                      setTimeout(() => playMusic(), 100);
                    }
                  }
                }}
              >
                <div className="font-medium">{track.title}</div>
                <div className="opacity-70">{track.artist}</div>
              </div>
              
              {!track.isDefault && (
                <button
                  onClick={() => removeSong(track.id)}
                  className="text-red-400 hover:text-red-300 ml-2"
                  title="Remove song"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          {customMusic.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-xs mb-2">
                🎵 Add your favorite songs from YouTube!
              </p>
              <p className="text-gray-500 text-xs">
                Perfect for waiting and sharing with your tambay buddy
              </p>
            </div>
          )}
        </div>

        {/* Hidden YouTube Player */}
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
      </div>
    </div>
  );
};

export default CustomMusicPlayer;