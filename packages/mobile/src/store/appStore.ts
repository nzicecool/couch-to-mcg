import { create } from 'zustand';
import {
  UserProfile,
  RunLog,
  DayOverride,
  TrainingDay,
  generateSchedule,
  STORAGE_KEYS,
} from '@couch-to-mcg/core';
import { SQLiteStorageAdapter } from '../storage/SQLiteStorageAdapter';

interface AppState {
  // Data
  profile: UserProfile | null;
  completedDates: string[];
  runLogs: Record<string, RunLog>;
  overrides: Record<string, DayOverride>;
  customActivities: string[];
  schedule: TrainingDay[];

  // UI State
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  toggleCompletion: (date: string) => Promise<void>;
  updateLog: (date: string, log: Partial<RunLog>) => Promise<void>;
  updateOverride: (date: string, override: DayOverride) => Promise<void>;
  addCustomActivity: (activity: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const storage = new SQLiteStorageAdapter();

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  profile: null,
  completedDates: [],
  runLogs: {},
  overrides: {},
  customActivities: [],
  schedule: [],
  isLoading: false,
  isInitialized: false,

  // Initialize - Load data from storage
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [profile, completedDates, runLogs, overrides, customActivities] = await Promise.all([
        storage.get<UserProfile>(STORAGE_KEYS.PROFILE),
        storage.get<string[]>(STORAGE_KEYS.COMPLETED_DATES),
        storage.get<Record<string, RunLog>>(STORAGE_KEYS.RUN_LOGS),
        storage.get<Record<string, DayOverride>>(STORAGE_KEYS.OVERRIDES),
        storage.get<string[]>(STORAGE_KEYS.CUSTOM_ACTIVITIES),
      ]);

      const finalProfile = profile || { name: 'Runner', goalTime: '2:00:00', shoeModel: '' };
      const finalCompletedDates = completedDates || [];
      const finalRunLogs = runLogs || {};
      const finalOverrides = overrides || {};
      const finalCustomActivities = customActivities || [];

      const schedule = generateSchedule(finalCompletedDates, finalOverrides);

      set({
        profile: finalProfile,
        completedDates: finalCompletedDates,
        runLogs: finalRunLogs,
        overrides: finalOverrides,
        customActivities: finalCustomActivities,
        schedule,
        isInitialized: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing app:', error);
      set({ isLoading: false, isInitialized: true });
    }
  },

  // Update profile
  updateProfile: async (profile: UserProfile) => {
    try {
      await storage.set(STORAGE_KEYS.PROFILE, profile);
      set({ profile });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  },

  // Toggle completion status
  toggleCompletion: async (date: string) => {
    const { completedDates, overrides } = get();
    const newCompletedDates = completedDates.includes(date)
      ? completedDates.filter(d => d !== date)
      : [...completedDates, date];

    try {
      await storage.set(STORAGE_KEYS.COMPLETED_DATES, newCompletedDates);
      const schedule = generateSchedule(newCompletedDates, overrides);
      set({ completedDates: newCompletedDates, schedule });
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  },

  // Update run log
  updateLog: async (date: string, log: Partial<RunLog>) => {
    const { runLogs } = get();
    const existingLog = runLogs[date] || { notes: '', perceivedEffort: 5 };
    const newLog = { ...existingLog, ...log };
    const newRunLogs = { ...runLogs, [date]: newLog };

    try {
      await storage.set(STORAGE_KEYS.RUN_LOGS, newRunLogs);
      set({ runLogs: newRunLogs });
    } catch (error) {
      console.error('Error updating log:', error);
    }
  },

  // Update day override
  updateOverride: async (date: string, override: DayOverride) => {
    const { overrides, completedDates } = get();
    const newOverrides = { ...overrides, [date]: override };

    try {
      await storage.set(STORAGE_KEYS.OVERRIDES, newOverrides);
      const schedule = generateSchedule(completedDates, newOverrides);
      set({ overrides: newOverrides, schedule });
    } catch (error) {
      console.error('Error updating override:', error);
    }
  },

  // Add custom activity
  addCustomActivity: async (activity: string) => {
    const { customActivities } = get();
    if (customActivities.includes(activity)) return;

    const newCustomActivities = [...customActivities, activity];
    try {
      await storage.set(STORAGE_KEYS.CUSTOM_ACTIVITIES, newCustomActivities);
      set({ customActivities: newCustomActivities });
    } catch (error) {
      console.error('Error adding custom activity:', error);
    }
  },

  // Reset all data
  resetAllData: async () => {
    try {
      await storage.clear();
      const defaultProfile = { name: 'Runner', goalTime: '2:00:00', shoeModel: '' };
      const schedule = generateSchedule([], {});
      
      set({
        profile: defaultProfile,
        completedDates: [],
        runLogs: {},
        overrides: {},
        customActivities: [],
        schedule,
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },
}));
