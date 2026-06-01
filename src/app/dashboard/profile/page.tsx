"use client"

import * as React from "react"
import { Save, User, Mail, Shield, Camera, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState({
    fullName: "Administrador Principal",
    email: "admin@allinwasi.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Simulación de carga inicial
  React.useEffect(() => {
    // Aquí iría la llamada al backend para obtener los datos reales del usuario
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Perfil actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    
    setLoading(true)
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Contraseña actualizada correctamente")
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }))
    } catch (error) {
      toast.error("Error al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[800px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-inkwell tracking-tight">Mi Perfil</h1>
          <p className="text-sm font-bold text-slate-400 mt-1">Gestiona tu información personal y la seguridad de tu cuenta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Form */}
        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden md:col-span-2">
          <CardContent className="p-8">
            <h3 className="text-sm font-black text-inkwell mb-6 flex items-center gap-2">
              <User className="w-4 h-4" />
              Información Personal
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-center mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="font-bold text-inkwell">Foto de Perfil</h4>
                  <p className="text-xs text-slate-500 mt-1">Sube una nueva foto. Max 2MB.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="rounded-xl font-bold bg-inkwell text-white hover:bg-inkwell/90">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Form */}
        <Card className="rounded-[2rem] border-slate-100 shadow-sm overflow-hidden h-fit">
          <CardContent className="p-8">
            <h3 className="text-sm font-black text-inkwell mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Seguridad
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña Actual</label>
                <Input 
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  className="bg-slate-50/50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nueva Contraseña</label>
                <Input 
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  className="bg-slate-50/50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmar Contraseña</label>
                <Input 
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="bg-slate-50/50 border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} variant="outline" className="w-full rounded-xl font-bold border-slate-200">
                  Actualizar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
