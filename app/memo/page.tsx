'use client'
import {FormEvent, useState, useTransition} from 'react'
import {summarizeMemo} from '@/actions/summarize'
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card"
import {Textarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from '@/components/Spinner'

export default function MemoPage() {
    const [text, setText] = useState('')
    const [summary, setSummary] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        const fd = new FormData()
        fd.set('memo', text)

        startTransition(async () => {
            const result = await summarizeMemo(fd)
            setSummary(result)
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>✍️ 요약 메모장</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        rows={6}
                        placeholder="요약할 내용을 입력하세요..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? '요약 중...' : '요약 요청'}
                    </Button>
                </form>
                {isPending && <div className="mt-6"><Spinner message="요약을 생성 중입니다..."/></div>}
                {summary && !isPending && (
                    <div className="mt-6 p-4 rounded-md bg-muted text-sm">
                        📄 {summary}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}