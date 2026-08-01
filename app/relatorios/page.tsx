'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Define o formato dos dados unindo as duas tabelas
type AtrasoRelatorio = {
  id: string
  data_hora: string
  alunos: {
    nome: string
    turma: string
  }
}

export default function RelatoriosPage() {
  const [atrasos, setAtrasos] = useState<AtrasoRelatorio[]>([])
  const [carregando, setCarregando] = useState(true)

  async function carregarAtrasosDeHoje() {
    setCarregando(true)

    // Pega a data de hoje à meia-noite (00:00:00) para filtrar corretamente
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const inicioDoDiaISO = hoje.toISOString()

    // Busca os atrasos e faz um "Join" com a tabela de alunos
    const { data, error } = await supabase
      .from('atrasos')
      .select(`
        id,
        data_hora,
        alunos (
          nome,
          turma
        )
      `)
      .gte('data_hora', inicioDoDiaISO) // Apenas os registros de hoje
      .order('data_hora', { ascending: false }) // Do mais recente para o mais antigo

    if (error) {
      console.error("Erro ao buscar relatórios:", error)
    } else if (data) {
      // O Supabase retorna os dados aninhados (nested), então dizemos ao TypeScript o formato correto
      setAtrasos(data as unknown as AtrasoRelatorio[])
    }
    
    setCarregando(false)
  }

  // Carrega os dados assim que a tela abre
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarAtrasosDeHoje()
  }, [])

  // Função para formatar a hora (ex: "07:15")
  const formatarHora = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Relatório de Atrasos</h1>
            <p className="text-slate-500 mt-1">
              Alunos que chegaram após o horário hoje ({new Date().toLocaleDateString('pt-BR')})
            </p>
          </div>
          
          <button 
            onClick={carregarAtrasosDeHoje}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Atualizar Lista
          </button>
        </div>

        {carregando ? (
          <p className="text-center text-slate-600 font-medium py-10">Carregando dados...</p>
        ) : atrasos.length === 0 ? (
          <div className="text-center py-10 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-700 font-bold text-xl">Nenhum atraso registrado hoje!</p>
            <p className="text-green-600">Todos os alunos chegaram no horário.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="p-4 font-bold border-b border-slate-200 rounded-tl-lg">Horário</th>
                  <th className="p-4 font-bold border-b border-slate-200">Nome do Aluno</th>
                  <th className="p-4 font-bold border-b border-slate-200 rounded-tr-lg">Turma</th>
                </tr>
              </thead>
              <tbody>
                {atrasos.map((atraso) => (
                  <tr key={atraso.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                    <td className="p-4 font-medium text-slate-900">
                      {formatarHora(atraso.data_hora)}
                    </td>
                    <td className="p-4 text-slate-800">{atraso.alunos.nome}</td>
                    <td className="p-4 text-slate-600 font-medium">{atraso.alunos.turma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  )
}