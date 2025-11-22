export enum Gender {
  MALE = 'Мужской',
  FEMALE = 'Женский'
}

export enum ActivityLevel {
  SEDENTARY = 'Сидячий образ',
  LIGHT = 'Малая активность',
  MODERATE = 'Средняя активность',
  VERY = 'Высокая активность'
}

export interface UserProfile {
  id: string; // UID (A.6)
  email: string;
  name: string;
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isOnboarded: boolean;
}

export interface FoodItem {
  name: string;
  calories: number;
  weight: number; // grams
  protein: number;
  carbs: number;
  fat: number;
}

export type MealType = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус';

export interface MealEntry {
  id: string;
  timestamp: number;
  mealType: MealType;
  items: FoodItem[];
  totalCalories: number;
  image?: string; // Base64 string for display
}

export interface DayLog {
  date: string; // ISO Date string YYYY-MM-DD
  userId: string; // Link to user (D.4)
  entries: MealEntry[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}