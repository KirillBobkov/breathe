import { Icon, IconButton, ButtonWithIcon } from '../../components/ui';
import styles from './Controls.module.css';

interface ControlsProps {
  /** Whether the exercise is currently running */
  isRunning: boolean;
  /** Whether the exercise is currently paused */
  isPaused: boolean;
  /** Callback to start the exercise */
  onStart: () => void;
  /** Callback to pause the exercise */
  onPause: () => void;
  /** Callback to resume from pause */
  onResume: () => void;
  /** Callback to stop the exercise */
  onStop: () => void;
}

/**
 * Controls provides Play/Pause/Stop buttons for the breathing exercise
 * Features large touch targets for accessibility
 */
export function Controls({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: ControlsProps) {
  const showPlay = !isRunning;
  const showPause = isRunning && !isPaused;
  const showResume = isRunning && isPaused;

  return (
    <div className={styles.container}>
      <div className={styles.controls} role="group" aria-label="Управление дыхательным упражнением">
        {/* Stop button - icon only, shown when running or paused */}
        {(isRunning || isPaused) && (
          <IconButton
            icon={<Icon name="stop" />}
            variant="secondary"
            size="large"
            onClick={onStop}
            aria-label="Остановить упражнение"
            className={styles.iconButton}
          />
        )}

        {/* Primary action button - full width with accent color */}
        {showPlay && (
          <ButtonWithIcon
            icon="play"
            className={styles.primaryButton}
            onClick={onStart}
            aria-label="Начать"
          >
            Начать
          </ButtonWithIcon>
        )}

        {/* Pause button - primary action when running */}
        {showPause && (
          <ButtonWithIcon
            icon="pause"
            className={styles.primaryButton}
            onClick={onPause}
            aria-label="Приостановить упражнение"
          >
            Пауза
          </ButtonWithIcon>
        )}

        {/* Resume button - primary action when paused */}
        {showResume && (
          <ButtonWithIcon
            icon="play"
            className={styles.primaryButton}
            onClick={onResume}
            aria-label="Продолжить упражнение"
          >
            Продолжить
          </ButtonWithIcon>
        )}
      </div>
    </div>
  );
}
