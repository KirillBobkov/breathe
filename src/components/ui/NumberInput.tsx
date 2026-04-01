import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from './Icon';
import styles from './NumberInput.module.css';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 1,
  max = Infinity,
  step = 1,
  ariaLabel = 'Числовое значение',
  className = '',
  disabled = false,
}) => {
  // Локальное состояние для input - позволяет вводить пустые значения
  const [inputValue, setInputValue] = useState<string>(String(value));

  // Синхронизация при изменении value извне
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleDecrement = useCallback(() => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  }, [value, step, min, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  }, [value, step, max, onChange]);

  // Позволяет вводить любые значения (включая пустые)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // При потере фокуса валидируем и сохраняем
  const handleBlur = () => {
    const numValue = parseFloat(inputValue);
    const validValue = !isNaN(numValue) ? Math.max(min, Math.min(max, numValue)) : min;
    setInputValue(String(validValue));
    onChange(validValue);
  };

  // При нажатии Enter также применяем значение
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const isDecrementDisabled = value <= min || disabled;
  const isIncrementDisabled = value >= max || disabled;

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''} ${className}`}>
      <button
        type="button"
        className={styles.button}
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        aria-label="Уменьшить"
        tabIndex={-1}
      >
        <Icon name="minus" size={16} />
      </button>
      <input
        type="number"
        className={styles.input}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.button}
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        aria-label="Увеличить"
        tabIndex={-1}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
};
