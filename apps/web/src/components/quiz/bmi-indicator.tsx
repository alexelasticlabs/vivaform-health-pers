interface BMIIndicatorProps {
  bmi: number;
}

export function BMIIndicator({ bmi }: BMIIndicatorProps) {
  const RANGE_MIN = 12;
  const RANGE_MAX = 40; // practical upper for visualization
  const SEGMENTS = [
    { max: 18.5, label: 'Underweight', color: 'bg-blue-400', text: 'text-blue-600' },
    { max: 24.9, label: 'Normal', color: 'bg-green-400', text: 'text-green-600' },
    { max: 29.9, label: 'Overweight', color: 'bg-orange-400', text: 'text-orange-600' },
    { max: RANGE_MAX, label: 'Obese', color: 'bg-red-400', text: 'text-red-600' },
  ];

  const category = SEGMENTS.find(s => bmi <= s.max) ?? SEGMENTS[SEGMENTS.length - 1];

  const messageMap: Record<string, string> = {
    Underweight: "Focus on steady nourishment & strength 💪",
    Normal: "Solid baseline — we'll help you maintain 👌",
    Overweight: "We guide gentle, sustainable fat loss 🌟",
    Obese: "Safety-first pacing & metabolic support 🌱",
  };

  const pointerPercent = Math.max(0, Math.min(((bmi - RANGE_MIN) / (RANGE_MAX - RANGE_MIN)) * 100, 100));

  // Compute segment widths proportionally
  let prev = RANGE_MIN;
  const segmentPercents = SEGMENTS.map(seg => {
    const width = ((seg.max - prev) / (RANGE_MAX - RANGE_MIN)) * 100;
    prev = seg.max;
    return { ...seg, width };
  });

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100" aria-label="BMI indicator">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Your BMI</span>
        <span className={`text-2xl font-bold ${category.text}`}>{bmi.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`font-semibold ${category.text}`}>{category.label}</span>
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 flex">
          {segmentPercents.map(seg => (
            <div key={seg.label} style={{ width: `${seg.width}%` }} className={seg.color} />
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900 shadow-[0_0_4px_rgba(0,0,0,0.4)]"
          style={{ left: `${pointerPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{RANGE_MIN}</span>
        <span>18.5</span>
        <span>24.9</span>
        <span>29.9</span>
        <span>{RANGE_MAX}</span>
      </div>
      <p className="text-sm text-gray-700 mt-3">{messageMap[category.label]}</p>
    </div>
  );
}
