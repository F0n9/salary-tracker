import { WORKPLACE_PALETTES, GUEST_WEEKS_KEY, GUEST_SETTINGS_KEY, LOCAL_CACHE_WEEKS_KEY, LOCAL_CACHE_SETTINGS_KEY } from './config.js';

export const state = {
  currentUser: null,
  weeks: [],
  currentWeekId: null,
  settings: {
    workplaces: ['Chính'],
    workplaceRates: {},
    defaultWorkplace: 'Chính'
  }
};

export const hasWorkplaces = () => {
  return Array.isArray(state.settings?.workplaces) && state.settings.workplaces.length > 0;
};

export const getDefaultWorkplace = () => {
  if (hasWorkplaces()) {
    if (state.settings?.defaultWorkplace && state.settings.workplaces.includes(state.settings.defaultWorkplace)) {
      return state.settings.defaultWorkplace;
    }
    return state.settings.workplaces[0];
  }
  return '';
};

export const normalizeWorkplacesAndRates = () => {
  if (!state.settings) state.settings = {};
  if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
  if (!state.settings.workplaceRates || typeof state.settings.workplaceRates !== 'object') {
    state.settings.workplaceRates = {};
  }
  if (hasWorkplaces()) {
    if (!state.settings.defaultWorkplace || !state.settings.workplaces.includes(state.settings.defaultWorkplace)) {
      state.settings.defaultWorkplace = state.settings.workplaces[0];
    }
  } else {
    state.settings.defaultWorkplace = '';
  }
  const defWp = getDefaultWorkplace();
  if (defWp && (state.settings.workplaceRates[defWp] === undefined || state.settings.workplaceRates[defWp] === null)) {
    const fallbackRate = Number(state.settings.defaultRate) || (state.weeks[0]?.rate) || 0;
    state.settings.workplaceRates[defWp] = fallbackRate;
  }
};

export const getWorkplaceColor = (name) => {
  if (!name) return { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: 'rgba(100, 116, 139, 0.2)', fill: '#64748b' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % WORKPLACE_PALETTES.length;
  return WORKPLACE_PALETTES[idx];
};

export const getWeeksStorageKey = () => {
  if (state.currentUser && state.currentUser.id) {
    return `${LOCAL_CACHE_WEEKS_KEY}_${state.currentUser.id}`;
  }
  return GUEST_WEEKS_KEY;
};

export const getSettingsStorageKey = () => {
  if (state.currentUser && state.currentUser.id) {
    return `${LOCAL_CACHE_SETTINGS_KEY}_${state.currentUser.id}`;
  }
  return GUEST_SETTINGS_KEY;
};

export const getCurrentWeek = () => {
  return state.weeks.find(w => w.id === state.currentWeekId) || state.weeks[0];
};
