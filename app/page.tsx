'use client'
import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import Header from "@/app/_components/Header";

export default function Home() {
    const navItems = [
        {href: '/memo', label: '✍️ 요약 메모장으로 이동', className: 'bg-blue-600 hover:bg-blue-700', enabled: true},
        {href: '/weather', label: '🌤️ 현재 날씨 확인하기', className: 'bg-green-600 hover:bg-green-700', enabled: true},
        {href: '/summarize', label: '🧠 OpenAI 요약 도우미', className: 'bg-indigo-300 cursor-not-allowed opacity-50', enabled: false},
        {href: '/ip', label: '🌐 내 IP 확인하기', className: 'bg-slate-600 hover:bg-slate-700', enabled: true},
        {href: '/chart', label: '📊 나의 차트 보기', className: 'bg-purple-600 hover:bg-purple-700', enabled: true},
        {href: '/runner', label: '🎮 Game - Endless Runner', className: 'bg-orange-600 hover:bg-orange-700', enabled: true}
    ]

    return (
        <>
            <Header/>
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Laboratory Home</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 px-12">
                    {navItems.map(item =>
                        item.enabled ? (
                            <Button asChild key={item.href} className={`${item.className} text-white`}>
                                <Link href={item.href}>{item.label}</Link>
                            </Button>
                        ) : (
                            <Button key={item.href} disabled variant="secondary"
                                    className={`${item.className} text-white`}>
                                {item.label}
                            </Button>
                        )
                    )}
                </CardContent>
            </Card>
        </>
    )
}