import React, { useState } from 'react';
import { Plus, Loader2, Sparkles } from 'lucide-react';
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
                className={`mb-8 p-6 rounded-[2.5rem] border-2 border-dashed cursor-pointer flex items-center justify-center gap-4 transition-all hover:scale-[1.01] ${isDarkMode ? 'border-white/10 hover:border-blue-500/40 bg-white/[0.02]' : 'border-gray-200 hover:border-blue-400 bg-gray-50'
                    }`}
            >
                <Plus size={24} className={isDarkMode ? 'text-white/20' : 'text-gray-400'} />
                <span className={`font-black text-lg md:text-xl tracking-tight ${isDarkMode ? 'text-white/20' : 'text-gray-400'}`}>Lancer une mission...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`mb-12 p-6 md:p-10 rounded-[3rem] border shadow-2xl animate-in zoom-in duration-300 w-full mx-auto ${isDarkMode ? 'bg-[#16161E] border-white/5 shadow-black/40' : 'bg-white border-gray-100 shadow-gray-200/50'
            }`}>
            {/* Texte adapté pour éviter la coupure sur mobile */}
            <h3 className={`text-center font-black text-xl md:text-2xl mb-8 tracking-tight leading-tight px-2 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                Quelle est ta prochaine mission ?
            </h3>

            <input
                autoFocus
                placeholder="Ex: Séance de sport..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-center text-2xl md:text-3xl font-black mb-10 outline-none bg-transparent ${isDarkMode ? 'text-white' : 'text-[#37352F]'}`}
            />

            <div className="flex flex-col gap-6 max-w-md mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`p-4 rounded-2xl font-black text-sm appearance-none outline-none border transition-all text-center cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-gray-100 text-gray-700'
                            }`}
                    >
                        <option value="Force">💪 Force</option>
                        <option value="Intelligence">🧠 Intelligence</option>
                        <option value="Volonté">⚡ Volonté</option>
                        <option value="Vitalité">🥗 Vitalité</option>
                        <option value="Esprit">✨ Esprit</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`p-4 rounded-2xl font-black text-sm appearance-none outline-none border transition-all text-center cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-gray-50 border-gray-100 text-gray-700'
                            }`}
                    >
                        <option value="Quotidien">📅 Quotidien</option>
                        <option value="Ponctuel">✨ Ponctuel</option>
                    </select>
                </div>

                {/* Bloc XP parfaitement centré */}
                <div className="flex justify-center w-full">
                    <div className={`flex items-center gap-4 px-10 py-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                        <span className="text-xs font-black uppercase tracking-widest">XP</span>
                        <input
                            type="number"
                            value={exp}
                            onChange={(e) => setExp(e.target.value)}
                            className="w-16 bg-transparent font-black text-3xl outline-none text-center"
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full pt-4">
                    <button type="button" onClick={() => setIsExpanded(false)} className="w-full md:flex-1 px-6 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">
                        Annuler
                    </button>
                    <button type="submit" disabled={isLoading} className="w-full md:flex-[2] px-10 py-5 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> LANCER</>}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddTask;