import React from 'react';
import { Home, Plus, BarChart2, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCameraClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onCameraClick }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-[32px] px-6 py-3 flex justify-between items-center z-50">
      
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'dashboard' ? 'text-[#0A84FF]' : 'text-gray-500'}`}
      >
        <Home size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
      </button>

      <button 
        onClick={() => onTabChange('analytics')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'analytics' ? 'text-[#0A84FF]' : 'text-gray-500'}`}
      >
        <BarChart2 size={24} strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
      </button>

      {/* Primary Action Button */}
      <button 
        onClick={onCameraClick}
        className="bg-white text-black p-4 rounded-full shadow-xl shadow-white/10 hover:scale-105 transition-transform active:scale-95 -mt-8 border-4 border-[#000000]"
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      <button 
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'profile' ? 'text-[#0A84FF]' : 'text-gray-500'}`}
      >
        <User size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
      </button>
      
      {/* Placeholder for balance */}
      <div className="w-8" /> 
    </div>
  );
};