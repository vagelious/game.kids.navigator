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
    // Load existing settings
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
      
      // Try Supabase upload first
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `settings-${type}-${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars') // Reusing avatars bucket for simplicity
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
    <main className="min-h-screen bg-purple-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-xl border-4 border-purple-400">
        <h1 className="text-3xl font-bold text-purple-800 mb-8 text-center">Game Settings ⚙️</h1>
        
        <div className="space-y-10">
          {/* Start Point Section */}
          <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-4">📍 Start Point</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-1">Name</label>
                <input
                  type="text"
                  value={settings.startName}
                  onChange={e => setSettings(s => ({ ...s, startName: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-blue-700 mb-2">Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center overflow-hidden relative">
                    {settings.startImage ? (
                      <Image src={settings.startImage} alt="Start" fill className="object-cover" />
                    ) : (
                      <span className="text-2xl">🏠</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'start')}
                    disabled={loading}
                    className="text-sm text-blue-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Finish Point Section */}
          <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">🏁 Finish Point</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-1">Name</label>
                <input
                  type="text"
                  value={settings.finishName}
                  onChange={e => setSettings(s => ({ ...s, finishName: e.target.value }))}
                  className="w-full p-3 rounded-lg border-2 border-yellow-200 focus:border-yellow-500 outline-none text-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-yellow-700 mb-2">Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-lg border-2 border-dashed border-yellow-300 flex items-center justify-center overflow-hidden relative">
                    {settings.finishImage ? (
                      <Image src={settings.finishImage} alt="Finish" fill className="object-cover" />
                    ) : (
                      <span className="text-2xl">🏫</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'finish')}
                    disabled={loading}
                    className="text-sm text-yellow-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/" className="flex-1 py-4 bg-gray-400 text-white text-center rounded-xl font-bold text-lg hover:bg-gray-500">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg disabled:opacity-50"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

