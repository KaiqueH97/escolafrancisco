'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Aluno = {
  id: string
  nome: string
  turma: string
}

export default function AdminAlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [carregando, setCarregando] = useState(true)
  const [buscaNome, setBuscaNome] = useState('')
  
  // Estados do formulário
  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [turma, setTurma] = useState('')
  
  const [mensagem, setMensagem] = useState<{ texto: string; tipo: 'sucesso' | 'erro' } | null>(null)

  // 1. READ (Ler os alunos)
  const carregarAlunos = async () => {
    setCarregando(true)
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('nome')
      
    if (error) console.error("Erro ao buscar alunos:", error)
    else setAlunos(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarAlunos()
  }, [])

  // 2. CREATE e UPDATE (Criar e Atualizar)
  const salvarAluno = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que a tela pisque
    setMensagem(null)
    
    if (idEditando) {
      // Atualizar aluno existente
      const { error } = await supabase
        .from('alunos')
        .update({ nome, turma })
        .eq('id', idEditando)
        
      if (error) setMensagem({ texto: 'Erro ao atualizar aluno.', tipo: 'erro' })
      else {
        setMensagem({ texto: 'Aluno atualizado com sucesso!', tipo: 'sucesso' })
        limparFormulario()
        carregarAlunos()
      }
    } else {
      // Cadastrar novo aluno
      const { error } = await supabase
        .from('alunos')
        .insert([{ nome, turma }])
        
      if (error) setMensagem({ texto: 'Erro ao cadastrar aluno.', tipo: 'erro' })
      else {
        setMensagem({ texto: 'Aluno cadastrado com sucesso!', tipo: 'sucesso' })
        limparFormulario()
        carregarAlunos()
      }
    }
    
    // Limpa a mensagem após 3 segundos
    setTimeout(() => setMensagem(null), 3000)
  }

  // Preenche o formulário com os dados do aluno clicado
  const editarAluno = (aluno: Aluno) => {
    setIdEditando(aluno.id)
    setNome(aluno.nome)
    setTurma(aluno.turma)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // Rola a tela para o topo suavemente
  }

  // 3. DELETE (Excluir aluno)
  const excluirAluno = async (id: string, nomeAluno: string) => {
    // Alerta de confirmação nativo do navegador
    if (!window.confirm(`Tem certeza que deseja excluir o aluno(a) ${nomeAluno}? Todos os registros de atraso e saída dele também serão apagados.`)) return
    
    const { error } = await supabase.from('alunos').delete().eq('id', id)
    
    if (error) setMensagem({ texto: 'Erro ao excluir aluno.', tipo: 'erro' })
    else {
      setMensagem({ texto: 'Aluno excluído com sucesso.', tipo: 'sucesso' })
      carregarAlunos()
      setTimeout(() => setMensagem(null), 3000)
    }
  }

  const limparFormulario = () => {
    setIdEditando(null)
    setNome('')
    setTurma('')
  }

  // Filtra a tabela visualmente
  const alunosFiltrados = alunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(buscaNome.toLowerCase()) || 
    aluno.turma.toLowerCase().includes(buscaNome.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Alunos</h1>
            <p className="text-slate-500 font-medium">Cadastre, edite ou remova alunos do sistema.</p>
          </div>
          <Link 
            href="/"
            className="bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            ⬅ Voltar para Portaria
          </Link>
        </div>

        {/* ÁREA DE MENSAGENS */}
        {mensagem && (
          <div className={`p-4 rounded-xl font-bold text-center ${mensagem.tipo === 'sucesso' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {mensagem.texto}
          </div>
        )}

        {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {idEditando ? 'Editando Aluno' : 'Novo Cadastro'}
          </h2>
          
          <form onSubmit={salvarAluno} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-3/5">
              <label className="block text-slate-700 font-bold mb-2">Nome do Aluno</label>
              <input 
                type="text" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva" 
                required
                className="w-full p-3 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
              />
            </div>
            
            <div className="w-full md:w-1/5">
              <label className="block text-slate-700 font-bold mb-2">Turma</label>
              <input 
                type="text" 
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                placeholder="Ex: 3ºA" 
                required
                className="w-full p-3 text-lg border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50 uppercase"
              />
            </div>
            
            <div className="w-full md:w-1/5 flex gap-2">
              {idEditando && (
                <button 
                  type="button"
                  onClick={limparFormulario}
                  className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md"
              >
                {idEditando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>

        {/* LISTA DE ALUNOS (TABELA) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-800">Lista de Alunos Cadastrados</h2>
            <input
              type="text"
              placeholder="Buscar por nome ou turma..."
              value={buscaNome}
              onChange={(e) => setBuscaNome(e.target.value)}
              className="w-full md:w-1/3 p-3 text-md border-2 border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>

          <div className="overflow-x-auto">
            {carregando ? (
              <p className="text-center py-10 text-slate-600 font-bold animate-pulse">Carregando lista...</p>
            ) : alunosFiltrados.length === 0 ? (
              <p className="text-center py-10 text-slate-600 font-medium">Nenhum aluno encontrado.</p>
            ) : (
              <table className="w-full text-left border-collapse min-w-150">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-sm uppercase tracking-wide">
                    <th className="p-4 font-bold rounded-tl-lg">Nome do Aluno</th>
                    <th className="p-4 font-bold">Turma</th>
                    <th className="p-4 font-bold text-center rounded-tr-lg">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                      <td className="p-4 text-slate-900 font-medium">{aluno.nome}</td>
                      <td className="p-4 text-slate-600 font-bold">{aluno.turma}</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button 
                          onClick={() => editarAluno(aluno)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => excluirAluno(aluno.id, aluno.nome)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}