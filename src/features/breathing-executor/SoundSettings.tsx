
import styles from './SoundSettings.module.css';

interface SoundSettingsProps {
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Sound volume (0.0 to 1.0) */
  soundVolume: number;
  /** Callback to enable/disable sounds */
  onSoundEnabledChange: (enabled: boolean) => void;
  /** Callback to change volume */
  onVolumeChange: (volume: number) => void;
}

/**
 * SoundSettings provides controls for audio feedback
 * Includes a toggle switch for enabling sounds and a volume slider
 */
export function SoundSettings({
  soundEnabled,
  soundVolume,
  onSoundEnabledChange,
  onVolumeChange,
}: SoundSettingsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Звуковые эффекты</h3>
        <button
          className={styles.toggle}
          data-enabled={soundEnabled}
          onClick={() => onSoundEnabledChange(!soundEnabled)}
          type="button"
          aria-label={soundEnabled ? 'Отключить звуки' : 'Включить звуки'}
        >
          <span className={styles.toggleKnob} aria-hidden="true" />
          <span className={styles.toggleLabel}>
            {soundEnabled ? 'Вкл' : 'Выкл'}
          </span>
        </button>
      </div>

      {soundEnabled && (
        <div className={styles.volumeControl}>
          <label htmlFor="volume-slider" className={styles.volumeLabel}>
            Громкость
          </label>
          <input
            id="volume-slider"
            className={styles.volumeSlider}
            type="range"
            min="0"
            max="100"
            value={Math.round(soundVolume * 100)}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            aria-label="Громкость звука"
          />
          <span className={styles.volumeValue}>{Math.round(soundVolume * 100)}%</span>
        </div>
      )}
    </div>
  );
}
