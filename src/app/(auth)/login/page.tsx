"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, Mail, Lock, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authService } from "@/services/auth.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const router = useRouter()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      await authService.login(email, password)
      toast.success("¡Bienvenido de nuevo!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.toString())
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side: Login Form */}
      <div className="flex w-full flex-col justify-center px-8 md:w-[450px] lg:w-[600px] xl:w-[700px]">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-2 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-inkwell text-white shadow-lg">
                <LayoutDashboard className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight text-inkwell">Allin Wasi</h1>
                <p className="text-xs text-muted-foreground">Plataforma de Visitas Virtuales 360°</p>
              </div>
            </div>
            
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mx-auto mb-4 border border-slate-200">
               <Shield className="h-3 w-3" /> Panel de Administrador
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
              <CardHeader className="space-y-1 text-center pb-2">
                <CardTitle className="text-2xl text-inkwell">Bienvenido de vuelta</CardTitle>
                <CardDescription>
                  Accede al panel de administración para gestionar la plataforma de visitas virtuales
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <form onSubmit={onSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-inkwell font-semibold">Correo electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          placeholder="admin@allinwasi.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="pl-10 h-11 border-slate-200 focus:ring-creme-brulee"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" title="Contraseña" className="text-inkwell font-semibold">Contraseña</Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-medium text-creme-brulee hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          placeholder="••••••••"
                          type="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="pl-10 h-11 border-slate-200 focus:ring-creme-brulee"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-creme-brulee data-[state=checked]:border-creme-brulee" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-500"
                      >
                        Recordar sesión
                      </label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-inkwell hover:bg-slate-800 text-white font-bold transition-all hover:translate-y-[-1px] active:translate-y-[0px] shadow-lg shadow-slate-900/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Acceder al Panel</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="px-8 text-center text-sm text-muted-foreground"
          >
            ¿Necesitas acceso de administrador?{" "}
            <Link
              href="/contact"
              className="font-semibold text-inkwell hover:underline underline-offset-4"
            >
              Contactar soporte técnico
            </Link>
          </motion.p>
          
          <div className="flex justify-center gap-4 text-[10px] text-slate-400 font-medium">
            <span>• Seguro y confiable</span>
            <span>• Disponible 24/7</span>
            <span>• TECSUP 2025</span>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Content */}
      <div className="hidden flex-1 bg-inkwell relative overflow-hidden md:flex flex-col justify-center px-12 lg:px-24">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-creme-brulee/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="h-1 w-12 bg-creme-brulee mb-6 rounded-full" />
            <span className="text-slate-400 uppercase tracking-widest text-xs font-bold mb-4 block">Admin Dashboard</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Gestiona la plataforma de <span className="text-creme-brulee italic">visitas virtuales</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Administra tours 360°, usuarios, propiedades y el mapa interactivo para estudiantes de TECSUP.
            </p>
            
            <div className="grid grid-cols-2 gap-8 border-t border-slate-800 pt-10">
              <div className="space-y-1">
                <p className="text-white font-bold text-2xl">100%</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Control Total</p>
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-2xl">24/7</p>
                <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Monitorización</p>
              </div>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-slate-400 text-sm font-medium">Sistema activo</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-slate-600" />
                 <span className="text-slate-400 text-sm font-medium">Acceso seguro</span>
               </div>
            </div>
          </motion.div>
        </div>
        
        {/* Footer info in dark area */}
        <div className="absolute bottom-8 left-12 lg:left-24 text-slate-600 text-xs font-medium">
          &copy; 2025 Allin Wasi - Gestión de Alquileres
        </div>
      </div>
    </div>
  )
}
