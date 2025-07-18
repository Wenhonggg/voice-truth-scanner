import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { testApiConnection } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export function ApiStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await testApiConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isChecking && isConnected === null) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        Checking API...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-2"
    >
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3" />
          API Connected
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          API Offline
        </>
      )}
    </Badge>
  );
}
