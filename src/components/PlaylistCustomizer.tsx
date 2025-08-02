import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useSpotify } from "@/hooks/useSpotify";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  Plus, 
  Minus, 
  Play, 
  Trash2,
  Search,
  Loader2,
  Shuffle,
  Clock,
  Heart,
  MoreVertical
} from "lucide-react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  preview_url?: string;
}

interface PlaylistCustomizerProps {
  targetBPM: number;
  playlist: SpotifyTrack[];
  onPlaylistUpdate: (tracks: SpotifyTrack[]) => void;
  onTrackSelect: (track: SpotifyTrack) => void;
}

export const PlaylistCustomizer = ({ 
  targetBPM, 
  playlist, 
  onPlaylistUpdate, 
  onTrackSelect 
}: PlaylistCustomizerProps) => {
  const { searchTracks, getAudioFeatures } = useSpotify();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchTracks(searchQuery, targetBPM);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try searching with different keywords.",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Unable to search tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addTrackToPlaylist = async (track: SpotifyTrack) => {
    if (playlist.find(t => t.id === track.id)) {
      toast({
        title: "Track already in playlist",
        description: `${track.name} is already added to your playlist.`,
      });
      return;
    }

    const updatedPlaylist = [...playlist, track];
    onPlaylistUpdate(updatedPlaylist);
    
    toast({
      title: "Track added",
      description: `${track.name} added to your playlist.`,
    });
  };

  const removeTrackFromPlaylist = (trackId: string) => {
    const track = playlist.find(t => t.id === trackId);
    const updatedPlaylist = playlist.filter(t => t.id !== trackId);
    onPlaylistUpdate(updatedPlaylist);
    
    if (track) {
      toast({
        title: "Track removed",
        description: `${track.name} removed from playlist.`,
      });
    }
  };

  const optimizePlaylist = async () => {
    if (playlist.length === 0) return;
    
    setIsOptimizing(true);
    try {
      // Get audio features for all tracks and sort by closest BPM match
      const tracksWithFeatures = await Promise.all(
        playlist.map(async (track) => {
          const features = await getAudioFeatures(track.id);
          return { ...track, tempo: features?.tempo || 0 };
        })
      );

      const optimizedPlaylist = tracksWithFeatures
        .filter(track => track.tempo > 0)
        .sort((a, b) => 
          Math.abs(a.tempo - targetBPM) - Math.abs(b.tempo - targetBPM)
        )
        .map(({ tempo, ...track }) => track);

      onPlaylistUpdate(optimizedPlaylist);
      
      toast({
        title: "Playlist optimized",
        description: "Tracks reordered by BPM match for better sync.",
      });
    } catch (error) {
      toast({
        title: "Optimization failed",
        description: "Unable to optimize playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatDuration = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    const totalMs = playlist.reduce((sum, track) => sum + track.duration_ms, 0);
    return Math.floor(totalMs / 60000); // Return in minutes
  };

  return (
    <div className="space-y-6">
      {/* Playlist Overview */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Your Custom Playlist</h3>
                <p className="text-sm text-muted-foreground">
                  {playlist.length} tracks • {getTotalDuration()} minutes • Target: {targetBPM} BPM
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={optimizePlaylist}
                  disabled={playlist.length === 0 || isOptimizing}
                >
                  {isOptimizing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Shuffle className="w-4 h-4" />
                  )}
                  Optimize
                </Button>
              </div>
            </div>

            {playlist.length === 0 ? (
              <div className="text-center py-8">
                <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Your playlist is empty</p>
                <p className="text-sm text-muted-foreground">Search and add tracks below</p>
              </div>
            ) : (
              <div className="space-y-2">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="text-sm text-muted-foreground w-6 text-center">
                      {index + 1}
                    </span>
                    
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
                      <h4 className="font-medium truncate">{track.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artists[0]?.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(track.duration_ms)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTrackSelect(track)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrackFromPlaylist(track.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search and Add Tracks */}
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Add More Tracks</Label>
              <p className="text-sm text-muted-foreground">
                Search for songs that match your {targetBPM} BPM target
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for songs, artists, or albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Results</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-primary/20 rounded flex-shrink-0 overflow-hidden">
                        {track.album.images[0] ? (
                          <img 
                            src={track.album.images[0].url} 
                            alt={track.album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-3 h-3 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{track.name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {track.artists[0]?.name} • {track.album.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(track.duration_ms)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addTrackToPlaylist(track)}
                          disabled={playlist.some(t => t.id === track.id)}
                        >
                          {playlist.some(t => t.id === track.id) ? (
                            <Music className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};