"use client"

import * as React from "react"
import { Search, Bell, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
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
        <Button variant="ghost" size="icon" className="relative text-slate-500">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </Button>
      </div>
    </header>
  )
}
