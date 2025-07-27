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

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  bpm: number;
  duration: number;
  coverUrl?: string;
}

interface MusicPlayerProps {
  targetBPM: number;
  currentTrack: Track | null;
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
        setCurrentTime(prev => Math.min(prev + 1, currentTrack.duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBPMMatchStatus = () => {
    if (!currentTrack) return { status: 'neutral', text: 'No track' };
    
    const difference = Math.abs(currentTrack.bpm - targetBPM);
    if (difference <= 3) return { status: 'perfect', text: 'Perfect sync!' };
    if (difference <= 8) return { status: 'good', text: 'Good sync' };
    return { status: 'poor', text: 'Sync needed' };
  };

  const bpmMatch = getBPMMatchStatus();

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

  return (
    <Card className="bg-gradient-card border-border/50 shadow-elevated">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Track Info & Cover */}
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-lg flex-shrink-0 animate-beat-sync">
              {currentTrack.coverUrl ? (
                <img 
                  src={currentTrack.coverUrl} 
                  alt={currentTrack.album}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{currentTrack.title}</h3>
              <p className="text-muted-foreground truncate">{currentTrack.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={bpmMatch.status === 'perfect' ? 'default' : 'outline'}
                  className={`
                    ${bpmMatch.status === 'perfect' && 'bg-accent text-accent-foreground animate-pulse-glow'}
                    ${bpmMatch.status === 'good' && 'border-primary text-primary'}
                    ${bpmMatch.status === 'poor' && 'border-destructive text-destructive'}
                  `}
                >
                  {currentTrack.bpm} BPM • {bpmMatch.text}
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
              value={(currentTime / currentTrack.duration) * 100} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
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
                  <p className="text-sm font-medium">Sync Status</p>
                  <p className="text-xs text-muted-foreground">
                    Target: {targetBPM} BPM
                  </p>
                </div>
                <div className={`
                  w-3 h-3 rounded-full animate-pulse
                  ${bpmMatch.status === 'perfect' && 'bg-accent'}
                  ${bpmMatch.status === 'good' && 'bg-primary'}
                  ${bpmMatch.status === 'poor' && 'bg-destructive'}
                `} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};