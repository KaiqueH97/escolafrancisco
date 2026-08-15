'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // <-- Importamos o router para fazer o redirecionamento

type Aluno = {
  id: string
  nome: string
  turma: string
}

type ModoTela = 'atraso' | 'saida'

export default function Home() {
  const router = useRouter() // <-- Inicializamos o router
  const [modo, setModo] = useState<ModoTela>('atraso')
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([])
  const [turmaSelecionada, setTurmaSelecionada] = useState<string | null>(null)
  
  const [alunosDaTurma, setAlunosDaTurma] = useState<Aluno[]>([])
  const [buscaNome, setBuscaNome] = useState('')
  
  const [alunoSelecionadoParaSaida, setAlunoSelecionadoParaSaida] = useState<Aluno | null>(null)
  const [nomeResponsavel, setNomeResponsavel] = useState('')
  const [documentoResponsavel, setDocumentoResponsavel] = useState('')
  
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregarTurmas() {
      const { data, error } = await supabase.from('alunos').select('turma')
      if (error) {
        console.error("Erro ao buscar turmas:", error)
        setCarregando(false)
        return
      }
      if (data) {
        const turmasUnicas = Array.from(new Set(data.map(a => a.turma))).sort()
        setTurmasDisponiveis(turmasUnicas)
      }
      setCarregando(false)
    }
    carregarTurmas()
  }, [])

  useEffect(() => {
    async function carregarAlunosDaTurma() {
      if (!turmaSelecionada) return
      setCarregando(true)
      const { data, error } = await supabase
        .from('alunos')
        .select('id, nome, turma')
        .eq('turma', turmaSelecionada)
        .order('nome')

      if (error) console.error("Erro ao buscar alunos:", error)
      else if (data) setAlunosDaTurma(data)
      setCarregando(false)
    }
    carregarAlunosDaTurma()
  }, [turmaSelecionada])

  const alternarModo = (novoModo: ModoTela) => {
    setModo(novoModo)
    setTurmaSelecionada(null)
    setBuscaNome('')
    setAlunoSelecionadoParaSaida(null)
    setNomeResponsavel('')
    setDocumentoResponsavel('')
  }

  const registrarAtraso = async (aluno: Aluno) => {
    setMensagemSucesso(`${aluno.nome} atrasado!`)
    const { error } = await supabase.from('atrasos').insert([{ aluno_id: aluno.id }])
    
    if (error) setMensagemSucesso(`Erro. Tente novamente.`)
    else setTimeout(resetarFluxo, 1500)
  }

  const registrarSaida = async () => {
    if (!alunoSelecionadoParaSaida || !nomeResponsavel || !documentoResponsavel) {
      alert("Por favor, preencha o nome e o documento do responsável.")
      return
    }

    setMensagemSucesso(`Saída de ${alunoSelecionadoParaSaida.nome} registrada!`)
    
    const { error } = await supabase.from('saidas').insert([{ 
      aluno_id: alunoSelecionadoParaSaida.id,
      nome_responsavel: nomeResponsavel,
      documento_responsavel: documentoResponsavel
    }])
    
    if (error) setMensagemSucesso(`Erro. Tente novamente.`)
    else setTimeout(resetarFluxo, 1500)
  }

  const resetarFluxo = () => {
    setMensagemSucesso(null)
    setBuscaNome('')
    setTurmaSelecionada(null)
    setAlunoSelecionadoParaSaida(null)
    setNomeResponsavel('')
    setDocumentoResponsavel('')
  }

  const fazerLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const alunosFiltrados = alunosDaTurma.filter(aluno => 
    aluno.nome.toLowerCase().includes(buscaNome.toLowerCase())
  )

  if (carregando && turmasDisponiveis.length === 0) {
    return <div className="flex h-screen items-center justify-center p-4 text-xl text-slate-800 font-bold">Carregando sistema...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-slate-100">
      <div className="w-full max-w-md flex flex-col gap-6 pt-6">
        
        {/* CABEÇALHO ATUALIZADO COM OS DOIS BOTÕES */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Secretaria</h1>
          <div className="flex items-center gap-2">
            <Link 
              href="/relatorios"
              className="bg-slate-300 hover:bg-slate-400 active:bg-slate-500 text-slate-800 px-3 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              Relatórios
            </Link>
            <button 
              onClick={fazerLogout}
              className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 px-3 py-2 rounded-xl font-bold text-sm transition-colors shadow-sm"
            >
              Sair
            </button>
          </div>
        </div>

        {/* O restante do código continua igual abaixo */}
        {mensagemSucesso && (
          <div className="absolute top-0 left-0 w-full h-full bg-green-600 z-50 flex items-center justify-center p-4">
             <p className="text-white text-4xl font-black text-center">{mensagemSucesso}</p>
          </div>
        )}

        {!mensagemSucesso && (
          <div className="flex bg-slate-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => alternarModo('atraso')}
              className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${modo === 'atraso' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
            >
              Registrar Atraso
            </button>
            <button
              onClick={() => alternarModo('saida')}
              className={`flex-1 py-3 text-lg font-bold rounded-lg transition-all ${modo === 'saida' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500'}`}
            >
              Saída de Aluno
            </button>
          </div>
        )}

        {!turmaSelecionada && !mensagemSucesso && (
          <div className="flex flex-col gap-4 mt-2">
            <h2 className="text-xl font-bold text-center text-slate-800">
              {modo === 'atraso' ? 'Turmas' : 'Turmas'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {turmasDisponiveis.map(turma => (
                <button
                  key={turma}
                  onClick={() => setTurmaSelecionada(turma)}
                  className={`text-white text-2xl font-bold py-8 rounded-xl shadow-md transition-colors ${modo === 'atraso' ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800' : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'}`}
                >
                  {turma}
                </button>
              ))}
            </div>
          </div>
        )}

        {turmaSelecionada && !alunoSelecionadoParaSaida && !mensagemSucesso && (
          <div className="flex flex-col gap-4 grow">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">
                  Turma: <span className={modo === 'atraso' ? 'text-blue-700' : 'text-purple-700'}>{turmaSelecionada}</span>
                </h2>
                <button 
                  onClick={() => { setTurmaSelecionada(null); setBuscaNome(''); }}
                  className="text-slate-700 font-bold underline py-2 px-4 active:text-blue-600"
                >
                  Trocar Turma
                </button>
             </div>

            <input
              type="text"
              placeholder="Pesquisar nome..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="w-full text-xl font-medium text-slate-900 bg-white placeholder-slate-500 p-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-slate-800"
              autoFocus
            />

            <div className="flex flex-col gap-3 mt-2 overflow-y-auto pb-20">
              {carregando ? (
                <p className="text-center text-slate-600 font-medium">Buscando...</p>
              ) : alunosFiltrados.length > 0 ? (
                alunosFiltrados.map(aluno => (
                  <button
                    key={aluno.id}
                    onClick={() => modo === 'atraso' ? registrarAtraso(aluno) : setAlunoSelecionadoParaSaida(aluno)}
                    className="bg-white border-2 border-slate-300 text-left text-xl font-bold text-slate-900 p-5 rounded-xl shadow-sm transition-all active:border-slate-800 active:bg-slate-50"
                  >
                    {aluno.nome}
                  </button>
                ))
              ) : (
                <p className="text-center text-slate-600 font-medium">Aluno não encontrado.</p>
              )}
            </div>
          </div>
        )}

        {alunoSelecionadoParaSaida && !mensagemSucesso && (
          <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm font-bold text-purple-600 uppercase tracking-wide">Registrar Saída</p>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{alunoSelecionadoParaSaida.nome}</h2>
                <p className="text-slate-500 font-medium">{alunoSelecionadoParaSaida.turma}</p>
              </div>
              <button onClick={() => setAlunoSelecionadoParaSaida(null)} className="text-slate-500 underline font-bold">Voltar</button>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-2">Nome de quem está retirando:</label>
                <input 
                  type="text" 
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  placeholder="Ex: Maria Silva (Mãe)" 
                  className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">Documento (RG ou CPF):</label>
                <input 
                  type="text" 
                  value={documentoResponsavel}
                  onChange={(e) => setDocumentoResponsavel(e.target.value)}
                  placeholder="Ex: 12.345.678-9" 
                  className="w-full p-4 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-purple-600 bg-slate-50"
                />
              </div>

              <button 
                onClick={registrarSaida}
                className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-black text-xl py-5 rounded-xl shadow-md mt-4 transition-colors"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}