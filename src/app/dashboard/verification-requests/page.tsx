"use client"

import * as React from "react"
import { Check, X, Eye, FileText, Building2, UserCircle2, ZoomIn, Shield, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { verificationRequestsService, LandlordProfile, TenantProfile, SunarpResponse } from "@/services/verification-requests.service"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"

export default function VerificationRequestsPage() {
  const [activeTab, setActiveTab] = React.useState<'landlords' | 'students'>('landlords')
  const [landlords, setLandlords] = React.useState<LandlordProfile[]>([])
  const [tenants, setTenants] = React.useState<TenantProfile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedProfile, setSelectedProfile] = React.useState<LandlordProfile | TenantProfile | null>(null)
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [rejecting, setRejecting] = React.useState(false)
  const [rejectMessage, setRejectMessage] = React.useState('')
  const [processing, setProcessing] = React.useState(false)
  const [zoomedImage, setZoomedImage] = React.useState<string | null>(null)

  // SUNARP state
  const [sunarpLoading, setSunarpLoading] = React.useState(false)
  const [sunarpResult, setSunarpResult] = React.useState<SunarpResponse | null>(null)

  React.useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const [landlordsData, tenantsData] = await Promise.all([
        verificationRequestsService.getLandlordRequests(),
        verificationRequestsService.getTenantRequests()
      ])
      setLandlords(landlordsData)
      setTenants(tenantsData)
    } catch (error: any) {
      toast.error("Error al cargar las solicitudes")
    } finally {
      setLoading(false)
    }
  }

  const openReviewModal = (profile: LandlordProfile | TenantProfile) => {
    setSelectedProfile(profile)
    setIsModalOpen(true)
    setRejecting(false)
    setRejectMessage('')
    setSunarpResult(null)
  }

  const handleSunarpValidation = async () => {
    if (!selectedProfile || !('dni' in selectedProfile)) return;
    setSunarpLoading(true);
    try {
      const result = await verificationRequestsService.simulateSunarp(
        selectedProfile.dni,
        selectedProfile.user?.fullName || '',
        selectedProfile.address,
        'LIMA'
      );
      setSunarpResult(result);
      if (result.success) {
        toast.success('Validación SUNARP completada correctamente');
      } else {
        toast.error('SUNARP: No se encontraron registros');
      }
    } catch {
      toast.error('Error al consultar SUNARP');
    } finally {
      setSunarpLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedProfile) return
    setProcessing(true)
    try {
      const isTenant = 'code' in selectedProfile
      if (isTenant) {
        await verificationRequestsService.updateTenantStatus(selectedProfile.id, 'verified')
      } else {
        await verificationRequestsService.updateLandlordStatus(selectedProfile.id, 'verified')
      }
      toast.success('Perfil aprobado correctamente.')
      setIsModalOpen(false)
      fetchRequests()
    } catch (error) {
      toast.error('Error al aprobar el perfil.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!rejectMessage.trim()) {
      toast.error('Debes proporcionar un motivo de rechazo.')
      return
    }
    if (!selectedProfile) return
    
    setProcessing(true)
    try {
      const isTenant = 'code' in selectedProfile
      if (isTenant) {
        await verificationRequestsService.updateTenantStatus(selectedProfile.id, 'rejected', rejectMessage)
      } else {
        await verificationRequestsService.updateLandlordStatus(selectedProfile.id, 'rejected', rejectMessage)
      }
      toast.success('Perfil rechazado.')
      setIsModalOpen(false)
      fetchRequests()
    } catch (error) {
      toast.error('Error al rechazar el perfil.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Solicitudes de Registro</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Verifica y valida la identidad de los usuarios de la plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar border-b border-slate-200">
        <button
          onClick={() => setActiveTab('landlords')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'landlords'
              ? "bg-[#0F172A] text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <Building2 className="h-4 w-4" />
          Arrendadores
          {landlords.filter(l => l.verificationStatus === 'pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {landlords.filter(l => l.verificationStatus === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-bold transition-all whitespace-nowrap",
            activeTab === 'students'
              ? "bg-[#0F172A] text-white"
              : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          )}
        >
          <UserCircle2 className="h-4 w-4" />
          Estudiantes
          {tenants.filter(t => t.verificationStatus === 'pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {tenants.filter(t => t.verificationStatus === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'landlords' && (
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">DNI / Teléfono</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">Cargando solicitudes...</td></tr>
                ) : landlords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">No hay solicitudes registradas.</td></tr>
                ) : (
                  landlords.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                            {profile.user?.profilePicture ? (
                              <img src={profile.user.profilePicture} alt="" className="h-full w-full object-cover" />
                            ) : (
                              profile.user?.fullName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{profile.user?.fullName}</p>
                            <p className="text-xs text-slate-500">{profile.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{profile.dni || 'Sin DNI'}</p>
                        <p className="text-xs text-slate-500">{profile.phone || 'Sin Teléfono'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 font-medium">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {profile.verificationStatus === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>En Evaluación</span>}
                        {profile.verificationStatus === 'verified' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" />Aprobado</span>}
                        {profile.verificationStatus === 'rejected' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><X className="h-3 w-3" />Rechazado</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => openReviewModal(profile)}
                          size="sm"
                          className="bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-white transition-colors rounded-xl font-bold"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'students' && (
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Código / Carrera</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">Cargando solicitudes...</td></tr>
                ) : tenants.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-medium">No hay solicitudes registradas.</td></tr>
                ) : (
                  tenants.map((profile) => (
                    <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                            {profile.user?.profilePicture ? (
                              <img src={profile.user.profilePicture} alt="" className="h-full w-full object-cover" />
                            ) : (
                              profile.user?.fullName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{profile.user?.fullName}</p>
                            <p className="text-xs text-slate-500">{profile.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{profile.code || 'Sin Código'}</p>
                        <p className="text-xs text-slate-500">{profile.career || 'Sin Carrera'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-600 font-medium">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {profile.verificationStatus === 'pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>En Evaluación</span>}
                        {profile.verificationStatus === 'verified' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" />Aprobado</span>}
                        {profile.verificationStatus === 'rejected' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><X className="h-3 w-3" />Rechazado</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => openReviewModal(profile)}
                          size="sm"
                          className="bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-white transition-colors rounded-xl font-bold"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Revisar
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pr-8 mb-4 border-b border-slate-100 pb-4">
            <DialogHeader className="m-0">
              <DialogTitle className="text-2xl font-black text-slate-800">Revisión Documental</DialogTitle>
              <DialogDescription>
                Evaluando a: <span className="font-bold text-slate-700">{selectedProfile?.user?.fullName}</span>
              </DialogDescription>
            </DialogHeader>
            
            {selectedProfile && !rejecting && selectedProfile.verificationStatus === 'pending' && (
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setRejecting(true)} 
                  disabled={processing}
                  className="bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 font-bold px-4 rounded-xl transition-all"
                  size="sm"
                >
                  Rechazar
                </Button>
                <Button 
                  onClick={handleApprove} 
                  disabled={processing}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50"
                  size="sm"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Aprobar
                </Button>
              </div>
            )}
          </div>

          {selectedProfile && (
            <div className="space-y-8 py-4">
              {/* Rejecting Area */}
              {rejecting && (
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in duration-300">
                  <label className="text-sm font-bold text-red-900 block">Motivo del rechazo (obligatorio):</label>
                  <Input 
                    value={rejectMessage}
                    onChange={(e) => setRejectMessage(e.target.value)}
                    placeholder="Ej. La foto del DNI está borrosa y no se distinguen los datos..."
                    className="border-red-200 focus-visible:ring-red-500 bg-white"
                  />
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={() => setRejecting(false)} disabled={processing} className="text-red-700 hover:text-red-800 hover:bg-red-100 font-bold">Cancelar</Button>
                    <Button onClick={handleReject} disabled={processing || !rejectMessage.trim()} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/30">Confirmar Rechazo</Button>
                  </div>
                </div>
              )}

              {/* Status Banner si ya fue verificado o rechazado */}
              {selectedProfile.verificationStatus !== 'pending' && (
                <div className={cn(
                  "p-4 rounded-xl border font-medium text-sm flex items-center gap-3",
                  selectedProfile.verificationStatus === 'verified' ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                )}>
                  {selectedProfile.verificationStatus === 'verified' ? (
                    <><Check className="h-5 w-5 text-emerald-600"/> Este perfil ya ha sido Aprobado.</>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2"><X className="h-5 w-5 text-red-600"/> Este perfil fue Rechazado.</div>
                      <span className="text-red-600/80 text-xs">Motivo: {selectedProfile.verificationMessage}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Información Personal */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Información del Solicitante</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Nombre Completo</span>
                    <span className="text-sm font-medium text-slate-800">{selectedProfile.user?.fullName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</span>
                    <span className="text-sm font-medium text-slate-800">{selectedProfile.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Teléfono</span>
                    <span className="text-sm font-medium text-slate-800">{selectedProfile.phone || 'No proporcionado'}</span>
                  </div>
                  
                  {'dni' in selectedProfile ? (
                    // Landlord Fields
                    <>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">DNI</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.dni || 'No proporcionado'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Dirección</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.address || 'No proporcionada'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Propiedades Estimadas</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.propertyCount || 'No especificado'}</span>
                      </div>
                    </>
                  ) : (
                    // Tenant Fields
                    <>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Código Institucional</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.code || 'No proporcionado'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Carrera</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.career || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ciclo</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.cicle || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Región de Origen</span>
                        <span className="text-sm font-medium text-slate-800">{selectedProfile.origin_department || 'No especificada'}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Presupuesto Mensual</span>
                        <span className="text-sm font-medium text-slate-800">S/ {selectedProfile.monthly_budget || '0.00'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* SUNARP Validation Panel — solo para arrendadores */}
              {'dni' in selectedProfile && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">Validación SUNARP</p>
                        <p className="text-[11px] text-white/60">Consulta simulada de Registros Públicos</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSunarpValidation}
                      disabled={sunarpLoading}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 gap-2 disabled:opacity-50"
                    >
                      {sunarpLoading ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Consultando...</>
                      ) : (
                        <><ExternalLink className="h-3.5 w-3.5" /> Consultar SUNARP</>
                      )}
                    </Button>
                  </div>

                  {/* Result */}
                  <div className="p-6">
                    {!sunarpResult && !sunarpLoading && (
                      <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                        <Shield className="h-10 w-10 text-slate-200" />
                        <p className="text-sm font-medium text-slate-400">Presiona «Consultar SUNARP» para validar la titularidad del arrendador en Registros Públicos.</p>
                      </div>
                    )}

                    {sunarpLoading && (
                      <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        <p className="text-sm font-medium text-slate-500">Consultando base de datos de SUNARP...</p>
                      </div>
                    )}

                    {sunarpResult && !sunarpLoading && (
                      <>
                        {/* Result Banner */}
                        <div className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-sm font-bold",
                          sunarpResult.success
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        )}>
                          {sunarpResult.success
                            ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            : <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                          {sunarpResult.mensaje}
                        </div>

                        {sunarpResult.success && sunarpResult.data && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Número de partida */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">N° Partida Registral</span>
                              <span className="text-base font-black text-slate-800 font-mono">{sunarpResult.data.numeroPartida}</span>
                            </div>
                            {/* Zona registral */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Zona Registral</span>
                              <span className="text-sm font-bold text-slate-700">{sunarpResult.data.zonaRegistral}</span>
                            </div>
                            {/* Dirección */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 md:col-span-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dirección Registrada</span>
                              <span className="text-sm font-bold text-slate-700">{sunarpResult.data.direccionRegistrada}</span>
                            </div>
                            {/* Tipo de inmueble */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo de Inmueble</span>
                              <span className="text-sm font-bold text-slate-700">{sunarpResult.data.tipoInmueble}</span>
                            </div>
                            {/* Estado */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Estado</span>
                              <span className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full",
                                sunarpResult.data.estado === 'ACTIVO' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                              )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", sunarpResult.data.estado === 'ACTIVO' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                                {sunarpResult.data.estado}
                              </span>
                            </div>
                            {/* Cargas y gravámenes */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cargas y Gravámenes</span>
                              <span className={cn(
                                "inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full",
                                sunarpResult.data.cargasYGravamenes ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                              )}>
                                {sunarpResult.data.cargasYGravamenes ? <X className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                {sunarpResult.data.cargasYGravamenes ? 'Tiene cargas' : 'Sin cargas'}
                              </span>
                            </div>
                            {/* Propietarios */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Propietario(s) Registrado(s)</span>
                              {sunarpResult.data.propietarios.map((p, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                    {p.nombreCompleto.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-slate-800">{p.nombreCompleto}</p>
                                    <p className="text-[10px] text-slate-400">DNI: {p.dni}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className={cn("grid gap-6", 'dni' in selectedProfile ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                {'dni' in selectedProfile ? (
                  <>
                    {/* DNI Frontal */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-4 w-4 text-emerald-500" /> DNI (Frente)
                      </h4>
                      <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video border border-slate-200 flex items-center justify-center relative group">
                        {selectedProfile.dniFrontUrl ? (
                          <>
                            <img src={verificationRequestsService.getProxyUrl(selectedProfile.dniFrontUrl)} alt="DNI Frontal" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setZoomedImage(verificationRequestsService.getProxyUrl((selectedProfile as LandlordProfile).dniFrontUrl))}>
                              <ZoomIn className="h-10 w-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">Sin imagen</span>
                        )}
                      </div>
                    </div>

                    {/* DNI Reverso */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-4 w-4 text-emerald-500" /> DNI (Reverso)
                      </h4>
                      <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video border border-slate-200 flex items-center justify-center relative group">
                        {selectedProfile.dniBackUrl ? (
                          <>
                            <img src={verificationRequestsService.getProxyUrl(selectedProfile.dniBackUrl)} alt="DNI Reverso" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setZoomedImage(verificationRequestsService.getProxyUrl((selectedProfile as LandlordProfile).dniBackUrl))}>
                              <ZoomIn className="h-10 w-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">Sin imagen</span>
                        )}
                      </div>
                    </div>

                    {/* Recibo de Luz */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <Building2 className="h-4 w-4 text-emerald-500" /> Recibo de Servicios
                      </h4>
                      <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video border border-slate-200 flex items-center justify-center relative group">
                        {selectedProfile.utilityBillUrl ? (
                          <>
                            <img src={verificationRequestsService.getProxyUrl(selectedProfile.utilityBillUrl)} alt="Recibo" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setZoomedImage(verificationRequestsService.getProxyUrl((selectedProfile as LandlordProfile).utilityBillUrl))}>
                              <ZoomIn className="h-10 w-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">Sin imagen</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Carnet Universitario */}
                    <div className="space-y-3 md:col-span-1">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                        <FileText className="h-4 w-4 text-emerald-500" /> Carnet Institucional
                      </h4>
                      <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video border border-slate-200 flex items-center justify-center relative group">
                        {selectedProfile.studentIDCardUrl ? (
                          <>
                            <img src={verificationRequestsService.getProxyUrl(selectedProfile.studentIDCardUrl)} alt="Carnet" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => setZoomedImage(verificationRequestsService.getProxyUrl((selectedProfile as TenantProfile).studentIDCardUrl))}>
                              <ZoomIn className="h-10 w-10 text-white" />
                            </div>
                          </>
                        ) : (
                          <span className="text-slate-400 font-medium">Sin carnet adjunto</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Zoom Modal (Using Radix Dialog for clean overlay stacking) */}
      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Imagen Ampliada</DialogTitle>
            <DialogDescription>Vista detallada del documento seleccionado</DialogDescription>
          </DialogHeader>
          <img 
            src={zoomedImage || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} 
            alt="Zoomed" 
            className="w-full h-[90vh] object-contain drop-shadow-2xl" 
          />
          <div>
            <Button 
              variant="ghost" 
              className="absolute top-0 right-0 md:-right-12 md:-top-12 text-white hover:bg-white/20 rounded-full h-12 w-12 p-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
