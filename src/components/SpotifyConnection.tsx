import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSpotify } from "@/hooks/useSpotify";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  CheckCircle, 
  Loader2, 
  Radio,
  AlertCircle,
  RefreshCw,
  User
} from "lucide-react";

interface SpotifyConnectionProps {
  onConnectionChange: (connected: boolean) => void;
}

export const SpotifyConnection = ({ onConnectionChange }: SpotifyConnectionProps) => {
  const { isAuthenticated, login, logout, getCurrentTrack, currentTrack } = useSpotify();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  const checkCurrentTrack = useCallback(async () => {
    setIsChecking(true);
    try {
      await getCurrentTrack();
    } catch (error) {
      console.error('Error checking current track:', error);
    } finally {
      setIsChecking(false);
    }
  }, [getCurrentTrack]);

  useEffect(() => {
    setConnectionStatus(isAuthenticated ? 'connected' : 'disconnected');
    onConnectionChange(isAuthenticated);
  }, [isAuthenticated, onConnectionChange]);

  useEffect(() => {
    if (isAuthenticated) {
      checkCurrentTrack();
    }
  }, [isAuthenticated, checkCurrentTrack]);

  const handleConnect = async () => {
    try {
      setConnectionStatus('connecting');
      login();
      toast({
        title: "Connecting to Spotify",
        description: "You'll be redirected to authorize PaceSync with your Spotify account.",
      });
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Unable to connect to Spotify. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    logout();
    setConnectionStatus('disconnected');
    toast({
      title: "Disconnected",
      description: "Your Spotify account has been disconnected.",
    });
  };

  if (connectionStatus === 'connected') {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Spotify Connected</h3>
                  <p className="text-sm text-muted-foreground">Ready to sync your music</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            {currentTrack && (
              <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-3">
                  <Music className="w-4 h-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Currently Playing</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {currentTrack.name} • {currentTrack.artists[0]?.name}
                    </p>
                  </div>
                  {isChecking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkCurrentTrack}
                disabled={isChecking}
                className="flex-1"
              >
                {isChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync Current Track
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <Card className="bg-gradient-card border-border/50">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg mx-auto flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
            <div>
              <h3 className="font-semibold">Connecting to Spotify</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting to Spotify authorization...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <Card className="bg-gradient-card border-border/50 border-destructive/20">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-destructive/20 rounded-lg mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold">Connection Failed</h3>
              <p className="text-sm text-muted-foreground">
                Unable to connect to Spotify. Please try again.
              </p>
            </div>
            <Button onClick={handleConnect} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-lg mx-auto flex items-center justify-center">
            <Radio className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Connect Your Spotify</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Sync with your Spotify account to access your music library and create personalized running playlists.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Access your music library</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Create BPM-matched playlists</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Control playback during runs</span>
            </div>
          </div>

          <Button 
            onClick={handleConnect}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            <Radio className="w-5 h-5 mr-2" />
            Connect Spotify Account
          </Button>
          
          <p className="text-xs text-muted-foreground">
            We'll redirect you to Spotify to authorize this connection
          </p>
        </div>
      </CardContent>
    </Card>
  );
};