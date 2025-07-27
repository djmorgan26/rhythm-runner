import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Target, Zap } from "lucide-react";

interface PaceInputProps {
  onPaceChange: (bpm: number, pace: string) => void;
  currentBPM: number;
}

export const PaceInput = ({ onPaceChange, currentBPM }: PaceInputProps) => {
  const [inputMode, setInputMode] = useState<"pace" | "bpm">("pace");
  const [pace, setPace] = useState("8:00");
  const [bpm, setBpm] = useState(180);

  // Convert pace (min/mile) to BPM using average stride rate
  const paceToeBPM = (paceMinutes: number, paceSeconds: number) => {
    const totalMinutes = paceMinutes + paceSeconds / 60;
    const mph = 60 / totalMinutes;
    // Average cadence: 170-190 steps/min, using 180 as baseline
    const baseBPM = 180;
    const adjustedBPM = Math.round(baseBPM * (mph / 7.5)); // 7.5 mph = baseline
    return Math.max(120, Math.min(200, adjustedBPM));
  };

  const handlePaceSubmit = () => {
    if (inputMode === "pace") {
      const [minutes, seconds] = pace.split(":").map(Number);
      const calculatedBPM = paceToeBPM(minutes, seconds || 0);
      onPaceChange(calculatedBPM, pace);
    } else {
      const minutes = Math.floor(60 / (bpm / 180 * 7.5));
      const seconds = Math.round(((60 / (bpm / 180 * 7.5)) - minutes) * 60);
      const calculatedPace = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      onPaceChange(bpm, calculatedPace);
    }
  };

  const quickPaceOptions = [
    { label: "Easy", pace: "9:00", bpm: 160 },
    { label: "Moderate", pace: "8:00", bpm: 175 },
    { label: "Tempo", pace: "7:00", bpm: 185 },
    { label: "Fast", pace: "6:00", bpm: 195 },
  ];

  return (
    <Card className="bg-gradient-card border-border/50 shadow-elevated">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Set Your Pace</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose your target pace for perfect music sync
            </p>
          </div>

          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "pace" | "bpm")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pace" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Pace (min/mile)
              </TabsTrigger>
              <TabsTrigger value="bpm" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                BPM
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pace" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pace-input">Target Pace</Label>
                <Input
                  id="pace-input"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="8:00"
                  className="text-center text-lg font-mono"
                />
              </div>
            </TabsContent>

            <TabsContent value="bpm" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bpm-input">Target BPM</Label>
                <Input
                  id="bpm-input"
                  type="number"
                  min="120"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="text-center text-lg font-mono"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Select</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickPaceOptions.map((option) => (
                <Button
                  key={option.label}
                  variant="outline"
                  onClick={() => {
                    if (inputMode === "pace") {
                      setPace(option.pace);
                    } else {
                      setBpm(option.bpm);
                    }
                    onPaceChange(option.bpm, option.pace);
                  }}
                  className="h-12 flex-col gap-1"
                >
                  <span className="font-semibold">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.pace} • {option.bpm} BPM
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handlePaceSubmit} className="w-full" variant="hero">
            Sync My Music
          </Button>

          {currentBPM > 0 && (
            <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground mb-1">Current Target</p>
              <p className="text-xl font-bold text-accent animate-pulse-glow">
                {currentBPM} BPM
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};