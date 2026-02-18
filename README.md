# Couch to MCG

<div align="center">
<img width="256" height="256" alt="couch-to-mcg" src="https://github.com/user-attachments/assets/60e64ea3-cbb5-44de-9a7c-b4851ab26c0f" />
</div>

**Couch to MCG** is a cross-platform training app that helps you track your marathons, runs, and daily workouts. Available as both a web app and mobile app (iOS/Android), with local-first data storage and optional cloud synchronization.

## ✨ Features

- 📱 **Cross-Platform**: Web (React) and Mobile (React Native/Expo)
- 💾 **Local-First Storage**: Works offline with IndexedDB (web) and SQLite (mobile)
- ☁️ **Optional Cloud Sync**: Sync your data across devices (Firebase integration ready)
- 📊 **Progress Tracking**: Monitor your training progress with detailed statistics
- 🎯 **Customizable Workouts**: Create and manage custom training activities
- 📅 **Training Schedule**: Automatically generated training plan leading to race day
- 📈 **Statistics Dashboard**: Weekly and all-time performance metrics
- 💡 **Training Tips**: Helpful advice on shoes, nutrition, and pacing

## 🏗️ Architecture

This is a **monorepo** project using pnpm workspaces:

```
couch-to-mcg/
├── packages/
│   ├── core/              # Shared business logic, types, and utilities
│   ├── mobile/            # React Native mobile app (Expo)
│   └── web/               # React web app (Vite)
├── ARCHITECTURE.md        # Detailed architecture documentation
└── package.json           # Root workspace configuration
```

### Technology Stack

**Core Package**:
- TypeScript
- date-fns (date utilities)
- Shared types, services, and storage interfaces

**Web App**:
- React 19
- Vite (build tool)
- TypeScript
- IndexedDB via Dexie.js (local storage)
- Zustand (state management)
- TailwindCSS (styling)

**Mobile App**:
- React Native (Expo)
- TypeScript
- SQLite via expo-sqlite (local storage)
- React Navigation (navigation)
- Zustand (state management)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (install with `npm install -g pnpm`)
- For mobile development: **Expo Go** app on your phone

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nzicecool/couch-to-mcg.git
   cd couch-to-mcg
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build the core package**:
   ```bash
   pnpm build:core
   ```

### Running the Apps

#### Web App

```bash
# Development mode
pnpm dev:web

# Build for production
pnpm build:web

# Preview production build
cd packages/web && pnpm preview
```

The web app will be available at `http://localhost:5173`

#### Mobile App

```bash
# Start Expo development server
pnpm dev:mobile

# Run on Android
cd packages/mobile && pnpm android

# Run on iOS (macOS only)
cd packages/mobile && pnpm ios

# Run on web (for testing)
cd packages/mobile && pnpm web
```

**Using Expo Go**:
1. Install Expo Go on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
2. Scan the QR code shown in the terminal
3. The app will load on your device

## 📦 Package Scripts

From the root directory:

```bash
# Development
pnpm dev:web          # Start web app dev server
pnpm dev:mobile       # Start mobile app dev server

# Building
pnpm build:core       # Build core package
pnpm build:web        # Build web app for production
pnpm build:mobile     # Build mobile app

# Type checking
pnpm type-check       # Type check all packages

# Linting
pnpm lint             # Lint all packages
```

## 💾 Data Storage

### Local Storage

**Web**: Uses **IndexedDB** via Dexie.js for robust, large-capacity storage
- Capacity: 50MB+ (browser dependent)
- Persists across sessions
- Works offline

**Mobile**: Uses **SQLite** via expo-sqlite for native storage
- Unlimited capacity (device dependent)
- Persists across app updates
- Fast and reliable

### Storage Keys

All data is stored using these keys:
- `couchToMcgProfile` - User profile (name, goal time, shoe model)
- `couchToMcgCompleted` - Array of completed workout dates
- `couchToMcgLogs` - Run logs with notes and effort ratings
- `couchToMcgOverrides` - Custom workout overrides
- `couchToMcgCustomActivities` - User-defined activity types

### Cloud Sync (Optional)

Firebase integration is ready but requires configuration:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Firestore Database**
3. **Install Firebase SDK**:
   ```bash
   cd packages/web
   pnpm add firebase
   ```
4. **Configure Firebase** in `packages/web/src/services/FirebaseSyncService.ts`
5. **Add environment variables** with your Firebase config

## 🎨 Customization

### Adding Custom Activities

Users can add custom workout types through the UI:
1. Click on any day in the schedule
2. Select "Custom" from the activity dropdown
3. Enter a custom activity name
4. The activity will be saved and available for future use

### Modifying the Training Schedule

Edit `packages/core/src/services/scheduleGenerator.ts` to customize:
- Training phases and durations
- Weekly workout patterns
- Distance progressions
- Activity types and descriptions

### Styling

**Web**: Modify TailwindCSS classes in `packages/web/src/App.tsx`

**Mobile**: Update styles in `packages/mobile/src/screens/HomeScreen.tsx`

## 🧪 Development

### Project Structure

```
packages/core/src/
├── types/              # TypeScript type definitions
├── services/           # Business logic (schedule generation, sync)
├── storage/            # Storage adapter interfaces
└── index.ts            # Package exports

packages/web/src/
├── storage/            # IndexedDB storage implementation
├── store/              # Zustand state management
├── services/           # Web-specific services (Firebase sync)
└── App.tsx             # Main React component

packages/mobile/src/
├── storage/            # SQLite storage implementation
├── store/              # Zustand state management
├── screens/            # React Native screens
└── components/         # Reusable components
```

### Adding New Features

1. **Add shared logic** to `packages/core/src/`
2. **Implement platform-specific code** in web/mobile packages
3. **Update storage adapters** if new data needs to be persisted
4. **Update Zustand stores** to expose new state/actions
5. **Update UI components** to use new features

### Type Safety

All packages use TypeScript with strict mode enabled. Run type checking:

```bash
pnpm type-check
```

## 🚢 Deployment

### Web App

**Option 1: Static Hosting** (Vercel, Netlify, GitHub Pages)
```bash
pnpm build:web
# Deploy the packages/web/dist folder
```

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY packages/web/dist /app
RUN npm install -g serve
CMD ["serve", "-s", ".", "-l", "3000"]
```

### Mobile App

**iOS**:
1. Run `cd packages/mobile && eas build --platform ios`
2. Submit to App Store via Expo EAS

**Android**:
1. Run `cd packages/mobile && eas build --platform android`
2. Submit to Google Play via Expo EAS

See [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.

## 📝 Data Migration

If you have data from the old version (localStorage only):

1. Open the old web app
2. Open browser DevTools → Application → Local Storage
3. Copy the values for all `couchToMcg*` keys
4. Open the new web app
5. The data will be automatically migrated to IndexedDB on first load

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🏃‍♂️ Training Plan

The app generates a customized training plan leading to the **Melbourne Half Marathon** on **October 11, 2026**.

### Training Phases

1. **Phase 1: Base Building** (Feb-Apr 2026)
   - Focus on building aerobic base
   - Easy runs and progressive long runs
   - 2-3 runs per week

2. **Phase 2: Strength & Power** (May-Jul 2026)
   - Hill repeats and gym workouts
   - Increased weekly mileage
   - 3-4 sessions per week

3. **Phase 3: Taper & Peak** (Aug-Oct 2026)
   - Peak mileage followed by taper
   - Race-specific workouts
   - Final preparation for race day

## 💡 Tips & Best Practices

- **Never skip rest days** - Recovery is when you get stronger
- **Listen to your body** - Adjust the plan if you're feeling overtrained
- **Stay consistent** - Regular training beats sporadic hard efforts
- **Practice race day nutrition** - Test your fueling strategy on long runs
- **Get proper running shoes** - Visit a specialty store for gait analysis

## 🐛 Known Issues

- Firebase sync is not yet fully implemented (placeholder code provided)
- Mobile app requires Expo Go for development (native builds need EAS)
- Web app requires modern browser with IndexedDB support

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/nzicecool/couch-to-mcg/issues)
- Check the [Architecture Documentation](./ARCHITECTURE.md)

## 🎯 Roadmap

- [ ] Complete Firebase sync implementation
- [ ] Add authentication (email, Google, Apple)
- [ ] Wearable device integration (Garmin, Strava)
- [ ] Social features (share achievements)
- [ ] Advanced analytics and insights
- [ ] Custom training plan generator
- [ ] Coach/trainer collaboration features
- [ ] Community challenges and leaderboards

---

**Made with ❤️ for runners everywhere. Good luck with your training!** 🏃‍♀️🏃‍♂️
