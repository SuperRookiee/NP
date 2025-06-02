'use client'
import {useEffect, useState, useTransition} from 'react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardFooter} from '@/components/ui/card'
import {Skeleton} from '@/components/ui/skeleton'
import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction} from '@/components/ui/alert-dialog'
import {ArrowUp, ArrowDown, ArrowLeft, ArrowRight} from 'lucide-react'

const MAZE_ROWS = 30
const MAZE_COLS = 30
const START = {x: 0, y: 0}
const GOAL = {x: 28, y: 28} // 미로 안쪽의 확실한 도착지점

const directions = [
    {dx: -1, dy: 0, icon: <ArrowUp/>, className: 'col-start-2 row-start-1'},
    {dx: 0, dy: -1, icon: <ArrowLeft/>, className: 'col-start-1 row-start-2'},
    {dx: 0, dy: 1, icon: <ArrowRight/>, className: 'col-start-3 row-start-2'},
    {dx: 1, dy: 0, icon: <ArrowDown/>, className: 'col-start-2 row-start-3'},
]

const generateMaze = () => {
    const maze = Array.from({length: MAZE_ROWS}, () => Array(MAZE_COLS).fill(1))
    const visited = Array.from({length: MAZE_ROWS}, () => Array(MAZE_COLS).fill(false))
    const shuffle = (arr: typeof directions) => [...arr].sort(() => Math.random() - 0.5)

    const dfs = (x: number, y: number) => {
        visited[x][y] = true
        maze[x][y] = 0
        for (const {dx, dy} of shuffle(directions)) {
            const nx = x + dx * 2
            const ny = y + dy * 2
            if (nx >= 0 && nx < MAZE_ROWS && ny >= 0 && ny < MAZE_COLS && !visited[nx][ny]) {
                maze[x + dx][y + dy] = 0
                dfs(nx, ny)
            }
        }
    }

    dfs(START.x, START.y)
    return maze
}

export default function MazeGame() {
    const [maze, setMaze] = useState<number[][]>([])
    const [player, setPlayer] = useState(START)
    const [isPending, startTransition] = useTransition()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const movePlayer = (dx: number, dy: number) => {
        const nx = player.x + dx
        const ny = player.y + dy
        if (
            nx >= 0 &&
            nx < MAZE_ROWS &&
            ny >= 0 &&
            ny < MAZE_COLS &&
            maze[nx][ny] === 0
        ) {
            setPlayer({x: nx, y: ny})
        }
    }

    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') movePlayer(-1, 0)
        if (e.key === 'ArrowDown') movePlayer(1, 0)
        if (e.key === 'ArrowLeft') movePlayer(0, -1)
        if (e.key === 'ArrowRight') movePlayer(0, 1)
    }

    useEffect(() => {
        startTransition(() => {
            setMaze(generateMaze())
            setPlayer(START)
        })
    }, [])

    useEffect(() => {
        if (player.x === GOAL.x && player.y === GOAL.y) {
            setIsDialogOpen(true)
        }
    }, [player])

    useEffect(() => {
        let pressedKey: string | null = null
        let animationFrame: number

        const moveByKey = () => {
            if (pressedKey === 'ArrowUp') movePlayer(-1, 0)
            if (pressedKey === 'ArrowDown') movePlayer(1, 0)
            if (pressedKey === 'ArrowLeft') movePlayer(0, -1)
            if (pressedKey === 'ArrowRight') movePlayer(0, 1)

            animationFrame = requestAnimationFrame(moveByKey)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!pressedKey) {
                pressedKey = e.key
                moveByKey()
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (pressedKey === e.key) {
                pressedKey = null
                cancelAnimationFrame(animationFrame)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
            cancelAnimationFrame(animationFrame)
        }
    }, [player, maze])

    return (
        <>
            <Card className="bg-black p-4 shadow-xl m-4 flex">
                <CardContent className="p-0 pr-4">
                    {isPending || maze.length === 0 ? (
                        <div className="grid grid-cols-[repeat(30,theme(width.3))] w-max">
                            {Array.from({length: MAZE_ROWS * MAZE_COLS}).map((_, i) => (
                                <Skeleton key={i} className="w-3 h-3 bg-neutral-800"/>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(30,theme(width.3))] w-max">
                            {maze.map((row, i) =>
                                row.map((cell, j) => (
                                    <div
                                        key={`${i}_${j}`}
                                        className={cn(
                                            'w-3 h-3',
                                            cell === 1 && 'bg-black',
                                            cell === 0 && 'bg-white',
                                            player.x === i && player.y === j && 'bg-fuchsia-500',
                                            GOAL.x === i && GOAL.y === j && 'bg-blue-500 after:content-[\'🏁\'] after:flex after:justify-center after:items-center text-xs text-white',
                                            'transition-all duration-100'
                                        )}

                                    />
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col justify-center items-center pl-4">
                    <div className="grid grid-cols-3 grid-rows-3 gap-2">
                        {directions.map(({dx, dy, icon, className}, i) => (
                            <Button
                                key={i}
                                onClick={() => movePlayer(dx, dy)}
                                className={`${className} w-10 h-10`}
                            >
                                {icon}
                            </Button>
                        ))}
                    </div>
                </CardFooter>
            </Card>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>🎉 Clear!</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                setMaze(generateMaze())
                                setPlayer(START)
                                setIsDialogOpen(false)
                            }}
                        >
                            다시 시작
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )

}