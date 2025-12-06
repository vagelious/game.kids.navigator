'use client'

import { useEffect, useState } from 'react'
import Link from "next/link";
import { ProfileManager } from "@/utils/profile-manager";

export default function Home() {
  const [hasProfiles, setHasProfiles] = useState(false)

  useEffect(() => {
    const profiles = ProfileManager.getProfiles()
    setHasProfiles(profiles.length > 0)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Title Card */}
      <div className="bg-white/80 backdrop-blur-sm p-12 rounded-[3rem] shadow-2xl border-b-8 border-blue-200 max-w-2xl w-full text-center mb-12">
        <h1 className="text-6xl md:text-7xl font-bold text-sky-500 mb-4 drop-shadow-sm tracking-tight">
          Kids Navigator
        </h1>
        <p className="text-2xl text-slate-500 font-medium">
          Ready for an adventure? 🗺️
        </p>
      </div>
      
      <div className="flex flex-col gap-6 items-center w-full max-w-md">
        {hasProfiles ? (
          <Link 
            href="/profiles"
            className="btn-3d w-full text-center px-8 py-6 bg-emerald-400 border-b-8 border-emerald-600 rounded-3xl text-3xl font-bold text-white shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            Choose Player! 👤
          </Link>
        ) : (
          <Link 
            href="/create-profile"
            className="btn-3d w-full text-center px-8 py-6 bg-yellow-400 border-b-8 border-yellow-600 rounded-3xl text-3xl font-bold text-yellow-900 shadow-xl hover:brightness-110 active:border-b-0 active:translate-y-2"
          >
            Start Adventure! 🚀
          </Link>
        )}

        <div className="flex gap-4 w-full">
          <Link 
            href="/settings"
            className="btn-bouncy flex-1 px-4 py-3 bg-white text-slate-400 rounded-full font-bold hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm border-2 border-slate-100 text-center"
          >
            ⚙️ Settings
          </Link>
          <Link 
            href="/leaderboard"
            className="btn-bouncy flex-1 px-4 py-3 bg-white text-amber-500 rounded-full font-bold hover:bg-yellow-50 hover:text-amber-600 transition-colors shadow-sm border-2 border-slate-100 text-center"
          >
            🏆 Scores
          </Link>
        </div>
      </div>
    </main>
  );
}
