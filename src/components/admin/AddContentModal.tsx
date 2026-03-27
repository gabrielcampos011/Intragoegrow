'use client'

import { useState } from 'react'
import { addContent } from '@/app/admin/actions'
import { createClient } from '@/lib/supabase/client'
import { X, Upload, Link, Loader2, ImageIcon } from 'lucide-react'

export default function AddContentModal({
  sectors,
  onClose
}: {
  sectors: any[],
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [type, setType] = useState('video')

  // Content source
  const [contentMode, setContentMode] = useState<'url' | 'file'>('url')
  const [contentUrl, setContentUrl] = useState('')
  const [uploadingContent, setUploadingContent] = useState(false)

  // Cover image
  const [coverInputUrl, setCoverInputUrl] = useState('')
  const [coverFileUrl, setCoverFileUrl] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)

  const coverUrl = coverFileUrl || coverInputUrl

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const { data, error: uploadError } = await supabase.storage
      .from('trainings')
      .upload(fileName, file, { upsert: false })

    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('trainings')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleContentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingContent(true)
    setError('')
    const url = await uploadFile(file, 'content')
    if (url) setContentUrl(url)
    setUploadingContent(false)
  }

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setError('')
    const url = await uploadFile(file, 'covers')
    if (url) setCoverFileUrl(url)
    setUploadingCover(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!contentUrl.trim()) {
      setError('Insira a URL ou faça o upload do arquivo de conteúdo.')
      return
    }
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('url', contentUrl.trim())
    formData.set('cover_url', coverUrl.trim())

    const result = await addContent(formData)
    setLoading(false)
    if (result.success) {
      onClose()
    } else {
      setError(result.error || 'Erro ao adicionar conteúdo')
    }
  }

  const contentLabel = type === 'video' ? 'Vídeo' : type === 'pdf' ? 'PDF' : 'URL do Link'
  const contentPlaceholder = type === 'video'
    ? 'https://youtube.com/watch?v=... ou link direto do vídeo'
    : type === 'pdf'
    ? 'https://exemplo.com/arquivo.pdf'
    : 'https://site.com/pagina'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Adicionar Treinamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Título */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Título do Treinamento</label>
            <input
              name="title"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none"
              placeholder="Ex: Integração Go&Grow"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <select
              name="type"
              required
              value={type}
              onChange={(e) => { setType(e.target.value); setContentUrl(''); setContentMode('url') }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none bg-white"
            >
              <option value="video">Vídeo</option>
              <option value="pdf">PDF</option>
              <option value="link">Link Externo</option>
            </select>
          </div>

          {/* Conteúdo: URL ou Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{contentLabel}</label>
              {type !== 'link' && (
                <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => { setContentMode('url'); setContentUrl('') }}
                    className={`px-3 py-1 flex items-center gap-1 transition-colors ${contentMode === 'url' ? 'bg-gogrow-red text-white' : 'hover:bg-gray-50'}`}
                  >
                    <Link size={11} /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setContentMode('file'); setContentUrl('') }}
                    className={`px-3 py-1 flex items-center gap-1 transition-colors ${contentMode === 'file' ? 'bg-gogrow-red text-white' : 'hover:bg-gray-50'}`}
                  >
                    <Upload size={11} /> Upload
                  </button>
                </div>
              )}
            </div>

            {contentMode === 'url' || type === 'link' ? (
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none"
                placeholder={contentPlaceholder}
              />
            ) : (
              <div className="border-2 border-dashed rounded-lg p-5 text-center">
                {uploadingContent ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin" size={28} />
                    <p className="text-sm">Enviando arquivo...</p>
                  </div>
                ) : contentUrl ? (
                  <div className="flex flex-col items-center gap-2 text-green-600">
                    <p className="text-sm font-semibold">✓ Arquivo enviado com sucesso</p>
                    <button
                      type="button"
                      onClick={() => setContentUrl('')}
                      className="text-xs text-gray-400 underline hover:text-red-500"
                    >
                      Trocar arquivo
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-gogrow-red transition-colors">
                    <Upload size={28} />
                    <p className="text-sm font-medium">
                      Clique para selecionar {type === 'pdf' ? 'um PDF' : 'um vídeo'}
                    </p>
                    <p className="text-xs">{type === 'pdf' ? 'PDF até 50 MB' : 'MP4, MOV até 500 MB'}</p>
                    <input
                      type="file"
                      accept={type === 'pdf' ? '.pdf,application/pdf' : 'video/*'}
                      onChange={handleContentFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon size={14} />
              Imagem de Capa <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverInputUrl}
                onChange={(e) => { setCoverInputUrl(e.target.value); setCoverFileUrl('') }}
                placeholder="Cole a URL de uma imagem..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-gogrow-red outline-none"
              />
              <label className={`px-3 py-2 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-1.5 whitespace-nowrap transition-colors ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {uploadingCover ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileChange}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>
            </div>
            {coverUrl && (
              <div className="relative mt-1">
                <img
                  src={coverUrl}
                  alt="Pré-visualização da capa"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={() => { setCoverInputUrl(''); setCoverFileUrl('') }}
                />
                <button
                  type="button"
                  onClick={() => { setCoverInputUrl(''); setCoverFileUrl('') }}
                  className="absolute top-1.5 right-1.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none resize-none text-sm"
              placeholder="Breve descrição sobre o conteúdo deste treinamento..."
            />
          </div>

          {/* Duração + Prazo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Duração <span className="text-gray-400 font-normal">(min)</span>
              </label>
              <input
                name="duration_minutes"
                type="number"
                min={1}
                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none"
                placeholder="Ex: 30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Prazo <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                name="due_date"
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none"
              />
            </div>
          </div>

          {/* Setor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Setor</label>
            <select
              name="sector_id"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-gogrow-red focus:border-gogrow-red outline-none bg-white"
            >
              <option value="global">Todos os Setores (Global)</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

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
              disabled={loading || uploadingContent || uploadingCover}
              className="px-6 py-2 bg-gogrow-red text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Salvando...' : 'Salvar Conteúdo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
