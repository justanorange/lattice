import { useEffect, useState } from 'react';
import { Sun, Moon, SunMoon } from 'lucide-react';
type ThemeMode = "light" | "dark" | "system";

export const ThemeMode = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const storedMode = localStorage.getItem("themeMode") as ThemeMode | null;
      if (storedMode === "light" || storedMode === "dark" || storedMode === "system") {
        return storedMode;
      }
      return "system";
    } catch {
      return "system";
    }
  });
  
  // Применение темы и подписка на изменения системной темы в режиме "system"
  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : true;
      const shouldUseDark = themeMode === "dark" || (themeMode === "system" && prefersDark);
      document.documentElement.classList.toggle("dark", shouldUseDark);
    };

    applyTheme();

    let mql: MediaQueryList | null = null;
    const handleChange = () => applyTheme();
    if (themeMode === "system" && typeof window !== "undefined" && typeof window.matchMedia === "function") {
      mql = window.matchMedia("(prefers-color-scheme: dark)");
      // Современный addEventListener, с fallback на addListener
      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", handleChange);
      } else {
        const legacyMql = mql as unknown as {
          addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
        };
        if (typeof legacyMql.addListener === "function") {
          legacyMql.addListener(handleChange);
        }
      }
    }

    try {
      localStorage.setItem("themeMode", themeMode);
    } catch {}

    return () => {
      if (mql) {
        if (typeof mql.removeEventListener === "function") {
          mql.removeEventListener("change", handleChange);
        } else {
          const legacyMql = mql as unknown as {
            removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
          };
          if (typeof legacyMql.removeListener === "function") {
            legacyMql.removeListener(handleChange);
          }
        }
      }
    };
  }, [themeMode]);

  const handleThemeToggle = () => {
    // hapticFeedback();
    const order: ThemeMode[] = ["system", "light", "dark"];
    setThemeMode((prev) => {
      const idx = order.indexOf(prev);
      const next = (idx + 1) % order.length;
      return order[next];
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleThemeToggle}
        aria-label={`Тема: ${themeMode === "system" ? "Авто" : themeMode === "light" ? "Светлая" : "Тёмная"}`}
        title={`Тема: ${themeMode === "system" ? "Авто" : themeMode === "light" ? "Светлая" : "Тёмная"}`}
        className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        {themeMode === "system" ? (
          <SunMoon size={24} />
        ) : themeMode === "light" ? (
          <Sun size={24} />
        ) : (
          <Moon size={24} />
        )}
        {/* <span className="text-sm text-gray-600 dark:text-gray-300">
          {themeMode === "system" ? "Авто" : themeMode === "light" ? "Светлая" : "Тёмная"}
        </span> */}
      </button>
    </>
  );
};
