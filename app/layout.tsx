import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {ReactNode} from "react";
import "./globals.css";
import ThemeToggle from "@/components/themeToggle";

const geistSans = Geist({variable: "--font-geist-sans", subsets: ["latin"]});
const geistMono = Geist_Mono({variable: "--font-geist-mono", subsets: ["latin"]});

export const metadata: Metadata = {title: "Labs", description: "실험 프로젝트"};

export default function RootLayout({children}: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="ko">
            <body>
                <div className={`${geistSans.variable} ${geistMono.variable} antialiased px-6 py-8`}>
                    {children}
                    <ThemeToggle/>
                </div>
            </body>
        </html>
    );
}