interface ToggleProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Label text to display next to the toggle */
  label?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Optional additional class name */
  className?: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * A reusable toggle switch component
 * Used for binary state toggles like sound on/off, infinite mode, etc.
 */
export function Toggle({
  checked,
  onChange,
  label,
  ariaLabel,
  className = '',
  disabled = false,
}: ToggleProps) {
  return (
    <label className={`toggle ${className}`}>
      <input
        type="checkbox"
        className="toggle-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        disabled={disabled}
      />
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}
