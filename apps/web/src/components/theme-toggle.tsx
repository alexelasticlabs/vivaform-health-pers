import { useThemeStore } from "../store/theme-store";

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const label = theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  const icon = theme === "light" ? "🌙" : "☀️";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600"
      aria-label={label}
      title={label}
    >
      <span aria-hidden className="text-sm">{icon}</span>
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
};
