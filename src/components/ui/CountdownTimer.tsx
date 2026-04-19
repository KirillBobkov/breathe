import { useEffect, useRef, useState } from 'react';
import { CircularProgress } from './CircularProgress';
import { DriftCorrectedTimer } from '../../shared/timer';
import styles from './CountdownTimer.module.css';

export interface CountdownTimerProps {
  /** Начальное время в секундах (по умолчанию 3) */
  initialSeconds?: number;
  /** Callback при завершении таймера */
  onComplete?: () => void;
  /** Размер таймера */
  size?: number;
  /** Цвет акцента */
  color?: string;
}

/**
 * CountdownTimer - Изолированный компонент таймера обратного отсчёта
 *
 * Полностью независим от useBreathingStore, использует собственное состояние.
 * Автозапускается при монтировании.
 *
 * @example
 * ```tsx
 * <CountdownTimer
 *   initialSeconds={3}
 *   onComplete={() => console.log('Готово!')}
 * />
 * ```
 */
export function CountdownTimer({
  initialSeconds = 3,
  onComplete,
  size = 400,
  color = 'var(--accent)',
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(initialSeconds * 1000);
  const [displayValue, setDisplayValue] = useState<string>(formatTime(initialSeconds * 1000));

  const timerRef = useRef<DriftCorrectedTimer | null>(null);
  const initialDurationRef = useRef<number>(initialSeconds * 1000);
  const onCompleteRef = useRef(onComplete);

  // Обновляем ref при изменении onComplete
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Создаём таймер при монтировании и автозапускаем
  useEffect(() => {
    const timer = new DriftCorrectedTimer({
      onTick: (remaining: number) => {
        setTimeRemaining(remaining);
        const seconds = Math.ceil(remaining / 1000);
        setDisplayValue(seconds.toString());
      },
      onComplete: () => {
        setTimeRemaining(0);
        setDisplayValue('0');
        onCompleteRef.current?.();
      },
    });

    timerRef.current = timer;
    timer.start(initialDurationRef.current);

    return () => {
      timer.destroy();
    };
  }, []);

  // Вычисление прогресса (от 1 до 0)
  const progress = Math.max(0, timeRemaining / initialDurationRef.current);

  return (
    <div className={styles.countdown}>
      <CircularProgress
        progress={progress}
        size={size}
        color={color}
        showGlow={true}
        animate={true}
        disableCircleAnimation={true}
        animateProgress={false}
        ariaLabel={`Таймер: ${displayValue}`}
      >
        {/* Цифровой дисплей с анимацией при смене */}
        <span
          className={styles.displayValue}
          key={displayValue} // Перезапуск анимации при смене цифры
        >
          {displayValue}
        </span>
      </CircularProgress>
    </div>
  );
}

/**
 * Форматирует миллисекунды в строку (просто секунды для этого кейса)
 */
function formatTime(ms: number): string {
  return Math.ceil(Math.max(0, ms / 1000)).toString();
}
