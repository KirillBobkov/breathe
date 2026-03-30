# CLAUDE.md

## Project Overview

Breathing training app built with React + Vite + TypeScript. Features a dynamic preset-based system where users can create custom breathing patterns with configurable phases. No backend required — fully client-side with dark mode only.

## Architecture

### Directory Structure

Modular (non-FSD) structure:
- `/components` — Reusable UI components
- `/features` — Feature-specific modules (breathing-executor, preset-management)
- `/entities` — Domain entities (preset)
- `/shared` — Shared utilities (timer, types)
- `/store` — Zustand state management
- `/utils` — General utilities

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
npm run build         # Production build
npm run test          # Run Vitest tests
npm run test:ui       # Vitest UI mode
npm run lint          # Run ESLint
```

## Key Files

| Path | Purpose |
|------|---------|
| `src/shared/timer/DriftCorrectedTimer.ts` | Core timing engine with drift correction |
| `src/store/useBreathingStore.ts` | Zustand store with all breathing logic |
| `src/entities/preset/preset.types.ts` | Domain type definitions |
| `src/features/breathing-executor/` | Runtime breathing UI (circle, phase display) |
| `src/features/preset-management/` | Preset CRUD operations |
| `src/App.tsx` | Main app routing |

## Important Constraints

1. **NO hardcoded phases** — All breathing patterns are fully dynamic from presets
2. Timer must be isolated and unit-testable (no React dependencies)
3. All business logic in store/features — components are presentation only
4. Use `Date.now()` for drift correction — never naive time decrement
5. Dark mode only — no light mode toggle needed

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
}
```

### Phase
```typescript
{
  id: string
  name: string
  duration: number
  unit: 'seconds' | 'milliseconds'
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
  totalCycles: 4
}
```

## Development Notes

- The app cycles through all phases in a preset, then repeats if totalCycles > 1
- Visual feedback via animated circle that expands/contracts with each phase
- Phase progress shown as countdown
- Preset management allows full CRUD with localStorage persistence
