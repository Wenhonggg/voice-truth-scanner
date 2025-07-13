import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface DetectionResult {
  id: string;
  timestamp: string;
  confidence: number;
  isAuthentic: boolean;
  details: string;
}

interface ResultsPanelProps {
  isRecording: boolean;
}

export function ResultsPanel({ isRecording }: ResultsPanelProps) {
  const [results, setResults] = useState<DetectionResult[]>([]);

  useEffect(() => {
    if (!isRecording) return;

    // Simulate real-time detection results
    const interval = setInterval(() => {
      const confidence = Math.random() * 100;
      const isAuthentic = confidence > 30; // Simulate detection logic
      
      const newResult: DetectionResult = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        confidence: confidence,
        isAuthentic,
        details: isAuthentic 
          ? 'Voice patterns match natural human speech characteristics'
          : 'Suspicious artifacts detected in voice synthesis patterns'
      };

      setResults(prev => [newResult, ...prev].slice(0, 20)); // Keep last 20 results
    }, 2000);

    return () => clearInterval(interval);
  }, [isRecording]);

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
        </div>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {isRecording 
              ? "Analyzing audio... Results will appear here." 
              : "Start detection to see real-time analysis results."
            }
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-card rounded-lg p-6 border-2 border-purple-500/30 shadow-lg"
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