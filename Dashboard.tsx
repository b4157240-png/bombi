
import React, { useRef, useState, useEffect } from 'react';
import { UserProfile, DayLog, MealEntry } from '../types';
import { Card } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, Droplet, Wheat, Drumstick, Trash2, ArrowRight } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  todayLog: DayLog;
  onDeleteEntry: (id: string) => void;
}

interface SwipeableMealCardProps {
  entry: MealEntry;
  onDelete: () => void;
}

// Внутренний компонент для свайпа карточки
const SwipeableMealCard: React.FC<SwipeableMealCardProps> = ({ entry, onDelete }) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentOffset = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchX = e.touches[0].clientX;
    const diff = touchX - startX.current;
    
    // Разрешаем свайп только влево (отрицательный diff)
    if (diff < 0) {
      // Ограничиваем максимальный свайп для визуального эффекта
      const newOffset = Math.max(diff, -150); 
      setOffset(newOffset);
      currentOffset.current = newOffset;
    }
  };

  const handleTouchEnd = () => {
    // Если свайпнули больше чем на 80px, оставляем открытым или удаляем
    if (currentOffset.current < -80) {
      setOffset(-80); // Показываем кнопку удаления
    } else {
      setOffset(0); // Возвращаем назад
    }
  };

  const handleReset = () => {
      setOffset(0);
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] mb-4 group">
        {/* Задний фон с кнопкой удаления */}
        <div className="absolute inset-0 flex justify-end">
            <button 
                onClick={onDelete}
                className="w-24 bg-[#FF453A] flex items-center justify-center h-full text-white rounded-r-[24px]"
            >
                <Trash2 size={24} />
            </button>
        </div>

        {/* Свайпаемая карточка */}
        <div 
            className="relative z-10 transition-transform duration-300 ease-out bg-[#1C1C1E]"
            style={{ transform: `translateX(${offset}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleReset}
        >
            <Card className="!p-4 !mb-0 !border-none rounded-[24px] bg-[#1C1C1E] pointer-events-none active:scale-[0.98] transition-transform">
              <div className="flex gap-4">
                {entry.image ? (
                   <img src={entry.image} alt="meal" className="w-16 h-16 rounded-xl object-cover bg-gray-800 shadow-inner" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center text-2xl shadow-inner">🍽️</div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                       <h4 className="font-bold text-white text-[17px] leading-tight">{entry.mealType}</h4>
                       <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                         {entry.items.map(i => i.name).join(', ')}
                       </p>
                    </div>
                    <span className="font-bold text-white bg-white/10 px-2 py-1 rounded-lg text-xs">{entry.totalCalories}</span>
                  </div>
                  <div className="mt-3 flex gap-3 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#0A84FF]" />{entry.items.reduce((a,b)=>a+b.protein,0)}г</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />{entry.items.reduce((a,b)=>a+b.fat,0)}г</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" />{entry.items.reduce((a,b)=>a+b.carbs,0)}г</span>
                  </div>
                </div>
              </div>
            </Card>
        </div>
    </div>
  );
};


export const Dashboard: React.FC<DashboardProps> = ({ user, todayLog, onDeleteEntry }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');
  }, []);

  const consumedCalories = todayLog.entries.reduce((sum, entry) => sum + entry.totalCalories, 0);
  const consumedProtein = todayLog.entries.reduce((sum, entry) => sum + entry.items.reduce((is, i) => is + i.protein, 0), 0);
  const consumedCarbs = todayLog.entries.reduce((sum, entry) => sum + entry.items.reduce((is, i) => is + i.carbs, 0), 0);
  const consumedFat = todayLog.entries.reduce((sum, entry) => sum + entry.items.reduce((is, i) => is + i.fat, 0), 0);

  const remaining = user.targetCalories - consumedCalories;

  const macroData = [
    { name: 'Protein', value: consumedProtein, color: '#0A84FF' }, // iOS Blue
    { name: 'Carbs', value: consumedCarbs, color: '#FF9F0A' },     // iOS Orange
    { name: 'Fat', value: consumedFat, color: '#30D158' },         // iOS Green
  ];
  
  // If empty, add a placeholder for chart visualization
  const chartData = macroData.every(d => d.value === 0) 
    ? [{ name: 'Empty', value: 1, color: '#2C2C2E' }] 
    : macroData;

  // Simple progress bar component internal
  const MacroBar = ({ label, current, target, color, icon: Icon }: any) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-medium text-gray-400">
        <div className="flex items-center gap-1.5"><Icon size={14} /> {label}</div>
        <span>{Math.round(current)} / {Math.round(target)}г</span>
      </div>
      <div className="h-2 w-full bg-[#2C2C2E] rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]"
          style={{ 
            width: `${Math.min((current / target) * 100, 100)}%`, 
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="pb-32 pt-6 px-6 max-w-md mx-auto space-y-8 bg-black min-h-screen animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-gray-400 font-medium text-sm uppercase tracking-wider mb-1">{greeting}, {user.name.split(' ')[0]}</p>
          <h1 className="text-3xl font-bold text-white">Сегодня</h1>
        </div>
        <div className="text-right">
           <span className={`text-2xl font-bold ${remaining < 0 ? 'text-[#FF453A]' : 'text-white'}`}>
             {Math.abs(remaining)}
           </span>
           <span className="text-xs text-gray-500 block uppercase font-medium">
             {remaining >= 0 ? 'Осталось ккал' : 'Избыток ккал'}
           </span>
        </div>
      </header>

      {/* Main Ring Card */}
      <Card className="relative overflow-hidden border border-white/5 !bg-[#1C1C1E]">
        <div className="flex items-center justify-between gap-6">
          <div className="relative w-36 h-36">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={[{ value: 1 }]} 
                   dataKey="value" 
                   cx="50%" cy="50%" 
                   innerRadius={52} 
                   outerRadius={60} 
                   fill="#2C2C2E" 
                   stroke="none" 
                 />
                 <Pie
                   data={chartData}
                   cx="50%" cy="50%"
                   innerRadius={52}
                   outerRadius={60}
                   paddingAngle={5}
                   dataKey="value"
                   cornerRadius={4}
                   stroke="none"
                 >
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Flame size={24} className="text-white/80 mb-1 drop-shadow-lg" fill={consumedCalories > 0 ? "#FF9F0A" : "transparent"} stroke={consumedCalories > 0 ? "none" : "currentColor"} />
                <span className="text-2xl font-bold text-white tracking-tight">{Math.round(consumedCalories)}</span>
                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Ккал</span>
             </div>
          </div>

          <div className="flex-1 space-y-5">
            <MacroBar label="Белки" current={consumedProtein} target={user.targetProtein} color="#0A84FF" icon={Drumstick} />
            <MacroBar label="Углеводы" current={consumedCarbs} target={user.targetCarbs} color="#FF9F0A" icon={Wheat} />
            <MacroBar label="Жиры" current={consumedFat} target={user.targetFat} color="#30D158" icon={Droplet} />
          </div>
        </div>
      </Card>

      {/* Food Log */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Дневник питания
            <span className="text-xs font-normal text-gray-500 bg-[#2C2C2E] px-2 py-1 rounded-md">{todayLog.entries.length}</span>
        </h2>
        
        {todayLog.entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-[#1C1C1E] rounded-[24px] border border-dashed border-white/10">
            <div className="w-16 h-16 bg-[#2C2C2E] rounded-full flex items-center justify-center mb-4">
                <Flame className="text-gray-500" size={24} />
            </div>
            <p className="text-gray-400 font-medium">Пока пусто</p>
            <p className="text-xs text-gray-600 mt-1 max-w-[200px] text-center">Нажмите кнопку +, чтобы отсканировать еду</p>
          </div>
        ) : (
          <div className="space-y-3">
             {[...todayLog.entries].reverse().map(entry => (
                <SwipeableMealCard 
                    key={entry.id} 
                    entry={entry} 
                    onDelete={() => onDeleteEntry(entry.id)} 
                />
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
