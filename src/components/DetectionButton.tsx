import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

interface DetectionButtonProps {
  isRecording: boolean;
  onToggle: () => void;
}

export function DetectionButton({ isRecording, onToggle }: DetectionButtonProps) {
  return (
    <Button
      onClick={onToggle}
      size="lg"
      className={`
        h-16 px-12 text-lg font-semibold transition-all duration-300 transform hover:scale-105
        ${isRecording 
          ? 'bg-destructive hover:bg-destructive/90 animate-glow-pulse' 
          : 'bg-success hover:bg-success/90'
        }
        shadow-lg hover:shadow-xl
      `}
    >
      {isRecording ? (
        <>
          <MicOff className="w-6 h-6 mr-3" />
          Stop Detection
        </>
      ) : (
        <>
          <Mic className="w-6 h-6 mr-3" />
          Start Detection
        </>
      )}
    </Button>
  );
}