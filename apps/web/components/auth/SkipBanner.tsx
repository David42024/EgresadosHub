'use client';

import { cn } from '@/lib/utils';
import { Info, X } from 'lucide-react';
import { useState } from 'react';

interface SkipBannerProps {
  onSkip: () => void;
  isOptional?: boolean;
  className?: string;
}

export function SkipBanner({ onSkip, isOptional = true, className }: SkipBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !isOptional) return null;

  const handleSkip = () => {
    setIsVisible(false);
    // Pequeña espera para la animación
    setTimeout(() => {
      onSkip();
    }, 150);
  };

  return (
    <div
      className={cn(
        'relative mb-6 p-4 bg-warning/10 border border-warning/30 rounded-xl',
        'flex items-center justify-between group animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Info className="h-5 w-5 text-warning flex-shrink-0" />
        <p className="text-sm font-medium text-text-secondary">
          💡 Este paso es opcional — puedes completarlo desde tu perfil
        </p>
      </div>
      
      <button
        onClick={handleSkip}
        className="text-warning hover:text-warning/80 transition-colors p-1 rounded-md hover:bg-warning/20"
        title="Saltar este paso"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
