'use client'
import {useState, FormEvent, useTransition} from 'react'
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from '@/app/_components/Spinner'

export default function SummarizePage() {
    const [text, setText] = useState('')
    const [summary, setSummary] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            setSummary(null)
            const res = await fetch('/api/openai/summarize', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text}),
            })
            const data = await res.json()
            setSummary(data.summary)
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>🧠 OpenAI 요약 도우미</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        rows={6}
                        placeholder="요약할 텍스트를 입력하세요..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Button type="submit" disabled={isPending}>
                        요약하기
                    </Button>
                </form>
                {isPending && <div className="mt-6"><Spinner message="요약을 생성 중입니다..."/></div>}
                {summary && (
                    <div className="mt-6 p-4 rounded-md bg-muted text-sm">
                        <strong>📄 요약 결과:</strong> {summary}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}