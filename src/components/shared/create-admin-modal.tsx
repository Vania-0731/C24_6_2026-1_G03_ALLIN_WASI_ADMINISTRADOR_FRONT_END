"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,  DialogFooter} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userService } from "@/services/users.service"
import { toast } from "sonner"
import { Mail, User, Lock, Loader2, Camera } from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PERMISSION_LABELS: any = {
  manageUsers: "Gestionar Usuarios",
  manageProperties: "Gestionar Propiedades",
}

export function CreateAdminModal({ isOpen, onClose, onSuccess }: CreateAdminModalProps) {
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
    profilePicture: "",
    roleName: "admin",
    permissions: {
      manageUsers: true,
      manageProperties: true,
    }
  })

  const togglePermission = (key: string) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !((formData.permissions as any)[key])
      }
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande (Máx. 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await userService.createUser(formData)
      toast.success("¡Nuevo administrador creado con éxito!")
      setFormData({ 
        fullName: "", 
        email: "", 
        password: "", 
        profilePicture: "",
        roleName: "admin",
        permissions: {
          manageUsers: true,
          manageProperties: true,
        }
      })
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95%] max-w-[550px] max-h-[90vh] overflow-y-auto p-0 border-none rounded-3xl">
        <div className="p-6 md:p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-emerald-700 text-2xl font-black">Nuevo Administrador</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Registra a un compañero para gestionar Allin Wasi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto y Datos Básicos */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-28 w-28 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm shrink-0"
              >
                {formData.profilePicture ? (
                  <>
                    <img src={formData.profilePicture} alt="Preview" className="h-full w-full object-cover group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-emerald-600" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-8 w-8 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 uppercase tracking-tighter">Subir Foto</span>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-bold text-slate-600 ml-1">Nombre Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="fullName" placeholder="Ej. Juan Pérez" className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-600 ml-1">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="email" type="email" placeholder="admin@allinwasi.com" className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-600 ml-1">Contraseña Temporal</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 h-11 bg-slate-50/50 border-slate-200 rounded-xl" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
            </div>

            {/* Permisos */}
            <div className="space-y-3 pt-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Permisos de Acceso</Label>
              <div className="grid grid-cols-2 gap-3">
                <PermissionToggle label="Usuarios" active={formData.permissions.manageUsers} onClick={() => togglePermission('manageUsers')} />
                <PermissionToggle label="Propiedades" active={formData.permissions.manageProperties} onClick={() => togglePermission('manageProperties')} />
              </div>
            </div>

            <DialogFooter className="pt-6 sm:justify-between items-center gap-4 border-t border-slate-100 -mx-8 px-8 mt-4 bg-slate-50/50 py-4">
              <button type="button" onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                Cancelar
              </button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Administrador
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PermissionToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all",
        active 
          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
          : "bg-white border-slate-100 text-slate-400 grayscale opacity-70 hover:border-slate-200"
      )}
    >
      {label}
      <div className={cn(
        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
        active ? "bg-emerald-500 border-emerald-500" : "border-slate-200"
      )}>
        {active && <div className="h-2 w-2 rounded-full bg-white animate-in zoom-in" />}
      </div>
    </button>
  )
}
