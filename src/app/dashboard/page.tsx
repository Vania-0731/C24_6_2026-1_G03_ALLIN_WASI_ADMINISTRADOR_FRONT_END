"use client"

import * as React from "react"
import { Camera, Clock, CheckCircle2, Eye, Plus, MoreHorizontal, MapPin,  Settings,  Edit,  Trash2,  ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth.service"

const stats = [
  { label: "Total Tours", value: "5", icon: Camera, color: "bg-slate-100 text-slate-600" },
  { label: "Pendientes", value: "2", icon: Clock, color: "bg-orange-100 text-orange-600" },
  { label: "Aprobados", value: "2", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
  { label: "Total Visitas", value: "423", icon: Eye, color: "bg-blue-100 text-blue-600" },
]

const tours = [
  {
    id: "1245",
    title: "Departamento Los Olivos - 2 hab",
    propertyId: "#1245",
    price: "S/ 800/mes",
    landlord: "Maria González",
    location: "Los Olivos, Lima",
    status: "Pendiente",
    visits: 0,
    date: "2024-01-15",
  },
  {
    id: "1246",
    title: "Cuarto Independiente SMP",
    propertyId: "#1246",
    price: "S/ 450/mes",
    landlord: "Carlos Ruiz",
    location: "San Martín de Porres, Lima",
    status: "Aprobado",
    visits: 234,
    date: "2024-01-10",
  },
  {
    id: "1247",
    title: "Departamento San Isidro Premium",
    propertyId: "#1247",
    price: "S/ 1,200/mes",
    landlord: "Ana Torres",
    location: "San Isidro, Lima",
    status: "Aprobado",
    visits: 189,
    date: "2024-01-08",
  },
  {
    id: "1248",
    title: "Cuarto Cerca a TECSUP",
    propertyId: "#1248",
    price: "S/ 550/mes",
    landlord: "Roberto Silva",
    location: "Santa Anita, Lima",
    status: "Rechazado",
    visits: 0,
    date: "2024-01-12",
  },
]

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    setUser(authService.getUser())
  }, [])

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-inkwell">
            ¡Bienvenido, <span className="text-creme-brulee">{user?.fullName || 'Administrador'}</span>! 👋
          </h1>
          <p className="text-slate-500">Aquí tienes un resumen de la plataforma Allin Wasi</p>
        </div>
        <Button className="bg-inkwell hover:bg-slate-800 text-white gap-2 font-bold shadow-lg">
          <Plus className="h-4 w-4" /> Crear Nuevo Tour
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-inkwell">Gestión de Tours 360°</h2>
        <p className="text-slate-500">Administra y modera las visitas virtuales de las propiedades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-inkwell leading-none mb-1">{stat.value}</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col space-y-6">
         <div className="flex items-center gap-4">
           <div className="flex-1 max-w-lg">
             <div className="relative">
               <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <Input 
                 placeholder="Buscar tours, anfitriones o ubicaciones..." 
                 className="pl-10 bg-white border-slate-200"
               />
             </div>
           </div>
           <div className="flex bg-slate-200/50 p-1 rounded-lg gap-1">
             <FilterBtn label="Todos" active />
             <FilterBtn label="Pendientes" />
             <FilterBtn label="Aprobados" />
             <FilterBtn label="Rechazados" />
             <FilterBtn label="En Revisión" />
           </div>
         </div>

         {/* Tours Table */}
         <Card className="border-none shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50/50">
                   <th className="px-6 py-4">Tour</th>
                   <th className="px-6 py-4">Anfitrión</th>
                   <th className="px-6 py-4">Ubicación</th>
                   <th className="px-6 py-4">Estado</th>
                   <th className="px-6 py-4">Visitas</th>
                   <th className="px-6 py-4">Fecha</th>
                   <th className="px-6 py-4 text-center">Acciones</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {tours.map((tour) => (
                   <tr key={tour.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Camera className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-inkwell truncate">{tour.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Propiedad {tour.propertyId} • {tour.price}</p>
                          </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-600">{tour.landlord}</p>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                         <MapPin className="h-3 w-3" />
                         <span>{tour.location}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                        <StatusBadge status={tour.status} />
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Eye className="h-3 w-3" />
                          <span className="text-xs font-bold">{tour.visits}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-500">{tour.date}</p>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                         <ActionButton icon={Eye} />
                         <ActionButton icon={Settings} />
                         <ActionButton icon={Edit} />
                         <ActionButton icon={Trash2} variant="destructive" />
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </Card>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function FilterBtn({ label, active = false }: { label: string, active?: boolean }) {
  return (
    <button className={cn(
      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
      active ? "bg-inkwell text-white shadow-sm" : "text-slate-500 hover:text-inkwell"
    )}>
      {label}
    </button>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "Aprobado": "bg-emerald-100 text-emerald-600 border-emerald-200",
    "Pendiente": "bg-orange-50 text-orange-600 border-orange-100",
    "Rechazado": "bg-red-50 text-red-600 border-red-100",
  }
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
      styles[status] || "bg-slate-100 text-slate-600"
    )}>
      <div className={cn("h-1.5 w-1.5 rounded-full bg-current")} />
      {status}
    </div>
  )
}

function ActionButton({ icon: Icon, variant = "ghost" }: { icon: any, variant?: string }) {
  return (
    <button className={cn(
      "h-7 w-7 rounded-lg flex items-center justify-center transition-all",
      variant === "destructive" 
        ? "text-slate-400 hover:bg-red-50 hover:text-red-500" 
        : "text-slate-400 hover:bg-slate-100 hover:text-inkwell"
    )}>
      <Icon className="h-4 w-4" />
    </button>
  )
}
