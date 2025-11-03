interface OptionButtonProps {
  label?: string;
  description?: string;
  emoji?: string;
  selected?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function OptionButton({
  label,
  description,
  emoji,
  selected,
  onClick,
  children,
  className = '',
}: OptionButtonProps) {
  const content = children || label;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
        <div className="flex-1">
          <div
            className={`font-semibold ${selected ? 'text-blue-900' : 'text-gray-900'}`}
          >
            {content}
          </div>
          {description && (
            <div
              className={`text-sm mt-1 ${selected ? 'text-blue-700' : 'text-gray-600'}`}
            >
              {description}
            </div>
          )}
        </div>
        {selected && (
          <svg
            className="w-6 h-6 text-blue-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
