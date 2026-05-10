'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
      <div className="h-20 w-20 rounded-full bg-error/10 flex items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-error" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-text-primary">Algo salió mal</h2>
        <p className="text-sm text-text-secondary">
          Ocurrió un error al cargar esta sección. Esto puede deberse a un problema 
          temporal con el servidor o la conexión.
        </p>
        {error.message && (
          <p className="text-xs text-text-muted font-mono bg-bg-elevated p-3 rounded-lg mt-2 break-all">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="primary" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Intentar de nuevo
      </Button>
    </div>
  );
}
