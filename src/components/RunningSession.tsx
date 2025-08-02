import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { 
  Play, 
  Pause, 
  Square, 
  Timer, 
  MapPin, 
  Activity,
  SkipForward,
  Volume2,
  Settings
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
}

interface RunningSessionProps {
  targetBPM: number;
  onEndSession: () => void;
}

export const RunningSession = ({ targetBPM, onEndSession }: RunningSessionProps) => {
  const {
    currentTrack,
    isPlaying: isMusicPlaying,
    currentTime: musicTime,
    togglePlayPause,
    playNext,
    startPlaylistForBPM
  } = useMusicPlayer();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [currentBPM, setCurrentBPM] = useState(targetBPM);
  
  // Calculate pace based on target BPM and simulate realistic running
  const targetPaceMinutes = targetBPM > 0 ? (180 - targetBPM * 0.5) / 60 : 8; // Convert BPM to realistic pace
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        
        // Calculate distance based on target pace with slight variation
        const paceVariation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
        const currentPaceSeconds = targetPaceMinutes * 60 * paceVariation;
        const milesPerSecond = 1 / currentPaceSeconds;
        setDistance(prev => prev + milesPerSecond);
        
        // Simulate slight BPM variation around target
        setCurrentBPM(prev => {
          const variance = (Math.random() - 0.5) * 6; // ±3 BPM variation
          return Math.max(120, Math.min(200, Math.round(targetBPM + variance)));
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, targetBPM, targetPaceMinutes]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (miles: number) => {
    return miles.toFixed(2);
  };

  const calculateCurrentPace = () => {
    if (distance === 0 || elapsedTime === 0) return "0:00";
    const paceInSeconds = (elapsedTime / 60) / distance * 60; // seconds per mile
    const mins = Math.floor(paceInSeconds / 60);
    const secs = Math.round(paceInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBPMSyncStatus = () => {
    const difference = Math.abs(currentBPM - targetBPM);
    if (difference <= 3) return { status: 'perfect', text: 'Perfect sync!', color: 'accent' };
    if (difference <= 8) return { status: 'good', text: 'Good sync', color: 'primary' };
    return { status: 'poor', text: 'Adjust pace', color: 'destructive' };
  };

  const syncStatus = getBPMSyncStatus();

  const startRun = async () => {
    setIsRunning(true);
    setIsPaused(false);
    // Start music that matches the target BPM
    await startPlaylistForBPM(targetBPM);
  };

  const pauseRun = () => {
    setIsPaused(!isPaused);
  };

  const stopRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    onEndSession();
  };

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Running Session</h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Stats */}
        <Card className="bg-gradient-card border-border/50 shadow-elevated">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="text-2xl font-bold">{formatDistance(distance)}</p>
                <p className="text-xs text-muted-foreground">miles</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pace</p>
                <p className="text-2xl font-bold">{calculateCurrentPace()}</p>
                <p className="text-xs text-muted-foreground">min/mile</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BPM Sync Status */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="font-semibold">BPM Sync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current: {currentBPM} • Target: {targetBPM}
                </p>
              </div>
              <Badge 
                className={`
                  animate-pulse-glow
                  ${syncStatus.color === 'accent' && 'bg-accent text-accent-foreground'}
                  ${syncStatus.color === 'primary' && 'bg-primary text-primary-foreground'}
                  ${syncStatus.color === 'destructive' && 'bg-destructive text-destructive-foreground'}
                `}
              >
                {syncStatus.text}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Out of Sync</span>
                <span>Perfect Sync</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - Math.abs(currentBPM - targetBPM) * 5)} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Current Track */}
        {currentTrack && (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center animate-beat-sync">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{currentTrack.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{currentTrack.bpm} BPM</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(musicTime / 60)}:{Math.floor(musicTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={togglePlayPause}>
                    {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={playNext}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {currentTrack && (
                <div className="mt-3">
                  <Progress 
                    value={(musicTime / currentTrack.duration) * 100} 
                    className="h-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Control Buttons */}
        <div className="space-y-3">
          {!isRunning ? (
            <Button 
              onClick={startRun}
              className="w-full h-16 text-lg"
              variant="hero"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Running
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={pauseRun}
                className="h-16 text-lg"
                variant={isPaused ? "pulse" : "secondary"}
              >
                {isPaused ? (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-6 h-6 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              <Button 
                onClick={stopRun}
                className="h-16 text-lg"
                variant="destructive"
              >
                <Square className="w-6 h-6 mr-2" />
                Stop
              </Button>
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-3 gap-2 pt-4">
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Timer className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Avg Pace</p>
            <p className="text-sm font-semibold">{calculateCurrentPace()}</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <MapPin className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Elevation</p>
            <p className="text-sm font-semibold">+24 ft</p>
          </div>
          <div className="text-center p-3 bg-secondary/30 rounded-lg">
            <Activity className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Cadence</p>
            <p className="text-sm font-semibold">{currentBPM}</p>
          </div>
        </div>
      </div>
    </div>
  );
};