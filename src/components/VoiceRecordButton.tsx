import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Play, Pause, Square } from 'lucide-react';

interface VoiceRecordButtonProps {
  isRecording: boolean;
  onToggleRecording: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
  recordedAudio: Blob | null;
}

export function VoiceRecordButton({ 
  isRecording, 
  onToggleRecording, 
  onRecordingComplete,
  recordedAudio 
}: VoiceRecordButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (recordedAudio) {
      const url = URL.createObjectURL(recordedAudio);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [recordedAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      onToggleRecording();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onToggleRecording();
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePlayback = () => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Record Button */}
      <Button
        onClick={handleRecordClick}
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
            <span className="text-white">Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="w-6 h-6 mr-3" />
            <span className="text-white">Record Voice</span>
          </>
        )}
      </Button>

      {/* Playback Controls */}
      {recordedAudio && (
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePlayback}
            size="sm"
            variant="outline"
            className="bg-card border-purple-500/30 text-foreground hover:bg-purple-500/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={handleStop}
            size="sm"
            variant="outline"
            className="bg-card border-purple-500/30 text-foreground hover:bg-purple-500/20"
          >
            <Square className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {isPlaying ? 'Playing...' : 'Ready to play'}
          </span>
        </div>
      )}
    </div>
  );
}
