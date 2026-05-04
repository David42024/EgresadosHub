// components/ui/ImageUpload.tsx
'use client';
import { useState, useRef } from 'react';
import { Upload, X, Loader2, Link as LinkIcon, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder: 'logo' | 'avatar' | 'cv';
  label?: string;
  className?: string;
}

// Configuración por tipo de upload
const FOLDER_CONFIG = {
  logo: {
    accept: 'image/jpeg,image/png,image/webp',
    maxSize: 2,
    label: 'JPG, PNG, WebP. Máx 2MB.',
    isDocument: false,
  },
  avatar: {
    accept: 'image/jpeg,image/png,image/webp',
    maxSize: 2,
    label: 'JPG, PNG, WebP. Máx 2MB.',
    isDocument: false,
  },
  cv: {
    accept: 'application/pdf',
    maxSize: 5,
    label: 'Solo PDF. Máx 5MB.',
    isDocument: true,
  },
} as const;

export function ImageUpload({
  value, onChange, folder, label, className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = FOLDER_CONFIG[folder];

  const handleUpload = async (file: File) => {
    setShowPreview(false);
    
    // Generar previsualización local inmediata si es imagen
    if (!config.isDocument) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Validar tamaño
    if (file.size > config.maxSize * 1024 * 1024) {
      alert(`El archivo supera el límite de ${config.maxSize}MB`);
      setLocalPreview(null);
      return;
    }

    // Validar tipo
    const allowedTypes = config.accept.split(',');
    if (!allowedTypes.includes(file.type)) {
      alert(`Tipo de archivo no permitido. ${config.label}`);
      setLocalPreview(null);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = folder === 'cv' ? 'cv' : folder === 'logo' ? 'logo' : 'avatar';
      const res = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Error al subir archivo');

      const data = await res.json() as { url: string };
      onChange(data.url);
      setLocalPreview(null);
      setShowUrlInput(false);
    } catch (error) {
      void error;
      alert('Error al subir el archivo');
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (tempUrl.trim() === '') return;
    setShowPreview(false);
    setUploading(true);
    try {
      const endpoint = folder === 'cv' ? 'cv' : folder === 'logo' ? 'logo' : 'avatar';
      const res = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: tempUrl.trim() }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al subir archivo');

      const data = await res.json() as { url: string };
      onChange(data.url);
      setLocalPreview(null); // Limpiar preview local una vez subido con éxito
      setShowUrlInput(false);
    } catch (error) {
      void error;
      alert('Error al procesar la URL');
    } finally {
      setUploading(false);
    }
  };

  // ─── Vista para IMÁGENES (avatar, logo) ───────────────────────────────────
  if (!config.isDocument) {
    return (
      <div className={cn('space-y-2', className)}>
        {label !== undefined && (
          <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {(localPreview || (value !== '' && value !== undefined)) && !config.isDocument && (
              <div className="h-6 w-6 rounded-md overflow-hidden border border-border shadow-sm">
                <img src={localPreview || value} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
            {uploading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Upload className="h-4 w-4" />
            }
            {uploading ? 'Subiendo...' : value !== '' && value !== undefined ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {(localPreview || (value !== '' && value !== undefined)) && !uploading && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setLocalPreview(null);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!showUrlInput && (
             <Button
               type="button"
               variant="ghost"
               size="sm"
               className="h-9 gap-2"
               onClick={() => setShowUrlInput(true)}
               disabled={uploading}
             >
               <LinkIcon className="h-4 w-4" />
               URL
             </Button>
          )}
        </div>

        {showUrlInput && (
          <div className="flex gap-2 mt-2">
            <Input
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="h-9 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') void handleUrlSubmit(); }}
            />
            <Button type="button" size="sm" className="h-9" onClick={() => void handleUrlSubmit()}>
              OK
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-9" onClick={() => setShowUrlInput(false)}>
              ×
            </Button>
          </div>
        )}

        <p className="text-[10px] text-text-muted">{config.label}</p>
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file !== undefined) void handleUpload(file);
          }}
        />
      </div>
    );
  }

  // ─── Vista para PDF (cv) — sin previsualización ───────────────────────────
  return (
    <div className={cn('space-y-2', className)}>
      {label !== undefined && (
        <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {label}
        </label>
      )}

      {/* Estado: subido */}
      {value !== '' && value !== undefined && !uploading && (
        <div className="space-y-3">
          {/* Indicador de subido */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-green-700 dark:text-green-400">
                  CV subido correctamente
                </p>
                <p className="text-[10px] text-green-600">
                  Listo para compartir con empresas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {/* Abrir en nueva pestaña */}
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 gap-1.5 text-xs"
              >
                <ExternalLink className="h-3 w-3" />
                Ver PDF
              </Button>
            </a>

            {/* Iframe embebido toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setShowPreview(prev => !prev)}
            >
              <FileText className="h-3 w-3" />
              {showPreview ? 'Ocultar' : 'Previsualizar'}
            </Button>

            {/* Reemplazar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-gray-400"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3 w-3" />
            </Button>
          </div>

          {/* Previsualización embebida con iframe */}
          {showPreview && (
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
              <iframe
                src={`${value}#toolbar=0&navpanes=0`}
                className="w-full h-64"
                title="Previsualización CV"
              />
            </div>
          )}
        </div>
      )}

      {/* Estado: subiendo */}
      {uploading && (
        <div className="flex items-center gap-2 p-3 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            Subiendo PDF...
          </p>
        </div>
      )}

      {/* Botón de subida */}
      {!uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-dashed w-full justify-center"
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="h-4 w-4" />
          {value !== '' && value !== undefined ? 'Reemplazar PDF' : 'Subir CV (PDF)'}
        </Button>
      )}

      <p className="text-[10px] text-text-muted">{config.label}</p>

      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file !== undefined) void handleUpload(file);
        }}
      />
    </div>
  );
}