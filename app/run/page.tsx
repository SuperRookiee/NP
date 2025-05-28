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
        const engine = Matter.Engine.create({gravity: {y: 3.5}})
        const runner = Matter.Runner.create()
        const render = Matter.Render.create({
            element: sceneRef.current!,
            engine,
            options: {
                width: 1000,
                height: 500,
                wireframes: false,
                background: '#1e293b',
            },
        })

        engineRef.current = engine
        runnerRef.current = runner

        Matter.Runner.run(runner, engine)
        Matter.Render.run(render)

        const world = engine.world

        const ground = Matter.Bodies.rectangle(500, 490, 1010, 20, {
            isStatic: true,
            label: 'ground',
            render: {fillStyle: '#475569'},
        })

        const player = Matter.Bodies.rectangle(100, 420, 40, 40, {
            label: 'player',
            render: {fillStyle: '#38bdf8'},
        })

        Matter.World.add(world, [ground, player])

        const obstacles: Matter.Body[] = []

        // 장애물 생성
        const spawnObstacle = () => {
            const height = Math.floor(Math.random() * 150) + 50 // 50~200px
            const y = 500 - 10 - height / 2
            const obs = Matter.Bodies.rectangle(1050, y, 40, height, {
                isStatic: true,
                label: 'obstacle',
                render: { fillStyle: '#f87171' },
            })
            obstacles.push(obs)
            Matter.World.add(world, obs)
        }

        const moveObstacles = () => {
            for (const obs of obstacles) {
                Matter.Body.translate(obs, {x: -10, y: 0})
                if (obs.position.x < -50) {
                    Matter.World.remove(world, obs)
                }
            }
        }

        let spawnTimeoutId: NodeJS.Timeout
        const spawnLoop = () => {
            spawnObstacle()
            const delay = Math.random() * 500 + 800 // 800~1300ms
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

        // 점프
        const jump = () => {
            if (player.position.y > 400 && !gameOver) {
                Matter.Body.setVelocity(player, { x: 0, y: -25 })
            }
        }
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') jump()
        })
        window.addEventListener('mousedown', jump)

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
            window.removeEventListener('mousedown', jump)
        }
    }, [retryKey])

    const handleRetry = () => {
        setScore(0)
        setGameOver(false)
        setRetryKey((prev) => prev + 1)
    }

    return (
        <div className="flex flex-col items-center mt-6">
            <div ref={sceneRef} className="border rounded shadow-lg"/>
            <div className="mt-4 text-white text-lg">점수: {score}</div>
            {gameOver && (
                <div className="mt-4 flex flex-col items-center">
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