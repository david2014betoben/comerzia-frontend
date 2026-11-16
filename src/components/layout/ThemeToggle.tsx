import { Moon, Sun } from "lucide-react";
import { useApp } from "../../hooks/useApp";

export function ThemeToggle() {
  const { theme, toggleTheme } = useApp();
  return (
    <button
      className="icon"
      onClick={toggleTheme}
      title={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
      aria-label={
        theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"
      }
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
