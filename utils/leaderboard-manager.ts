'use client'

export type HighScore = {
  id: string
  playerName: string
  score: number
  difficulty: string
  time: number
  date: number
}

const LEADERBOARD_KEY = 'kids-game-leaderboard'

export const LeaderboardManager = {
  getScores: (): HighScore[] => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(LEADERBOARD_KEY)
    return stored ? JSON.parse(stored) : []
  },

  addScore: (score: Omit<HighScore, 'id' | 'date'>): HighScore => {
    const scores = LeaderboardManager.getScores()
    const newScore: HighScore = {
      ...score,
      id: crypto.randomUUID(),
      date: Date.now()
    }
    
    const updated = [...scores, newScore]
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 10) // Keep only top 10
      
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated))
    return newScore
  }
}

