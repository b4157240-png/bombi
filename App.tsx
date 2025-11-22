import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { Scanner } from './pages/Scanner';
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
import { Profile } from './pages/Profile';
import { BottomNav } from './components/BottomNav';
import { UserProfile, DayLog, MealEntry } from './types';
import { getSession, clearSession } from './services/auth';
import { getUserProfile, saveUserProfile, getDayLogs, saveMealEntry, deleteMealEntry } from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // A.4 Автоматическое восстановление сеанса
  useEffect(() => {
    const initApp = () => {
        const userId = getSession();
        if (userId) {
            const profile = getUserProfile(userId);
            if (profile) {
                setUser(profile);
                const userLogs = getDayLogs(userId);
                setLogs(userLogs);
            } else {
                clearSession();
            }
        }
        setIsLoading(false);
    };
    initApp();
  }, []);

  const handleAuthSuccess = (profile: UserProfile) => {
    setUser(profile);
    const userLogs = getDayLogs(profile.id);
    setLogs(userLogs);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    saveUserProfile(updatedUser);
    setUser(updatedUser);
  };

  const handleResetApp = () => {
    // В реальном приложении это удалило бы аккаунт
    // Здесь просто выход
    clearSession();
    setUser(null);
    setLogs([]);
    setAuthMode('login');
  };

  const handleSaveMeal = (entryData: Omit<MealEntry, 'id' | 'timestamp'>) => {
    if (!user) return;

    const newEntry: MealEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      ...entryData
    };

    // D.4 Сохранение в коллекцию пользователя
    const updatedLogs = saveMealEntry(user.id, newEntry);
    setLogs(updatedLogs);

    setIsCameraOpen(false);
    setActiveTab('dashboard');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!user) return;
    const updatedLogs = deleteMealEntry(user.id, entryId);
    setLogs(updatedLogs);
  };

  const getTodayLog = (): DayLog => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logs.find(l => l.date === todayStr) || { date: todayStr, userId: user?.id || '', entries: [] };
  };

  if (isLoading) {
      return <div className="min-h-screen bg-black flex items-center justify-center text-white">Загрузка...</div>;
  }

  // Auth Flow
  if (!user) {
    if (authMode === 'login') {
        return (
            <Login 
                onLoginSuccess={handleAuthSuccess} 
                onSwitchToRegister={() => setAuthMode('register')} 
            />
        );
    } else {
        return (
            <Onboarding 
                onComplete={handleAuthSuccess} 
                onSwitchToLogin={() => setAuthMode('login')} 
            />
        );
    }
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#0A84FF] selection:text-white overflow-x-hidden">
        
        <main className="min-h-screen">
          {activeTab === 'dashboard' && (
            <Dashboard 
                user={user} 
                todayLog={getTodayLog()} 
                onDeleteEntry={handleDeleteEntry} 
            />
          )}
          {activeTab === 'analytics' && (
            <Suspense fallback={<div className="p-6 text-center text-gray-400">Загрузка аналитики...</div>}>
              <Analytics />
            </Suspense>
          )}
          {activeTab === 'profile' && (
            <Profile 
                user={user} 
                onUpdateUser={handleUpdateUser} 
                onResetApp={handleResetApp}
            />
          )}
        </main>

        {isCameraOpen && (
          <Scanner 
            onSave={handleSaveMeal} 
            onCancel={() => setIsCameraOpen(false)} 
          />
        )}

        {!isCameraOpen && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onCameraClick={() => setIsCameraOpen(true)} 
          />
        )}
      </div>
    </HashRouter>
  );
};

export default App;