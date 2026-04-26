"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PannellumViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  title?: string;
}

export function PannellumViewer({ open, onOpenChange, imageUrl, title = "Tour 360°" }: PannellumViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadImageAsDataUrl = async (url: string): Promise<string> => {
    try {
      // Intentar cargar directamente si es posible, o usar un proxy si es necesario
      const response = await fetch(url, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Error al convertir imagen a data URL'));
          }
        };
        reader.onerror = () => reject(new Error('Error al leer la imagen'));
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      // Si falla por CORS, intentamos devolver la URL original y que Pannellum maneje el error o intente cargarla
      return url;
    }
  };

  useEffect(() => {
    if (!open || !imageUrl) return;

    const loadPannellum = async () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {}
        viewerInstanceRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      // Pequeña espera para asegurar que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 200));

      if (!viewerRef.current) {
        setIsLoading(false);
        return;
      }

      try {
        // Carga dinámica de pannellum
        // @ts-ignore
        await import("pannellum");
        // @ts-ignore
        await import("pannellum/build/pannellum.css");
        
        const pannellum = (window as any).pannellum;
        
        if (!pannellum || typeof pannellum.viewer !== 'function') {
          setError('La librería de Tour 360° no está disponible');
          setIsLoading(false);
          return;
        }
        
        const dataUrl = await loadImageAsDataUrl(imageUrl);
        
        viewerInstanceRef.current = pannellum.viewer(viewerRef.current, {
          type: "equirectangular",
          panorama: dataUrl,
          autoLoad: true,
          autoRotate: -2,
          showControls: true,
          compass: true,
          keyboardZoom: true,
          mouseZoom: true,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
        });
        
        setIsLoading(false);
      } catch (error: any) {
        setError(error.message || 'Error al cargar el tour 360°');
        setIsLoading(false);
      }
    };

    loadPannellum();

    return () => {
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.destroy();
        } catch (e) {}
        viewerInstanceRef.current = null;
      }
    };
  }, [open, imageUrl]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 overflow-hidden bg-black border-none">
        <DialogHeader className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-lg border border-white/10 backdrop-blur-md">
          <DialogTitle className="text-white text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-white/80 text-xs">
            Visualización de imagen panorámica 360°
          </DialogDescription>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full h-10 w-10 p-0 border border-white/10 backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Cargando experiencia 360°...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/20 backdrop-blur-sm z-10">
            <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8" />
              </div>
              <p className="text-slate-800 font-black text-xl mb-2">Error de Carga</p>
              <p className="text-slate-500 text-sm font-medium">{error}</p>
              <Button 
                onClick={() => onOpenChange(false)}
                className="mt-6 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold"
              >
                Cerrar Visor
              </Button>
            </div>
          </div>
        )}
        <div 
          ref={viewerRef} 
          className="w-full h-full min-h-[500px] relative"
        />
      </DialogContent>
    </Dialog>
  );
}
