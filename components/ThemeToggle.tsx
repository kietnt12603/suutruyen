'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    if (!mounted) return <div className="w-10 h-10" />;

    return (
        <button
            onClick={toggleTheme}
            className="group relative p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 overflow-hidden"
            aria-label="Toggle Theme"
        >
            <div className="relative z-10">
                {isDark ? (
                    <Sun size={18} className="text-yellow-400 animate-in zoom-in spin-in-90 duration-300" />
                ) : (
                    <Moon size={18} className="text-slate-400 group-hover:text-blue-400 animate-in zoom-in spin-in-90 duration-300" />
                )}
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${isDark ? 'bg-yellow-400 blur-xl' : 'bg-blue-400 blur-xl opacity-0 group-hover:opacity-10'}`} />
        </button>
    );
}
