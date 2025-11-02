import { Link } from "react-router-dom";

interface VivaFormLogoProps {
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const VivaFormLogo = ({ size = "md", showIcon = true }: VivaFormLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <Link
      to="/"
      className="group flex items-center gap-2 transition-transform hover:scale-105"
      aria-label="VivaForm home"
    >
      {showIcon && (
        <div
          className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-1.5 shadow-lg shadow-emerald-500/20 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-emerald-500/40`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-white">
            <path
              d="M12 2L3 7v10c0 5.5 3.8 9.7 9 11 5.2-1.3 9-5.5 9-11V7l-9-5z"
              fill="currentColor"
              fillOpacity="0.9"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
      <span
        className={`${sizeClasses[size]} bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text font-display font-bold tracking-tight text-transparent transition-all duration-300 group-hover:from-emerald-500 group-hover:via-teal-500 group-hover:to-cyan-500`}
      >
        VivaForm
      </span>
    </Link>
  );
};
