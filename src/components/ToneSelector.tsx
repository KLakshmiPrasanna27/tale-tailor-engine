import { Palette, Zap, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ToneType = "neutral" | "suspenseful" | "inspiring";

interface ToneSelectorProps {
  selectedTone: ToneType;
  onToneChange: (tone: ToneType) => void;
  disabled?: boolean;
}

const tones = [
  {
    id: "neutral" as ToneType,
    name: "Neutral",
    description: "Clear, balanced narration perfect for informational content",
    icon: Palette,
    color: "tone-neutral",
    example: "Professional and measured delivery"
  },
  {
    id: "suspenseful" as ToneType,
    name: "Suspenseful",
    description: "Dramatic tension and intrigue for thrilling narratives",
    icon: Zap,
    color: "tone-suspenseful",
    example: "Edge-of-your-seat storytelling"
  },
  {
    id: "inspiring" as ToneType,
    name: "Inspiring",
    description: "Uplifting and motivational tone for empowering content",
    icon: Heart,
    color: "tone-inspiring",
    example: "Uplifting and encouraging delivery"
  }
];

const ToneSelector = ({ selectedTone, onToneChange, disabled }: ToneSelectorProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Choose Tone</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tones.map((tone) => {
            const Icon = tone.icon;
            const isSelected = selectedTone === tone.id;
            
            return (
              <button
                key={tone.id}
                onClick={() => onToneChange(tone.id)}
                disabled={disabled}
                className={cn(
                  "relative group p-4 rounded-lg border-2 transition-all duration-300 text-left",
                  "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border bg-card hover:border-primary/50",
                  disabled && "opacity-50 cursor-not-allowed hover:scale-100"
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isSelected 
                      ? `bg-${tone.color}` 
                      : "bg-muted group-hover:bg-primary/20"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? "text-white" : "text-muted-foreground group-hover:text-primary"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-semibold text-sm transition-colors",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {tone.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {tone.description}
                    </p>
                    <p className="text-xs font-medium mt-2 opacity-75">
                      "{tone.example}"
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Selected:</strong>{" "}
            {tones.find(t => t.id === selectedTone)?.name} tone will be applied to rewrite your content
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToneSelector;