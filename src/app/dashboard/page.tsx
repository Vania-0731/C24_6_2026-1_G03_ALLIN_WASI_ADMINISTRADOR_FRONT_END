"use client"

import * as React from "react"
import { Camera, Users, Home, Eye, MapPin, Search, Filter, ArrowUpRight, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth.service"
import { propertyService } from "@/services/properties.service"
import { userService } from "@/services/users.service"
import { toursService } from "@/services/tours.service"
import { toast } from "sonner"
import Link from "next/link"

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null)
  const [stats, setStats] = React.useState({
    properties: 0,
    users: 0,
    tours: 0,
    visits: 0
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setUser(authService.getUser())
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [props, users, toursData] = await Promise.all([
        propertyService.getAllProperties(),
        userService.getAllUsers(),
        toursService.getStats()
      ])
      
      setStats({
        properties: props.length,
        users: users.length,
        tours: toursData.total,
        visits: toursData.totalVisits
      })
    } catch (error: any) {
      toast.error("Error al sincronizar datos del dashboard")
    } finally {
      setLoading(false)
    }
  }

  const mainStats = [
    { label: "Propiedades en Santa Anita", value: stats.properties.toString(), icon: Home, color: "bg-emerald-50 text-emerald-600", trend: "+12%" },
    { label: "Usuarios Registrados", value: stats.users.toString(), icon: Users, color: "bg-blue-50 text-blue-600", trend: "+5%" },
    { label: "Tours 360° Activos", value: stats.tours.toString(), icon: Camera, color: "bg-purple-50 text-purple-600", trend: "+8%" },
    { label: "Visitas Totales", value: stats.visits.toString(), icon: Eye, color: "bg-amber-50 text-amber-600", trend: "+24%" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
         <div className="absolute -right-20 -top-20 h-64 w-64 bg-emerald-50 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-110" />
         <div className="relative z-10">
            <h1 className="text-3xl font-black text-inkwell tracking-tight leading-none">
               ¡Hola de nuevo, <span className="text-emerald-600">{user?.fullName?.split(' ')[0] || 'Admin'}</span>! ✨
            </h1>
            <p className="text-slate-400 font-bold mt-3 uppercase text-[10px] tracking-[0.3em]">Resumen de Gestión Territorial - Santa Anita</p>
         </div>
         <div className="flex gap-3 relative z-10">
            <Link href="/dashboard/map">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl h-12 px-8 shadow-lg shadow-emerald-100 transition-all active:scale-95">
                 Gestionar Mapa
              </Button>
            </Link>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-[2rem] bg-white group hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm", stat.color)}>
                    <stat.icon className="h-6 w-6" />
                 </div>
                 <BadgeTrend value={stat.trend} />
              </div>
              <p className="text-3xl font-black text-inkwell tracking-tighter leading-none mb-2">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed / Distribution */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-100/50 rounded-[2.5rem] bg-white overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-inkwell tracking-tight">Distribución de Propiedades</h3>
                 <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">Zonas de Mayor Crecimiento en Santa Anita</p>
              </div>
              <SelectFilter />
           </div>
           <CardContent className="p-8">
              <div className="h-64 w-full bg-slate-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                 <div className="text-center">
                    <TrendingUp className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Gráfico de Crecimiento</p>
                    <p className="text-[10px] font-bold text-slate-300">Visualización de datos en tiempo real</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Quick Actions / System Health */}
        <div className="space-y-6">
           <Card className="border-none shadow-lg shadow-slate-100/50 rounded-[2.5rem] bg-[#0F172A] text-white overflow-hidden p-8">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 leading-none">Estado del Sistema</h4>
              <div className="space-y-4">
                 <HealthItem label="Seguridad del Entorno" value="Óptimo" color="text-emerald-400" />
                 <HealthItem label="Integridad de Datos" value="Sincronizado" color="text-blue-400" />
                 <HealthItem label="Soporte Técnico" value="Activo" color="text-emerald-400" />
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Administración Rápida</p>
                 <div className="grid grid-cols-2 gap-2">
                    <QuickBtn label="Usuarios" icon={Users} />
                    <QuickBtn label="Cuartos" icon={Home} />
                 </div>
              </div>
           </Card>

           <Link href="/dashboard/map" className="block">
              <Card className="border-none shadow-sm rounded-[2.5rem] bg-emerald-600 text-white p-8 group cursor-pointer relative overflow-hidden">
                 <div className="absolute right-0 top-0 h-full w-24 bg-white/10 -skew-x-12 translate-x-12 transition-transform group-hover:translate-x-4" />
                 <div className="relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                       <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-black tracking-tight leading-tight">Mapa en Vivo</h4>
                    <p className="text-xs font-bold text-emerald-100/80 mt-1">Ver todos los puntos de interés</p>
                    <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                       <span>Explorar ahora</span>
                       <ArrowUpRight className="h-3 w-3" />
                    </div>
                 </div>
              </Card>
           </Link>
        </div>
      </div>
    </div>
  )
}

function BadgeTrend({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
       <TrendingUp className="h-3 w-3" />
       <span className="text-[10px] font-black">{value}</span>
    </div>
  )
}

function SelectFilter() {
  return (
    <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-100">
       <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-white text-emerald-600 shadow-sm border border-emerald-100">Mensual</button>
       <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Semanal</button>
    </div>
  )
}

function HealthItem({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
       <span className="text-xs font-bold text-slate-400">{label}</span>
       <div className="flex items-center gap-2">
          <div className={cn("h-1.5 w-1.5 rounded-full bg-current", color)} />
          <span className={cn("text-[10px] font-black uppercase tracking-tighter", color)}>{value}</span>
       </div>
    </div>
  )
}

function QuickBtn({ label, icon: Icon }: { label: string, icon: any }) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 bg-slate-800/50 rounded-2xl hover:bg-emerald-600 transition-all group">
       <Icon className="h-4 w-4 text-slate-500 group-hover:text-white" />
       <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{label}</span>
    </button>
  )
}
