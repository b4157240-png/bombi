import { DayLog, MealEntry, UserProfile } from '../types';

// Ключи локального хранилища (имитация коллекций БД)
const USERS_COLLECTION = 'icalorie_db_users';
const LOGS_COLLECTION = 'icalorie_db_logs';

/**
 * D.6 Профиль как корневой документ
 */
export const saveUserProfile = (profile: UserProfile): void => {
  const usersStr = localStorage.getItem(USERS_COLLECTION);
  const users: Record<string, UserProfile> = usersStr ? JSON.parse(usersStr) : {};
  
  users[profile.id] = profile;
  
  localStorage.setItem(USERS_COLLECTION, JSON.stringify(users));
};

export const getUserProfile = (userId: string): UserProfile | null => {
  const usersStr = localStorage.getItem(USERS_COLLECTION);
  if (!usersStr) return null;
  
  const users: Record<string, UserProfile> = JSON.parse(usersStr);
  return users[userId] || null;
};

/**
 * D.4 Структура коллекций, привязанная к UID
 */
export const getDayLogs = (userId: string): DayLog[] => {
  const allLogsStr = localStorage.getItem(LOGS_COLLECTION);
  if (!allLogsStr) return [];

  const allLogs: DayLog[] = JSON.parse(allLogsStr);
  // Фильтрация по user_id (D.5 Архивация и запросы)
  return allLogs.filter(log => log.userId === userId);
};

export const saveMealEntry = (userId: string, entry: MealEntry): DayLog[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  const allLogsStr = localStorage.getItem(LOGS_COLLECTION);
  let allLogs: DayLog[] = allLogsStr ? JSON.parse(allLogsStr) : [];

  // Ищем лог за сегодня для КОНКРЕТНОГО пользователя
  const existingLogIndex = allLogs.findIndex(l => l.date === todayStr && l.userId === userId);

  if (existingLogIndex >= 0) {
    allLogs[existingLogIndex].entries.push(entry);
  } else {
    allLogs.push({
      date: todayStr,
      userId: userId,
      entries: [entry]
    });
  }

  localStorage.setItem(LOGS_COLLECTION, JSON.stringify(allLogs));
  
  // Возвращаем только логи текущего пользователя для обновления UI
  return allLogs.filter(log => log.userId === userId);
};

export const deleteMealEntry = (userId: string, entryId: string): DayLog[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  const allLogsStr = localStorage.getItem(LOGS_COLLECTION);
  if (!allLogsStr) return [];

  let allLogs: DayLog[] = JSON.parse(allLogsStr);
  
  const logIndex = allLogs.findIndex(l => l.date === todayStr && l.userId === userId);
  
  if (logIndex >= 0) {
    allLogs[logIndex].entries = allLogs[logIndex].entries.filter(e => e.id !== entryId);
    localStorage.setItem(LOGS_COLLECTION, JSON.stringify(allLogs));
  }

  return allLogs.filter(log => log.userId === userId);
};