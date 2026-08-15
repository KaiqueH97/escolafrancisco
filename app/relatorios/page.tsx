'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// Tipagens atualizadas para bater com a nossa View do banco de dados
type AtrasoRelatorio = {
  id: string
  data_hora: string
  aluno_nome: string
  aluno_turma: string
  registrado_por: string | null
}

type SaidaRelatorio = {
  id: string
  data_hora: string
  nome_responsavel: string
  documento_responsavel: string
  aluno_nome: string
  aluno_turma: string
  registrado_por: string | null
}

type ModoRelatorio = 'atrasos' | 'saidas'

export default function RelatoriosPage() {
  const [modo, setModo] = useState<ModoRelatorio>('atrasos')
  const [atrasos, setAtrasos] = useState<AtrasoRelatorio[]>([])
  const [saidas, setSaidas] = useState<SaidaRelatorio[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const inicioDoDiaISO = hoje.toISOString()

    if (modo === 'atrasos') {
      // Agora buscamos direto da nossa View!
      const { data, error } = await supabase
        .from('vw_relatorio_atrasos')
        .select('*')
        .gte('data_hora', inicioDoDiaISO)
        .order('data_hora', { ascending: false })

      if (error) console.error("Erro ao buscar atrasos:", error)
      else setAtrasos(data as AtrasoRelatorio[])
    } 
    else {
      // Agora buscamos direto da nossa View!
      const { data, error } = await supabase
        .from('vw_relatorio_saidas')
        .select('*')
        .gte('data_hora', inicioDoDiaISO)
        .order('data_hora', { ascending: false })

      if (error) console.error("Erro ao buscar saídas:", error)
      else setSaidas(data as SaidaRelatorio[])
    }
    
    setCarregando(false)
  }, [modo])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados()
  }, [carregarDados])

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  // Função para deixar o e-mail mais limpo (ex: tira o @escola.com)
  const formatarUsuario = (email: string | null) => {
    if (!email) return 'Sistema'
    return email.split('@')[0]
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        {/* CABEÇALHO ATUALIZADO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatório Diário</h1>
            <p className="text-slate-500 mt-1 font-medium">
              Movimentação de hoje ({new Date().toLocaleDateString('pt-BR')})
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link 
              href="/"
              className="flex-1 md:flex-none text-center bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              ⬅ Voltar para Portaria
            </Link>
            <button 
              onClick={carregarDados}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Atualizar Lista
            </button>
          </div>
        </div>

        {/* SELETOR DE ABAS */}
        <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner mb-6">
          <button
            onClick={() => setModo('atrasos')}
            className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${modo === 'atrasos' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Atrasos
          </button>
          <button
            onClick={() => setModo('saidas')}
            className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${modo === 'saidas' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Saídas Antecipadas
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO (TABELAS) */}
        {carregando ? (
          <div className="text-center py-12">
            <p className="text-slate-600 font-bold text-lg animate-pulse">Carregando dados com segurança...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            {modo === 'atrasos' ? (
              atrasos.length === 0 ? (
                <div className="text-center py-10 bg-slate-50">
                  <p className="text-slate-700 font-bold text-xl">Nenhum atraso hoje!</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-175">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                      <th className="p-4 font-bold">Horário</th>
                      <th className="p-4 font-bold">Nome do Aluno</th>
                      <th className="p-4 font-bold">Turma</th>
                      <th className="p-4 font-bold">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atrasos.map((atraso) => (
                      <tr key={atraso.id} className="hover:bg-blue-50 border-t border-slate-100 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{formatarHora(atraso.data_hora)}</td>
                        <td className="p-4 text-slate-800 font-medium">{atraso.aluno_nome}</td>
                        <td className="p-4 text-slate-600 font-bold">{atraso.aluno_turma}</td>
                        <td className="p-4 text-slate-500 font-medium capitalize">
                          {formatarUsuario(atraso.registrado_por)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : (
              saidas.length === 0 ? (
                <div className="text-center py-10 bg-slate-50">
                  <p className="text-slate-700 font-bold text-xl">Nenhuma saída antecipada hoje.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-225">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                      <th className="p-4 font-bold">Horário</th>
                      <th className="p-4 font-bold">Aluno</th>
                      <th className="p-4 font-bold">Turma</th>
                      <th className="p-4 font-bold">Responsável</th>
                      <th className="p-4 font-bold">Documento</th>
                      <th className="p-4 font-bold">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saidas.map((saida) => (
                      <tr key={saida.id} className="hover:bg-purple-50 border-t border-slate-100 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{formatarHora(saida.data_hora)}</td>
                        <td className="p-4 text-slate-800 font-medium">{saida.aluno_nome}</td>
                        <td className="p-4 text-slate-600 font-bold">{saida.aluno_turma}</td>
                        <td className="p-4 text-purple-700 font-bold">{saida.nome_responsavel}</td>
                        <td className="p-4 text-slate-500 font-medium">{saida.documento_responsavel}</td>
                        <td className="p-4 text-slate-500 font-medium capitalize">
                          {formatarUsuario(saida.registrado_por)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}

      </div>
    </main>
  )
}