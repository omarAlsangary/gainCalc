import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth, UserButton } from '@clerk/clerk-react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Activity, Ruler, Weight, User as UserIcon, Target, Loader2, ArrowRight } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
}

export default function Onboarding() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    age: '', gender: 'M', weight_kg: '', height_cm: '', activity_level: 'Sedentary', goal: 'Maintain'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const age = parseInt(formData.age)
      const weight_kg = parseFloat(formData.weight_kg)
      const height_cm = parseFloat(formData.height_cm)
      
      let bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
      bmr = formData.gender === 'M' ? bmr + 5 : bmr - 161
      
      const multipliers = { 'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Heavy': 1.725 }
      const tdee = bmr * multipliers[formData.activity_level]
      
      let target_calories = tdee
      if (formData.goal === 'Bulk') target_calories += 500
      if (formData.goal === 'Cut') target_calories -= 500
      target_calories = Math.round(target_calories)
      
      const target_protein = Math.round(weight_kg * 2.2)
      const target_fats = Math.round((target_calories * 0.25) / 9)
      const target_carbs = Math.round((target_calories - (target_protein * 4) - (target_fats * 9)) / 4)

      const token = await getToken()
      await axios.post(`${API_URL}/users`, {
        clerk_id: user.id,
        age, gender: formData.gender, weight_kg, height_cm, activity_level: formData.activity_level,
        goal: formData.goal, target_calories, target_protein, target_fats, target_carbs
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Failed to setup profile. Ensure you have internet connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-[#050505] transition-colors duration-500">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>

      <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
        <ThemeToggle />
        <div className="scale-125 origin-right">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="glass-card p-8 sm:p-10 rounded-3xl max-w-lg w-full z-10 relative overflow-hidden"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-3 tracking-tight text-slate-900 dark:text-white transition-colors duration-500">
            Design your <span className="text-gradient">Physique</span>
          </h1>
          <p className="text-slate-500 dark:text-gray-400 font-medium transition-colors duration-500">Precision macros calculated flawlessly.</p>
        </motion.div>

        {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
          <Activity className="w-5 h-5 shrink-0" /> {error}
        </motion.div>}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-20">
          <div className="grid grid-cols-2 gap-5">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Age</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input type="number" name="age" required value={formData.age} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 pl-10 pr-4 placeholder-slate-400 dark:placeholder-white/20" placeholder="e.g. 25" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Gender</label>
              <div className="relative">
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 px-4 appearance-none cursor-pointer text-slate-900 bg-white/50 dark:bg-black/40 dark:text-white">
                  <option value="M" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Male</option>
                  <option value="F" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Female</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-b border-slate-400 dark:border-white/40 w-2 h-2 -rotate-45" />
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input type="number" step="0.1" name="weight_kg" required value={formData.weight_kg} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 pl-10 pr-4 placeholder-slate-400 dark:placeholder-white/20" placeholder="e.g. 75" />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input type="number" name="height_cm" required value={formData.height_cm} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 pl-10 pr-4 placeholder-slate-400 dark:placeholder-white/20" placeholder="e.g. 180" />
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Daily Activity Level</label>
            <div className="relative">
              <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 pl-10 pr-4 appearance-none cursor-pointer">
                <option value="Sedentary" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Sedentary (Office job)</option>
                <option value="Light" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Light Activity (1-3 days/week)</option>
                <option value="Moderate" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Moderate (3-5 days/week)</option>
                <option value="Heavy" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Heavy (6-7 days/week)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-b border-slate-400 dark:border-white/40 w-2 h-2 -rotate-45" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1.5">
            <label className="text-xs text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider ml-1 transition-colors duration-500">Primary Goal</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <select name="goal" value={formData.goal} onChange={handleChange} className="w-full glass-input rounded-xl py-3.5 pl-10 pr-4 appearance-none cursor-pointer">
                <option value="Cut" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Shred / Cut Fat (-500 cal)</option>
                <option value="Maintain" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Maintain Physique</option>
                <option value="Bulk" className="bg-white text-slate-900 dark:bg-darkBg dark:text-white">Lean Bulk (+500 cal)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l border-b border-slate-400 dark:border-white/40 w-2 h-2 -rotate-45" />
            </div>
          </motion.div>

          <motion.button 
            variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading} 
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl p-4 mt-4 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-70 group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>Calculate Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
