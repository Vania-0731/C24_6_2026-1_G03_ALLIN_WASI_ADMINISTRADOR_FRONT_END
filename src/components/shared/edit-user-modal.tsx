"use client"

import * as React from "react"
import { X, Camera, Save, Loader2, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userService } from "@/services/users.service"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: any
}

export function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    profilePicture: ""
  })
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (user && isOpen) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        profilePicture: user.profilePicture || ""
      })
    }
  }, [user, isOpen])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    
    console.log("📝 Intentando actualizar usuario:", user.id)
    try {
      await userService.updateUser(user.id, formData)
      toast.success("Perfil actualizado")
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("❌ Error en actualización:", error)
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
        <div className="bg-emerald-600 pl-5 pr-12 py-4 flex items-center justify-between border-b-0">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-emerald-100" />
            <DialogTitle className="text-base font-black text-white tracking-tight">Editar Perfil</DialogTitle>
            <DialogDescription className="sr-only">Actualiza los datos personales del usuario.</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => handleSubmit()}
              disabled={loading}
              className="h-8 bg-white/20 hover:bg-white/30 text-white font-black text-[10px] px-4 rounded-xl border border-white/20 transition-all active:scale-95 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Save className="mr-2 h-3 w-3" /> Guardar</>}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Avatar Upload */}
          <div className="flex justify-center">
             <div className="relative group">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-all group-hover:border-emerald-50">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-slate-200 uppercase tracking-tighter">{formData.fullName.charAt(0)}</span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-9 w-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform active:scale-95 border-2 border-white"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nombre Completo</Label>
              <Input 
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 focus:ring-emerald-500 h-11 text-sm font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Correo Electrónico</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="rounded-xl border-slate-100 bg-slate-50 focus:ring-emerald-500 h-11 text-sm font-bold"
                required
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
