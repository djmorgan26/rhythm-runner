import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Heart,
  MoreVertical,
  Activity
} from "lucide-react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url?: string;
}

interface MusicPlayerProps {
  targetBPM: number;
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const MusicPlayer = ({ 
  targetBPM, 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious 
}: MusicPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, Math.floor(currentTrack.duration_ms / 1000)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (ms: number) => {
    return formatTime(Math.floor(ms / 1000));
  };

  if (!currentTrack) {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Activity className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No track selected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set your pace to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  const trackDurationInSeconds = Math.floor(currentTrack.duration_ms / 1000);

  return (
    <Card className="bg-gradient-card border-border/50 shadow-elevated">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Track Info & Cover */}
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-lg flex-shrink-0 animate-beat-sync overflow-hidden">
              {currentTrack.album.images[0] ? (
                <img 
                  src={currentTrack.album.images[0].url} 
                  alt={currentTrack.album.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{currentTrack.name}</h3>
              <p className="text-muted-foreground truncate">{currentTrack.artists[0]?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-primary/60 text-primary/80">
                  Spotify Track
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-destructive' : ''}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={(currentTime / trackDurationInSeconds) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatDuration(currentTrack.duration_ms)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm">
              <Volume2 className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onPrevious}
              >
                <SkipBack className="w-5 h-5" />
              </Button>
              
              <Button 
                variant="pulse"
                size="lg"
                onClick={onPlayPause}
                className="w-14 h-14 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onNext}
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="w-8" /> {/* Spacer for symmetry */}
          </div>

          {/* BPM Sync Indicator */}
          {targetBPM > 0 && (
            <div className="bg-secondary/50 rounded-lg p-3 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Target BPM</p>
                  <p className="text-xs text-muted-foreground">
                    Running at {targetBPM} BPM
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full animate-pulse bg-primary" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};