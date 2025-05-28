'use client'
import Link from 'next/link'
import {ReactNode} from "react";

export default function SubPageLayout({children}: { children: ReactNode }) {
    return (
        <div className="space-y-6">
            <Link href="/" className="hover:underline">
                ← 홈으로 돌아가기
            </Link>
            {children}
        </div>
    )
}