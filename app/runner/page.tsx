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

    const handleRetry = () => {
        setScore(0)
        setGameOver(false)
        setRetryKey(prev => prev + 1)
        setDifficulty(1)
        jumpCountRef.current = 0
    }

    const handleJump = useCallback(() => {
        const engine = engineRef.current
        const player = engine?.world.bodies.find(b => b.label === 'player')
        if (!player || gameOver) return
        if (jumpCountRef.current < 2) {
            Matter.Body.setVelocity(player, {x: 0, y: -25})
            jumpCountRef.current++
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
            render: {fillStyle: '#0ea5e9'},
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

        Matter.Events.on(engine, 'beforeUpdate', () => moveObstacles())

        Matter.Events.on(engine, 'collisionStart', e => {
            if (gameOver) return
            for (const pair of e.pairs) {
                const labels = [pair.bodyA.label, pair.bodyB.label]
                if (labels.includes('player') && labels.includes('obstacle')) {
                    setGameOver(true)
                    Matter.Runner.stop(runner)
                    clearTimeout(spawnTimeoutId)
                    clearInterval(scoreInterval)
                    clearInterval(difficultyInterval)
                }
                if (labels.includes('player') && labels.includes('ground')) {
                    jumpCountRef.current = 0
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
                onTouchStart={() => !gameOver && handleJump()}
            />
            <div className="text-lg font-semibold text-white tracking-widest">점수: {score}</div>
            {gameOver && (
                <Card
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background/90 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md flex flex-col items-center gap-5">
                    <CardTitle className="text-2xl font-bold text-destructive text-center">
                        💥 Game Over!
                    </CardTitle>
                    <CardContent className="p-0">
                        <Button variant="default" onClick={handleRetry} className="gap-2 px-6 py-2 rounded-full">
                            <RotateCw className="w-5 h-5"/>
                            다시 시작
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}