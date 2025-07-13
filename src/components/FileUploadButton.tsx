import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface FileUploadButtonProps {
  onFileUpload: (file: File) => void;
}

export function FileUploadButton({ onFileUpload }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an audio file
      if (file.type.startsWith('audio/')) {
        onFileUpload(file);
      } else {
        alert('Please select an audio file (MP3, WAV, etc.)');
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleButtonClick}
        size="lg"
        className="
          h-16 px-12 text-lg font-semibold transition-all duration-300 transform hover:scale-105
          bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
          text-white border-0 glow-purple
          shadow-[0_0_20px_hsl(260_100%_70%)]
          hover:shadow-[0_0_30px_hsl(260_100%_70%)]
        "
      >
        <Upload className="w-6 h-6 mr-3" />
        <span className="text-white">Import Audio File</span>
      </Button>
    </>
  );
}
