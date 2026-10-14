import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const getSystemTheme = (): Theme =>
  matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const readStoredTheme = (): Theme | null => {
  try {
    const theme = localStorage.getItem("theme");
    return theme === "light" || theme === "dark" ? theme : null;
  } catch {
    return null;
  }
};

export function useTheme() {
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [override, setOverride] = useState<Theme | null>(() => {
    const stored = readStoredTheme();
    return stored === systemTheme ? null : stored;
  });
  const resolved = override ?? systemTheme;

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const nextSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(nextSystemTheme);
      setOverride(current => current === nextSystemTheme ? null : current);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
    try {
      if (override) localStorage.setItem("theme", override);
      else localStorage.removeItem("theme");
    } catch {
      // Theme changes still work when browser storage is unavailable.
    }
  }, [override, resolved]);

  const toggle = () => {
    const next = resolved === "dark" ? "light" : "dark";
    setOverride(next === systemTheme ? null : next);
  };

  return { resolved, toggle } as const;
}
