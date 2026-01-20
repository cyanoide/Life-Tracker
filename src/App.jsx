import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Zap, Brain, Dumbbell, CheckCircle2, Star,
  Target, Flame, Sparkles, Trash2, Settings, Clock,
  Heart, User, ShieldCheck, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import AddTask from './components/AddTask';
import ExpChart from './components/ExpChart';

const App = () => {
  const [exp, setExp] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [profile, setProfile] = useState({ id: null, username: 'Héros', avatar_url: null });
  const [hideAfterDays, setHideAfterDays] = useState(7);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const getGameDate = (date) => {
    const d = new Date(date);
    d.setHours(d.getHours() - 5);
    return d.toISOString().split('T')[0];
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: tasksData } = await supabase.from('tasks').select('*');
      if (tasksData) {
        const todayGameDate = getGameDate(new Date());
        const updatedTasks = await Promise.all(tasksData.map(async (task) => {
          if (task.category === 'Quotidien' && task.is_completed && task.last_completed_at) {
            if (getGameDate(new Date(task.last_completed_at)) !== todayGameDate) {
              await supabase.from('tasks').update({ is_completed: false }).eq('title', task.title);
              return { ...task, is_completed: false };
            }
          }
          return task;
        }));
        setTasks(updatedTasks);
      }
      const { data: profileData } = await supabase.from('profiles').select('*').single();
      if (profileData) { setProfile(profileData); setExp(profileData.exp || 0); }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const level = Math.floor(Math.sqrt(exp / 50)) + 1;
  const totalExpForCurrentLevel = Math.pow(level - 1, 2) * 50;
  const totalExpForNextLevel = Math.pow(level, 2) * 50;
  const progress = Math.min(Math.max(((exp - totalExpForCurrentLevel) / (totalExpForNextLevel - totalExpForCurrentLevel)) * 100, 0), 100);

  const toggleTask = async (taskTitle) => {
    const task = tasks.find(t => t.title === taskTitle);
    if (!task) return;
    const newStatus = !task.is_completed;
    const now = new Date();
    let newStreak = task.streak || 0;
    if (newStatus && task.category === 'Quotidien') {
      const today = getGameDate(now);
      const lastDate = task.last_completed_at ? getGameDate(new Date(task.last_completed_at)) : null;
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === getGameDate(yesterday)) newStreak += 1;
      else if (lastDate !== today) newStreak = 1;
    }
    const newExp = newStatus ? exp + task.exp_reward : Math.max(0, exp - task.exp_reward);
    setTasks(prev => prev.map(t => t.title === taskTitle ? { ...t, is_completed: newStatus, streak: newStreak } : t));
    setExp(newExp);
    await supabase.from('tasks').update({ is_completed: newStatus, streak: newStreak, last_completed_at: newStatus ? now.toISOString() : task.last_completed_at }).eq('title', taskTitle);
    if (profile.id) await supabase.from('profiles').update({ exp: newExp }).eq('id', profile.id);
  };

  const deleteTask = async (t) => {
    setTasks(prev => prev.filter(task => task.title !== t));
    await supabase.from('tasks').delete().eq('title', t);
  };

  const statConfig = [
    { name: 'Force', icon: <Dumbbell size={16} />, color: 'from-orange-500 to-red-600' },
    { name: 'Intelligence', icon: <Brain size={16} />, color: 'from-blue-500 to-cyan-400' },
    { name: 'Volonté', icon: <Zap size={16} />, color: 'from-yellow-400 to-orange-500' },
    { name: 'Vitalité', icon: <Heart size={16} />, color: 'from-green-500 to-emerald-400' },
    { name: 'Esprit', icon: <Star size={16} />, color: 'from-purple-500 to-pink-500' },
  ];

  const filtered = tasks.filter(t => !t.is_completed);
  const completed = tasks.filter(t => t.is_completed);

  const TaskCard = ({ task, isArchive = false }) => (
    <motion.div
      layout
      key={task.title}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isArchive ? 0.5 : 1, scale: 1 }}
      className={`group flex items-center justify-between p-5 md:p-6 border rounded-[2rem] transition-all cursor-pointer ${isArchive
        ? (isDarkMode ? 'bg-white/[0.02] border-transparent' : 'bg-gray-50 border-transparent')
        : (isDarkMode ? 'bg-[#16161E] border-white/5 hover:border-blue-500/50' : 'bg-white border-gray-200 hover:border-blue-400 shadow-sm')
        }`}
      onClick={() => toggleTask(task.title)}
    >
      <div className="flex items-center gap-4 md:gap-6">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${task.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-200'
          }`}>
          {task.is_completed && <CheckCircle2 size={16} className="text-white" />}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h4 className={`text-lg font-bold ${task.is_completed ? 'line-through text-gray-400' : (isDarkMode ? 'text-white' : 'text-[#37352F]')}`}>{task.title}</h4>
            {task.streak > 0 && task.category === 'Quotidien' && (
              <span className="flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                <Flame size={12} fill="currentColor" /> {task.streak}
              </span>
            )}
          </div>
          <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded tracking-tighter mt-1 inline-block">
            {task.type}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`font-black ${task.is_completed ? 'text-gray-400' : 'text-blue-500'}`}>+{task.exp_reward} XP</span>
        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.title); }} className="p-2 text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all">
          <Trash2 size={20} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0F0F12] text-white' : 'bg-[#F7F7F5] text-[#37352F]'}`}>

      {/* HEADER MOBILE : NIVEAU GÉANT */}
      <header className={`md:hidden flex items-center justify-between p-6 sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${isDarkMode ? 'bg-[#0F0F12]/80 border-white/5' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-blue-500 overflow-hidden bg-white/5 shadow-xl">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-3 text-white/20" />}
          </div>
          <span className="font-black italic text-xl tracking-tighter">LOOPER</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[10px] font-black text-blue-500 uppercase leading-none mb-1">Niv.</p>
            <p className="text-5xl font-black leading-none">{level}</p>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="opacity-50"><Settings size={28} /></button>
        </div>
      </header>

      {/* SIDEBAR DESKTOP */}
      <aside className={`hidden md:flex w-80 border-r flex-col p-8 sticky top-0 h-screen overflow-y-auto transition-all ${isDarkMode ? 'bg-[#16161E] border-white/5' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-black text-2xl tracking-tighter uppercase italic">Looper</h1>
          <button onClick={() => setShowSettings(!showSettings)} className="text-gray-400 hover:text-white"><Settings size={22} /></button>
        </div>

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-6">
            <div className={`absolute -inset-2 rounded-full blur-md opacity-30 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
            <div className="relative w-28 h-28 rounded-full border-4 border-blue-500 overflow-hidden bg-white/5 shadow-2xl">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={48} className="m-auto mt-7 text-white/20" />}
            </div>
            <div className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full border-4 border-[#16161E] shadow-lg"><ShieldCheck size={16} className="text-white" /></div>
          </div>
          <h3 className="font-black text-2xl tracking-tight">{profile.username}</h3>
        </div>

        <div className="mb-12 bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
          <div className="flex justify-between items-baseline mb-4">
            <span className="text-6xl font-black italic tracking-tighter leading-none">{level}</span>
            <span className="text-xs font-bold opacity-40">{Math.floor(exp % 50)} / 50 XP</span>
          </div>
          <div className={`h-3 w-full rounded-full p-0.5 border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
            <motion.div animate={{ width: `${progress}%` }} className={`h-full rounded-full ${isDarkMode ? 'bg-gradient-to-r from-blue-600 to-purple-700' : 'bg-black'}`} />
          </div>
        </div>

        <div className="space-y-2 mb-10">
          {statConfig.map(s => (
            <div key={s.name} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/[0.03] border-white/[0.05]' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg shadow-black/20`}>{s.icon}</div>
                <span className="text-xs font-bold opacity-70">{s.name}</span>
              </div>
              <span className="text-sm font-black italic">Lvl. {tasks.filter(t => t.type === s.name && t.is_completed).length}</span>
            </div>
          ))}
        </div>
        <ExpChart currentExp={exp} isDarkMode={isDarkMode} />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-16 max-w-6xl mx-auto overflow-y-auto">
        <header className="mb-12 md:mb-16 text-center">
          <div className={`inline-flex items-center gap-2 mb-4 font-black italic uppercase text-[10px] tracking-[0.3em] ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`}>
            <Flame size={18} className="animate-pulse" /> <span>Mode Aventure Actif</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 md:mb-16">Missions</h2>
          <AddTask onTaskAdded={fetchData} isDarkMode={isDarkMode} />
        </header>

        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className={`mb-12 p-8 border rounded-[3rem] flex flex-col gap-8 ${isDarkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white border-gray-200 shadow-xl'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-4 bg-blue-500/20 rounded-2xl"><Clock className="text-blue-500" /></div>
                  <h4 className="font-bold">Archivage auto</h4>
                </div>
                <select value={hideAfterDays} onChange={(e) => setHideAfterDays(parseInt(e.target.value))} className="bg-black text-white rounded-xl px-6 py-4 font-black uppercase text-xs outline-none">
                  <option value={1}>24h</option><option value={3}>3j</option><option value={7}>7j</option>
                </select>
              </div>
              <div className="flex items-center justify-between pt-8 border-t border-white/5">
                <div className="flex items-center gap-4"><div className="p-4 bg-purple-500/20 rounded-2xl">{isDarkMode ? <Moon className="text-purple-400" /> : <Sun className="text-purple-600" />}</div><h4 className="font-bold">Thème</h4></div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`relative w-16 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}><div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${isDarkMode ? 'translate-x-9' : 'translate-x-1'}`} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-12 md:space-y-20 pb-32">
          <section>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-30 flex items-center gap-3 mb-10"><Target size={20} className="text-red-500" /> Objectifs en cours</h3>
            <div className="grid gap-6"><AnimatePresence mode='popLayout'>{filtered.map(t => <TaskCard key={t.title} task={t} />)}</AnimatePresence></div>
          </section>
          {completed.length > 0 && (
            <section className="opacity-40">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-10"><CheckCircle2 size={20} className="text-green-500" /> Objectifs accomplis</h3>
              <div className="grid gap-4"><AnimatePresence mode='popLayout'>{completed.map(t => <TaskCard key={t.title} task={t} isArchive={true} />)}</AnimatePresence></div>
            </section>
          )}
        </div>
      </main>

      {/* MOBILE NAV BAR */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 p-5 border-t flex justify-around items-center backdrop-blur-lg transition-colors ${isDarkMode ? 'bg-[#0F0F12]/90 border-white/10' : 'bg-white/90 border-gray-200 shadow-2xl'}`}>
        {statConfig.map(s => (
          <div key={s.name} className="flex flex-col items-center gap-1">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${s.color} text-white shadow-lg`}>{React.cloneElement(s.icon, { size: 14 })}</div>
            <span className="text-[10px] font-black">{tasks.filter(t => t.type === s.name && t.is_completed).length}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default App;