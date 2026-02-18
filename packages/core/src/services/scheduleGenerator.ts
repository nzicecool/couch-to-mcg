
import { addDays, format, parseISO, isBefore, differenceInDays, differenceInWeeks } from 'date-fns';
import { TrainingDay, ActivityType, Phase, DayOverride, TrainingActivity } from '../types/types';
import { RACE_DATE } from '../constants';

export const generateSchedule = (completedDates: string[], overrides: Record<string, DayOverride> = {}): TrainingDay[] => {
  const startDate = parseISO('2026-02-08');
  const raceDay = parseISO(RACE_DATE);
  
  if (isBefore(raceDay, startDate)) {
    return [];
  }

  const daysUntilRace = differenceInDays(raceDay, startDate);
  const schedule: TrainingDay[] = [];

  for (let i = 0; i <= daysUntilRace; i++) {
    const currentDate = addDays(startDate, i);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday...
    const month = currentDate.getMonth(); // 0-11
    const year = currentDate.getFullYear();
    
    let activity: string = ActivityType.REST;
    let description = 'Take it easy and recover.';
    let distanceKm: number | undefined;
    let currentPhase: Phase = Phase.PHASE_1;

    // Default Logic for single base activity
    if (dateStr === RACE_DATE) {
      activity = ActivityType.RACE;
      distanceKm = 21.1;
      description = "THIS IS IT! The Melbourne Half Marathon. You've got this!";
      currentPhase = Phase.PHASE_3;
    } 
    else if (year === 2026 && month <= 3) {
      currentPhase = Phase.PHASE_1;
      if (dayOfWeek === 2) {
        activity = ActivityType.EASY_RUN;
        distanceKm = 5;
        description = 'Easy effort, focus on form.';
      } else if (dayOfWeek === 4) {
        activity = ActivityType.EASY_RUN;
        distanceKm = 6;
        description = 'Maintain a steady, comfortable pace.';
      } else if (dayOfWeek === 0) {
        activity = ActivityType.LONG_RUN;
        const totalWeeks = differenceInWeeks(parseISO('2026-04-30'), startDate);
        const currentWeek = differenceInWeeks(currentDate, startDate);
        distanceKm = Math.min(10, 6 + (currentWeek / (totalWeeks || 1)) * 4);
        description = 'Build your endurance base. Slow and steady.';
      }
    } 
    else if (year === 2026 && month >= 4 && month <= 6) {
      currentPhase = Phase.PHASE_2;
      if (dayOfWeek === 2) {
        activity = ActivityType.EASY_RUN;
        distanceKm = 7;
        description = 'Recovery pace run.';
      } else if (dayOfWeek === 4) {
        activity = ActivityType.HILL_REPEATS;
        description = 'Find a moderate incline. 60s up, walk down. Repeat 6-8 times.';
      } else if (dayOfWeek === 6) {
        activity = ActivityType.GYM_WORKOUT;
        description = 'Focus on leg strength: Squats, Lunges, and Calf Raises.';
      } else if (dayOfWeek === 0) {
        activity = ActivityType.LONG_RUN;
        const totalWeeks = 13;
        const currentWeek = differenceInWeeks(currentDate, parseISO('2026-05-01'));
        distanceKm = Math.min(16, 10 + (currentWeek / totalWeeks) * 6);
        description = 'Developing strength and stamina.';
      }
    }
    else {
      currentPhase = Phase.PHASE_3;
      const weeksToRace = differenceInWeeks(raceDay, currentDate);
      
      if (weeksToRace <= 1) {
        if (dayOfWeek === 2) {
          activity = ActivityType.EASY_RUN;
          distanceKm = 4;
          description = 'Keep the legs moving, very light.';
        } else if (dayOfWeek === 4) {
          activity = ActivityType.EASY_RUN;
          distanceKm = 3;
          description = 'Pre-race shakeout run.';
        }
      } else {
        if (dayOfWeek === 1) {
          activity = ActivityType.EASY_RUN;
          distanceKm = 8;
          description = 'Aerobic maintenance.';
        } else if (dayOfWeek === 3) {
          activity = ActivityType.EASY_RUN;
          distanceKm = 10;
          description = 'Comfortable pace with light speed play.';
        } else if (dayOfWeek === 5) {
          const weekNum = differenceInWeeks(currentDate, parseISO('2026-08-01'));
          activity = weekNum % 2 === 0 ? ActivityType.GYM_WORKOUT : ActivityType.STRENGTH;
          description = activity === ActivityType.GYM_WORKOUT 
            ? 'Heavy lower body lifting with low reps.' 
            : 'Core stability and single-leg balance work.';
        } else if (dayOfWeek === 0) {
          activity = ActivityType.LONG_RUN;
          const totalWeeks = 10;
          const currentWeek = differenceInWeeks(currentDate, parseISO('2026-08-01'));
          distanceKm = Math.min(21, 16 + (currentWeek / totalWeeks) * 5);
          description = 'Final peak mileage before the big day.';
        }
      }
    }

    let dayActivities: TrainingActivity[] = [{
      id: 'default',
      activity,
      description,
      distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : undefined
    }];

    // Apply Overrides if they exist
    if (overrides[dateStr]) {
      dayActivities = overrides[dateStr].activities;
    }

    schedule.push({
      date: dateStr,
      activities: dayActivities,
      phase: currentPhase,
      isCompleted: completedDates.includes(dateStr)
    });
  }

  return schedule;
};
