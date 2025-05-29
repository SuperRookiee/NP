import {NextRequest, NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

export async function POST(req: NextRequest) {
    const {name, score} = await req.json()

    if (!name || typeof score !== 'number') {
        return NextResponse.json({error: 'Invalid payload'}, {status: 400})
    }

    const {error} = await supabase.from('scores').insert({name, score})
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json({message: 'Score saved'})
}

export async function GET() {
    const {data, error} = await supabase
        .from('scores')
        .select('name, score')
        .order('score', {ascending: false})
        .limit(10)

    if (error) {
        return NextResponse.json({error: error.message}, {status: 500})
    }

    return NextResponse.json(data)
}