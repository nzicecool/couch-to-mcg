import React, { useState, useEffect, useMemo } from 'react';
import { format, parseISO, isToday, isAfter, isBefore, subDays, startOfDay, endOfDay } from 'date-fns';
import { useAppStore } from '@/lib/appStore';
import { ActivityType, TrainingActivity, DayOverride } from '@/lib/types';
import { TIPS } from '@/lib/constants';
import { exportBackup, parseBackupFile, validateBackupData } from '@/lib/backup';
import { PINAuth } from '@/components/PINAuth';
import { DayEditor } from '@/components/DayEditor';
import { MarathonCountdown } from '@/components/MarathonCountdown';
import { PWAInstallGuide } from '@/components/PWAInstallGuide';
import ScheduleItem from '@/components/ScheduleItem';

/**
 * Home Page - Main training dashboard
 * Design: Athletic Minimalism with Emerald Green primary and Amber accents
 * Features: Today's task, progress tracking, stats, schedule preview
 */
export default function Home() {
  const {
    profile,
    completedDates,
    runLogs,
    overrides,
    customActivities,
    customWorkoutTypes,
    dayNotes,
    schedule,
    isLoading,
    isInitialized,
    pinState,
    initialize,
    updateProfile,
    toggleCompletion,
    updateLog,
    updateOverride,
    addCustomActivity,
    addCustomWorkoutType,
    updateDayNotes,
    logoutPIN,
    resetAllData
  } = useAppStore();

  // UI States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingLogDate, setEditingLogDate] = useState<string | null>(null);
  const [currentTip, setCurrentTip] = useState(TIPS[0]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingDayDate, setEditingDayDate] = useState<string | null>(null);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

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

  const handleSaveDayEdit = async (activities: TrainingActivity[], notes: string) => {
    if (!editingDayDate) return;
    
    const override: DayOverride = { activities };
    await updateOverride(editingDayDate, override);
    await updateDayNotes(editingDayDate, notes);
    setEditingDayDate(null);
  };

  const handleExportBackup = () => {
    try {
      const profileData = profile || { name: 'Runner', goalTime: '2:00:00', shoeModel: '' };
      exportBackup(profileData, schedule, customWorkoutTypes);
      alert('Backup downloaded successfully!');
    } catch (error) {
      alert(`Failed to export backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoringBackup(true);
      const backupData = await parseBackupFile(file);
      
      if (!validateBackupData(backupData)) {
        throw new Error('Invalid backup file format');
      }

      if (backupData.profile) {
        updateProfile(backupData.profile);
      }

      alert('Backup restored successfully! Please refresh the page to see all changes.');
      setShowSettings(false);
    } catch (error) {
      alert(`Failed to restore backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRestoringBackup(false);
      event.target.value = '';
    }
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

  // Show PIN auth if not authenticated
  if (!pinState.isAuthenticated) {
    return <PINAuth onAuthenticated={() => {}} />;
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">Loading your training plan...</p>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 sticky top-0 z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">R</div>
            <div>
              <h1 className="text-2xl font-bold">HI, RUNNER</h1>
              <p className="text-sm text-white/80">Goal: {profile?.goalTime || '2:00:00'} Half Marathon</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-300">{progressPercent}%</div>
            <div className="text-xs text-white/80">{completedRunsCount} / {totalRuns} runs</div>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Marathon Countdown */}
        <MarathonCountdown />

        {/* PWA Installation Guide */}
        <PWAInstallGuide />

        {/* Today's Task */}
        {todayTask && (
          <div className="stat-card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">TODAY'S TASK</h2>
              <span className="text-xs font-semibold text-muted-foreground">{format(parseISO(todayTask.date), 'EEE, MMM d')}</span>
            </div>
            <button
              onClick={() => setEditingDayDate(todayTask.date)}
              className="w-full mb-4 px-3 py-2 text-sm font-semibold bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
            >
              ✎ Edit This Day
            </button>
            <div className="space-y-3">
              {todayTask.activities.map((activity, idx) => (
                <div key={activity.id || idx}>
                  <h3 className="font-semibold text-foreground">{activity.activity}</h3>
                  {activity.description && <p className="text-sm text-muted-foreground">{activity.description}</p>}
                  {activity.distanceKm && <p className="text-lg font-bold text-primary">{activity.distanceKm} km</p>}
                </div>
              ))}
            </div>
            <button
              onClick={() => toggleCompletion(todayTask.date)}
              className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${
                todayTask.isCompleted
                  ? 'bg-amber-300/20 text-amber-600 border-2 border-amber-300'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {todayTask.isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">This Week</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="text-2xl font-bold text-primary">{weeklyStats.distance} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">{weeklyStats.completedCount} / {weeklyStats.totalScheduled}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Effort</p>
                <p className="text-2xl font-bold text-amber-600">{weeklyStats.avgEffort} / 10</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">All-Time</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold text-primary">{allTimeStats.totalDistance} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Longest Run</p>
                <p className="text-2xl font-bold text-amber-600">{allTimeStats.longestRun} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold text-foreground">{allTimeStats.totalSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="bg-primary text-white p-4 rounded-lg flex gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold mb-1">{currentTip.category} TIP</h4>
            <p className="text-sm text-white/90">{currentTip.content}</p>
          </div>
        </div>

        {/* Schedule Preview */}
        <div className="stat-card">
          <h3 className="text-lg font-bold text-foreground mb-4">Upcoming Schedule</h3>
          <div className="space-y-2">
            {schedule.slice(0, 7).map((day) => (
              <ScheduleItem
                key={day.date}
                day={day}
                onEdit={setEditingDayDate}
                onToggleCompletion={toggleCompletion}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Day Editor Modal */}
      {editingDayDate && (
        <DayEditor
          open={!!editingDayDate}
          onOpenChange={(open) => !open && setEditingDayDate(null)}
          date={editingDayDate}
          activities={schedule.find(d => d.date === editingDayDate)?.activities || []}
          notes={dayNotes[editingDayDate] || ""}
          workoutTypes={customWorkoutTypes}
          onSave={handleSaveDayEdit}
          onAddCustomWorkout={addCustomWorkoutType}
        />
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-card w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-foreground">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Section */}
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold text-foreground mb-3">Profile</h4>
                {!isEditingProfile ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Name: {profile?.name || 'Runner'}</p>
                    <p className="text-sm text-muted-foreground mb-3">Goal: {profile?.goalTime || '2:00:00'}</p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                    >
                      Edit Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      defaultValue={profile?.name || ''}
                      onChange={(e) => updateProfile({ name: e.target.value, goalTime: profile?.goalTime || '2:00:00', shoeModel: profile?.shoeModel || '' })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                    <input
                      type="text"
                      placeholder="Goal time (HH:MM:SS)"
                      defaultValue={profile?.goalTime || ''}
                      onChange={(e) => updateProfile({ name: profile?.name || '', goalTime: e.target.value, shoeModel: profile?.shoeModel || '' })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>

              {/* Training Management */}
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold text-foreground mb-3">Training</h4>
                {todayTask && (
                  <button
                    onClick={() => {
                      setEditingDayDate(todayTask.date);
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm font-semibold mb-2"
                  >
                    ✎ Edit Today's Activities
                  </button>
                )}
              </div>

              {/* Data Management */}
              <div className="border-b border-border pb-4">
                <h4 className="font-semibold text-foreground mb-3">Data</h4>
                <div className="space-y-2 mb-3">
                  <button
                    onClick={handleExportBackup}
                    className="w-full px-4 py-2 bg-emerald-600/20 text-emerald-600 rounded-lg hover:bg-emerald-600/30 transition-colors text-sm font-semibold"
                  >
                    Export Backup
                  </button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    disabled={isRestoringBackup}
                    id="backup-import"
                    className="hidden"
                  />
                  <button
                    onClick={() => document.getElementById('backup-import')?.click()}
                    disabled={isRestoringBackup}
                    className="w-full px-4 py-2 bg-blue-600/20 text-blue-600 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isRestoringBackup ? 'Restoring...' : 'Import Backup'}
                  </button>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600/20 text-red-600 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-semibold"
                >
                  Reset All Data
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logoutPIN();
                  setShowSettings(false);
                }}
                className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-semibold"
              >
                Logout
              </button>
            </div>

            {/* Reset Confirmation */}
            {showResetConfirm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-card p-6 rounded-lg max-w-sm">
                  <h4 className="text-lg font-bold text-foreground mb-3">Reset All Data?</h4>
                  <p className="text-sm text-muted-foreground mb-6">This action cannot be undone. All your training data will be deleted.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetAllData}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button for Edit */}
      {isInitialized && pinState.isAuthenticated && todayTask && (
        <button
          onClick={() => setEditingDayDate(todayTask.date)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center text-xl font-bold z-40"
          title="Edit today's activities"
        >
          ✎
        </button>
      )}

      {/* Day Editor Dialog */}
      {todayTask && (
        <DayEditor
          open={editingDayDate !== null}
          onOpenChange={(open) => !open && setEditingDayDate(null)}
          date={editingDayDate || todayTask.date}
          activities={schedule.find(d => d.date === editingDayDate)?.activities || []}
          notes={dayNotes[editingDayDate || ''] || ''}
          workoutTypes={customWorkoutTypes}
          onSave={handleSaveDayEdit}
          onAddCustomWorkout={addCustomWorkoutType}
        />
      )}
    </div>
  );
}
