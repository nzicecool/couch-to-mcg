# CouchToMCG PWA - Design Concepts

## Selected Design Approach: **Athletic Minimalism with Energetic Accents**

### Design Movement
Modern athletic UI inspired by premium running apps (Strava, Nike Run Club) combined with minimalist design principles. Clean, purposeful, and focused on data visualization with energetic accent colors to celebrate progress.

### Core Principles
1. **Progressive Disclosure**: Show only what's needed for today's task, with deeper details on demand
2. **Celebration of Progress**: Visual feedback for every achievement, from completing a run to hitting milestones
3. **Accessibility First**: High contrast, readable fonts, and clear touch targets for mobile use
4. **Offline-First Mindset**: Design assumes the app works anywhere, anytime

### Color Philosophy
- **Primary**: Emerald Green (#10b981) - represents growth, vitality, and forward momentum
- **Secondary**: Slate Gray (#1e293b) - professional, grounded, reduces cognitive load
- **Accent**: Amber (#f59e0b) - highlights achievements and milestones
- **Background**: Off-white (#f8fafc) - reduces eye strain, premium feel
- **Text**: Deep slate (#0f172a) - high contrast, readable

**Emotional Intent**: The palette evokes health, growth, and achievement. Emerald suggests natural vitality; amber celebrates wins.

### Layout Paradigm
- **Mobile-First Card Stack**: Vertical scrolling with contextual cards that reveal information progressively
- **Today-Centric Hub**: Large, prominent "Today's Task" card at the top
- **Asymmetric Spacing**: Varied card sizes and spacing create visual interest without clutter
- **Sticky Header**: PIN lock status and user initials always visible

### Signature Elements
1. **Progress Ring**: Circular progress indicator showing overall training completion (animated on load)
2. **Activity Badges**: Small, colorful icons for each activity type (run, gym, rest, etc.)
3. **Stat Cards**: Minimalist stat cards with large numbers and subtle icons

### Interaction Philosophy
- **Haptic Feedback Simulation**: Smooth transitions and scale animations on button presses
- **Swipe-Friendly**: Large touch targets, minimal precision required
- **Instant Feedback**: No loading states for local operations; data persists immediately
- **Celebration Moments**: Confetti-like animations when completing a run

### Animation Guidelines
- **Entrance**: Fade-in + slight scale-up (200ms) for cards on page load
- **Interactions**: Scale (95% → 100%) on button press, 150ms duration
- **Progress Updates**: Smooth number transitions (1s) when stats update
- **Transitions**: 300ms ease-out for page changes and modal opens

### Typography System
- **Display**: "Geist" or system sans-serif, 700 weight, 2.5rem+ for headers (e.g., progress percentage)
- **Heading**: "Geist" or system sans-serif, 600 weight, 1.5rem for section titles
- **Body**: "Geist" or system sans-serif, 400 weight, 1rem for descriptions
- **Small**: 0.875rem for secondary info and labels
- **Hierarchy**: Bold numbers for stats, regular text for descriptions

---

## Design Rationale
This design balances **functionality with motivation**. The emerald-and-slate palette is professional yet energetic. The card-based layout works beautifully on mobile and scales to tablet/desktop. The focus on "today's task" keeps users motivated and engaged, while stats provide long-term perspective. PIN authentication is seamlessly integrated into the header without disrupting the main experience.
