import {ReactNode} from "react";
import CategoryLayout from '@/app/_layouts/CategoryLayout'

export default function Layout({children}: { children: ReactNode }) {
    return <CategoryLayout>{children}</CategoryLayout>
}