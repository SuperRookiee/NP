import {Menu} from 'lucide-react'
import {Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger} from '@/components/ui/drawer'
import {Button} from "@/components/ui/button";

interface RankingProps {
    ranking: { name: string, score: number }[]
}

export default function Ranking({ranking}: RankingProps) {
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline" className="text-white flex items-center gap-2">
                    <Menu className="w-5 h-5"/> 랭킹 보기
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-2/3">
                <div className="mx-auto w-full max-w-xl">
                    <DrawerHeader>
                        <DrawerTitle className="text-white">🏆 랭킹</DrawerTitle>
                        <DrawerDescription className="text-slate-400">
                            상위 기록을 확인해보세요.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <ul className="text-sm text-slate-200 space-y-1 max-h-60 overflow-y-auto">
                            {ranking.map((r, i) =>
                                <li key={i}>{i + 1}. {r.name} - {r.score}점</li>
                            )}
                        </ul>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">닫기</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}