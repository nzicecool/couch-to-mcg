# Quick Start Guide - Couch to MCG

Get up and running with the Couch to MCG training app in minutes!

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** (install with `npm install -g pnpm`)
- For mobile: **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Installation

```bash
# Clone the repository
git clone https://github.com/nzicecool/couch-to-mcg.git
cd couch-to-mcg

# Install dependencies
pnpm install

# Build the core package
pnpm build:core
```

## Running the Web App

```bash
# Start the development server
pnpm dev:web

# Open your browser to http://localhost:3000
```

The web app will automatically save your data locally using IndexedDB. No account or internet connection required!

## Running the Mobile App

```bash
# Start the Expo development server
pnpm dev:mobile

# Scan the QR code with Expo Go app on your phone
```

Your training data is stored locally on your device using SQLite.

## First Time Setup

When you first open the app:

1. **Enter your name** (e.g., "Alex Runner")
2. **Set your goal time** (e.g., "1:45:00" for 1 hour 45 minutes)
3. **Add your shoe model** (optional, e.g., "Nike Pegasus 40")
4. Click **Save Profile**

Your personalized training schedule will be generated automatically!

## Using the App

### Today's Task

The app highlights today's workout at the top. You'll see:
- The activity type (e.g., "Easy Run", "Long Run", "Rest Day")
- Distance or duration
- Training tips and advice

Click **Mark as Complete** when you finish the workout.

### Training Schedule

Scroll down to see your complete training schedule leading to race day (October 11, 2026). Each week shows:
- Days of the week
- Workout types
- Distances
- Completion status (✓ for completed)

### Logging Your Runs

Click on any completed run to add details:
- **Notes**: How did it feel? Any observations?
- **Effort**: Rate from 1-10 (1 = very easy, 10 = maximum effort)

### Custom Workouts

Don't like a scheduled workout? Click on any day to:
- Change the activity type
- Modify the distance
- Add a custom activity
- Mark as rest day

### Statistics

View your progress:
- **This Week**: Runs completed and total distance
- **All Time**: Total workouts and cumulative distance

### Reset Data

Need to start over? Click **Reset All Data** at the bottom (warning: this cannot be undone!).

## Tips for Success

### Training Principles

**Consistency is key**: Regular training beats sporadic hard efforts. Stick to the schedule as much as possible.

**Listen to your body**: Feeling tired or sore? It's okay to take an extra rest day or reduce intensity.

**Progressive overload**: The schedule gradually increases your mileage. Trust the process and don't rush.

**Rest days matter**: Recovery is when your body gets stronger. Never skip rest days.

### Race Day Preparation

**Practice nutrition**: Test your race day fueling strategy on long runs. Never try anything new on race day.

**Get proper shoes**: Visit a running specialty store for gait analysis and proper fitting. Replace shoes every 500-800km.

**Taper properly**: The final two weeks reduce volume to arrive fresh on race day. Don't panic about "losing fitness."

**Race day checklist**: Lay out your gear the night before. Arrive early. Start conservatively. Enjoy the experience!

## Troubleshooting

### Web App

**Q: My data disappeared!**  
A: Check if you're using the same browser. IndexedDB data is browser-specific. Consider enabling cloud sync (see README).

**Q: The app is slow**  
A: Clear your browser cache and reload. Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge).

**Q: Can I use this on multiple devices?**  
A: Yes! Enable Firebase sync by following the deployment guide. Otherwise, data stays local to each device.

### Mobile App

**Q: The app won't load**  
A: Make sure you have the latest Expo Go app. Try restarting the Expo development server.

**Q: My data disappeared after an update**  
A: SQLite data persists across updates. If you uninstalled the app, data is lost. Enable cloud sync to prevent this.

**Q: Can I use this offline?**  
A: Yes! Both web and mobile apps work completely offline. Data is stored locally.

## Next Steps

### For Users

- **Customize your schedule**: Adjust workouts to fit your lifestyle
- **Track your progress**: Log notes and effort for each run
- **Stay motivated**: Check off completed workouts and watch your stats grow
- **Join the community**: Share your progress on social media with #CouchToMCG

### For Developers

- **Read the architecture docs**: Understand the monorepo structure
- **Explore the code**: Check out the core, web, and mobile packages
- **Add features**: Follow the development guide in README.md
- **Deploy to production**: Use the deployment guide for hosting

### Enable Cloud Sync (Optional)

Want to sync your data across devices? Follow these steps:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Install Firebase SDK: `cd packages/web && pnpm add firebase`
4. Add your Firebase config to environment variables
5. Implement the Firebase methods in `FirebaseSyncService.ts`

See `DEPLOYMENT.md` for detailed instructions.

## Support

- **Issues**: [GitHub Issues](https://github.com/nzicecool/couch-to-mcg/issues)
- **Documentation**: See README.md, ARCHITECTURE.md, and DEPLOYMENT.md
- **Questions**: Open a discussion on GitHub

## Training Schedule Overview

Your training plan is divided into three phases:

### Phase 1: Base Building (Feb-Apr 2026)
Focus on building aerobic fitness with easy runs and progressive long runs. 2-3 runs per week.

### Phase 2: Strength & Power (May-Jul 2026)
Add hill repeats and gym workouts. Increase weekly mileage. 3-4 sessions per week.

### Phase 3: Taper & Peak (Aug-Oct 2026)
Peak mileage followed by taper. Race-specific workouts. Final preparation for race day.

## Race Day: October 11, 2026

**Melbourne Half Marathon** - You've got this! 🏃‍♂️🏃‍♀️

---

**Good luck with your training!** Remember: The journey from couch to MCG is about progress, not perfection. Every run counts, every rest day matters, and race day will be here before you know it.

*Made with ❤️ for runners everywhere.*
