'use client'

import {useEffect, useRef, useState} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction} from '@/components/ui/alert-dialog'
import {cn} from '@/lib/utils'

const TETROMINOES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
} as const

const ROWS = 20
const COLS = 10
const DROP_INTERVAL = 500 // ms

const randomTetromino = () => {
    const keys = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[]
    const shape = keys[Math.floor(Math.random() * keys.length)]
    return TETROMINOES[shape]
}

const useMounted = () => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    return mounted
}

const TetrisPage = () => {
    const [board, setBoard] = useState<number[][]>([])
    const [isRunning, setIsRunning] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [nextBlock, setNextBlock] = useState<number[][] | null>(null)
    const [currentBlock, setCurrentBlock] = useState<number[][] | null>(null)
    const [position, setPosition] = useState({x: 0, y: 3})
    const dropRef = useRef<NodeJS.Timeout | null>(null)
    const mounted = useMounted()

    useEffect(() => {
        const emptyBoard = Array.from({length: ROWS}, () => Array(COLS).fill(0))
        setBoard(emptyBoard)
        setNextBlock(randomTetromino())
    }, [])

    const mergeBlock = (tempBoard: number[][], block: number[][], pos: { x: number, y: number }) => {
        const newBoard = tempBoard.map(row => [...row])
        block.forEach((row, i) => {
            row.forEach((val, j) => {
                if (val && pos.x + i >= 0 && pos.x + i < ROWS && pos.y + j >= 0 && pos.y + j < COLS) {
                    newBoard[pos.x + i][pos.y + j] = val
                }
            })
        })
        return newBoard
    }

    const startGame = () => {
        const emptyBoard = Array.from({length: ROWS}, () => Array(COLS).fill(0))
        const newBlock = nextBlock ?? randomTetromino()
        const upcoming = randomTetromino()
        setBoard(emptyBoard)
        setCurrentBlock(newBlock)
        setNextBlock(upcoming)
        setPosition({x: 0, y: 3})
        setIsRunning(true)
        setShowDialog(false)

        if (dropRef.current) clearInterval(dropRef.current)
        dropRef.current = setInterval(() => {
            setPosition(pos => ({...pos, x: pos.x + 1}))
        }, DROP_INTERVAL)
    }

    useEffect(() => {
        if (!isRunning || !currentBlock) return
        const tempBoard = Array.from({length: ROWS}, () => Array(COLS).fill(0))
        const merged = mergeBlock(tempBoard, currentBlock, position)
        setBoard(merged)
    }, [position, currentBlock, isRunning])

    useEffect(() => {
        return () => {
            if (dropRef.current) clearInterval(dropRef.current)
        }
    }, [])

    return (
        <Card className="bg-black p-4 shadow-xl m-4">
            <CardHeader>
                <CardTitle className="text-white text-xl">🧱 Tetris</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4">
                    {/* 게임 보드 */}
                    <div className="grid grid-cols-10 gap-[1px] bg-neutral-900 w-max">
                        {board.flatMap((row, i) =>
                            row.map((cell, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className={cn(
                                        'w-6 h-6',
                                        cell ? 'bg-blue-500' : 'bg-neutral-800'
                                    )}
                                />
                            ))
                        )}
                    </div>

                    {/* 다음 블록 표시 */}
                    <div className="text-white text-sm flex flex-col gap-2">
                        <div className="mb-2 font-bold">다음 블록</div>
                        {nextBlock && (
                            <div
                                className="grid"
                                style={{gridTemplateColumns: `repeat(${nextBlock[0].length}, 1.5rem)`}}
                            >
                                {nextBlock.flatMap((row, i) =>
                                    row.map((cell, j) => (
                                        <div
                                            key={`next-${i}-${j}`}
                                            className={cn(
                                                'w-6 h-6 border border-gray-700',
                                                cell ? 'bg-pink-500' : 'bg-transparent'
                                            )}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 안내 및 시작 */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-white text-sm">⬅️➡️⬇️ 방향키로 이동 / 회전은 ↑</div>
                    <Button variant="secondary" onClick={startGame} disabled={isRunning}>게임 시작</Button>
                </div>
            </CardContent>

            {mounted && (
                <AlertDialog open={showDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>🎉 게임 종료</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={startGame}>다시 시작</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Card>
    )
}

export default TetrisPage;