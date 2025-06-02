import {ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp} from "lucide-react";

export const directions = [
    {key: "up", dx: -1, dy: 0, icon: <ArrowUp/>, className: "col-start-2 row-start-1"},
    {key: "left", dx: 0, dy: -1, icon: <ArrowLeft/>, className: "col-start-1 row-start-2"},
    {key: "right", dx: 0, dy: 1, icon: <ArrowRight/>, className: "col-start-3 row-start-2"},
    {key: "down", dx: 1, dy: 0, icon: <ArrowDown/>, className: "col-start-2 row-start-3"},
];

const DirectionKeys = ({onDirection, size = 10, children}: {onDirection: (dx: number, dy: number) => void, size?: number, children?: ReactNode}) => {
    const sizeClass = `w-${size} h-${size}`

    return (
        <div className="grid grid-cols-3 grid-rows-3 gap-2">
            {directions.map(({dx, dy, icon, className}, i) =>
                <Button key={i} className={`${className} ${sizeClass}`} onClick={() => onDirection(dx, dy)}>
                    {icon}
                </Button>
            )}
            <div className="col-start-2 row-start-2 flex items-center justify-center">{children}</div>
        </div>
    );
};

export default DirectionKeys