'use client'

import { useState } from 'react'
import { updateContent } from '@/app/admin/actions'
import { X } from 'lucide-react'

export default function EditContentModal({ 
  content,
  sectors, 
  onClose 
}: { 
  content: { id: string; title: string; type: string; url: string; sector_id: string | null }
  sectors: any[], 
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const result = await updateContent(content.id, formData)
    
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao atualizar conteúdo')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Editar Treinamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Título do Treinamento</label>
            <input 
              name="title" 
              required 
              defaultValue={content.title}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none" 
              placeholder="Ex: Integração Go&Grow"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <select 
              name="type" 
              required
              defaultValue={content.type}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none bg-white"
            >
              <option value="video">Vídeo</option>
              <option value="pdf">PDF</option>
              <option value="link">Link Externo</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">URL do Arquivo</label>
            <input 
              name="url" 
              type="url"
              required 
              defaultValue={content.url}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none" 
              placeholder="https://sua-url.com/video.mp4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Setor</label>
            <select 
              name="sector_id" 
              required
              defaultValue={content.sector_id || 'global'}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none bg-white"
            >
              <option value="global">Todos os Setores (Global)</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-gogrow-red text-white rounded-lg hover:bg-gogrow-red-hover font-bold disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
