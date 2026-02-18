
import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isAfter, isBefore, subDays, startOfDay, endOfDay } from 'date-fns';
import { TrainingDay, Tip, ActivityType, UserProfile, RunLog, DayOverride, TrainingActivity } from './types';
import { TIPS } from './constants';
import { generateSchedule } from './services/scheduleGenerator';

const App: React.FC = () => {
  // Persistence States
  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('couchToMcgCompleted');
    return saved ? JSON.parse(saved) : [];
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('couchToMcgProfile');
    return saved ? JSON.parse(saved) : { name: 'Runner', goalTime: '2:00:00', shoeModel: '' };
  });

  const [runLogs, setRunLogs] = useState<Record<string, RunLog>>(() => {
    const saved = localStorage.getItem('couchToMcgLogs');
    return saved ? JSON.parse(saved) : {};
  });

  const [overrides, setOverrides] = useState<Record<string, DayOverride>>(() => {
    const saved = localStorage.getItem('couchToMcgOverrides');
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // Migration: ensure overrides follow the new multi-activity structure
    const migrated: Record<string, DayOverride> = {};
    Object.keys(parsed).forEach(date => {
      if (Array.isArray(parsed[date].activities)) {
        migrated[date] = parsed[date];
      } else {
        // Old structure migration
        migrated[date] = {
          activities: [{
            id: 'migrated',
            activity: parsed[date].activity,
            description: parsed[date].description,
            distanceKm: parsed[date].distanceKm
          }]
        };
      }
    });
    return migrated;
  });

  const [customActivities, setCustomActivities] = useState<string[]>(() => {
    const saved = localStorage.getItem('couchToMcgCustomActivities');
    return saved ? JSON.parse(saved) : [];
  });

  // UI States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [editingPlanDate, setEditingPlanDate] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState<Tip>(TIPS[0]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Local state for the "Custom" activity name in the modal
  const [newCustomActivityName, setNewCustomActivityName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const schedule = useMemo(() => generateSchedule(completedDates, overrides), [completedDates, overrides]);

  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem('couchToMcgCompleted', JSON.stringify(completedDates));
  }, [completedDates]);

  useEffect(() => {
    localStorage.setItem('couchToMcgProfile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('couchToMcgLogs', JSON.stringify(runLogs));
  }, [runLogs]);

  useEffect(() => {
    localStorage.setItem('couchToMcgOverrides', JSON.stringify(overrides));
  }, [overrides]);

  useEffect(() => {
    localStorage.setItem('couchToMcgCustomActivities', JSON.stringify(customActivities));
  }, [customActivities]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * TIPS.length);
      setCurrentTip(TIPS[randomIndex]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const resetAllData = () => {
    localStorage.clear();
    setCompletedDates([]);
    setProfile({ name: 'Runner', goalTime: '2:00:00', shoeModel: '' });
    setRunLogs({});
    setOverrides({});
    setCustomActivities([]);
    setShowResetConfirm(false);
    setIsEditingProfile(false);
  };

  const toggleCompletion = (date: string) => {
    setCompletedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date) 
        : [...prev, date]
    );
  };

  const updateLog = (date: string, log: Partial<RunLog>) => {
    setRunLogs(prev => ({
      ...prev,
      [date]: { ...prev[date] || { notes: '', perceivedEffort: 5 }, ...log }
    }));
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

    setOverrides(prev => ({
      ...prev,
      [date]: {
        activities: [...currentActivities, newActivity]
      }
    }));
  };

  const removeActivitySlot = (date: string, id: string) => {
    const day = schedule.find(d => d.date === date);
    if (!day) return;

    const currentActivities = overrides[date]?.activities || day.activities;
    if (currentActivities.length <= 1) return;

    setOverrides(prev => ({
      ...prev,
      [date]: {
        activities: currentActivities.filter(a => a.id !== id)
      }
    }));
  };

  const updateActivitySlot = (date: string, id: string, updates: Partial<TrainingActivity>) => {
    const day = schedule.find(d => d.date === date);
    if (!day) return;

    const currentActivities = [...(overrides[date]?.activities || day.activities)];
    const index = currentActivities.findIndex(a => a.id === id);
    if (index === -1) return;

    currentActivities[index] = { ...currentActivities[index], ...updates };

    setOverrides(prev => ({
      ...prev,
      [date]: {
        activities: currentActivities
      }
    }));
  };

  const handleSavePlanChanges = () => {
    if (editingPlanDate && isAddingCustom && newCustomActivityName.trim()) {
      const name = newCustomActivityName.trim();
      if (!customActivities.includes(name) && !Object.values(ActivityType as any).includes(name)) {
        setCustomActivities(prev => [...prev, name]);
      }
      // Note: In custom mode, we usually apply the name to the *last* slot or specific context.
      // For this simplified multi-edit, "custom" applies to the specific input triggered it.
      // Handled inline in the modal map now.
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
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
                HI, {profile.name.toUpperCase()}
                <button onClick={() => setIsEditingProfile(true)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              </h1>
              <p className="text-slate-400 font-medium">Goal: {profile.goalTime} &bull; Oct 11, 2026</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/10">
            <div className="text-center">
              <span className="block text-2xl font-bold">{progressPercent}%</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Progress</span>
            </div>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-16 space-y-8">
        {/* Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Runner Profile</h2>
                <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1:55:00"
                    value={profile.goalTime} 
                    onChange={(e) => setProfile(p => ({ ...p, goalTime: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-3">Danger Zone</h3>
                  {!showResetConfirm ? (
                    <button 
                      onClick={() => setShowResetConfirm(true)}
                      className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                    >
                      Reset All Progress
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 font-medium mb-2 text-center">Are you sure? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={resetAllData}
                          className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-700"
                        >
                          Yes, Reset
                        </button>
                        <button 
                          onClick={() => setShowResetConfirm(false)}
                          className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Edit Plan Modal (Multi-Activity Support) */}
        {editingPlanDate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-slate-100 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Modify Plan: {format(parseISO(editingPlanDate), 'MMM do')}</h2>
                <button onClick={() => { setEditingPlanDate(null); setIsAddingCustom(false); }} className="text-slate-400 hover:text-slate-600">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {(overrides[editingPlanDate]?.activities || schedule.find(d => d.date === editingPlanDate)?.activities || []).map((act, index) => (
                  <div key={act.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                    <div className="absolute -top-3 left-4 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded uppercase">
                      Activity #{index + 1}
                    </div>
                    {index > 0 && (
                      <button 
                        onClick={() => removeActivitySlot(editingPlanDate, act.id)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white text-red-500 rounded-full shadow-md border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                        <select 
                          value={act.activity}
                          onChange={(e) => {
                             if (e.target.value === 'CUSTOM_NEW') {
                               setIsAddingCustom(true);
                               // Focus logic handled by user action
                             } else {
                               updateActivitySlot(editingPlanDate, act.id, { activity: e.target.value });
                             }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <optgroup label="Standard">
                            {Object.values(ActivityType).map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </optgroup>
                          {customActivities.length > 0 && (
                            <optgroup label="Custom">
                              {customActivities.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </optgroup>
                          )}
                          <option value="CUSTOM_NEW">+ Define New...</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Distance (KM)</label>
                        <input 
                          type="number" step="0.1"
                          value={act.distanceKm ?? ''}
                          onChange={(e) => updateActivitySlot(editingPlanDate, act.id, { distanceKm: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="None"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                        <input 
                          type="text"
                          value={act.description}
                          onChange={(e) => updateActivitySlot(editingPlanDate, act.id, { description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="e.g. Zone 2 effort"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {isAddingCustom && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-2">Create Custom Activity Type</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" autoFocus
                        placeholder="e.g. Swimming, Padel, Yoga"
                        value={newCustomActivityName}
                        onChange={(e) => setNewCustomActivityName(e.target.value)}
                        className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (newCustomActivityName.trim()) {
                            const name = newCustomActivityName.trim();
                            if (!customActivities.includes(name)) setCustomActivities(prev => [...prev, name]);
                            // We don't automatically assign it here to avoid jumping, 
                            // user can now pick it from the dropdowns above.
                            setNewCustomActivityName('');
                            setIsAddingCustom(false);
                          }
                        }}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => addActivitySlot(editingPlanDate)}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold hover:border-slate-400 hover:text-slate-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Another Activity
                </button>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => {
                    const newOverrides = { ...overrides };
                    delete newOverrides[editingPlanDate];
                    setOverrides(newOverrides);
                    setEditingPlanDate(null);
                    setIsAddingCustom(false);
                  }}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Reset Day
                </button>
                <button 
                  onClick={handleSavePlanChanges}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Journal Modal */}
        {editingLogDate && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Run Journal</h2>
              <p className="text-slate-500 mb-6 font-medium">{format(parseISO(editingLogDate), 'EEEE, MMMM do')}</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Perceived Effort (1-10)</label>
                  <input 
                    type="range" min="1" max="10" 
                    value={runLogs[editingLogDate]?.perceivedEffort || 5}
                    onChange={(e) => updateLog(editingLogDate, { perceivedEffort: parseInt(e.target.value) })}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase">
                    <span>Easy</span>
                    <span className="text-emerald-600 text-base font-black">{runLogs[editingLogDate]?.perceivedEffort || 5}</span>
                    <span>Max Effort</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Session Notes</label>
                  <textarea 
                    rows={4}
                    placeholder="How did you feel? Any aches? What was the weather like?"
                    value={runLogs[editingLogDate]?.notes || ''}
                    onChange={(e) => updateLog(editingLogDate, { notes: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => setEditingLogDate(null)}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <section className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Past 7 Days Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weekly KM</span>
                  <span className="text-2xl font-black text-slate-900">{weeklyStats.distance}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sessions</span>
                  <span className="text-2xl font-black text-slate-900">{weeklyStats.completedCount}/{weeklyStats.totalScheduled}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Effort</span>
                  <span className="text-2xl font-black text-slate-900">{weeklyStats.avgEffort}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Historical Achievement</h2>
            <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between gap-8 border border-white/10">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Plan KM</span>
                <span className="text-4xl font-black">{allTimeStats.totalDistance}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Longest Run</span>
                <span className="text-4xl font-black">{allTimeStats.longestRun} <span className="text-xl font-bold text-slate-600">KM</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Sessions Done</span>
                <span className="text-4xl font-black">{allTimeStats.totalSessions}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Section (Multi-Activity Support) */}
        {todayTask && (
          <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 flex gap-2">
              <button 
                onClick={() => setEditingPlanDate(todayTask.date)}
                className="p-2 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                title="Modify planned sessions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-tighter self-center">
                {todayTask.phase}
              </span>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600">Today's Sessions ({todayTask.activities.length})</h2>
              <span className="text-sm font-medium text-slate-400">{format(parseISO(todayTask.date), 'EEEE, MMM do')}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6 w-full">
                {todayTask.activities.map((act, idx) => (
                  <div key={act.id} className={`p-6 rounded-2xl ${idx === 0 ? 'bg-slate-50 border border-slate-100' : 'bg-white border-l-4 border-emerald-500 shadow-sm'}`}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {act.activity}
                        {overrides[todayTask.date] && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase">Custom</span>}
                      </h3>
                      {act.distanceKm !== undefined && (
                        <span className="text-xl font-light text-slate-400">{act.distanceKm}km</span>
                      )}
                    </div>
                    <p className="text-slate-600 text-base leading-relaxed">{act.description}</p>
                  </div>
                ))}
                
                {runLogs[todayTask.date]?.notes && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 italic">
                    <span className="font-bold uppercase text-[10px] block mb-1">Daily Log</span>
                    "{runLogs[todayTask.date].notes}"
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                <button 
                  onClick={() => toggleCompletion(todayTask.date)}
                  className={`flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-bold transition-all transform active:scale-95 ${
                    todayTask.isCompleted 
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                      : 'bg-slate-900 text-white shadow-xl shadow-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {todayTask.isCompleted ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Day Completed
                    </>
                  ) : 'Mark Day Complete'}
                </button>
                {todayTask.isCompleted && (
                  <button 
                    onClick={() => setEditingLogDate(todayTask.date)}
                    className="text-slate-500 hover:text-slate-900 font-bold text-sm underline decoration-slate-200 underline-offset-4 transition-colors text-center"
                  >
                    {runLogs[todayTask.date] ? 'Edit Log' : 'Add Training Notes'}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* History / Upcoming Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Plan Overview
            </h2>
          </div>
          
          <div className="grid gap-4">
            {schedule
              .filter(day => {
                const date = parseISO(day.date);
                const isRecent = isAfter(date, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
                const isNearFuture = isBefore(date, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
                return isRecent && isNearFuture;
              })
              .map((day) => (
              <div 
                key={day.date} 
                className={`bg-white p-5 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${day.isCompleted ? 'bg-slate-50 border-transparent ring-1 ring-slate-200/50 opacity-80' : 'hover:border-slate-300'}`}
              >
                <div className="flex items-center gap-5">
                  <div className={`text-center min-w-[3.5rem] py-2.5 rounded-2xl border ${day.isCompleted ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`block text-[10px] font-black uppercase tracking-tighter ${day.isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {format(parseISO(day.date), 'EEE')}
                    </span>
                    <span className={`block text-xl font-black ${day.isCompleted ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {format(parseISO(day.date), 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {day.activities.map((act, idx) => (
                      <div key={act.id} className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${day.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {act.activity}
                        </span>
                        {act.distanceKm !== undefined && (
                          <span className="text-[10px] font-black text-slate-400 uppercase">{act.distanceKm}km</span>
                        )}
                      </div>
                    ))}
                    <p className="text-xs text-slate-400 line-clamp-1 italic max-w-xs">{day.activities[0].description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                  <button 
                    onClick={() => setEditingPlanDate(day.date)}
                    className="p-2.5 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-xl transition-colors"
                    title="Modify plan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setEditingLogDate(day.date)}
                    className={`p-2.5 rounded-xl transition-colors ${runLogs[day.date] ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-50'}`}
                    title="Journal"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    </svg>
                  </button>
                  <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden md:block"></div>
                  <input 
                    type="checkbox" 
                    checked={day.isCompleted}
                    onChange={() => toggleCompletion(day.date)}
                    className="h-7 w-7 rounded-xl border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tip Section */}
        <footer className="pt-8">
          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 relative group transition-all hover:shadow-lg hover:shadow-emerald-100/50">
            <div className="absolute -top-4 left-6 px-4 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-200">
              Training Tip: {currentTip.category}
            </div>
            <p className="text-emerald-900 font-medium italic text-lg leading-snug">
              "{currentTip.content}"
            </p>
          </div>
          <div className="mt-12 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Stored Locally for privacy &bull; Melbourne 2026
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
