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
import { ThemeToggle } from '../components/ui';
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
  }, [currentPhaseIndex, activePhase, isRunning, isPaused]);

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

  // ==========================================================================
  // Render
  // ==========================================================================

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Переключить меню"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
        <h1 className={styles.title}>Дыхательные практики</h1>
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
            <div className={styles.readyContainer}>
              <div className={styles.readyContent}>
                  <h2 className={styles.readyTitle}>{activePreset.name}</h2>
                  {activePreset.description && (
                    <p className={styles.readyDescription}>{activePreset.description}</p>
                  )}

                  <div className={styles.readyInfo}>
                    <div className={styles.readyInfoItem}>
                      <span className={styles.readyInfoLabel}>Циклов</span>
                      <span className={styles.readyInfoValue}>
                        {activePreset.totalCycles ?? 'Бесконечно'}
                      </span>
                    </div>
                    <div className={styles.readyInfoItem}>
                      <span className={styles.readyInfoLabel}>Фаз</span>
                      <span className={styles.readyInfoValue}>
                        {activePreset.phases.length}
                      </span>
                    </div>
                    {activePreset.totalCycles && (
                      <div className={styles.readyInfoItem}>
                        <span className={styles.readyInfoLabel}>Длительность</span>
                        <span className={styles.readyInfoValue}>
                          {Math.round(
                            (activePreset.phases.reduce(
                              (sum, phase) =>
                                sum +
                                (phase.unit === 'minutes'
                                  ? phase.duration * 60
                                  : phase.duration),
                              0
                            ) *
                              activePreset.totalCycles) /
                              60
                          )}{' '}
                          мин
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.phasesPreview}>
                    {activePreset.phases.map((phase, index) => (
                      <div key={phase.id || index} className={styles.phaseChip}>
                        {phase.name}
                      </div>
                    ))}
                  </div>

                  <SoundSettings
                    soundVolume={soundVolume}
                    onVolumeChange={setSoundVolume}
                  />

                  <div className={styles.startButtons}>
                    <button
                      className={styles.editButton}
                      onClick={() => activePreset && handleEditPreset(activePreset)}
                      aria-label="Редактировать текущую программу"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Изменить
                    </button>
                    <button
                      className={styles.startButton}
                      onClick={handleStart}
                      aria-label="Начать дыхательное упражнение"
                    >
                      <svg
                        className={styles.startButtonIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Начать
                    </button>
                  </div>
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
              cyclesCompleted={currentCycle - 1}
              totalTime={totalExerciseTime}
              onRestart={handleRestart}
              onClose={handleCloseSummary}
            />
          )}
        </main>
      </div>

      {/* Preset Editor Modal */}
      {isEditingPreset && (
        <PresetEditor
          preset={editingPreset}
          onSave={handleSavePreset}
          onCancel={handleCancelEdit}
        />
      )}

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default App;
