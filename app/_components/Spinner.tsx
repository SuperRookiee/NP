'use client'
import {Loader2} from "lucide-react"
import {Skeleton} from "@/components/ui/skeleton"

export default function Spinner({message}: { message: string }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary"/>
            <Skeleton>{message}</Skeleton>
        </div>
    )
}