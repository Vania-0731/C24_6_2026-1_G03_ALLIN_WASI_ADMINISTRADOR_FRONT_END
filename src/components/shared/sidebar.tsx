"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Map, Users, Home, ShieldCheck, MessageSquare, Sparkles, BarChart3, Settings, LogOut, Camera, ClipboardList, ChevronRight, Menu} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth.service"
import { useRouter } from "next/navigation"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Home, label: "Propiedades", href: "/dashboard/properties", badge: "156", permission: "manageProperties" },
  { icon: Users, label: "Usuarios", href: "/dashboard/users", badge: "1.2k", permission: "manageUsers" },
  // Las secciones de abajo se activarán en fases posteriores
  /*
  { icon: Camera, label: "Tours 360°", href: "/dashboard/tours", badge: "24", permission: "manageProperties" },
  { icon: ClipboardList, label: "Solicitudes", href: "/dashboard/requests", badge: "8", permission: "manageRequests" },
  { icon: ShieldCheck, label: "Seguridad", href: "/dashboard/security", badge: "3", permission: "systemSettings" },
  { icon: BarChart3, label: "Analíticas", href: "/dashboard/analytics", permission: "viewReports" },
  */
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
    <aside className="flex h-screen w-64 flex-col bg-inkwell text-slate-300 transition-all duration-300">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-inkwell">
          <Camera className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-tight leading-none">Allin Wasi</span>
          <span className="text-[10px] text-slate-500 font-medium">Admin Panel</span>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto text-slate-500 hover:text-white">
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          // Si el ítem requiere permiso y el usuario NO lo tiene, lo saltamos
          if (item.permission && user?.permissions && !user.permissions[item.permission]) {
            return null
          }

          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-white text-inkwell shadow-lg" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-creme-brulee" : "text-slate-500 group-hover:text-slate-300"
              )} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-bold",
                  isActive ? "bg-slate-100 text-slate-600" : "bg-slate-800 text-slate-400"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group">
          <div className="h-9 w-9 rounded-full bg-creme-brulee flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-slate-700">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'A'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Admin User'}</p>
            <p className="text-[10px] text-slate-500 truncate lowercase">{user?.role || 'admin'}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-slate-500 hover:text-white hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
