import React, { useState } from 'react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { registerUser } from '../services/auth';
import { AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSwitchToLogin }) => {
  const [step, setStep] = useState(0); // Step 0 is Account Creation
  const [error, setError] = useState('');
  
  // Auth Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile Data
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: Gender.MALE,
    activityLevel: ActivityLevel.SEDENTARY
  });

  const calculateMacros = (data: Partial<UserProfile>): Partial<UserProfile> => {
    let bmr = 10 * (data.weight || 70) + 6.25 * (data.height || 170) - 5 * (data.age || 25);
    bmr += data.gender === Gender.MALE ? 5 : -161;

    const activityMultipliers = {
      [ActivityLevel.SEDENTARY]: 1.2,
      [ActivityLevel.LIGHT]: 1.375,
      [ActivityLevel.MODERATE]: 1.55,
      [ActivityLevel.VERY]: 1.725
    };

    const tdee = Math.round(bmr * activityMultipliers[data.activityLevel || ActivityLevel.SEDENTARY]);
    const targetCalories = tdee;

    return {
      targetCalories,
      targetProtein: Math.round((targetCalories * 0.3) / 4),
      targetFat: Math.round((targetCalories * 0.35) / 9),
      targetCarbs: Math.round((targetCalories * 0.35) / 4),
    };
  };

  const handleNext = () => {
    if (step === 0) {
        if (!email || !password) {
            setError("Пожалуйста, заполните email и пароль");
            return;
        }
        setError('');
        setStep(1);
    } else if (step < 3) {
      setStep(s => s + 1);
    } else {
      // Final Step: Register and Complete
      try {
          const finalStats = calculateMacros(formData);
          const fullProfileData = { ...formData, ...finalStats, isOnboarded: true };
          
          const user = registerUser(email, password, fullProfileData);
          onComplete(user);
      } catch (e: any) {
          setError(e.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 bg-black max-w-md mx-auto text-white">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {step === 0 && "Создать аккаунт"}
          {step === 1 && "Знакомство"}
          {step === 2 && "Параметры тела"}
          {step === 3 && "Активность"}
        </h1>
        <p className="text-gray-400">
          {step === 0 && "Ваши данные будут надежно сохранены."}
          {step === 1 && "Как к вам обращаться?"}
          {step === 2 && "Нужно для расчета метаболизма."}
          {step === 3 && "Насколько активный образ жизни вы ведете?"}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        {step === 0 && (
            <>
                <Input 
                    label="Email" 
                    type="email" 
                    placeholder="hello@icalorie.app"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Input 
                    label="Пароль" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
            </>
        )}

        {step === 1 && (
          <Input 
            label="Имя" 
            placeholder="Иван" 
            value={formData.name || ''}
            onChange={e => setFormData({...formData, name: e.target.value})}
            autoFocus
          />
        )}

        {step === 2 && (
          <>
             <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setFormData({...formData, gender: Gender.MALE})}
                  className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${formData.gender === Gender.MALE ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]' : 'border-[#2C2C2E] text-gray-500 bg-[#1C1C1E]'}`}
                >
                  Мужской
                </div>
                <div 
                  onClick={() => setFormData({...formData, gender: Gender.FEMALE})}
                  className={`p-4 rounded-2xl border-2 text-center cursor-pointer transition-all ${formData.gender === Gender.FEMALE ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]' : 'border-[#2C2C2E] text-gray-500 bg-[#1C1C1E]'}`}
                >
                  Женский
                </div>
             </div>
             <Input 
                label="Рост (см)" 
                type="number" 
                value={formData.height || ''} 
                onChange={e => setFormData({...formData, height: Number(e.target.value)})}
             />
             <Input 
                label="Вес (кг)" 
                type="number" 
                value={formData.weight || ''} 
                onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
             />
             <Input 
                label="Возраст" 
                type="number" 
                value={formData.age || ''} 
                onChange={e => setFormData({...formData, age: Number(e.target.value)})}
             />
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-3">
            {Object.values(ActivityLevel).map((level) => (
              <div
                key={level}
                onClick={() => setFormData({...formData, activityLevel: level})}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.activityLevel === level ? 'border-[#0A84FF] bg-[#0A84FF]/10 text-[#0A84FF]' : 'border-[#2C2C2E] text-gray-500 bg-[#1C1C1E]'}`}
              >
                <span className="font-medium">{level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <Button fullWidth onClick={handleNext}>
          {step === 3 ? 'Завершить регистрацию' : 'Далее'}
        </Button>
        {step === 0 && (
            <Button fullWidth variant="ghost" onClick={onSwitchToLogin}>
                Уже есть аккаунт? Войти
            </Button>
        )}
      </div>
    </div>
  );
};