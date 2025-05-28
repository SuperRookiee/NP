import {summarizeMemo} from '@/app/_actions/summarize'
import {use} from 'react'

export default function Summary({formData}: { formData: FormData }) {
    const summary = use(summarizeMemo(formData))
    return <p className="mt-4">📄 {summary}</p>
}