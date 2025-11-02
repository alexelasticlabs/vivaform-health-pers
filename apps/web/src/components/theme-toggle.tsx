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
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      aria-label={label}
      title={label}
    >
      <span aria-hidden>{icon}</span>
      <span>{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
};
