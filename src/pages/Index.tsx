import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import TextInput from "@/components/TextInput";
import ToneSelector, { ToneType } from "@/components/ToneSelector";
import TextComparison from "@/components/TextComparison";
import AudioPlayer from "@/components/AudioPlayer";
import { rewriteText, textToSpeech, generateSimulatedAudio } from "@/lib/ai-services";

const Index = () => {
  const [originalText, setOriginalText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [selectedTone, setSelectedTone] = useState<ToneType>("neutral");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const handleRewriteText = async () => {
    if (!originalText.trim()) {
      toast.error("Please enter some text to rewrite");
      return;
    }

    if (originalText.length < 10) {
      toast.error("Text must be at least 10 characters long");
      return;
    }

    setIsRewriting(true);
    setRewrittenText("");
    setAudioUrl(""); // Clear previous audio

    try {
      const result = await rewriteText({
        text: originalText,
        tone: selectedTone
      });
      
      setRewrittenText(result);
      toast.success(`Text rewritten in ${selectedTone} tone!`);
    } catch (error) {
      console.error("Error rewriting text:", error);
      toast.error("Failed to rewrite text. Please try again.");
    } finally {
      setIsRewriting(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!rewrittenText.trim()) {
      toast.error("Please rewrite the text first");
      return;
    }

    setIsGeneratingAudio(true);

    try {
      let audioResult: string;
      
      // Try Web Speech API first
      try {
        audioResult = await textToSpeech({ text: rewrittenText });
        toast.success("Audio generated successfully!");
      } catch (error) {
        console.warn("TTS failed, using simulated audio:", error);
        // Fallback to simulated audio
        audioResult = await generateSimulatedAudio(rewrittenText);
        toast.success("Demo audio generated! (Note: This is a placeholder audio)");
      }
      
      setAudioUrl(audioResult);
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("Failed to generate audio. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const canRewrite = originalText.trim().length >= 10;
  const canGenerateAudio = rewrittenText.trim().length > 0;
  const isProcessing = isRewriting || isGeneratingAudio;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Text Input Section */}
        <div className="space-y-6">
          <TextInput
            value={originalText}
            onChange={setOriginalText}
            disabled={isProcessing}
          />
          
          <ToneSelector
            selectedTone={selectedTone}
            onToneChange={setSelectedTone}
            disabled={isProcessing}
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRewriteText}
            disabled={!canRewrite || isProcessing}
            size="lg"
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {isRewriting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-3"></div>
                Rewriting with AI...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-3" />
                Rewrite with {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)} Tone
              </>
            )}
          </Button>
        </div>

        {/* Text Comparison */}
        {(originalText || rewrittenText || isRewriting) && (
          <TextComparison
            originalText={originalText}
            rewrittenText={rewrittenText}
            isLoading={isRewriting}
          />
        )}

        {/* Audio Generation */}
        {(rewrittenText || isGeneratingAudio || audioUrl) && (
          <AudioPlayer
            audioUrl={audioUrl}
            isGenerating={isGeneratingAudio}
            onGenerate={canGenerateAudio ? handleGenerateAudio : undefined}
            fileName={`echoverse-${selectedTone}-audiobook`}
          />
        )}

        {/* Demo Notice */}
        {originalText && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2 text-foreground">
                🚀 Demo Features
              </h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Text rewriting uses a lightweight AI model optimized for browsers</p>
                <p>• Audio generation uses Web Speech API for real-time synthesis</p>
                <p>• For production use, consider server-based models like GPT-4 or Whisper</p>
                <p>• All processing happens locally in your browser for privacy</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;