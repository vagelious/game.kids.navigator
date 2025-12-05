'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ProfileManager, type PlayerProfile } from '@/utils/profile-manager'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([])
  const router = useRouter()

  useEffect(() => {
    setProfiles(ProfileManager.getProfiles())
  }, [])

  const handleSelectProfile = (profile: PlayerProfile) => {
    ProfileManager.setCurrentPlayer(profile)
    router.push('/game')
  }

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent selecting the profile
    if (confirm('Are you sure you want to delete this player?')) {
      ProfileManager.deleteProfile(id)
      setProfiles(ProfileManager.getProfiles())
    }
  }

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="bg-white/60 backdrop-blur-md p-8 rounded-[3rem] shadow-xl mb-12">
        <h1 className="text-5xl font-bold text-sky-600 text-center">
          Who is playing? 🤔
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
        {/* New Profile Button */}
        <Link 
          href="/create-profile"
          className="btn-bouncy bg-white/50 border-4 border-dashed border-sky-300 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-sky-400 transition-all cursor-pointer min-h-[280px] group"
        >
          <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center text-5xl text-sky-500 group-hover:scale-110 transition-transform">
            ➕
          </div>
          <span className="text-2xl font-bold text-sky-700">New Player</span>
        </Link>

        {/* Existing Profiles */}
        {profiles.map(profile => (
          <div 
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="btn-3d bg-white rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 border-b-8 border-slate-200 hover:border-sky-400 cursor-pointer relative min-h-[280px] group transition-all hover:-translate-y-2"
          >
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-sky-100 shadow-lg group-hover:scale-105 transition-transform">
              <Image 
                src={profile.avatarUrl} 
                alt={profile.name} 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-3xl font-bold text-slate-700">{profile.name}</span>
            
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteProfile(e, profile.id)}
              className="absolute top-4 right-4 bg-rose-100 text-rose-500 rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white shadow-sm"
              title="Delete Profile"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <Link 
            href="/"
            className="btn-bouncy px-10 py-4 bg-slate-200 text-slate-600 rounded-full font-bold text-xl hover:bg-slate-300 transition-colors shadow-md"
        >
            ⬅️ Back Home
        </Link>
      </div>
    </main>
  )
}
