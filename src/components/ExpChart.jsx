import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const ExpChart = ({ currentExp, isDarkMode }) => {
    // Génération de points de données pour simuler la progression
    const data = [
        { name: 'P1', xp: currentExp * 0.2 },
        { name: 'P2', xp: currentExp * 0.5 },
        { name: 'P3', xp: currentExp * 0.8 },
        { name: 'P4', xp: currentExp },
    ];

    return (
        <div className={`mt-auto p-6 rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
            }`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-white/20' : 'text-gray-400'}`}>Courbe de Puissance</p>
            <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="xp"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExp)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ExpChart;