# CouchToMCG PWA - Progressive Web App

A mobile-friendly Progressive Web App (PWA) version of the CouchToMCG training app with PIN-based single-user authentication.

## Features

- **PIN Authentication**: Secure 4-digit PIN setup on first launch
- **Training Schedule**: 12-week MCG (Melbourne Cricket Ground) half-marathon training plan
- **Progress Tracking**: Real-time stats showing distance, completed runs, and effort levels
- **Offline Support**: Full functionality without internet connection via service worker
- **Mobile-First Design**: Responsive layout optimized for iOS and Android
- **Installable**: Can be added to home screen on iOS/Android
- **Local Storage**: All data persists in browser using IndexedDB
- **Advanced Features**:
  - Modify day activities and workouts
  - Gym workout sessions support
  - Create custom workout types
  - Capture short notes for each training day
  - Melbourne Marathon 2026 countdown timer
  - PWA installation instructions

## Getting Started

### Installation

```bash
cd pwa-couch2mcg
pnpm install
```

### Development

```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
pnpm run build
pnpm run start
```

## Project Structure

```
client/
  public/           # Static assets and PWA manifest
  src/
    components/     # Reusable React components
    pages/          # Page-level components
    lib/            # Utility functions and state management
    App.tsx         # Main app component with routing
    main.tsx        # React entry point
    index.css       # Global styles with Tailwind CSS
server/             # Express server for production
```

## Key Technologies

- **React 19** - UI framework
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library
- **Zustand** - State management
- **IndexedDB** - Local data persistence
- **Service Worker** - Offline support
- **Vite** - Build tool

## PWA Installation

### On Android
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Install app" or "Add to Home screen"

### On iOS
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## Design

- **Color Scheme**: Emerald green (#10b981) primary with amber accents
- **Typography**: Professional sans-serif with clear hierarchy
- **Layout**: Mobile-first responsive design
- **Animation**: Smooth transitions and micro-interactions

## Data Storage

All user data is stored locally in the browser using IndexedDB:
- User profile and PIN
- Training schedule and progress
- Custom workout types
- Training notes and observations

## Offline Functionality

The service worker caches all essential assets, allowing the app to work completely offline. Changes are synced when the connection is restored.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Samsung Internet 14+

## Development Notes

- The app uses Vite for fast development and optimized builds
- HMR (Hot Module Replacement) is configured for the Manus proxy domain
- TypeScript is used throughout for type safety
- Components follow React best practices with proper hook usage

## License

MIT
