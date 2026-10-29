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

  const isMobileDevice = window.innerWidth <= 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    performThemeChange();
    persistThemeSettings();
    return;
  }

  if (typeof document.startViewTransition === 'function') {
    try {
      if (isMobileDevice) {
        document.documentElement.classList.add('theme-vt-mobile');
      } else {
        document.documentElement.classList.add('theme-vt-desktop');
      }

      const transition = document.startViewTransition(() => {
        performThemeChange();
      });

      if (transition && typeof transition.ready?.then === 'function') {
        transition.ready.then(() => {
          if (!isMobileDevice) {
            try {
              document.documentElement.animate(
                {
                  clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                  ]
                },
                {
                  duration: 520,
                  easing: 'cubic-bezier(0.25, 1, 0.4, 1)',
                  pseudoElement: '::view-transition-new(root)'
                }
              );
            } catch (waapiErr) {
              let styleTag = document.getElementById('_vtThemeStyle');
              if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = '_vtThemeStyle';
                document.head.appendChild(styleTag);
              }
              styleTag.textContent = `
                ::view-transition-new(root) {
                  animation: themeWaterRipple 0.52s cubic-bezier(0.25, 1, 0.4, 1) forwards !important;
                }
                @keyframes themeWaterRipple {
                  0% { clip-path: circle(0px at ${x}px ${y}px); }
                  100% { clip-path: circle(${endRadius}px at ${x}px ${y}px); }
                }
              `;
              setTimeout(() => {
                if (styleTag) styleTag.textContent = '';
              }, 560);
            }
          }
  }).catch(() => {});
      }

      const cleanupVT = () => {
        document.documentElement.classList.remove('theme-vt-mobile', 'theme-vt-desktop');
        persistThemeSettings();
      };

      if (transition && typeof transition.finished?.then === 'function') {
        transition.finished.finally(cleanupVT);
      } else {
        setTimeout(cleanupVT, isMobileDevice ? 260 : 560);
      }
      return;
    } catch (e) {
      document.documentElement.classList.remove('theme-vt-mobile', 'theme-vt-desktop');
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
