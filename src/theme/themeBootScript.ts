export const themeBootScript = `(() => {
  const cookieName = "theme";
  const fallback = "system";
  const match = document.cookie.match(new RegExp("(?:^|; )" + cookieName + "=([^;]*)"));
  const preference = match ? decodeURIComponent(match[1]) : fallback;
  const safePreference = preference === "light" || preference === "dark" || preference === "system" ? preference : fallback;
  const resolved = safePreference === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : safePreference;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.dataset.theme = safePreference;
  root.style.colorScheme = resolved;
})();`;
