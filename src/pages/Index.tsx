import { useState } from 'react';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { DetectionButton } from '@/components/DetectionButton';
import { ResultsPanel } from '@/components/ResultsPanel';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-header shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white text-center">
            Deepfake Audio Detection
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-6 space-y-12">
          {/* Description Section */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Real-time AI-powered deepfake audio detection system that analyzes voice patterns 
              and identifies synthetic speech with advanced machine learning algorithms.
            </p>
          </div>

          {/* Controls Section */}
          <div className="text-center space-y-8">
            <DetectionButton 
              isRecording={isRecording} 
              onToggle={handleToggleRecording} 
            />
            
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

export default Index;
