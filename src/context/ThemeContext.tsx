import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getSystemTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(getSystemTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;

    let newResolvedTheme: "dark" | "light";
    
    switch (theme) {
      case "system":
        newResolvedTheme = getSystemTheme();
        break;
      case "dark":
      case "light":
        newResolvedTheme = theme;
        break;
      default:
        newResolvedTheme = "light";
    }

    setResolvedTheme(newResolvedTheme);
    localStorage.setItem("theme", theme);
    
    // Update the class on the html element
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newResolvedTheme);
  }, [theme, mounted]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
  };

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
