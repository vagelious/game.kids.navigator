import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-blue-300">
      <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-md">
        Kids Navigator
      </h1>
      <p className="text-xl text-white mb-12 max-w-lg text-center">
        Create your character and go on an adventure!
      </p>
      
      <div className="flex flex-col gap-6 items-center">
        <Link 
          href="/create-profile"
          className="px-8 py-4 bg-yellow-400 rounded-full text-2xl font-bold text-yellow-900 hover:scale-105 transition-transform shadow-lg"
        >
          Start Adventure!
        </Link>

        <Link 
          href="/settings"
          className="px-6 py-2 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-colors"
        >
          ⚙️ Settings
        </Link>
      </div>
    </main>
  );
}
