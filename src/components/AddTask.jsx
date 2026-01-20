import React, { useState } from 'react';
import { Plus, Loader2, Dumbbell, Brain, Zap, Heart, Star, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AddTask = ({ onTaskAdded, isDarkMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Force');
    const [category, setCategory] = useState('Quotidien');
    const [exp, setExp] = useState(10);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsLoading(true);
        try {
            const { error } = await supabase.from('tasks').insert([{
                title, type, exp_reward: parseInt(exp), category, is_completed: false
            }]);
            if (error) throw error;
            setTitle(''); setIsExpanded(false);
            if (onTaskAdded) await onTaskAdded();
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    if (!isExpanded) {
        return (
            <div
                onClick={() => setIsExpanded(true)}
                className={`mb-12 p-5 rounded-[2.5rem] border-2 border-dashed cursor-pointer flex items-center gap-4 transition-all hover:scale-[1.01] ${isDarkMode ? 'border-white/10 hover:border-blue-500/40 bg-white/[0.02]' : 'border-gray-200 hover:border-blue-400 bg-gray-50'
                    }`}
            >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                    <Plus size={20} className={isDarkMode ? 'text-white/40' : 'text-gray-400'} />
                </div>
                <span className={`font-bold text-lg ${isDarkMode ? 'text-white/20' : 'text-gray-400'}`}>Ajouter une nouvelle quête...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`mb-12 p-8 rounded-[3rem] border shadow-2xl animate-in zoom-in duration-300 ${isDarkMode ? 'bg-[#16161E] border-white/5 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200/50'
            }`}>
            <input
                autoFocus
                placeholder="Quelle est ta prochaine mission ?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-2xl font-black mb-10 outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#37352F]'}`}
            />

            <div className="flex flex-wrap items-center gap-5">
                {/* Type de Stat */}
                <div className="flex-1 min-w-[180px] relative">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`w-full p-4 rounded-2xl font-bold appearance-none outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <option value="Force">💪 Force</option>
                        <option value="Intelligence">🧠 Intelligence</option>
                        <option value="Volonté">⚡ Volonté</option>
                        <option value="Vitalité">🥗 Vitalité</option>
                        <option value="Esprit">✨ Esprit</option>
                    </select>
                </div>

                {/* Fréquence */}
                <div className="flex-1 min-w-[180px]">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full p-4 rounded-2xl font-bold appearance-none outline-none border transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <option value="Quotidien">📅 Quotidien</option>
                        <option value="Ponctuel">✨ Ponctuel</option>
                    </select>
                </div>

                {/* Récompense XP */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                    <span className="text-xs font-black uppercase tracking-widest">XP</span>
                    <input
                        type="number"
                        value={exp}
                        onChange={(e) => setExp(e.target.value)}
                        className="w-12 bg-transparent font-black text-xl outline-none"
                    />
                </div>

                {/* Boutons d'action */}
                <div className="w-full lg:w-auto flex items-center gap-3 ml-auto pt-4 lg:pt-0">
                    <button type="button" onClick={() => setIsExpanded(false)} className="px-6 py-4 font-bold text-gray-400 hover:text-gray-600">Annuler</button>
                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Lancer</>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddTask;