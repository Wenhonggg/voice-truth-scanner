import { useEffect, useState, useRef, useCallback } from 'react';
import { submitAudioForAnalysis, detectAudioSilence } from '@/lib/utils';

interface DetectionResult {
  id: string;
  timestamp: string;
  confidence: number;
  isAuthentic: boolean;
  details: string;
}

interface UseVoiceDetectionProps {
  isRecording: boolean;
}

export function useVoiceDetection({ isRecording }: UseVoiceDetectionProps) {
  const [results, setResults] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recentPredictionsRef = useRef<(boolean | null)[]>([]); // null for silent segments
  const silentSegmentsRef = useRef<number>(0);

  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      
      // Check if audio is silent first
      const isSilent = await detectAudioSilence(audioBlob, 0.01); // Adjust threshold as needed
      
      if (isSilent) {
        setIsSpeaking(false);
        
        // Add silent segment to recent predictions as null (neutral)
        recentPredictionsRef.current.push(null);
        if (recentPredictionsRef.current.length > 15) {
          recentPredictionsRef.current.shift();
        }
        silentSegmentsRef.current++;
        
        // Create a result for silence (don't send to API)
        const newResult: DetectionResult = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          confidence: 0,
          isAuthentic: true, // Neutral display
          details: 'Silent segment detected - please speak into the microphone'
        };
        
        setResults(prev => [newResult, ...prev].slice(0, 20));
        setError(null);
        return;
      }
      
      setIsSpeaking(true);
      
      // Use the API utility function for non-silent audio
      const result = await submitAudioForAnalysis(audioBlob);
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      const predictions = result.predictions;
      
      // Calculate majority vote from predictions (1 = real, 0 = fake)
      const realCount = predictions.filter(pred => pred === 1).length;
      const isCurrentlyReal = realCount > predictions.length / 2;
      
      // Add to recent predictions list (keep last 15)
      recentPredictionsRef.current.push(isCurrentlyReal);
      if (recentPredictionsRef.current.length > 15) {
        recentPredictionsRef.current.shift();
      }
      
      // Calculate overall authenticity based on majority of last 15 predictions
      // Exclude null (silent) segments from the calculation
      const nonSilentPredictions = recentPredictionsRef.current.filter(pred => pred !== null) as boolean[];
      const recentRealCount = nonSilentPredictions.filter(pred => pred).length;
      const totalNonSilent = nonSilentPredictions.length;
      
      // Only calculate authenticity if we have enough non-silent segments
      let isAuthentic = true;
      let confidence = 0;
      
      if (totalNonSilent > 0) {
        isAuthentic = recentRealCount > totalNonSilent / 2;
        // Calculate confidence based on consistency of recent non-silent predictions
        const consistency = Math.max(recentRealCount, totalNonSilent - recentRealCount) / totalNonSilent;
        confidence = consistency * 100;
      }

      const newResult: DetectionResult = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        confidence: confidence,
        isAuthentic,
        details: totalNonSilent > 0 
          ? (isAuthentic 
              ? `Voice patterns consistent with natural human speech (${realCount}/${predictions.length} segments authentic, ${silentSegmentsRef.current} silent)`
              : `Suspicious artifacts detected in voice synthesis patterns (${predictions.length - realCount}/${predictions.length} segments suspicious, ${silentSegmentsRef.current} silent)`)
          : 'Not enough voice data to determine authenticity - please speak more clearly'
      };

      setResults(prev => [newResult, ...prev].slice(0, 20));
      setError(null);
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err instanceof Error ? err.message : 'Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: false, // Keep natural voice characteristics
          autoGainControl: false
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      // Record in 0.2 second intervals
      mediaRecorder.start();
      
      intervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 200); // 0.2 seconds
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          // Convert webm to wav
          const arrayBuffer = await event.data.arrayBuffer();
          const audioContext = new AudioContext({ sampleRate: 44100 });
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV
          const wavBlob = await audioBufferToWav(audioBuffer);
          await processAudioChunk(wavBlob);
        }
      };
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [processAudioChunk]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    mediaRecorderRef.current = null;
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    
    return () => {
      stopRecording();
    };
  }, [isRecording, startRecording, stopRecording]);

  return {
    results,
    error,
    isProcessing,
    isSpeaking,
    clearResults: () => {
      setResults([]);
      recentPredictionsRef.current = [];
      silentSegmentsRef.current = 0;
    }
  };
}

// Helper function to convert AudioBuffer to WAV blob
async function audioBufferToWav(audioBuffer: AudioBuffer): Promise<Blob> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numberOfChannels * bytesPerSample;
  
  const buffer = new ArrayBuffer(44 + audioBuffer.length * bytesPerSample);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, audioBuffer.length * bytesPerSample, true);
  
  // Convert audio data
  const channelData = audioBuffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < channelData.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([buffer], { type: 'audio/wav' });
}
