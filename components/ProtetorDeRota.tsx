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
      // Pergunta ao Supabase se tem alguém logado neste aparelho
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && pathname !== '/login') {
        // Se NÃO tem ninguém logado e a pessoa NÃO está na tela de login, chuta ela pro login
        router.push('/login')
      } else if (session && pathname === '/login') {
        // Se a pessoa JÁ ESTÁ logada e tenta abrir a tela de login, manda ela pra Portaria
        router.push('/')
      } else {
        // Tudo certo, pode liberar a tela
        setCarregando(false)
      }
    }

    verificarSessao()

    // Fica vigiando caso a pessoa clique em um botão de "Sair" depois
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription?.unsubscribe?.()
  }, [pathname, router])

  // Mostra uma tela de carregamento rápida enquanto o guarda verifica a identidade
  if (carregando) {
    return (
      <div>Verificando segurança...</div>
    )
  }

  // Se passou pela segurança, exibe a página que a pessoa pediu
  return <>{children}</>
}