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
    <main className="min-h-screen bg-green-200 p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-green-800 mb-8 drop-shadow-sm">
        Who is playing?
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* New Profile Button */}
        <Link 
          href="/create-profile"
          className="bg-white/50 border-4 border-dashed border-green-400 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-white/80 transition-colors cursor-pointer min-h-[250px]"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl text-green-600">
            ➕
          </div>
          <span className="text-2xl font-bold text-green-800">New Player</span>
        </Link>

        {/* Existing Profiles */}
        {profiles.map(profile => (
          <div 
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-4 shadow-lg hover:scale-105 transition-transform cursor-pointer relative min-h-[250px] border-4 border-transparent hover:border-green-400 group"
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-100 shadow-inner">
              <Image 
                src={profile.avatarUrl} 
                alt={profile.name} 
                fill 
                className="object-cover"
              />
            </div>
            <span className="text-2xl font-bold text-gray-800">{profile.name}</span>
            
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeleteProfile(e, profile.id)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2"
              title="Delete Profile"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link 
            href="/"
            className="px-8 py-3 bg-gray-500 text-white rounded-full font-bold hover:bg-gray-600 transition-colors"
        >
            Back Home
        </Link>
      </div>
    </main>
  )
}

