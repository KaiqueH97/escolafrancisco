'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Define o formato dos dados do aluno que vêm do banco
type Aluno = {
  id: string
  nome: string
  turma: string
}

export default function Home() {
  // Variáveis de estado para gerenciar o fluxo da tela
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null)
  
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([])
  const [buscaNome, setBuscaNome] = useState('')
  
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  // 1. Carrega as turmas disponíveis assim que o aplicativo abre
  useEffect(() => {
    async function carregarTurmas() {
      // Busca apenas a coluna de turmas no banco de dados
      const { data, error } = await supabase
        .from('alunos')
        .select('turma')
      
      if (error) {
        console.error("Erro ao buscar turmas:", error)
        setCarregando(false)
        return
      }

      // Filtra para não repetir nomes de turmas e organiza em ordem alfabética
      if (data) {
        const turmasUnicas = Array.from(new Set(data.map(a => a.turma))).sort()
        setTurmasDisponiveis(turmasUnicas)
      }
      setCarregando(false)
    }

    carregarTurmas()
  }, [])

  // 2. Carrega os alunos quando a funcionária clica em uma turma específica
  useEffect(() => {
    async function carregarAlunosDaTurma() {
      if (!turmaSelecionada) return
      
      setCarregando(true)
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, turma')
        .eq('turma', turmaSelecionada)
        .order('nome')

      if (error) {
        console.error("Erro ao buscar alunos:", error)
      } else if (data) {
        setAlunosDaTurma(data)
      }
      setCarregando(false)
    }

    carregarAlunosDaTurma()
  }, [turmaSelecionada])

  // 3. Registra o atraso no banco de dados
  const registrarAtraso = async (aluno: Aluno) => {
    // Mostra a tela verde de sucesso imediatamente (para agilidade)
    setMensagemSucesso(`${aluno.nome} registrado!`)
    
    // Salva a informação de fato no Supabase
    const { error } = await supabase
      .from('atrasos')
      .insert([{ aluno_id: aluno.id }])

    if (error) {
      console.error("Erro ao registrar atraso:", error)
      setMensagemSucesso(`Erro ao registrar ${aluno.nome}. Tente novamente.`)
      return
    }

    // Aguarda 1.5 segundos e limpa a tela para o próximo aluno da fila
    setTimeout(() => {
      setMensagemSucesso(null)
      setBuscaNome('')
      setTurmaSelecionada(null)
    }, 1500)
  }

  // Filtra a lista de alunos conforme a funcionária digita no campo de busca
  const alunosFiltrados = alunosDaTurma.filter(aluno => 
    aluno.nome.toLowerCase().includes(buscaNome.toLowerCase())
  )

  // --- LÓGICA DE RENDERIZAÇÃO (O QUE APARECE NA TELA) ---

  if (carregando && turmasDisponiveis.length === 0) {
    return <div className="flex h-screen items-center justify-center p-4 text-xl text-slate-800">Carregando sistema...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-slate-100">
      
      <div className="w-full max-w-md flex flex-col gap-6 pt-8">
        <h1 className="text-3xl font-black text-center text-slate-900">AtrasoZero</h1>

        {/* MENSAGEM DE SUCESSO VERDE (TELA CHEIA) */}
        {mensagemSucesso && (
          <div className="absolute top-0 left-0 w-full h-full bg-green-600 z-50 flex items-center justify-center p-4">
             <p className="text-white text-4xl font-black text-center">{mensagemSucesso}</p>
          </div>
        )}

        {/* PASSO 1: SELECIONAR A TURMA */}
        {!turmaSelecionada && !mensagemSucesso && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-center text-slate-800 mb-2">1. Selecione a Turma</h2>
            <div className="grid grid-cols-2 gap-4">
              {turmasDisponiveis.map(turma => (
                <button
                  key={turma}
                  onClick={() => setTurmaSelecionada(turma)}
                  className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-2xl font-bold py-8 rounded-xl shadow-md transition-colors"
                >
                  {turma}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 2: SELECIONAR OU BUSCAR O ALUNO */}
        {turmaSelecionada && !mensagemSucesso && (
          <div className="flex flex-col gap-4 grow">
             <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-slate-800">
                  Turma: <span className="text-blue-700">{turmaSelecionada}</span>
                </h2>
                <button 
                  onClick={() => {
                    setTurmaSelecionada(null)
                    setBuscaNome('')
                  }}
                  className="text-slate-700 font-bold underline py-2 px-4 active:text-blue-600"
                >
                  Voltar
                </button>
             </div>

            {/* Campo de busca (Opcional, útil para turmas muito grandes) */}
            <input
              type="text"
              placeholder="Digite o nome (opcional)..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="w-full text-xl font-medium text-slate-900 bg-white placeholder-slate-500 p-4 border-2 border-slate-400 rounded-xl focus:border-blue-600 focus:outline-none shadow-sm"
              autoFocus // Tenta abrir o teclado automaticamente
            />

            <div className="flex flex-col gap-3 mt-4 overflow-y-auto pb-20">
              {carregando ? (
                <p className="text-center text-slate-600 font-medium">Carregando alunos...</p>
              ) : alunosFiltrados.length > 0 ? (
                alunosFiltrados.map(aluno => (
                  <button
                    key={aluno.id}
                    onClick={() => registrarAtraso(aluno)}
                    className="bg-white border-2 border-slate-300 active:border-green-600 active:bg-green-100 text-left text-xl font-semibold text-slate-900 p-5 rounded-xl shadow-sm transition-all"
                  >
                    {aluno.nome}
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-600 font-medium">Nenhum aluno encontrado com &quot;{buscaNome}&quot;</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}