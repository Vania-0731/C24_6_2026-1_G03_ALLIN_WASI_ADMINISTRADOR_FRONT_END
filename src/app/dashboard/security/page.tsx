"use client"

import * as React from "react"
import { AlertTriangle, Clock, Eye, CheckCircle2, Search, Plus, Phone, Users, MapPin, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { securityService } from "@/services/security.service"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function SecurityPage() {
  const [reports, setReports] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [severityFilter, setSeverityFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [activeTab, setActiveTab] = React.useState("Reportes de Seguridad")
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    location: "",
    severity: "medium"
  })

  React.useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const data = await securityService.getAllReports()
      setReports(data || [])
    } catch (error) {
      toast.error("Error al cargar los reportes de seguridad")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error("El título y la descripción son obligatorios")
      return
    }
    
    setIsSubmitting(true)
    try {
      await securityService.createReport(formData)
      toast.success("Reporte creado exitosamente")
      setIsModalOpen(false)
      setFormData({ title: "", description: "", location: "", severity: "medium" })
      fetchReports() // Refresh list
    } catch (error: any) {
      toast.error(error?.message || "Error al crear reporte")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAtender = async (id: string) => {
    try {
      await securityService.updateReportStatus(id, "investigating")
      toast.success("Estado actualizado a Investigando")
      fetchReports()
    } catch (error) {
      toast.error("Error al actualizar estado")
    }
  }

  const handleResolver = async (id: string) => {
    try {
      await securityService.updateReportStatus(id, "resolved")
      toast.success("Alerta resuelta exitosamente")
      fetchReports()
    } catch (error) {
      toast.error("Error al resolver alerta")
    }
  }

  const tabs = ["Reportes de Seguridad", "Contactos de Emergencia", "Alertas Activas"]

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(search.toLowerCase()) || 
                          r.description?.toLowerCase().includes(search.toLowerCase()) ||
                          r.location?.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === "all" || r.severity === severityFilter
    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
  })

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  }

  // Contactos estáticos (mock)
  const contacts = [
    { name: "Policía Nacional del Perú", type: "Emergencia", desc: "Emergencias policiales", number: "105", color: "bg-red-500" },
    { name: "Serenazgo Los Olivos", type: "Seguridad", desc: "Seguridad ciudadana local", number: "01-485-1616", color: "bg-inkwell" },
    { name: "Bomberos", type: "Emergencia", desc: "Emergencias de incendios y rescate", number: "116", color: "bg-red-500" },
    { name: "SAMU (Ambulancia)", type: "Médico", desc: "Atención médica de emergencia", number: "106", color: "bg-blue-500" },
    { name: "Línea de Ayuda TECSUP", type: "Soporte", desc: "Asistencia estudiantil", number: "01-317-3900", color: "bg-inkwell" },
  ]

  const activeAlerts = reports.filter(r => r.status !== 'resolved')

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-inkwell tracking-tight">Gestión de Seguridad</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">Monitorea reportes de seguridad y coordina respuestas de emergencia</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl border-slate-200">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <div className="bg-inkwell p-6">
               <DialogTitle className="text-xl font-black text-white">Crear Nuevo Reporte</DialogTitle>
               <DialogDescription className="text-slate-400 text-sm mt-1">Registra un nuevo incidente o alerta de seguridad en la plataforma.</DialogDescription>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Título del Incidente</label>
                 <Input 
                   required
                   value={formData.title}
                   onChange={e => setFormData({...formData, title: e.target.value})}
                   placeholder="Ej. Intento de estafa en Los Olivos" 
                   className="rounded-xl border-slate-200 focus-visible:ring-emerald-500" 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Ubicación (Opcional)</label>
                 <Input 
                   value={formData.location}
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   placeholder="Ej. Av. Universitaria, SMP" 
                   className="rounded-xl border-slate-200 focus-visible:ring-emerald-500" 
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Severidad</label>
                 <Select value={formData.severity} onValueChange={(val) => setFormData({...formData, severity: val})}>
                   <SelectTrigger className="rounded-xl border-slate-200 focus:ring-emerald-500">
                     <SelectValue placeholder="Selecciona la severidad" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="high">Alta (Urgente)</SelectItem>
                     <SelectItem value="medium">Media</SelectItem>
                     <SelectItem value="low">Baja</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase">Descripción detallada</label>
                 <Textarea 
                   required
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   placeholder="Describe los detalles del reporte..." 
                   className="rounded-xl border-slate-200 focus-visible:ring-emerald-500 min-h-[100px]" 
                 />
               </div>
               <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                  <Button type="submit" disabled={isSubmitting} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                    Registrar Reporte
                  </Button>
               </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Reportes" value={stats.total} icon={AlertTriangle} color="text-red-500" />
        <StatCard title="Pendientes" value={stats.pending} icon={Clock} color="text-orange-500" />
        <StatCard title="En Investigación" value={stats.investigating} icon={Eye} color="text-blue-500" />
        <StatCard title="Resueltos" value={stats.resolved} icon={CheckCircle2} color="text-emerald-500" />
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

      {/* TAB CONTENT: Reportes de Seguridad */}
      {activeTab === "Reportes de Seguridad" && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden">
            <CardContent className="p-4 bg-slate-50/50 flex flex-col md:flex-row gap-4 border-b border-slate-100">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Buscar reportes por título, ubicación o reportero..."
                  className="pl-9 bg-white border-slate-200 rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[180px] bg-white rounded-xl">
                  <SelectValue placeholder="Todas las severidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las severidades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white rounded-xl">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="investigating">Investigando</SelectItem>
                  <SelectItem value="resolved">Resuelto</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>

            <div className="p-6">
              <h3 className="text-sm font-black text-inkwell mb-4">Reportes de Seguridad ({filteredReports.length})</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="pb-3 px-4">Reporte</th>
                      <th className="pb-3 px-4">Reportado por</th>
                      <th className="pb-3 px-4">Ubicación</th>
                      <th className="pb-3 px-4">Severidad</th>
                      <th className="pb-3 px-4">Estado</th>
                      <th className="pb-3 px-4">Fecha</th>
                      <th className="pb-3 px-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 font-bold animate-pulse">
                          Cargando reportes...
                        </td>
                      </tr>
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-slate-400 font-bold">
                          No hay reportes que mostrar.
                        </td>
                      </tr>
                    ) : filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-4 px-4">
                          <p className="font-bold text-inkwell">{report.title}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{report.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">ID #{report.id.substring(0,6)}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                              <Users className="w-3 h-3 text-slate-500" />
                            </div>
                            <div>
                              <p className="font-bold text-inkwell text-xs">{report.reportedBy?.fullName || 'Desconocido'}</p>
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                                {report.reportedBy?.role?.name || 'Usuario'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs">{report.location || 'No especificada'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <SeverityBadge severity={report.severity} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(report.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-inkwell">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Contactos de Emergencia */}
      {activeTab === "Contactos de Emergencia" && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="rounded-[2rem] border-slate-100 shadow-sm">
             <CardContent className="p-8">
               <h3 className="text-sm font-black text-slate-500 mb-6 uppercase tracking-wider">Contactos de Emergencia</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {contacts.map((contact, idx) => (
                   <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                      <div>
                         <h4 className="font-bold text-inkwell text-lg">{contact.name}</h4>
                         <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white tracking-wider", contact.color)}>
                           {contact.type}
                         </span>
                         <p className="text-xs text-slate-400 mt-2 font-medium">{contact.desc}</p>
                         <p className="text-xs text-slate-400 mt-1 font-medium">Disponible: 24/7</p>
                      </div>
                      <a href={`tel:${contact.number}`} className="flex-shrink-0 flex items-center justify-center gap-2 bg-inkwell text-white px-4 py-2.5 rounded-xl font-bold hover:bg-inkwell/90 transition-colors">
                        <Phone className="w-4 h-4" />
                        {contact.number}
                      </a>
                   </div>
                 ))}
               </div>
             </CardContent>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: Alertas Activas */}
      {activeTab === "Alertas Activas" && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4">
          <h3 className="text-sm font-black text-slate-500 mb-2 uppercase tracking-wider ml-2">Alertas Activas ({activeAlerts.length})</h3>
          
          {loading ? (
             <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Cargando alertas...</div>
          ) : activeAlerts.length === 0 ? (
             <div className="p-12 text-center bg-emerald-50 rounded-[2rem] border border-emerald-100 shadow-sm">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                 <CheckCircle2 className="w-8 h-8 text-emerald-500" />
               </div>
               <h3 className="text-lg font-black text-emerald-800">Todo en orden</h3>
               <p className="text-sm font-bold text-emerald-600/70 mt-1">No hay alertas de seguridad activas en este momento.</p>
             </div>
          ) : (
            activeAlerts.map(alert => (
              <div key={alert.id} className={cn(
                "p-6 rounded-[2rem] border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all",
                alert.severity === 'high' ? "bg-red-50/50 border-red-100" : (alert.severity === 'medium' ? "bg-orange-50/50 border-orange-100" : "bg-white border-slate-200")
              )}>
                <div className="flex-1 space-y-2">
                   <div className="flex items-center gap-3">
                     <AlertTriangle className={cn("w-5 h-5", alert.severity === 'high' ? "text-red-500" : "text-orange-500")} />
                     <h4 className="font-bold text-inkwell text-lg">{alert.title}</h4>
                     <SeverityBadge severity={alert.severity} />
                     <StatusBadge status={alert.status} />
                   </div>
                   <p className="text-sm text-slate-600 font-medium pl-8">{alert.description}</p>
                   <div className="flex items-center gap-4 pl-8 pt-2">
                     <div className="flex items-center gap-1.5 text-slate-500">
                       <MapPin className="w-4 h-4" />
                       <span className="text-xs font-bold">{alert.location || 'Ubicación no especificada'}</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-slate-500">
                       <Clock className="w-4 h-4" />
                       <span className="text-xs font-bold">{new Date(alert.createdAt).toLocaleString()}</span>
                     </div>
                   </div>
                </div>
                
                <div className="flex gap-2 shrink-0 md:pl-6 md:border-l border-slate-200/50">
                  <Button variant="outline" size="icon" className="rounded-xl border-slate-200 bg-white">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                  </Button>
                  {alert.status === 'pending' && (
                    <Button onClick={() => handleAtender(alert.id)} className="rounded-xl font-bold bg-inkwell text-white hover:bg-inkwell/90">
                      Atender Alerta
                    </Button>
                  )}
                  {alert.status === 'investigating' && (
                    <Button onClick={() => handleResolver(alert.id)} className="rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700">
                      Marcar como Resuelto
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="rounded-[1.5rem] border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", color)} />
            <span className="text-2xl font-black text-inkwell leading-none">{value}</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const getBadgeStyle = () => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200'
      case 'medium': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'low': return 'bg-slate-50 text-slate-600 border-slate-200'
      default: return 'bg-slate-50 text-slate-600 border-slate-200'
    }
  }
  
  const getLabel = () => {
    switch (severity) {
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return 'Desconocida'
    }
  }

  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex w-fit items-center gap-1", getBadgeStyle())}>
      <AlertTriangle className="w-3 h-3" />
      {getLabel()}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'pending': return 'bg-slate-100 text-slate-600 border-slate-200'
      case 'investigating': return 'bg-blue-600 text-white border-blue-700'
      case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }
  
  const getLabel = () => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'investigating': return 'Investigando'
      case 'resolved': return 'Resuelto'
      default: return status
    }
  }

  const Icon = status === 'resolved' ? CheckCircle2 : (status === 'investigating' ? Eye : Clock)

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex w-fit items-center gap-1.5", getBadgeStyle())}>
      <Icon className="w-3 h-3" />
      {getLabel()}
    </span>
  )
}
