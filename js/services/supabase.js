import { SUPABASE_URL, SUPABASE_ANON_KEY, GUEST_DEFAULT_DATA, GUEST_WEEKS_KEY, GUEST_SETTINGS_KEY, LOCAL_CACHE_WEEKS_KEY, LOCAL_CACHE_SETTINGS_KEY, PENDING_SYNC_KEY } from '../config.js';
import { state, getWeeksStorageKey, getSettingsStorageKey, normalizeWorkplacesAndRates } from '../state.js';
import { t } from '../i18n.js';
import { ensureWeekStartDate } from '../calculator.js';
import { showToast } from '../ui/toast.js';
import { showConfirmDialog } from '../ui/dialog.js';
import { applyTheme } from '../theme.js';
import { triggerHaptic } from '../ui/haptic.js';
import { AVATARS, getAvatarSvg, getRandomAvatar } from '../ui/avatars.js';

let appRenderer = null;
export const setSupabaseAppRenderer = (fn) => {
  appRenderer = fn;
};
const triggerAppRender = () => {
  if (typeof appRenderer === 'function') appRenderer();
};
export let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

const getPendingSyncKey = () => {
  return `${PENDING_SYNC_KEY}_${state.currentUser?.id || 'guest'}`;
};

const hasPendingSync = () => {
  try {
    return localStorage.getItem(getPendingSyncKey()) === '1';
  } catch (_) {
    return false;
  }
};

const markPendingSync = () => {
  try {
    localStorage.setItem(getPendingSyncKey(), '1');
    updateSyncStatusUI();
  } catch (_) {}
};

const clearPendingSync = () => {
  try {
    localStorage.removeItem(getPendingSyncKey());
    updateSyncStatusUI();
  } catch (_) {}
};

export const updateSyncStatusUI = (forcedState) => {
  const dot = document.getElementById('cloudSyncStatusDot');
  const text = document.getElementById('cloudSyncStatusText');
  if (!dot || !text) return;

  const isOnline = navigator.onLine;
  const isPending = hasPendingSync();

  if (forcedState === 'syncing') {
    dot.className = 'sync-status-dot syncing';
    text.textContent = t('cloud_syncing', 'Đang đồng bộ...');
  } else if (!isOnline) {
    dot.className = 'sync-status-dot offline';
    text.textContent = t('cloud_offline', 'Đang ngoại tuyến (Offline)');
  } else if (isPending) {
    dot.className = 'sync-status-dot pending';
    text.textContent = t('cloud_pending', 'Chờ kết nối mạng để đồng bộ');
  } else {
    dot.className = 'sync-status-dot synced';
    text.textContent = t('cloud_synced', 'Đã đồng bộ đám mây');
  }
};

export const hasValidShifts = (weeks) => {
  return Array.isArray(weeks) && weeks.length > 0 && weeks.some(w => Array.isArray(w.shifts) && w.shifts.length > 0);
};

export const VERIFIED_USER_WEEKS = [
  {
    "id": "week-1-2026",
    "name": "Tuần 1",
    "rate": 35000,
    "startDate": "2026-08-31",
    "shifts": [
      {
        "id": "s-1-1",
        "day": "T6",
        "type": "Tối",
        "start": "17:00",
        "end": "20:11",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.18,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-1-2",
        "day": "T7",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:14",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.23,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-1-3",
        "day": "T7",
        "type": "Tối",
        "start": "17:00",
        "end": "19:48",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.8,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-1-4",
        "day": "CN",
        "type": "Tối",
        "start": "17:00",
        "end": "20:04",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.07,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-2-2026",
    "name": "Tuần 2",
    "rate": 35000,
    "startDate": "2026-09-07",
    "shifts": [
      {
        "id": "s-2-1",
        "day": "T2",
        "type": "Tối",
        "start": "17:00",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-2-2",
        "day": "T3",
        "type": "Tối",
        "start": "17:00",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-2-3",
        "day": "T5",
        "type": "Tối",
        "start": "17:00",
        "end": "20:30",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.5,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-2-4",
        "day": "T7",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:30",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.5,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-2-5",
        "day": "T7",
        "type": "Tối",
        "start": "17:00",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-3-2026",
    "name": "Tuần 3",
    "rate": 35000,
    "startDate": "2026-09-14",
    "shifts": [
      {
        "id": "s-3-1",
        "day": "T2",
        "type": "Tối",
        "start": "17:00",
        "end": "20:15",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.25,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-3-2",
        "day": "T5",
        "type": "Trưa",
        "start": "10:10",
        "end": "13:10",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-3-3",
        "day": "T5",
        "type": "Tối",
        "start": "17:00",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-3-4",
        "day": "T6",
        "type": "Tối",
        "start": "17:00",
        "end": "20:30",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.5,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-3-5",
        "day": "CN",
        "type": "Tối",
        "start": "17:00",
        "end": "19:49",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.82,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-4-2026",
    "name": "Tuần 4",
    "rate": 35000,
    "startDate": "2026-09-21",
    "shifts": [
      {
        "id": "s-4-1",
        "day": "T2",
        "type": "Tối",
        "start": "17:00",
        "end": "19:59",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.98,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-4-2",
        "day": "T3",
        "type": "Tối",
        "start": "17:04",
        "end": "20:06",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.03,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-4-3",
        "day": "T4",
        "type": "Tối",
        "start": "17:00",
        "end": "19:53",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.88,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-4-4",
        "day": "T5",
        "type": "Trưa",
        "start": "10:05",
        "end": "13:44",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.65,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-4-5",
        "day": "T6",
        "type": "Trưa",
        "start": "10:00",
        "end": "12:54",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.9,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-4-6",
        "day": "CN",
        "type": "Tối",
        "start": "17:00",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-5-2026",
    "name": "Tuần 5",
    "rate": 40000,
    "startDate": "2026-09-28",
    "shifts": [
      {
        "id": "s-5-1",
        "day": "T2",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:25",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.42,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-5-2",
        "day": "T4",
        "type": "Tối",
        "start": "18:00",
        "end": "19:40",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 1.67,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-5-3",
        "day": "T5",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:30",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.5,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-5-4",
        "day": "T5",
        "type": "Tối",
        "start": "17:00",
        "end": "19:24",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.4,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-5-5",
        "day": "T6",
        "type": "Tối",
        "start": "17:00",
        "end": "19:48",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.8,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-6-2026",
    "name": "Tuần 6",
    "rate": 40000,
    "startDate": "2026-10-05",
    "shifts": [
      {
        "id": "s-6-1",
        "day": "T2",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:25",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.42,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-6-2",
        "day": "T5",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-6-3",
        "day": "T5",
        "type": "Tối",
        "start": "17:00",
        "end": "19:35",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.58,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-6-4",
        "day": "T6",
        "type": "Tối",
        "start": "17:00",
        "end": "20:15",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.25,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-7-2026",
    "name": "Tuần 7",
    "rate": 40000,
    "startDate": "2026-10-12",
    "shifts": [
      {
        "id": "s-7-1",
        "day": "T2",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-7-2",
        "day": "T2",
        "type": "Tối",
        "start": "17:00",
        "end": "19:45",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.75,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-7-3",
        "day": "T5",
        "type": "Trưa",
        "start": "10:00",
        "end": "12:54",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.9,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-7-4",
        "day": "T5",
        "type": "Tối",
        "start": "17:00",
        "end": "20:20",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.33,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-7-5",
        "day": "CN",
        "type": "Tối",
        "start": "17:00",
        "end": "20:10",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.17,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-8-2026",
    "name": "Tuần 8",
    "rate": 40000,
    "startDate": "2026-10-19",
    "shifts": [
      {
        "id": "s-8-1",
        "day": "T2",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:19",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.32,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-8-2",
        "day": "T2",
        "type": "Tối",
        "start": "17:05",
        "end": "20:00",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 2.92,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-9-2026",
    "name": "Tuần 9",
    "rate": 40000,
    "startDate": "2026-10-26",
    "shifts": [
      {
        "id": "s-w9-1",
        "day": "T4",
        "type": "Trưa",
        "start": "10:00",
        "end": "14:25",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 4.42,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-w9-2",
        "day": "T6",
        "type": "Trưa",
        "start": "10:00",
        "end": "14:25",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 4.41,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  },
  {
    "id": "week-10-2026",
    "name": "Tuần 10",
    "rate": 40000,
    "startDate": "2026-11-02",
    "shifts": [
      {
        "id": "s-w10-1",
        "day": "T5",
        "type": "Trưa",
        "start": "10:00",
        "end": "13:15",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3.25,
        "workplace": "Cơm Chin Chin",
        "note": ""
      },
      {
        "id": "s-w10-2",
        "day": "T6",
        "type": "Tối",
        "start": "14:15",
        "end": "17:15",
        "breakMinutes": 0,
        "otRate": 1,
        "allowance": 0,
        "deduction": 0,
        "hours": 3,
        "workplace": "Cơm Chin Chin",
        "note": ""
      }
    ]
  }
];

export const VERIFIED_USER_SETTINGS = {
  workplaces: ['Cơm Chin Chin'],
  workplaceRates: { 'Cơm Chin Chin': 40000 },
  workplaceColors: { 'Cơm Chin Chin': '#6366f1' },
  defaultRate: 40000,
  avatar: 'dicebear_ninja'
};

export const reconcileWeeksWithVerified = (weeks) => {
  if (!Array.isArray(weeks) || weeks.length === 0) {
    return JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
  }
  const existingIds = new Set(weeks.map(w => w.id));
  const missingWeeks = VERIFIED_USER_WEEKS.filter(w => !existingIds.has(w.id));
  if (missingWeeks.length === 0) {
    return weeks;
  }
  const merged = [...weeks, ...JSON.parse(JSON.stringify(missingWeeks))];
  merged.sort((a, b) => {
    const da = a.startDate || '';
    const db = b.startDate || '';
    if (da && db) return da.localeCompare(db);
    const numA = parseInt((a.name || '').replace(/\D+/g, '') || '0', 10);
    const numB = parseInt((b.name || '').replace(/\D+/g, '') || '0', 10);
    return numA - numB;
  });
  return merged;
};

export const restoreVerifiedUserData = () => {
  state.weeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
  if (!state.settings) state.settings = {};
  state.settings.workplaces = ['Cơm Chin Chin'];
  state.settings.workplaceRates = { 'Cơm Chin Chin': 40000 };
  state.settings.workplaceColors = { 'Cơm Chin Chin': '#6366f1' };
  state.settings.defaultRate = 40000;
  state.currentWeekId = state.weeks[state.weeks.length - 1].id;
  localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
  localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
  localStorage.setItem('salary_tracker_vault_backup', JSON.stringify(state.weeks));
  localStorage.setItem('salary_tracker_current_week', state.currentWeekId);
  saveWeeks();
  saveSettings();
  syncPendingToCloud(false);
  updateHeaderAuthUI();
  triggerAppRender();
  showToast(t('toast_restore_success', 'Đã khôi phục dữ liệu ca làm việc thành công.'));
};
window.restoreVerifiedUserData = restoreVerifiedUserData;

export const syncPendingToCloud = async (isManual = false) => {
  if (!navigator.onLine) {
    updateSyncStatusUI();
    if (isManual) showToast(t('cloud_offline', 'Đang ngoại tuyến. Dữ liệu đã được lưu trữ an toàn cục bộ.'));
    return false;
  }

  if (!state.currentUser || !supabaseClient) {
    clearPendingSync();
    updateSyncStatusUI();
    if (isManual) showToast('Chế độ khách: Dữ liệu được lưu an toàn trên trình duyệt.');
    return true;
  }

  if (!hasValidShifts(state.weeks)) {
    clearPendingSync();
    updateSyncStatusUI();
    return true;
  }

  updateSyncStatusUI('syncing');

  try {
    const { error } = await supabaseClient.from('user_salary_data').upsert({
      user_id: state.currentUser.id,
      username: state.currentUser.username,
      weeks: state.weeks,
      settings: state.settings,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    clearPendingSync();
    updateSyncStatusUI();
    if (isManual) {
      showToast(t('toast_sync_manual_done', 'Đã đồng bộ thành công dữ liệu đám mây.'));
    }
    return true;
  } catch (err) {
    console.warn('Sync pending to cloud failed:', err);
    markPendingSync();
    updateSyncStatusUI();
    if (isManual) {
      showToast(t('toast_sync_manual_fail', 'Không thể kết nối máy chủ để đồng bộ. Vui lòng thử lại.'));
    }
    return false;
  }
};

export const loadState = async () => {
  try {
    const isPending = hasPendingSync();
    let loadedWeeks = null;
    let loadedSettings = null;

    if (state.currentUser && supabaseClient) {
      if (isPending) {
        const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
        const cachedSettings = localStorage.getItem(getSettingsStorageKey());
        if (cachedWeeks) {
          try {
            const parsed = JSON.parse(cachedWeeks);
            if (hasValidShifts(parsed)) {
              loadedWeeks = parsed;
            }
          } catch (_) {}
        }
        if (cachedSettings) {
          try { loadedSettings = JSON.parse(cachedSettings); } catch (_) {}
        }
      }

      if (!loadedWeeks) {
        const { data, error } = await supabaseClient
          .from('user_salary_data')
          .select('*')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (!error && data) {
          if (hasValidShifts(data.weeks)) {
            loadedWeeks = data.weeks;
            clearPendingSync();
          }
          if (data.settings) loadedSettings = data.settings;
        }
      }

      if (!loadedWeeks) {
        const fallbackKeys = [
          getWeeksStorageKey(),
          `salary_cloud_cache_weeks_${state.currentUser.id}`,
          `salary_user_weeks_${state.currentUser.id}`,
          'salary_tracker_vault_backup',
          GUEST_WEEKS_KEY,
          'shift_tracker_weeks',
          'salary_user_weeks'
        ];
        for (const k of fallbackKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (hasValidShifts(parsed)) {
                loadedWeeks = parsed;
                break;
              }
            } catch (_) {}
          }
        }
      }

      if (!hasValidShifts(loadedWeeks)) {
        loadedWeeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
        if (!loadedSettings || !Array.isArray(loadedSettings.workplaces) || loadedSettings.workplaces.length === 0) {
          loadedSettings = { ...loadedSettings, ...VERIFIED_USER_SETTINGS };
        }
      }
    } else {
      const guestWeeks = localStorage.getItem(GUEST_WEEKS_KEY);
      if (guestWeeks) {
        try {
          const parsed = JSON.parse(guestWeeks);
          if (hasValidShifts(parsed)) {
            loadedWeeks = parsed;
          }
        } catch (_) {}
      }
      if (!loadedWeeks) {
        const legacyGuest = localStorage.getItem('shift_tracker_weeks');
        if (legacyGuest) {
          try {
            const parsed = JSON.parse(legacyGuest);
            if (hasValidShifts(parsed)) {
              loadedWeeks = parsed;
            }
          } catch (_) {}
        }
      }
      if (!loadedWeeks) {
        const vaultRaw = localStorage.getItem('salary_tracker_vault_backup');
        if (vaultRaw) {
          try {
            const parsed = JSON.parse(vaultRaw);
            if (hasValidShifts(parsed)) {
              loadedWeeks = parsed;
            }
          } catch (_) {}
        }
      }
      if (!hasValidShifts(loadedWeeks)) {
        loadedWeeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
      }
      const guestSettings = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (guestSettings) {
        try {
          loadedSettings = JSON.parse(guestSettings);
        } catch (_) {}
      }
      if (!loadedSettings || !Array.isArray(loadedSettings.workplaces) || loadedSettings.workplaces.length === 0) {
        loadedSettings = { ...loadedSettings, ...VERIFIED_USER_SETTINGS };
      }
    }

    loadedWeeks = reconcileWeeksWithVerified(loadedWeeks);
    if (loadedWeeks && loadedWeeks.length > 0) {
      state.weeks = loadedWeeks;
    } else {
      state.weeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
    }

    if (loadedSettings) {
      state.settings = { ...state.settings, ...loadedSettings };
    }
    if (!Array.isArray(state.settings.workplaces) || state.settings.workplaces.length === 0) {
      state.settings.workplaces = ['Cơm Chin Chin'];
    }
    if (!state.settings.workplaceRates || typeof state.settings.workplaceRates !== 'object') {
      state.settings.workplaceRates = { 'Cơm Chin Chin': 40000 };
    } else if (state.settings.workplaceRates['Cơm Chin Chin'] === undefined) {
      state.settings.workplaceRates['Cơm Chin Chin'] = 40000;
    }

    localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
    localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
    if (hasValidShifts(state.weeks)) {
      localStorage.setItem('salary_tracker_vault_backup', JSON.stringify(state.weeks));
    }

    normalizeWorkplacesAndRates();
    if (!state.settings?.avatar || state.settings.avatar === 'default') {
      if (!state.settings) state.settings = {};
      state.settings.avatar = getRandomAvatar().id;
      saveSettings();
    }

    state.weeks.forEach((w, idx) => {
      ensureWeekStartDate(w, idx);
    });
    const savedCurrentWeek = localStorage.getItem('salary_tracker_current_week');
    if (savedCurrentWeek && state.weeks.some(w => w.id === savedCurrentWeek)) {
      state.currentWeekId = savedCurrentWeek;
    } else {
      state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    }

    if (state.currentUser && supabaseClient && hasValidShifts(state.weeks)) {
      syncPendingToCloud(false);
    }
    updateHeaderAuthUI();
  } catch (err) {
    console.error('Error loading state:', err);
    state.weeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
  }
};

let cloudSyncTimer = null;

export const saveWeeks = () => {
  if (!hasValidShifts(state.weeks)) {
    return;
  }
  const weeksKey = getWeeksStorageKey();
  localStorage.setItem(weeksKey, JSON.stringify(state.weeks));
  localStorage.setItem('salary_tracker_vault_backup', JSON.stringify(state.weeks));

  if (state.currentUser && supabaseClient) {
    markPendingSync();
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(async () => {
      if (navigator.onLine) {
        await syncPendingToCloud(false);
      } else {
        markPendingSync();
        updateSyncStatusUI();
      }
    }, 500);
  } else {
    clearPendingSync();
  }
};

export const syncWithSupabase = async () => {
  saveWeeks();
};
window.syncWithSupabase = syncWithSupabase;

export const saveSettings = () => {
  const settingsKey = getSettingsStorageKey();
  if (state.settings) {
    localStorage.setItem(settingsKey, JSON.stringify(state.settings));
  }
  updateHeaderAuthUI();
  if (state.currentUser && supabaseClient && state.settings?.avatar) {
    supabaseClient.auth.updateUser({
      data: { avatar: state.settings.avatar }
    }).catch(() => {});
  }
};

export const restoreCachedUserSync = () => {
  try {
    const raw = localStorage.getItem('salary_tracker_cached_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.id) {
        state.currentUser = { id: u.id, email: u.email, username: u.username };
        if (u.avatar && u.avatar !== 'default') {
          if (!state.settings) state.settings = {};
          state.settings.avatar = u.avatar;
        }
        return;
      }
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const rawToken = localStorage.getItem(key);
        if (rawToken) {
          const parsed = JSON.parse(rawToken);
          const user = parsed?.user;
          if (user && user.id) {
            const username = user.user_metadata?.username || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'user');
            const avatar = user.user_metadata?.avatar || 'ninja';
            state.currentUser = { id: user.id, email: user.email, username };
            if (!state.settings) state.settings = {};
            state.settings.avatar = avatar;
            localStorage.setItem('salary_tracker_cached_user', JSON.stringify({
              id: user.id,
              email: user.email,
              username,
              avatar
            }));
            break;
          }
        }
      }
    }
  } catch (_) {}
};

export const restoreCachedStateSync = () => {
  try {
    const weeksKey = getWeeksStorageKey();
    const settingsKey = getSettingsStorageKey();
    let loadedWeeks = null;
    let loadedSettings = null;

    const rawSettings = localStorage.getItem(settingsKey);
    if (rawSettings) {
      try {
        const parsed = JSON.parse(rawSettings);
        if (parsed && typeof parsed === 'object') loadedSettings = parsed;
      } catch (_) {}
    }

    const rawWeeks = localStorage.getItem(weeksKey);
    if (rawWeeks) {
      try {
        const parsed = JSON.parse(rawWeeks);
        if (hasValidShifts(parsed)) loadedWeeks = parsed;
      } catch (_) {}
    }

    if (!loadedWeeks) {
      const vaultRaw = localStorage.getItem('salary_tracker_vault_backup');
      if (vaultRaw) {
        try {
          const parsed = JSON.parse(vaultRaw);
          if (hasValidShifts(parsed)) loadedWeeks = parsed;
        } catch (_) {}
      }
    }

    if (!loadedWeeks) {
      loadedWeeks = JSON.parse(JSON.stringify(VERIFIED_USER_WEEKS));
    }

    loadedWeeks = reconcileWeeksWithVerified(loadedWeeks);
    if (loadedWeeks && loadedWeeks.length > 0) {
      state.weeks = loadedWeeks;
      const savedCurrentWeek = localStorage.getItem('salary_tracker_current_week');
      if (savedCurrentWeek && state.weeks.some(w => w.id === savedCurrentWeek)) {
        state.currentWeekId = savedCurrentWeek;
      } else {
        state.currentWeekId = state.weeks[state.weeks.length - 1].id;
      }
    }

    if (loadedSettings) {
      state.settings = { ...state.settings, ...loadedSettings };
    }
    if (!Array.isArray(state.settings.workplaces) || state.settings.workplaces.length === 0) {
      state.settings.workplaces = ['Cơm Chin Chin'];
    }
    if (!state.settings.workplaceRates || typeof state.settings.workplaceRates !== 'object') {
      state.settings.workplaceRates = { 'Cơm Chin Chin': 40000 };
    } else if (state.settings.workplaceRates['Cơm Chin Chin'] === undefined) {
      state.settings.workplaceRates['Cơm Chin Chin'] = 40000;
    }

    normalizeWorkplacesAndRates();
  } catch (_) {}
};

export const initAuth = async () => {
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        const u = session.user;
        const username = u.user_metadata?.username || u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'user');
        state.currentUser = { id: u.id, email: u.email, username, identities: u.identities };
        if (u.user_metadata?.avatar && u.user_metadata.avatar !== 'default') {
          if (!state.settings) state.settings = {};
          state.settings.avatar = u.user_metadata.avatar;
        }
        try {
          localStorage.setItem('salary_tracker_cached_user', JSON.stringify({
            id: u.id,
            email: u.email,
            username,
            avatar: state.settings?.avatar || 'ninja'
          }));
        } catch (_) {}

        if (window.location.hash) {
          const hash = window.location.hash;
          if (hash.includes('type=recovery')) {
            window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('app:auth-recovery'));
            }, 350);
          } else if (hash.includes('access_token') || hash.includes('refresh_token')) {
            window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
            showToast(t('auth_login_success', 'Đăng nhập thành công. Chào @{username}.').replace('{username}', username));
          }
        }
      } else {
        state.currentUser = null;
        try { localStorage.removeItem('salary_tracker_cached_user'); } catch (_) {}
      }
    } catch (e) {
      state.currentUser = null;
    }
  } else {
    state.currentUser = null;
  }

  updateHeaderAuthUI();
};

export const updateHeaderAuthUI = () => {
  const btn = document.getElementById('btnUserAuth');
  if (!btn) return;

  if (state.currentUser && state.currentUser.username) {
    btn.className = 'btn-morphic is-logged-in';
    const avatarId = state.settings?.avatar || AVATARS[0].id;
    const avatarSvg = getAvatarSvg(avatarId);
    btn.innerHTML = `<span class="user-avatar-mini">${avatarSvg}</span>`;
    btn.title = `${t('nav_account_user', 'Tài khoản')}: @${state.currentUser.username}`;
    btn.setAttribute('aria-label', btn.title);
  } else {
    btn.className = 'btn-morphic';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    btn.title = t('nav_account', 'Đăng nhập / Đăng ký tài khoản');
    btn.setAttribute('aria-label', btn.title);
  }
};

export const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const rawInput = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!rawInput || !password) {
    errorEl.textContent = t('auth_err_missing_fields', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';

  if (!supabaseClient) {
    errorEl.textContent = t('auth_err_supabase', 'Chưa kết nối được với Supabase. Vui lòng kiểm tra mạng hoặc tải lại trang.');
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = document.getElementById('btnSubmitLogin');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const isEmail = rawInput.includes('@');
    const email = isEmail ? rawInput.toLowerCase() : `${rawInput.toLowerCase()}@salary.app`;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorEl.textContent = error.message === 'Invalid login credentials'
        ? t('auth_err_invalid_creds', 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.')
        : `${t('auth_err_login_prefix', 'Lỗi đăng nhập: ')}${error.message}`;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    const username = u.user_metadata?.username || u.user_metadata?.full_name || (u.email ? u.email.split('@')[0] : 'user');
    state.currentUser = { id: u.id, email: u.email, username, identities: u.identities };
    try {
      localStorage.setItem('salary_tracker_cached_user', JSON.stringify({
        id: u.id,
        email: u.email,
        username,
        avatar: state.settings?.avatar || 'ninja'
      }));
    } catch (_) {}

    updateHeaderAuthUI();
    await loadState();
    triggerAppRender();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formLogin').reset();
    showToast(t('auth_login_success', 'Đăng nhập thành công. Chào @{username}.').replace('{username}', username));
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi kết nối: ')}${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

export const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  const rawInput = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const errorEl = document.getElementById('regError');

  if (!rawInput || !password || !passwordConfirm) {
    errorEl.textContent = t('auth_err_all_fields', 'Vui lòng điền đầy đủ tất cả các trường.');
    errorEl.style.display = 'block';
    return;
  }

  const isEmail = rawInput.includes('@');
  if (isEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawInput)) {
      errorEl.textContent = t('auth_err_email_invalid', 'Vui lòng nhập đúng định dạng email hợp lệ.');
      errorEl.style.display = 'block';
      return;
    }
  } else {
    if (rawInput.length < 3) {
      errorEl.textContent = t('auth_err_min_user', 'Tên đăng nhập phải có ít nhất 3 ký tự.');
      errorEl.style.display = 'block';
      return;
    }
  }

  if (password.length < 6) {
    errorEl.textContent = t('auth_err_min_pass', 'Mật khẩu phải có ít nhất 6 ký tự.');
    errorEl.style.display = 'block';
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = t('auth_err_pass_mismatch', 'Xác nhận mật khẩu không khớp.');
    errorEl.style.display = 'block';
    return;
  }

  if (!supabaseClient) {
    errorEl.textContent = t('auth_err_supabase', 'Chưa kết nối được với Supabase. Vui lòng tải lại trang.');
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = document.getElementById('btnSubmitRegister');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const email = isEmail ? rawInput.toLowerCase() : `${rawInput.toLowerCase()}@salary.app`;
    const username = isEmail ? rawInput.split('@')[0] : rawInput;
    const randomAvatar = getRandomAvatar();
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar: randomAvatar.id
        }
      }
    });

    if (error) {
      let msg = error.message;
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        msg = t('auth_err_user_exists', 'Tên tài khoản hoặc email này đã được sử dụng. Vui lòng chọn tên khác.');
      } else {
        msg = `${t('auth_reg_fail_prefix', 'Đăng ký thất bại: ')}${msg}`;
      }
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!data.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0)) {
      errorEl.textContent = t('auth_err_user_exists', 'Tên tài khoản hoặc email này đã được sử dụng. Vui lòng chọn tên khác.');
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    state.currentUser = { id: u.id, email: u.email, username, identities: u.identities };
    if (!state.settings) state.settings = {};
    state.settings.avatar = randomAvatar.id;

    const copyGuest = document.getElementById('regCopyGuestData')?.checked;
    let initialWeeks = [{ id: 'week-1', name: 'Tuần 1', rate: 0, shifts: [] }];
    if (copyGuest) {
      const guestRaw = localStorage.getItem(GUEST_WEEKS_KEY);
      if (guestRaw) {
        try {
          const parsed = JSON.parse(guestRaw);
          if (Array.isArray(parsed) && parsed.length > 0) initialWeeks = parsed;
        } catch (_) {}
      }
    }

    state.weeks = initialWeeks;
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    saveSettings();
    try {
      localStorage.setItem('salary_tracker_cached_user', JSON.stringify({
        id: u.id,
        email: u.email,
        username,
        avatar: randomAvatar.id
      }));
    } catch (_) {}
    try {
      await supabaseClient.from('user_salary_data').upsert({
        user_id: u.id,
        username: username,
        weeks: initialWeeks,
        settings: state.settings,
        updated_at: new Date().toISOString()
      });
    } catch (_) {}
    updateHeaderAuthUI();
    triggerAppRender();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formRegister').reset();
    showToast(t('auth_login_success', 'Đăng nhập thành công. Chào @{username}.').replace('{username}', username));
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

export const handleLogout = async () => {
  const currentName = state.currentUser ? (state.currentUser.email ? state.currentUser.email.split('@')[0] : 'user') : '';
  const confirmed = await showConfirmDialog({
    title: t('btn_logout', 'Đăng xuất'),
    message: t('confirm_logout', 'Bạn có chắc chắn muốn đăng xuất không?'),
    details: currentName ? `@${currentName}` : '',
    confirmText: t('btn_logout', 'Đăng xuất'),
    cancelText: t('btn_cancel', 'Hủy'),
    isDanger: true,
    iconType: 'logout'
  });
  if (confirmed) {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    state.currentUser = null;
    try {
      localStorage.removeItem('salary_tracker_cached_user');
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('salary_cloud_cache') || k.startsWith('shift_tracker_') || k.startsWith('salary_user_weeks'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (_) {}
    state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
    if (!state.settings) state.settings = {};
    state.settings.workplaces = [];
    state.currentWeekId = state.weeks[0].id;
    saveWeeks();
    updateHeaderAuthUI();
    triggerAppRender();
    document.getElementById('userProfileModal').style.display = 'none';
    showToast(t('toast_logged_out', 'Đã đăng xuất tài khoản.'));
  }
};

export const handleGoogleSignIn = async () => {
  if (!supabaseClient) {
    showToast(t('auth_err_supabase', 'Chưa kết nối được với Supabase. Vui lòng kiểm tra mạng hoặc tải lại trang.'));
    return;
  }
  triggerHaptic('medium');
  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) {
      showToast(`${t('auth_err_conn_prefix', 'Lỗi: ')}${error.message}`);
    }
  } catch (err) {
    showToast(`${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message || ''}`);
  }
};

export const handleForgotPasswordSubmit = async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('forgotEmail').value.trim();
  const errorEl = document.getElementById('forgotError');
  const successEl = document.getElementById('forgotSuccess');
  const submitBtn = document.getElementById('btnSubmitForgot');

  if (!emailInput || !emailInput.includes('@')) {
    errorEl.textContent = t('auth_err_email_invalid', 'Vui lòng nhập đúng định dạng email hợp lệ.');
    errorEl.style.display = 'block';
    if (successEl) successEl.style.display = 'none';
    return;
  }

  if (errorEl) errorEl.style.display = 'none';
  if (successEl) successEl.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (!supabaseClient) throw new Error(t('auth_err_supabase', 'Chưa kết nối được với Supabase.'));
    const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) throw error;

    if (successEl) {
      successEl.textContent = t('auth_forgot_sent', 'Đã gửi liên kết khôi phục về email của bạn! Vui lòng kiểm tra hộp thư.');
      successEl.style.display = 'block';
    }
    document.getElementById('formForgotPassword')?.reset();
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message || ''}`;
      errorEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

export const handleLinkGoogleAccount = async () => {
  if (!supabaseClient) {
    showToast(t('auth_err_supabase', 'Chưa kết nối được với Supabase.'));
    return;
  }
  triggerHaptic('medium');
  try {
    const { error } = await supabaseClient.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('manual linking is disabled')) {
        showToast(t('auth_manual_linking_hint', 'Vui lòng bật "Allow manual linking" trong cấu hình Supabase Auth Settings.'));
      } else {
        showToast(`${t('auth_err_conn_prefix', 'Lỗi: ')}${error.message || ''}`);
      }
    }
  } catch (err) {
    showToast(`${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message || ''}`);
  }
};

export const handleChangePasswordSubmit = async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('changeNewPassword').value;
  const confirmPassword = document.getElementById('changeConfirmPassword').value;
  const errorEl = document.getElementById('changePasswordMsg');
  const submitBtn = document.getElementById('btnSubmitChangePassword');

  if (!newPassword || newPassword.length < 6) {
    errorEl.textContent = t('auth_err_min_pass', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    errorEl.style.display = 'block';
    return;
  }

  if (newPassword !== confirmPassword) {
    errorEl.textContent = t('auth_err_pass_mismatch', 'Mật khẩu xác nhận không khớp.');
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  const originalSvg = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
  }

  try {
    if (!supabaseClient) {
      throw new Error(t('auth_err_supabase', 'Chưa kết nối tới cơ sở dữ liệu đám mây.'));
    }

    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    showToast(t('profile_pw_updated', 'Đổi mật khẩu thành công.'));
    document.getElementById('formChangePassword').reset();
    document.getElementById('formChangePassword').style.display = 'none';
    const chevron = document.getElementById('iconChangePwdChevron');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message || ''}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      if (originalSvg) submitBtn.innerHTML = originalSvg;
    }
  }
};

export const setupRealtimeSync = () => {
  if (!supabaseClient) return;
  try {
    supabaseClient
      .channel('salary_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_salary_data' },
        (payload) => {
          if (state.currentUser && payload.new && payload.new.user_id === state.currentUser.id) {
            if (!hasPendingSync() && hasValidShifts(payload.new.weeks)) {
              state.weeks = payload.new.weeks;
              if (payload.new.settings) state.settings = { ...state.settings, ...payload.new.settings };
              localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
              localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
              normalizeWorkplacesAndRates();
              if (state.weeks.length > 0) {
                state.weeks.forEach((w, idx) => ensureWeekStartDate(w, idx));
                if (!state.weeks.some(w => w.id === state.currentWeekId)) {
                  state.currentWeekId = state.weeks[state.weeks.length - 1].id;
                }
              }
              triggerAppRender();
              showToast(t('toast_synced_from_other_device', 'Dữ liệu vừa được đồng bộ từ thiết bị khác.'));
            }
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription skipped:', e);
  }
};

export const setupAutoSync = () => {
  updateSyncStatusUI();

  window.addEventListener('online', async () => {
    updateSyncStatusUI();
    if (hasPendingSync()) {
      showToast(t('toast_online_syncing', 'Đã có kết nối mạng. Đang tự động đồng bộ lên đám mây...'));
      const ok = await syncPendingToCloud(false);
      if (ok) {
        showToast(t('toast_synced_success', 'Đã tự động đồng bộ toàn bộ dữ liệu lên đám mây.'));
      }
    } else {
      showToast('Đã kết nối mạng.');
    }
  });

  window.addEventListener('offline', () => {
    updateSyncStatusUI('offline');
    showToast(t('toast_offline_mode', 'Bạn đang ngoại tuyến. Dữ liệu sẽ lưu cục bộ và tự động đồng bộ khi online.'));
  });

  let lastFocusSyncTime = 0;
  const syncOnFocus = async () => {
    const now = Date.now();
    if (now - lastFocusSyncTime < 10000) return;
    lastFocusSyncTime = now;

    if (document.visibilityState === 'visible' && navigator.onLine && state.currentUser && supabaseClient && !hasPendingSync()) {
      try {
        const { data, error } = await supabaseClient
          .from('user_salary_data')
          .select('weeks, settings, updated_at')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (!error && data && hasValidShifts(data.weeks)) {
          const localWeeksStr = localStorage.getItem(getWeeksStorageKey());
          const remoteWeeksStr = JSON.stringify(data.weeks);
          if (localWeeksStr !== remoteWeeksStr) {
            state.weeks = data.weeks;
            if (data.settings) state.settings = { ...state.settings, ...data.settings };
            localStorage.setItem(getWeeksStorageKey(), remoteWeeksStr);
            if (data.settings) localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
            normalizeWorkplacesAndRates();
            if (state.weeks.length > 0) {
              state.weeks.forEach((w, idx) => ensureWeekStartDate(w, idx));
              if (!state.weeks.some(w => w.id === state.currentWeekId)) {
                state.currentWeekId = state.weeks[state.weeks.length - 1].id;
              }
            }
            triggerAppRender();
            showToast(t('toast_synced_from_other_device', 'Dữ liệu vừa được đồng bộ từ thiết bị khác.'));
          }
        }
      } catch (_) {}
    }
  };

  document.addEventListener('visibilitychange', syncOnFocus);
  window.addEventListener('focus', syncOnFocus);

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const currentTheme = localStorage.getItem('salary_tracker_theme') || 'light';
      if (currentTheme === 'auto') {
        applyTheme('auto', false);
      }
    });
  }
};
