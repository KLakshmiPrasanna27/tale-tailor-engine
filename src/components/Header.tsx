import { BookOpen, Headphones } from "lucide-react";

const Header = () => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-background to-secondary/50 border-b border-border">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative bg-primary rounded-full p-3">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                EchoVerse
              </h1>
              <p className="text-muted-foreground text-lg">
                AI-Powered Audiobook Creation
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-card/50 rounded-full px-4 py-2 border border-border/50">
            <Headphones className="h-5 w-5 text-audio" />
            <span className="text-sm font-medium text-muted-foreground">
              Transform Text to Audio
            </span>
          </div>
        </div>
        
        <div className="mt-6 max-w-2xl">
          <p className="text-foreground/80 text-lg leading-relaxed">
            Transform your written content into engaging audiobooks with AI-powered 
            tone adaptation and natural voice synthesis.
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-32 -translate-x-16"></div>
    </header>
  );
};

export default Header;