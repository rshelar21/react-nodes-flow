import { useEffect, useState } from "react";

export const useTheme = () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDarkMode, setIsDarkMode] = useState(false || prefersDark);
console.log(isDarkMode)
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  const theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [isDarkMode]);

  return {
    theme,
    toggleTheme,
    isDarkMode,
  };
};
