import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface TextInputProps {
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

const TextInput = ({ value, onChange, disabled }: TextInputProps) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileRead = (file: File) => {
    if (file.type !== "text/plain") {
      toast.error("Please upload a .txt file");
      return;
    }

    if (file.size > 1024 * 1024) { // 1MB limit
      toast.error("File size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onChange(text);
      toast.success("File uploaded successfully!");
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0]);
    }
  };

  const clearText = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Input Text</h3>
          </div>
          {value && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearText}
              disabled={disabled}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Paste your text here or drag & drop a .txt file..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="min-h-[200px] resize-none text-base leading-relaxed"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="hover:bg-primary/10 hover:border-primary"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload .txt File
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {value.length} characters
              </span>
            </div>

            {value.length > 10000 && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Long texts may take more time to process
              </span>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Drag overlay */}
        {dragActive && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-lg font-medium text-primary">Drop your .txt file here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TextInput;