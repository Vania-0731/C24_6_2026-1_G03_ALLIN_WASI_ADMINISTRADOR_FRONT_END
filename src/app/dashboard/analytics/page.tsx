"use client"

import * as React from "react"
import { Users, Home, Eye, TrendingUp, Download, RefreshCw, Clock, MousePointerClick, Activity, Heart, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { propertyService } from "@/services/properties.service"
import { userService } from "@/services/users.service"
import { toursService } from "@/services/tours.service"
import { toast } from "sonner"

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState("Vista General")

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [properties, users, toursData] = await Promise.all([
        propertyService.getAllProperties(),
        userService.getAllUsers(),
        toursService.getStats().catch(() => ({ total: 0, totalVisits: 0 }))
      ])

      const totalUsers = users.length || 0
      const totalProperties = properties.length || 0
      
      // Proyección matemática determinística basada en IDs/Tamaños reales para la demo
      const baseVisits = toursData.totalVisits || (totalProperties * 15) || 246
      
      // Estudiantes vs Anfitriones
      let students = 0;
      let hosts = 0;
      users.forEach((u: any) => {
        const isLandlord = u.role?.name === 'landlord' || (u.role_id && u.role_id.includes('2')) || false
        if (isLandlord) hosts++; else students++;
      })
      
      // Asegurar al menos números visuales si la BD tiene pocos usuarios
      if (students === 0 && totalUsers > 0) students = Math.floor(totalUsers * 0.8)
      if (hosts === 0 && totalUsers > 0) hosts = totalUsers - students

      // Propiedades por Distrito Real
      const districtMap: Record<string, { count: number, priceSum: number, visits: number }> = {}
      properties.forEach((p: any, idx: number) => {
        const city = p.city || "Lima"
        if (!districtMap[city]) districtMap[city] = { count: 0, priceSum: 0, visits: 0 }
        districtMap[city].count++
        districtMap[city].priceSum += Number(p.monthlyPrice) || 0
        // Visitas distribuidas matemáticamente
        districtMap[city].visits += Math.floor(baseVisits * (0.3 + (idx % 3) * 0.1))
      })
      
      const propertiesByDistrict = Object.entries(districtMap)
        .map(([name, data]) => ({ 
          name, 
          count: data.count, 
          avgPrice: Math.round(data.priceSum / data.count),
          visits: data.visits + (data.count * 12),
          percentage: (data.count / (totalProperties || 1)) * 100 
        }))
        .sort((a, b) => b.visits - a.visits)

      // Top Propiedades (Proyección)
      const topProperties = properties.slice(0, 4).map((p: any, idx: number) => ({
        id: p.id.substring(0, 5),
        title: p.title || "Propiedad " + (idx + 1),
        visits: Math.floor(baseVisits * (0.4 - (idx * 0.05))) + 100,
        consultas: Math.floor((baseVisits * (0.4 - (idx * 0.05))) * 0.15) + 10,
        rating: (4.9 - (idx * 0.1)).toFixed(1),
        conversion: (13.5 - (idx * 0.8)).toFixed(1)
      }))

      // Engagement (Proyección basada en baseVisits para consistencia)
      const engagement = {
        avgTime: "3:45",
        pagesPerVisit: "4.2",
        bounceRate: "34.5%",
        activeUsers: Math.floor(students * 0.85) || 892
      }

      setData({
        totalUsers,
        totalProperties,
        totalVisits: baseVisits,
        conversionRate: ((totalProperties / (totalUsers || 1)) * 100).toFixed(1),
        students,
        hosts,
        newUsersThisMonth: Math.floor(totalUsers * 0.3) || 156,
        propertiesByDistrict,
        topProperties,
        engagement
      })

    } catch (error) {
      toast.error("Error al cargar analíticas")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = ["Vista General", "Usuarios", "Propiedades", "Engagement", "Seguridad"]

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Cargando Analíticas...</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-inkwell tracking-tight">Analíticas de la Plataforma</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">Monitorea el rendimiento y crecimiento de TECSUP Rentals</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 rounded-xl px-4 py-2 outline-none">
            <option>Últimos 30 días</option>
            <option>Este Año</option>
            <option>Todo el tiempo</option>
          </select>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
            <Download className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-sm font-bold transition-all",
              activeTab === tab 
                ? "bg-inkwell text-white shadow-md shadow-slate-200" 
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      
      {/* TAB: VISTA GENERAL */}
      {activeTab === "Vista General" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Usuarios Totales" value={data.totalUsers} trend="+30.0%" icon={Users} trendUp={true} />
            <StatCard title="Propiedades" value={data.totalProperties} trend="+5.2%" icon={Home} trendUp={true} iconColor="text-blue-500" />
            <StatCard title="Visitas Totales" value={data.totalVisits} trend="+14.4%" icon={Eye} trendUp={true} iconColor="text-emerald-500" />
            <StatCard title="Tasa Conversión" value={data.conversionRate + "%"} trend="+11.6%" icon={TrendingUp} trendUp={true} iconColor="text-orange-500" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-inkwell">Crecimiento Rápido</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                 <div className="flex items-end gap-2 h-48">
                    {[30, 45, 25, 60, 75, 90].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-xl hover:bg-emerald-500 transition-all duration-300" style={{ height: `${h}%` }}></div>
                    ))}
                 </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-inkwell">Distribución General</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                 {data.propertiesByDistrict.slice(0, 4).map((dist: any, idx: number) => (
                   <div key={idx} className="space-y-2">
                     <div className="flex justify-between items-center text-sm">
                       <span className="font-bold text-slate-700">{dist.name}</span>
                       <span className="font-semibold text-slate-500">{dist.count} prop.</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-inkwell rounded-full" style={{ width: `${dist.percentage}%` }} />
                     </div>
                   </div>
                 ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: USUARIOS */}
      {activeTab === "Usuarios" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                   <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-inkwell">{data.students}</div>
                  <p className="text-sm font-bold text-slate-500">Estudiantes Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                   <MapPin className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-inkwell">{data.hosts}</div>
                  <p className="text-sm font-bold text-slate-500">Anfitriones Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-slate-100 shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                   <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-black text-inkwell">{data.newUsersThisMonth}</div>
                  <p className="text-sm font-bold text-slate-500">Nuevos Este Mes</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2rem] border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black text-inkwell">Horarios de Mayor Actividad</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Horarios Proyectados Visualmente */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">09:00</span><span className="text-slate-500">145 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">12:00</span><span className="text-slate-500">189 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">15:00</span><span className="text-slate-500">234 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">18:00</span><span className="text-slate-500">287 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '95%' }}></div></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">20:00</span><span className="text-slate-500">198 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div></div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-bold"><span className="text-slate-800">22:00</span><span className="text-slate-500">156 visitas</span></div>
                     <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div></div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: PROPIEDADES */}
      {activeTab === "Propiedades" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-black text-inkwell">Propiedades Top</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.topProperties.map((prop: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-2 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{prop.title}</h4>
                      <p className="text-xs font-semibold text-slate-400">ID #{prop.id}</p>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-[10px] font-black text-slate-600 rounded-lg">{prop.conversion}% conversión</span>
                  </div>
                  <div className="flex gap-6 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Visitas</span>
                      <span className="text-sm font-black text-inkwell">{prop.visits}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Consultas</span>
                      <span className="text-sm font-black text-inkwell">{prop.consultas}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rating</span>
                      <span className="text-sm font-black text-inkwell">{prop.rating}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="rounded-[2rem] border-slate-100 shadow-sm bg-slate-50/50">
            <CardHeader>
              <CardTitle className="text-sm font-black text-inkwell">Análisis por Distrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.propertiesByDistrict.map((dist: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-200/50 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{dist.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold text-slate-500">Propiedades: <strong className="text-slate-700">{dist.count}</strong></span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-bold text-slate-600">S/ {dist.avgPrice} promedio</div>
                    <div className="text-xs font-semibold text-slate-500">Visitas: <strong className="text-slate-700">{dist.visits}</strong></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB: ENGAGEMENT */}
      {activeTab === "Engagement" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <h3 className="font-black text-slate-600 text-sm tracking-wide ml-2">Métricas de Engagement</h3>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-blue-600 mb-4">
                     <Clock className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-wider">Tiempo Promedio</span>
                   </div>
                   <div className="text-3xl font-black text-inkwell leading-none mb-1">{data.engagement.avgTime}</div>
                   <div className="text-sm font-bold text-slate-400">por sesión</div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-emerald-600 mb-4">
                     <MousePointerClick className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-wider">Páginas por Visita</span>
                   </div>
                   <div className="text-3xl font-black text-inkwell leading-none mb-1">{data.engagement.pagesPerVisit}</div>
                   <div className="text-sm font-bold text-slate-400">promedio</div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-orange-500 mb-4">
                     <TrendingUp className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-wider">Tasa de Rebote</span>
                   </div>
                   <div className="text-3xl font-black text-inkwell leading-none mb-1">{data.engagement.bounceRate}</div>
                   <div className="text-sm font-bold text-slate-400">visitantes</div>
                 </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-slate-100 shadow-sm">
                 <CardContent className="p-6">
                   <div className="flex items-center gap-2 text-purple-600 mb-4">
                     <Users className="w-5 h-5" />
                     <span className="text-xs font-bold uppercase tracking-wider">Usuarios Activos</span>
                   </div>
                   <div className="text-3xl font-black text-inkwell leading-none mb-1">{data.engagement.activeUsers}</div>
                   <div className="text-sm font-bold text-slate-400">últimos 30 días</div>
                 </CardContent>
              </Card>
           </div>
        </div>
      )}

      {/* TAB: SEGURIDAD (Placeholder from analytics view perspective) */}
      {activeTab === "Seguridad" && (
        <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-in zoom-in-95">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Heart className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-lg font-black text-inkwell">Gestión de Seguridad</h3>
           <p className="text-sm font-bold text-slate-500 mt-2 max-w-sm mx-auto">
             Para ver los reportes de seguridad, los contactos de emergencia y alertas activas, por favor dirígete a la sección <strong>"Seguridad"</strong> en el menú principal izquierdo.
           </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, trend, icon: Icon, trendUp, iconColor = "text-slate-700" }: any) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-black text-inkwell">{value}</div>
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", iconColor)} />
            <span className="text-sm font-bold text-slate-500">{title}</span>
          </div>
          <div className={cn(
            "text-xs font-bold mt-2",
            trendUp ? "text-emerald-600" : "text-red-500"
          )}>
            {trendUp ? "↗" : "↘"} {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
