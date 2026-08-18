'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function ProtetorDeRota({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && pathname !== '/login' && pathname !== '/cadastro') {
        router.push('/login')
      } else if (session && (pathname === '/login' || pathname === '/cadastro')) {
        router.push('/')
      } else {
        setCarregando(false)
      }
    }

    verificarSessao()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [pathname, router])

  if (carregando) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-800 font-bold text-xl animate-pulse">Verificando segurança...</p>
      </div>
    )
  }

  return <>{children}</>
}