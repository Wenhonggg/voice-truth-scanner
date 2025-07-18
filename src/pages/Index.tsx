import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { DetectionButton } from '@/components/DetectionButton';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ApiStatus } from '@/components/ApiStatus';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleNavigateToUpload = () => {
    navigate('/upload');
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Navigation Arrow Button - Fixed on right side center */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40">
        <Button
          onClick={handleNavigateToUpload}
          size="lg"
          className="
            h-14 w-14 rounded-full transition-all duration-300 transform hover:scale-110
            bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
            text-white border-0 glow-purple
            shadow-[0_0_20px_hsl(260_100%_70%)]
            hover:shadow-[0_0_30px_hsl(260_100%_70%)]
            group
          "
          title="Go to Audio File Analysis"
        >
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient border-b-2 border-purple-500/30 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient-blue-purple glow-purple">
              Deepfake Audio Detection
            </h1>
            <ApiStatus />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 pb-12">
        <div className="container mx-auto px-6 space-y-12">
          {/* Description Section */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg text-gradient-cyan-blue glow-blue leading-relaxed">
              Real-time AI-powered deepfake audio detection system that analyzes voice patterns 
              and identifies synthetic speech with advanced machine learning algorithms.
            </p>
          </div>

          {/* Controls Section */}
          <div className="text-center space-y-20">
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
