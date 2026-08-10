'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type AtrasoRelatorio = {
  id: string
  data_hora: string
  alunos: {
    nome: string
    turma: string
  }
}

type SaidaRelatorio = {
  id: string
  data_hora: string
  nome_responsavel: string
  documento_responsavel: string
  alunos: {
    nome: string
    turma: string
  }
}

type ModoRelatorio = 'atrasos' | 'saidas'

export default function RelatoriosPage() {
  const [modo, setModo] = useState<ModoRelatorio>('atrasos')
  const [atrasos, setAtrasos] = useState<AtrasoRelatorio[]>([])
  const [saidas, setSaidas] = useState<SaidaRelatorio[]>([])
  const [carregando, setCarregando] = useState(true)

  // O useCallback memoriza a função e resolve o aviso do ESLint
  const carregarDados = useCallback(async () => {
    setCarregando(true)
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const inicioDoDiaISO = hoje.toISOString()

    if (modo === 'atrasos') {
      const { data, error } = await supabase
        .from('atrasos')
        .select('id, data_hora, alunos (nome, turma)')
        .gte('data_hora', inicioDoDiaISO)
        .order('data_hora', { ascending: false })

      if (error) console.error("Erro ao buscar atrasos:", error)
      else setAtrasos(data as unknown as AtrasoRelatorio[])
    } 
    else {
      const { data, error } = await supabase
        .from('saidas')
        .select('id, data_hora, nome_responsavel, documento_responsavel, alunos (nome, turma)')
        .gte('data_hora', inicioDoDiaISO)
        .order('data_hora', { ascending: false })

      if (error) console.error("Erro ao buscar saídas:", error)
      else setSaidas(data as unknown as SaidaRelatorio[])
    }
    
    setCarregando(false)
  }, [modo]) // A função se atualiza sempre que a aba (modo) muda

  // Agora o useEffect chama a função corretamente dentro das regras do React
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarDados()
  }, [carregarDados])

  const formatarHora = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Relatório Diário</h1>
            <p className="text-slate-500 mt-1 font-medium">
              Movimentação de hoje ({new Date().toLocaleDateString('pt-BR')})
            </p>
          </div>
          <button 
            onClick={carregarDados}
            className="bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            Atualizar Lista
          </button>
        </div>

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

        {carregando ? (
          <div className="text-center py-12">
            <p className="text-slate-600 font-bold text-lg animate-pulse">Carregando dados...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            {modo === 'atrasos' ? (
              atrasos.length === 0 ? (
                <div className="text-center py-10 bg-slate-50">
                  <p className="text-slate-700 font-bold text-xl">Nenhum atraso hoje!</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-150">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                      <th className="p-4 font-bold">Horário</th>
                      <th className="p-4 font-bold">Nome do Aluno</th>
                      <th className="p-4 font-bold">Turma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atrasos.map((atraso) => (
                      <tr key={atraso.id} className="hover:bg-blue-50 border-t border-slate-100 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{formatarHora(atraso.data_hora)}</td>
                        <td className="p-4 text-slate-800 font-medium">{atraso.alunos.nome}</td>
                        <td className="p-4 text-slate-600 font-bold">{atraso.alunos.turma}</td>
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
                <table className="w-full text-left border-collapse min-w-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                      <th className="p-4 font-bold">Horário</th>
                      <th className="p-4 font-bold">Aluno</th>
                      <th className="p-4 font-bold">Turma</th>
                      <th className="p-4 font-bold">Responsável (Retirada)</th>
                      <th className="p-4 font-bold">Documento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saidas.map((saida) => (
                      <tr key={saida.id} className="hover:bg-purple-50 border-t border-slate-100 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{formatarHora(saida.data_hora)}</td>
                        <td className="p-4 text-slate-800 font-medium">{saida.alunos.nome}</td>
                        <td className="p-4 text-slate-600 font-bold">{saida.alunos.turma}</td>
                        <td className="p-4 text-purple-700 font-bold">{saida.nome_responsavel}</td>
                        <td className="p-4 text-slate-500 font-medium">{saida.documento_responsavel}</td>
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