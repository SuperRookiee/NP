'use client'
import Link from 'next/link'
import {ReactNode} from "react";
import Header from "@/app/_components/Header";

export default function CategoryLayout({children}: { children: ReactNode }) {
    return (
        <div className="space-y-6">
            <Header />
            <Link href="/" className="hover:underline">
                ← 홈으로 돌아가기
            </Link>
            {children}
        </div>
    )
}