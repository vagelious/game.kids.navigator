'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { OBSTACLE_ASSETS, OBSTACLE_TYPES, type ObstacleType } from './obstacle-assets'

type Point = { x: number; y: number }
type Player = Point & { width: number; height: number; speed: number }
type Obstacle = Point & { width: number; height: number; type: ObstacleType }

export default function GameCanvas() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start')
  
  // Game constants
  const PLAYER_SIZE = 60
  const OBSTACLE_COUNT = 5
  
  // State refs for game loop to access latest values without re-renders
  const playerRef = useRef<Player>({ x: 50, y: 300, width: PLAYER_SIZE, height: PLAYER_SIZE, speed: 5 })
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const obstaclesRef = useRef<Obstacle[]>([])
  const playerImageRef = useRef<HTMLImageElement | null>(null)
  const obstacleImagesRef = useRef<Record<ObstacleType, HTMLImageElement | null>>({
    banana: null,
    rock: null,
    puddle: null,
    cone: null
  })
  const animationFrameRef = useRef<number>(0)

  const [gameConfig, setGameConfig] = useState({
    startName: 'Home',
    startImage: null as string | null,
    finishName: 'School',
    finishImage: null as string | null
  })

  const startImageRef = useRef<HTMLImageElement | null>(null)
  const finishImageRef = useRef<HTMLImageElement | null>(null)

  // Initialize game
  useEffect(() => {
    // Load player image
    const storedData = localStorage.getItem('kids-game-player')
    if (storedData) {
      const { avatarUrl } = JSON.parse(storedData)
      const img = new Image()
      img.src = avatarUrl
      img.onload = () => {
        playerImageRef.current = img
      }
    }

    // Load game settings
    const storedSettings = localStorage.getItem('kids-game-settings')
    if (storedSettings) {
      const settings = JSON.parse(storedSettings)
      setGameConfig(settings)

      if (settings.startImage) {
        const img = new Image()
        img.src = settings.startImage
        img.onload = () => { startImageRef.current = img }
      }
      if (settings.finishImage) {
        const img = new Image()
        img.src = settings.finishImage
        img.onload = () => { finishImageRef.current = img }
      }
    }

    // Load obstacle images
    OBSTACLE_TYPES.forEach(type => {
      const img = new Image()
      img.src = OBSTACLE_ASSETS[type]
      img.onload = () => {
        obstacleImagesRef.current[type] = img
      }
    })

    const handleKeyDown = (e: KeyboardEvent) => { 
        keysRef.current[e.key] = true 
        if (e.key === 'Escape') {
            router.push('/')
        }
    }
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [router])

  // Start Game
  const startGame = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    
    // Reset player
    playerRef.current = { x: 50, y: canvas.height / 2, width: PLAYER_SIZE, height: PLAYER_SIZE, speed: 4 }
    
    // Generate obstacles
    const obstacles: Obstacle[] = []
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
      obstacles.push({
        x: 200 + Math.random() * (canvas.width - 400), // Keep away from start/end
        y: Math.random() * (canvas.height - 100),
        width: 60,
        height: 60,
        type
      })
    }
    obstaclesRef.current = obstacles
    
    setGameState('playing')
    gameLoop()
  }

  const gameLoop = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Update Logic
    const player = playerRef.current
    const keys = keysRef.current

    if (keys['ArrowUp']) player.y -= player.speed
    if (keys['ArrowDown']) player.y += player.speed
    if (keys['ArrowLeft']) player.x -= player.speed
    if (keys['ArrowRight']) player.x += player.speed

    // Boundaries
    if (player.x < 0) player.x = 0
    if (player.y < 0) player.y = 0
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height
    
    // Win Condition (Reached right side)
    if (player.x + player.width > canvas.width - 50) {
      setGameState('won')
      return
    }

    // Collision Detection
    for (const obs of obstaclesRef.current) {
      if (
        player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y
      ) {
        // Collision! Reset to start for now (or game over)
        // Let's just push them back to start for "kids mode" (no hard fail)
        player.x = 50
        player.y = canvas.height / 2
        // Or setGameState('lost') if we want to be strict
      }
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw Background (Grass)
    ctx.fillStyle = '#86efac' // green-300
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw Start Zone
    ctx.fillStyle = '#60a5fa' // blue-400
    ctx.fillRect(0, 0, 100, canvas.height)
    if (startImageRef.current) {
        ctx.drawImage(startImageRef.current, 10, 80, 80, 80)
    }
    ctx.fillStyle = '#fff'
    ctx.font = '20px sans-serif'
    ctx.fillText(gameConfig.startName.toUpperCase(), 10, 50)

    // Draw End Zone
    ctx.fillStyle = '#facc15' // yellow-400
    ctx.fillRect(canvas.width - 100, 0, 100, canvas.height)
    if (finishImageRef.current) {
        ctx.drawImage(finishImageRef.current, canvas.width - 90, 80, 80, 80)
    }
    ctx.fillStyle = '#fff'
    ctx.fillText(gameConfig.finishName.toUpperCase(), canvas.width - 95, 50)

    // Draw Obstacles
    for (const obs of obstaclesRef.current) {
      const img = obstacleImagesRef.current[obs.type]
      if (img) {
        ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height)
      } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      }
    }

    // Draw Player
    if (playerImageRef.current) {
      ctx.save()
      // Clip to circle
      ctx.beginPath()
      ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(playerImageRef.current, player.x, player.y, player.width, player.height)
      ctx.restore()
    } else {
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(player.x, player.y, player.width, player.height)
    }
    
    // Draw Player Border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2)
    ctx.stroke()

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    if (gameState === 'playing') {
        // Resize canvas to window
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth
            canvasRef.current.height = window.innerHeight
        }
        startGame()
    }
  }, [gameState])

  return (
    <>
      {gameState === 'start' && (
        <div className="absolute z-10 text-center bg-white/90 p-12 rounded-3xl shadow-2xl max-w-lg">
          <h2 className="text-4xl font-bold text-blue-600 mb-4">Ready for {gameConfig.finishName}?</h2>
          <p className="text-xl mb-8">Use the arrow keys ⬅️ ⬆️ ⬇️ ➡️ to move!</p>
          <div className="flex gap-4 justify-center flex-col">
            <button 
                onClick={() => setGameState('playing')}
                className="px-8 py-4 bg-green-500 text-white rounded-full text-2xl font-bold hover:bg-green-600 shadow-lg transition-transform hover:scale-110"
            >
                Start!
            </button>
            <Link href="/" className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700">
                Exit
            </Link>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="absolute z-10 text-center bg-white/90 p-12 rounded-3xl shadow-2xl">
          <h2 className="text-5xl font-bold text-yellow-500 mb-4">You Made It! 🎉</h2>
          <p className="text-xl mb-8">Great job getting to {gameConfig.finishName} safely!</p>
          <div className="flex gap-4 justify-center">
            <button 
                onClick={() => setGameState('playing')}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-bold"
            >
                Play Again
            </button>
            <Link href="/" className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold">
                Back Home
            </Link>
          </div>
        </div>
      )}

      {/* Exit Button Overlay for Playing State */}
      {gameState === 'playing' && (
        <div className="absolute top-4 right-4 z-10">
          <Link 
            href="/"
            className="px-4 py-2 bg-red-500 text-white rounded-full font-bold shadow-md hover:bg-red-600 flex items-center gap-2"
          >
            <span>✖</span> Exit
          </Link>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className="block bg-green-200 touch-none"
      />
    </>
  )
}
