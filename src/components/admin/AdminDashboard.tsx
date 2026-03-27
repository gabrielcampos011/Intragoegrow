'use client'

import { useState } from 'react'
import { Plus, Trash2, Pencil, Users, FileVideo, ChevronRight, Building2, Download } from 'lucide-react'
import AddContentModal from './AddContentModal'
import EditContentModal from './EditContentModal'
import { deleteContent, addSector, deleteSector } from '@/app/admin/actions'

export default function AdminDashboard({ users, progress, contents, sectors }: any) {
  const [activeTab, setActiveTab] = useState<'users' | 'contents' | 'sectors'>('users')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editingContent, setEditingContent] = useState<any>(null)
  const [sectorName, setSectorName] = useState('')
  const [sectorLoading, setSectorLoading] = useState(false)
  const [sectorError, setSectorError] = useState('')

  const totalContentsBySector = (sectorId: string | null) => {
    return contents.filter((c: any) => c.sector_id === null || c.sector_id === sectorId).length
  }

  const handleDeleteContent = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este conteúdo? Isso removerá o progresso de todos os usuários.')) {
      await deleteContent(id)
    }
  }

  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault()
    setSectorLoading(true)
    setSectorError('')
    const formData = new FormData()
    formData.set('name', sectorName)
    const result = await addSector(formData)
    if (result?.success) {
      setSectorName('')
    } else {
      setSectorError(result?.error || 'Erro ao criar setor')
    }
    setSectorLoading(false)
  }

  const handleExportCSV = () => {
    const rows: string[][] = [
      ['Colaborador', 'E-mail', 'Setor', 'Treinamento', 'Tipo', 'Status', 'Posição'],
    ]

    users.forEach((user: any) => {
      const userContents = contents.filter(
        (c: any) => c.sector_id === null || c.sector_id === user.sectors?.id
      )
      userContents.forEach((c: any) => {
        const p = progress.find((pr: any) => pr.user_id === user.id && pr.content_id === c.id)
        const status = p?.completed ? 'Concluído' : p?.position ? 'Em andamento' : 'Não iniciado'
        const pos = p?.position != null
          ? (c.type === 'video' ? `${Math.floor(p.position)}s` : c.type === 'pdf' ? `Pág. ${p.position}` : 'visitado')
          : '-'
        rows.push([user.name, '', user.sectors?.name || 'Sem setor', c.title, c.type, status, pos])
      })
    })

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `progresso-treinamentos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteSector = async (id: string) => {
    if (confirm('Excluir este setor? Usuários e conteúdos vinculados perderão o vínculo.')) {
      await deleteSector(id)
    }
  }

  // Visualização de usuário específico
  if (selectedUser) {
    const userProgress = progress.filter((p: any) => p.user_id === selectedUser.id)
    const userTotalContents = totalContentsBySector(selectedUser.sectors?.id)
    const completedCount = userProgress.filter((p: any) => p.completed).length

    return (
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <button
          onClick={() => setSelectedUser(null)}
          className="text-gogrow-red font-medium mb-6 hover:underline flex items-center gap-1"
        >
          ← Voltar para Lista
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
          <p className="text-gray-500">{selectedUser.sectors?.name || 'Sem setor'} • Concluiu {completedCount} de {userTotalContents} treinamentos</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b pb-2">Detalhes de Treinamentos (Disponíveis para o usuário)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-gray-600">Treinamento</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Progresso Atual</th>
                </tr>
              </thead>
              <tbody>
                {contents
                  .filter((c: any) => c.sector_id === null || c.sector_id === selectedUser.sectors?.id)
                  .map((c: any) => {
                    const p = userProgress.find((up: any) => up.content_id === c.id)
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50">
                        <td className="p-3">
                          <div className="font-medium">{c.title}</div>
                          <div className="text-xs text-gray-500 uppercase">{c.type} • {c.sectors?.name || 'Global'}</div>
                        </td>
                        <td className="p-3">
                          {p?.completed ? (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Concluído</span>
                          ) : p?.position !== null && p?.position !== undefined ? (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Em Andamento</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold">Não Iniciado</span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {p?.position !== null && p?.position !== undefined
                            ? (c.type === 'video' ? `${Math.floor(p.position)}s assistidos` : c.type === 'link' ? 'Link visitado' : `Página ${p.position}`)
                            : '--'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 ${activeTab === 'users' ? 'text-gogrow-red border-b-2 border-gogrow-red' : 'text-gray-500 hover:text-black'}`}
        >
          <Users size={18} />
          Progresso de Usuários
        </button>
        <button
          onClick={() => setActiveTab('contents')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 ${activeTab === 'contents' ? 'text-gogrow-red border-b-2 border-gogrow-red' : 'text-gray-500 hover:text-black'}`}
        >
          <FileVideo size={18} />
          Gerenciar Conteúdos
        </button>
        <button
          onClick={() => setActiveTab('sectors')}
          className={`pb-3 px-2 font-medium flex items-center gap-2 ${activeTab === 'sectors' ? 'text-gogrow-red border-b-2 border-gogrow-red' : 'text-gray-500 hover:text-black'}`}
        >
          <Building2 size={18} />
          Setores
        </button>
      </div>

      {/* ABA: USUÁRIOS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-lg">Colaboradores</h3>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-sm font-semibold text-gray-600">Colaborador</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Setor</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Conclusão Geral</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const userProgress = progress.filter((p: any) => p.user_id === user.id)
                const userTotalContents = totalContentsBySector(user.sectors?.id)
                const completedCount = userProgress.filter((p: any) => p.completed).length
                const percent = userTotalContents > 0 ? Math.round((completedCount / userTotalContents) * 100) : 0

                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50 group cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <td className="p-4 font-medium text-gogrow-black">
                      {user.name}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {user.sectors?.name || 'Sem Setor'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-full max-w-[150px] bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${percent === 100 ? 'bg-green-500' : 'bg-gogrow-red'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                        <span className="text-sm font-bold">{percent}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <ChevronRight className="inline text-gray-300 group-hover:text-gogrow-red transition-colors" />
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum colaborador encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA: CONTEÚDOS */}
      {activeTab === 'contents' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-lg">Acervo de Treinamentos</h3>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gogrow-red text-white font-bold rounded-lg hover:bg-gogrow-red-hover transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={18} />
              Novo Conteúdo
            </button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">Título</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Tipo</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Público (Setor)</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content: any) => (
                <tr key={content.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gogrow-black max-w-xs truncate" title={content.title}>
                    {content.title}
                  </td>
                  <td className="p-4 text-sm uppercase text-gray-500 font-bold">
                    {content.type}
                  </td>
                  <td className="p-4">
                    <span className="bg-black/5 text-gray-700 text-xs px-2 py-1 rounded-md font-medium border">
                      {content.sectors?.name || 'Global'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingContent(content)}
                        className="text-gray-500 hover:text-gogrow-red p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contents.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum conteúdo cadastrado. Comece adicionando o primeiro treinamento.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA: SETORES */}
      {activeTab === 'sectors' && (
        <div className="space-y-6">
          {/* Formulário de criação */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h3 className="font-bold text-lg mb-4">Novo Setor</h3>
            <form onSubmit={handleAddSector} className="flex gap-3">
              <input
                type="text"
                value={sectorName}
                onChange={e => setSectorName(e.target.value)}
                placeholder="Nome do setor (ex: Vendas, Operações...)"
                className="flex-1 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gogrow-red"
                required
              />
              <button
                type="submit"
                disabled={sectorLoading}
                className="px-4 py-2.5 bg-gogrow-red text-white font-bold rounded-lg hover:bg-gogrow-red-hover transition-colors flex items-center gap-2 text-sm disabled:opacity-60"
              >
                <Plus size={18} />
                {sectorLoading ? 'Criando...' : 'Criar Setor'}
              </button>
            </form>
            {sectorError && <p className="mt-2 text-sm text-red-600">{sectorError}</p>}
          </div>

          {/* Lista de setores */}
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 text-sm font-semibold text-gray-600">Setor</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Colaboradores</th>
                  <th className="p-4 text-sm font-semibold text-gray-600">Conteúdos exclusivos</th>
                  <th className="p-4 text-right"></th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((sector: any) => (
                  <tr key={sector.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{sector.name}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {users.filter((u: any) => u.sector_id === sector.id).length} colaboradores
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {contents.filter((c: any) => c.sector_id === sector.id).length} conteúdos
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteSector(sector.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir setor"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {sectors.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Nenhum setor cadastrado. Crie o primeiro setor acima.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddContentModal sectors={sectors} onClose={() => setIsAddModalOpen(false)} />
      )}

      {editingContent && (
        <EditContentModal content={editingContent} sectors={sectors} onClose={() => setEditingContent(null)} />
      )}
    </div>
  )
}
