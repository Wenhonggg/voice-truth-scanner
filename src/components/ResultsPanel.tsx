import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useVoiceDetection } from '@/hooks/useVoiceDetection';

interface ResultsPanelProps {
  isRecording: boolean;
}

export function ResultsPanel({ isRecording }: ResultsPanelProps) {
  const { results, error, isProcessing, isSpeaking } = useVoiceDetection({ isRecording });

  // Add colored status icons based on detection results
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'authentic':
        return <ShieldCheck className="w-6 h-6 text-green-500" />; // Green for authentic
      case 'suspicious':
        return <ShieldAlert className="w-6 h-6 text-yellow-500" />; // Yellow for suspicious  
      case 'deepfake':
        return <Shield className="w-6 h-6 text-red-500" />; // Red for deepfake
      default:
        return <Shield className="w-6 h-6 text-gray-500" />; // Gray for idle/unknown
    }
  };

  const getStatusBadge = (isAuthentic: boolean, confidence: number) => {
    if (confidence === 0) {
      return (
        <Badge variant="secondary" className="bg-gray-500/20 text-gray-600">
          Silent
        </Badge>
      );
    }
    
    return (
      <Badge 
        variant={isAuthentic ? "default" : "destructive"}
        className={isAuthentic ? "bg-success" : "bg-destructive"}
      >
        {isAuthentic ? 'Authentic' : 'Suspicious'} ({confidence.toFixed(1)}%)
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-elegant border-2 border-purple-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-4">
          {getStatusIcon(results[0]?.isAuthentic ? 'authentic' : 'suspicious')}
          <CardTitle className="text-xl">
            Real-Time Results
          </CardTitle>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              Processing...
            </div>
          )}
          {isRecording && !isSpeaking && !isProcessing && (
            <div className="flex items-center gap-2 text-sm text-yellow-500">
              <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-pulse" />
              Waiting for speech...
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isRecording 
              ? (isSpeaking 
                  ? "Analyzing audio... Results will appear here." 
                  : "Please speak into the microphone to begin analysis.")
              : "Start detection to see real-time analysis results."
            }
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className={`bg-card rounded-lg p-6 border-2 shadow-lg ${
                    result.confidence === 0 
                      ? 'border-gray-400/30 bg-gray-50/50' // Different style for silent segments
                      : result.isAuthentic 
                        ? 'border-green-500/30' 
                        : 'border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.isAuthentic ? 'authentic' : 'suspicious')}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {result.timestamp}
                        </span>
                        {getStatusBadge(result.isAuthentic, result.confidence)}
                      </div>
                      <p className="text-sm text-foreground">{result.details}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}