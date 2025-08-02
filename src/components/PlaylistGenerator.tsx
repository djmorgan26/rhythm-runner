import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpotify } from "@/hooks/useSpotify";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  Zap, 
  Heart, 
  Headphones, 
  Share2,
  Download,
  Shuffle,
  Sparkles,
  Play,
  Loader2,
  Settings,
  Wand2
} from "lucide-react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url?: string;
}

interface PlaylistGeneratorProps {
  targetBPM: number;
  isSpotifyConnected: boolean;
  onTrackSelect: (track: SpotifyTrack) => void;
  onPlaylistCreate: (tracks: SpotifyTrack[]) => void;
  onCustomizeRequest: () => void;
}

export const PlaylistGenerator = ({ 
  targetBPM, 
  isSpotifyConnected, 
  onTrackSelect, 
  onPlaylistCreate,
  onCustomizeRequest 
}: PlaylistGeneratorProps) => {
  const { searchTracks, getAudioFeatures } = useSpotify();
  const { toast } = useToast();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['pop']);
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [generatedTracks, setGeneratedTracks] = useState<SpotifyTrack[]>([]);
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

  // Generate playlist using Spotify API
  const generatePlaylist = async () => {
    if (!isSpotifyConnected) {
      toast({
        title: "Spotify Required",
        description: "Please connect your Spotify account first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create search queries based on selected genres and energy level
      const genreQueries = selectedGenres.map(genre => {
        let query = `genre:${genre}`;
        
        // Add energy-based modifiers
        if (energyLevel === 'high') {
          query += ' high energy dance workout';
        } else if (energyLevel === 'low') {
          query += ' chill mellow steady';
        } else {
          query += ' moderate tempo';
        }
        
        return query;
      });

      // Search for tracks with different genre queries
      const allTracks: SpotifyTrack[] = [];
      
      for (const query of genreQueries) {
        const tracks = await searchTracks(query, targetBPM);
        allTracks.push(...tracks.slice(0, 8)); // Take top 8 from each genre
      }

      // Remove duplicates and get unique tracks
      const uniqueTracks = allTracks.filter((track, index, self) => 
        index === self.findIndex(t => t.id === track.id)
      );

      // If we have tracks, get their audio features and sort by BPM match
      if (uniqueTracks.length > 0) {
        const tracksWithTempo = await Promise.all(
          uniqueTracks.slice(0, 20).map(async (track) => {
            const features = await getAudioFeatures(track.id);
            return { ...track, tempo: features?.tempo || 0 };
          })
        );

        // Sort by closest BPM match and take top 10
        const sortedTracks = tracksWithTempo
          .filter(track => track.tempo > 0)
          .sort((a, b) => Math.abs(a.tempo - targetBPM) - Math.abs(b.tempo - targetBPM))
          .slice(0, 10)
          .map(({ tempo, ...track }) => track);

        setGeneratedTracks(sortedTracks);
        onPlaylistCreate(sortedTracks);

        toast({
          title: "Playlist Generated!",
          description: `Found ${sortedTracks.length} tracks matching your preferences.`,
        });
      } else {
        toast({
          title: "No tracks found",
          description: "Try adjusting your genre selection or energy level.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error generating playlist:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
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
              disabled={!targetBPM || isGenerating || selectedGenres.length === 0 || !isSpotifyConnected}
              className="w-full"
              variant="hero"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Perfect Mix...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Generate Spotify Playlist
                </>
              )}
            </Button>
            
            {!isSpotifyConnected && (
              <p className="text-xs text-muted-foreground text-center">
                Connect Spotify to generate personalized playlists
              </p>
            )}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onCustomizeRequest}
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {generatedTracks.map((track, index) => {
                  return (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                      onClick={() => onTrackSelect(track)}
                    >
                      <div className="w-10 h-10 bg-primary/20 rounded flex-shrink-0 overflow-hidden">
                        {track.album.images[0] ? (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                          {track.name}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">{track.artists[0]?.name}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {formatDuration(track.duration_ms)}
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