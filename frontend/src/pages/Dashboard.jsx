import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth, UserButton } from '@clerk/clerk-react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Beef, Droplet, Wheat, Plus, Scale, TrendingUp, TrendingDown, Minus, Utensils, X } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
}

export default function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const today = new Date().toISOString().split('T')[0]
  
  const [foodLogs, setFoodLogs] = useState([])
  const [weightLogs, setWeightLogs] = useState([])

  const [foodForm, setFoodForm] = useState({ food_name: '', calories: '', protein: '', fats: '', carbs: '' })
  const [weightForm, setWeightForm] = useState({ weight_kg: '' })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        
        try {
          const res = await axios.get(`${API_URL}/users/${user.id}`, { headers })
          setProfile(res.data)
        } catch (err) {
          if (err.response?.status === 404) {
            navigate('/onboarding')
            return
          }
          throw err
        }

        const [foodRes, weightRes] = await Promise.all([
          axios.get(`${API_URL}/foodLogs/${user.id}?date=${today}`, { headers }),
          axios.get(`${API_URL}/weightLogs/${user.id}`, { headers })
        ])
        setFoodLogs(foodRes.data)
        setWeightLogs(weightRes.data)
      } catch (err) {
        console.error('Failed to load data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, navigate, getToken, today])

  const handleAddFood = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const res = await axios.post(`${API_URL}/foodLogs`, {
        user_id: user.id, date: today, food_name: foodForm.food_name,
        calories: parseInt(foodForm.calories), protein: parseInt(foodForm.protein),
        fats: parseInt(foodForm.fats), carbs: parseInt(foodForm.carbs)
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      setFoodLogs([res.data, ...foodLogs])
      setFoodForm({ food_name: '', calories: '', protein: '', fats: '', carbs: '' })
    } catch (err) { console.error(err) }
  }

  const handleAddWeight = async (e) => {
    e.preventDefault()
    try {
      const token = await getToken()
      const res = await axios.post(`${API_URL}/weightLogs`, {
        user_id: user.id, date: today, weight_kg: parseFloat(weightForm.weight_kg)
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      setWeightLogs([res.data, ...weightLogs])
      setWeightForm({ weight_kg: '' })
    } catch (err) { console.error(err) }
  }

  const handleDeleteFood = async (id) => {
    try {
      const token = await getToken()
      console.log('Attempting to delete food log', id)
      await axios.delete(`${API_URL}/foodLogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Food log deleted')
      setFoodLogs(foodLogs.filter(log => log.id !== id))
    } catch (err) {
      console.error('Failed to delete food log', err)
    }
  }

  const handleDeleteWeight = async (id) => {
    try {
      const token = await getToken()
      console.log('Attempting to delete weight log', id)
      await axios.delete(`${API_URL}/weightLogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log('Weight log deleted')
      setWeightLogs(weightLogs.filter(log => log.id !== id))
    } catch (err) {
      console.error('Failed to delete weight log', err)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-darkBg flex items-center justify-center text-emerald-500"><div className="animate-pulse flex items-center gap-2"><Flame className="w-8 h-8" /><span>Initializing Module...</span></div></div>
  if (!profile) return null

  const consumed = foodLogs.reduce((acc, log) => {
    acc.calories += log.calories || 0; acc.protein += log.protein || 0;
    acc.fats += log.fats || 0; acc.carbs += log.carbs || 0;
    return acc;
  }, { calories: 0, protein: 0, fats: 0, carbs: 0 })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-gray-200 font-sans p-4 md:p-8 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-20 pointer-events-none"></div>
      <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 dark:opacity-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between glass-card p-4 px-6 rounded-3xl"
        >
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Flame className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">gainCalc</h1>
               <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 font-medium">Precision Dashboard</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-right">
                <p className="text-sm text-slate-500 dark:text-gray-400">Welcome back,</p>
                <p className="text-slate-900 dark:text-white font-bold text-sm">{user.firstName || 'Aesthetic User'}</p>
             </div>
             <ThemeToggle />
             <div className="scale-125 ml-2 origin-right"><UserButton afterSignOutUrl="/" /></div>
          </div>
        </motion.header>

        {/* Macros Summary */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-6">
             <Flame className="w-5 h-5 text-emerald-500" />
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Targets</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <MacroCard icon={Flame} label="Calories" consumed={consumed.calories} target={profile.target_calories} unit="kcal" color="emerald" />
            <MacroCard icon={Beef} label="Protein" consumed={consumed.protein} target={profile.target_protein} unit="g" color="blue" />
            <MacroCard icon={Droplet} label="Fats" consumed={consumed.fats} target={profile.target_fats} unit="g" color="yellow" />
            <MacroCard icon={Wheat} label="Carbs" consumed={consumed.carbs} target={profile.target_carbs} unit="g" color="orange" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 pt-4">
          
          {/* Daily Food Log */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-2">
               <Utensils className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nutrition Input</h2>
            </div>
            
            <motion.form variants={itemVariants} className="glass-card p-6 rounded-3xl flex flex-col gap-5" onSubmit={handleAddFood}>
              <input type="text" placeholder="Food Name (e.g. Chicken Breast)" required value={foodForm.food_name} onChange={(e) => setFoodForm({...foodForm, food_name: e.target.value})} className="bg-transparent border-b border-black/10 dark:border-white/10 p-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 transition-colors text-lg font-medium" />
              <div className="grid grid-cols-2 gap-4">
                <label className="text-xs text-slate-500">Calories <input type="number" required value={foodForm.calories} onChange={(e) => setFoodForm({...foodForm, calories: e.target.value})} className="mt-1 w-full glass-input rounded-xl p-3" /></label>
                <label className="text-xs text-slate-500">Protein (g) <input type="number" required value={foodForm.protein} onChange={(e) => setFoodForm({...foodForm, protein: e.target.value})} className="mt-1 w-full glass-input rounded-xl p-3" /></label>
                <label className="text-xs text-slate-500">Fats (g) <input type="number" required value={foodForm.fats} onChange={(e) => setFoodForm({...foodForm, fats: e.target.value})} className="mt-1 w-full glass-input rounded-xl p-3" /></label>
                <label className="text-xs text-slate-500">Carbs (g) <input type="number" required value={foodForm.carbs} onChange={(e) => setFoodForm({...foodForm, carbs: e.target.value})} className="mt-1 w-full glass-input rounded-xl p-3" /></label>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-cyan-600 dark:text-cyan-400 font-bold rounded-xl p-4 flex items-center justify-center gap-2 transition-colors mt-2">
                <Plus className="w-5 h-5" /> Log Meal
              </motion.button>
            </motion.form>

            <div className="glass-card rounded-3xl overflow-hidden min-h-[16rem]">
              {foodLogs.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-10 text-slate-400 dark:text-gray-500">
                  <Utensils className="w-12 h-12 mb-3 opacity-50" />
                  <p>No meals logged today</p>
                </div>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/[0.05] max-h-96 overflow-y-auto pr-2 pb-2">
                  <AnimatePresence>
                  {foodLogs.map((log) => (
                    <motion.li initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors flex justify-between items-center group" key={log.id}>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-lg">{log.food_name}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-2 flex gap-4 font-medium uppercase tracking-wider">
                           <span className="text-cyan-600 dark:text-cyan-400">{log.calories} kcal</span>
                           <span>P <strong className="text-slate-800 dark:text-gray-200">{log.protein}</strong></span>
                           <span>F <strong className="text-slate-800 dark:text-gray-200">{log.fats}</strong></span>
                           <span>C <strong className="text-slate-800 dark:text-gray-200">{log.carbs}</strong></span>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleDeleteFood(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0">
                        <X className="w-5 h-5" />
                      </button>
                    </motion.li>
                  ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>

          {/* Weight Tracker */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            <div className="flex items-center gap-2">
               <Scale className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Body Mass Tracking</h2>
            </div>
            
            <motion.form variants={itemVariants} className="glass-card p-6 rounded-3xl flex gap-4 items-end" onSubmit={handleAddWeight}>
              <label className="flex-1 text-xs text-slate-500">Weight (kg) 
                <input type="number" step="0.1" required value={weightForm.weight_kg} onChange={(e) => setWeightForm({weight_kg: e.target.value})} className="mt-1 w-full glass-input rounded-xl p-4 text-lg font-bold" placeholder="0.0" />
              </label>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 font-bold rounded-xl px-8 py-4 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/30 transition-colors">
                Save
              </motion.button>
            </motion.form>

            <div className="glass-card rounded-3xl overflow-hidden min-h-[16rem]">
              {weightLogs.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-10 text-slate-400 dark:text-gray-500">
                  <Scale className="w-12 h-12 mb-3 opacity-50" />
                  <p>No logs recorded</p>
                </div>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/[0.05] max-h-96 overflow-y-auto pr-2 pb-2">
                  <AnimatePresence>
                  {weightLogs.map((log, i) => {
                     const prevW = weightLogs[i+1]?.weight_kg
                     const currW = parseFloat(log.weight_kg)
                     let TrendIcon = Minus
                     let color = "text-slate-400 dark:text-gray-500"
                     if (prevW) {
                         if (currW > prevW) { TrendIcon = TrendingUp; color = "text-emerald-500 dark:text-emerald-400" }
                         else if (currW < prevW) { TrendIcon = TrendingDown; color = "text-indigo-500 dark:text-indigo-400" }
                     }
                     return (
                      <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key={log.id} className="p-5 flex justify-between items-center hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        <div className="flex flex-col">
                          <span className="text-slate-500 dark:text-gray-400 font-medium text-sm">
                            {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          {i === 0 && <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 dark:text-indigo-400 mt-1">Current</span>}
                        </div>
                        <div className="flex items-center gap-4">
                           {prevW && <TrendIcon className={`w-5 h-5 ${color}`} />}
                           <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">{log.weight_kg} <span className="text-sm font-medium text-slate-400 dark:text-gray-500">kg</span></span>
                           <button type="button" onClick={() => handleDeleteWeight(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0 ml-1">
                             <X className="w-5 h-5" />
                           </button>
                        </div>
                      </motion.li>
                     )
                  })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

function MacroCard({ icon: Icon, label, consumed, target, unit, color }) {
  const remaining = Math.max(0, target - consumed)
  const percentage = Math.min(100, Math.round((consumed / target) * 100)) || 0
  const isOver = consumed > target

  const colorMap = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
  }

  const textColorMap = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    orange: 'text-orange-600 dark:text-orange-400',
  }

  return (
    <motion.div variants={itemVariants} className="glass-card p-5 rounded-3xl relative overflow-hidden group hover:border-black/10 dark:hover:border-white/20 transition-colors">
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${colorMap[color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.05] ${textColorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xs font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">{label}</div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{consumed}</span>
          <span className="text-sm text-slate-500 font-medium">/ {target} {unit}</span>
        </div>
      </div>
      
      <div className="h-1.5 w-full bg-black/5 dark:bg-white/[0.05] rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${isOver ? 'bg-red-500' : colorMap[color]}`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
      
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-500">{percentage}%</span>
        {isOver ? (
           <span className="text-red-500 dark:text-red-400">-{consumed - target} {unit} extra</span>
        ) : (
           <span className={`${textColorMap[color]}`}>{remaining} {unit} left</span>
        )}
      </div>
    </motion.div>
  )
}
