import { useEffect, useState, useRef } from 'react';

export function useAudioAnalyzer(isRecording: boolean) {
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(16).fill(0));
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startAudioAnalysis();
    } else {
      stopAudioAnalysis();
      setAudioLevels(Array(16).fill(0)); // Reset to zero when not recording
    }

    return () => {
      stopAudioAnalysis();
    };
  }, [isRecording]);

  const startAudioAnalysis = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setHasPermission(true);
      setError(null);

      // Create audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      // Configure analyzer
      analyserRef.current.fftSize = 64; // This gives us 32 frequency bins
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyzer
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start analyzing
      analyzeAudio();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied. Please allow microphone access to use this feature.');
      setHasPermission(false);
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateLevels = () => {
      if (!analyserRef.current || !isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Group frequency data into 16 bars
      const barsCount = 16;
      const itemsPerBar = Math.floor(bufferLength / barsCount);
      const newLevels: number[] = [];
      
      for (let i = 0; i < barsCount; i++) {
        const start = i * itemsPerBar;
        const end = start + itemsPerBar;
        
        // Calculate average for this frequency range
        let sum = 0;
        for (let j = start; j < end && j < bufferLength; j++) {
          sum += dataArray[j];
        }
        const average = sum / itemsPerBar;
        
        // Normalize to 0-1 range and apply some scaling for better visualization
        const normalized = Math.min(1, (average / 255) * 2); // Scale up a bit for better visual
        newLevels.push(normalized);
      }
      
      setAudioLevels(newLevels);
      animationFrameRef.current = requestAnimationFrame(updateLevels);
    };
    
    updateLevels();
  };

  const stopAudioAnalysis = () => {
    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    analyserRef.current = null;
  };

  return {
    audioLevels,
    hasPermission,
    error
  };
}