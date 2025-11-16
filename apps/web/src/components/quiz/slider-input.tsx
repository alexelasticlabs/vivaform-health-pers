interface SliderInputProps {
  label?: string | ((value: number) => string);
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
}: SliderInputProps) {
  const displayLabel = typeof label === 'function' ? label(value) : label;
  const displayValue = typeof label === 'function' ? '' : `${value} ${unit}`;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {displayLabel && (
          <label className="text-sm font-medium text-foreground/80">{displayLabel}</label>
        )}
        {displayValue && (
          <span className="text-lg font-semibold text-emerald-600">{displayValue}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-3 w-full appearance-none cursor-pointer rounded-lg bg-muted accent-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {min} {unit}
        </span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}
