'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { OBSTACLE_ASSETS, OBSTACLE_TYPES, type ObstacleType } from './obstacle-assets'

type Point = { x: number; y: number }
type Player = Point & { width: number; height: number; speed: number }
type Obstacle = Point & { width: number; height: number; type: ObstacleType; vx?: number; vy?: number }

import { LeaderboardManager } from '@/utils/leaderboard-manager'

export default function GameCanvas() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won' | 'lost'>('start')
  
  // Game constants
  const PLAYER_SIZE = 60
  const OBSTACLE_COUNT = 15
  const WORLD_WIDTH = 3000 // Much wider world for scrolling!
  const HEADER_HEIGHT = 100 // Height of the top HUD/Header
  const FOOTER_HEIGHT = 20  // Small padding at bottom
  const SAFE_ZONE_TOP = HEADER_HEIGHT + 20
  const SAFE_ZONE_BOTTOM = FOOTER_HEIGHT + 20
  const SAFE_ZONE_LEFT = 220 // Start Zone Width + padding
  const SAFE_ZONE_RIGHT = 220 // End Zone Width + padding
  
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [playerName, setPlayerName] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  // Refs for mutable game state
  const playerRef = useRef<Player>({ x: 50, y: 300, width: PLAYER_SIZE, height: PLAYER_SIZE, speed: 5 })
  const scoreRef = useRef(0)
  const timeRef = useRef(0)
  const startTimeRef = useRef(0)
  const lastTimeRef = useRef(0)
  const cameraRef = useRef<{ x: number }>({ x: 0 })
  const shakeRef = useRef<number>(0)
  const hitDataRef = useRef<{ x: number; y: number; active: boolean; timer: number }>({ x: 0, y: 0, active: false, timer: 0 })
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const obstaclesRef = useRef<Obstacle[]>([])
  const playerImageRef = useRef<HTMLImageElement | null>(null)
  const obstacleImagesRef = useRef<Record<ObstacleType, HTMLImageElement | null>>({
    banana: null,
    rock: null,
    puddle: null,
    cone: null,
    log: null,
    cactus: null
  })
  const animationFrameRef = useRef<number>(0)

  const [gameConfig, setGameConfig] = useState({
    startName: 'Home',
    startImage: null as string | null,
    finishName: 'School',
    finishImage: null as string | null,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  })

  const startImageRef = useRef<HTMLImageElement | null>(null)
  const finishImageRef = useRef<HTMLImageElement | null>(null)

  // Initialize game
  useEffect(() => {
    // Load player image and name
    const storedData = localStorage.getItem('kids-game-player')
    if (storedData) {
      const { name, avatarUrl } = JSON.parse(storedData)
      setPlayerName(name)
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
    
    // Determine obstacle count based on difficulty
    let obstacleCount = 15 // Default/Medium
    if (gameConfig.difficulty === 'easy') obstacleCount = 8
    if (gameConfig.difficulty === 'hard') obstacleCount = 30

    // Generate obstacles
    const obstacles: Obstacle[] = []
    for (let i = 0; i < obstacleCount; i++) {
      const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
      // Vary sizes slightly
      const size = 50 + Math.random() * 40 // 50 to 90px
      
      // Moving obstacles for Hard Mode
      let vx = 0
      let vy = 0
      if (gameConfig.difficulty === 'hard' && Math.random() > 0.5) {
        vx = (Math.random() - 0.5) * 2 // Horizontal speed
        vy = (Math.random() - 0.5) * 2 // Vertical speed
      }

      // Calculate safe Y range
      const minY = SAFE_ZONE_TOP
      const maxY = canvas.height - SAFE_ZONE_BOTTOM - size

      obstacles.push({
        x: 400 + Math.random() * (WORLD_WIDTH - 800), // Spread across the whole world
        y: minY + Math.random() * (maxY - minY), // Within safe vertical bounds
        width: size,
        height: size,
        type,
        vx,
        vy
      })
    }
    obstaclesRef.current = obstacles
    
    // Reset Score and Time
    scoreRef.current = 0
    timeRef.current = 0
    startTimeRef.current = Date.now()
    lastTimeRef.current = Date.now()
    setScore(0)
    setTimeElapsed(0)
    setIsPaused(false)

    setGameState('playing')
    gameLoop()
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    if (!isPaused) {
      // Pausing
      cancelAnimationFrame(animationFrameRef.current)
    } else {
      // Resuming
      lastTimeRef.current = Date.now()
      gameLoop()
    }
  }

  const gameLoop = () => {
    if (!canvasRef.current) return
    if (isPaused) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Update Logic
    const player = playerRef.current
    const keys = keysRef.current
    const camera = cameraRef.current
    const hitData = hitDataRef.current

    let isMoving = false

    if (hitData.active) {
      hitData.timer--
      
      // Shake effect
      shakeRef.current = hitData.timer > 0 ? Math.sin(hitData.timer) * 10 : 0

      if (hitData.timer <= 0) {
        // Reset after hit
        player.x = 50
        player.y = canvas.height / 2
        camera.x = 0
        shakeRef.current = 0
        hitData.active = false
      }
    } else {
      if (keys['ArrowUp']) { player.y -= player.speed; isMoving = true }
      if (keys['ArrowDown']) { player.y += player.speed; isMoving = true }
      if (keys['ArrowLeft']) { player.x -= player.speed; isMoving = true }
      if (keys['ArrowRight']) { player.x += player.speed; isMoving = true }
    }

    // Boundaries (World Coordinates)
    if (player.x < 0) player.x = 0
    if (player.x + player.width > WORLD_WIDTH) player.x = WORLD_WIDTH - player.width
    
    // Vertical Boundaries (Respect Safe Zones)
    if (player.y < SAFE_ZONE_TOP) player.y = SAFE_ZONE_TOP
    if (player.y + player.height > canvas.height - SAFE_ZONE_BOTTOM) player.y = canvas.height - SAFE_ZONE_BOTTOM - player.height
    
    // Win Condition (Reached end of world)
    if (player.x + player.width > WORLD_WIDTH - 100) {
      setGameState('won')
      
      // Save High Score
      LeaderboardManager.addScore({
        playerName: playerName || 'Player',
        score: scoreRef.current,
        difficulty: gameConfig.difficulty,
        time: timeRef.current
      })
      
      return
    }

    // Time update
    const now = Date.now()
    const dt = (now - lastTimeRef.current) / 1000
    lastTimeRef.current = now
    
    if (!hitDataRef.current.active && isMoving) {
      timeRef.current += dt
      
      // Distance Score: Max 5000 points for full distance
      // Calculate progress based on WORLD_WIDTH
      const progress = Math.min(playerRef.current.x / (WORLD_WIDTH - 100), 1)
      const distanceScore = Math.floor(progress * 5000)
      
      // Time Bonus: 10 points per second survived
      const timeScore = Math.floor(timeRef.current * 10)
      
      scoreRef.current = distanceScore + timeScore
      
      // Update UI more frequently for smoothness (every 100ms approx)
      if (now % 10 < 2) {
        setScore(scoreRef.current)
      }
      
      if (Math.floor(timeRef.current) > timeElapsed) {
        setTimeElapsed(Math.floor(timeRef.current))
      }
    }

    // Update Camera
    if (!hitData.active) {
      // Camera follows player but stops at world bounds
      // Center the player on screen roughly
      let targetCamX = player.x - canvas.width / 3
      const maxCamX = Math.max(0, WORLD_WIDTH - canvas.width)
      
      if (targetCamX < 0) targetCamX = 0
      if (targetCamX > maxCamX) targetCamX = maxCamX
      
      // Smooth camera movement (lerp)
      camera.x += (targetCamX - camera.x) * 0.1
    }

    // Collision Detection & Obstacle Movement
    if (!hitData.active) {
      for (const obs of obstaclesRef.current) {
        // Move obstacles
        if (obs.vx || obs.vy) {
          obs.x += obs.vx || 0
          obs.y += obs.vy || 0
          
          // Bounce off walls (Respect Safe Zones)
          if (obs.y < SAFE_ZONE_TOP || obs.y + obs.height > canvas.height - SAFE_ZONE_BOTTOM) {
            obs.vy = -(obs.vy || 0)
            // Clamp position to prevent sticking
            if (obs.y < SAFE_ZONE_TOP) obs.y = SAFE_ZONE_TOP
            if (obs.y + obs.height > canvas.height - SAFE_ZONE_BOTTOM) obs.y = canvas.height - SAFE_ZONE_BOTTOM - obs.height
          }
          // Bounce off horizontal limits (local area patrol)
          // We can't easily check "local area" without storing initial pos, 
          // so let's just clamp to world bounds for now or let them roam
          if (obs.x < SAFE_ZONE_LEFT || obs.x + obs.width > WORLD_WIDTH - SAFE_ZONE_RIGHT) {
            obs.vx = -(obs.vx || 0)
            
            // Clamp position
            if (obs.x < SAFE_ZONE_LEFT) obs.x = SAFE_ZONE_LEFT
            if (obs.x + obs.width > WORLD_WIDTH - SAFE_ZONE_RIGHT) obs.x = WORLD_WIDTH - SAFE_ZONE_RIGHT - obs.width
          }
        }

        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          // Collision Trigger
          hitData.active = true
          hitData.timer = 45 // 0.75 seconds pause
          hitData.x = player.x
          hitData.y = player.y
          shakeRef.current = 10
        }
      }
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context to apply camera transform
    ctx.save()
    
    // Apply Camera + Shake
    const shakeX = (Math.random() - 0.5) * shakeRef.current
    const shakeY = (Math.random() - 0.5) * shakeRef.current
    ctx.translate(-camera.x + shakeX, shakeY) 

    // Draw Background (Grass) - Draw big rectangle for whole world
    ctx.fillStyle = '#86efac' // green-300
    ctx.fillRect(0, 0, WORLD_WIDTH, canvas.height)

    // Draw Start Zone
    ctx.fillStyle = '#60a5fa' // blue-400
    ctx.fillRect(0, 0, 200, canvas.height)
    if (startImageRef.current) {
        ctx.drawImage(startImageRef.current, 20, 160, 160, 160)
    }
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 30px sans-serif'
    ctx.fillText(gameConfig.startName.toUpperCase(), 20, 140)

    // Draw End Zone
    ctx.fillStyle = '#facc15' // yellow-400
    ctx.fillRect(WORLD_WIDTH - 200, 0, 200, canvas.height)
    if (finishImageRef.current) {
        ctx.drawImage(finishImageRef.current, WORLD_WIDTH - 180, 160, 160, 160)
    }
    ctx.fillStyle = '#fff'
    ctx.fillText(gameConfig.finishName.toUpperCase(), WORLD_WIDTH - 190, 140)

    // Draw Obstacles
    for (const obs of obstaclesRef.current) {
      const img = obstacleImagesRef.current[obs.type]
      if (img) {
        ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height)
      } else {
        // Fallback
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
      }
      
      // Visual Collision Border (Lightly Visible)
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
      ctx.lineWidth = 2
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height)
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
    
    // Draw Player Collision Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(player.x, player.y, player.width, player.height)
    
    // Draw Player Circle Border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width/2, 0, Math.PI * 2)
    ctx.stroke()

    // Draw Hit Effect
    if (hitData.active) {
      ctx.fillStyle = 'red'
      ctx.font = 'bold 40px sans-serif'
      ctx.fillText("OUCH!", hitData.x, hitData.y - 20)
    }

    // Restore context (undo camera translate for fixed UI elements if we had any inside canvas)
    ctx.restore() 

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
        // Initial resize
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
            <Link href="/leaderboard" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold">
                🏆 Leaderboard
            </Link>
            <Link href="/" className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold">
                Back Home
            </Link>
          </div>
        </div>
      )}

      {/* Top HUD Bar */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 w-full bg-white/90 backdrop-blur-md border-b-4 border-blue-200 p-2 md:p-4 flex flex-wrap justify-between items-center z-20 shadow-lg gap-2">
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase">Player</span>
              <span className="text-sm md:text-xl font-bold text-blue-600 truncate max-w-[80px] md:max-w-none">{playerName || 'Player'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-sm font-bold text-slate-400 uppercase">Level</span>
              <span className={`text-sm md:text-xl font-bold capitalize ${
                gameConfig.difficulty === 'easy' ? 'text-green-500' :
                gameConfig.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-500'
              }`}>
                {gameConfig.difficulty}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 order-last md:order-none w-full md:w-auto justify-center">
            <div className="text-center">
              <span className="block text-[10px] md:text-sm font-bold text-slate-400 uppercase">Time</span>
              <span className="text-lg md:text-2xl font-bold text-slate-700 font-mono">
                {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] md:text-sm font-bold text-slate-400 uppercase">Score</span>
              <span className="text-xl md:text-3xl font-bold text-amber-500 font-mono">{score}</span>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3">
            <button
              onClick={togglePause}
              className="px-2 md:px-4 py-1 md:py-2 bg-blue-100 text-blue-600 rounded-xl font-bold hover:bg-blue-200 transition-colors text-sm md:text-base"
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <Link 
              href="/"
              className="px-2 md:px-4 py-1 md:py-2 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-colors text-sm md:text-base"
            >
              Exit
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Controls (D-Pad) */}
      {gameState === 'playing' && !isPaused && (
        <div className="absolute bottom-6 left-6 z-40 grid grid-cols-3 gap-2 md:hidden opacity-80 touch-none select-none">
            {/* Row 1 */}
            <div /> 
            <button 
                className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/60 active:bg-blue-400/80 active:scale-95 transition-all flex items-center justify-center text-3xl shadow-lg touch-none select-none"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowUp'] = true }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowUp'] = false }}
                onMouseDown={() => keysRef.current['ArrowUp'] = true}
                onMouseUp={() => keysRef.current['ArrowUp'] = false}
                onMouseLeave={() => keysRef.current['ArrowUp'] = false}
            >⬆️</button>
            <div /> 

            {/* Row 2 */}
            <button 
                className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/60 active:bg-blue-400/80 active:scale-95 transition-all flex items-center justify-center text-3xl shadow-lg touch-none select-none"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = true }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowLeft'] = false }}
                onMouseDown={() => keysRef.current['ArrowLeft'] = true}
                onMouseUp={() => keysRef.current['ArrowLeft'] = false}
                onMouseLeave={() => keysRef.current['ArrowLeft'] = false}
            >⬅️</button>
            <button 
                className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/60 active:bg-blue-400/80 active:scale-95 transition-all flex items-center justify-center text-3xl shadow-lg touch-none select-none"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowDown'] = true }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowDown'] = false }}
                onMouseDown={() => keysRef.current['ArrowDown'] = true}
                onMouseUp={() => keysRef.current['ArrowDown'] = false}
                onMouseLeave={() => keysRef.current['ArrowDown'] = false}
            >⬇️</button>
            <button 
                className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-full border-2 border-white/60 active:bg-blue-400/80 active:scale-95 transition-all flex items-center justify-center text-3xl shadow-lg touch-none select-none"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = true }}
                onTouchEnd={(e) => { e.preventDefault(); keysRef.current['ArrowRight'] = false }}
                onMouseDown={() => keysRef.current['ArrowRight'] = true}
                onMouseUp={() => keysRef.current['ArrowRight'] = false}
                onMouseLeave={() => keysRef.current['ArrowRight'] = false}
            >➡️</button>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center">
            <h2 className="text-4xl font-bold text-blue-500 mb-4">Game Paused</h2>
            <button 
              onClick={togglePause}
              className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-transform"
            >
              Resume Adventure
            </button>
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        className="block bg-green-200 touch-none"
      />
    </>
  )
}
