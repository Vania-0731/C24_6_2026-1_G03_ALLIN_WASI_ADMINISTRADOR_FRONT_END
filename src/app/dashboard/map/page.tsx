"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Search, Plus, Filter, ShieldCheck, MapPin, AlertTriangle, Utensils, Hospital, GraduationCap, Edit, Trash2, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { propertyService } from "@/services/properties.service"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PropertyDetailModal } from "@/components/shared/property-detail-modal"

// Import Map component dynamically to avoid SSR issues
const InteractiveMap = dynamic(() => import("@/components/shared/interactive-map"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-[2.5rem] flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando Mapa de Santa Anita...</div>
})

const INITIAL_POINTS: any[] = [
  { id: "1", name: "TECSUP - Sede Principal", category: "educacion", lat: -12.0445, lng: -76.9531, description: "Centro de estudios tecnológico principal.", address: "Av. Cascanueces 120, Santa Anita" },
  { id: "2", name: "Zona Segura: Comisaría Santa Anita", category: "seguridad", lat: -12.0420, lng: -76.9580, description: "Punto de auxilio rápido y vigilancia 24/7.", address: "Av. Los Ruiseñores, Santa Anita" },
  { id: "3", name: "Zona de Riesgo: Jr. Luna Pizarro", category: "riesgo", lat: -12.0480, lng: -76.9450, description: "Área con baja iluminación, transitar con cuidado.", address: "Jr. Luna Pizarro, Santa Anita" },
  { id: "4", name: "Mercado San José", category: "servicio", lat: -12.0400, lng: -76.9500, description: "Abastecimiento de productos de primera necesidad.", address: "Av. La Cultura, Santa Anita" },
]

export default function MapPage() {
  const [properties, setProperties] = React.useState<any[]>([])
  const [points, setPoints] = React.useState<any[]>(INITIAL_POINTS)
  const [view, setView] = React.useState("mapa") // "mapa" o "puntos"
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [addressSuggestions, setAddressSuggestions] = React.useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [isGeocoding, setIsGeocoding] = React.useState(false)
  
  const [newPoint, setNewPoint] = React.useState({
    name: "",
    category: "seguridad",
    address: "",
    lat: -12.0445,
    lng: -76.9531,
    description: ""
  })

  const [selectedProperty, setSelectedProperty] = React.useState<any>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)

  React.useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getAllProperties()
      setProperties(data)
    } catch (error: any) {
      toast.error("Error al cargar propiedades")
    }
  }

  // Debounce para búsqueda de direcciones
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (newPoint.address.length > 3 && showSuggestions) {
        searchAddress(newPoint.address)
      } else {
        setAddressSuggestions([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [newPoint.address])

  const searchAddress = async (query: string) => {
    setIsGeocoding(true)
    try {
      const q = encodeURIComponent(`${query}, Santa Anita, Lima, Peru`)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&addressdetails=1&limit=5`)
      const data = await response.json()
      setAddressSuggestions(data)
    } catch (error) {
      console.error("Error geocoding:", error)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleSelectSuggestion = (suggestion: any) => {
    setNewPoint({
      ...newPoint,
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    })
    setAddressSuggestions([])
    setShowSuggestions(false)
    toast.success("Dirección seleccionada")
  }

  const handleAddPoint = () => {
    if (!newPoint.name || !newPoint.address) return toast.error("Nombre y dirección son obligatorios")
    const pointWithId = {
      ...newPoint,
      id: Math.random().toString(36).substr(2, 9),
    }
    setPoints([...points, pointWithId])
    setIsAddModalOpen(false)
    toast.success("Punto de interés agregado")
    setNewPoint({ name: "", category: "seguridad", address: "", lat: -12.0445, lng: -76.9531, description: "" })
  }

  const handleDeletePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id))
    toast.success("Punto eliminado")
  }

  // Filtrado
  const filteredPoints = points.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-inkwell tracking-tight">Mapa Interactivo Santa Anita</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Allin Wasi - Gestión de Entorno y Seguridad Estudiantil</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Punto
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Cuartos en Santa Anita" value={properties.length.toString()} icon={Home} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Puntos de Interés" value={points.length.toString()} icon={MapPin} color="bg-blue-100 text-blue-600" />
        <StatCard label="Zonas de Seguridad" value={points.filter(p => p.category === 'seguridad').length.toString()} icon={ShieldCheck} color="bg-emerald-100 text-emerald-600" />
        <StatCard label="Puntos de Riesgo" value={points.filter(p => p.category === 'riesgo').length.toString()} icon={AlertTriangle} color="bg-red-100 text-red-600" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-full lg:w-auto">
          <FilterTab label="Vista del Mapa" active={view === "mapa"} onClick={() => setView("mapa")} />
          <FilterTab label="Listado de Puntos" active={view === "puntos"} onClick={() => setView("puntos")} />
        </div>
        <div className="relative w-full lg:max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
           <Input 
             placeholder="Buscar cuarto, mercado, zona..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 bg-slate-50 border-none rounded-xl text-xs font-bold focus-visible:ring-emerald-500"
           />
        </div>
      </div>

      {/* Interactive Map Component */}
      {view === "mapa" ? (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <InteractiveMap 
            properties={filteredProperties} 
            points={filteredPoints} 
            onSelectProperty={(prop: any) => {
              setSelectedProperty(prop)
              setIsDetailModalOpen(true)
            }}
          />
        </div>
      ) : (
        <Card className="border-none shadow-xl shadow-slate-100/50 rounded-[2rem] overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-inkwell">Puntos de Interés Registrados</h3>
            <Badge className="bg-slate-100 text-slate-500 border-none">{filteredPoints.length} encontrados</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30">
                  <th className="px-8 py-5">Lugar</th>
                  <th className="px-8 py-5">Categoría</th>
                  <th className="px-8 py-5">Ubicación</th>
                  <th className="px-8 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filteredPoints.length > 0 ? filteredPoints.map((point) => (
                   <MapRow 
                     key={point.id}
                     id={point.id}
                     name={point.name} 
                     category={point.category} 
                     location={point.address || `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`} 
                     icon={point.category === 'seguridad' ? ShieldCheck : point.category === 'riesgo' ? AlertTriangle : MapPin}
                     iconBg={point.category === 'seguridad' ? 'bg-emerald-50 text-emerald-600' : point.category === 'riesgo' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
                     onDelete={() => handleDeletePoint(point.id)}
                   />
                 )) : (
                   <tr>
                     <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-bold text-sm">No se encontraron resultados para "{searchTerm}"</td>
                   </tr>
                 )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Agregar Punto */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-8">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-black text-inkwell tracking-tight">Nuevo Punto de Interés</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Añade lugares estratégicos en Santa Anita</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">¿Qué lugar es?</Label>
              <Input 
                value={newPoint.name} 
                onChange={(e) => setNewPoint({...newPoint, name: e.target.value})}
                placeholder="Ej: Mercado San José" 
                className="rounded-2xl border-slate-100 bg-slate-50 font-bold h-12 focus-visible:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Categoría de Seguridad</Label>
              <Select 
                value={newPoint.category} 
                onValueChange={(val: any) => setNewPoint({...newPoint, category: val})}
              >
                <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 font-bold h-12 text-xs">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100">
                  <SelectItem value="seguridad" className="font-bold">✅ Zona Segura</SelectItem>
                  <SelectItem value="riesgo" className="font-bold text-red-500">⚠️ Zona de Riesgo</SelectItem>
                  <SelectItem value="servicio" className="font-bold">🏪 Servicio Estudiantil</SelectItem>
                  <SelectItem value="educacion" className="font-bold">🎓 Educación (Sede)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dirección Exacta (Santa Anita)</Label>
              <div className="relative">
                <Input 
                  value={newPoint.address} 
                  onChange={(e) => {
                    setNewPoint({...newPoint, address: e.target.value})
                    setShowSuggestions(true)
                  }}
                  placeholder="Escribe la calle, av o jr..." 
                  className="rounded-2xl border-slate-100 bg-slate-50 font-bold h-12 pr-12 focus-visible:ring-emerald-500"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                   {isGeocoding ? (
                     <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
                   ) : (
                     <MapPin className="h-5 w-5 text-slate-300" />
                   )}
                </div>

                {/* Listado de sugerencias */}
                {addressSuggestions.length > 0 && showSuggestions && (
                  <div className="absolute z-[1001] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors border-b border-slate-50 last:border-none flex items-start gap-3"
                      >
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-300" />
                        <span>{suggestion.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-slate-400 font-medium ml-1">Escribe para ver sugerencias reales en Santa Anita.</p>
            </div>

            {/* Coordenadas informativas (No editables por el usuario para evitar errores) */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
               <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Latitud</p>
                  <p className="text-xs font-black text-inkwell">{newPoint.lat.toFixed(6)}</p>
               </div>
               <div className="h-8 w-px bg-slate-200" />
               <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Longitud</p>
                  <p className="text-xs font-black text-inkwell">{newPoint.lng.toFixed(6)}</p>
               </div>
               <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
               </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="rounded-2xl font-bold h-12 px-6 hover:bg-slate-100 transition-all">Cancelar</Button>
            <Button onClick={handleAddPoint} disabled={isGeocoding} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-12 px-10 shadow-lg shadow-emerald-100/50 transition-all active:scale-95 disabled:opacity-50">
              Guardar en el Mapa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalle de Propiedad */}
      {selectedProperty && (
        <PropertyDetailModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          property={selectedProperty}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all duration-300 border border-transparent hover:border-slate-100">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm", color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-2xl font-black text-inkwell leading-none tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function FilterTab({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-tighter",
        active ? "bg-white text-emerald-700 shadow-md scale-105" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {label}
    </button>
  )
}

function MapRow({ id, name, category, location, icon: Icon, iconBg, onDelete }: any) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center border border-transparent group-hover:border-slate-200 group-hover:rotate-6 transition-all duration-300 shadow-sm", iconBg)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-inkwell tracking-tight">{name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación Registrada</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <Badge variant="outline" className="rounded-xl px-3 py-1 border-slate-100 text-slate-500 font-black text-[9px] uppercase tracking-widest">
          {category}
        </Badge>
      </td>
      <td className="px-8 py-6 text-xs font-bold text-slate-500 max-w-[200px] truncate">{location}</td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-end gap-2">
           <Button onClick={onDelete} variant="ghost" size="icon" className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 hover:rotate-6">
             <Trash2 className="h-4 w-4" />
           </Button>
        </div>
      </td>
    </tr>
  )
}
