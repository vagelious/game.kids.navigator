'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ProfileManager } from '@/utils/profile-manager'
import { DEFAULT_KID_AVATAR } from '@/app/game/player-assets'

const FRIENDLY_NAMES = [
  'Super Star', 'Rainbow Dash', 'Captain Cool', 'Wonder Kid', 
  'Speedy Sam', 'Magic Mike', 'Happy Hannah', 'Lucky Leo',
  'Brave Bella', 'Sunny Sky', 'Rocket Ron', 'Dancing Daisy'
]

export default function ProfileForm() {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const randomName = FRIENDLY_NAMES[Math.floor(Math.random() * FRIENDLY_NAMES.length)]
    setName(randomName)
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null)
      setPreviewUrl(null)
      return
    }
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let avatarUrl = ''

      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `${Math.random()}.${fileExt}`
          const filePath = `${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
            
          avatarUrl = publicUrl
        } catch (uploadErr) {
          console.warn('Supabase upload failed, falling back to local storage:', uploadErr)
          avatarUrl = await fileToBase64(file)
        }
      }

      const profile = ProfileManager.addProfile({
        name,
        avatarUrl: avatarUrl || DEFAULT_KID_AVATAR
      })
      
      ProfileManager.setCurrentPlayer(profile)
      router.push('/game')
      
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Error creating profile! Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label htmlFor="name" className="block text-2xl font-bold text-slate-700 mb-3">
          What is your name?
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl border-4 border-sky-200 focus:border-sky-400 outline-none text-2xl text-slate-700 placeholder-slate-300 transition-colors"
          placeholder="Type your name..."
          required
        />
      </div>

      <div>
        <label className="block text-2xl font-bold text-slate-700 mb-3">
          Pick your photo!
        </label>
        <div className="flex items-center gap-6 p-6 bg-sky-50 rounded-[2rem] border-2 border-sky-100">
          <div className="relative w-28 h-28 bg-white rounded-full overflow-hidden border-4 border-sky-200 flex items-center justify-center shadow-sm shrink-0">
            {previewUrl ? (
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                className="object-cover"
              />
            ) : (
              <span className="text-4xl text-sky-200">📷</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-lg file:font-bold
                file:bg-sky-500 file:text-white
                hover:file:bg-sky-600 cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !name}
        className="btn-3d w-full py-5 px-6 rounded-2xl text-2xl font-bold text-white bg-emerald-500 border-b-8 border-emerald-700 hover:brightness-110 active:border-b-0 active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Creating...' : 'Let\'s Play! 🚀'}
      </button>
    </form>
  )
}
