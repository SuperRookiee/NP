import {ReactNode} from "react";
import SubPageLayout from '@/app/_layouts/SubPageLayout'

export default function Layout({children}: { children: ReactNode }) {
    return <SubPageLayout>{children}</SubPageLayout>
}