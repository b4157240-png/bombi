
import React from 'react';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export const Analytics: React.FC = () => {
  // Mock data with more realistic values
  const weeklyData = [
    { day: 'Пн', cal: 2100 },
    { day: 'Вт', cal: 1950 },
    { day: 'Ср', cal: 2200 },
    { day: 'Чт', cal: 1800 },
    { day: 'Пт', cal: 2400 },
    { day: 'Сб', cal: 2150 },
    { day: 'Вс', cal: 1900 },
  ];

  const weightData = [
    { day: '1', weight: 75.5 },
    { day: '5', weight: 75.2 },
    { day: '10', weight: 74.8 },
    { day: '15', weight: 74.5 },
    { day: '20', weight: 74.2 },
    { day: '25', weight: 74.0 },
    { day: '30', weight: 73.8 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1C1E]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl">
          <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
          <p className="text-lg font-bold text-white">
            {payload[0].value} 
            <span className="text-xs font-normal text-gray-500 ml-1">
                {payload[0].dataKey === 'cal' ? 'ккал' : 'кг'}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pb-32 pt-6 px-6 max-w-md mx-auto space-y-8 bg-black min-h-screen animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold text-white">Аналитика</h1>
        <p className="text-gray-400">Тренды за 30 дней</p>
      </header>

      <Card title="Калорийность" className="!pb-2">
        <div className="h-52 w-full mt-4 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#ffffff10', radius: 4}} />
              <Bar dataKey="cal" fill="url(#colorCal)" radius={[6, 6, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Вес">
        <div className="h-52 w-full mt-4 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                    <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#30D158" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#30D158" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.5} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#30D158" 
                        strokeWidth={3} 
                        dot={{fill: '#30D158', strokeWidth: 2, r: 4, stroke: '#000'}} 
                        activeDot={{r: 6, stroke: '#fff', strokeWidth: 2}}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center mt-6 px-2 py-3 bg-[#2C2C2E]/50 rounded-xl border border-white/5">
            <div className="text-center">
                <span className="text-xs text-gray-400 block">Начало</span>
                <span className="font-semibold text-white">75.5 кг</span>
            </div>
            <div className="text-center">
                <span className="text-xs text-gray-400 block">Изменение</span>
                <span className="text-[#30D158] font-bold bg-[#30D158]/10 px-2 py-0.5 rounded text-sm">-1.7 кг</span>
            </div>
            <div className="text-center">
                <span className="text-xs text-gray-400 block">Сейчас</span>
                <span className="font-semibold text-white">73.8 кг</span>
            </div>
        </div>
      </Card>

      <div className="bg-gradient-to-br from-[#0A84FF] to-[#007AFF] rounded-[24px] p-6 shadow-lg shadow-blue-900/20 relative overflow-hidden">
        <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                💡 Инсайт
            </h3>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
                Вы выполняете норму по белку 5 из 7 дней! Это отлично помогает восстановлению. Попробуйте немного увеличить сложные углеводы в обед для энергии.
            </p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};
