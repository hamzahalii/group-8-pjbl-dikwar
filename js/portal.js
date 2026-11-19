// Portal Controller: Theme & Analytics/Navigation Handlers

(function () {
  "use strict";

  const STORAGE_KEY_THEME = "dikwar_portal_theme";

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const sunIcon = document.getElementById("portalSunIcon");
    const moonIcon = document.getElementById("portalMoonIcon");
    const themeLabel = document.getElementById("portalThemeLabel");

    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
        if (themeLabel) themeLabel.textContent = "Mode Terang";
      } else {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
        if (themeLabel) themeLabel.textContent = "Mode Gelap";
      }
    }
  }

  window.togglePortalTheme = function () {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const nextThemeIsDark = !isCurrentlyDark;
    applyTheme(nextThemeIsDark);
    localStorage.setItem(STORAGE_KEY_THEME, nextThemeIsDark ? "dark" : "light");
  };

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      applyTheme(savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTheme);
  } else {
    initTheme();
  }
})();
