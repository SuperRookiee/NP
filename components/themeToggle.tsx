"use client"
import {useEffect, useState} from "react"
import {Moon, Sun} from "lucide-react"

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        const savedTheme = localStorage.getItem("theme")

        const enabled = savedTheme
            ? savedTheme === "dark"
            : isSystemDark

        setIsDark(enabled)
        document.documentElement.classList.toggle("dark", enabled)
    }, [])

    const toggleTheme = () => {
        const nextTheme = isDark ? "light" : "dark"
        setIsDark(!isDark)
        document.documentElement.classList.toggle("dark", !isDark)
        localStorage.setItem("theme", nextTheme)
    }

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 text-black dark:text-white transition"
            aria-label="Toggle theme"
        >
            {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
        </button>
    )
}