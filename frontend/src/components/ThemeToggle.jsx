import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  // Read initial state directly from the DOM so it's always in sync
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains('dark')
  )

  const toggleTheme = () => {
    const newIsDark = !isDark
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    setIsDark(newIsDark)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 transition-colors border border-slate-300/80 dark:border-white/10 shadow-sm flex items-center justify-center backdrop-blur-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
    </motion.button>
  )
}
