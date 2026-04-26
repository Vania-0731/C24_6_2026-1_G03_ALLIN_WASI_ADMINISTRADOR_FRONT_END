"use client"

import * as React from "react"
import { X, Save, Loader2, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userService } from "@/services/users.service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ManagePermissionsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

const PERMISSION_LABELS: any = {
  viewDashboard: "Acceso al Dashboard",
  manageProperties: "Gestión de Propiedades",
  manageUsers: "Gestión de Usuarios",
  viewMap: "Acceso al Mapa Interactivo",
}

export function ManagePermissionsModal({ isOpen, onClose, user }: ManagePermissionsModalProps) {
  const [permissions, setPermissions] = React.useState<any>({
    viewDashboard: true,
    manageProperties: false,
    manageUsers: false,
    viewMap: false,
  })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user && isOpen) {
      if (user.permissions) {
        setPermissions({
          viewDashboard: user.permissions.viewDashboard ?? true,
          manageProperties: user.permissions.manageProperties ?? false,
          manageUsers: user.permissions.manageUsers ?? false,
          viewMap: user.permissions.viewMap ?? false,
        })
      } else {
        setPermissions({
          viewDashboard: true,
          manageProperties: false,
          manageUsers: false,
          viewMap: false,
        })
      }
    }
  }, [user, isOpen])

  const handleToggle = (key: string) => {
    setPermissions((prev: any) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await userService.updatePermissions(user.id, permissions)
      toast.success("Permisos actualizados correctamente")
      onClose()
    } catch (error: any) {
      toast.error("Error al actualizar permisos")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] border-none p-0 overflow-hidden bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header Premium Esmeralda */}
        <div className="bg-emerald-600 pl-8 pr-12 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
               <ShieldCheck className="h-6 w-6 text-emerald-100" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-white tracking-tight leading-none">Permisos Admin</DialogTitle>
              <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest mt-1">Control de Acceso</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Info del Usuario */}
          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner">
             <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 font-black text-lg">
                {user.fullName.charAt(0)}
             </div>
             <div className="min-w-0">
                <p className="text-sm font-black text-slate-800 truncate leading-none">{user.fullName}</p>
                <p className="text-[10px] font-bold text-slate-400 truncate mt-1.5 uppercase tracking-tighter">{user.email}</p>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 mb-4 italic">Módulos Disponibles</p>
             <div className="grid gap-2.5">
                {Object.keys(PERMISSION_LABELS).map((key) => (
                  <div 
                    key={key}
                    onClick={() => handleToggle(key)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                      permissions[key] 
                        ? "bg-emerald-50/40 border-emerald-200 shadow-sm" 
                        : "bg-white border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <span className={cn(
                      "text-[12px] font-black tracking-tight",
                      permissions[key] ? "text-emerald-900" : "text-slate-500 group-hover:text-slate-700"
                    )}>
                      {PERMISSION_LABELS[key]}
                    </span>
                    <div className={cn(
                      "h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                      permissions[key] 
                        ? "bg-emerald-600 border-emerald-600 rotate-0" 
                        : "bg-white border-slate-200 rotate-12"
                    )}>
                       {permissions[key] && <Save className="h-3.5 w-3.5 text-white" />}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 rounded-2xl font-bold h-12 hover:bg-slate-100 text-slate-500 transition-all"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl h-12 shadow-lg shadow-emerald-100/50 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
