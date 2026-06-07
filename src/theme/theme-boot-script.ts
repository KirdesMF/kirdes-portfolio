export const themeBootScript = `(() => {
  const defaults = {
    mode: "system",
    lightTheme: "github-light",
    darkTheme: "tokyo-night",
  };
  const validModes = new Set(["light", "dark", "system"]);
  const validLightThemes = new Set(["original-light", "catppuccin-latte", "nord-snow-storm", "github-light", "ayu-light", "sage-light"]);
  const validDarkThemes = new Set(["original-dark", "catppuccin-mocha", "nord-polar-night", "tokyo-night", "ayu-dark", "sage-dark"]);
  const cookies = Object.fromEntries(
    document.cookie.split("; ").filter(Boolean).map((cookie) => {
      const index = cookie.indexOf("=");
      return [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))];
    }),
  );
  const mode = validModes.has(cookies["theme-mode"]) ? cookies["theme-mode"] : defaults.mode;
  const lightTheme = validLightThemes.has(cookies["light-theme"]) ? cookies["light-theme"] : defaults.lightTheme;
  const darkTheme = validDarkThemes.has(cookies["dark-theme"]) ? cookies["dark-theme"] : defaults.darkTheme;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolvedMode = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  const activeTheme = resolvedMode === "dark" ? darkTheme : lightTheme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedMode);
  root.dataset.mode = mode;
  root.dataset.theme = activeTheme;
  root.style.colorScheme = resolvedMode;
})();`;
