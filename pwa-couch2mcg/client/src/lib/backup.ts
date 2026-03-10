import { UserProfile, TrainingDay, CustomWorkoutType } from './types';

export interface BackupData {
  version: string;
  timestamp: string;
  profile: UserProfile;
  schedule: TrainingDay[];
  customWorkoutTypes: CustomWorkoutType[];
}

/**
 * Export all app data as a JSON file
 */
export const exportBackup = (
  profile: UserProfile,
  schedule: TrainingDay[],
  customWorkoutTypes: CustomWorkoutType[]
): void => {
  const backupData: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    profile,
    schedule,
    customWorkoutTypes,
  };

  const dataStr = JSON.stringify(backupData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `couch-to-mcg-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate backup file structure
 */
export const validateBackupData = (data: unknown): data is BackupData => {
  if (!data || typeof data !== 'object') return false;

  const backup = data as Record<string, unknown>;

  return (
    typeof backup.version === 'string' &&
    typeof backup.timestamp === 'string' &&
    typeof backup.profile === 'object' &&
    Array.isArray(backup.schedule) &&
    Array.isArray(backup.customWorkoutTypes)
  );
};

/**
 * Parse and validate backup file
 */
export const parseBackupFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!validateBackupData(data)) {
          reject(new Error('Invalid backup file format'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse backup file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read backup file'));
    };

    reader.readAsText(file);
  });
};
