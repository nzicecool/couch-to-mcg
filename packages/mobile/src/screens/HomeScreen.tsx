import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { format, parseISO, isToday } from 'date-fns';
import { useAppStore } from '../store/appStore';
import { ActivityType } from '@couch-to-mcg/core';

export const HomeScreen: React.FC = () => {
  const {
    profile,
    schedule,
    completedDates,
    isLoading,
    isInitialized,
    initialize,
    toggleCompletion,
  } = useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const todayTask = useMemo(() => {
    return schedule.find(day => isToday(parseISO(day.date)));
  }, [schedule]);

  const stats = useMemo(() => {
    const totalRuns = schedule.filter(d =>
      d.activities.some(a => a.activity !== ActivityType.REST)
    ).length;
    const completedRuns = completedDates.filter(date => {
      const day = schedule.find(d => d.date === date);
      return day && day.activities.some(a => a.activity !== ActivityType.REST);
    }).length;
    const progressPercent = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

    return { totalRuns, completedRuns, progressPercent };
  }, [schedule, completedDates]);

  if (isLoading || !isInitialized) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Loading your training plan...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileBadge}>
          <Text style={styles.profileInitial}>
            {profile?.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.greeting}>HI, {profile?.name.toUpperCase()}</Text>
        <Text style={styles.subtitle}>Couch to MCG Training</Text>
      </View>

      {/* Progress Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${stats.progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {stats.completedRuns} / {stats.totalRuns} runs completed ({stats.progressPercent}%)
        </Text>
      </View>

      {/* Today's Task */}
      {todayTask && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Workout</Text>
          <Text style={styles.dateText}>{format(parseISO(todayTask.date), 'EEEE, MMMM d')}</Text>
          
          {todayTask.activities.map((activity, index) => (
            <View key={activity.id || index} style={styles.activityItem}>
              <Text style={styles.activityType}>{activity.activity}</Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              {activity.distanceKm && (
                <Text style={styles.activityDistance}>{activity.distanceKm} km</Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, todayTask.isCompleted && styles.buttonCompleted]}
            onPress={() => toggleCompletion(todayTask.date)}
          >
            <Text style={styles.buttonText}>
              {todayTask.isCompleted ? '✓ Completed' : 'Mark as Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upcoming Schedule */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Schedule</Text>
        {schedule.slice(0, 7).map((day) => {
          const date = parseISO(day.date);
          const isTodayDate = isToday(date);
          
          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.scheduleItem,
                isTodayDate && styles.scheduleItemToday,
                day.isCompleted && styles.scheduleItemCompleted,
              ]}
              onPress={() => toggleCompletion(day.date)}
            >
              <View style={styles.scheduleDate}>
                <Text style={styles.scheduleDayName}>{format(date, 'EEE')}</Text>
                <Text style={styles.scheduleDayNumber}>{format(date, 'd')}</Text>
              </View>
              <View style={styles.scheduleContent}>
                {day.activities.map((activity, index) => (
                  <View key={activity.id || index}>
                    <Text style={styles.scheduleActivity}>{activity.activity}</Text>
                    {activity.distanceKm && (
                      <Text style={styles.scheduleDistance}>{activity.distanceKm} km</Text>
                    )}
                  </View>
                ))}
              </View>
              {day.isCompleted && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#0f172a',
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  profileBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
  },
  dateText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  activityItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  activityDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonCompleted: {
    backgroundColor: '#64748b',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  scheduleItemToday: {
    backgroundColor: '#dbeafe',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  scheduleItemCompleted: {
    opacity: 0.6,
  },
  scheduleDate: {
    width: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleDayName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  scheduleDayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  scheduleDistance: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 24,
    color: '#10b981',
  },
});
