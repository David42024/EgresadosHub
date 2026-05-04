'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StepCardProps {
  children: ReactNode;
  stepNumber: number;
  title: string;
  subtitle?: string;
  className?: string;
}

export function StepCard({ 
  children, 
  stepNumber, 
  title, 
  subtitle,
  className 
}: StepCardProps) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className={cn(
          'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl',
          'transition-all duration-300 hover:shadow-2xl',
          className
        )}>
          <CardContent className="p-8 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-black text-lg mb-2">
                {stepNumber}
              </div>
              <h1 className="text-2xl font-black tracking-tight text-text-primary">
                {title}
              </h1>
              {subtitle && (
                <p className="text-text-secondary font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-6">
              {children}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
