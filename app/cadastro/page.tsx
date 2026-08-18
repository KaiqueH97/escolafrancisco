'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  
  const router = useRouter()

  const fazerCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(null)
    setSucesso(null)

    if (senha !== confirmarSenha) {
      setErro('As senhas digitadas não são iguais.')
      setCarregando(false)
      return
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      setCarregando(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: email,
      password: senha,
    })

    if (error) {
      setErro(error.message)
      setCarregando(false)
    } else {
      setSucesso('Conta criada com sucesso! Redirecionando...')
      // Aguarda 2 segundinhos para a pessoa ler a mensagem de sucesso
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-md border border-slate-200">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Nova Conta</h1>
          <p className="text-slate-500 font-medium">Cadastre-se no Escola Francisco.</p>
        </div>

        <form onSubmit={fazerCadastro} className="flex flex-col gap-5">
          
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-medium text-center text-sm">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg font-medium text-center text-sm">
              {sucesso}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-2">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: secretaria@escola.com" 
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
              placeholder="Mínimo 6 caracteres" 
              required
              className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Confirmar Senha</label>
            <input 
              type="password" 
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Repita sua senha" 
              required
              className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 transition-colors"
            />
          </div>

          <button 
            type="submit"
            disabled={carregando}
            className="w-full bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-black text-xl py-4 rounded-xl shadow-md mt-2 transition-colors disabled:opacity-70"
          >
            {carregando ? 'Criando conta...' : 'Cadastrar'}
          </button>

          <div className="text-center mt-4 border-t border-slate-100 pt-4">
            <p className="text-slate-600">Já tem uma conta?</p>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Voltar para o Login
            </Link>
          </div>

        </form>

      </div>
    </main>
  )
}