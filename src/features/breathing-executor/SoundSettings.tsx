import styles from './SoundSettings.module.css';

interface SoundSettingsProps {
  /** Sound volume (0.0 to 1.0) */
  soundVolume: number;
  /** Callback to change volume */
  onVolumeChange: (volume: number) => void;
}

/**
 * SoundSettings provides controls for audio feedback
 * Includes a volume slider for adjusting sound level
 */
export function SoundSettings({ soundVolume, onVolumeChange }: SoundSettingsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Звук <span className={styles.volumeValue}>{Math.round(soundVolume * 100)}%</span>
        </h3>
      </div>

      <div className={styles.volumeControl}>
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
      </div>
    </div>
  );
}
