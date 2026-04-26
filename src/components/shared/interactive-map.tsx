"use client"

import * as React from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShieldCheck, AlertTriangle, Home, Utensils, Hospital, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

// Fix for Leaflet default icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// Custom icons using Lucide (rendered as HTML)
const createCustomIcon = (color: string) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 10px; display: flex; items-center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
  className: "",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

interface PointOfInterest {
  id: string
  name: string
  category: "seguridad" | "riesgo" | "servicio" | "educacion" | "comida" | "vivienda"
  lat: number
  lng: number
  description: string
}

const SANTA_ANITA_BOUNDS: L.LatLngBoundsExpression = [
  [-12.0700, -76.9850], // Suroeste
  [-12.0200, -76.9200], // Noreste
];

interface InteractiveMapProps {
  points: PointOfInterest[]
  properties?: any[]
  onPointClick?: (point: PointOfInterest) => void
  onSelectProperty?: (property: any) => void
}

export default function InteractiveMap({ points, properties = [], onPointClick, onSelectProperty }: InteractiveMapProps) {
  const center: [number, number] = [-12.0445, -76.9531] // Centro de Santa Anita

  return (
    <Card className="border-none shadow-2xl shadow-slate-100 rounded-[2.5rem] overflow-hidden bg-white">
      <CardContent className="p-0">
        <div className="h-[600px] w-full relative z-0">
          <MapContainer 
            center={center} 
            zoom={15} 
            scrollWheelZoom={true}
            maxBounds={SANTA_ANITA_BOUNDS}
            maxBoundsViscosity={1.0}
            minZoom={14}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Propiedades (Cuartos) */}
            {properties.map((prop) => (
              <Marker 
                key={prop.id}
                position={[Number(prop.latitude) || -12.045, Number(prop.longitude) || -76.954]} 
                icon={createCustomIcon("#059669")} 
              >
                <Popup>
                  <div className="p-2 space-y-2">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[9px]">Disponible</Badge>
                    <p className="font-black text-inkwell text-xs">{prop.title}</p>
                    <p className="text-[10px] font-bold text-emerald-600">S/ {prop.monthlyPrice}/mes</p>
                    <Button 
                      size="sm" 
                      onClick={() => onSelectProperty && onSelectProperty(prop)}
                      className="w-full h-7 text-[10px] bg-inkwell text-white rounded-lg hover:bg-emerald-600 transition-all"
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Puntos de Interés */}
            {points.map((point) => (
              <React.Fragment key={point.id}>
                <Marker 
                  position={[point.lat, point.lng]}
                  icon={getIconByCategory(point.category)}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 space-y-2">
                       <div className="flex items-center gap-2">
                         <CategoryBadge category={point.category} />
                       </div>
                       <p className="font-black text-inkwell text-sm">{point.name}</p>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{point.description}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Zonas de influencia */}
                {point.category === 'riesgo' && (
                  <Circle 
                    center={[point.lat, point.lng]}
                    radius={300}
                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 1 }}
                  />
                )}
                {point.category === 'seguridad' && (
                  <Circle 
                    center={[point.lat, point.lng]}
                    radius={300}
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 1 }}
                  />
                )}
              </React.Fragment>
            ))}
          </MapContainer>

          {/* Map Legend Floating */}
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/50 space-y-3">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Leyenda del Mapa</p>
             <LegendItem color="bg-emerald-500" label="Zonas Seguras" />
             <LegendItem color="bg-red-500" label="Zonas de Riesgo" />
             <LegendItem color="bg-blue-500" label="Servicios" />
             <LegendItem color="bg-amber-500" label="Educación" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getIconByCategory(category: string) {
  switch (category) {
    case 'seguridad': return createCustomIcon("#10b981") // Emerald
    case 'riesgo': return createCustomIcon("#ef4444") // Red
    case 'educacion': return createCustomIcon("#f59e0b") // Amber
    default: return createCustomIcon("#3b82f6") // Blue
  }
}

function CategoryBadge({ category }: { category: string }) {
  const labels: any = {
    seguridad: "Zona Segura",
    riesgo: "Zona de Riesgo",
    educacion: "Educación",
    servicio: "Servicio",
  }
  const colors: any = {
    seguridad: "bg-emerald-100 text-emerald-700 border-emerald-200",
    riesgo: "bg-red-100 text-red-700 border-red-200",
    educacion: "bg-amber-100 text-amber-700 border-amber-200",
    servicio: "bg-blue-100 text-blue-700 border-blue-200",
  }
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border", colors[category])}>
      {labels[category] || category}
    </span>
  )
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-3 w-3 rounded-full", color)} />
      <span className="text-[11px] font-bold text-slate-700">{label}</span>
    </div>
  )
}
