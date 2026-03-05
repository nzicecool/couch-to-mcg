import { Tip, CustomWorkoutType } from './types';

export const RACE_DATE = '2026-10-11';

export const PREDEFINED_WORKOUT_TYPES: CustomWorkoutType[] = [
  { id: 'easy-run', name: 'Easy Run', category: 'cardio', description: 'Low-intensity running', createdAt: new Date().toISOString() },
  { id: 'long-run', name: 'Long Run', category: 'cardio', description: 'Extended distance running', createdAt: new Date().toISOString() },
  { id: 'hill-repeats', name: 'Hill Repeats', category: 'cardio', description: 'High-intensity hill training', createdAt: new Date().toISOString() },
  { id: 'strength', name: 'Strength Training', category: 'strength', description: 'Resistance and bodyweight exercises', createdAt: new Date().toISOString() },
  { id: 'gym', name: 'Gym Workout', category: 'gym', description: 'Gym-based cardio and strength', createdAt: new Date().toISOString() },
  { id: 'rest', name: 'Rest Day', category: 'other', description: 'Recovery day', createdAt: new Date().toISOString() }
];

export const TIPS: Tip[] = [
  { category: 'Shoes', content: 'Never wear brand new shoes on race day. Break them in for at least 50km first.' },
  { category: 'Shoes', content: 'Visit a specialty running store for a gait analysis to find the right support for your feet.' },
  { category: 'Nutrition', content: 'Practice your race-day breakfast during your long Sunday runs.' },
  { category: 'Nutrition', content: 'Stay hydrated throughout the week, not just on the mornings of your runs.' },
  { category: 'Pacing', content: 'Start slow. If you feel like you are going too slow in the first 3km, you are probably at the right pace.' },
  { category: 'Pacing', content: 'Use the "Talk Test": You should be able to hold a conversation during your easy runs.' },
  { category: 'Nutrition', content: 'Post-run recovery starts with a mix of protein and carbohydrates within 30 minutes of finishing.' },
  { category: 'Pacing', content: 'The goal of the long run is time on feet, not speed. Don\'t worry about your pace.' }
];

export const STORAGE_KEYS = {
  PROFILE: 'c2mcg_profile',
  COMPLETED_DATES: 'c2mcg_completed',
  RUN_LOGS: 'c2mcg_logs',
  OVERRIDES: 'c2mcg_overrides',
  CUSTOM_ACTIVITIES: 'c2mcg_activities',
  PIN: 'c2mcg_pin',
  PIN_AUTHENTICATED: 'c2mcg_auth',
  CUSTOM_WORKOUT_TYPES: 'c2mcg_custom_workouts',
  DAY_NOTES: 'c2mcg_day_notes'
};
