
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
}

export interface TrainingDay {
  date: string; // ISO string YYYY-MM-DD
  activities: TrainingActivity[];
  phase: Phase;
  isCompleted: boolean;
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
}
