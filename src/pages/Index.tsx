import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { PaceInput } from "@/components/PaceInput";
import { MusicPlayer } from "@/components/MusicPlayer";
import { PlaylistGenerator } from "@/components/PlaylistGenerator";
import { RunningSession } from "@/components/RunningSession";
import { 
  Activity, 
  Music, 
  Users, 
  BarChart3,
  Zap,
  Heart,
  LogOut
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

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'setup' | 'session'>('setup');
  const [targetBPM, setTargetBPM] = useState(0);
  const [currentPace, setCurrentPace] = useState("");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handlePaceChange = (bpm: number, pace: string) => {
    setTargetBPM(bpm);
    setCurrentPace(pace);
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
  };

  const handlePlaylistCreate = (tracks: Track[]) => {
    setPlaylist(tracks);
    if (tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0 || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentTrack(playlist[nextIndex]);
  };

  const handlePrevious = () => {
    if (playlist.length === 0 || !currentTrack) return;
    
    const currentIndex = playlist.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentTrack(playlist[prevIndex]);
  };

  const startRunningSession = () => {
    setCurrentView('session');
    setIsPlaying(true);
  };

  const endRunningSession = () => {
    setCurrentView('setup');
    setIsPlaying(false);
  };

  if (currentView === 'session') {
    return (
      <RunningSession 
        targetBPM={targetBPM}
        currentTrack={currentTrack}
        onEndSession={endRunningSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-card/50 border-b border-border/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center animate-pulse-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">PaceSync</h1>
                <p className="text-xs text-muted-foreground">BPM-Matched Running</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
              <Button variant="floating" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Stats Overview */}
        {targetBPM > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{targetBPM}</p>
                <p className="text-xs text-muted-foreground">Target BPM</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold">{currentPace}</p>
                <p className="text-xs text-muted-foreground">Target Pace</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs defaultValue="pace" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pace" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Pace</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pace" className="mt-6">
            <PaceInput 
              onPaceChange={handlePaceChange}
              currentBPM={targetBPM}
            />
          </TabsContent>

          <TabsContent value="music" className="mt-6 space-y-6">
            <MusicPlayer 
              targetBPM={targetBPM}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
            
            {targetBPM > 0 && (
              <PlaylistGenerator 
                targetBPM={targetBPM}
                onTrackSelect={handleTrackSelect}
                onPlaylistCreate={handlePlaylistCreate}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <div className="grid gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Running Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Track your performance and music sync effectiveness
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">0</p>
                      <p className="text-xs text-muted-foreground">Total Runs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">0.0</p>
                      <p className="text-xs text-muted-foreground">Miles Run</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Social Features</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with other runners and share playlists
                  </p>
                  <Button variant="outline" className="w-full">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Start Running CTA */}
        {targetBPM > 0 && currentTrack && (
          <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
            <Button 
              onClick={startRunningSession}
              className="w-full h-16 text-lg shadow-elevated"
              variant="pulse"
            >
              <Activity className="w-6 h-6 mr-2" />
              Start Running Session
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
