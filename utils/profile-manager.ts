import { DEFAULT_KID_AVATAR } from '@/app/game/player-assets'

export type PlayerProfile = {
  id: string
  name: string
  avatarUrl: string
  createdAt: number
}

const PROFILES_KEY = 'kids-game-profiles'
const CURRENT_PLAYER_KEY = 'kids-game-player'

export const ProfileManager = {
  getProfiles: (): PlayerProfile[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(PROFILES_KEY)
    return stored ? JSON.parse(stored) : []
  },

  addProfile: (profile: Omit<PlayerProfile, 'id' | 'createdAt'>): PlayerProfile => {
    const profiles = ProfileManager.getProfiles()
    const newProfile: PlayerProfile = {
      ...profile,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }
    const updated = [...profiles, newProfile]
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated))
    return newProfile
  },

  deleteProfile: (id: string) => {
    const profiles = ProfileManager.getProfiles()
    const updated = profiles.filter(p => p.id !== id)
    localStorage.setItem(PROFILES_KEY, JSON.stringify(updated))
  },

  setCurrentPlayer: (profile: PlayerProfile) => {
    localStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(profile))
  },

  getCurrentPlayer: (): PlayerProfile | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(CURRENT_PLAYER_KEY)
    return stored ? JSON.parse(stored) : null
  }
}

