'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { DEFAULT_KID_AVATAR } from '@/app/game/player-assets'

export default function ProfileForm() {
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
          // Try Supabase upload first
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
          // Fallback to Base64 if upload fails (e.g. RLS permissions)
          avatarUrl = await fileToBase64(file)
        }
      }

      // Store player info in localStorage
      const playerData = {
        name,
        avatarUrl: avatarUrl || DEFAULT_KID_AVATAR, 
      }
      
      localStorage.setItem('kids-game-player', JSON.stringify(playerData))
      router.push('/game')
      
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('Error creating profile! Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-lg font-medium text-gray-700 mb-2">
          What is your name?
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:ring-green-500 text-lg text-gray-900"
          placeholder="Type your name..."
          required
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Pick your photo!
        </label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center">
            {previewUrl ? (
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                className="object-cover"
              />
            ) : (
              <span className="text-2xl text-gray-400">📷</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !name}
        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-xl font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Let\'s Play!'}
      </button>
    </form>
  )
}

