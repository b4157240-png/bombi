
import React, { useState } from 'react';
import { UserProfile, ActivityLevel, Gender } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Settings, LogOut, ChevronRight, Target, User as UserIcon, Trash2 } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  onResetApp: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onResetApp }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div className="pb-32 pt-6 px-6 max-w-md mx-auto space-y-6 bg-black min-h-screen animate-in fade-in slide-in-from-bottom-4 duration-300">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Редактирование</h1>
          <button onClick={() => setIsEditing(false)} className="text-[#0A84FF] font-medium">
            Отмена
          </button>
        </header>

        <div className="space-y-6">
          <section className="space-y-4">
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider ml-1">Личные данные</h3>
            <Input 
                label="Имя" 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)} 
            />
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Вес (кг)" 
                    type="number" 
                    value={formData.weight} 
                    onChange={e => handleChange('weight', Number(e.target.value))} 
                />
                <Input 
                    label="Рост (см)" 
                    type="number" 
                    value={formData.height} 
                    onChange={e => handleChange('height', Number(e.target.value))} 
                />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider ml-1">Цели (БЖУ)</h3>
            <Input 
                label="Цель калорий" 
                type="number" 
                value={formData.targetCalories} 
                onChange={e => handleChange('targetCalories', Number(e.target.value))} 
            />
            <div className="grid grid-cols-3 gap-2">
                <Input 
                    label="Белки (г)" 
                    type="number" 
                    value={formData.targetProtein} 
                    onChange={e => handleChange('targetProtein', Number(e.target.value))} 
                />
                <Input 
                    label="Жиры (г)" 
                    type="number" 
                    value={formData.targetFat} 
                    onChange={e => handleChange('targetFat', Number(e.target.value))} 
                />
                <Input 
                    label="Углев. (г)" 
                    type="number" 
                    value={formData.targetCarbs} 
                    onChange={e => handleChange('targetCarbs', Number(e.target.value))} 
                />
            </div>
          </section>

          <Button fullWidth onClick={handleSave} className="mt-8">
            Сохранить изменения
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-6 px-6 max-w-md mx-auto space-y-6 bg-black min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Профиль</h1>
        <button onClick={() => setIsEditing(true)} className="p-2 bg-[#1C1C1E] rounded-full text-[#0A84FF]">
            <Settings size={20} />
        </button>
      </header>

      {/* Main Profile Card */}
      <Card className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5AC8FA] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-gray-400">{user.age} лет • {user.height} см • {user.weight} кг</p>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <Target className="text-[#FF9F0A]" size={24} />
            <span className="text-2xl font-bold text-white">{user.targetCalories}</span>
            <span className="text-xs text-gray-500 uppercase">Цель ккал</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <UserIcon className="text-[#30D158]" size={24} />
            <span className="text-lg font-bold text-white">{user.activityLevel.split(' ')[0]}</span>
            <span className="text-xs text-gray-500 uppercase">Активность</span>
        </Card>
      </div>

      {/* Settings List */}
      <div className="space-y-2">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider ml-1 mb-2">Настройки</h3>
        
        <button 
            onClick={() => setIsEditing(true)}
            className="w-full bg-[#1C1C1E] p-4 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-transform"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#0A84FF]/10 rounded-lg text-[#0A84FF]">
                    <Target size={18} />
                </div>
                <span className="text-white font-medium">Изменить цели</span>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
        </button>

        <button 
            onClick={() => {
                if(window.confirm('Вы уверены, что хотите сбросить все данные? Это действие необратимо.')) {
                    onResetApp();
                }
            }}
            className="w-full bg-[#1C1C1E] p-4 rounded-2xl flex justify-between items-center active:scale-[0.98] transition-transform group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF453A]/10 rounded-lg text-[#FF453A] group-hover:bg-[#FF453A]/20 transition-colors">
                    <Trash2 size={18} />
                </div>
                <span className="text-[#FF453A] font-medium">Сбросить все данные</span>
            </div>
        </button>
      </div>

      {/* Backup / Restore */}
      <div className="space-y-2 mt-6">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider ml-1 mb-2">Резервное копирование</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                const users = localStorage.getItem('icalorie_db_users') || '{}';
                const logs = localStorage.getItem('icalorie_db_logs') || '[]';
                const payload = { users: JSON.parse(users), logs: JSON.parse(logs) };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `icalorie_backup_${new Date().toISOString().slice(0,10)}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                alert('Ошибка при создании резервной копии.');
              }
            }}
            className="flex-1 bg-[#0A84FF] text-white p-3 rounded-2xl"
          >
            Экспортировать историю
          </button>

          <label className="flex-1">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(reader.result as string);
                    // Слияние пользователей
                    const oldUsers = JSON.parse(localStorage.getItem('icalorie_db_users') || '{}');
                    const newUsers = { ...oldUsers, ...(data.users || {}) };
                    localStorage.setItem('icalorie_db_users', JSON.stringify(newUsers));
                    // Слияние логов (уникальные по date+userId)
                    const oldLogs = JSON.parse(localStorage.getItem('icalorie_db_logs') || '[]');
                    const newLogs = Array.isArray(data.logs) ? data.logs : [];
                    const mergedLogs = [...oldLogs];
                    newLogs.forEach(log => {
                      if (!mergedLogs.some(l => l.date === log.date && l.userId === log.userId)) {
                        mergedLogs.push(log);
                      }
                    });
                    localStorage.setItem('icalorie_db_logs', JSON.stringify(mergedLogs));
                    alert('Импорт завершён. Новые записи добавлены. Перезагрузите приложение, чтобы увидеть изменения.');
                  } catch (err) {
                    console.error(err);
                    alert('Некорректный файл импорта.');
                  }
                };
                reader.readAsText(file);
              }}
            />
            <button className="w-full bg-[#1C1C1E] p-3 rounded-2xl border border-white/5">Импортировать JSON</button>
          </label>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-xs text-gray-600">iCalorie v1.0.0 (Zero-Cost Build)</p>
      </div>
    </div>
  );
};
