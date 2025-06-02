'use client'
import {useEffect, useRef, useState} from 'react'
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction, AlertDialogDescription} from '@/components/ui/alert-dialog'
import {cn} from '@/lib/utils'
import DirectionKeys from '@/components/DirectionKeys'
import {Block} from '@/app/types/tetris/BlockType'
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCw} from 'lucide-react'

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
const DROP_INTERVAL = 500
const COLORS = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500']
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)]

const randomTetromino = (): Block => {
    const keys = Object.keys(TETROMINOES) as (keyof typeof TETROMINOES)[]
    const shape = TETROMINOES[keys[Math.floor(Math.random() * keys.length)]].map(row => [...row])
    return {shape, color: randomColor()}
}

const rotate = (matrix: number[][]) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse())

const TetrisPage = () => {
    const [board, setBoard] = useState<(string | 0)[][]>(() => Array.from({length: ROWS}, () => Array(COLS).fill(0)))
    const [isRunning, setIsRunning] = useState(false)
    const [showDialog, setShowDialog] = useState(false)
    const [currentBlock, setCurrentBlock] = useState<Block | null>(null)
    const [nextBlock, setNextBlock] = useState<Block | null>(null)
    const [position, setPosition] = useState({x: 0, y: 3})
    const [score, setScore] = useState(0)
    const dropRef = useRef<NodeJS.Timeout | null>(null)

    const drawBoard = () => {
        const temp = board.map(row => [...row])
        if (!currentBlock) return temp
        currentBlock.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell) {
                    const x = position.x + i
                    const y = position.y + j
                    if (x >= 0 && x < ROWS && y >= 0 && y < COLS) {
                        temp[x][y] = currentBlock.color
                    }
                }
            })
        })
        return temp
    }

    const canMove = (block: Block, x: number, y: number) => {
        return block.shape.every((row, i) =>
            row.every((cell, j) => {
                if (!cell) return true
                const newX = x + i
                const newY = y + j
                return newX >= 0 && newX < ROWS && newY >= 0 && newY < COLS && board[newX][newY] === 0
            })
        )
    }

    const mergeBlock = (tempBoard: (string | 0)[][], block: Block, pos: { x: number, y: number }) => {
        const newBoard = tempBoard.map(row => [...row])
        block.shape.forEach((row, i) => {
            row.forEach((val, j) => {
                if (val && pos.x + i >= 0 && pos.x + i < ROWS && pos.y + j >= 0 && pos.y + j < COLS) {
                    newBoard[pos.x + i][pos.y + j] = block.color
                }
            })
        })
        return newBoard
    }

    const clearLines = (prevBoard: (string | 0)[][]) => {
        const newBoard = prevBoard.filter(row => row.some(cell => cell === 0))
        const linesCleared = ROWS - newBoard.length
        const filled = Array.from({length: linesCleared}, () => Array(COLS).fill(0))
        if (linesCleared > 0) setScore(score => score + linesCleared * 100)
        return [...filled, ...newBoard]
    }

    const moveBlock = (dx: number, dy: number) => {
        if (!currentBlock) return
        const newX = position.x + dx
        const newY = position.y + dy
        if (canMove(currentBlock, newX, newY)) {
            setPosition({x: newX, y: newY})
        }
    }

    const rotateBlock = () => {
        if (!currentBlock) return
        const rotated = rotate(currentBlock.shape)
        if (canMove({...currentBlock, shape: rotated}, position.x, position.y)) {
            setCurrentBlock({...currentBlock, shape: rotated})
        }
    }

    const dropBlock = () => {
        if (!currentBlock) return
        const nextX = position.x + 1
        if (canMove(currentBlock, nextX, position.y)) {
            setPosition({x: nextX, y: position.y})
        } else {
            const merged = mergeBlock(board, currentBlock, position)
            const cleared = clearLines(merged)
            setBoard(cleared)

            const next = nextBlock ?? randomTetromino()
            const startPos = {x: 0, y: 3}

            if (!canMove(next, startPos.x, startPos.y)) {
                setIsRunning(false)
                setShowDialog(true)
                return
            }

            setCurrentBlock(next)
            setNextBlock(randomTetromino())
            setPosition(startPos)
        }
    }

    useEffect(() => {
      if (!isRunning || !currentBlock) return

      if (dropRef.current) clearTimeout(dropRef.current)
      dropRef.current = setTimeout(dropBlock, DROP_INTERVAL)

      return () => {
        if (dropRef.current) {
          clearTimeout(dropRef.current)
        }
      }
    }, [currentBlock, position, isRunning]) // 필요 시 dropBlock도 포함
    
    const startGame = () => {
        setBoard(Array.from({length: ROWS}, () => Array(COLS).fill(0)))
        setScore(0)
        setIsRunning(true)
        setShowDialog(false)
        const block = randomTetromino()
        setCurrentBlock(block)
        setNextBlock(randomTetromino())
        setPosition({x: 0, y: 3})
    }

    useEffect(() => {
        setNextBlock(randomTetromino())
        return () => dropRef.current && clearTimeout(dropRef.current)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isRunning) return
            switch (e.key) {
                case 'ArrowLeft':
                    moveBlock(0, -1);
                    break
                case 'ArrowRight':
                    moveBlock(0, 1);
                    break
                case 'ArrowDown':
                    moveBlock(1, 0);
                    break
                case 'ArrowUp':
                    rotateBlock();
                    break
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isRunning, currentBlock, position])

    return (
        <Card className="p-4 shadow-xl m-4">
            <CardHeader>
                <CardTitle className="text-xl flex justify-between text-yellow-400">Score: {score}</CardTitle>
            </CardHeader>
            <CardContent>
                <section className="flex flex-col md:flex-row gap-4">
                    <div className="grid grid-cols-10 gap-[1px] w-max dark:bg-neutral-900">
                        {drawBoard().flatMap((row, i) => row.map((cell, j) =>
                            <div
                                key={`${i}-${j}`}
                                className={cn('w-6 h-6', typeof cell === 'string' ? cell : 'bg-neutral-200 dark:bg-neutral-800')}
                            />
                        ))}
                    </div>

                    {/* 다음 블록 + PC 방향키 */}
                    <div className="text-sm flex flex-col gap-2">
                        <div className="mb-2 font-bold">다음 블록</div>
                        {nextBlock && (
                            <div className="grid"
                                 style={{gridTemplateColumns: `repeat(${nextBlock.shape[0].length}, 1.5rem)`}}>
                                {nextBlock.shape.flatMap((row, i) =>
                                    row.map((cell, j) =>
                                        <div key={`next-${i}_${j}`}
                                             className={cn('w-6 h-6 border border-gray-700', cell ? nextBlock.color : 'bg-transparent')}/>
                                    )
                                )}
                            </div>
                        )}
                        <div className="mt-8 hidden md:block">
                            <DirectionKeys onDirection={moveBlock}>
                                <Button onClick={rotateBlock} className="w-10 h-10"><RotateCw/></Button>
                            </DirectionKeys>
                        </div>
                    </div>
                </section>

                {/* 모바일 방향키 */}
                <div className="fixed bottom-[-10rem] right-[-8rem] z-1 md:hidden">
                    <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1">
                        <DirectionKeys onDirection={moveBlock} size={8}>
                            <Button onClick={rotateBlock} size="icon" className="w-8 h-8">
                                <RotateCw className="w-4 h-4"/>
                            </Button>
                        </DirectionKeys>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between">
                <div className="text-sm hidden md:flex">
                    <ArrowLeft/><ArrowRight/><ArrowDown/> 방향키 / <ArrowUp/> 회전
                </div>
                <Button variant="secondary" onClick={startGame} disabled={isRunning}>게임 시작</Button>
            </CardFooter>

            <AlertDialog open={showDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>🕹️ 게임 종료</AlertDialogTitle>
                        <AlertDialogDescription>
                            점수: {score}점<br/>
                            다시 시작하려면 버튼을 누르세요.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={startGame}>다시 시작</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    )
}

export default TetrisPage
