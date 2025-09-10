import { FileText, Sparkles, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface TextComparisonProps {
  originalText: string;
  rewrittenText: string;
  isLoading?: boolean;
}

const TextComparison = ({ originalText, rewrittenText, isLoading }: TextComparisonProps) => {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedRewritten, setCopiedRewritten] = useState(false);

  const copyToClipboard = async (text: string, type: 'original' | 'rewritten') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'original') {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedRewritten(true);
        setTimeout(() => setCopiedRewritten(false), 2000);
      }
      toast.success(`${type === 'original' ? 'Original' : 'Rewritten'} text copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };

  if (!originalText && !rewrittenText && !isLoading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original Text */}
      <Card className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span>Original Text</span>
            </div>
            {originalText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(originalText, 'original')}
                className="hover:bg-muted"
              >
                {copiedOriginal ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {originalText ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {originalText}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Your original text will appear here...
              </p>
            )}
          </div>
          {originalText && (
            <div className="mt-3 text-xs text-muted-foreground">
              {originalText.length} characters • {originalText.split(/\s+/).length} words
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewritten Text */}
      <Card className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Rewritten Text</span>
            </div>
            {rewrittenText && !isLoading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(rewrittenText, 'rewritten')}
                className="hover:bg-muted"
              >
                {copiedRewritten ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">
                    AI is rewriting your text...
                  </p>
                </div>
              </div>
            ) : rewrittenText ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {rewrittenText}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm italic">
                AI-rewritten text will appear here after processing...
              </p>
            )}
          </div>
          {rewrittenText && !isLoading && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {rewrittenText.length} characters • {rewrittenText.split(/\s+/).length} words
              </span>
              <span className="text-primary font-medium">
                ✨ AI Enhanced
              </span>
            </div>
          )}
        </CardContent>

        {/* Processing overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <div className="absolute top-4 right-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TextComparison;