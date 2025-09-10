import { useState, useRef, useEffect } from "react";
import { Play, Pause, Download, Volume2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface AudioPlayerProps {
  audioUrl?: string;
  isGenerating?: boolean;
  onGenerate?: () => void;
  fileName?: string;
}

const AudioPlayer = ({ audioUrl, isGenerating, onGenerate, fileName = "audiobook" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([0.8]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const resetAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${fileName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audio download started!");
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-audio" />
            <span>Audio Generation</span>
          </div>
          {!audioUrl && !isGenerating && onGenerate && (
            <Button 
              onClick={onGenerate}
              className="bg-audio hover:bg-audio/90 text-audio-foreground"
            >
              Generate Audio
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isGenerating ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-audio/20 border-t-audio animate-spin mx-auto mb-4"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Volume2 className="h-6 w-6 text-audio animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Generating natural-sounding audio...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This may take a few moments
              </p>
            </div>
          </div>
        ) : !audioUrl ? (
          <div className="flex items-center justify-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <div className="text-center">
              <Volume2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Audio will appear here after generation
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Audio Element */}
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            
            {/* Waveform Visualization Placeholder */}
            <div className="bg-gradient-to-r from-audio/20 via-audio/30 to-audio/20 rounded-lg p-4 h-20 flex items-center justify-center">
              <div className="flex items-end space-x-1 h-12">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-audio rounded-full w-1 transition-all duration-300"
                    style={{
                      height: `${Math.random() * 100 + 20}%`,
                      opacity: (currentTime / duration) * 40 > i ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayPause}
                  className="hover:bg-audio/10 hover:border-audio"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetAudio}
                  className="hover:bg-muted"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={volume}
                    max={1}
                    step={0.1}
                    onValueChange={setVolume}
                    className="w-20"
                  />
                </div>

                <Button
                  onClick={downloadAudio}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download MP3
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Audio generation effect */}
      {isGenerating && (
        <div className="absolute inset-0 bg-gradient-to-r from-audio/10 via-transparent to-audio/10 animate-pulse"></div>
      )}
    </Card>
  );
};

export default AudioPlayer;