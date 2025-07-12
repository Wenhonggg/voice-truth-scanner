import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { Mic, MicOff } from 'lucide-react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const { audioLevels, hasPermission, error } = useAudioAnalyzer(isRecording);

  const getBarColor = (level: number) => {
    if (level < 0.2) return 'bg-audio-low';
    if (level < 0.6) return 'bg-audio-medium';
    return 'bg-audio-high';
  };

  const getBarHeight = (level: number) => {
    const minHeight = 4; // Minimum height in pixels
    const maxHeight = 120; // Maximum height in pixels
    return Math.max(minHeight, level * maxHeight);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
        <MicOff className="w-8 h-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (isRecording && hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-32 p-4">
        <div className="text-center">
          <Mic className="w-8 h-8 text-muted-foreground mb-2 mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Requesting microphone access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center space-x-2 h-32 p-4">
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className={`w-4 rounded-t-lg transition-all duration-75 ${getBarColor(level)}`}
          style={{
            height: `${getBarHeight(level)}px`,
          }}
        />
      ))}
      {isRecording && hasPermission && (
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            Recording
          </div>
        </div>
      )}
    </div>
  );
}