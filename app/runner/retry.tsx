import {RotateCw} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardTitle} from '@/components/ui/card'

interface RetryProps {
    onRetry: () => void
}

export default function Retry({onRetry}: RetryProps) {
    return (
        <Card
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background/90 rounded-3xl shadow-2xl border border-slate-700 backdrop-blur-md flex flex-col items-center gap-5 w-64">
            <CardTitle className="text-2xl font-bold text-destructive text-center whitespace-nowrap">
                💥 Game Over!
            </CardTitle>
            <CardContent className="p-0">
                <Button variant="default" onClick={onRetry} className="gap-2 px-6 py-2 rounded-full">
                    <RotateCw className="w-5 h-5"/>
                    다시 시작
                </Button>
            </CardContent>
        </Card>
    )
}