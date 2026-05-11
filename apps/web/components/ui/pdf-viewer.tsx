'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Download, X } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title?: string;
  children?: React.ReactNode;
}

export function PDFViewer({ url, title = 'Documento', children }: PDFViewerProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  // Verificar si es un PDF
  const isPDF = url.toLowerCase().endsWith('.pdf');
  
  // URL de Google Docs Viewer como fallback
  const googleViewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children || (
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ver documento
            </span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1"
                onClick={() => window.open(url, '_blank')}
              >
                <Download className="h-4 w-4" />
                Descargar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 h-[calc(90vh-60px)] bg-gray-100 dark:bg-gray-900">
            {error || !isPDF ? (
              // Fallback para cuando el PDF no carga o no es PDF
              <div className="flex flex-col items-center justify-center h-full p-8">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                  No se puede mostrar el documento en el visor
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => window.open(url, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir en nueva pestaña
                  </Button>
                  <Button variant="outline" onClick={() => setError(false)}>
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={googleViewerUrl}
                className="w-full h-full border-0"
                title={title}
                onError={() => setError(true)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
