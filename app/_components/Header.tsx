'use client'
import {usePathname} from 'next/navigation'

export default function Header() {
    const pathname = usePathname()

    const path = pathname === '/' ? 'labs' : pathname.replace('/', '')
    const label = path.toUpperCase()

    // 경로에 따라 이모지 매핑
    const emojiMap: Record<string, string> = {
        labs: '🔬',
        memo: '📝',
        weather: '🌤️',
        summarize: '📄',
        runner: '🎮',
        mine: '💣',
        maze: '🌀',
        default: '📁',
    }

    const emoji = emojiMap[path] || emojiMap.default

    return (
        <h1 className="text-2xl font-bold mb-6">
            {emoji} {label}
        </h1>
    )
}