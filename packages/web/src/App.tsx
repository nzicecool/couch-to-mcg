import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isAfter, isBefore, subDays, startOfDay, endOfDay } from 'date-fns';
import { Tip, ActivityType, TrainingActivity } from '@couch-to-mcg/core';
import { TIPS } from '@couch-to-mcg/core';
import { useAppStore } from './store/appStore';

const App: React.FC = () => {
  const {
    profile,
    completedDates,
    runLogs,
    overrides,
    customActivities,
    schedule,
    isLoading,
    isInitialized,
    initialize,
    updateProfile,
    toggleCompletion,
    updateLog,
    updateOverride,
    addCustomActivity,
    resetAllData,
  } = useAppStore();

  // UI States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editingPlanDate, setEditingPlanDate] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState<Tip>(TIPS[0]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newCustomActivityName, setNewCustomActivityName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Tip rotation
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * TIPS.length);
      setCurrentTip(TIPS[randomIndex]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleResetAllData = async () => {
    await resetAllData();
    setShowResetConfirm(false);
    setIsEditingProfile(false);
  };

  // Logic to handle multiple activity management
  const addActivitySlot = (date: string) => {
    const day = schedule.find(d => d.date === date);
    if (!day) return;

    const currentActivities = overrides[date]?.activities || day.activities;
    const newActivity: TrainingActivity = {
      id: Math.random().toString(36).substr(2, 9),
      activity: ActivityType.EASY_RUN,
      description: 'New activity for today.',
      distanceKm: undefined
    };

    updateOverride(date, {
      activities: [...currentActivities, newActivity]
    });
  };

  const removeActivitySlot = (date: string, id: string) => {
    const day = schedule.find(d => d.date === date);
    if (!day) return;

    const currentActivities = overrides[date]?.activities || day.activities;
    if (currentActivities.length <= 1) return;

    updateOverride(date, {
      activities: currentActivities.filter(a => a.id !== id)
    });
  };

  const updateActivitySlot = (date: string, id: string, updates: Partial<TrainingActivity>) => {
    const day = schedule.find(d => d.date === date);
    if (!day) return;

    const currentActivities = [...(overrides[date]?.activities || day.activities)];
    const index = currentActivities.findIndex(a => a.id === id);
    if (index === -1) return;

    currentActivities[index] = { ...currentActivities[index], ...updates };

    updateOverride(date, {
      activities: currentActivities
    });
  };

  const handleSavePlanChanges = () => {
    if (editingPlanDate && isAddingCustom && newCustomActivityName.trim()) {
      const name = newCustomActivityName.trim();
      if (!customActivities.includes(name) && !Object.values(ActivityType as any).includes(name)) {
        addCustomActivity(name);
      }
    }
    setEditingPlanDate(null);
    setIsAddingCustom(false);
    setNewCustomActivityName('');
  };

  const todayTask = schedule.find(day => isToday(parseISO(day.date)));
  
  const totalRuns = schedule.filter(d => d.activities.some(a => a.activity !== ActivityType.REST)).length;
  const completedRunsCount = completedDates.filter(date => {
    const day = schedule.find(d => d.date === date);
    return day && day.activities.some(a => a.activity !== ActivityType.REST);
  }).length;
  
  const progressPercent = totalRuns > 0 ? Math.round((completedRunsCount / totalRuns) * 100) : 0;

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 6)); 
    
    const weeklyDays = schedule.filter(day => {
      const d = parseISO(day.date);
      return (isAfter(d, sevenDaysAgo) || isToday(d)) && !isAfter(d, endOfDay(now)) && day.activities.some(a => a.activity !== ActivityType.REST);
    });

    const completedWeekly = weeklyDays.filter(day => day.isCompleted);
    const totalDistance = completedWeekly.reduce((sum, day) => 
      sum + day.activities.reduce((dSum, a) => dSum + (a.distanceKm || 0), 0)
    , 0);
    
    const efforts = completedWeekly
      .map(day => runLogs[day.date]?.perceivedEffort)
      .filter((e): e is number => e !== undefined);
    
    const avgEffort = efforts.length > 0 
      ? (efforts.reduce((a, b) => a + b, 0) / efforts.length).toFixed(1)
      : '0';

    return {
      distance: totalDistance.toFixed(1),
      completedCount: completedWeekly.length,
      totalScheduled: weeklyDays.length,
      avgEffort
    };
  }, [schedule, runLogs]);

  const allTimeStats = useMemo(() => {
    const completedDays = schedule.filter(d => d.isCompleted);
    const totalDist = completedDays.reduce((sum, d) => 
      sum + d.activities.reduce((dSum, a) => dSum + (a.distanceKm || 0), 0)
    , 0);
    
    const longest = Math.max(...completedDays.map(d => 
      d.activities.reduce((dSum, a) => dSum + (a.distanceKm || 0), 0)
    ), 0);
    
    const sessionCount = completedDays.filter(d => d.activities.some(a => a.activity !== ActivityType.REST)).length;

    return {
      totalDistance: totalDist.toFixed(1),
      longestRun: longest.toFixed(1),
      totalSessions: sessionCount
    };
  }, [schedule]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="mt-4 text-xl text-slate-600">Loading your training plan...</p>
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Couch to MCG</h1>
        <p className="text-xl text-slate-600">Plan Error: Start date must be before October 11, 2026.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white pt-10 pb-28 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left flex items-center gap-4">
            <div 
              onClick={() => setIsEditingProfile(true)}
              className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-2xl font-black cursor-pointer hover:scale-105 transition-transform border-4 border-white/10"
            >
              {profile?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                HI, {profile?.name.toUpperCase()}
                <button onClick={() => setIsEditingProfile(true)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </h1>
              <p className="text-sm text-slate-400 mt-1">Goal: {profile?.goalTime} Half Marathon</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-5xl font-black text-emerald-400">{progressPercent}%</div>
            <p className="text-sm text-slate-400 mt-1">{completedRunsCount} / {totalRuns} runs complete</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 -mt-20">
        {/* Today's Task Card */}
        {todayTask && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border-4 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-slate-900">TODAY</h2>
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {format(parseISO(todayTask.date), 'EEE, MMM d')}
              </span>
            </div>
            
            {todayTask.activities.map((activity, index) => (
              <div key={activity.id || index} className="mb-4 pb-4 border-b border-slate-200 last:border-0">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{activity.activity}</h3>
                <p className="text-slate-600 mb-2">{activity.description}</p>
                {activity.distanceKm && (
                  <p className="text-lg font-semibold text-emerald-600">{activity.distanceKm} km</p>
                )}
              </div>
            ))}

            <button
              onClick={() => toggleCompletion(todayTask.date)}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                todayTask.isCompleted
                  ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
              }`}
            >
              {todayTask.isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Weekly Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Distance</span>
                <span className="text-2xl font-black text-emerald-600">{weeklyStats.distance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Completed</span>
                <span className="text-2xl font-black text-slate-900">{weeklyStats.completedCount} / {weeklyStats.totalScheduled}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Avg Effort</span>
                <span className="text-2xl font-black text-blue-600">{weeklyStats.avgEffort} / 10</span>
              </div>
            </div>
          </div>

          {/* All-Time Stats */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">All-Time</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Distance</span>
                <span className="text-2xl font-black text-emerald-600">{allTimeStats.totalDistance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Longest Run</span>
                <span className="text-2xl font-black text-purple-600">{allTimeStats.longestRun} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Sessions</span>
                <span className="text-2xl font-black text-slate-900">{allTimeStats.totalSessions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md p-6 mb-6 text-white">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wide mb-1">{currentTip.category} Tip</h4>
              <p className="text-white/90">{currentTip.content}</p>
            </div>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Upcoming Schedule</h3>
          <div className="space-y-2">
            {schedule.slice(0, 7).map((day) => {
              const date = parseISO(day.date);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={day.date}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                    isTodayDate ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-slate-50 hover:bg-slate-100'
                  } ${day.isCompleted ? 'opacity-60' : ''}`}
                  onClick={() => toggleCompletion(day.date)}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center w-12">
                      <div className="text-xs font-semibold text-slate-500">{format(date, 'EEE')}</div>
                      <div className="text-xl font-black text-slate-900">{format(date, 'd')}</div>
                    </div>
                    <div>
                      {day.activities.map((activity, index) => (
                        <div key={activity.id || index}>
                          <div className="font-semibold text-slate-900">{activity.activity}</div>
                          {activity.distanceKm && (
                            <div className="text-sm text-emerald-600">{activity.distanceKm} km</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {day.isCompleted && (
                    <div className="text-2xl text-emerald-500">✓</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            Reset All Data
          </button>
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Reset All Data?</h3>
            <p className="text-slate-600 mb-6">This will permanently delete all your progress, logs, and customizations. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-lg font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllData}
                className="flex-1 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isEditingProfile && profile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => updateProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Goal Time</label>
                <input
                  type="text"
                  value={profile.goalTime}
                  onChange={(e) => updateProfile({ ...profile, goalTime: e.target.value })}
                  placeholder="e.g., 2:00:00"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Shoe Model</label>
                <input
                  type="text"
                  value={profile.shoeModel}
                  onChange={(e) => updateProfile({ ...profile, shoeModel: e.target.value })}
                  placeholder="e.g., Nike Pegasus 40"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="w-full mt-6 py-3 rounded-lg font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
