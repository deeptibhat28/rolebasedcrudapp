import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="px-3 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-200 transition duration-200 shadow-md dark:bg-[#1b082d]/70 dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-[#1b082d]"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}