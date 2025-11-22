import { UserProfile } from '../types';
import { getUserProfile, saveUserProfile } from './storage';

const SESSION_KEY = 'icalorie_session_uid';

// Простая генерация UUID для Zero-Cost решения
const generateUID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// A.4 Автоматическое восстановление сеанса
export const getSession = (): string | null => {
    return localStorage.getItem(SESSION_KEY);
};

// A.5 Долгосрочное хранение сеанса
export const setSession = (userId: string) => {
    localStorage.setItem(SESSION_KEY, userId);
};

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const registerUser = (email: string, password: string, profileData: Partial<UserProfile>): UserProfile => {
    // В реальном приложении здесь был бы запрос к Supabase Auth
    // Для Zero-Cost локальной версии мы имитируем создание пользователя
    
    // Проверка на существующий email (имитация)
    const usersStr = localStorage.getItem('icalorie_db_users');
    if (usersStr) {
        const users = JSON.parse(usersStr);
        const exists = Object.values(users).some((u: any) => u.email === email);
        if (exists) throw new Error("Пользователь с таким email уже существует");
    }

    // Сохраняем "credentials" отдельно (очень упрощенно для демо)
    const credsStr = localStorage.getItem('icalorie_auth_creds') || '{}';
    const creds = JSON.parse(credsStr);
    
    const newUid = generateUID();
    
    creds[email] = { password, uid: newUid };
    localStorage.setItem('icalorie_auth_creds', JSON.stringify(creds));

    const newUser: UserProfile = {
        id: newUid,
        email,
        ...profileData as any
    };

    saveUserProfile(newUser);
    setSession(newUid);
    
    return newUser;
};

export const loginUser = (email: string, password: string): UserProfile => {
    const credsStr = localStorage.getItem('icalorie_auth_creds');
    if (!credsStr) throw new Error("Пользователь не найден");

    const creds = JSON.parse(credsStr);
    const userCred = creds[email];

    if (!userCred || userCred.password !== password) {
        throw new Error("Неверный email или пароль");
    }

    const profile = getUserProfile(userCred.uid);
    if (!profile) throw new Error("Профиль пользователя поврежден");

    setSession(userCred.uid);
    return profile;
};