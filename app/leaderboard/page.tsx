'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LeaderboardManager, type HighScore } from '@/utils/leaderboard-manager'

export default function LeaderboardPage() {
  const [scores, setScores] = useState<HighScore[]>([])

  useEffect(() => {
    setScores(LeaderboardManager.getScores())
  }, [])

  return (
    <main className="min-h-screen p-8 flex flex-col items-center bg-sky-50">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-xl mb-12 w-full max-w-3xl border-b-8 border-blue-200">
        <h1 className="text-5xl font-bold text-sky-600 text-center mb-2">
          🏆 Hall of Fame 🏆
        </h1>
        <p className="text-xl text-slate-500 text-center">Top 10 Adventurers</p>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-lg overflow-hidden border-4 border-slate-100">
        {scores.length === 0 ? (
          <div className="p-12 text-center text-2xl text-slate-400 font-bold">
            No scores yet! Be the first to play! 🚀
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b-4 border-slate-100">
              <tr>
                <th className="p-6 text-left text-xl font-bold text-slate-600">Rank</th>
                <th className="p-6 text-left text-xl font-bold text-slate-600">Player</th>
                <th className="p-6 text-left text-xl font-bold text-slate-600">Level</th>
                <th className="p-6 text-right text-xl font-bold text-slate-600">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => (
                <tr key={score.id} className="border-b border-slate-50 hover:bg-yellow-50 transition-colors">
                  <td className="p-6 text-2xl font-bold text-slate-400">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                  <td className="p-6 text-xl font-bold text-slate-700">{score.playerName}</td>
                  <td className="p-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                      score.difficulty === 'easy' ? 'bg-green-100 text-green-600' :
                      score.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {score.difficulty}
                    </span>
                  </td>
                  <td className="p-6 text-right text-2xl font-bold text-amber-500 font-mono">
                    {score.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-12">
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

