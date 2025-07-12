import { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
}

export function AudioVisualizer({ isRecording }: AudioVisualizerProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(16).fill(0));

  useEffect(() => {
    if (!isRecording) {
      setAudioLevels(Array(16).fill(0));
      return;
    }

    // Simulate real-time audio data
    const interval = setInterval(() => {
      const newLevels = Array(16).fill(0).map(() => {
        const intensity = Math.random() * 0.8 + 0.2; // Random between 0.2 and 1
        return intensity;
      });
      setAudioLevels(newLevels);
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  const getBarColor = (level: number) => {
    if (level < 0.3) return 'bg-audio-low';
    if (level < 0.7) return 'bg-audio-medium';
    return 'bg-audio-high';
  };

  const getBarHeight = (level: number) => {
    const minHeight = 8; // Minimum height in pixels
    const maxHeight = 120; // Maximum height in pixels
    return Math.max(minHeight, level * maxHeight);
  };

  return (
    <div className="flex items-end justify-center space-x-2 h-32 p-4">
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className={`w-4 rounded-t-lg transition-all duration-100 ${getBarColor(level)} ${
            isRecording ? 'animate-audio-pulse' : ''
          }`}
          style={{
            height: `${getBarHeight(level)}px`,
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}