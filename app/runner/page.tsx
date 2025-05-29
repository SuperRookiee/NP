'use client'
import {useCallback, useEffect, useRef, useState} from 'react'
import Matter from 'matter-js'
import {Button} from '@/components/ui/button'
import Retry from './retry'
import RegisterDialog from './registerDialog'
import Ranking from './ranking'

export default function InfiniteRunner() {
    const sceneRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Matter.Engine | null>(null)
    const runnerRef = useRef<Matter.Runner | null>(null)
    const jumpCountRef = useRef<number>(0)
    const scoreRef = useRef(0)
    const obstaclesRef = useRef<Matter.Body[]>([])
    const gameOverRef = useRef(false)
    const scoreIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const difficultyIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const spawnTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [retryKey, setRetryKey] = useState(0)
    const [difficulty, setDifficulty] = useState(1)
    const [isMobile, setIsMobile] = useState(false)
    const [ranking, setRanking] = useState<{ name: string, score: number }[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const [started, setStarted] = useState(false)
    const green = '#86efac'
    const yellow = '#facc15'
    const red = '#f97316'

    useEffect(() => {
        scoreRef.current = score
    }, [score])

    const clearIntervals = () => {
        if (scoreIntervalRef.current) clearInterval(scoreIntervalRef.current)
        if (difficultyIntervalRef.current) clearInterval(difficultyIntervalRef.current)
        if (spawnTimeoutRef.current) clearTimeout(spawnTimeoutRef.current)
    }

    const handleRetry = () => {
        clearIntervals()
        setScore(0)
        setGameOver(false)
        setRetryKey(prev => prev + 1)
        setDifficulty(1)
        setStarted(false)
        gameOverRef.current = false
        jumpCountRef.current = 0
        obstaclesRef.current = []

        const engine = engineRef.current
        const player = engine?.world.bodies.find(b => b.label === 'player')
        if (player) player.render.fillStyle = green
    }

    const handleJump = useCallback(() => {
        const engine = engineRef.current
        const runner = runnerRef.current
        const player = engine?.world.bodies.find(b => b.label === 'player')
        if (!player || gameOver) return

        if (!started) {
            setStarted(true)
            if (engine && runner) {
                Matter.Runner.run(runner, engine)
                spawnLoop()
                startIntervals()
            }
        }

        if (jumpCountRef.current < 2) {
            Matter.Body.setVelocity(player, {x: 0, y: -25})
            jumpCountRef.current++
            const remaining = 2 - jumpCountRef.current
            player.render.fillStyle = remaining === 2 ? green : remaining === 1 ? yellow : red
        }
    }, [gameOver, started])

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'Space') handleJump()
    }, [handleJump])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        if (window.innerWidth <= 500) setIsMobile(true)
    }, [])

    useEffect(() => {
        fetch('/api/runner')
            .then(res => res.json())
            .then(data => setRanking(data))
            .catch(err => console.error('Failed to load ranking', err))
    }, [retryKey])

    const spawnObstacle = () => {
        const engine = engineRef.current
        if (!engine) return

        const heightRandom = Math.floor(Math.random() * 150) + 50 + difficulty * 10
        const y = 600 - 20 - heightRandom / 2
        const obs = Matter.Bodies.rectangle(1000 + 50, y, 40, heightRandom, {
            isStatic: true,
            label: 'obstacle',
            render: {fillStyle: '#ef4444'},
        })
        obstaclesRef.current.push(obs)
        Matter.World.add(engine.world, obs)
    }

    const spawnLoop = () => {
        spawnObstacle()

        const level = Math.floor(difficulty / 10)
        const minDelay = Math.max(300, 800 - level * 100)
        const maxDelay = Math.max(minDelay + 200, 600)
        const delay = Math.random() * (maxDelay - minDelay) + minDelay
        spawnTimeoutRef.current = setTimeout(spawnLoop, delay)
    }

    const startIntervals = () => {
        scoreIntervalRef.current = setInterval(() => {
            if (!gameOverRef.current) setScore(prev => prev + difficulty)
        }, 300)

        difficultyIntervalRef.current = setInterval(() => {
            if (!gameOverRef.current) setDifficulty(prev => prev + 1)
        }, 5000)
    }

    useEffect(() => {
        const baseWidth = 1000
        const baseHeight = 600
        const engine = Matter.Engine.create({gravity: {y: 3}})
        const runner = Matter.Runner.create()
        const render = Matter.Render.create({
            engine,
            canvas: document.createElement('canvas'),
            options: {
                width: baseWidth,
                height: baseHeight,
                wireframes: false,
                background: '#0f172a',
            },
        })
        render.canvas.className = 'w-full h-auto block rounded-xl'
        sceneRef.current?.appendChild(render.canvas)

        engineRef.current = engine
        runnerRef.current = runner

        const world = engine.world
        const ground = Matter.Bodies.rectangle(baseWidth / 2, baseHeight - 10, baseWidth + 10, 20, {
            isStatic: true,
            label: 'ground',
            render: {fillStyle: '#334155'},
        })
        const player = Matter.Bodies.rectangle(100, baseHeight - 80, 40, 40, {
            label: 'player',
            render: {fillStyle: green},
        })
        Matter.World.add(world, [ground, player])

        const moveObstacles = () => {
            for (const obs of obstaclesRef.current) {
                Matter.Body.translate(obs, {x: -(10 + difficulty), y: 0})
                if (obs.position.x < -50) {
                    Matter.World.remove(engine.world, obs)
                }
            }
        }

        Matter.Events.on(engine, 'beforeUpdate', () => {
            moveObstacles()
            const player = engine.world.bodies.find(b => b.label === 'player')
            if (player && player.position.y > baseHeight - 20) {
                Matter.Body.setPosition(player, {
                    x: player.position.x,
                    y: baseHeight - 20
                })
                Matter.Body.setVelocity(player, {x: 0, y: 0})
            }
        })

        Matter.Events.on(engine, 'collisionStart', e => {
            if (gameOverRef.current) return

            for (const pair of e.pairs) {
                const labels = [pair.bodyA.label, pair.bodyB.label]
                if (labels.includes('player') && labels.includes('obstacle')) {
                    setDialogOpen(true)
                    setGameOver(true)
                    gameOverRef.current = true
                    Matter.Runner.stop(runner)
                    clearIntervals()
                }
                if (labels.includes('player') && labels.includes('ground')) {
                    jumpCountRef.current = 0
                    const player = engine?.world.bodies.find(b => b.label === 'player')
                    if (player) player.render.fillStyle = green
                }
            }
        })

        Matter.Render.run(render)

        return () => {
            Matter.Render.stop(render)
            Matter.World.clear(world, false)
            Matter.Engine.clear(engine)
            Matter.Runner.stop(runner)
            clearIntervals()
            if (render.canvas.parentNode) render.canvas.parentNode.removeChild(render.canvas)
        }
    }, [retryKey])

    const handleSubmitScore = async () => {
        const name = playerName.trim() || '익명'
        await fetch('/api/runner', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, score: scoreRef.current})
        })
        setDialogOpen(false)
        setPlayerName('')

        fetch('/api/runner')
            .then(res => res.json())
            .then(data => setRanking(data))
            .catch(err => console.error('Failed to refresh ranking', err))
    }

    return (
        <div className="flex flex-col items-center gap-6 mt-10 relative">
            <div
                ref={sceneRef}
                className="relative w-full max-w-[62.5rem] aspect-[5/3] border-2 border-slate-600 bg-slate-800 shadow-2xl rounded-2xl overflow-hidden"
                onClick={() => !gameOver && handleJump()}
            />
            <div className="text-lg font-semibold text-white tracking-widest">점수: {score}</div>
            <Ranking ranking={ranking}/>
            {isMobile && !gameOver && (
                <Button
                    onClick={handleJump}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg bg-sky-500 text-white z-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-transform"
                >
                    점프!
                </Button>
            )}
            <RegisterDialog
                open={dialogOpen}
                name={playerName}
                setName={setPlayerName}
                onSubmit={handleSubmitScore}
                onOpenChange={setDialogOpen}
                onSkip={() => {
                    setDialogOpen(false)
                    setPlayerName('')
                    handleRetry()
                }}
            />
            {gameOver && <Retry onRetry={handleRetry}/>}
        </div>
    )
}