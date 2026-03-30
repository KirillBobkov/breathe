# План внедрения адаптивной верстки
## Breathing Exercise Application

Дата: 2026-03-30

---

## 1. Стратегия

### 1.1 Подход
- **Mobile-first внутри медиа-запросов**: оптимизируем существующие стили для мобильных, не меняя базу
- **Прогрессивные media queries**: используем `max-width` breakpoints
- **CSS переменные**: расширяем существующую систему, не создаём параллельную

### 1.2 Breakpoints
```css
/* Существующие */
@media (max-width: 768px)  /* Tablet/Mobile - сайдбар становится оверлеем */
@media (max-width: 480px)  /* Mobile - базовые адаптации */
@media (max-width: 360px)  /* Small mobile - максимальная компрессия */
```

### 1.3 Что НЕ меняем (Desktop invariant)
- Сайдбар: 320px
- Padding главного контента: 24px
- Размеры кнопок управления: 80x80px (primary: 100x100px)
- Размер таймера: 48px (--font-size-4xl)
- Flex layout для двухколоночной структуры

---

## 2. Изменения в variables.css

**Файл:** `src/styles/variables.css`

Добавить в секцию Spacing:
```css
/* Mobile-specific spacing */
--spacing-mobile-xs: 0.125rem;   /* 2px */
--spacing-mobile-sm: 0.25rem;    /* 4px */
--spacing-mobile-md: 0.5rem;     /* 8px */
--spacing-mobile-lg: 0.75rem;    /* 12px */
--spacing-mobile-xl: 1rem;       /* 16px */
--spacing-mobile-2xl: 1.25rem;   /* 20px */
```

Добавить новую секцию:
```css
/* Touch Targets (iOS minimum = 44px) */
--touch-target-sm: 44px;
--touch-target-md: 48px;
--touch-target-lg: 52px;
```

---

## 3. Поэтапный план внедрения

### Этап 1: Критичные изменения (Foundation)

#### 3.1 App.module.css
**Проблемы:** Большие отступы на мобильных, избыточный margin-top

**Добавить в существующий `@media (max-width: 480px)`:**
```css
.main {
  padding: 12px;
}

.readyContainer {
  margin-top: 16px;
}

.readyInfo {
  gap: var(--spacing-md);
}
```

**Добавить новый `@media (max-width: 360px)`:**
```css
.header {
  padding: 8px 12px;
}

.main {
  padding: 8px;
}

.readyTitle {
  font-size: 1.25rem;
}

.readyDescription {
  font-size: 0.875rem;
}

.exerciseContainer {
  margin-top: 4px;
}
```

#### 3.2 PhaseItem.module.css
**Проблема:** Grid с `minmax(140px, 1fr)` ломается на 360px

**Добавить `@media (max-width: 480px)`:**
```css
.inputs {
  grid-template-columns: 1fr; /* Stack vertically */
  gap: 6px;
}

.item {
  padding: 0.5rem 0.625rem;
  gap: 6px;
}

.deleteButton {
  width: 24px;
  height: 24px;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
.dragHandle {
  display: none; /* Скрываем на очень маленьких экранах */
}

.input,
.select {
  font-size: 0.75rem;
  padding: 4px 6px;
}
```

#### 3.3 PresetEditor.module.css
**Проблема:** Модальное окно с фиксированной шириной и большими padding

**Добавить `@media (max-width: 480px)`:**
```css
.modal {
  max-width: calc(100vw - 16px);
  border-radius: 16px;
}

.header {
  padding: 1rem;
}

.content {
  padding: 1rem;
}

.formGroupInput {
  padding: 0.625rem 0.75rem;
}

.footer {
  padding: 1rem;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
.modal {
  max-width: calc(100vw - 12px);
  border-radius: 12px;
}

.header,
.content,
.footer {
  padding: 0.75rem;
}

.footer {
  flex-direction: column;
}

.footer button {
  width: 100%;
}
```

---

### Этап 2: Высокий приоритет (Key Components)

#### 3.4 Controls.module.css
**Проблема:** Кнопки слишком большие для 360px

**Изменить существующий `@media (max-width: 480px)`:**
```css
.button {
  min-width: 64px;
  min-height: 64px;
}

.button[data-variant="primary"] {
  min-width: 72px;
  min-height: 72px;
}

.icon {
  width: 22px;
  height: 22px;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
.controls {
  gap: 6px;
}

.button {
  min-width: 56px;
  min-height: 56px;
  padding: 6px 8px;
}

.button[data-variant="primary"] {
  min-width: 64px;
  min-height: 64px;
}

.icon {
  width: 20px;
  height: 20px;
}
```

#### 3.5 BreathingDisplay.module.css
**Улучшить существующий `@media (max-width: 480px)`:**
```css
.svg {
  width: 200px;
  height: 200px;
}

.timeRemaining {
  font-size: 2.25rem;
}
```

**Изменить существующий `@media (max-width: 360px)`:**
```css
.svg {
  width: 160px;
  height: 160px;
}

.timeRemaining {
  font-size: 2rem;
}
```

#### 3.6 PresetItem.module.css
**Добавить `@media (max-width: 480px)`:**
```css
.item {
  padding: 0.625rem 0.75rem;
}

.deleteButton {
  width: 32px;
  height: 32px;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
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
```

---

### Этап 3: Средний приоритет (UI Components)

#### 3.7 Modal.module.css
**Добавить `@media (max-width: 480px)`:**
```css
.modal {
  max-width: calc(100vw - 16px);
  border-radius: 16px;
}

.modal.small,
.modal.medium,
.modal.large {
  width: 100%;
}

.header {
  padding: 1rem;
}

.body {
  padding: 1rem;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
.modal {
  max-width: calc(100vw - 12px);
  border-radius: 12px;
}

.header,
.body {
  padding: 0.75rem;
}
```

#### 3.8 PresetList.module.css
**Добавить `@media (max-width: 480px)`:**
```css
.header {
  padding: 0 8px;
}

.title {
  font-size: 1.25rem;
}

.createButton {
  padding: 0.75rem;
}
```

**Добавить `@media (max-width: 360px)`:**
```css
.title {
  font-size: 1.125rem;
}

.createButton {
  padding: 0.625rem;
  font-size: 0.875rem;
}
```

---

### Этап 4: Низкий приоритет (Polish)

#### 3.9 CompletionSummary.module.css
**Добавить `@media (max-width: 360px)`:**
```css
.summary {
  padding: 0.75rem;
  margin: 0 8px;
}

.iconWrapper {
  width: 64px;
  height: 64px;
}

.title {
  font-size: 1.25rem;
}

.statValue {
  font-size: 1.75rem;
}

.button {
  padding: 0.625rem 0.75rem;
  min-height: 44px;
}
```

#### 3.10 UI Components (Button, Input, IconButton)

**Button.module.css** - добавить для 480px:
```css
.small { padding: 0.5rem 0.625rem; font-size: 0.875rem; }
.medium { padding: 0.625rem 0.75rem; font-size: 0.875rem; }
.large { padding: 0.75rem 1rem; font-size: 1rem; }
```

**Input.module.css** - добавить для 480px:
```css
.input { padding: 0.625rem 0.75rem; font-size: 1rem; }
```

---

## 4. План тестирования

### 4.1 Точки проверки
| Ширина | Что проверяем |
|--------|---------------|
| 1024px+ | Десктоп не изменился |
| 768px | Сайдбар становится оверлеем |
| 480px | Базовая мобильная адаптация |
| 360px | Максимальная компрессия |
| 320px | Экстремальный случай |

### 4.2 Чек-лист
- [ ] Нет горизонтального скролла
- [ ] Всё текст читаем (min 12px)
- [ ] Touch targets >= 40px
- [ ] Модальные окна помещаются на экране
- [ ] Breathing circle не обрезается
- [ ] Кнопки управления не занимают весь экран
- [ ] Phase inputs можно использовать
- [ ] Drag-and-drop работает

### 4.3 Инструменты
- Chrome DevTools Device Toolbar
- `npm run dev` для локальной проверки
- Проверка на реальном устройстве (если возможно)

---

## 5. Порядок внедрения

1. Создать ветку `feature/responsive-mobile`
2. Внести изменения в `variables.css`
3. Внедрить Этап 1 (критичные изменения)
4. Протестировать на 360px
5. Внедрить Этап 2 (высокий приоритет)
6. Протестировать на 480px и 360px
7. Внедрить Этапы 3 и 4
8. Финальное тестирование на всех breakpoint
9. Создать PR

---

## 6. Сводная таблица значений

| Свойство | Desktop (>768px) | 480px | 360px |
|----------|-----------------|-------|-------|
| Main padding | 24px | 12px | 8px |
| Ready margin-top | 48px | 16px | 12px |
| Title font | 24px | 20px | 18px |
| Breathing circle | 280px | 200px | 160px |
| Timer font | 48px | 36px | 32px |
| Control buttons | 80-100px | 64-72px | 56-64px |
| Modal padding | 24px | 16px | 12px |
| Modal width | fixed | calc(100vw-16px) | calc(100vw-12px) |
