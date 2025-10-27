// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Activity Levels
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very_active', label: 'Extra Active', description: 'Very hard exercise & physical job' },
];

// Fitness Goals
export const FITNESS_GOALS = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '📉' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'maintenance', label: 'Maintenance', icon: '⚖️' },
  { value: 'endurance', label: 'Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Exercise Types
export const EXERCISE_TYPES = [
  { value: 'strength', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'balance', label: 'Balance' },
  { value: 'sports', label: 'Sports' },
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'green' },
  { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { value: 'advanced', label: 'Advanced', color: 'red' },
];

// Meal Types
export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

// Equipment Types
export const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
  'bodyweight', 'resistance_band', 'medicine_ball', 'other'
];

// Muscle Groups
export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps',
  'forearms', 'abs', 'obliques', 'quads', 'hamstrings',
  'glutes', 'calves', 'traps', 'lats'
];

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DISPLAY_DATE_FORMAT = 'MMM DD, YYYY';
export const DISPLAY_DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Chart Colors
export const CHART_COLORS = {
  primary: '#4F46E5',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

// BMI Categories
export const BMI_CATEGORIES = [
  { min: 0, max: 18.5, label: 'Underweight', color: 'blue' },
  { min: 18.5, max: 25, label: 'Normal', color: 'green' },
  { min: 25, max: 30, label: 'Overweight', color: 'yellow' },
  { min: 30, max: 100, label: 'Obese', color: 'red' },
];

// Dietary Restrictions
export const DIETARY_RESTRICTIONS = [
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free',
  'nut_free', 'halal', 'kosher', 'low_carb', 'keto'
];

// Common Allergies
export const COMMON_ALLERGIES = [
  'peanuts', 'tree_nuts', 'milk', 'eggs', 'wheat',
  'soy', 'fish', 'shellfish', 'sesame'
];

// Toast Duration
export const TOAST_DURATION = 3000;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_SETUP: '/profile/setup',
  MEASUREMENTS: '/measurements',
  NUTRITION: '/nutrition',
  WORKOUTS: '/workouts',
  PROGRESS: '/progress',
  RECOMMENDATIONS: '/recommendations',
  SETTINGS: '/settings',
};
