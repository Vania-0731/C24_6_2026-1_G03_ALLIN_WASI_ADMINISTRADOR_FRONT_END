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
  manageUsers: "Gestionar Usuarios",
  manageProperties: "Gestionar Propiedades",
}

export function ManagePermissionsModal({ isOpen, onClose, user }: ManagePermissionsModalProps) {
  const [permissions, setPermissions] = React.useState<any>({
    manageUsers: false,
    manageProperties: false,
    manageRequests: false,
    viewReports: false,
    systemSettings: false,
  })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user && isOpen) {
      console.log("🛠️ Cargando permisos para:", user.fullName)
      if (user.permissions) {
        setPermissions(user.permissions)
      } else {
        setPermissions({
          manageUsers: false,
          manageProperties: false,
          manageRequests: false,
          viewReports: false,
          systemSettings: false,
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
      toast.success("Permisos actualizados")
      onClose()
    } catch (error: any) {
      console.error("❌ Error al guardar permisos:", error)
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-none p-0 overflow-hidden bg-white shadow-2xl">
        {/* Header Compacto Esmeralda */}
        <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between border-b-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-100" />
            <DialogTitle className="text-base font-black text-white tracking-tight">Permisos de Acceso</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={loading}
              className="h-8 bg-white/20 hover:bg-white/30 text-white font-black text-[10px] px-4 rounded-xl border border-white/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="mr-2 h-3 w-3" /> Guardar</>}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Info del Usuario */}
          <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 shadow-sm shadow-emerald-50">
             <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100 font-black text-sm">
                {user.fullName.charAt(0)}
             </div>
             <div className="min-w-0">
                <p className="text-sm font-black text-emerald-900 truncate leading-none">{user.fullName}</p>
                <p className="text-[11px] font-bold text-emerald-600/60 truncate mt-1.5 lowercase tracking-tight">{user.email}</p>
             </div>
          </div>

          <div className="space-y-2">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 mb-3">Privilegios del Administrador</p>
             <div className="grid gap-2">
                {Object.keys(PERMISSION_LABELS).map((key) => (
                  <div 
                    key={key}
                    onClick={() => handleToggle(key)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                      permissions[key] 
                        ? "bg-emerald-50/30 border-emerald-200 shadow-sm ring-1 ring-emerald-500/5" 
                        : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-slate-50/50"
                    )}
                  >
                    <span className={cn(
                      "text-[12px] font-bold tracking-tight",
                      permissions[key] ? "text-emerald-900" : "text-slate-500 group-hover:text-slate-700"
                    )}>
                      {PERMISSION_LABELS[key]}
                    </span>
                    <Checkbox 
                      checked={permissions[key]} 
                      onCheckedChange={() => handleToggle(key)}
                      className="h-5 w-5 rounded-lg border-slate-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 shadow-sm"
                    />
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
             <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
             <p className="text-[10px] font-bold text-amber-800 leading-normal">
               Los cambios se aplicarán automáticamente la próxima vez que este usuario inicie sesión en Allin Wasi.
             </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
