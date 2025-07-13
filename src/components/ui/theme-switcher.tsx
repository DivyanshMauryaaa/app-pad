"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "./button"

export function ThemeSwitcher() {
    const [isDark, setIsDark] = useState(true)

    useEffect(() => {
        // On mount, check system or localStorage
        const html = document.documentElement
        const stored = localStorage.getItem("theme")
        if (stored === "light") {
            html.classList.remove("dark")
            setIsDark(false)
        } else {
            html.classList.add("dark")
            setIsDark(true)
        }
    }, [])

    const toggleTheme = () => {
        const html = document.documentElement
        if (html.classList.contains("dark")) {
            html.classList.remove("dark")
            localStorage.setItem("theme", "light")
            setIsDark(false)
        } else {
            html.classList.add("dark")
            localStorage.setItem("theme", "dark")
            setIsDark(true)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="ml-2"
        >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
    )
}