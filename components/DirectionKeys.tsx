import {Button} from "@/components/ui/button"
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp} from "lucide-react";

export const directions = [
    {key: 'up', dx: -1, dy: 0, icon: <ArrowUp/>, className: 'col-start-2 row-start-1'},
    {key: 'left', dx: 0, dy: -1, icon: <ArrowLeft/>, className: 'col-start-1 row-start-2'},
    {key: 'right', dx: 0, dy: 1, icon: <ArrowRight/>, className: 'col-start-3 row-start-2'},
    {key: 'down', dx: 1, dy: 0, icon: <ArrowDown/>, className: 'col-start-2 row-start-3'},
]

const DirectionKeys = ({onDirection}: { onDirection: (dx: number, dy: number) => void }) => {
    return (
        <>
            {directions.map(({dx, dy, icon, className}, i) => (
                <Button
                    key={i}
                    className={`${className} w-10 h-10`}
                    onClick={() => onDirection(dx, dy)}
                >
                    {icon}
                </Button>
            ))}
        </>
    )
}

export default DirectionKeys