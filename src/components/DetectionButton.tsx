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
        bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
        text-white border-0 glow-purple
        ${isRecording 
          ? 'animate-pulse shadow-[0_0_20px_hsl(0_100%_60%)]' 
          : 'shadow-[0_0_20px_hsl(260_100%_70%)]'
        }
        hover:shadow-[0_0_30px_hsl(260_100%_70%)]
      `}
    >
      {isRecording ? (
        <>
          <MicOff className="w-6 h-6 mr-3" />
          <span className="text-gradient-blue-purple">Stop Detection</span>
        </>
      ) : (
        <>
          <Mic className="w-6 h-6 mr-3" />
          <span className="text-white">Start Detection</span>
        </>
      )}
    </Button>
  );
}