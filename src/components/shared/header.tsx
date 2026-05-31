"use client"

import * as React from "react"
import { Search, Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationsService, Notification } from "@/services/notifications.service"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function Header() {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    fetchNotifications()
    // Optionally poll every minute
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await notificationsService.getAll()
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.isRead).length)
    } catch (error) {
      console.error("Error fetching notifications", error)
    }
  }

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      await notificationsService.markAsRead(id)
      await fetchNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await notificationsService.markAllAsRead()
      await fetchNotifications()
    } catch (error) {
      console.error(error)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar..."
            className="pl-10 bg-slate-50 border-none focus-visible:ring-creme-brulee"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-50">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl shadow-xl border-slate-100 p-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 tracking-tight">Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-semibold text-[#0F172A] hover:text-slate-600 transition-colors"
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic font-medium">
                  No tienes notificaciones por el momento
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-3 p-4 border-b border-slate-50 transition-colors hover:bg-slate-50 relative group",
                        !notification.isRead && "bg-blue-50/50"
                      )}
                    >
                      <div className="mt-1 flex-shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-bold truncate", !notification.isRead ? "text-slate-800" : "text-slate-600")}>
                            {notification.title}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 h-6 w-6 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all hover:scale-110"
                          title="Marcar como leída"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
