'use server'

export async function summarizeMemo(formData: FormData) {
    const text = formData.get('memo') as string
    return await fakeAISummary(text)
}

async function fakeAISummary(text: string) {
    await new Promise((r) => setTimeout(r, 3000))
    return `요약: ${text.slice(0, 20)}...`
}