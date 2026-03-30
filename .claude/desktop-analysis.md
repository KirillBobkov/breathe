# Desktop Style Analysis
## Breathing Exercise Application

Дата анализа: 2026-03-30

---

## 1. Ключевые стили для десктопа

### 1.1 Спейсинг (Spacing)

```css
/* Базовая система отступов из variables.css */
--spacing-xs: 0.25rem    /* 4px */
--spacing-sm: 0.5rem     /* 8px */
--spacing-md: 1rem       /* 16px */
--spacing-lg: 1.5rem     /* 24px */
--spacing-xl: 2rem       /* 32px */
--spacing-2xl: 3rem      /* 48px */
```

**Рекомендуемые значения для десктопа:**
- Паддинг контейнеров: `var(--spacing-lg)` (24px) - обеспечивает достаточное "воздух" вокруг контента
- Внутренние отступы карточек: `var(--spacing-md)` (16px) - оптимально для читаемости
- Отступы между элементами: `var(--spacing-md)` - `var(--spacing-xl)` (16-32px)

### 1.2 Размеры компонентов (Component Sizes)

**Сайдбар:**
```css
.sidebar {
  width: 320px;  /* Фиксированная ширина для десктопа */
}
```
Это значение критично сохранять - обеспечивает достаточно места для списка пресетов и названий.

**Главный контент:**
```css
.main {
  padding: var(--spacing-lg);  /* 24px */
}
```

**Максимальные ширины контейнеров:**
```css
/* Ready state */
.readyContainer {
  max-width: 500px;
}

/* Exercise state */
.exerciseContainer {
  max-width: 600px;
}

/* Modal (PresetEditor) */
.modal {
  max-width: 640px;
}
```

**Управляющие кнопки (Controls):**
```css
.button {
  min-width: 80px;
  min-height: 80px;
}

.button[data-variant="primary"] {
  min-width: 100px;
  min-height: 100px;
}
```

### 1.3 Breakpoints

```css
/* Tablet/mobile breakpoint */
@media (max-width: 768px) {
  /* Мобильные стили */
}

/* Small mobile breakpoint */
@media (max-width: 480px) {
  /* Мобильные стили */
}

/* Very small mobile */
@media (max-width: 360px) {
  /* Мобильные стили */
}
```

**Рекомендация:** Десктоп = всё, что > 768px. Именно для этого размера сохранять текущие стили.

---

## 2. Элементы, критично важные для десктопа

### 2.1 Layout Structure (App.module.css)

**Двухколоночный layout:**
```css
.layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;  /* Важно! Предотвращает сжатие */
}

.main {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}
```

**Header:**
```css
.header {
  padding: var(--spacing-md) var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 10;
}
```

### 2.2 Breathing Display (BreathingDisplay.module.css)

Для десктопа используются дефолтные размеры SVG (не уменьшаются):

```css
.circleWrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeRemaining {
  font-size: var(--font-size-4xl);  /* 48px - ключевой размер для десктопа */
  font-variant-numeric: tabular-nums;  /* Важно для предотвращения "дёргания" цифр */
}

.phaseName {
  font-size: var(--font-size-lg);  /* 22px */
  font-weight: var(--font-weight-semibold);
}
```

**Анимации (сохранить):**
```css
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### 2.3 Controls (Controls.module.css)

Критичные размеры для десктопа:
```css
.controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);  /* 16px между кнопками */
}

.button {
  min-width: 80px;
  min-height: 80px;
  border-radius: var(--radius-xl);  /* 16px - скруглённые углы */
}

.button[data-variant="primary"] {
  min-width: 100px;
  min-height: 100px;
}

.icon {
  width: 28px;
  height: 28px;
}

.label {
  font-size: var(--font-size-sm);  /* 16px */
  font-weight: var(--font-weight-semibold);
}
```

### 2.4 Preset Items (PresetItem.module.css)

```css
.item {
  padding: var(--spacing-md) 1.25rem;  /* 16px 20px */
  gap: var(--spacing-md);  /* 16px */
  border-radius: var(--radius-lg);  /* 12px */
}

.deleteButton {
  width: 36px;
  height: 36px;
}
```

### 2.5 Modal (PresetEditor.module.css & Modal.module.css)

```css
/* PresetEditor modal */
.modal {
  max-width: 640px;
  max-height: 90vh;
  border-radius: var(--radius-xl);  /* 16px */
}

/* Generic modal */
.modal.small { width: 400px; }
.modal.medium { width: 600px; }
.modal.large { width: 800px; }
```

---

## 3. Рекомендации по минимальным размерам для десктоп-версии

### 3.1 Минимальная ширина viewport

**Рекомендуемая минимальная ширина:** 1024px

**Обоснование:**
- Сайдбар: 320px
- Отступ слева: 24px
- Контент: 600px (max-width для exercise)
- Отступ справа: 24px
- **Итого:** ~968px + запас

### 3.2 Размеры clickable элементов

| Тип элемента | Минимальный размер (desktop) |
|--------------|------------------------------|
| Кнопки управления | 80x80px (primary: 100x100px) |
| Кнопки действий | 36x36px (delete) |
| Preset items | высота ~72px (padding + content) |
| Touch target | не менее 44x44px (WCAG) |

### 3.3 Размеры текста

```css
/* Заголовки */
--font-size-xl: 1.5rem      /* 24px - page title */
--font-size-2xl: 1.75rem    /* 28px - section title */

/* Тело */
--font-size-md: 1.125rem    /* 18px - body */
--font-size-sm: 1rem        /* 16px - secondary */

/* Таймер */
--font-size-4xl: 3rem       /* 48px - CRITICAL для десктопа */
```

### 3.4 Отступы для десктопа

| Контекст | Значение |
|----------|----------|
| Padding main container | 24px (var(--spacing-lg)) |
| Gap между controls | 16px (var(--spacing-md)) |
| Margin готового контейнера | 48px (var(--spacing-2xl)) сверху |
| Header padding | 16px 24px |

---

## 4. Цветовая схема (сохранить)

```css
/* Основные */
--bg-primary: #1a1a2e
--bg-secondary: #16213e
--bg-tertiary: #0f3460
--accent: #e94560

/* Breathing phase colors */
--breathing-inhale: #4ade80
--breathing-hold: #60a5fa
--breathing-exhale: #e94560
--breathing-pause: #a78bfa
```

---

## 5. Что НЕ изменяется на десктопе (mobile-only)

Эти стили применяются только при `max-width: 768px` и НЕ должны влиять на десктоп:

- `.mobileMenuButton` - скрыт на десктопе (`display: none`)
- `.sidebar` - не фиксированная позиция
- `.overlay` - скрыт на десктопе
- Уменьшенные размеры SVG
- Уменьшенные размеры кнопок controls
- Stack direction для readyInfo

---

## 6. Чек-лист для сохранения десктопных стилей

- [ ] Сайдбар шириной 320px
- [ ] Padding главного контента 24px
- [ ] Максимальная ширина контейнера 500-600px
- [ ] Кнопки управления 80x80px (primary: 100x100px)
- [ ] Размер таймера 48px (--font-size-4xl)
- [ ] Gap между элементами 16px
- [ ] Border-radius для кнопок 16px (--radius-xl)
- [ ] Анимации breathe и pulse
- [ ] Flex layout для двухколоночной структуры
- [ ] Tabular-nums для таймера (предотвращает сдвиг цифр)

---

## 7. Потенциальные улучшения для десктопа (опционально)

1. **Hover эффекты** - уже хорошо реализованы (transform translateY)
2. **Focus-visible** - уже есть для accessibility
3. **Тени** - хорошо проработаны (shadow-sm/xl)
4. **Scrollbar** - кастомизация в PresetEditor.module.css
5. **Возможное добавление:** более крупные breakpoints (1200px, 1440px) для ultra-wide мониторов
