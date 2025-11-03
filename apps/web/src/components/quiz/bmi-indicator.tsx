interface BMIIndicatorProps {
  bmi: number;
}

export function BMIIndicator({ bmi }: BMIIndicatorProps) {
  const getBMICategory = () => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const getBMIMessage = () => {
    if (bmi < 18.5) return "Let's work on building healthy mass 💪";
    if (bmi < 25) return "You're in great shape! Keep it up 👌";
    if (bmi < 30) return "Let's optimize your nutrition together 🌟";
    return "We'll create a sustainable plan for you 🌱";
  };

  const category = getBMICategory();

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Your BMI</span>
        <span className={`text-2xl font-bold ${category.color}`}>
          {bmi.toFixed(1)}
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`font-semibold ${category.color}`}>
          {category.label}
        </span>
      </div>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="w-[18.5%] bg-blue-400" />
          <div className="w-[25%] bg-green-400" />
          <div className="w-[16.5%] bg-orange-400" />
          <div className="flex-1 bg-red-400" />
        </div>
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900"
          style={{
            left: `${Math.max(0, Math.min(((bmi - 10) / 40) * 100, 100))}%`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>10</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>50</span>
      </div>
      <p className="text-sm text-gray-700 mt-3">{getBMIMessage()}</p>
    </div>
  );
}
