'use client'

import { useState, useRef } from 'react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ original: string; processed: string } | null>(null)
  const [error, setError] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      alert('请上传 JPG 或 PNG 格式的图片')
      return
    }

    setSelectedFile(file)
    setIsLoading(true)
    setError(false)
    setResult(null)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('处理失败')
      }

      const blob = await response.blob()
      const processedUrl = URL.createObjectURL(blob)
      const originalUrl = URL.createObjectURL(file)

      setResult({
        original: originalUrl,
        processed: processedUrl,
      })
    } catch (err) {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement('a')
    link.href = result.processed
    link.download = 'removed-bg.png'
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🖼️ 背景移除工具
          </h1>
          <p className="text-slate-400">上传图片，自动移除背景</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        {/* Upload Area */}
        <div 
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`bg-slate-800/50 backdrop-blur rounded-2xl border-2 border-dashed border-slate-600 p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-slate-700/30 transition-all ${isLoading || result ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="text-6xl mb-4">📤</div>
          <p className="text-slate-300 text-lg mb-2">
            点击或拖拽图片到这里上传
          </p>
          <p className="text-slate-500 text-sm">
            支持 JPG, PNG 格式
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-8 text-center mt-8">
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <p className="text-slate-300 text-lg">处理中...</p>
            <p className="text-slate-500 text-sm">正在移除背景，请稍候</p>
          </div>
        )}

        {/* Result Area */}
        {result && (
          <div className="mt-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Original Image */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-4">
                <h3 className="text-slate-400 text-sm mb-4 text-center">原图</h3>
                <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                  <img src={result.original} className="max-w-full max-h-[280px] object-contain" />
                </div>
              </div>

              {/* Result Image */}
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-4">
                <h3 className="text-slate-400 text-sm mb-4 text-center">结果</h3>
                <div className="bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=400&fit=crop')] bg-cover rounded-xl p-4 flex items-center justify-center min-h-[300px]">
                  <img src={result.processed} className="max-w-full max-h-[280px] object-contain" />
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all inline-flex items-center gap-2"
              >
                <span>⬇️</span>
                下载图片
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 backdrop-blur rounded-2xl border border-red-800 p-4 text-center mt-8">
            <p className="text-red-400">❌ 处理失败，请重试</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-sm">
        <p>Powered by Remove.bg API</p>
      </footer>
    </div>
  )
}