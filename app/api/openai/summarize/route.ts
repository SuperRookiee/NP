import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
    const { text } = await req.json()
    if (!text) return Response.json({ error: '내용이 없습니다.' }, { status: 400 })

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: '당신은 글을 요약해주는 도우미입니다.' },
                { role: 'user', content: `다음 글을 요약해줘:\n\n${text}` },
            ],
        }),
    })

    if (!res.ok) return Response.json({ error: '요약 실패' }, { status: res.status })

    const d = await res.json()
    return Response.json({ summary: d.choices?.[0]?.message?.content?.trim() || '' })
}