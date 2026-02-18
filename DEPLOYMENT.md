# Deployment Guide

This guide covers deploying both the web and mobile versions of Couch to MCG.

## Web App Deployment

### Option 1: Vercel (Recommended)

Vercel provides free hosting for static sites with automatic deployments from GitHub.

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Build the app**:
   ```bash
   pnpm build:web
   ```

3. **Deploy**:
   ```bash
   cd packages/web
   vercel --prod
   ```

4. **Configure Vercel** (via `vercel.json` in packages/web):
   ```json
   {
     "buildCommand": "pnpm build",
     "outputDirectory": "dist",
     "framework": "vite"
   }
   ```

**Automatic Deployments**:
- Connect your GitHub repository to Vercel
- Every push to `main` will trigger a deployment
- Preview deployments for pull requests

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy**:
   ```bash
   pnpm build:web
   cd packages/web
   netlify deploy --prod --dir=dist
   ```

3. **Configure** via `netlify.toml`:
   ```toml
   [build]
     command = "pnpm build"
     publish = "dist"
   ```

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   cd packages/web
   pnpm add -D gh-pages
   ```

2. **Add deploy script** to `packages/web/package.json`:
   ```json
   {
     "scripts": {
       "deploy": "pnpm build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy**:
   ```bash
   cd packages/web
   pnpm deploy
   ```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Select `gh-pages` branch
   - Save

### Option 4: Docker

1. **Create Dockerfile** in `packages/web`:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install
   COPY . .
   RUN pnpm build

   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run**:
   ```bash
   docker build -t couch-to-mcg-web .
   docker run -p 80:80 couch-to-mcg-web
   ```

### Environment Variables (Web)

For Firebase sync, add these environment variables:

**Vercel/Netlify**:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`

**Local Development** (`.env.local`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
```

## Mobile App Deployment

### Prerequisites

1. **Install Expo CLI**:
   ```bash
   npm install -g expo-cli eas-cli
   ```

2. **Create Expo account**: https://expo.dev/signup

3. **Login**:
   ```bash
   eas login
   ```

### Option 1: Expo Go (Development)

For testing and development:

1. **Start development server**:
   ```bash
   cd packages/mobile
   pnpm start
   ```

2. **Scan QR code** with Expo Go app on your phone

**Limitations**:
- Requires Expo Go app
- Cannot use custom native modules
- Not suitable for production

### Option 2: EAS Build (Production)

For production builds and app store submission:

#### iOS Deployment

1. **Configure EAS**:
   ```bash
   cd packages/mobile
   eas build:configure
   ```

2. **Create build**:
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

**Requirements**:
- Apple Developer Account ($99/year)
- App Store Connect access
- Bundle identifier (e.g., `com.yourcompany.couchtomcg`)

#### Android Deployment

1. **Create build**:
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android
   ```

**Requirements**:
- Google Play Developer Account ($25 one-time)
- Signed APK or AAB
- App bundle identifier

### Build Configuration

Create `eas.json` in `packages/mobile`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### App Configuration

Update `app.json` in `packages/mobile`:

```json
{
  "expo": {
    "name": "Couch to MCG",
    "slug": "couch-to-mcg",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.couchtomcg",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.couchtomcg",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      }
    }
  }
}
```

### Over-The-Air Updates

Expo supports OTA updates for bug fixes without app store review:

1. **Configure updates** in `app.json`:
   ```json
   {
     "expo": {
       "updates": {
         "url": "https://u.expo.dev/your-project-id"
       }
     }
   }
   ```

2. **Publish update**:
   ```bash
   eas update --branch production --message "Bug fixes"
   ```

3. **Users get updates** automatically on next app launch

## Firebase Setup (Optional Sync)

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose production mode
4. Select a location

### 3. Configure Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/data/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Get Configuration

1. Go to Project Settings → General
2. Scroll to "Your apps"
3. Click "Web" icon to add web app
4. Copy the Firebase config

### 5. Add to Environment Variables

**Web** (`.env.local`):
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=couch-to-mcg
VITE_FIREBASE_AUTH_DOMAIN=couch-to-mcg.firebaseapp.com
```

**Mobile** (`app.config.js`):
```javascript
export default {
  expo: {
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    }
  }
}
```

### 6. Implement Firebase in Code

Update `packages/web/src/services/FirebaseSyncService.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
});

const db = getFirestore(app);
```

## Monitoring & Analytics

### Web Analytics

**Google Analytics**:
```bash
cd packages/web
pnpm add @vercel/analytics
```

Add to `App.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

### Mobile Analytics

**Expo Analytics**:
```bash
cd packages/mobile
pnpm add expo-analytics
```

## Performance Optimization

### Web

1. **Enable compression** in Vite config:
   ```typescript
   export default defineConfig({
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom'],
           },
         },
       },
     },
   });
   ```

2. **Add service worker** for offline support
3. **Optimize images** with WebP format
4. **Enable caching** headers

### Mobile

1. **Optimize images** with `expo-optimize`
2. **Enable Hermes** engine (default in Expo)
3. **Reduce bundle size** with tree shaking
4. **Use production builds** for testing

## Continuous Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build:core
      - run: pnpm build:web
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  build-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build:core
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: cd packages/mobile && eas build --platform all --non-interactive
```

## Troubleshooting

### Web Build Fails

- Check Node.js version (>= 18)
- Clear node_modules and reinstall: `pnpm install --force`
- Check for TypeScript errors: `pnpm type-check`

### Mobile Build Fails

- Update Expo SDK: `cd packages/mobile && expo upgrade`
- Clear cache: `expo start -c`
- Check EAS build logs: `eas build:list`

### Firebase Connection Issues

- Verify API keys are correct
- Check Firestore security rules
- Enable required Firebase services
- Check browser console for errors

## Cost Estimates

### Free Tier

- **Vercel**: Unlimited personal projects
- **Netlify**: 100GB bandwidth/month
- **Firebase**: 1GB storage, 50K reads/day
- **Expo**: Unlimited development builds

### Paid Tier (if needed)

- **Vercel Pro**: $20/month
- **Firebase Blaze**: Pay-as-you-go
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **EAS Build**: Free for open source, $29/month otherwise

## Security Checklist

- [ ] Environment variables not committed to git
- [ ] Firebase security rules configured
- [ ] HTTPS enabled for web app
- [ ] API keys restricted to specific domains
- [ ] User authentication implemented (if using sync)
- [ ] Data encryption enabled (if storing sensitive data)
- [ ] Regular dependency updates
- [ ] Security headers configured

## Next Steps

1. Choose deployment platform (Vercel recommended for web)
2. Set up Firebase project (if using sync)
3. Configure environment variables
4. Deploy web app
5. Build mobile app with EAS
6. Submit to app stores
7. Set up monitoring and analytics
8. Configure CI/CD pipeline

---

For questions or issues, please open an issue on GitHub.
