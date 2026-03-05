export enum Phase {
  PHASE_1 = 'Base Building',
  PHASE_2 = 'Strength & Power',
  PHASE_3 = 'The Taper & Peak'
}

export enum ActivityType {
  EASY_RUN = 'Easy Run',
  LONG_RUN = 'Long Run',
  HILL_REPEATS = 'Hill Repeats',
  STRENGTH = 'Strength Training',
  GYM_WORKOUT = 'Gym Workout',
  REST = 'Rest Day',
  RACE = 'RACE DAY: MELBOURNE HALF MARATHON'
}

export interface TrainingActivity {
  id: string;
  activity: string;
  description: string;
  distanceKm?: number;
  type?: 'standard' | 'custom'; // standard or user-defined
  isCustom?: boolean;
}

export interface CustomWorkoutType {
  id: string;
  name: string;
  category: 'cardio' | 'strength' | 'gym' | 'other';
  description?: string;
  createdAt: string;
}

export interface TrainingDay {
  date: string; // ISO string YYYY-MM-DD
  activities: TrainingActivity[];
  phase: Phase;
  isCompleted: boolean;
  notes?: string; // User notes for the day
}

export interface DayOverride {
  activities: TrainingActivity[];
}

export interface Tip {
  category: 'Shoes' | 'Nutrition' | 'Pacing';
  content: string;
}

export interface UserProfile {
  name: string;
  goalTime: string;
  shoeModel: string;
}

export interface RunLog {
  notes: string;
  actualDistance?: number;
  perceivedEffort: number; // 1-10
  workoutType?: string; // Can be standard or custom
  duration?: number; // Duration in minutes
  timestamp?: string; // ISO timestamp
}

export interface PINState {
  pin: string;
  isSet: boolean;
  isAuthenticated: boolean;
}
