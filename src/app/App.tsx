import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useBreathingStore } from '../store/useBreathingStore';
import {
  BreathingDisplay,
  PhaseIndicator,
  CycleProgress,
  Controls,
  CompletionSummary,
  SoundSettings,
} from '../features/breathing-executor';
import { PresetList, PresetEditor } from '../features/preset-management';
import { PwaBanner, usePWAUpdate } from '../features/pwa';
import { ThemeToggle, CircularProgress, Icon, ButtonWithIcon, IconButton, Modal } from '../components/ui';
import { DriftCorrectedTimer } from '../shared/timer';
import { AudioPlayer } from '../shared/audio';
import type { Preset, PresetCreateInput } from '../entities/preset/preset.types';
import styles from './App.module.css';

/**
 * Main App component for the breathing training application
 *
 * Manages:
 * - Timer lifecycle with drift correction
 * - Breathing exercise execution
 * - Preset management UI
 * - Application state transitions
 */
export const App: React.FC = () => {
  // Store selectors
  const presets = useBreathingStore((state) => state.presets);
  const activePresetId = useBreathingStore((state) => state.activePresetId);
  const appState = useBreathingStore((state) => state.appState);
  const isRunning = useBreathingStore((state) => state.isRunning);
  const isPaused = useBreathingStore((state) => state.isPaused);
  const currentCycle = useBreathingStore((state) => state.currentCycle);
  const currentPhaseIndex = useBreathingStore((state) => state.currentPhaseIndex);
  const timeRemaining = useBreathingStore((state) => state.timeRemaining);
  const activePhase = useBreathingStore((state) => state.activePhase);
  const activePreset = useBreathingStore(() =>
    presets.find((p) => p.id === activePresetId)
  );

  // Store actions
  const selectPreset = useBreathingStore((state) => state.selectPreset);
  const deletePreset = useBreathingStore((state) => state.deletePreset);
  const start = useBreathingStore((state) => state.start);
  const pause = useBreathingStore((state) => state.pause);
  const resume = useBreathingStore((state) => state.resume);
  const stop = useBreathingStore((state) => state.stop);
  const nextPhase = useBreathingStore((state) => state.nextPhase);
  const setTimeRemaining = useBreathingStore((state) => state.setTimeRemaining);
  const setSoundVolume = useBreathingStore((state) => state.setSoundVolume);

  // Sound settings
  const soundVolume = useBreathingStore((state) => state.soundVolume);

  // Local UI state
  const [isEditingPreset, setIsEditingPreset] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | undefined>(undefined);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  // Detect mobile screen width for PWA banners
  useEffect(() => {
    const checkMobile = () => setIsMobileScreen(window.innerWidth < 480);
    checkMobile();
    const mediaQuery = window.matchMedia('(max-width: 479px)');
    const handler = () => checkMobile();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // PWA hooks - только обновления, установка через браузер
  const { isUpdateAvailable, isUpdating, applyUpdate, dismissUpdate } = usePWAUpdate();

  // Timer ref to persist across re-renders
  const timerRef = useRef<DriftCorrectedTimer | null>(null);
  // Audio player ref to persist across re-renders
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  // Calculate total exercise time for completion summary
  const totalExerciseTime = React.useMemo(() => {
    if (!activePreset || !activePreset.phases.length) return 0;
    const phaseDurations = activePreset.phases.map((phase) =>
      phase.unit === 'minutes' ? phase.duration * 60 * 1000 : phase.duration * 1000
    );
    const cycleTime = phaseDurations.reduce((sum, duration) => sum + duration, 0);
    const cycles = activePreset.totalCycles ?? currentCycle;
    return cycleTime * cycles;
  }, [activePreset, currentCycle]);

  // Calculate current phase total time for BreathingDisplay
  const currentPhaseTotalTime = React.useMemo(() => {
    if (!activePhase) return 0;
    return activePhase.unit === 'minutes'
      ? activePhase.duration * 60 * 1000
      : activePhase.duration * 1000;
  }, [activePhase]);

  // ==========================================================================
  // Timer Management
  // ==========================================================================

  /**
   * Initialize audio player on mount
   */
  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer({
      volume: soundVolume,
      enabled: true,
    });

    return () => {
      audioPlayerRef.current?.destroy();
      audioPlayerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Update audio player settings when sound settings change
   */
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(soundVolume);
    }
  }, [soundVolume]);

  /**
   * Play sound when phase changes
   */
  useEffect(() => {
    if (!audioPlayerRef.current || !activePhase || !isRunning || isPaused) {
      return;
    }

    audioPlayerRef.current.play('inhale');
  }, [currentPhaseIndex, activePhase, isRunning, isPaused, currentCycle]);

  /**
   * Play completion sound when exercise is complete
   */
  useEffect(() => {
    if (appState === 'COMPLETED' && audioPlayerRef.current) {
      audioPlayerRef.current.play('complete');
    }
  }, [appState]);

  /**
   * Initialize timer on mount
   */
  useEffect(() => {
    timerRef.current = new DriftCorrectedTimer({
      onTick: (remainingMs: number) => {
        setTimeRemaining(remainingMs);
      },
      onComplete: () => {
        nextPhase();
      },
    });

    return () => {
      timerRef.current?.destroy();
      timerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handle timer start when isRunning changes to true
   * Also restarts when phase changes (including new cycles with same phase)
   */
  useEffect(() => {
    if (!timerRef.current) return;

    if (isRunning && !isPaused) {
      // Get the duration from the active phase
      if (activePhase) {
        const durationMs =
          activePhase.unit === 'minutes'
            ? activePhase.duration * 60 * 1000
            : activePhase.duration * 1000;
        timerRef.current.start(durationMs);
      }
    }
  }, [isRunning, isPaused, activePhase, currentCycle]);

  /**
   * Handle pause/resume
   */
  useEffect(() => {
    if (!timerRef.current) return;

    if (isPaused) {
      try {
        timerRef.current.pause();
      } catch {
        // Timer might not be running
      }
    } else if (isRunning && timerRef.current.getStatus() === 'paused') {
      timerRef.current.resume();
    }
  }, [isPaused, isRunning]);

  /**
   * Handle stop/reset
   */
  useEffect(() => {
    if (!timerRef.current) return;

    if (!isRunning && !isPaused && appState === 'READY') {
      timerRef.current.stop();
    }
  }, [isRunning, isPaused, appState]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  // PWA handlers
  const handlePWAUpdate = useCallback(async () => {
    await applyUpdate();
  }, [applyUpdate]);

  const handlePWADismissUpdate = useCallback(() => {
    dismissUpdate();
  }, [dismissUpdate]);

  const handleStart = useCallback(() => {
    // Initialize AudioContext on user interaction (required for mobile browsers)
    audioPlayerRef.current?.init();
    start();
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
  }, [resume]);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      selectPreset(presetId);
      setIsMobileMenuOpen(false);
    },
    [selectPreset]
  );

  const handlePresetDelete = useCallback(
    (presetId: string) => {
      deletePreset(presetId);
    },
    [deletePreset]
  );

  const handleCreatePreset = useCallback(() => {
    setEditingPreset(undefined);
    setIsEditingPreset(true);
    setIsMobileMenuOpen(false);
  }, []);

  const handleSavePreset = useCallback((data: PresetCreateInput & { _id?: string }) => {
    // If this is a newly created preset, select it
    if (data._id) {
      selectPreset(data._id);
    }
    setIsEditingPreset(false);
    setEditingPreset(undefined);
  }, [selectPreset]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingPreset(false);
    setEditingPreset(undefined);
  }, []);

  const handleEditPreset = useCallback(
    (preset: Preset) => {
      setEditingPreset(preset);
      setIsEditingPreset(true);
      setIsMobileMenuOpen(false);
    },
    []
  );

  const handleRestart = useCallback(() => {
    stop();
    // Small delay to ensure state updates
    setTimeout(() => {
      start();
    }, 50);
  }, [stop, start]);

  const handleCloseSummary = useCallback(() => {
    stop();
  }, [stop]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Calculate duration string for preset
  const calculateDuration = useCallback((preset: Preset): string => {
    const phaseSeconds = preset.phases.reduce((sum, phase) =>
      sum + (phase.unit === 'minutes' ? phase.duration * 60 : phase.duration),
      0
    );
    const cycles = preset.totalCycles ?? 1;
    const totalSeconds = phaseSeconds * cycles;

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0 && seconds > 0) {
      return `${minutes} ${getMinutesForm(minutes)} ${seconds} ${getSecondsForm(seconds)}`;
    }
    if (minutes > 0) {
      return `${minutes} ${getMinutesForm(minutes)}`;
    }
    return `${totalSeconds} ${getSecondsForm(totalSeconds)}`;
  }, []);

  const getMinutesForm = (n: number): string => {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 19) return 'минут';
    if (lastOne === 1) return 'минута';
    if (lastOne >= 2 && lastOne <= 4) return 'минуты';
    return 'минут';
  };

  const getSecondsForm = (n: number): string => {
    const lastTwo = n % 100;
    const lastOne = n % 10;
    if (lastTwo >= 11 && lastTwo <= 19) return 'секунд';
    if (lastOne === 1) return 'секунда';
    if (lastOne >= 2 && lastOne <= 4) return 'секунды';
    return 'секунд';
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <IconButton
          icon={<Icon name="menu" />}
          variant="ghost"
          size="medium"
          onClick={toggleMobileMenu}
          aria-label="Переключить меню"
          className={styles.mobileMenuButton}
        />
        <h1 className={styles.title}>Дыхательные практики</h1>
        <IconButton
          icon={<Icon name="volume" />}
          variant="ghost"
          size="medium"
          onClick={() => setIsSoundModalOpen(true)}
          aria-label="Настройки звука"
          className={styles.soundButton}
        />
      </header>

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Sidebar / Preset List */}
        <aside
          className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}
        >
          <div className={styles.themeToggleContainer}>
            <ThemeToggle />
          </div>
          <PresetList
            presets={presets}
            activePresetId={activePresetId ?? null}
            onSelect={handlePresetSelect}
            onDelete={handlePresetDelete}
            onCreate={handleCreatePreset}
            builtInIds={['default-4-7-8']}
          />
        </aside>

        {/* Main Content Area */}
        <main className={styles.main}>
          {/* READY State - Show preset info with start button */}
          {appState === 'READY' && activePreset && (
            <div className={styles.exerciseContainer}>
              {/* Program Info - Circular Display */}
              <div className={styles.programDisplay}>
                <CircularProgress
                  progress={1}
                  color="var(--accent)"
                  ariaLabel={`Программа: ${activePreset.name}`}
                  showGlow
                >
                  <div className={styles.programName}>{activePreset.name}</div>
                  {activePreset.description && (
                    <div className={styles.programDescription}>{activePreset.description}</div>
                  )}
                  <div className={styles.programDuration}>{calculateDuration(activePreset)}</div>
                </CircularProgress>
              </div>

              {/* Phase Indicator - all phases inactive */}
              <div className={styles.indicators}>
                <PhaseIndicator
                  phases={activePreset.phases}
                  currentPhaseIndex={-1}
                />
                {/* Cycle Progress - show total cycles with full progress bar */}
                {activePreset.totalCycles ? (
                  <CycleProgress
                    currentCycle={activePreset.totalCycles}
                    totalCycles={activePreset.totalCycles}
                    full
                  />
                ) : (
                  <div className={styles.infiniteCycles}>
                    <span className={styles.infinityLabel}>Бесконечные циклы </span>
                    <span className={styles.infinity} aria-label="бесконечные циклы"> ∞</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <IconButton
                  icon={<Icon name="edit" />}
                  variant="secondary"
                  size="large"
                  onClick={() => activePreset && handleEditPreset(activePreset)}
                  aria-label="Редактировать программу"
                  className={styles.iconActionButton}
                />
                <ButtonWithIcon
                  icon="play"
                  className={styles.primaryActionButton}
                  onClick={handleStart}
                  aria-label="Начать дыхательное упражнение"
                >
                  Начать
                </ButtonWithIcon>
              </div>
            </div>
          )}

          {/* RUNNING/PAUSED State - Show breathing execution */}
          {(appState === 'RUNNING' || appState === 'PAUSED') && activePreset && (
            <div className={styles.exerciseContainer}>
              <BreathingDisplay
                phase={activePhase}
                timeRemaining={timeRemaining}
                totalTime={currentPhaseTotalTime}
                phaseIndex={currentPhaseIndex}
                isPaused={isPaused}
              />

              <div className={styles.indicators}>
                <PhaseIndicator
                  phases={activePreset.phases}
                  currentPhaseIndex={activePreset?.phases.findIndex(
                    (p) => p.id === activePhase?.id
                  ) ?? 0}
                />
                <CycleProgress
                  currentCycle={currentCycle}
                  totalCycles={activePreset.totalCycles ?? undefined}
                />
              </div>

              <Controls
                isRunning={isRunning}
                isPaused={isPaused}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
              />
            </div>
          )}

          {/* COMPLETED State - Show completion summary */}
          {appState === 'COMPLETED' && (
            <CompletionSummary
              totalTime={totalExerciseTime}
              onRestart={handleRestart}
              onClose={handleCloseSummary}
            />
          )}
        </main>
      </div>

      {/* Preset Editor Modal */}
      <PresetEditor
        isOpen={isEditingPreset}
        preset={editingPreset}
        onSave={handleSavePreset}
        onCancel={handleCancelEdit}
      />

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sound Settings Modal */}
      <Modal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        title="Настройки звука"
        size="small"
      >
        <SoundSettings
          soundVolume={soundVolume}
          onVolumeChange={setSoundVolume}
        />
      </Modal>

      {/* PWA Update Available */}
      {isUpdateAvailable && (
        <PwaBanner
          icon="restart"
          title="Доступно обновление"
          description="Новая версия приложения готова к установке"
          primaryText="Обновить"
          dismissText="Позже"
          onPrimary={handlePWAUpdate}
          onDismiss={handlePWADismissUpdate}
          position="top"
          fullWidth={isMobileScreen}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default App;
