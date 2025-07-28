import { useState, useRef, useEffect } from "react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  bpm: number;
  duration: number;
  audioUrl?: string;
  coverUrl?: string;
}

export const useMusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  // Sample tracks with demo audio URLs (using royalty-free music)
  const sampleTracks: Track[] = [
    {
      id: "1",
      title: "Running Beat",
      artist: "Fitness Music",
      album: "Workout Mix",
      bpm: 140,
      duration: 180,
      audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // placeholder
    },
    {
      id: "2", 
      title: "High Energy",
      artist: "Pump Music",
      album: "Cardio Hits",
      bpm: 150,
      duration: 210,
      audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // placeholder
    },
    {
      id: "3",
      title: "Steady Pace",
      artist: "Running Music",
      album: "Marathon Mix",
      bpm: 135,
      duration: 195,
      audioUrl: "https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav", // placeholder
    }
  ];

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio();
    
    // Set up event listeners
    const audio = audioRef.current;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleLoadedData = () => console.log('Audio loaded');
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Auto-play next track
      playNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const loadTrack = (track: Track) => {
    if (audioRef.current && track.audioUrl) {
      audioRef.current.src = track.audioUrl;
      setCurrentTrack(track);
      setCurrentTime(0);
    }
  };

  const play = async () => {
    if (audioRef.current && currentTrack) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing audio:', error);
        // If no audio URL, simulate playback for demo
        setIsPlaying(true);
      }
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  };

  const playNext = () => {
    if (!currentTrack) return;
    
    const currentIndex = sampleTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % sampleTracks.length;
    const nextTrack = sampleTracks[nextIndex];
    
    loadTrack(nextTrack);
    if (isPlaying) {
      play();
    }
  };

  const playPrevious = () => {
    if (!currentTrack) return;
    
    const currentIndex = sampleTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? sampleTracks.length - 1 : currentIndex - 1;
    const prevTrack = sampleTracks[prevIndex];
    
    loadTrack(prevTrack);
    if (isPlaying) {
      play();
    }
  };

  const findBestTrackForBPM = (targetBPM: number): Track => {
    // Find track with BPM closest to target
    return sampleTracks.reduce((best, track) => {
      const currentDiff = Math.abs(track.bpm - targetBPM);
      const bestDiff = Math.abs(best.bpm - targetBPM);
      return currentDiff < bestDiff ? track : best;
    });
  };

  const startPlaylistForBPM = async (targetBPM: number) => {
    const bestTrack = findBestTrackForBPM(targetBPM);
    loadTrack(bestTrack);
    await play();
  };

  return {
    currentTrack,
    isPlaying,
    currentTime,
    volume,
    setVolume,
    togglePlayPause,
    playNext,
    playPrevious,
    loadTrack,
    startPlaylistForBPM,
    sampleTracks,
  };
};