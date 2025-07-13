import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { FileUploadButton } from '../components/FileUploadButton';
import { VoiceRecordButton } from '../components/VoiceRecordButton';
import { ResultsPanel } from '@/components/ResultsPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Upload = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const navigate = useNavigate();

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleFileUpload = (file: File) => {
    setAudioFile(file);
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    setRecordedAudio(audioBlob);
    setIsRecording(false);
  };

  const handleNavigateToRealtime = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Navigation Arrow Button - Fixed on left side center */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          onClick={handleNavigateToRealtime}
          size="lg"
          className="
            h-14 w-14 rounded-full transition-all duration-300 transform hover:scale-110
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
            text-white border-0 glow-purple
            shadow-[0_0_20px_hsl(260_100%_70%)]
            hover:shadow-[0_0_30px_hsl(260_100%_70%)]
            group
          "
          title="Go to Real-time Detection"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
        </Button>
      </div>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient border-b-2 border-purple-500/30 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gradient-blue-purple glow-purple text-center">
            Deepfake Audio Detection
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 pb-12">
        <div className="container mx-auto px-6 space-y-12">
          {/* Description Section */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg text-gradient-cyan-blue glow-blue leading-relaxed">
              Upload audio files or record new audio to analyze for deepfake detection. 
              Supports multiple audio formats with advanced AI analysis capabilities.
            </p>
          </div>

          {/* Controls Section */}
          <div className="text-center space-y-12">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <FileUploadButton onFileUpload={handleFileUpload} />
              <VoiceRecordButton 
                isRecording={isRecording}
                onToggleRecording={handleToggleRecording}
                onRecordingComplete={handleRecordingComplete}
                recordedAudio={recordedAudio}
              />
            </div>
            
            {/* Audio Visualization */}
            <div className="max-w-2xl mx-auto">
              <AudioVisualizer isRecording={isRecording} />
            </div>
          </div>

          {/* Results Section */}
          <div className="max-w-4xl mx-auto">
            <ResultsPanel isRecording={isRecording} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
