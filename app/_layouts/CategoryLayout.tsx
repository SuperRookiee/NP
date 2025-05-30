'use client'
import Link from 'next/link'
import {ReactNode} from "react";
import Header from "@/app/_components/Header";
import {ArrowLeft} from "lucide-react";

export default function CategoryLayout({children}: { children: ReactNode }) {
    return (
        <div className="space-y-6">
            <Header/>
            <Link href="/" className="flex gap-0.5 text-gray-600 dark:text-gray-300 hover:brightness-75">
                <ArrowLeft/> 홈으로 돌아가기
            </Link>
            {children}
        </div>
    )
}