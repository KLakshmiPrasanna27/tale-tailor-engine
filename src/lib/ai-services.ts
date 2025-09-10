import { pipeline } from "@huggingface/transformers";

// Types
export interface TextRewriteOptions {
  text: string;
  tone: "neutral" | "suspenseful" | "inspiring";
}

export interface TTSOptions {
  text: string;
  voice?: string;
}

// Singleton pipeline instances
let textGenerationPipeline: any = null;
let ttsAvailable = false;

// Initialize text generation pipeline
export const initializeTextGeneration = async () => {
  if (!textGenerationPipeline) {
    try {
      // Using a smaller, faster model for demo purposes
      textGenerationPipeline = await pipeline(
        "text2text-generation",
        "google/flan-t5-small",
        { device: "webgpu" }
      );
    } catch (error) {
      console.warn("WebGPU not available, falling back to CPU");
      textGenerationPipeline = await pipeline(
        "text2text-generation",
        "google/flan-t5-small"
      );
    }
  }
  return textGenerationPipeline;
};

// Check if TTS is available in the browser
export const checkTTSAvailability = () => {
  ttsAvailable = 'speechSynthesis' in window;
  return ttsAvailable;
};

// Rewrite text with specified tone
export const rewriteText = async ({ text, tone }: TextRewriteOptions): Promise<string> => {
  try {
    const generator = await initializeTextGeneration();
    
    const tonePrompts = {
      neutral: `Rewrite the following text in a clear, balanced, and professional tone suitable for audiobooks: "${text}"`,
      suspenseful: `Rewrite the following text to create dramatic tension and intrigue, perfect for thrilling audiobook narration: "${text}"`,
      inspiring: `Rewrite the following text in an uplifting, motivational tone that inspires and empowers listeners: "${text}"`
    };

    const prompt = tonePrompts[tone];
    
    // For longer texts, we'll process in chunks
    if (text.length > 1000) {
      const chunks = text.match(/.{1,800}(?:\s|$)/g) || [text];
      const rewrittenChunks = [];
      
      for (const chunk of chunks) {
        const chunkPrompt = tonePrompts[tone].replace(text, chunk.trim());
        const result = await generator(chunkPrompt, {
          max_length: Math.min(chunk.length * 1.5, 512),
          do_sample: true,
          temperature: 0.7,
        });
        
        if (Array.isArray(result) && result[0]?.generated_text) {
          rewrittenChunks.push(result[0].generated_text);
        }
      }
      
      return rewrittenChunks.join(' ');
    } else {
      const result = await generator(prompt, {
        max_length: Math.min(text.length * 1.5, 512),
        do_sample: true,
        temperature: 0.7,
      });

      if (Array.isArray(result) && result[0]?.generated_text) {
        return result[0].generated_text;
      }
    }
    
    throw new Error("Failed to generate rewritten text");
  } catch (error) {
    console.error("Error rewriting text:", error);
    // Fallback: return a simulated rewrite based on tone
    return simulateRewrite(text, tone);
  }
};

// Fallback simulation when AI model fails
const simulateRewrite = (text: string, tone: string): string => {
  const toneModifiers = {
    neutral: {
      prefix: "In clear terms, ",
      style: text => text.replace(/!/g, '.').replace(/\?/g, '.'),
    },
    suspenseful: {
      prefix: "With growing tension, ",
      style: text => text.replace(/\./g, '...').replace(/,/g, ',') + " What happens next?",
    },
    inspiring: {
      prefix: "With great enthusiasm, ",
      style: text => text.replace(/\./g, '!') + " This is truly remarkable!",
    }
  };

  const modifier = toneModifiers[tone as keyof typeof toneModifiers];
  if (modifier) {
    return modifier.prefix + modifier.style(text);
  }
  return text;
};

// Convert text to speech using Web Speech API
export const textToSpeech = async ({ text }: TTSOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!checkTTSAvailability()) {
      reject(new Error("Text-to-speech not supported in this browser"));
      return;
    }

    try {
      // Create audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();
      
      // Set up speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Natural')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Record the speech
      const mediaRecorder = new MediaRecorder(dest.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve(audioUrl);
      };

      utterance.onstart = () => {
        mediaRecorder.start();
      };

      utterance.onend = () => {
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500);
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

// Alternative TTS using a simulated audio generation
export const generateSimulatedAudio = async (text: string): Promise<string> => {
  // This creates a simple beep pattern as a fallback
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const duration = Math.min(text.length * 0.1, 30); // Max 30 seconds
  
  const buffer = audioContext.createBuffer(1, duration * audioContext.sampleRate, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate a simple tone pattern
  for (let i = 0; i < data.length; i++) {
    const time = i / audioContext.sampleRate;
    data[i] = Math.sin(2 * Math.PI * 440 * time) * 0.1 * Math.exp(-time * 2);
  }
  
  // Convert to blob
  const wav = audioBufferToWav(buffer);
  const blob = new Blob([wav], { type: 'audio/wav' });
  
  return URL.createObjectURL(blob);
};

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float32 to int16
  const data = buffer.getChannelData(0);
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return arrayBuffer;
}