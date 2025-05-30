'use client'
import {useEffect, useRef, useState, MouseEvent} from 'react'
import {Cell, Difficulty} from '../types/mine/mineType';
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {RotateCw, Timer} from "lucide-react";

const DIFFICULTY_SETTING: Record<Difficulty, { rows: number, cols: number, mines: number }> = {
    Easy: {rows: 9, cols: 9, mines: 10},
    Normal: {rows: 16, cols: 16, mines: 40},
    Hard: {rows: 16, cols: 30, mines: 99}
}

const createBoard = (difficulty: Difficulty): Cell[][] => {
    const {rows, cols, mines} = DIFFICULTY_SETTING[difficulty]

    const board: Cell[][] = Array.from({length: rows}, () =>
        Array.from({length: cols}, () => ({
            isMine: false,
            isOpen: false,
            isFlagged: false,
            neighborMines: 0,
        }))
    )

    let placed = 0
    while (placed < mines) {
        const r = Math.floor(Math.random() * rows)
        const c = Math.floor(Math.random() * cols)
        if (!board[r][c].isMine) {
            board[r][c].isMine = true
            placed++
        }
    }

    const directions = [-1, 0, 1]
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = board[r][c]
            if (cell.isMine) continue

            let count = 0
            for (const dr of directions) {
                for (const dc of directions) {
                    if (dr === 0 && dc === 0) continue
                    const nr = r + dr
                    const nc = c + dc
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                        count++
                    }
                }
            }
            cell.neighborMines = count
        }
    }

    return board
}

export default function MinePage() {
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy')
    const [board, setBoard] = useState(() => createBoard('Easy'))
    const [gameOver, setGameOver] = useState(false)
    const [startTime, setStartTime] = useState<number | null>(null) //시작시간
    const [elapsed, setElapsed] = useState<number>(0)               // 경과 시간

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const {rows, cols} = DIFFICULTY_SETTING[difficulty]

    // 타이머 관리
    useEffect(() => {
        if (startTime && !gameOver) {
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [startTime, gameOver])

    const openCellRecursive = (board: Cell[][], r: number, c: number) => {
        const inBounds = (r: number, c: number) => r >= 0 && r < rows && c >= 0 && c < cols
        const visited = new Set<string>()

        const dfs = (r: number, c: number) => {
            const key = `${r}-${c}`
            if (!inBounds(r, c) || visited.has(key)) return
            const cell = board[r][c]
            if (cell.isOpen || cell.isFlagged) return

            cell.isOpen = true
            visited.add(key)

            if (cell.neighborMines === 0 && !cell.isMine) {
                for (const dr of [-1, 0, 1]) {
                    for (const dc of [-1, 0, 1]) {
                        if (dr === 0 && dc === 0) continue
                        dfs(r + dr, c + dc)
                    }
                }
            }
        }

        dfs(r, c)
    }

    const handleLeftClick = (r: number, c: number) => {
        if (gameOver) return

        if (!startTime) setStartTime(Date.now())

        const next = board.map(row => row.map(cell => ({...cell})))
        const cell = next[r][c]

        if (cell.isOpen || cell.isFlagged) return

        if (cell.isMine) {
            cell.isOpen = true
            setGameOver(true)
            for (const row of next) {
                for (const cell of row) {
                    if (cell.isMine) cell.isOpen = true
                }
            }
        } else if (cell.neighborMines === 0) {
            openCellRecursive(next, r, c)
        } else {
            cell.isOpen = true
        }

        setBoard(next)
    }

    const handleRightClick = (e: MouseEvent, r: number, c: number) => {
        e.preventDefault()
        if (gameOver) return

        const next = board.map(row => row.map(cell => ({...cell})))
        const cell = next[r][c]

        if (!cell.isOpen) {
            cell.isFlagged = !cell.isFlagged
        }

        setBoard(next)
    }

    const resetGame = (newDifficulty?: Difficulty) => {
        const diff = newDifficulty || difficulty
        setDifficulty(diff)
        setBoard(createBoard(diff))
        setGameOver(false)
        setStartTime(null)
        setElapsed(0)
        if (timerRef.current) clearInterval(timerRef.current)
    }

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <span className={`text-gray-500 dark:text-gray-400 flex items-center gap-0.5 ${gameOver && 'text-red-500'}`}><Timer/>{elapsed}s</span>
                {gameOver && <CardDescription className="text-red-500 font-bold">☠️ Game Over</CardDescription>}
            </CardHeader>
            <CardTitle className="flex flex-wrap justify-center gap-2 mb-4 text-center">
                <Button variant="outline" onClick={() => resetGame()}><RotateCw className="w-5 h-5"/> 재시작</Button>
                {(['Easy', 'Normal', 'Hard'] as Difficulty[]).map(d => (
                    <Button
                        key={d}
                        variant={difficulty === d ? 'default' : 'secondary'}
                        onClick={() => resetGame(d)}
                    >
                        {d}
                    </Button>
                ))}
            </CardTitle>
            <CardContent className="grid gap-1 overflow-auto mx-auto justify-center" style={{gridTemplateColumns: `repeat(${cols}, 2rem)`}}>
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        <Button
                            key={`${rowIndex}_${colIndex}`}
                            variant={cell.isOpen ? 'secondary' : 'default'}
                            className="p-0 h-8 w-8 text-xs"
                            onClick={() => handleLeftClick(rowIndex, colIndex)}
                            onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                        >
                            {cell.isOpen ? cell.isMine ? '💣' : cell.neighborMines || '' : cell.isFlagged ? '🚩' : ''}
                        </Button>
                    ))
                }
            </CardContent>
        </Card>
    )
}