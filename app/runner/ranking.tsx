import {ChevronDown, ChevronUp} from 'lucide-react'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Separator} from '@/components/ui/separator'

interface RankingProps {
    open: boolean
    setOpen: (open: boolean) => void
    ranking: { name: string; score: number }[]
}

export default function Ranking({open, setOpen, ranking}: RankingProps) {
    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-[62.5rem] px-4">
            <div className="flex items-center justify-between mb-2 mt-4">
                <CollapsibleTrigger className="text-white font-bold text-lg flex items-center gap-2">
                    🏆 랭킹
                    {open ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <Separator className="bg-slate-700 mb-2"/>
                <ScrollArea className="h-64 rounded-md border border-slate-800">
                    <ul className="text-sm text-slate-200 space-y-1 p-2">
                        {ranking.map((r, i) => (
                            <li key={i}>
                                {i + 1}. {r.name} - {r.score}점
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
                <Separator className="bg-slate-700 mt-2"/>
            </CollapsibleContent>
        </Collapsible>
    )
}