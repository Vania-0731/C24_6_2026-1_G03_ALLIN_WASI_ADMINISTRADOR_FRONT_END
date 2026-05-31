"use client"

import * as React from "react"
import { Save, Server, Activity, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { settingsService, Setting } from "@/services/settings.service"
import { toast } from "sonner"

const TABS = [
  { id: 'general', label: 'General & Funciones' },
  { id: 'security', label: 'Seguridad & Usuarios' },
  { id: 'notifications', label: 'Notificaciones & Backup' },
  { id: 'integrations', label: 'Integraciones' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('general')
  const [settings, setSettings] = React.useState<Setting[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Form state maps key -> value
  const [formData, setFormData] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getAllSettings()
      setSettings(data)
      const initialForm: Record<string, string> = {}
      data.forEach(s => {
        initialForm[s.key] = s.value
      })
      setFormData(initialForm)
    } catch (error: any) {
      toast.error("Error al cargar las configuraciones")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.keys(formData).map(key => ({
        key,
        value: formData[key]
      }))
      await settingsService.updateMultipleSettings(updates)
      toast.success("Configuraciones guardadas correctamente")
      await fetchSettings() // Reload
    } catch (error: any) {
      toast.error("Error al guardar las configuraciones")
    } finally {
      setSaving(false)
    }
  }

  // Helper to render inputs
  const renderSettingInput = (key: string) => {
    const setting = settings.find(s => s.key === key)
    if (!setting) return null

    const isPassword = ['AWS_SECRET_ACCESS_KEY', 'GOOGLE_CLIENT_SECRET', 'EMAIL_PASS'].includes(key);
    const isNumber = setting.type === 'number';

    if (setting.type === 'boolean') {
      return (
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div>
            <label className="text-sm font-bold text-slate-800">{setting.description}</label>
            <p className="text-xs text-slate-500 mt-1">
              {formData[key] === 'true' ? 'Activado' : 'Desactivado'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={formData[key] === 'true'}
            onClick={() => handleInputChange(key, formData[key] === 'true' ? 'false' : 'true')}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
              formData[key] === 'true' ? "bg-[#0F172A]" : "bg-slate-200"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                formData[key] === 'true' ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      )
    }

    if (key === 'DEFAULT_ROLE') {
      return (
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 tracking-tight">{setting.description}</label>
          <Select 
            value={formData[key] || ''} 
            onValueChange={(val) => handleInputChange(key, val)}
          >
            <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-slate-400 rounded-xl text-slate-700">
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Arrendador (Tenant)</SelectItem>
              <SelectItem value="user">Usuario Regular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    if (key === 'BACKUP_FREQUENCY') {
      return (
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 tracking-tight">{setting.description}</label>
          <Select 
            value={formData[key] || ''} 
            onValueChange={(val) => handleInputChange(key, val)}
          >
            <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-slate-400 rounded-xl text-slate-700">
              <SelectValue placeholder="Frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-800 tracking-tight">{setting.description}</label>
        <Input 
          type={isPassword ? 'password' : (isNumber ? 'number' : 'text')}
          value={formData[key] || ''} 
          onChange={(e) => handleInputChange(key, e.target.value)}
          className="bg-slate-50 border-slate-200 focus-visible:ring-slate-400 rounded-xl text-slate-700"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Configuración</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Gestiona y administra la plataforma de visitas virtuales</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Configuración del Sistema</h2>
          <p className="text-xs font-medium text-slate-500">Gestiona la configuración general de la plataforma</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl px-6 shadow-lg transition-all active:scale-95"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* System Status Card */}
      <Card className="p-4 rounded-2xl border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b881]" />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">Sistema Operativo</p>
            <p className="text-xs font-medium text-slate-500 mt-1">TECSUP Rentals v{formData['PLATFORM_VERSION'] || '1.0.0'} - Entorno: production</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Uptime: 99.9%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Última actualización: 2h</span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
              activeTab === tab.id
                ? "bg-[#0F172A] text-white border-[#0F172A] shadow-md"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 font-bold italic">Cargando configuraciones...</div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Información de la Plataforma */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Información de la Plataforma</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderSettingInput('PLATFORM_NAME')}
                  {renderSettingInput('PLATFORM_VERSION')}
                  <div className="md:col-span-2">
                    {renderSettingInput('PLATFORM_DESCRIPTION')}
                  </div>
                </div>
              </Card>

              {/* Configuración de Límites */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Configuración de Límites</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderSettingInput('MAX_PROPERTIES_PER_HOST')}
                  {renderSettingInput('MAX_TOURS_PER_PROPERTY')}
                  {renderSettingInput('MAX_IMAGE_SIZE_MB')}
                </div>
              </Card>

              {/* Control de Funciones */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Control de Funciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('ENABLE_PUBLIC_REGISTRATION')}
                   {renderSettingInput('MAINTENANCE_MODE')}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Políticas de Seguridad */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Políticas de Seguridad</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('PASSWORD_MIN_LENGTH')}
                   {renderSettingInput('SESSION_TIMEOUT_MINUTES')}
                </div>
              </Card>
              
              {/* Opciones de Registro */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Opciones de Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('DEFAULT_ROLE')}
                   {renderSettingInput('REQUIRE_MANUAL_APPROVAL')}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              {/* Servidor de Correo */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Servidor de Correo (SMTP)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('EMAIL_HOST')}
                   {renderSettingInput('EMAIL_PORT')}
                   {renderSettingInput('EMAIL_USER')}
                   {renderSettingInput('EMAIL_PASS')}
                   <div className="md:col-span-2 pt-4 border-t border-slate-100">
                      {renderSettingInput('ADMIN_ALERTS_ENABLED')}
                   </div>
                </div>
              </Card>

              {/* Copias de Seguridad */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Configuración de Copias de Seguridad (Backup)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('BACKUP_FREQUENCY')}
                   {renderSettingInput('BACKUP_RETENTION_DAYS')}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              {/* AWS */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <Server className="h-4 w-4 text-orange-500" />
                  Amazon Web Services (AWS)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('AWS_ACCESS_KEY_ID')}
                   {renderSettingInput('AWS_SECRET_ACCESS_KEY')}
                   {renderSettingInput('AWS_REGION')}
                   {renderSettingInput('AWS_S3_BUCKET')}
                   <div className="md:col-span-2">
                     {renderSettingInput('AWS_S3_BASE_URL')}
                   </div>
                </div>
              </Card>

              {/* Google OAuth */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Autenticación de Google (OAuth2)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('GOOGLE_CLIENT_ID')}
                   {renderSettingInput('GOOGLE_CLIENT_SECRET')}
                   <div className="md:col-span-2">
                     {renderSettingInput('GOOGLE_CALLBACK_URL')}
                   </div>
                </div>
              </Card>

              {/* Google Maps y Gemini AI */}
              <Card className="p-6 rounded-3xl border-slate-100 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Mapas & Inteligencia Artificial
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {renderSettingInput('GOOGLE_API_KEY')}
                   {renderSettingInput('GEMINI_MODEL_NAME')}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
