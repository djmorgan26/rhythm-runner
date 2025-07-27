import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Music, 
  Zap, 
  Heart, 
  Headphones, 
  Share2,
  Download,
  Shuffle,
  Sparkles,
  Play
} from "lucide-react";

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  bpm: number;
  genre: string;
  energy: 'low' | 'medium' | 'high';
  duration: number;
  coverUrl?: string;
}

interface PlaylistGeneratorProps {
  targetBPM: number;
  onTrackSelect: (track: Track) => void;
  onPlaylistCreate: (tracks: Track[]) => void;
}

export const PlaylistGenerator = ({ targetBPM, onTrackSelect, onPlaylistCreate }: PlaylistGeneratorProps) => {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['pop']);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const genres = [
    { id: 'pop', label: 'Pop', icon: '🎵' },
    { id: 'rock', label: 'Rock', icon: '🎸' },
    { id: 'electronic', label: 'Electronic', icon: '🔊' },
    { id: 'hip-hop', label: 'Hip Hop', icon: '🎤' },
    { id: 'indie', label: 'Indie', icon: '🎹' },
    { id: 'classical', label: 'Classical', icon: '🎼' },
  ];

  const energyLevels = [
    { id: 'low', label: 'Steady', desc: 'Consistent rhythm', icon: Heart },
    { id: 'medium', label: 'Moderate', desc: 'Balanced energy', icon: Headphones },
    { id: 'high', label: 'High Energy', desc: 'Pump it up!', icon: Zap },
  ];

  // Mock track generation based on BPM and preferences
  const generatePlaylist = async () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTracks: Track[] = [
      {
        id: '1',
        title: 'Thunder Runner',
        artist: 'Electric Beats',
        album: 'Power Pace',
        bpm: targetBPM,
        genre: selectedGenres[0],
        energy: energyLevel,
        duration: 215,
      },
      {
        id: '2',
        title: 'Pace Perfect',
        artist: 'Rhythm Masters',
        album: 'Beat Sync',
        bpm: targetBPM - 2,
        genre: selectedGenres[0],
        energy: energyLevel,
        duration: 198,
      },
      {
        id: '3',
        title: 'Sync Stream',
        artist: 'Beat Runners',
        album: 'Flow State',
        bpm: targetBPM + 1,
        genre: selectedGenres[0],
        energy: energyLevel,
        duration: 187,
      },
      {
        id: '4',
        title: 'Flow State',
        artist: 'Tempo Track',
        album: 'Cadence',
        bpm: targetBPM - 1,
        genre: selectedGenres[0],
        energy: energyLevel,
        duration: 203,
      },
      {
        id: '5',
        title: 'Power Stride',
        artist: 'Cadence Co',
        album: 'Runner\'s High',
        bpm: targetBPM + 3,
        genre: selectedGenres[0],
        energy: energyLevel,
        duration: 234,
      },
    ];

    setGeneratedTracks(mockTracks);
    onPlaylistCreate(mockTracks);
    setIsGenerating(false);
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  const getBPMVariance = (trackBPM: number) => {
    const difference = Math.abs(trackBPM - targetBPM);
    if (difference <= 1) return 'perfect';
    if (difference <= 3) return 'excellent';
    if (difference <= 5) return 'good';
    return 'fair';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Playlist Configuration */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <Label className="text-lg font-semibold">Generate Playlist</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Customize your perfect running soundtrack
              </p>
            </div>

            {/* Genre Selection */}
            <div className="space-y-3">
              <Label>Music Genres</Label>
              <div className="grid grid-cols-2 gap-2">
                {genres.map((genre) => (
                  <Button
                    key={genre.id}
                    variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                    onClick={() => toggleGenre(genre.id)}
                    className="h-12 flex-col gap-1"
                  >
                    <span className="text-lg">{genre.icon}</span>
                    <span className="text-xs">{genre.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-3">
              <Label>Energy Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {energyLevels.map((level) => {
                  const Icon = level.icon;
                  return (
                    <Button
                      key={level.id}
                      variant={energyLevel === level.id ? "default" : "outline"}
                      onClick={() => setEnergyLevel(level.id as 'low' | 'medium' | 'high')}
                      className="h-16 flex-col gap-1"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.desc}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <Button 
              onClick={generatePlaylist}
              disabled={!targetBPM || isGenerating || selectedGenres.length === 0}
              className="w-full"
              variant="hero"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  Generating Perfect Mix...
                </>
              ) : (
                <>
                  <Shuffle className="w-5 h-5" />
                  Generate Playlist
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Playlist */}
      {generatedTracks.length > 0 && (
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Your PaceSync Playlist</h3>
                  <p className="text-sm text-muted-foreground">
                    {generatedTracks.length} tracks • Target: {targetBPM} BPM
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {generatedTracks.map((track, index) => {
                  const variance = getBPMVariance(track.bpm);
                  return (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => onTrackSelect(track)}
                    >
                      <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={variance === 'perfect' ? 'default' : 'outline'}
                          className={`
                            ${variance === 'perfect' && 'bg-accent text-accent-foreground'}
                            ${variance === 'excellent' && 'border-primary text-primary'}
                            ${variance === 'good' && 'border-primary/60 text-primary/80'}
                          `}
                        >
                          {track.bpm} BPM
                        </Badge>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                variant="pulse" 
                className="w-full"
                onClick={() => generatedTracks.length > 0 && onTrackSelect(generatedTracks[0])}
              >
                <Play className="w-5 h-5" />
                Start Running Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};