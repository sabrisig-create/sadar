'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

type DictationInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxLength?: number;
  required?: boolean;
};

export function DictationInput({
  value,
  onChange,
  placeholder,
  minRows = 4,
  maxLength,
  required,
}: DictationInputProps) {
  const [mounted, setMounted] = useState(false);

  const { isListening, isSupported, startListening, stopListening, resetTranscript } =
    useSpeechToText({
      onResult: (newTranscript) => {
        onChange(newTranscript);
      },
    });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartDictation = () => {
    resetTranscript();
    if (value) {
      onChange(value + ' ');
    }
    startListening();
  };

  const handleStopDictation = () => {
    stopListening();
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`resize-none pr-14 min-h-[${minRows * 24}px] text-[16px] leading-relaxed rounded-xl border-[#d2d2d7] focus:border-[#1d1d1f] focus:ring-[#1d1d1f] ${
          isListening ? 'border-[#34c759] ring-2 ring-[#34c759]/20' : ''
        }`}
        rows={minRows}
        maxLength={maxLength}
        required={required}
      />

      {mounted && isSupported && (
        <div className="absolute right-3 top-3">
          {isListening ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleStopDictation}
              className="h-10 w-10 p-0 rounded-xl bg-[#ff3b30] hover:bg-[#ff453a] shadow-lg animate-pulse"
            >
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleStartDictation}
              className="h-10 w-10 p-0 rounded-xl border-[#d2d2d7] hover:bg-[#34c759]/10 hover:border-[#34c759] hover:text-[#34c759] transition-all"
            >
              <Mic className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {isListening && (
        <div className="absolute left-3 bottom-3 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-[#34c759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34c759]"></span>
          </span>
          <span className="text-[13px] text-[#34c759] font-medium">Registrazione...</span>
        </div>
      )}

      {!mounted && (
        <div className="absolute right-3 top-3">
          <div className="h-10 w-10 rounded-xl bg-[#f5f5f7] animate-pulse" />
        </div>
      )}
    </div>
  );
}
