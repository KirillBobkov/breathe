# CLAUDE.md

## Project Overview

Breathing training app built with React + Vite + TypeScript. Features a dynamic preset-based system where users can create custom breathing patterns with configurable phases. No backend required — fully client-side with dark/light theme support and PWA capabilities.

## Architecture

### Directory Structure

Modular (non-FSD) structure:
- `/src/app/` — Main App component and app-level styles
- `/src/components/` — Reusable UI components (Button, Modal, Icon, etc.)
- `/src/features/` — Feature-specific modules
  - `breathing-executor/` — Runtime breathing UI (circle, phase display, controls)
  - `preset-management/` — Preset CRUD operations
  - `pwa/` — PWA update banner and hooks
- `/src/entities/` — Domain entities (preset)
- `/src/shared/` — Shared utilities
  - `audio/` — Audio system with Web Audio API
  - `pwa/` — PWA utilities and types
  - `state-machine/` — State machine types
  - `theme/` — Theme management (dark/light)
  - `timer/` — DriftCorrectedTimer
  - `utils/` — General utilities
- `/src/store/` — Zustand state management
- `/src/styles/` — Global styles and CSS variables

### State Management

- **Zustand** (`useBreathingStore.ts`) — Centralized store for breathing state
- All business logic lives in store/features, NOT in components

### Timer Engine

**DriftCorrectedTimer** (`src/shared/timer/DriftCorrectedTimer.ts`)
- Uses `Date.now()` for drift correction (never naive decrement)
- Isolated and unit-testable
- Handles pause/resume with accurate time tracking

### State Machine

```
IDLE -> READY -> RUNNING/PAUSED -> COMPLETED -> IDLE
```

## Common Commands

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (http://localhost:5173)
npm run dev:pwa       # Start dev server with PWA enabled
npm run build         # Production build
npm run preview       # Preview production build
npm run preview:pwa   # Test production build locally with PWA (serve -s dist -l 4173)
npm run test          # Run Vitest tests
npm run test:ui       # Vitest UI mode
npm run test:coverage # Run tests with coverage report
npm run lint          # Run ESLint
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/shared/timer/DriftCorrectedTimer.ts` | Core timing engine with drift correction |
| `src/store/useBreathingStore.ts` | Zustand store with all breathing logic |
| `src/entities/preset/preset.types.ts` | Domain type definitions |
| `src/features/breathing-executor/` | Runtime breathing UI (circle, phase display, controls) |
| `src/features/preset-management/` | Preset CRUD operations |
| `src/features/pwa/` | PWA update management |
| `src/shared/audio/AudioPlayer.ts` | Web Audio API sound system |
| `src/shared/theme/useTheme.ts` | Theme management hook |
| `src/app/App.tsx` | Main app component |

## Important Constraints

1. **NO hardcoded phases** — All breathing patterns are fully dynamic from presets
2. Timer must be isolated and unit-testable (no React dependencies)
3. All business logic in store/features — components are presentation only
4. Use `Date.now()` for drift correction — never naive time decrement
5. Theme is user-selectable (dark/light) — persists in localStorage

## Testing

- Use `vi.useFakeTimers()` for timer tests
- Mock `Date.now()` for drift correction tests
- Reset store state in `beforeEach` hooks
- Test files: `*.test.ts` alongside source files

## Domain Model

### Preset
```typescript
{
  id: string
  name: string
  phases: Phase[]
  totalCycles?: number  // undefined = infinite
  description?: string  // Optional description
  themeColor?: string  // Optional color for UI
  createdAt: number    // Unix timestamp
  updatedAt: number    // Unix timestamp
}
```

### Phase
```typescript
{
  id: string
  name: string
  duration: number
  unit: 'seconds' | 'minutes'  // NOT milliseconds!
}
```

### Example Preset (4-7-8 Breathing)
```typescript
{
  id: '4-7-8',
  name: '4-7-8 Breathing',
  phases: [
    { id: 'inhale', name: 'Inhale', duration: 4, unit: 'seconds' },
    { id: 'hold', name: 'Hold', duration: 7, unit: 'seconds' },
    { id: 'exhale', name: 'Exhale', duration: 8, unit: 'seconds' }
  ],
  totalCycles: 4,
  description: 'Relaxing breathing pattern for sleep',
  themeColor: '#7a9e8a',
  createdAt: 1745078400000,
  updatedAt: 1745078400000
}
```

## Audio System

The app uses Web Audio API to generate sounds without external audio files.

```typescript
// File: src/shared/audio/AudioPlayer.ts
import { AudioPlayer } from '@/shared/audio'

const player = new AudioPlayer({ volume: 0.5, enabled: true })
player.init() // Required for AudioContext on mobile
player.play('inhale') // Sound on phase change
player.play('complete') // Sound on completion
player.setVolume(0.8) // 0.0 to 1.0
player.setEnabled(false) // Mute sounds
```

**Sound types:**
- `inhale` — Ascending tone (392Hz → 523Hz, sine wave, 0.5s)
- `complete` — Completion chime (523Hz → 659Hz, sine wave, 0.7s)

**Important:** AudioContext requires initialization via user interaction on mobile devices. Call `init()` on first user gesture (click, tap).

## Theme System

The app supports dark and light themes with CSS variables.

```typescript
// File: src/shared/theme/useTheme.ts
import { useTheme } from '@/shared/theme'

const { theme, toggleTheme, isDark, isLight } = useTheme()

// CSS variables:
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #d4d4d4;
  --accent: #7a9e8a;
}
[data-theme="light"] {
  --bg-primary: #efedea;
  --text-primary: #5d5a6e;
  --accent: #90bc9f;
}
```

**Components:**
- `ThemeToggle` — Theme switch button in header
- Theme persists in localStorage
- Default: dark

## Animations

CSS animations defined in `src/styles/variables.css` and component modules.

```css
/* Transition durations */
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-normal: 250ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

**Key animations:**
- `pulse` — Phase text pulse when time is urgent
- `breatheExpand` — Breathing circle expansion/contraction
- `waveExpand1/2/3` — Concentric waves around the circle
- `idlePulseExpand1/3` — Idle state pulse effect
- `yinYangRotatePulse` — Yin-yang rotation in idle state
- `slideIn` — Element appearance
- `fadeIn` — Fade transition
- `spin` — Loading indicator rotation

**Files with animations:**
- `CircularProgress.module.css` — Breathing circle, waves, yin-yang
- `BreathingDisplay.module.css` — Phase text pulse
- `PwaBanner.module.css` — Update banner animations
- `CompletionSummary.module.css` — Completion animation

## PWA (Progressive Web App)

The app can be installed as a PWA with offline support.

```typescript
// File: src/features/pwa/hooks/usePWAUpdate.ts
import { usePWAUpdate } from '@/features/pwa'

const { isUpdateAvailable, isUpdating, applyUpdate, dismissUpdate } = usePWAUpdate()
```

**Commands:**
- `npm run dev:pwa` — Dev server with service worker
- `npm run preview:pwa` — Test production build locally

**Installation:**
- **iOS Safari:** Share → Add to Home Screen
- **Desktop/Android:** Install icon in address bar

**Note:** No automatic installation banner (beforeinstallprompt not implemented). Update banner appears when new version is available.

## Development Notes

- The app cycles through all phases in a preset, then repeats if totalCycles > 1
- Visual feedback via animated circle that expands/contracts with each phase
- Phase progress shown as countdown
- Preset management allows full CRUD with localStorage persistence
- Audio feedback on phase changes and completion (configurable)
- Theme persists across sessions
