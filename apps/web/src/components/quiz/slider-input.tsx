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
      <div className="flex justify-between items-center">
        {displayLabel && (
          <label className="text-sm font-medium text-gray-700">{displayLabel}</label>
        )}
        {displayValue && (
          <span className="text-lg font-bold text-blue-600">{displayValue}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500">
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
