"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, Users, Home, LogOut, Camera, Menu} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import { useRouter } from "next/navigation"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", permission: "viewDashboard" },
  { icon: Home, label: "Propiedades", href: "/dashboard/properties", badge: "156", permission: "manageProperties" },
  { icon: Users, label: "Usuarios", href: "/dashboard/users", badge: "1.2k", permission: "manageUsers" },
  { icon: Map, label: "Mapa Interactivo", href: "/dashboard/map", permission: "viewMap" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    setUser(authService.getUser())
  }, [])

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-[#0F172A] text-slate-400 border-r border-slate-800/50 shadow-2xl z-50 sticky top-0 transition-all duration-300">
      {/* Brand Logo */}
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-all duration-300">
             <Home className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tighter leading-none">Allin Wasi</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar py-4">
        {menuItems.map((item) => {
          // Verificación de permisos
          if (item.permission && user?.permissions && user.permissions[item.permission] === false) {
            return null
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] border border-emerald-500/20" 
                  : "hover:bg-slate-800/40 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-emerald-400"
              )} />
              <span className="flex-1">{item.label}</span>
              {item.badge && !isActive && (
                <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
              {isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b881]" />}
            </Link>
          )
        })}
      </nav>

      {/* User Footer - Estilo Arrendador Integrado */}
      <div className="p-4 border-t border-slate-800/50 mt-auto bg-[#0F172A]">
        <div className="bg-slate-800/30 rounded-[2rem] p-3 border border-slate-800/50 hover:bg-slate-800/50 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0">
               <div className="h-full w-full rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 overflow-hidden shadow-inner">
                  {user?.fullName ? (
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}&backgroundColor=10b881`} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-emerald-400" />
                  )}
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-[#0F172A] shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-white truncate leading-tight">{user?.fullName || 'Administrador'}</p>
              <p className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-tighter">{user?.role || 'Admin Role'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="h-8 w-8 rounded-xl bg-slate-800 text-slate-500 hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center border border-slate-700/50 shadow-sm"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[8px] text-slate-600 font-black text-center mt-4 uppercase tracking-[0.3em]">Allin Wasi v1.0</p>
      </div>
    </aside>
  )
}
