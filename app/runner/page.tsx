'use client'
import {useEffect, useRef, useState, useCallback} from 'react'
import Matter from 'matter-js'
import {RotateCw} from 'lucide-react'
import {Card, CardContent, CardTitle} from "@/components/ui/card"
import {Button} from '@/components/ui/button'

export default function InfiniteRunner() {
    const sceneRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Matter.Engine | null>(null)
    const runnerRef = useRef<Matter.Runner | null>(null)
    const jumpCountRef = useRef<number>(0)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [retryKey, setRetryKey] = useState(0)
    const [difficulty, setDifficulty] = useState(1)
    const [isMobile, setIsMobile] = useState(false)
    const [ranking, setRanking] = useState<{ name: string, score: number }[]>([])

    const handleRetry = () => {
        setScore(0)
        setGameOver(false)
        setRetryKey(prev => prev + 1)
        setDifficulty(1)
        jumpCountRef.current = 0
        const engine = engineRef.current
        const player = engine?.world.bodies.find(b => b.label === 'player')
        if (player) player.render.fillStyle = '#86efac'
    }

    const handleJump = useCallback(() => {
        const engine = engineRef.current
        const player = engine?.world.bodies.find(b => b.label === 'player')
        if (!player || gameOver) return
        if (jumpCountRef.current < 2) {
            Matter.Body.setVelocity(player, {x: 0, y: -25})
            jumpCountRef.current++
            const remaining = 2 - jumpCountRef.current
            const color = remaining === 2 ? '#86efac' : remaining === 1 ? '#facc15' : '#f97316'
            player.render.fillStyle = color
        }
    }, [gameOver])

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

        Matter.Runner.run(runner, engine)
        Matter.Render.run(render)

        const world = engine.world

        const ground = Matter.Bodies.rectangle(baseWidth / 2, baseHeight - 10, baseWidth + 10, 20, {
            isStatic: true,
            label: 'ground',
            render: {fillStyle: '#334155'},
        })

        const player = Matter.Bodies.rectangle(100, baseHeight - 80, 40, 40, {
            label: 'player',
            render: {fillStyle: '#86efac'},
        })

        Matter.World.add(world, [ground, player])
        const obstacles: Matter.Body[] = []

        const spawnObstacle = () => {
            const heightRandom = (Math.floor(Math.random() * 150) + 50 + difficulty * 10)
            const y = baseHeight - 20 - heightRandom / 2
            const obs = Matter.Bodies.rectangle(baseWidth + 50, y, 40, heightRandom, {
                isStatic: true,
                label: 'obstacle',
                render: {fillStyle: '#ef4444'},
            })
            obstacles.push(obs)
            Matter.World.add(world, obs)
        }

        const moveObstacles = () => {
            for (const obs of obstacles) {
                Matter.Body.translate(obs, {x: -(10 + difficulty), y: 0})
                if (obs.position.x < -50) Matter.World.remove(world, obs)
            }
        }

        let spawnTimeoutId: NodeJS.Timeout
        const spawnLoop = () => {
            spawnObstacle()
            const delay = Math.random() * 500 + 800
            spawnTimeoutId = setTimeout(spawnLoop, delay)
        }
        spawnLoop()

        const scoreInterval = setInterval(() => setScore(prev => prev + difficulty), 300)
        const difficultyInterval = setInterval(() => setDifficulty(prev => prev + 1), 10000)

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
            if (gameOver) return
            for (const pair of e.pairs) {
                const labels = [pair.bodyA.label, pair.bodyB.label]
                if (labels.includes('player') && labels.includes('obstacle')) {
                    if (!gameOver) {
                        const name = prompt('닉네임을 입력하세요') ?? '익명'
                        fetch('/api/runner', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({name, score})
                        })
                    }
                    setGameOver(true)
                    Matter.Runner.stop(runner)
                    clearTimeout(spawnTimeoutId)
                    clearInterval(scoreInterval)
                    clearInterval(difficultyInterval)
                }
                if (labels.includes('player') && labels.includes('ground')) {
                    jumpCountRef.current = 0
                    const engine = engineRef.current
                    const player = engine?.world.bodies.find(b => b.label === 'player')
                    if (player) player.render.fillStyle = '#86efac'
                }
            }
        })

        return () => {
            Matter.Render.stop(render)
            Matter.World.clear(world, false)
            Matter.Engine.clear(engine)
            Matter.Runner.stop(runner)
            clearTimeout(spawnTimeoutId)
            clearInterval(scoreInterval)
            clearInterval(difficultyInterval)
            if (render.canvas.parentNode) render.canvas.parentNode.removeChild(render.canvas)
        }
    }, [retryKey])

    return (
        <div className="flex flex-col items-center gap-6 mt-10 relative">
            <div
                ref={sceneRef}
                className="relative w-full max-w-[62.5rem] aspect-[5/3] border-2 border-slate-600 bg-slate-800 shadow-2xl rounded-2xl overflow-hidden"
                onClick={() => !gameOver && handleJump()}
            />
            <div className="text-lg font-semibold text-white tracking-widest">점수: {score}</div>
            <div className="w-full max-w-[62.5rem] px-4">
                <h2 className="text-white font-bold text-lg mb-2 mt-4">🏆 랭킹</h2>
                <ul className="text-sm text-slate-200 space-y-1">
                    {ranking.map((r, i) =>
                        <li key={i}>{i + 1}. {r.name} - {r.score}점</li>
                    )}
                </ul>
            </div>
            {isMobile && !gameOver &&
                <Button
                    onClick={handleJump}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg bg-sky-500 text-white z-50 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-300 transition-transform"
                >
                    점프!
                </Button>
            }
            {gameOver &&
                <Card
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background/90 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md flex flex-col items-center gap-5 w-64">
                    <CardTitle className="text-2xl font-bold text-destructive text-center whitespace-nowrap">
                        💥 Game Over!
                    </CardTitle>
                    <CardContent className="p-0">
                        <Button variant="default" onClick={handleRetry} className="gap-2 px-6 py-2 rounded-full">
                            <RotateCw className="w-5 h-5"/>
                            다시 시작
                        </Button>
                    </CardContent>
                </Card>
            }
        </div>
    )
}