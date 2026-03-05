import { create } from 'zustand';
import {
  UserProfile,
  RunLog,
  DayOverride,
  TrainingDay,
  PINState,
  CustomWorkoutType
} from './types';
import { generateSchedule } from './scheduleGenerator';
import { storage } from './storage';
import { STORAGE_KEYS, PREDEFINED_WORKOUT_TYPES } from './constants';

interface AppState {
  // Data
  profile: UserProfile | null;
  completedDates: string[];
  runLogs: Record<string, RunLog>;
  overrides: Record<string, DayOverride>;
  customActivities: string[];
  customWorkoutTypes: CustomWorkoutType[];
  dayNotes: Record<string, string>;
  schedule: TrainingDay[];
  pinState: PINState;

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
  addCustomWorkoutType: (workout: CustomWorkoutType) => Promise<void>;
  updateDayNotes: (date: string, notes: string) => Promise<void>;
  setPIN: (pin: string) => Promise<void>;
  authenticateWithPIN: (pin: string) => boolean;
  logoutPIN: () => void;
  resetAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set: any, get: any) => ({
  // Initial state
  profile: null,
  completedDates: [],
  runLogs: {},
  overrides: {},
  customActivities: [],
  customWorkoutTypes: [],
  dayNotes: {},
  schedule: [],
  pinState: {
    pin: '',
    isSet: false,
    isAuthenticated: false
  },
  isLoading: false,
  isInitialized: false,

  // Initialize - Load data from storage
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [profile, completedDates, runLogs, overrides, customActivities, customWorkoutTypes, dayNotes, pinData, isAuthenticated] = await Promise.all([
        storage.get<UserProfile>(STORAGE_KEYS.PROFILE),
        storage.get<string[]>(STORAGE_KEYS.COMPLETED_DATES),
        storage.get<Record<string, RunLog>>(STORAGE_KEYS.RUN_LOGS),
        storage.get<Record<string, DayOverride>>(STORAGE_KEYS.OVERRIDES),
        storage.get<string[]>(STORAGE_KEYS.CUSTOM_ACTIVITIES),
        storage.get<CustomWorkoutType[]>(STORAGE_KEYS.CUSTOM_WORKOUT_TYPES),
        storage.get<Record<string, string>>(STORAGE_KEYS.DAY_NOTES),
        storage.get<string>(STORAGE_KEYS.PIN),
        storage.get<boolean>(STORAGE_KEYS.PIN_AUTHENTICATED)
      ]);

      const finalProfile = profile || { name: 'Runner', goalTime: '2:00:00', shoeModel: '' };
      const finalCompletedDates = completedDates || [];
      const finalRunLogs = runLogs || {};
      const finalOverrides = overrides || {};
      const finalCustomActivities = customActivities || [];
      const finalCustomWorkoutTypes = customWorkoutTypes && customWorkoutTypes.length > 0 ? customWorkoutTypes : PREDEFINED_WORKOUT_TYPES;
      const finalDayNotes = dayNotes || {};
      const finalPIN = pinData || '';
      const finalIsAuthenticated = isAuthenticated || false;

      const schedule = generateSchedule(finalCompletedDates, finalOverrides);

      set({
        profile: finalProfile,
        completedDates: finalCompletedDates,
        runLogs: finalRunLogs,
        overrides: finalOverrides,
        customActivities: finalCustomActivities,
        customWorkoutTypes: finalCustomWorkoutTypes,
        dayNotes: finalDayNotes,
        schedule,
        pinState: {
          pin: finalPIN,
          isSet: !!finalPIN,
          isAuthenticated: finalIsAuthenticated
        },
        isInitialized: true,
        isLoading: false
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
      ? completedDates.filter((d: string) => d !== date)
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

  // Add custom workout type
  addCustomWorkoutType: async (workout: CustomWorkoutType) => {
    const { customWorkoutTypes } = get();
    if (customWorkoutTypes.find((w: CustomWorkoutType) => w.id === workout.id)) return;

    const newWorkoutTypes = [...customWorkoutTypes, workout];
    try {
      await storage.set(STORAGE_KEYS.CUSTOM_WORKOUT_TYPES, newWorkoutTypes);
      set({ customWorkoutTypes: newWorkoutTypes });
    } catch (error) {
      console.error('Error adding custom workout type:', error);
    }
  },

  // Update day notes
  updateDayNotes: async (date: string, notes: string) => {
    const { dayNotes } = get();
    const newDayNotes = { ...dayNotes, [date]: notes };

    try {
      await storage.set(STORAGE_KEYS.DAY_NOTES, newDayNotes);
      set({ dayNotes: newDayNotes });
    } catch (error) {
      console.error('Error updating day notes:', error);
    }
  },

  // Set PIN
  setPIN: async (pin: string) => {
    try {
      await storage.set(STORAGE_KEYS.PIN, pin);
      set((state: AppState) => ({
        pinState: {
          ...state.pinState,
          pin,
          isSet: true,
          isAuthenticated: true
        }
      }));
    } catch (error) {
      console.error('Error setting PIN:', error);
    }
  },

  // Authenticate with PIN
  authenticateWithPIN: (pin: string) => {
    const { pinState } = get();
    const isValid = pin === pinState.pin;
    
    if (isValid) {
      set((state: AppState) => ({
        pinState: {
          ...state.pinState,
          isAuthenticated: true
        }
      }));
      storage.set(STORAGE_KEYS.PIN_AUTHENTICATED, true);
    }
    
    return isValid;
  },

  // Logout PIN
  logoutPIN: () => {
    set((state: AppState) => ({
      pinState: {
        ...state.pinState,
        isAuthenticated: false
      }
    }));
    storage.set(STORAGE_KEYS.PIN_AUTHENTICATED, false);
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
        customWorkoutTypes: PREDEFINED_WORKOUT_TYPES,
        dayNotes: {},
        schedule,
        pinState: {
          pin: '',
          isSet: false,
          isAuthenticated: false
        }
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  }
}));
