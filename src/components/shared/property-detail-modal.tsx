"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, DollarSign, Home, Bath, Ruler, 
  Camera, Sparkles, CheckCircle2, XCircle, 
  User, ExternalLink, Calendar, Info
} from "lucide-react";
import { PannellumViewer } from "./PannellumViewer";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  room: "Habitación",
  apartment: "Departamento",
  house: "Casa",
  studio: "Estudio",
};

const BATHROOM_LABELS: Record<string, string> = {
  private: "Privado",
  shared: "Compartido",
};

export function PropertyDetailModal({ isOpen, onClose, property, onApprove, onReject }: PropertyDetailModalProps) {
  const [selectedTour, setSelectedTour] = React.useState<{ url: string; title: string } | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  if (!property) return null;

  const tours = property.images?.filter((img: any) => img.is360Tour) || [];
  const regularImages = property.images?.filter((img: any) => !img.is360Tour) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border-none shadow-2xl">
        <div className="sr-only">
          <DialogTitle>Detalle de la Propiedad: {property.title}</DialogTitle>
          <DialogDescription>
            Información completa sobre la propiedad ubicada en {property.address}.
          </DialogDescription>
        </div>
        {/* Header Moderación */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
               <Home className="h-5 w-5" />
             </div>
             <div>
               <h2 className="text-xl font-black text-inkwell tracking-tight">Detalle de Propiedad</h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revisión y Moderación de Inventario</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             {property.status === 'draft' && (
               <>
                 <Button 
                   onClick={() => onApprove?.(property.id)}
                   className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 h-10 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                 >
                   <CheckCircle2 className="mr-2 h-4 w-4" /> Aprobar Anuncio
                 </Button>
                 <Button 
                   onClick={() => onReject?.(property.id)}
                   variant="outline"
                   className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl px-6 h-10"
                 >
                   <XCircle className="mr-2 h-4 w-4" /> Rechazar
                 </Button>
               </>
             )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={property.status} />
                    <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-bold text-[10px]">
                      {TYPE_LABELS[property.propertyType] || property.propertyType}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-black text-inkwell leading-tight">{property.title}</h1>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{property.city}, {property.address}</span>
                  </div>
               </div>

               {/* Galería Premium */}
               <div className="space-y-3">
                  <h3 className="text-base font-black text-inkwell flex items-center gap-2">
                    <Camera className="h-4 w-4 text-emerald-600" /> Galería de Fotos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {regularImages.length > 0 ? regularImages.map((img: any, idx: number) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedImage(img.url)}
                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer group shadow-sm"
                      >
                        <img src={img.url} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Propiedad" />
                      </div>
                    )) : (
                      <div className="col-span-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <Camera className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Sin imágenes</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Tours 360 */}
               <div className="space-y-3">
                  <h3 className="text-base font-black text-inkwell flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" /> Tours Virtuales 360°
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tours.length > 0 ? tours.map((tour: any, idx: number) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 flex items-center justify-between group hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                           <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md transition-transform">
                             <Camera className="h-5 w-5" />
                           </div>
                           <div>
                             <p className="text-xs font-black text-inkwell">Tour Virtual {idx + 1}</p>
                             <p className="text-[9px] font-bold text-emerald-600 uppercase">360°</p>
                           </div>
                        </div>
                        <Button 
                          onClick={() => setSelectedTour({ url: tour.url, title: `Tour ${idx + 1}` })}
                          size="sm" className="h-8 px-3 text-[11px] bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 font-bold rounded-lg"
                        >
                          Ver
                        </Button>
                      </div>
                    )) : (
                      <div className="col-span-full p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center text-slate-400">
                        <p className="text-[10px] font-bold uppercase tracking-widest">No hay tours 360°</p>
                      </div>
                    )}
                  </div>
               </div>

               {/* Descripción */}
               <div className="space-y-3">
                  <h3 className="text-base font-black text-inkwell flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600" /> Descripción
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 text-slate-600 text-sm font-medium leading-relaxed">
                    {property.description || "Sin descripción proporcionada."}
                  </div>
               </div>
            </div>

            {/* Sidebar Detalle */}
            <div className="space-y-5">
               <Card className="border-none shadow-md rounded-[1.5rem] overflow-hidden bg-white border border-slate-50">
                  <div className="p-4 bg-emerald-600 text-white">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Precio Mensual</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold">S/</span>
                      <span className="text-3xl font-black">{property.monthlyPrice}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <FeatureItem icon={Home} label="Tipo" value={TYPE_LABELS[property.propertyType] || property.propertyType} />
                    <FeatureItem icon={Ruler} label="Tamaño" value={`${property.size || 0} m²`} />
                    <FeatureItem icon={Bath} label="Baños" value={property.bathrooms || "—"} />
                    <FeatureItem icon={CheckCircle2} label="Baño Propio" value={property.bathroomType === 'private' ? 'Sí' : 'No'} />
                  </div>
               </Card>

               <Card className="border-none shadow-md rounded-[1.5rem] overflow-hidden bg-white border border-slate-50 p-5 space-y-3">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Anfitrión</h4>
                  <div className="flex items-center gap-2.5">
                     <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black border border-slate-200 text-sm">
                       {property.landlord?.fullName?.charAt(0)}
                     </div>
                     <div>
                       <p className="text-xs font-black text-inkwell">{property.landlord?.fullName}</p>
                       <p className="text-[9px] font-bold text-slate-400">{property.landlord?.email}</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full h-9 justify-start text-emerald-600 font-bold hover:bg-emerald-50 rounded-lg px-3 text-xs">
                    <User className="mr-2 h-3.5 w-3.5" /> Ver Perfil
                  </Button>
               </Card>

               <div className="p-6 rounded-[2rem] bg-slate-900 text-white space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Registrado el</p>
                  </div>
                  <p className="text-lg font-bold">
                    {property.createdAt ? format(new Date(property.createdAt), "dd 'de' MMMM, yyyy", { locale: es }) : '—'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Visor de Tour */}
      <PannellumViewer 
        open={!!selectedTour} 
        onOpenChange={() => setSelectedTour(null)} 
        imageUrl={selectedTour?.url || ""} 
        title={selectedTour?.title} 
      />

      {/* Lightbox Imagen */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-8 animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain" alt="Preview" />
          <Button variant="ghost" className="absolute top-8 right-8 text-white h-12 w-12 rounded-full bg-white/10 hover:bg-white/20">
             <XCircle className="h-8 w-8" />
          </Button>
        </div>
      )}
    </Dialog>
  );
}

function FeatureItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-sm font-black text-inkwell">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "available": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "rented": "bg-blue-100 text-blue-700 border-blue-200",
    "reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "draft": "bg-orange-100 text-orange-700 border-orange-200",
  }

  const labels: any = {
    "available": "Disponible",
    "rented": "Alquilado",
    "reserved": "Reservado",
    "draft": "Pendiente de Aprobación",
  }

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
    )}>
      {labels[status] || status}
    </span>
  );
}
