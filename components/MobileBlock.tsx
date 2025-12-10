"use client"
import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'

export default function MobileBlock({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 900)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    if (isMobile) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white text-center p-6">
                <Monitor size={60} className="mb-4 opacity-80" />
                <h2 className="text-2xl font-semibold mb-2">Mobile Preview Not Available</h2>
                <p className="text-lg opacity-80">
                    Please open this site in Desktop Mode<br />or use a computer for the best experience.
                </p>
            </div>
        )
    }

    return <>{children}</>
}
