'use client'

import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { useProgress } from '@/hooks/useProgress'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PdfViewer({ contentId, url }: { contentId: string, url: string }) {
  const { position, completed, loading, saveProgress } = useProgress(contentId)
  const [numPages, setNumPages] = useState<number>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [docLoading, setDocLoading] = useState(true)

  // Sync initial page
  useEffect(() => {
    if (!loading && position > 0 && pageNumber === 1) {
      setPageNumber(Math.max(1, Math.floor(position)))
    }
  }, [loading, position])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setDocLoading(false)
    if (pageNumber === numPages && !completed) {
      saveProgress(pageNumber, true)
    }
  }

  const changePage = useCallback((offset: number) => {
    setPageNumber(prevPageNumber => {
      const next = prevPageNumber + offset
      if (numPages && next >= numPages && !completed) {
        saveProgress(next, true)
      } else {
        saveProgress(next, false)
      }
      return next
    })
  }, [numPages, completed, saveProgress])

  if (loading) return <div>Carregando progresso...</div>

  return (
    <div className="w-full flex-1 flex flex-col items-center bg-white rounded-xl border p-4 shadow-sm relative">
      
      {completed && (
        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 flex items-center gap-2 rounded-full font-medium shadow-lg animate-pulse">
          <CheckCircle2 size={16} />
          <span>Concluído</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4 bg-gogrow-gray-light py-2 px-6 rounded-full border shadow-sm">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1 || docLoading}
          className="p-2 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft />
        </button>
        <p className="text-sm font-medium text-gogrow-black min-w-[100px] text-center">
          Página {pageNumber || (numPages ? 1 : '--')} de {numPages || '--'}
        </p>
        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= (numPages || 1) || docLoading}
          className="p-2 rounded-full hover:bg-black/5 disabled:opacity-30 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="flex-1 w-full max-w-5xl overflow-auto border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center relative min-h-[600px]">
        
        {docLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3 z-0">
            <Loader2 className="animate-spin" size={32} />
            <p>Carregando documento PDF...</p>
          </div>
        )}

        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex justify-center z-10 w-full"
          loading={null}
        >
          <Page 
            pageNumber={pageNumber} 
            renderTextLayer={true} 
            renderAnnotationLayer={true}
            className="shadow-xl"
            width={800}
          />
        </Document>
      </div>
    </div>
  )
}
