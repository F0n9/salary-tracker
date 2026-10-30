import { state, getSettingsStorageKey } from './state.js';
import { t } from './i18n.js';
import { renderAnalyticsDashboard } from './ui/chart.js';
export const applyTheme = (theme, save = true, clickEvent = null) => {
  let effectiveTheme = theme;
  if (theme === 'auto') {
    effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const isDark = effectiveTheme === 'dark';
  const currentlyDark = document.body.classList.contains('dark-mode');
  const isStateChange = isDark !== currentlyDark;

  const performThemeChange = () => {
    document.documentElement.classList.toggle('dark-mode', isDark);
    document.body.classList.toggle('dark-mode', isDark);

    const sunIcon = document.getElementById('iconThemeSun');
    const moonIcon = document.getElementById('iconThemeMoon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'block' : 'none';
      moonIcon.style.display = isDark ? 'none' : 'block';
    }
  };

  const persistThemeSettings = () => {
    if (save) {
      localStorage.setItem('salary_tracker_theme', theme);
      if (!state.settings) state.settings = {};
      state.settings.theme = theme;
      const settingsKey = getSettingsStorageKey();
      try {
        localStorage.setItem(settingsKey, JSON.stringify(state.settings));
      } catch (_) {}
    }

    const allWeeksModal = document.getElementById('allWeeksModal');
    if (allWeeksModal && allWeeksModal.style.display === 'flex') {
      renderAnalyticsDashboard();
    }
  };

  if (!isStateChange || !save) {
    performThemeChange();
    persistThemeSettings();
    return;
  }

  const toggleBtn = document.getElementById('btnToggleTheme');
  let targetBtn = toggleBtn;
  if (clickEvent && clickEvent.target) {
    const clicked = clickEvent.target.closest('#btnToggleTheme');
    if (clicked) targetBtn = clicked;
  }

  let x = window.innerWidth - 45;
  let y = 35;

  if (targetBtn) {
    const rect = targetBtn.getBoundingClientRect();
    x = Math.round(rect.left + rect.width / 2);
    y = Math.round(rect.top + rect.height / 2);
  } else if (clickEvent && typeof clickEvent.clientX === 'number' && (clickEvent.clientX > 0 || clickEvent.clientY > 0)) {
    x = clickEvent.clientX;
    y = clickEvent.clientY;
  }

  const maxCornerDist = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  const endRadius = Math.ceil(maxCornerDist * 1.15) + 60;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    performThemeChange();
    persistThemeSettings();
    return;
  }

  if (typeof document.startViewTransition === 'function') {
    try {
      document.documentElement.style.setProperty('--vt-x', `${x}px`);
      document.documentElement.style.setProperty('--vt-y', `${y}px`);
      document.documentElement.style.setProperty('--vt-r', `${endRadius}px`);

      document.documentElement.classList.add('theme-vt-active', isDark ? 'theme-vt-to-dark' : 'theme-vt-to-light');

      const transition = document.startViewTransition(() => {
        performThemeChange();
      });

      const cleanupVT = () => {
        document.documentElement.classList.remove('theme-vt-active', 'theme-vt-to-dark', 'theme-vt-to-light');
        document.documentElement.style.removeProperty('--vt-x');
        document.documentElement.style.removeProperty('--vt-y');
        document.documentElement.style.removeProperty('--vt-r');
        persistThemeSettings();
      };

      if (transition && typeof transition.finished?.then === 'function') {
        transition.finished.finally(cleanupVT);
      } else {
        setTimeout(cleanupVT, 580);
      }
      return;
    } catch (e) {
      document.documentElement.classList.remove('theme-vt-active', 'theme-vt-to-dark', 'theme-vt-to-light');
    }
  }

  document.body.classList.add('theme-transitioning');
  performThemeChange();
  persistThemeSettings();
  setTimeout(() => {
    document.body.classList.remove('theme-transitioning');
  }, 240);
};

export const toggleTheme = (clickEvent = null) => {
  const currentSaved = localStorage.getItem('salary_tracker_theme') || state.settings?.theme || 'light';
  let nextTheme = 'dark';
  if (currentSaved === 'dark') {
    nextTheme = 'light';
  } else if (currentSaved === 'light') {
    nextTheme = 'dark';
  } else {
    const isDark = document.body.classList.contains('dark-mode');
    nextTheme = isDark ? 'light' : 'dark';
  }
  applyTheme(nextTheme, true, clickEvent);
};
