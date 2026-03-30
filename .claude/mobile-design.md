# Mobile Design System - Breathing App

## 1. Current Issues for Mobile Devices

### 1.1 Spacing Issues (480px and below)

| Location | Current Value | Issue | Recommended |
|----------|---------------|-------|-------------|
| `App.main` padding | `var(--spacing-lg)` = 1.5rem (24px) | Too large for 360px screens | 12px on 480px, 8px on 360px |
| `App.readyContainer` margin-top | `var(--spacing-2xl)` = 3rem (48px) | Excessive vertical space | 16px on mobile |
| `App.readyInfo` gap | `var(--spacing-xl)` = 2rem (32px) | Too wide for stacked layout | 12px on mobile |
| `App.exerciseContainer` margin-top | `var(--spacing-xl)` = 2rem (32px) | Wastes vertical space | 8px on mobile |
| `App.startButton` padding | `var(--spacing-md) var(--spacing-xl)` = 1rem 2rem | Too large | 0.75rem 1.25rem |

### 1.2 Font Size Issues

| Component | Current Value | Issue | Recommended |
|-----------|---------------|-------|-------------|
| `App.title` | `var(--font-size-xl)` = 1.5rem (24px) | Too large for header on 360px | 1.125rem (18px) on 480px |
| `App.readyTitle` | `var(--font-size-2xl)` = 1.75rem (28px) | Slightly large | 1.5rem on 480px |
| `BreathingDisplay.timeRemaining` | `var(--font-size-4xl)` = 3rem (48px) | Already has 480px media query | Good, but can be improved for 360px |
| `PresetEditor.title` | `var(--font-size-xl)` = 1.5rem | Fine, but padding around too large | Reduce padding |
| `CompletionSummary.title` | `var(--font-size-2xl)` | Has 480px media query | Good |

### 1.3 Component Size Issues

| Component | Current Value | Issue | Recommended |
|-----------|---------------|-------|-------------|
| `Controls.button` | 80x80px (70x70px on 480px) | Still large for 360px | 60x60px on 360px |
| `Controls.button[data-variant="primary"]` | 100x100px (85x85px on 480px) | Dominates screen | 72x72px on 360px |
| `PresetEditor.modal` | max-width: 640px, padding: `var(--spacing-xl)` | No mobile optimization | Full width with reduced padding |
| `PresetEditor.header` padding | `1.25rem var(--spacing-xl)` = 1.25rem 2rem | Too much horizontal padding | 1rem on 480px, 0.75rem on 360px |
| `PhaseItem.inputs` grid | `2fr minmax(140px, 1fr) 80px` | minmax(140px) breaks layout | Change to minmax(80px, 1fr) |
| `PhaseItem.select` padding-right | 1.5rem for arrow | Can be reduced | 1.25rem |

### 1.4 Modal Issues

| Component | Issue | Recommended |
|-----------|-------|-------------|
| `Modal.modal` | max-width: 90vw, but .small/.medium have fixed widths | Fixed widths don't scale | Use percentage-based widths |
| `PresetEditor.modal` | max-width: 640px with large padding | Content area too small on 360px | Full width minus 16px |

---

## 2. Recommended Mobile CSS Variables

Add to `src/styles/variables.css`:

```css
/* Mobile-specific spacing */
--spacing-mobile-xs: 0.125rem;   /* 2px - tightest spacing */
--spacing-mobile-sm: 0.25rem;    /* 4px - very tight */
--spacing-mobile-md: 0.5rem;     /* 8px - standard mobile spacing */
--spacing-mobile-lg: 0.75rem;    /* 12px - comfortable spacing */
--spacing-mobile-xl: 1rem;       /* 16px - section spacing */
--spacing-mobile-2xl: 1.25rem;   /* 20px - large sections */

/* Mobile-specific font sizes */
--font-size-mobile-xs: 0.75rem;  /* 12px */
--font-size-mobile-sm: 0.875rem; /* 14px */
--font-size-mobile-md: 1rem;     /* 16px */
--font-size-mobile-lg: 1.125rem; /* 18px */
--font-size-mobile-xl: 1.25rem;  /* 20px */
--font-size-mobile-2xl: 1.5rem;  /* 24px */
--font-size-mobile-3xl: 2rem;    /* 32px */

/* Mobile-specific border radius */
--radius-mobile-sm: 0.25rem;
--radius-mobile-md: 0.5rem;
--radius-mobile-lg: 0.75rem;

/* Touch target sizes (minimum 44px for iOS) */
--touch-target-sm: 44px;
--touch-target-md: 48px;
--touch-target-lg: 52px;
```

---

## 3. Module-by-Module Optimization Plan

### 3.1 App.module.css

**Current Issues:**
- Large padding on `.main`
- Excessive margins on containers
- Info items not optimized for smallest screens

**Changes to Add:**

```css
/* @media (max-width: 480px) - existing, add: */
.main {
  padding: 12px;
}

.readyContainer {
  margin-top: 16px;
  max-width: 100%;
}

.readyTitle {
  font-size: 1.5rem; /* var(--font-size-xl) */
}

.readyDescription {
  font-size: var(--font-size-sm);
}

.readyInfo {
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
}

.phasesPreview {
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.phaseChip {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
}

/* @media (max-width: 360px) - NEW: */
.header {
  padding: 8px 12px;
}

.title {
  font-size: 1.125rem; /* 18px */
}

.main {
  padding: 8px;
}

.readyTitle {
  font-size: 1.25rem; /* 20px */
}

.readyDescription {
  font-size: 0.875rem; /* 14px */
}

.startButton {
  padding: 0.625rem 1rem;
  font-size: 1rem;
}

.exerciseContainer {
  margin-top: 4px;
  gap: var(--spacing-md);
}

.readyInfoItem {
  padding: 0 8px;
}
```

---

### 3.2 BreathingDisplay.module.css

**Current State:** Already has 480px and 360px media queries

**Improvements Needed:**

```css
/* @media (max-width: 480px) - replace existing: */
.container {
  padding: var(--spacing-md) 0;
}

.svg {
  width: 200px;
  height: 200px;
}

.phaseName {
  font-size: 1rem; /* var(--font-size-md) */
}

.timeRemaining {
  font-size: 2.25rem; /* between 2xl and 3xl */
}

/* @media (max-width: 360px) - replace existing: */
.svg {
  width: 160px;
  height: 160px;
}

.phaseName {
  font-size: 0.875rem; /* var(--font-size-sm) */
}

.timeRemaining {
  font-size: 2rem; /* var(--font-size-2xl) */
}
```

---

### 3.3 Controls.module.css

**Current Issues:** Button sizes still too large for 360px

**Changes to Add:**

```css
/* @media (max-width: 480px) - modify existing: */
.controls {
  gap: 8px;
}

.button {
  min-width: 64px;
  min-height: 64px;
  padding: 8px 12px;
}

.button[data-variant="primary"] {
  min-width: 72px;
  min-height: 72px;
}

.icon {
  width: 22px;
  height: 22px;
}

.label {
  font-size: 0.75rem; /* 12px */
}

/* @media (max-width: 360px) - NEW: */
.controls {
  gap: 6px;
}

.button {
  min-width: 56px;
  min-height: 56px;
  padding: 6px 8px;
  border-width: 1.5px;
}

.button[data-variant="primary"] {
  min-width: 64px;
  min-height: 64px;
}

.icon {
  width: 20px;
  height: 20px;
}

.label {
  font-size: 0.75rem; /* 12px - minimum legible */
}
```

---

### 3.4 PresetList.module.css

**Current Issues:** No mobile optimization

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.header {
  padding: 0 8px;
}

.title {
  font-size: 1.25rem; /* 20px */
}

.createButton {
  padding: 0.75rem;
  font-size: 1rem;
}

.empty {
  padding: 1.5rem 0.75rem;
  font-size: 0.875rem;
}

/* @media (max-width: 360px) - NEW: */
.title {
  font-size: 1.125rem; /* 18px */
}

.createButton {
  padding: 0.625rem;
  font-size: 0.875rem;
}

.createButtonIcon {
  font-size: 1.125rem;
}
```

---

### 3.5 PresetEditor.module.css

**Current Issues:** Large padding, fixed widths don't scale

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.overlay {
  padding: 8px;
}

.modal {
  max-width: calc(100vw - 16px);
  max-height: 95vh;
  border-radius: 16px;
}

.header {
  padding: 1rem 1rem;
}

.title {
  font-size: 1.25rem;
}

.subtitle {
  font-size: 0.875rem;
}

.content {
  padding: 1rem;
}

.formGroup {
  margin-bottom: 1rem;
}

.formGroupLabel {
  font-size: 0.875rem;
  margin-bottom: 6px;
}

.formGroupInput {
  padding: 0.625rem 0.75rem;
  font-size: 1rem;
}

.cyclesRow {
  gap: 0.75rem;
}

.cyclesInput {
  flex: 0 0 100px;
}

.infiniteCheckbox {
  width: 36px;
  height: 20px;
}

.infiniteCheckbox::before {
  width: 16px;
  height: 16px;
  top: 2px;
  left: 2px;
}

.infiniteCheckbox:checked::before {
  transform: translateX(16px);
}

.footer {
  padding: 1rem;
  gap: 0.5rem;
}

/* @media (max-width: 360px) - NEW: */
.modal {
  max-width: calc(100vw - 12px);
  border-radius: 12px;
}

.header {
  padding: 0.75rem;
}

.title {
  font-size: 1.125rem;
}

.content {
  padding: 0.75rem;
}

.formGroupInput {
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
}

.footer {
  padding: 0.75rem;
  flex-direction: column; /* Stack buttons vertically */
}

.footer button {
  width: 100%;
}
```

---

### 3.6 PhaseEditor.module.css

**Current Issues:** Grid columns too wide, no mobile optimization

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.header {
  margin-bottom: 6px;
  padding: 0 8px;
}

.phaseList {
  gap: 6px;
}

.addButton {
  padding: 0.5rem;
  margin-top: 6px;
  font-size: 0.875rem;
}

/* @media (max-width: 360px) - NEW: */
.addButton {
  font-size: 0.75rem;
}

.addButtonIcon {
  font-size: 0.875rem;
}
```

---

### 3.7 PhaseItem.module.css

**Critical Issue:** Grid columns break on small screens

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.item {
  padding: 0.5rem 0.625rem;
  gap: 6px;
}

.dragHandle {
  width: 18px;
  height: 28px;
}

.dragHandleIcon {
  width: 14px;
  height: 14px;
}

/* Stack inputs vertically on very small screens */
.inputs {
  grid-template-columns: 1fr;
  gap: 6px;
}

.input {
  padding: 0.5rem;
  font-size: 0.875rem;
}

.select {
  padding: 0.5rem 0.5rem 0.5rem 0.625rem;
  padding-right: 1.25rem;
  font-size: 0.875rem;
}

.durationInputWrapper {
  font-size: 0.875rem;
}

.inputDuration {
  font-size: 0.875rem;
}

.durationButton {
  width: 24px;
  height: 24px;
  font-size: 14px;
}

.deleteButton {
  width: 24px;
  height: 24px;
}

.deleteButtonIcon {
  font-size: 0.875rem;
}

/* @media (max-width: 360px) - NEW: */
.item {
  padding: 4px;
  border-radius: 6px;
}

.input,
.select {
  font-size: 0.75rem; /* 12px - minimum legible */
  padding: 4px 6px;
}

.durationButton {
  width: 20px;
  height: 20px;
  font-size: 12px;
}

.dragHandle {
  display: none; /* Hide drag handle on very small screens */
}
```

---

### 3.8 PresetItem.module.css

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.item {
  padding: 0.625rem 0.75rem;
  gap: 0.5rem;
}

.name {
  font-size: 1rem;
}

.phases {
  font-size: 0.875rem;
}

.meta {
  font-size: 0.75rem;
  gap: 0.375rem;
}

.deleteButton {
  width: 32px;
  height: 32px;
}

.deleteButtonIcon {
  font-size: 1.125rem;
}

/* @media (max-width: 360px) - NEW: */
.item {
  padding: 0.5rem;
}

.name {
  font-size: 0.875rem;
}

.phases {
  font-size: 0.75rem;
}

.deleteButton {
  width: 28px;
  height: 28px;
}

.deleteButtonIcon {
  font-size: 1rem;
}

.indicator {
  width: 6px;
  height: 6px;
}
```

---

### 3.9 Modal.module.css (UI Component)

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.modal {
  max-width: calc(100vw - 16px);
  max-height: 95vh;
  border-radius: 16px;
}

.modal.small {
  width: 100%;
  max-width: 360px;
}

.modal.medium {
  width: 100%;
  max-width: calc(100vw - 16px);
}

.modal.large {
  width: 100%;
  max-width: calc(100vw - 16px);
}

.header {
  padding: 1rem;
}

.title {
  font-size: 1.25rem;
}

.closeButton {
  width: 1.75rem;
  height: 1.75rem;
}

.closeButton svg {
  width: 1rem;
  height: 1rem;
}

.body {
  padding: 1rem;
}

/* @media (max-width: 360px) - NEW: */
.modal {
  max-width: calc(100vw - 12px);
  border-radius: 12px;
}

.header {
  padding: 0.75rem;
}

.title {
  font-size: 1.125rem;
}

.body {
  padding: 0.75rem;
}
```

---

### 3.10 CycleProgress.module.css

**Changes to Add:**

```css
/* @media (max-width: 360px) - NEW: */
.container {
  padding: 6px 0;
}

.label {
  font-size: 0.75rem;
}

.progressBar {
  max-width: 120px;
  height: 4px;
}

.infinity {
  font-size: 1.125rem;
}
```

---

### 3.11 PhaseIndicator.module.css

**Current State:** Already has 480px media query

**Additional Changes for 360px:**

```css
/* @media (max-width: 360px) - NEW: */
.container {
  padding: 4px 0;
}

.phase {
  padding: 2px 4px;
}

.phaseDot {
  width: 6px;
  height: 6px;
}

.phase[data-current="true"] .phaseDot {
  transform: scale(1.5);
  box-shadow: 0 0 6px var(--accent);
}

.phase[data-current="true"] .phaseName {
  font-size: 0.75rem;
}
```

---

### 3.12 CompletionSummary.module.css

**Current State:** Already has 480px media query with good defaults

**Minor Improvements:**

```css
/* @media (max-width: 360px) - NEW: */
.summary {
  padding: 0.75rem;
  margin: 0 8px;
}

.iconWrapper {
  width: 64px;
  height: 64px;
}

.icon {
  width: 36px;
  height: 36px;
}

.title {
  font-size: 1.25rem;
}

.statValue {
  font-size: 1.75rem;
}

.divider {
  height: 32px;
}

.button {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  min-height: 44px;
}

.buttonIcon {
  width: 16px;
  height: 16px;
}
```

---

### 3.13 Button.module.css (UI Component)

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.small {
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
}

.medium {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.large {
  padding: 0.75rem 1rem;
  font-size: 1rem;
}

/* @media (max-width: 360px) - NEW: */
.small {
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  min-height: 36px;
}

.medium {
  padding: 0.5rem 0.625rem;
  font-size: 0.75rem;
  min-height: 40px;
}

.large {
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  min-height: 44px;
}
```

---

### 3.14 Input.module.css (UI Component)

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.input {
  padding: 0.625rem 0.75rem;
  font-size: 1rem;
}

.errorText {
  font-size: 0.75rem;
  min-height: 1rem;
}

/* @media (max-width: 360px) - NEW: */
.input {
  padding: 0.5rem 0.625rem;
  font-size: 0.875rem;
}

.errorText {
  font-size: 0.625rem;
}
```

---

### 3.15 IconButton.module.css (UI Component)

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.small {
  width: 1.75rem;
  height: 1.75rem;
}

.small svg {
  width: 0.875rem;
  height: 0.875rem;
}

.medium {
  width: 2.25rem;
  height: 2.25rem;
}

.medium svg {
  width: 1.125rem;
  height: 1.125rem;
}

.large {
  width: 2.75rem;
  height: 2.75rem;
}

.large svg {
  width: 1.375rem;
  height: 1.375rem;
}

/* @media (max-width: 360px) - NEW: */
.small {
  width: 1.625rem;
  height: 1.625rem;
}

.medium {
  width: 2rem;
  height: 2rem;
}

.large {
  width: 2.5rem;
  height: 2.5rem;
}
```

---

### 3.16 Card.module.css (UI Component)

**Changes to Add:**

```css
/* @media (max-width: 480px) - NEW: */
.smallPadding {
  padding: 0.5rem;
}

.mediumPadding {
  padding: 0.75rem;
}

.largePadding {
  padding: 1rem;
}

/* @media (max-width: 360px) - NEW: */
.smallPadding {
  padding: 4px;
}

.mediumPadding {
  padding: 0.5rem;
}

.largePadding {
  padding: 0.75rem;
}
```

---

## 4. Summary Table of Mobile Values

| Property | Desktop | 480px | 360px |
|----------|---------|-------|-------|
| **Spacing** |
| --spacing-xs | 4px | 4px | 2px |
| --spacing-sm | 8px | 6px | 4px |
| --spacing-md | 16px | 12px | 8px |
| --spacing-lg | 24px | 16px | 12px |
| --spacing-xl | 32px | 20px | 16px |
| --spacing-2xl | 48px | 24px | 20px |
| **Font Sizes** |
| --font-size-xs | 14px | 12px | 11px |
| --font-size-sm | 16px | 14px | 12px |
| --font-size-md | 18px | 16px | 14px |
| --font-size-lg | 22px | 18px | 16px |
| --font-size-xl | 24px | 20px | 18px |
| --font-size-2xl | 28px | 24px | 20px |
| --font-size-3xl | 40px | 32px | 28px |
| --font-size-4xl | 48px | 36px | 32px |
| **Touch Targets** |
| Min button size | - | 44px | 40px |
| Min tap area | - | 44x44px | 40x40px |
| **Breathing Circle** |
| SVG size | 280px | 200px | 160px |
| **Controls** |
| Button size | 80-100px | 64-72px | 56-64px |
| Icon size | 28px | 22px | 20px |

---

## 5. Implementation Priority

### Phase 1: Critical (360px foundation)
1. `variables.css` - Add mobile variables
2. `App.module.css` - Layout and spacing fixes
3. `PhaseItem.module.css` - Grid column fix (breaks layout)
4. `PresetEditor.module.css` - Modal sizing

### Phase 2: High Impact
5. `Controls.module.css` - Button sizing
6. `BreathingDisplay.module.css` - Circle sizing refinements
7. `PresetItem.module.css` - List item sizing

### Phase 3: Polish
8. `CompletionSummary.module.css` - Final screen refinements
9. `Modal.module.css` - Generic modal improvements
10. UI components (Button, Input, IconButton, Card)

---

## 6. Mobile Testing Checklist

- [ ] Test at exactly 480px width
- [ ] Test at exactly 360px width
- [ ] Test at 320px (extreme case)
- [ ] Verify all text is readable (min 12px / 0.75rem)
- [ ] Verify all tap targets are >= 40px
- [ ] Check horizontal scrolling (should be none)
- [ ] Test modal fits on screen with virtual keyboard
- [ ] Verify breathing circle doesn't overflow
- [ ] Check phase inputs are usable on small screens
- [ ] Test drag-and-drop still works (PhaseItem)
- [ ] Verify no content is clipped
