import Link from 'next/link'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-destructive">404</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">Not Found ⚠️</p>
                    <Link href="/" passHref>
                        <Button variant="outline"> ← Main Page</Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}