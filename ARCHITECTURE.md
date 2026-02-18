# Couch to MCG - Enhanced Architecture Design

## Overview

This document outlines the architecture for transforming Couch to MCG into a cross-platform application supporting both web and mobile platforms with local-first data storage and optional remote synchronization.

## Current State Analysis

### Existing Implementation
- **Platform**: Web-only (React + Vite)
- **Storage**: Browser localStorage
- **State Management**: React hooks (useState, useEffect)
- **Data Models**: TypeScript interfaces for TrainingDay, UserProfile, RunLog, etc.
- **Key Features**: 
  - Training schedule generation
  - Activity tracking and completion
  - User profile management
  - Custom activities
  - Statistics (weekly and all-time)

### Limitations
- Web-only (no mobile app)
- No data synchronization across devices
- No offline-first architecture
- localStorage limitations (5-10MB, browser-specific)

## Target Architecture

### Platform Strategy

#### Option 1: Monorepo with Shared Logic (Recommended)
```
couch-to-mcg/
├── packages/
│   ├── core/              # Shared business logic, types, utilities
│   │   ├── types/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   ├── mobile/            # React Native app
│   │   ├── src/
│   │   ├── ios/
│   │   ├── android/
│   │   └── app.json
│   └── web/               # React web app
│       ├── src/
│       ├── public/
│       └── index.html
└── package.json
```

#### Option 2: Separate Repositories
- Maintain separate repos for web and mobile
- Share code via npm packages
- More complex but better separation

**Decision**: Use Option 1 (Monorepo) for easier code sharing and maintenance.

### Data Storage Architecture

#### Local Storage Layer

**Web Platform**:
- **Primary**: IndexedDB (via Dexie.js or similar)
- **Fallback**: localStorage for simple key-value pairs
- **Benefits**: 
  - Larger storage capacity (50MB+)
  - Structured data storage
  - Better performance for complex queries

**Mobile Platform**:
- **Primary**: AsyncStorage (React Native)
- **Alternative**: SQLite (via expo-sqlite or react-native-sqlite-storage)
- **Benefits**:
  - Native mobile storage
  - Persistent across app updates
  - Better performance for large datasets

#### Storage Abstraction Layer

Create a unified storage interface that works across platforms:

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}
```

Implementations:
- `WebStorageAdapter` (IndexedDB/localStorage)
- `MobileStorageAdapter` (AsyncStorage/SQLite)

#### Remote Synchronization (Optional)

**Architecture**: Local-first with optional cloud sync

**Sync Strategy**:
1. **Offline-first**: All operations work locally first
2. **Background sync**: Sync to cloud when online
3. **Conflict resolution**: Last-write-wins or manual resolution
4. **Selective sync**: Users can choose what to sync

**Backend Options**:
- **Option A**: Firebase Firestore
  - Real-time sync
  - Built-in authentication
  - Generous free tier
  
- **Option B**: Supabase
  - PostgreSQL backend
  - Real-time subscriptions
  - Open source
  
- **Option C**: Custom API + Database
  - Full control
  - Use existing scaffold (web-db-user)
  - MySQL/TiDB backend

**Recommendation**: Start with Firebase for quick implementation, allow migration to custom backend later.

### Data Models Enhancement

#### Core Data Models

```typescript
// Enhanced with sync metadata
interface SyncMetadata {
  id: string;                    // UUID for sync
  createdAt: number;             // Unix timestamp
  updatedAt: number;             // Unix timestamp
  syncedAt?: number;             // Last sync timestamp
  deviceId: string;              // Device identifier
  version: number;               // For conflict resolution
}

interface UserProfile extends SyncMetadata {
  name: string;
  goalTime: string;
  shoeModel: string;
  email?: string;                // For remote sync
}

interface TrainingDay extends SyncMetadata {
  date: string;
  activities: TrainingActivity[];
  phase: Phase;
  isCompleted: boolean;
}

interface RunLog extends SyncMetadata {
  date: string;
  notes: string;
  actualDistance?: number;
  perceivedEffort: number;
}

interface DayOverride extends SyncMetadata {
  date: string;
  activities: TrainingActivity[];
}
```

#### Sync Queue

```typescript
interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  collection: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}
```

### Component Architecture

#### Shared Components (Core Package)

```typescript
// Business logic hooks
- useTrainingSchedule()
- useUserProfile()
- useRunLogs()
- useStatistics()
- useSync()

// Utility functions
- scheduleGenerator
- statisticsCalculator
- dateHelpers
- storageHelpers

// Type definitions
- All TypeScript interfaces and enums
```

#### Platform-Specific Components

**Web**:
- React components with web-specific styling
- Responsive design for desktop/tablet/mobile browsers
- Web-specific navigation (React Router)

**Mobile**:
- React Native components
- Native navigation (React Navigation)
- Platform-specific UI (iOS/Android)
- Native features (notifications, calendar integration)

### State Management

**Options**:
1. **React Context + Hooks** (Current approach, simple)
2. **Zustand** (Lightweight, good for cross-platform)
3. **Redux Toolkit** (More complex, better for large apps)

**Recommendation**: Use **Zustand** for better state management across platforms while keeping it simple.

```typescript
// Example store structure
interface AppStore {
  // Data
  profile: UserProfile | null;
  schedule: TrainingDay[];
  runLogs: Record<string, RunLog>;
  overrides: Record<string, DayOverride>;
  
  // UI State
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  
  // Actions
  updateProfile: (profile: UserProfile) => void;
  toggleCompletion: (date: string) => void;
  updateLog: (date: string, log: RunLog) => void;
  syncData: () => Promise<void>;
}
```

### Security Considerations

#### Data Encryption (for sensitive data)
- Encrypt data at rest using user-provided passphrase
- Use Web Crypto API (web) / Expo Crypto (mobile)
- Never store encryption keys in the app

#### Authentication (for remote sync)
- OAuth 2.0 for third-party auth
- Email/password with secure password requirements
- Biometric authentication on mobile (Face ID, Touch ID)

### Migration Strategy

#### Phase 1: Refactor Current Web App
1. Extract shared logic to core package
2. Implement storage abstraction layer
3. Replace localStorage with IndexedDB
4. Add TypeScript strict mode
5. Improve error handling

#### Phase 2: Create Mobile App
1. Initialize React Native project (Expo)
2. Implement mobile storage adapter
3. Reuse core logic and hooks
4. Build mobile-specific UI
5. Add native features

#### Phase 3: Add Remote Sync
1. Choose and setup backend (Firebase/Supabase)
2. Implement sync service
3. Add authentication
4. Build sync UI (status, conflicts)
5. Test sync scenarios

#### Phase 4: Polish & Deploy
1. Add comprehensive testing
2. Optimize performance
3. Add analytics (optional)
4. Deploy web app
5. Submit mobile apps to stores

## Technology Stack

### Web
- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Storage**: IndexedDB (Dexie.js)
- **Styling**: TailwindCSS
- **State**: Zustand
- **Routing**: React Router
- **Date Handling**: date-fns

### Mobile
- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Storage**: AsyncStorage or expo-sqlite
- **Styling**: TailwindCSS (NativeWind)
- **State**: Zustand
- **Navigation**: React Navigation
- **Date Handling**: date-fns

### Shared
- **Monorepo**: pnpm workspaces or npm workspaces
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode

### Backend (Optional Sync)
- **Option A**: Firebase (Firestore + Auth)
- **Option B**: Supabase (PostgreSQL + Auth)
- **Option C**: Custom (Express + MySQL/TiDB + Drizzle)

## Implementation Priorities

### MVP (Minimum Viable Product)
1. ✅ Refactor web app with storage abstraction
2. ✅ Create mobile app with local storage
3. ✅ Share core logic between platforms
4. ✅ Basic UI for both platforms

### Phase 2 Features
1. Remote synchronization
2. User authentication
3. Conflict resolution
4. Offline mode indicators

### Future Enhancements
1. Social features (share achievements)
2. Coach/trainer integration
3. Wearable device integration
4. Advanced analytics and insights
5. Custom training plan generator
6. Community challenges

## Next Steps

1. **Setup monorepo structure** with pnpm workspaces
2. **Extract core logic** into shared package
3. **Implement storage abstraction** layer
4. **Initialize mobile project** with Expo
5. **Build platform-specific UIs** reusing core logic
6. **Add remote sync** (optional, after core features work)

## Questions to Resolve

1. **Storage preference**: IndexedDB vs localStorage for web? AsyncStorage vs SQLite for mobile?
2. **Backend choice**: Firebase, Supabase, or custom backend?
3. **Authentication**: Required or optional? Which providers?
4. **Encryption**: Should all data be encrypted or just sensitive fields?
5. **Deployment**: Where to host web app? Which app stores for mobile?

