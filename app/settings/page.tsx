'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export type GameSettings = {
  startName: string
  startImage: string | null
  finishName: string
  finishImage: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  
  const [settings, setSettings] = useState<GameSettings>({
    startName: 'Home',
    startImage: null,
    finishName: 'School',
    finishImage: null
  })

  useEffect(() => {
    const saved = localStorage.getItem('kids-game-settings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageUpload = async (file: File, type: 'start' | 'finish') => {
    try {
      setLoading(true)
      let imageUrl = ''
      
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `settings-${type}-${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
          
        imageUrl = publicUrl
      } catch (err) {
        console.warn('Supabase upload failed, falling back to local:', err)
        imageUrl = await fileToBase64(file)
      }

      setSettings(prev => ({
        ...prev,
        [type === 'start' ? 'startImage' : 'finishImage']: imageUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Could not upload image')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    localStorage.setItem('kids-game-settings', JSON.stringify(settings))
    alert('Settings Saved! 🎉')
    router.push('/')
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full bg-white p-10 rounded-[3rem] shadow-2xl border-b-8 border-slate-200">
        <h1 className="text-4xl font-bold text-slate-700 mb-10 text-center">Game Settings ⚙️</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Start Point Section */}
          <div className="bg-blue-50 p-6 rounded-[2rem] border-4 border-blue-100">
            <h2 className="text-2xl font-bold text-blue-500 mb-6 flex items-center gap-2">
              <span>📍</span> Start Point
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={settings.startName}
                  onChange={e => setSettings(s => ({ ...s, startName: e.target.value }))}
                  className="w-full p-4 rounded-xl border-2 border-blue-200 focus:border-blue-400 outline-none text-lg font-bold text-slate-700 placeholder-blue-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden relative shrink-0">
                    {settings.startImage ? (
                      <Image src={settings.startImage} alt="Start" fill className="object-cover" />
                    ) : (
                      <span className="text-4xl">🏠</span>
                    )}
                  </div>
                  <label className="btn-bouncy px-4 py-2 bg-blue-500 text-white rounded-xl font-bold text-sm cursor-pointer hover:bg-blue-600">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'start')}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Finish Point Section */}
          <div className="bg-yellow-50 p-6 rounded-[2rem] border-4 border-yellow-100">
            <h2 className="text-2xl font-bold text-yellow-500 mb-6 flex items-center gap-2">
              <span>🏁</span> Finish Point
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={settings.finishName}
                  onChange={e => setSettings(s => ({ ...s, finishName: e.target.value }))}
                  className="w-full p-4 rounded-xl border-2 border-yellow-200 focus:border-yellow-400 outline-none text-lg font-bold text-slate-700 placeholder-yellow-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-400 mb-2 uppercase tracking-wide">Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-dashed border-yellow-300 flex items-center justify-center overflow-hidden relative shrink-0">
                    {settings.finishImage ? (
                      <Image src={settings.finishImage} alt="Finish" fill className="object-cover" />
                    ) : (
                      <span className="text-4xl">🏫</span>
                    )}
                  </div>
                  <label className="btn-bouncy px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl font-bold text-sm cursor-pointer hover:bg-yellow-500">
                    Change
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'finish')}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/" className="btn-bouncy flex-1 py-4 bg-slate-200 text-slate-500 text-center rounded-2xl font-bold text-xl hover:bg-slate-300">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-3d flex-1 py-4 bg-violet-500 text-white rounded-2xl font-bold text-xl hover:bg-violet-600 border-b-8 border-violet-700 active:border-b-0 active:translate-y-2 disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
      </div>
    </main>
  )
}
