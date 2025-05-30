export type Cell = {
    isMine: boolean
    isOpen: boolean
    isFlagged: boolean
    neighborMines: number
}

export type Difficulty = 'Easy' | 'Normal' | 'Hard' | 'Crazy'