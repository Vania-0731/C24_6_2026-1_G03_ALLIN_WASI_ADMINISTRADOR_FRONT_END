"use client"

import * as React from "react"
import {  Search, Filter, UserPlus, ShieldAlert, Edit2, Trash2, ChevronLeft, ChevronRight, Calendar, ShieldCheck, Settings2} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { userService } from "@/services/users.service"
import { authService } from "@/services/auth.service"
import { toast } from "sonner"
import { CreateAdminModal } from "@/components/shared/create-admin-modal"
import { EditUserModal } from "@/components/shared/edit-user-modal"
import { ManagePermissionsModal } from "@/components/shared/manage-permissions-modal"
import { useRouter } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState("todos")
  const [search, setSearch] = React.useState("")
  
  // Modals state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<any>(null)
  const [permissionsUser, setPermissionsUser] = React.useState<any>(null)
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null)

  React.useEffect(() => {
    const user = authService.getUser()
    if (user && user.permissions && !user.permissions.manageUsers) {
      toast.error("No tienes permiso para acceder a esta sección")
      router.push("/dashboard")
      return
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error: any) {
      toast.error(error.toString())
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    try {
      await userService.deleteUser(userToDelete)
      toast.success("Usuario eliminado correctamente")
      fetchUsers()
    } catch (error: any) {
      toast.error(error.toString())
    } finally {
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter(user => {
    const roleName = user.role?.name?.toLowerCase() || ""
    const matchesFilter = 
      filter === "todos" || 
      (filter === "admins" && roleName === "admin") ||
      (filter === "arrendadores" && roleName === "landlord") ||
      (filter === "arrendatarios" && roleName === "tenant")
    
    const matchesSearch = 
      user.fullName.toLowerCase().includes(search.toLowerCase()) || 
      user.email.toLowerCase().includes(search.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-emerald-800 tracking-tight">Gestión de Usuarios</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Control de acceso y perfiles de la plataforma</p>
          </div>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Administrador
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Buscar por nombre o correo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-none rounded-xl text-sm focus-visible:ring-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-full lg:w-auto">
            <FilterTab label="Todos" count={users.length} active={filter === "todos"} onClick={() => setFilter("todos")} />
            <FilterTab label="Admins" active={filter === "admins"} onClick={() => setFilter("admins")} />
            <FilterTab label="Arrendadores" active={filter === "arrendadores"} onClick={() => setFilter("arrendadores")} />
            <FilterTab label="Arrendatarios" active={filter === "arrendatarios"} onClick={() => setFilter("arrendatarios")} />
          </div>
        </div>

        {/* Tabla */}
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30">
                  <th className="px-6 py-5">Usuario / Perfil</th>
                  <th className="px-6 py-5">Rol</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Registro</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-24 text-slate-400 font-bold italic">Cargando base de datos...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-24 text-slate-300 font-bold italic">No se encontraron registros</td></tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black overflow-hidden border-2 border-white shadow-sm">
                                {user.profilePicture ? (
                                  <img src={user.profilePicture} alt={user.fullName} className="h-full w-full object-cover" />
                                ) : (
                                  user.fullName.charAt(0)
                                )}
                            </div>
                            <div className={cn(
                              "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white",
                              user.isVerified ? "bg-emerald-500" : "bg-slate-300"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-none">{user.fullName}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={user.role?.name} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full", user.isVerified ? "bg-emerald-500" : "bg-amber-500")} />
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tighter">
                            {user.isVerified ? "Activo" : "Pendiente"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Icono Editar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setEditingUser(user)}
                                className="h-9 w-9 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 transition-all active:scale-90"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-none font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xl">
                              Editar Perfil
                            </TooltipContent>
                          </Tooltip>

                          {/* Icono Permisos (Solo si es admin) */}
                          {user.role?.name === 'admin' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setPermissionsUser(user)}
                                  className="h-9 w-9 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all active:scale-90"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-800 text-white border-none font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xl">
                                Gestionar Permisos
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Icono Eliminar */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setUserToDelete(user.id)}
                                className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all active:scale-90"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-none font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xl">
                              Eliminar Cuenta
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Mostrando {filteredUsers.length} de {users.length} usuarios
            </p>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <div className="flex items-center gap-1">
                  <button className="h-8 w-8 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-md shadow-emerald-100">1</button>
                  <button className="h-8 w-8 rounded-lg hover:bg-white text-[11px] font-bold text-slate-400 transition-colors">2</button>
                  <button className="h-8 w-8 rounded-lg hover:bg-white text-[11px] font-bold text-slate-400 transition-colors">3</button>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><ChevronRight className="h-4 w-4 text-slate-600" /></Button>
            </div>
          </div>
        </Card>

        {/* Modales */}
        <CreateAdminModal 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={fetchUsers} 
        />

        <EditUserModal 
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
          user={editingUser}
        />

        <ManagePermissionsModal 
          isOpen={!!permissionsUser}
          onClose={() => setPermissionsUser(null)}
          user={permissionsUser}
        />

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent className="rounded-3xl border-none p-8">
            <AlertDialogHeader>
              <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-xl font-black text-slate-800">¿Confirmas la eliminación?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500 font-medium pt-2">
                Esta acción es irreversible. El usuario perderá acceso inmediato a la plataforma Allin Wasi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel className="rounded-xl font-bold text-slate-400 border-none hover:bg-slate-50 hover:text-slate-600">Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-red-100"
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

function FilterTab({ label, count, active, onClick }: { label: string, count?: number, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
        active 
          ? "bg-white text-emerald-700 shadow-sm" 
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[10px] font-black",
          active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
        )}>{count}</span>
      )}
    </button>
  )
}

function RoleBadge({ role }: { role: string }) {
  const styles: any = {
    "admin": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "landlord": "bg-blue-50 text-blue-700 border-blue-100",
    "tenant": "bg-violet-50 text-violet-700 border-violet-100",
  }

  const labels: any = {
    "admin": "Admin",
    "landlord": "Arrendador",
    "tenant": "Arrendatario",
  }

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border",
      styles[role] || "bg-slate-50 text-slate-500 border-slate-100"
    )}>
      {labels[role] || role}
    </span>
  )
}
