"use client"

import * as React from "react"
import {  Home,  Search,  Filter,  MoreHorizontal,  MapPin,  DollarSign,  Calendar,  Eye,  CheckCircle2,  XCircle,  Clock,  Building2,  Hotel} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { propertyService } from "@/services/properties.service"
import { toast } from "sonner"

export default function PropertiesPage() {
  const [properties, setProperties] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("todos")
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getAllProperties()
      setProperties(data)
    } catch (error: any) {
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await propertyService.updateStatus(id, status)
      toast.success(`Propiedad ${status === 'available' ? 'aprobada' : 'rechazada'} con éxito`)
      fetchProperties()
    } catch (error: any) {
      toast.error(error.toString())
    }
  }

  const filteredProperties = properties.filter(prop => {
    const matchesFilter = filter === "todos" || prop.status === filter
    const matchesSearch = prop.title.toLowerCase().includes(search.toLowerCase()) || 
                         prop.address.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-700">Gestión de Propiedades</h1>
          <p className="text-slate-500">Supervisa y modera los anuncios de habitaciones y departamentos</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por título o dirección..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus-visible:ring-emerald-500"
              />
            </div>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-lg gap-1">
            <FilterTab label="Todos" active={filter === "todos"} onClick={() => setFilter("todos")} />
            <FilterTab label="Borradores" active={filter === "draft"} onClick={() => setFilter("draft")} />
            <FilterTab label="Disponibles" active={filter === "available"} onClick={() => setFilter("available")} />
            <FilterTab label="Alquilados" active={filter === "rented"} onClick={() => setFilter("rented")} />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/50">
                  <th className="px-6 py-4">Propiedad</th>
                  <th className="px-6 py-4">Arrendador</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={5} className="text-center py-20 text-slate-400">Cargando propiedades...</td></tr>
                ) : filteredProperties.length === 0 ? (
                   <tr><td colSpan={5} className="text-center py-20 text-slate-400">No se encontraron propiedades</td></tr>
                ) : (
                  filteredProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 overflow-hidden">
                             {prop.propertyType === 'apartment' ? <Building2 className="h-6 w-6" /> : <Hotel className="h-6 w-6" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-inkwell">{prop.title}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {prop.city}, {prop.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                             {prop.landlord?.fullName?.charAt(0)}
                           </div>
                           <span className="text-xs text-slate-600">{prop.landlord?.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-0.5 text-xs font-bold text-inkwell">
                          <span className="text-[10px] text-slate-400">S/</span>
                          {prop.monthlyPrice}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={prop.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                           {prop.status === 'draft' && (
                             <Button 
                              onClick={() => handleStatusUpdate(prop.id, 'available')}
                              variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                             >
                               <CheckCircle2 className="h-4 w-4" />
                             </Button>
                           )}
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-inkwell">
                             <Eye className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500">
                             <XCircle className="h-4 w-4" />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

function FilterTab({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
        active ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-emerald-700"
      )}
    >
      {label}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "available": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "rented": "bg-blue-100 text-blue-700 border-blue-200",
    "reserved": "bg-amber-100 text-amber-700 border-amber-200",
    "draft": "bg-slate-100 text-slate-600 border-slate-200",
  }

  const labels: any = {
    "available": "Disponible",
    "rented": "Alquilado",
    "reserved": "Reservado",
    "draft": "Borrador",
  }

  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
      styles[status] || "bg-slate-100 text-slate-600 border-slate-200"
    )}>
      {labels[status] || status}
    </span>
  )
}
