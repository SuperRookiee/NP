'use client'
import {useEffect, useRef, useState} from 'react'
import Matter from 'matter-js'
import {Button} from '@/components/ui/button'
import {RotateCw} from 'lucide-react'

export default function InfiniteRunner() {
    const sceneRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Matter.Engine | null>(null)
    const runnerRef = useRef<Matter.Runner | null>(null)
    const [score, setScore] = useState(0)
    const [gameOver, setGameOver] = useState(false)
    const [retryKey, setRetryKey] = useState(0)

    useEffect(() => {
        const baseWidth = 1000
        const baseHeight = 400
        const padding = 16

        const actualWidth = Math.min(window.innerWidth - padding * 2, baseWidth)
        const actualHeight = Math.min(window.innerHeight, baseHeight)
        const scaleX = actualWidth / baseWidth
        const scaleY = actualHeight / baseHeight
        const scale = Math.min(scaleX, scaleY)

        const engine = Matter.Engine.create({gravity: {y: 3.5}})
        const runner = Matter.Runner.create()
        const render = Matter.Render.create({
            element: sceneRef.current!,
            engine,
            options: {
                width: actualWidth,
                height: actualHeight,
                wireframes: false,
                background: '#1e293b',
            },
        })

        engineRef.current = engine
        runnerRef.current = runner

        Matter.Runner.run(runner, engine)
        Matter.Render.run(render)

        const world = engine.world

        const ground = Matter.Bodies.rectangle(actualWidth / 2, actualHeight - 10 * scale, actualWidth + 10, 20 * scale, {
            isStatic: true,
            label: 'ground',
            render: {fillStyle: '#475569'},
        })

        const player = Matter.Bodies.rectangle(100 * scale, actualHeight - 80 * scale, 40 * scale, 40 * scale, {
            label: 'player',
            render: {fillStyle: '#38bdf8'},
        })

        Matter.World.add(world, [ground, player])

        const obstacles: Matter.Body[] = []

        const spawnObstacle = () => {
            const heightRandom = (Math.floor(Math.random() * 150) + 50) * scale
            const y = actualHeight - 10 * scale - heightRandom / 2
            const obs = Matter.Bodies.rectangle(actualWidth + 50 * scale, y, 40 * scale, heightRandom, {
                isStatic: true,
                label: 'obstacle',
                render: {fillStyle: '#f87171'},
            })
            obstacles.push(obs)
            Matter.World.add(world, obs)
        }

        const moveObstacles = () => {
            for (const obs of obstacles) {
                Matter.Body.translate(obs, {x: -10 * scale, y: 0})
                if (obs.position.x < -50 * scale) {
                    Matter.World.remove(world, obs)
                }
            }
        }

        let spawnTimeoutId: NodeJS.Timeout
        const spawnLoop = () => {
            spawnObstacle()
            const delay = Math.random() * 500 + 800
            spawnTimeoutId = setTimeout(spawnLoop, delay)
        }
        spawnLoop()

        const scoreInterval = setInterval(() => setScore((prev) => prev + 1), 300)

        Matter.Events.on(engine, 'beforeUpdate', moveObstacles)

        Matter.Events.on(engine, 'collisionStart', (e) => {
            if (gameOver) return
            for (const pair of e.pairs) {
                const labels = [pair.bodyA.label, pair.bodyB.label]
                if (labels.includes('player') && labels.includes('obstacle')) {
                    setGameOver(true)
                    Matter.Runner.stop(runner)
                    clearTimeout(spawnTimeoutId)
                    clearInterval(scoreInterval)
                }
            }
        })

        const jump = () => {
            if (player.position.y > actualHeight - 100 * scale && !gameOver) {
                Matter.Body.setVelocity(player, {x: 0, y: -25 / scale})
            }
        }

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') jump()
        })

        return () => {
            Matter.Render.stop(render)
            Matter.World.clear(world, false)
            Matter.Engine.clear(engine)
            Matter.Runner.stop(runner)
            clearTimeout(spawnTimeoutId)
            clearInterval(scoreInterval)
            if (render.canvas.parentNode) {
                render.canvas.parentNode.removeChild(render.canvas)
            }
            window.removeEventListener('keydown', jump)
        }
    }, [retryKey])

    const handleRetry = () => {
        setScore(0)
        setGameOver(false)
        setRetryKey((prev) => prev + 1)
    }

    const handleJump = () => {
        const engine = engineRef.current
        const player = engine?.world.bodies.find((b) => b.label === 'player')
        const height = Math.min(window.innerHeight, 400)
        const scale = height / 400
        if (player && player.position.y > height - 100 * scale && !gameOver) {
            Matter.Body.setVelocity(player, {x: 0, y: -25 / scale})
        }
    }

    return (
        <div className="flex flex-col items-center mt-6 relative">
            <div
                ref={sceneRef}
                className="w-full max-w-[1000px] aspect-[5/2] border shadow rounded"
                onClick={() => !gameOver && handleJump()}
                onTouchStart={() => !gameOver && handleJump()}
            />
            <div className="mt-4 text-white text-lg">점수: {score}</div>
            {gameOver && (
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center bg-black/70 p-4 rounded-lg">
                    <div className="text-red-500 font-bold text-xl mb-2">💥 Game Over!</div>
                    <Button onClick={handleRetry} variant="outline" className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4"/>
                        Retry
                    </Button>
                </div>
            )}
        </div>
    )
}