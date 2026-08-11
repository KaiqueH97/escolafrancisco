'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  
  // Usamos o router para redirecionar a pessoa após o login dar certo
  const router = useRouter()

  const fazerLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que a página recarregue ao apertar Enter
    setCarregando(true)
    setErro(null)

    // Tenta fazer o login no Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos. Tente novamente.')
      setCarregando(false)
    } else {
      // Deu certo! Redireciona para a tela da Portaria (Home)
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border border-slate-200">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Acesso</h1>
          <p className="text-slate-500 font-medium">Faça login para registrar portaria.</p>
        </div>

        <form onSubmit={fazerLogin} className="flex flex-col gap-5">
          
          {/* MENSAGEM DE ERRO (Só aparece se a senha estiver errada) */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium text-center text-sm">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-2">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: manha@escola.com" 
              required
              className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" 
              required
              className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={carregando}
            className="w-full bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-black text-xl py-4 rounded-xl shadow-md mt-2 transition-colors disabled:opacity-70"
          >
            {carregando ? 'Entrando...' : 'Entrar no Sistema'}
          </button>

        </form>

      </div>
    </main>
  )
}