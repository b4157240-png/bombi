import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { loginUser } from '../services/auth';
import { UserProfile } from '../types';
import { AlertCircle } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: (user: UserProfile) => void;
    onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        try {
            setError('');
            const user = loginUser(email, password);
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || "Ошибка входа");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center p-6 bg-black max-w-md mx-auto text-white">
            <div className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-2">С возвращением</h1>
                <p className="text-gray-400">Введите данные для входа в iCalorie</p>
            </div>

            <div className="flex-1 flex flex-col gap-6">
                <Input 
                    label="Email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                />
                <Input 
                    label="Пароль" 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                />
                
                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-4">
                <Button fullWidth onClick={handleLogin}>
                    Войти
                </Button>
                <Button fullWidth variant="ghost" onClick={onSwitchToRegister}>
                    Нет аккаунта? Зарегистрироваться
                </Button>
            </div>
        </div>
    );
};