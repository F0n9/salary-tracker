

const SUPABASE_URL = 'https://vkrtqjghtgjnhuhiwlay.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcnRxamdodGdqbmh1aGl3bGF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NDA0MDQsImV4cCI6MjEwODMxNjQwNH0.GEZjiHjy7V7oNzG5CvRtwA2vOzeY7mx7Oh-A49SVKn4';

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

const GUEST_DEFAULT_DATA = [
  {
    "id": "week-1",
    "name": "Tuần 1",
    "rate": 0,
    "shifts": []
  }
];

const GUEST_WEEKS_KEY = 'shift_tracker_weeks_v2';
const GUEST_SETTINGS_KEY = 'shift_tracker_settings_v2';
const LOCAL_CACHE_WEEKS_KEY = 'salary_cloud_cache_weeks';
const LOCAL_CACHE_SETTINGS_KEY = 'salary_cloud_cache_settings';
const PENDING_SYNC_KEY = 'salary_tracker_pending_sync';

// ===== I18N TRANSLATIONS (VI, EN, JA) =====
const I18N = {
  vi: {
    app_title: 'Salary Tracker',
    theme_light: 'Sáng',
    theme_dark: 'Tối',
    theme_auto: 'Tự động',
    cloud_synced: 'Đã đồng bộ đám mây',
    cloud_pending: 'Chờ kết nối mạng để đồng bộ',
    cloud_offline: 'Đang ngoại tuyến (Offline)',
    cloud_syncing: 'Đang đồng bộ...',
    cloud_btn_sync: 'Đồng bộ ngay',
    toast_online_syncing: 'Đã có kết nối mạng. Đang tự động đồng bộ lên đám mây...',
    toast_synced_success: 'Đã tự động đồng bộ toàn bộ dữ liệu lên đám mây!',
    toast_offline_mode: 'Bạn đang ngoại tuyến. Dữ liệu sẽ lưu cục bộ và tự động đồng bộ khi online.',
    toast_sync_manual_done: 'Đã đồng bộ thành công dữ liệu đám mây!',
    toast_sync_manual_fail: 'Không thể kết nối máy chủ để đồng bộ.',
    kpi_salary: 'Thu nhập tuần',
    kpi_hours: 'Tổng thời gian',
    kpi_shifts: 'Số ca làm việc',
    shifts_title: 'Danh sách ca làm việc',
    filter_all: 'Tất cả',
    filter_morning: 'Sáng',
    filter_noon: 'Trưa',
    filter_evening: 'Tối',
    dock_prev: 'Tuần trước',
    dock_add: 'Thêm ca',
    dock_next: 'Tuần sau',
    dock_reports: 'Báo cáo',
    dock_slip: 'Phiếu',
    modal_add_shift: 'Thêm ca làm việc mới',
    modal_edit_shift: 'Chỉnh sửa ca làm việc',
    modal_day: 'Thứ',
    modal_type: 'Ca làm',
    modal_workplace: 'Nơi làm việc',
    modal_start: 'Giờ bắt đầu',
    modal_end: 'Giờ kết thúc',
    modal_break: 'Nghỉ (phút)',
    modal_ot: 'Hệ số tăng ca',
    modal_allowance: 'Thưởng / Phụ cấp',
    modal_note: 'Ghi chú ca làm',
    modal_prev_dur: 'Thời gian làm dự kiến',
    modal_prev_sal: 'Thành tiền dự kiến',
    modal_btn_cancel: 'Hủy',
    modal_btn_save: 'Lưu ca làm',
    modal_btn_delete: 'Xóa ca',
    shift_morning: 'Sáng',
    shift_noon: 'Trưa',
    shift_evening: 'Tối',
    unit_shift: 'ca',
    unit_per_shift: 'h/ca'
  },
  en: {
    app_title: 'Salary Tracker',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_auto: 'Auto',
    cloud_synced: 'Cloud Synced',
    cloud_pending: 'Waiting for network to sync',
    cloud_offline: 'Offline Mode',
    cloud_syncing: 'Syncing...',
    cloud_btn_sync: 'Sync Now',
    toast_online_syncing: 'Back online. Auto-syncing to cloud...',
    toast_synced_success: 'All data successfully auto-synced to cloud!',
    toast_offline_mode: 'You are offline. Data is saved locally and will auto-sync when online.',
    toast_sync_manual_done: 'Cloud sync completed successfully!',
    toast_sync_manual_fail: 'Could not connect to server to sync.',
    kpi_salary: 'Week Earnings',
    kpi_hours: 'Total Hours',
    kpi_shifts: 'Total Shifts',
    shifts_title: 'Shifts List',
    filter_all: 'All',
    filter_morning: 'Morning',
    filter_noon: 'Noon',
    filter_evening: 'Evening',
    dock_prev: 'Prev Week',
    dock_add: 'Add Shift',
    dock_next: 'Next Week',
    dock_reports: 'Reports',
    dock_slip: 'Slip',
    modal_add_shift: 'Add New Shift',
    modal_edit_shift: 'Edit Shift',
    modal_day: 'Day',
    modal_type: 'Shift Type',
    modal_workplace: 'Workplace',
    modal_start: 'Start Time',
    modal_end: 'End Time',
    modal_break: 'Break (mins)',
    modal_ot: 'Overtime Rate',
    modal_allowance: 'Bonus / Allowance',
    modal_note: 'Shift Note',
    modal_prev_dur: 'Estimated Duration',
    modal_prev_sal: 'Estimated Earnings',
    modal_btn_cancel: 'Cancel',
    modal_btn_save: 'Save Shift',
    modal_btn_delete: 'Delete',
    shift_morning: 'Morning',
    shift_noon: 'Noon',
    shift_evening: 'Evening',
    unit_shift: 'shifts',
    unit_per_shift: 'h/shift'
  },
  ja: {
    app_title: 'Salary Tracker',
    theme_light: 'ライト',
    theme_dark: 'ダーク',
    theme_auto: '自動',
    cloud_synced: 'クラウド同期完了',
    cloud_pending: '接続待機中（未同期）',
    cloud_offline: 'オフラインモード',
    cloud_syncing: '同期中...',
    cloud_btn_sync: '今すぐ同期',
    toast_online_syncing: 'オンラインに復帰しました。自動同期中...',
    toast_synced_success: 'クラウドへの自動同期が完了しました！',
    toast_offline_mode: 'オフラインです。データは端末に保存され、接続時に自動同期されます。',
    toast_sync_manual_done: 'クラウドとの同期が完了しました！',
    toast_sync_manual_fail: 'サーバーに接続できませんでした。',
    kpi_salary: '週間給与',
    kpi_hours: '総勤務時間',
    kpi_shifts: 'シフト数',
    shifts_title: 'シフト一覧',
    filter_all: 'すべて',
    filter_morning: '朝',
    filter_noon: '昼',
    filter_evening: '夜',
    dock_prev: '前週',
    dock_add: '追加',
    dock_next: '次週',
    dock_reports: 'レポート',
    dock_slip: '明細',
    modal_add_shift: '新しいシフトを追加',
    modal_edit_shift: 'シフトを編集',
    modal_day: '曜日',
    modal_type: '時間帯',
    modal_workplace: '勤務先',
    modal_start: '開始時間',
    modal_end: '終了時間',
    modal_break: '休憩（分）',
    modal_ot: '残業割増率',
    modal_allowance: '手当・ボーナス',
    modal_note: 'メモ',
    modal_prev_dur: '予定勤務時間',
    modal_prev_sal: '概算給与',
    modal_btn_cancel: 'キャンセル',
    modal_btn_save: 'シフトを保存',
    modal_btn_delete: '削除',
    shift_morning: '朝',
    shift_noon: '昼',
    shift_evening: '夜',
    unit_shift: '回',
    unit_per_shift: 'h/回'
  }
};

const getCurrentLang = () => {
  return localStorage.getItem('salary_tracker_lang') || state.settings?.language || 'vi';
};

const t = (key, fallback = '') => {
  const lang = getCurrentLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N.vi && I18N.vi[key]) || fallback;
};

const getLocalizedShiftType = (type) => {
  const formatted = formatShiftType(type);
  const lang = getCurrentLang();
  if (lang === 'vi') return formatted;
  const lower = formatted.toLowerCase();
  if (lower === 'sáng') return t('shift_morning', 'Morning');
  if (lower === 'trưa') return t('shift_noon', 'Noon');
  if (lower === 'tối') return t('shift_evening', 'Evening');
  return formatted;
};

const getLocalizedDayName = (dayCode) => {
  const lang = getCurrentLang();
  const dayMaps = {
    vi: { 'T2': 'T2', 'T3': 'T3', 'T4': 'T4', 'T5': 'T5', 'T6': 'T6', 'T7': 'T7', 'CN': 'CN' },
    en: { 'T2': 'Mon', 'T3': 'Tue', 'T4': 'Wed', 'T5': 'Thu', 'T6': 'Fri', 'T7': 'Sat', 'CN': 'Sun' },
    ja: { 'T2': '月曜', 'T3': '火曜', 'T4': '水曜', 'T5': '木曜', 'T6': '金曜', 'T7': '土曜', 'CN': '日曜' }
  };
  return (dayMaps[lang] && dayMaps[lang][dayCode]) || dayMaps.vi[dayCode] || dayCode;
};

// ===== THEME & AUTO-SYNC HELPERS =====
const applyTheme = (theme, save = true) => {
  let effectiveTheme = theme;
  if (theme === 'auto') {
    effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const isDark = effectiveTheme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  const sunIcon = document.getElementById('iconThemeSun');
  const moonIcon = document.getElementById('iconThemeMoon');
  if (sunIcon && moonIcon) {
    sunIcon.style.display = isDark ? 'block' : 'none';
    moonIcon.style.display = isDark ? 'none' : 'block';
  }

  document.querySelectorAll('#themeSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeVal === theme);
  });

  if (save) {
    localStorage.setItem('salary_tracker_theme', theme);
    if (!state.settings) state.settings = {};
    state.settings.theme = theme;
    saveSettings();
  }

  const allWeeksModal = document.getElementById('allWeeksModal');
  if (allWeeksModal && allWeeksModal.style.display === 'flex') {
    renderAnalyticsDashboard();
  }
};

const toggleTheme = () => {
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
  applyTheme(nextTheme, true);
};

const applyLanguage = (lang, save = true) => {
  const selectedLang = ['vi', 'en', 'ja'].includes(lang) ? lang : 'vi';
  document.documentElement.lang = selectedLang;

  document.querySelectorAll('#langSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langVal === selectedLang);
  });

  if (save) {
    localStorage.setItem('salary_tracker_lang', selectedLang);
    if (!state.settings) state.settings = {};
    state.settings.language = selectedLang;
    saveSettings();
  }

  translateUI();
  renderApp();
};

const translateUI = () => {
  const lang = getCurrentLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (I18N[lang] && I18N[lang][key]) {
      el.textContent = I18N[lang][key];
    }
  });

  const kpiSalLabel = document.querySelector('#ledgerCardSummary .ledger-cell.primary .cell-label');
  if (kpiSalLabel) kpiSalLabel.textContent = t('kpi_salary', 'Thu nhập tuần');
  const kpiCells = document.querySelectorAll('#ledgerCardSummary .ledger-cell .cell-label');
  if (kpiCells[1]) kpiCells[1].textContent = t('kpi_hours', 'Tổng thời gian');
  if (kpiCells[2]) kpiCells[2].textContent = t('kpi_shifts', 'Số ca làm việc');

  const shiftsTitleEl = document.querySelector('.shifts-title');
  if (shiftsTitleEl) shiftsTitleEl.textContent = t('shifts_title', 'Danh sách ca làm việc');

  const dockLabels = {
    'dockPrevWeek': 'dock_prev',
    'dockAddShift': 'dock_add',
    'dockNextWeek': 'dock_next',
    'dockAnalytics': 'dock_reports',
    'dockShareSlip': 'dock_slip'
  };
  Object.entries(dockLabels).forEach(([id, k]) => {
    const btn = document.getElementById(id);
    const labelSpan = btn?.querySelector('.dock-label');
    if (labelSpan) labelSpan.textContent = t(k, labelSpan.textContent);
  });

  const filterPillMap = {
    'all': 'filter_all',
    'Sáng': 'filter_morning',
    'Trưa': 'filter_noon',
    'Tối': 'filter_evening'
  };
  document.querySelectorAll('.filter-pill[data-filter-type]').forEach(pill => {
    const fType = pill.getAttribute('data-filter-type');
    if (filterPillMap[fType]) {
      pill.textContent = t(filterPillMap[fType], pill.textContent);
    }
  });

  updateSyncStatusUI();
};

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

const updateSyncStatusUI = (forcedState) => {
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

const syncPendingToCloud = async (isManual = false) => {
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
      showToast(t('toast_sync_manual_done', 'Đã đồng bộ thành công dữ liệu đám mây!'));
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

const state = {
  currentUser: null,
  weeks: [],
  currentWeekId: null,
  settings: {
    defaultRate: 0,
    workplaces: []
  }
};

const WORKPLACE_PALETTES = [
  { bg: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', border: 'rgba(99, 102, 241, 0.25)', fill: '#6366f1' },
  { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)', fill: '#10b981' },
  { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.25)', fill: '#f59e0b' },
  { bg: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', border: 'rgba(244, 63, 94, 0.25)', fill: '#f43f5e' },
  { bg: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: 'rgba(6, 182, 212, 0.25)', fill: '#06b6d4' },
  { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', border: 'rgba(139, 92, 246, 0.25)', fill: '#8b5cf6' }
];

const getWorkplaceColor = (name) => {
  if (!name) return { bg: 'rgba(100, 116, 139, 0.08)', color: '#475569', border: 'rgba(100, 116, 139, 0.2)', fill: '#64748b' };
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % WORKPLACE_PALETTES.length;
  return WORKPLACE_PALETTES[idx];
};

const getWeeksStorageKey = () => {
  if (state.currentUser && state.currentUser.id) {
    return `${LOCAL_CACHE_WEEKS_KEY}_${state.currentUser.id}`;
  }
  return GUEST_WEEKS_KEY;
};

const getSettingsStorageKey = () => {
  if (state.currentUser && state.currentUser.id) {
    return `${LOCAL_CACHE_SETTINGS_KEY}_${state.currentUser.id}`;
  }
  return GUEST_SETTINGS_KEY;
};

const fmtCurrency = (num) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(num || 0)) + ' đ';
};

const fmtHours = (hours) => {
  const h = Number(hours || 0);
  return h.toFixed(2) + ' h';
};

const hoursToHourMinutes = (hours) => {
  const totalMinutes = Math.round(Number(hours || 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const calculateHoursDiff = (startStr, endStr, breakMinutes = 0) => {
  const startMins = parseTimeToMinutes(startStr);
  let endMins = parseTimeToMinutes(endStr);
  if (endMins < startMins) {
    endMins += 24 * 60;
  }
  const diffMinutes = Math.max(0, endMins - startMins - (Number(breakMinutes) || 0));
  return Number((diffMinutes / 60).toFixed(2));
};

const getShiftRate = (shift, week) => {
  if (shift && shift.workplace && state.settings && state.settings.workplaceRates && state.settings.workplaceRates[shift.workplace]) {
    const customRate = Number(state.settings.workplaceRates[shift.workplace]);
    if (customRate > 0) return customRate;
  }
  return Number(week?.rate ?? state.settings?.defaultRate ?? 0);
};

const getShiftEarnings = (shift, week) => {
  if (!shift) return 0;
  const hours = Number(shift.hours || 0);
  const rate = getShiftRate(shift, week);
  const ot = Number(shift.otRate) || 1.0;
  const allowance = Number(shift.allowance) || 0;
  return Math.round(hours * rate * ot + allowance);
};

const calculateWeekTotalSalary = (week) => {
  if (!week || !Array.isArray(week.shifts)) return 0;
  return week.shifts.reduce((acc, s) => {
    return acc + getShiftEarnings(s, week);
  }, 0);
};

const hoursToColonFormat = (hours) => {
  const totalMins = Math.round(Number(hours || 0) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}:${m < 10 ? '0' : ''}${m}`;
};

const getVietnameseDayOfWeek = (date = new Date()) => {
  const dayIndex = date.getDay();
  const map = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return map[dayIndex];
};

const getMondayDate = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
};

const getShiftDateObj = (week, dayStr) => {
  if (!week || !week.startDate) return null;
  const dayOffsets = { 'T2': 0, 'T3': 1, 'T4': 2, 'T5': 3, 'T6': 4, 'T7': 5, 'CN': 6 };
  const offset = dayOffsets[dayStr] ?? 0;
  const parts = week.startDate.split('-');
  if (parts.length !== 3) return null;
  const baseDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  baseDate.setDate(baseDate.getDate() + offset);
  const d = String(baseDate.getDate()).padStart(2, '0');
  const m = String(baseDate.getMonth() + 1).padStart(2, '0');
  const y = baseDate.getFullYear();
  return {
    dayOfMonth: d,
    month: m,
    year: y,
    short: `${d}/${m}`,
    full: `${d}/${m}/${y}`,
    iso: `${y}-${m}-${d}`,
    monthKey: `${y}-${m}`
  };
};

const getShiftDateShort = (week, dayStr) => {
  const obj = getShiftDateObj(week, dayStr);
  return obj ? obj.short : '';
};

const getShiftDateFull = (week, dayStr) => {
  const obj = getShiftDateObj(week, dayStr);
  return obj ? obj.full : '';
};

const getWeekDateRangeDisplay = (week) => {
  if (!week || !week.startDate) return '';
  const start = getShiftDateObj(week, 'T2');
  const end = getShiftDateObj(week, 'CN');
  if (!start || !end) return '';
  return `${start.short} – ${end.short}`;
};

const ensureWeekStartDate = (week, index) => {
  if (week.startDate) return;
  const now = new Date();
  const totalWeeks = state.weeks.length || 1;
  const weeksBack = (totalWeeks - 1 - index);
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() - weeksBack * 7);
  week.startDate = getMondayDate(targetDate);
};

const getDayClass = (day) => {
  const d = (day || '').toUpperCase().trim();
  switch (d) {
    case 'T2': return 'day-t2';
    case 'T3': return 'day-t3';
    case 'T4': return 'day-t4';
    case 'T5': return 'day-t5';
    case 'T6': return 'day-t6';
    case 'T7': return 'day-t7';
    case 'CN': return 'day-cn';
    default: return 'day-t2';
  }
};

const formatShiftType = (type) => {
  if (!type) return '';
  const trimmed = String(type).trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'sáng') return 'Sáng';
  if (lower === 'trưa') return 'Trưa';
  if (lower === 'tối') return 'Tối';
  if (lower === 'khác') return 'Khác';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const showToast = (message) => {
  const toast = document.getElementById('toast');
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2400);
};

const showToastWithAction = (message, actionText, actionCallback, duration = 8000) => {
  const toast = document.getElementById('toast');
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" class="toast-action-btn" id="btnToastAction" title="${escapeHtml(actionText || 'Hoàn tác')}" aria-label="${escapeHtml(actionText || 'Hoàn tác')}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" width="14" height="14">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
      </svg>
    </button>
  `;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);

  const btn = document.getElementById('btnToastAction');
  if (btn) {
    btn.onclick = () => {
      toast.style.display = 'none';
      if (typeof actionCallback === 'function') actionCallback();
    };
  }

  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
};

const loadState = async () => {
  try {
    const isPending = hasPendingSync();
    if (state.currentUser && supabaseClient) {
      if (isPending) {
        // Có dữ liệu chỉnh sửa offline chưa đồng bộ, ưu tiên cache local để không bị ghi đè dữ liệu cũ
        const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
        const cachedSettings = localStorage.getItem(getSettingsStorageKey());
        if (cachedWeeks) {
          state.weeks = JSON.parse(cachedWeeks);
          if (cachedSettings) state.settings = JSON.parse(cachedSettings);
        }
        if (navigator.onLine) {
          syncPendingToCloud(false);
        }
      } else {
        const { data, error } = await supabaseClient
          .from('user_salary_data')
          .select('*')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (!error && data && Array.isArray(data.weeks) && data.weeks.length > 0) {
          state.weeks = data.weeks;
          if (data.settings) state.settings = { ...state.settings, ...data.settings };
          if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
          localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
          localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
        } else {
          const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
          const cachedSettings = localStorage.getItem(getSettingsStorageKey());
          if (cachedWeeks) {
            state.weeks = JSON.parse(cachedWeeks);
            if (cachedSettings) state.settings = JSON.parse(cachedSettings);
            if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
          } else {
            state.weeks = [{ id: 'week-1', name: 'Tuần 1', rate: 0, shifts: [] }];
            if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
            saveWeeks();
          }
        }
      }
    } else {
      const guestWeeks = localStorage.getItem(GUEST_WEEKS_KEY);
      const guestSettings = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (guestWeeks) {
        try {
          const parsed = JSON.parse(guestWeeks);
          state.weeks = Array.isArray(parsed) && parsed.length > 0 ? parsed : JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
        } catch (_) {
          state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
        }
      } else {
        state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
      }
      if (guestSettings) {
        try {
          const parsedSet = JSON.parse(guestSettings);
          if (parsedSet) state.settings = { ...state.settings, ...parsedSet };
        } catch (_) {}
      }
      if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
      saveWeeks();
    }

    if (state.weeks.length > 0) {
      state.weeks.forEach((w, idx) => {
        ensureWeekStartDate(w, idx);
      });
      if (!Array.isArray(state.settings.workplaces)) {
        state.settings.workplaces = [];
      }
      state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    }
  } catch (err) {
    console.error('Error loading state:', err);
    state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
    state.currentWeekId = state.weeks[0].id;
  }
};

let cloudSyncTimer = null;

const saveWeeks = () => {
  const weeksKey = getWeeksStorageKey();
  localStorage.setItem(weeksKey, JSON.stringify(state.weeks));

  if (state.currentUser && supabaseClient) {
    markPendingSync();
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(async () => {
      if (navigator.onLine) {
        await syncPendingToCloud(false);
      } else {
        markPendingSync();
      }
    }, 500);
  } else {
    clearPendingSync();
  }
};

const syncWithSupabase = async () => {
  saveWeeks();
};
window.syncWithSupabase = syncWithSupabase;

const saveSettings = () => {
  const settingsKey = getSettingsStorageKey();
  localStorage.setItem(settingsKey, JSON.stringify(state.settings));
  saveWeeks();
};

const getCurrentWeek = () => {
  return state.weeks.find(w => w.id === state.currentWeekId) || state.weeks[0];
};

const initAuth = async () => {
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        const u = session.user;
        const username = u.user_metadata?.username || u.email.split('@')[0];
        state.currentUser = { id: u.id, email: u.email, username };
      } else {
        state.currentUser = null;
      }
    } catch (e) {
      console.warn('Supabase auth check failed:', e);
      state.currentUser = null;
    }
  } else {
    state.currentUser = null;
  }

  updateHeaderAuthUI();
};

const updateHeaderAuthUI = () => {
  const btn = document.getElementById('btnUserAuth');
  if (!btn) return;

  if (state.currentUser && state.currentUser.username) {
    btn.className = 'btn-morphic is-logged-in';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    btn.title = `Tài khoản: @${state.currentUser.username}`;
  } else {
    btn.className = 'btn-morphic';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    btn.title = 'Đăng nhập / Đăng ký tài khoản';
  }
};

const renderApp = () => {
  renderDateDisplay();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();
};

const renderDateDisplay = () => {
  const now = new Date();
  const lang = getCurrentLang();
  const dayIndex = now.getDay();
  let dayName = '';
  let dateStr = '';

  if (lang === 'en') {
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayName = daysEn[dayIndex];
    dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
  } else if (lang === 'ja') {
    const daysJa = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    dayName = daysJa[dayIndex];
    dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
  } else {
    const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    dayName = daysVi[dayIndex];
    dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  }

  const headerDateEl = document.getElementById('currentDateDisplay');
  if (headerDateEl) headerDateEl.textContent = `${dayName}, ${dateStr}`;
};

let isProgrammaticWheelScroll = false;
let wheelScrollDebounceTimer = null;

const updateWheelItemsVisual = () => {
  const container = document.getElementById('weekPillsList');
  if (!container) return null;
  const items = container.querySelectorAll('.week-wheel-item');
  if (!items.length) return null;

  const containerRect = container.getBoundingClientRect();
  const centerY = containerRect.top + containerRect.height / 2;
  const maxDistance = containerRect.height / 2;

  let closestItem = null;
  let minDistance = Infinity;

  items.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + itemRect.height / 2;
    const distance = Math.abs(centerY - itemCenter);
    const signedDistance = itemCenter - centerY;
    const ratio = Math.min(distance / maxDistance, 1);

    if (distance < minDistance) {
      minDistance = distance;
      closestItem = item;
    }

    const scale = 1 - ratio * 0.35;
    const opacity = 1 - ratio * 0.65;
    const rotateX = -(signedDistance / maxDistance) * 32;

    item.style.transform = `perspective(300px) rotateX(${rotateX}deg) scale(${scale})`;
    item.style.opacity = `${Math.max(opacity, 0.25)}`;

    if (distance < 19) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  return closestItem;
};

let wheelRafId = null;
const onWheelTrackScroll = () => {
  if (wheelRafId) cancelAnimationFrame(wheelRafId);
  wheelRafId = requestAnimationFrame(() => {
    const closestItem = updateWheelItemsVisual();
    if (isProgrammaticWheelScroll) return;

    clearTimeout(wheelScrollDebounceTimer);
    wheelScrollDebounceTimer = setTimeout(() => {
      if (closestItem) {
        const weekId = closestItem.getAttribute('data-week-id');
        if (weekId && weekId !== state.currentWeekId) {
          state.currentWeekId = weekId;
          renderWeekDetails();
          renderShiftsList();
          closestItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 140);
  });
};

const scrollWheelToActive = (behavior = 'smooth') => {
  const container = document.getElementById('weekPillsList');
  if (!container) return;
  const activeItem = container.querySelector(`.week-wheel-item[data-week-id="${state.currentWeekId}"]`);
  if (!activeItem) return;

  isProgrammaticWheelScroll = true;
  activeItem.scrollIntoView({ behavior, block: 'center' });
  setTimeout(() => {
    isProgrammaticWheelScroll = false;
    updateWheelIndicator();
  }, 300);
};

const renderWeekPills = () => {
  const container = document.getElementById('weekPillsList');
  container.innerHTML = '';

  state.weeks.forEach(week => {
    const item = document.createElement('div');
    item.className = `week-wheel-item ${week.id === state.currentWeekId ? 'active' : ''}`;
    item.setAttribute('data-week-id', week.id);

    const totalWage = calculateWeekTotalSalary(week);

    item.innerHTML = `
      <span class="wheel-item-name font-mono">${week.name}</span>
      <span class="wheel-item-sub font-mono">${fmtCurrency(totalWage)}</span>
    `;

    item.addEventListener('click', () => {
      if (state.currentWeekId !== week.id) {
        state.currentWeekId = week.id;
        renderWeekDetails();
        renderShiftsList();
      }
      scrollWheelToActive('smooth');
    });

    container.appendChild(item);
  });

  scrollWheelToActive('auto');
};

const renderWeekDetails = () => {
  const week = getCurrentWeek();
  if (!week) return;

  const dateRange = getWeekDateRangeDisplay(week);
  document.getElementById('currentWeekTitle').textContent = dateRange ? `${week.name} (${dateRange})` : week.name;
  document.getElementById('currentWeekRateBadge').textContent = `${new Intl.NumberFormat('vi-VN').format(week.rate)} đ/h`;

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = calculateWeekTotalSalary(week);
  const shiftCount = week.shifts.length;
  const avgHours = shiftCount > 0 ? (totalHours / shiftCount).toFixed(2) : '0.00';

  document.getElementById('kpiWeekSalary').textContent = fmtCurrency(totalSalary);
  document.getElementById('kpiWeekHours').textContent = fmtHours(totalHours);
  document.getElementById('kpiWeekHoursDetail').textContent = hoursToHourMinutes(totalHours);
  document.getElementById('kpiShiftCount').textContent = `${shiftCount} ${t('unit_shift', 'ca')}`;
  document.getElementById('kpiAvgHours').textContent = `${avgHours} ${t('unit_per_shift', 'h/ca')}`;
  document.getElementById('shiftsCountBadge').textContent = `${shiftCount} ${t('unit_shift', 'ca')}`;
};

const shiftsFilterState = {
  workplace: '',
  date: ''
};

const setupCustomSelect = (selectId) => {
  const select = document.getElementById(selectId);
  if (!select) return;

  const parent = select.parentElement;
  let wrapper = parent.querySelector(`.custom-select-wrapper[data-for="${selectId}"]`);

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper' + (select.classList.contains('font-mono') ? ' font-mono' : '');
    wrapper.setAttribute('data-for', selectId);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'custom-select-label';

    const chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron-icon';
    chevron.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    trigger.appendChild(label);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    select.classList.add('native-select-hidden');
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllCustomSelects();
      if (!isOpen) {
        const rect = wrapper.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 220 && spaceAbove > 180) {
          wrapper.classList.add('open-up');
        } else {
          wrapper.classList.remove('open-up');
        }

        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');

        const formItem = wrapper.closest('.form-item');
        if (formItem) formItem.classList.add('has-open-dropdown');
        const formGrid = wrapper.closest('.form-grid-2');
        if (formGrid) formGrid.classList.add('has-open-dropdown');
        const filterTray = wrapper.closest('.shifts-filter-tray');
        if (filterTray) filterTray.classList.add('has-open-dropdown');
        const filterInner = wrapper.closest('.filter-tray-inner');
        if (filterInner) filterInner.classList.add('has-open-dropdown');
        const filterWp = wrapper.closest('.filter-wp-wrap');
        if (filterWp) filterWp.classList.add('has-open-dropdown');
        const modalBody = wrapper.closest('.modal-body');
        if (modalBody) modalBody.classList.add('has-open-dropdown');
      }
    });
  }

  const menu = wrapper.querySelector('.custom-select-menu');
  const label = wrapper.querySelector('.custom-select-label');
  menu.innerHTML = '';

  const options = Array.from(select.options);
  const selectedOption = select.options[select.selectedIndex] || options[0];
  if (selectedOption && label) {
    label.textContent = selectedOption.textContent;
  }

  options.forEach((opt) => {
    const item = document.createElement('div');
    const isSelected = opt.value === select.value || (opt.selected && !select.value);
    item.className = 'custom-select-option' + (isSelected ? ' is-selected' : '');
    item.setAttribute('role', 'option');
    item.setAttribute('data-value', opt.value);

    const textSpan = document.createElement('span');
    textSpan.textContent = opt.textContent;

    const checkIcon = document.createElement('span');
    checkIcon.className = 'custom-select-check';
    checkIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

    item.appendChild(textSpan);
    item.appendChild(checkIcon);

    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      select.value = opt.value;
      if (label) label.textContent = opt.textContent;
      wrapper.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('is-selected'));
      item.classList.add('is-selected');
      closeAllCustomSelects();

      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    menu.appendChild(item);
  });
};

const syncCustomSelect = (selectId) => {
  const select = document.getElementById(selectId);
  if (!select) return;
  const parent = select.parentElement;
  const wrapper = parent.querySelector(`.custom-select-wrapper[data-for="${selectId}"]`);
  if (!wrapper) {
    setupCustomSelect(selectId);
    return;
  }
  const label = wrapper.querySelector('.custom-select-label');
  const selectedOption = select.options[select.selectedIndex];
  if (label && selectedOption) {
    label.textContent = selectedOption.textContent;
  }
  wrapper.querySelectorAll('.custom-select-option').forEach(el => {
    if (el.getAttribute('data-value') === select.value) {
      el.classList.add('is-selected');
    } else {
      el.classList.remove('is-selected');
    }
  });
};

const closeAllCustomSelects = () => {
  document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
    el.classList.remove('open');
    el.classList.remove('open-up');
    const trigger = el.querySelector('.custom-select-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.has-open-dropdown').forEach(el => {
    el.classList.remove('has-open-dropdown');
  });
  const wpDropdown = document.getElementById('customWorkplaceDropdown');
  if (wpDropdown) {
    wpDropdown.style.display = 'none';
    wpDropdown.classList.remove('open-up');
  }
};

const updateFilterActiveState = () => {
  const dot = document.getElementById('filterActiveDot');
  const btnToggle = document.getElementById('btnToggleShiftsFilter');
  const btnReset = document.getElementById('btnResetAllFilters');
  const tray = document.getElementById('shiftsFilterBar');

  const hasFilter = Boolean(shiftsFilterState.workplace || shiftsFilterState.date);

  if (dot) dot.style.display = hasFilter ? 'inline-block' : 'none';
  if (btnToggle) btnToggle.classList.toggle('is-active', hasFilter);
  if (btnReset) btnReset.style.display = hasFilter ? 'flex' : 'none';

  if (hasFilter && tray) {
    tray.style.display = 'block';
  }
};

const updateFilterWorkplaceOptions = () => {
  const select = document.getElementById('filterWorkplaceSelect');
  if (!select) return;
  const currentVal = select.value;

  const week = getCurrentWeek();
  const set = new Set(state.settings.workplaces || []);
  if (week && Array.isArray(week.shifts)) {
    week.shifts.forEach(s => {
      if (s.workplace) set.add(s.workplace);
    });
  }

  select.innerHTML = '<option value="">Nơi làm: Tất cả</option>';
  Array.from(set).forEach(wp => {
    const opt = document.createElement('option');
    opt.value = wp;
    opt.textContent = wp;
    if (wp === currentVal || wp === shiftsFilterState.workplace) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  setupCustomSelect('filterWorkplaceSelect');
};

const renderShiftsList = () => {
  const listContainer = document.getElementById('shiftsList');
  listContainer.innerHTML = '';

  const week = getCurrentWeek();

  updateFilterWorkplaceOptions();

  if (!week || !Array.isArray(week.shifts) || week.shifts.length === 0) {
    const shiftsCountBadge = document.getElementById('shiftsCountBadge');
    if (shiftsCountBadge) shiftsCountBadge.textContent = '0 ca';

    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="empty-state-title">Chưa có ca làm việc nào trong ${escapeHtml(week ? week.name : 'tuần này')}</div>
        <p class="empty-state-desc">Thêm ca làm việc mới hoặc xóa tuần này nếu bạn lỡ tạo nhầm.</p>
        <div style="display: flex; gap: 0.65rem; justify-content: center; margin-top: 0.85rem;">
          <button class="btn-morphic btn-morphic-primary" id="btnEmptyAddShift" title="Thêm ca làm việc mới" aria-label="Thêm ca làm việc mới">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button class="btn-morphic btn-morphic-danger" id="btnEmptyDeleteWeek" title="Xóa tuần này" aria-label="Xóa tuần này">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    const btnAdd = document.getElementById('btnEmptyAddShift');
    if (btnAdd) btnAdd.addEventListener('click', () => openAddShiftModal());

    const btnDel = document.getElementById('btnEmptyDeleteWeek');
    if (btnDel) btnDel.addEventListener('click', deleteCurrentWeek);

    return;
  }

  const allShifts = week.shifts;
  let filteredShifts = allShifts;

  if (shiftsFilterState.workplace) {
    filteredShifts = filteredShifts.filter(s => s.workplace === shiftsFilterState.workplace);
  }

  if (shiftsFilterState.date) {
    filteredShifts = filteredShifts.filter(s => {
      const dObj = getShiftDateObj(week, s.day);
      return dObj && dObj.iso === shiftsFilterState.date;
    });
  }

  const shiftsCountBadge = document.getElementById('shiftsCountBadge');
  if (shiftsFilterState.workplace || shiftsFilterState.date) {
    if (shiftsCountBadge) shiftsCountBadge.textContent = `${filteredShifts.length} / ${allShifts.length} ca`;
  } else {
    if (shiftsCountBadge) shiftsCountBadge.textContent = `${allShifts.length} ca`;
  }

  if (allShifts.length > 0 && filteredShifts.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">Không tìm thấy ca làm việc phù hợp</div>
        <p class="empty-state-desc">Không có ca nào khớp với bộ lọc bạn đã chọn.</p>
        <div style="margin-top: 0.85rem; display: flex; justify-content: center;">
          <button class="btn-morphic btn-morphic-danger" id="btnResetShiftsFilter" title="Xóa toàn bộ bộ lọc" aria-label="Xóa bộ lọc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
    const btnReset = document.getElementById('btnResetShiftsFilter');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        shiftsFilterState.workplace = '';
        shiftsFilterState.date = '';
        const wpSel = document.getElementById('filterWorkplaceSelect');
        const dtInp = document.getElementById('filterDateInput');
        if (wpSel) wpSel.value = '';
        syncCustomSelect('filterWorkplaceSelect');
        if (dtInp) dtInp.value = '';
        renderShiftsList();
      });
    }
    updateFilterActiveState();
    return;
  }

  filteredShifts.forEach((shift) => {
    const card = document.createElement('div');
    card.className = 'shift-card';
    
    const shiftEarnings = getShiftEarnings(shift, week);
    const displayType = getLocalizedShiftType(shift.type);
    const normType = formatShiftType(shift.type).toLowerCase();
    const typeClass = normType === 'trưa' ? 'type-trua' : (normType === 'tối' ? 'type-toi' : (normType === 'sáng' ? 'type-sang' : ''));
    const dayLabel = getLocalizedDayName(shift.day);
    const shiftDateStr = getShiftDateShort(week, shift.day);
    const breakTag = shift.breakMinutes ? ` • nghỉ ${shift.breakMinutes}m` : '';

    const otRateVal = Number(shift.otRate) || 1.0;
    const otBadge = otRateVal > 1.0 ? `<span class="shift-ot-badge font-mono">x${otRateVal}</span>` : '';
    const allowanceVal = Number(shift.allowance) || 0;
    const allowanceBadge = allowanceVal > 0 ? `<span class="shift-allowance-badge font-mono">+${fmtCurrency(allowanceVal)}</span>` : '';

    card.innerHTML = `
      <div class="shift-left">
        <div class="day-badge font-mono ${getDayClass(shift.day)}">
          <span class="day-badge-name">${dayLabel}</span>
          ${shiftDateStr ? `<span class="day-badge-date font-mono">${shiftDateStr}</span>` : ''}
        </div>
        <div class="shift-info">
          <div class="shift-title-row">
            <span class="shift-time-range font-mono">${shift.start} – ${shift.end}</span>
            <span class="shift-type-pill ${typeClass}">${escapeHtml(displayType)}</span>
            ${otBadge}
            ${allowanceBadge}
            ${shift.workplace ? (() => {
              const wpCol = getWorkplaceColor(shift.workplace);
              return `<span class="workplace-pill font-mono" style="background:${wpCol.bg};color:${wpCol.color};border-color:${wpCol.border};">${escapeHtml(shift.workplace)}</span>`;
            })() : ''}
            <span class="shift-duration-badge font-mono">${shift.hours}h${breakTag}</span>
          </div>
          ${shift.note ? `<div class="shift-subtext font-mono"><span class="shift-note font-sans" title="${escapeHtml(shift.note)}">${escapeHtml(shift.note)}</span></div>` : ''}
        </div>
      </div>

      <div class="shift-right">
        <div class="shift-earnings font-mono">${fmtCurrency(shiftEarnings)}</div>
        <div class="shift-card-actions">
          <button class="btn-morphic btn-morphic-sm" title="Chỉnh sửa ca" data-edit-shift="${shift.id}" aria-label="Sửa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-morphic btn-morphic-sm btn-morphic-danger" title="Xóa ca" data-delete-shift="${shift.id}" aria-label="Xóa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    card.querySelector(`[data-edit-shift="${shift.id}"]`).addEventListener('click', () => {
      openEditShiftModal(shift);
    });

    card.querySelector(`[data-delete-shift="${shift.id}"]`).addEventListener('click', () => {
      if (confirm(`Bạn có chắc muốn xóa ca ${shift.day} (${shift.type} ${shift.start}-${shift.end}) không?`)) {
        deleteShift(shift.id);
      }
    });

    listContainer.appendChild(card);
  });
  updateFilterActiveState();
};

const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const detectShiftType = (startTimeStr) => {
  if (!startTimeStr) return 'Tối';
  const parts = startTimeStr.split(':');
  const h = parseInt(parts[0], 10);
  if (isNaN(h)) return 'Tối';
  if (h >= 11 && h < 16) return 'Trưa';
  if (h >= 16 || h < 5) return 'Tối';
  return 'Sáng';
};

const updateShiftDayOptions = (week) => {
  const select = document.getElementById('shiftDay');
  if (!select) return;
  const currentVal = select.value || 'T2';
  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  select.innerHTML = '';
  days.forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    const dateStr = getShiftDateShort(week, day);
    opt.textContent = dateStr ? `${day} (${dateStr})` : day;
    select.appendChild(opt);
  });
  if (days.includes(currentVal)) {
    select.value = currentVal;
  }
  setupCustomSelect('shiftDay');
};

const getUniqueWorkplacesList = () => {
  const set = new Set();
  if (Array.isArray(state.settings.workplaces)) {
    state.settings.workplaces.forEach(wp => { if (wp && wp.trim()) set.add(wp.trim()); });
  }
  if (Array.isArray(state.weeks)) {
    state.weeks.forEach(w => {
      if (Array.isArray(w.shifts)) {
        w.shifts.forEach(s => { if (s.workplace && s.workplace.trim()) set.add(s.workplace.trim()); });
      }
    });
  }
  return Array.from(set);
};

const renderCustomWorkplaceDropdown = (filterText = '') => {
  const dropdown = document.getElementById('customWorkplaceDropdown');
  const input = document.getElementById('shiftWorkplace');
  if (!dropdown || !input) return;

  const allWps = getUniqueWorkplacesList();
  const filtered = filterText
    ? allWps.filter(wp => wp.toLowerCase().includes(filterText.toLowerCase()))
    : allWps;

  dropdown.innerHTML = '';
  if (filtered.length === 0) {
    dropdown.style.display = 'none';
    dropdown.classList.remove('open-up');
    const wpGroup = dropdown.closest('.workplace-field-group');
    if (wpGroup) wpGroup.classList.remove('has-open-dropdown');
    const wpWrap = dropdown.closest('.workplace-input-wrap');
    if (wpWrap) wpWrap.classList.remove('has-open-dropdown');
    return;
  }

  const week = getCurrentWeek();
  filtered.forEach(wp => {
    const item = document.createElement('div');
    item.className = 'workplace-dropdown-item';

    const left = document.createElement('div');
    left.className = 'workplace-item-left';
    left.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="workplace-item-icon">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <span>${escapeHtml(wp)}</span>
    `;

    const rate = getShiftRate({ workplace: wp }, week);
    const right = document.createElement('span');
    right.className = 'workplace-item-rate font-mono';
    right.textContent = fmtCurrency(rate) + '/h';

    item.appendChild(left);
    item.appendChild(right);

    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      input.value = wp;
      closeAllCustomSelects();
      updateModalComputedPreview();
      const chips = document.getElementById('shiftWorkplaceChips');
      if (chips) {
        chips.querySelectorAll('.workplace-chip').forEach(c => {
          c.classList.toggle('active', c.textContent === wp);
        });
      }
    });

    dropdown.appendChild(item);
  });

  const rect = input.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  if (spaceBelow < 220 && spaceAbove > 180) {
    dropdown.classList.add('open-up');
  } else {
    dropdown.classList.remove('open-up');
  }

  dropdown.style.display = 'block';

  const wpGroup = dropdown.closest('.workplace-field-group');
  if (wpGroup) wpGroup.classList.add('has-open-dropdown');
  const wpWrap = dropdown.closest('.workplace-input-wrap');
  if (wpWrap) wpWrap.classList.add('has-open-dropdown');
  const modalBody = dropdown.closest('.modal-body');
  if (modalBody) modalBody.classList.add('has-open-dropdown');
};

const updateWorkplaceInputOptions = (currentVal = '') => {
  const chipsContainer = document.getElementById('shiftWorkplaceChips');
  const input = document.getElementById('shiftWorkplace');
  if (input) input.value = currentVal;

  const list = getUniqueWorkplacesList();

  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    list.forEach(wp => {
      const chip = document.createElement('span');
      chip.className = `workplace-chip font-mono ${currentVal === wp ? 'active' : ''}`;
      chip.textContent = wp;
      chip.addEventListener('click', () => {
        if (input.value === wp) {
          input.value = '';
          chip.classList.remove('active');
        } else {
          input.value = wp;
          chipsContainer.querySelectorAll('.workplace-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
        updateModalComputedPreview();
      });
      chipsContainer.appendChild(chip);
    });
  }
};

const calculateSmartShiftDefaults = (prefill = null, now = new Date()) => {
  // 1. Giờ kết thúc: mặc định là thời điểm hiện tại khi người dùng bấm vào hộp thoại (làm tròn 15 phút gần nhất)
  let endMin = Math.round(now.getMinutes() / 15) * 15;
  let endHour = now.getHours();
  if (endMin === 60) {
    endHour = (endHour + 1) % 24;
    endMin = 0;
  }
  const endTotalMins = endHour * 60 + endMin;
  const defaultEnd = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

  // 2. Thu thập toàn bộ lịch sử ca làm từ trước đến nay trong state.weeks
  const allPastShifts = [];
  if (Array.isArray(state.weeks)) {
    state.weeks.forEach(w => {
      if (Array.isArray(w.shifts)) {
        w.shifts.forEach(s => {
          if (s && s.start && s.end) {
            allPastShifts.push(s);
          }
        });
      }
    });
  }

  // 3. Phân tích thông minh: tìm thời gian làm việc (duration) và loại ca phù hợp
  let durationMinutes = 4 * 60; // Mặc định chuẩn 4 tiếng nếu chưa có bất kỳ dữ liệu gì
  let detectedType = '';
  let detectedBreak = 0;

  if (allPastShifts.length > 0) {
    // Ưu tiên các ca làm kết thúc quanh khung giờ này (trong vòng 90 phút)
    const similarEndShifts = allPastShifts.filter(s => {
      const sEndMins = parseTimeToMinutes(s.end);
      let diff = Math.abs(sEndMins - endTotalMins);
      if (diff > 12 * 60) diff = 24 * 60 - diff;
      return diff <= 90;
    });

    const candidateShifts = similarEndShifts.length > 0 ? similarEndShifts : allPastShifts;

    // Tính thời lượng làm việc phổ biến nhất (median duration)
    const durations = candidateShifts.map(s => {
      const sStart = parseTimeToMinutes(s.start);
      let sEnd = parseTimeToMinutes(s.end);
      if (sEnd <= sStart) sEnd += 24 * 60;
      return sEnd - sStart;
    }).filter(d => d > 0 && d <= 16 * 60);

    if (durations.length > 0) {
      durations.sort((a, b) => a - b);
      durationMinutes = durations[Math.floor(durations.length / 2)];
    }

    // Xác định loại ca phổ biến nhất từ các ca tương đồng
    if (similarEndShifts.length > 0) {
      const typeCounts = {};
      similarEndShifts.forEach(s => {
        if (s.type) typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
      });
      const topType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
      if (topType) detectedType = topType;

      // Tìm thời gian nghỉ phổ biến nhất
      const breakCounts = {};
      similarEndShifts.forEach(s => {
        const b = Number(s.breakMinutes) || 0;
        breakCounts[b] = (breakCounts[b] || 0) + 1;
      });
      const topBreak = Object.keys(breakCounts).sort((a, b) => breakCounts[b] - breakCounts[a])[0];
      if (topBreak !== undefined) detectedBreak = Number(topBreak);
    }
  }

  // 4. Tính giờ bắt đầu tự động: lùi lại bằng đúng duration từ giờ kết thúc
  let startTotalMins = (endTotalMins - durationMinutes + 24 * 60) % (24 * 60);
  let startHour = Math.floor(startTotalMins / 60);
  let startMin = startTotalMins % 60;
  let defaultStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

  // 5. Nếu chưa có loại ca từ lịch sử, tự động suy luận loại ca dựa trên khung giờ
  if (!detectedType) {
    if (endHour >= 18 || endHour < 5 || startHour >= 16) {
      detectedType = 'Tối';
    } else if (endHour >= 13 && endHour < 18) {
      detectedType = 'Trưa';
    } else {
      detectedType = 'Sáng';
    }
  }

  // 6. Ngày trong tuần: mặc định hôm nay
  const defaultDay = prefill?.day || getVietnameseDayOfWeek(now);

  // 7. Ghi đè nếu có prefill từ preset tiles
  if (prefill) {
    if (prefill.start) defaultStart = prefill.start;
    if (prefill.end) defaultEnd = prefill.end;
    if (prefill.type) detectedType = prefill.type;
  }

  return {
    start: defaultStart,
    end: defaultEnd,
    type: detectedType,
    day: defaultDay,
    breakMinutes: detectedBreak,
    note: prefill?.note || ''
  };
};

const openAddShiftModal = (prefill = null) => {
  const modal = document.getElementById('shiftModal');
  const form = document.getElementById('shiftForm');
  form.reset();

  document.getElementById('shiftModalTitle').textContent = t('modal_add_shift', 'Thêm ca làm việc');
  document.getElementById('editShiftId').value = '';

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'none';

  const wpDropdown = document.getElementById('customWorkplaceDropdown');
  if (wpDropdown) wpDropdown.style.display = 'none';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  const defaultWp = (state.settings.workplaces && state.settings.workplaces.length > 0) ? state.settings.workplaces[0] : '';
  updateWorkplaceInputOptions(defaultWp);

  // Tính toán thông minh dựa trên lịch sử dữ liệu và thời điểm tan ca hiện tại
  const smartDefaults = calculateSmartShiftDefaults(prefill, new Date());

  document.getElementById('shiftDay').value = smartDefaults.day;
  document.getElementById('shiftType').value = smartDefaults.type;
  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  syncCustomSelect('shiftDay');
  syncCustomSelect('shiftType');

  document.getElementById('shiftStart').value = smartDefaults.start;
  document.getElementById('shiftEnd').value = smartDefaults.end;
  const breakInput = document.getElementById('shiftBreak');
  if (breakInput) breakInput.value = String(smartDefaults.breakMinutes || 0);
  const otInput = document.getElementById('shiftOtRate');
  if (otInput) otInput.value = '1.0';
  syncCustomSelect('shiftOtRate');
  const allowanceInput = document.getElementById('shiftAllowance');
  if (allowanceInput) allowanceInput.value = '0';
  document.getElementById('shiftNote').value = smartDefaults.note;

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const openEditShiftModal = (shift) => {
  const modal = document.getElementById('shiftModal');
  document.getElementById('shiftModalTitle').textContent = t('modal_edit_shift', 'Chỉnh sửa ca làm việc');
  document.getElementById('editShiftId').value = shift.id;

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'inline-flex';

  const wpDropdown = document.getElementById('customWorkplaceDropdown');
  if (wpDropdown) wpDropdown.style.display = 'none';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  updateWorkplaceInputOptions(shift.workplace || '');

  document.getElementById('shiftDay').value = shift.day;
  document.getElementById('shiftType').value = shift.type;
  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  syncCustomSelect('shiftDay');
  syncCustomSelect('shiftType');

  document.getElementById('shiftStart').value = shift.start;
  document.getElementById('shiftEnd').value = shift.end;
  const breakInput = document.getElementById('shiftBreak');
  if (breakInput) breakInput.value = shift.breakMinutes || 0;
  const otInput = document.getElementById('shiftOtRate');
  if (otInput) otInput.value = String(shift.otRate || '1.0');
  syncCustomSelect('shiftOtRate');
  const allowanceInput = document.getElementById('shiftAllowance');
  if (allowanceInput) allowanceInput.value = String(shift.allowance || '0');
  document.getElementById('shiftNote').value = shift.note || '';

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const updateModalComputedPreview = () => {
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const breakMins = Number(document.getElementById('shiftBreak')?.value || 0);
  const otRate = Number(document.getElementById('shiftOtRate')?.value || 1.0);
  const allowance = Number(document.getElementById('shiftAllowance')?.value || 0);
  const workplace = (document.getElementById('shiftWorkplace')?.value || '').trim();
  if (!start || !end) return;

  const hours = calculateHoursDiff(start, end, breakMins);
  const week = getCurrentWeek();
  const rate = getShiftRate({ workplace }, week);
  const wage = Math.round(hours * rate * otRate + allowance);

  const breakLabel = breakMins > 0 ? ` (nghỉ ${breakMins}m)` : '';
  const otLabel = otRate > 1 ? ` • x${otRate}` : '';
  document.getElementById('previewDuration').textContent = `${hours.toFixed(2)}h${breakLabel}${otLabel}`;
  document.getElementById('previewSalary').textContent = fmtCurrency(wage);
};

const saveShiftFromModal = (e) => {
  e.preventDefault();
  const editId = document.getElementById('editShiftId').value;
  const day = document.getElementById('shiftDay').value;
  const type = formatShiftType(document.getElementById('shiftType').value);
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const breakMinutes = Math.max(0, Number(document.getElementById('shiftBreak')?.value || 0));
  const otRate = Number(document.getElementById('shiftOtRate')?.value || 1.0);
  const allowance = Math.max(0, Number(document.getElementById('shiftAllowance')?.value || 0));
  const workplace = (document.getElementById('shiftWorkplace')?.value || '').trim();
  const note = document.getElementById('shiftNote').value.trim();
  const hours = calculateHoursDiff(start, end, breakMinutes);

  const week = getCurrentWeek();
  if (!week) return;

  // Cảnh báo trùng lặp giờ làm (Shift Overlapping Alert)
  const curStartMins = parseTimeToMinutes(start);
  let curEndMins = parseTimeToMinutes(end);
  if (curEndMins <= curStartMins) curEndMins += 24 * 60;

  const overlappingShift = (week.shifts || []).find(s => {
    if (s.id === editId) return false;
    if (s.day !== day) return false;
    const sStart = parseTimeToMinutes(s.start);
    let sEnd = parseTimeToMinutes(s.end);
    if (sEnd <= sStart) sEnd += 24 * 60;
    return Math.max(curStartMins, sStart) < Math.min(curEndMins, sEnd);
  });

  if (overlappingShift) {
    const confirmSave = confirm(`CẢNH BÁO TRÙNG GIỜ:\nCa làm này (${start} – ${end}) bị đè thời gian lên ca "${overlappingShift.type}" (${overlappingShift.start} – ${overlappingShift.end}) của cùng ngày ${day}.\n\nBạn có chắc chắn vẫn muốn lưu không?`);
    if (!confirmSave) return;
  }

  if (workplace) {
    if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
    if (!state.settings.workplaces.includes(workplace)) {
      state.settings.workplaces.push(workplace);
      saveSettings();
    }
  }

  if (editId) {
    const index = week.shifts.findIndex(s => s.id === editId);
    if (index !== -1) {
      week.shifts[index] = { ...week.shifts[index], day, type, start, end, breakMinutes, otRate, allowance, hours, workplace, note };
      showToast('Đã cập nhật ca làm');
    }
  } else {
    const newShift = {
      id: `s-${Date.now()}`,
      day,
      type,
      start,
      end,
      breakMinutes,
      otRate,
      allowance,
      hours,
      workplace,
      note
    };
    week.shifts.push(newShift);
    showToast('Đã thêm ca làm việc mới');
  }

  saveWeeks();
  closeModal('shiftModal');
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();
};

let lastDeletedShiftRecord = null;

const deleteShift = (shiftId) => {
  const week = getCurrentWeek();
  if (!week) return;

  const shiftIndex = week.shifts.findIndex(s => s.id === shiftId);
  if (shiftIndex === -1) return;
  const removedShift = week.shifts[shiftIndex];

  week.shifts.splice(shiftIndex, 1);
  saveWeeks();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();

  lastDeletedShiftRecord = {
    weekId: week.id,
    shift: removedShift,
    index: shiftIndex
  };

  showToastWithAction(`Đã xóa ca ${removedShift.day} (${removedShift.type})`, 'Hoàn tác', () => {
    undoLastDeleteShift();
  }, 8000);
};

const undoLastDeleteShift = () => {
  if (!lastDeletedShiftRecord) return;
  const { weekId, shift, index } = lastDeletedShiftRecord;
  const targetWeek = state.weeks.find(w => w.id === weekId);
  if (!targetWeek) {
    showToast('Không tìm thấy tuần để khôi phục');
    return;
  }
  if (typeof index === 'number' && index >= 0 && index <= targetWeek.shifts.length) {
    targetWeek.shifts.splice(index, 0, shift);
  } else {
    targetWeek.shifts.push(shift);
  }
  lastDeletedShiftRecord = null;
  saveWeeks();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();
  showToast(`Đã khôi phục ca ${shift.day} (${shift.type})!`);
};

const createNewWeek = () => {

  const nextNum = state.weeks.length + 1;
  const newWeekId = `week-${Date.now()}`;
  const newWeekName = `Tuần ${nextNum}`;
  const newWeekRate = Number(state.settings.defaultRate) || 0;

  let newStartDate = getMondayDate(new Date());
  if (state.weeks.length > 0) {
    const lastWeek = state.weeks[state.weeks.length - 1];
    if (lastWeek && lastWeek.startDate) {
      const parts = lastWeek.startDate.split('-');
      if (parts.length === 3) {
        const nextMon = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        nextMon.setDate(nextMon.getDate() + 7);
        newStartDate = getMondayDate(nextMon);
      }
    }
  }

  const newWeek = {
    id: newWeekId,
    name: newWeekName,
    startDate: newStartDate,
    rate: newWeekRate,
    shifts: []
  };

  state.weeks.push(newWeek);
  state.currentWeekId = newWeekId;
  saveWeeks();
  renderApp();
  showToast(`Đã tạo ${newWeekName}`);
};

const openEditWeekModal = () => {

  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('editWeekNameInput').value = week.name;
  document.getElementById('editWeekStartDateInput').value = week.startDate || getMondayDate(new Date());
  document.getElementById('editWeekRateInput').value = week.rate;
  document.getElementById('editWeekModal').style.display = 'flex';
};

const saveWeekMeta = (e) => {
  e.preventDefault();
  const week = getCurrentWeek();
  if (!week) return;

  const newName = document.getElementById('editWeekNameInput').value.trim();
  const newStartDate = document.getElementById('editWeekStartDateInput').value;
  const newRate = Number(document.getElementById('editWeekRateInput').value);

  if (newName) week.name = newName;
  if (newStartDate) week.startDate = newStartDate;
  if (newRate !== undefined && !isNaN(newRate) && newRate >= 0) week.rate = newRate;

  saveWeeks();
  closeModal('editWeekModal');
  renderApp();
  showToast('Đã cập nhật thông tin tuần');
};

let lastDeletedWeekRecord = null;

const deleteCurrentWeek = () => {

  const week = getCurrentWeek();
  if (!week) return;

  if (state.weeks.length <= 1) {
    alert('Không thể xóa tuần duy nhất còn lại.');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa "${week.name}" bao gồm ${week.shifts.length} ca làm việc không?`)) {
    const weekIndex = state.weeks.findIndex(w => w.id === week.id);
    const removedWeek = { ...week, shifts: [...week.shifts] };

    state.weeks = state.weeks.filter(w => w.id !== week.id);
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    closeModal('editWeekModal');
    renderApp();

    lastDeletedWeekRecord = {
      week: removedWeek,
      index: weekIndex
    };

    showToastWithAction(`Đã xóa ${removedWeek.name}`, 'Hoàn tác', () => {
      undoLastDeleteWeek();
    }, 8000);
  }
};

const undoLastDeleteWeek = () => {
  if (!lastDeletedWeekRecord) return;
  const { week, index } = lastDeletedWeekRecord;
  if (typeof index === 'number' && index >= 0 && index <= state.weeks.length) {
    state.weeks.splice(index, 0, week);
  } else {
    state.weeks.push(week);
  }
  state.currentWeekId = week.id;
  lastDeletedWeekRecord = null;
  saveWeeks();
  renderApp();
  showToast(`Đã khôi phục ${week.name}!`);
};

const navigateWeek = (direction) => {

  const currentIndex = state.weeks.findIndex(w => w.id === state.currentWeekId);
  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < state.weeks.length) {
    state.currentWeekId = state.weeks[nextIndex].id;
    renderWeekPills();
    renderWeekDetails();
    renderShiftsList();
  }
};

const renderMonthlyReport = () => {
  const container = document.getElementById('monthlyReportsContainer');
  if (!container) return;
  container.innerHTML = '';

  const monthMap = {};

  state.weeks.forEach(week => {
    (week.shifts || []).forEach(shift => {
      const dObj = getShiftDateObj(week, shift.day);
      const mKey = dObj ? dObj.monthKey : 'unknown';
      const mLabel = dObj ? `Tháng ${dObj.month}/${dObj.year}` : 'Không rõ thời gian';

      if (!monthMap[mKey]) {
        monthMap[mKey] = {
          key: mKey,
          label: mLabel,
          totalHours: 0,
          totalEarnings: 0,
          shiftCount: 0,
          workplaces: {}
        };
      }

      const shiftHours = Number(shift.hours || 0);
      const shiftEarnings = getShiftEarnings(shift, week);
      const wp = shift.workplace || 'Chung';

      monthMap[mKey].totalHours += shiftHours;
      monthMap[mKey].totalEarnings += shiftEarnings;
      monthMap[mKey].shiftCount += 1;

      if (!monthMap[mKey].workplaces[wp]) {
        monthMap[mKey].workplaces[wp] = {
          name: wp,
          hours: 0,
          earnings: 0,
          count: 0
        };
      }
      monthMap[mKey].workplaces[wp].hours += shiftHours;
      monthMap[mKey].workplaces[wp].earnings += shiftEarnings;
      monthMap[mKey].workplaces[wp].count += 1;
    });
  });

  const monthKeys = Object.keys(monthMap).sort().reverse();

  if (monthKeys.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2.5rem 1rem;">
        <div class="empty-state-title">Chưa có dữ liệu theo tháng</div>
        <p class="empty-state-desc">Hãy thêm ca làm việc vào các tuần để hệ thống tự động tổng hợp báo cáo tháng cho bạn.</p>
      </div>
    `;
    return;
  }

  monthKeys.forEach(mKey => {
    const data = monthMap[mKey];
    const card = document.createElement('div');
    card.className = 'monthly-report-card';

    const wpList = Object.values(data.workplaces).sort((a, b) => b.earnings - a.earnings);

    let wpBreakdownHtml = '';
    wpList.forEach(wp => {
      const col = getWorkplaceColor(wp.name);
      const percent = data.totalEarnings > 0 ? Math.round((wp.earnings / data.totalEarnings) * 100) : 0;
      wpBreakdownHtml += `
        <div class="wb-item" style="margin-top: 0.55rem;">
          <div class="wb-header font-mono">
            <div class="wb-name-group">
              <span class="wb-color-dot" style="background:${col.fill};"></span>
              <span>${escapeHtml(wp.name)}</span>
              <span class="field-hint" style="font-size:0.75rem;">(${percent}%)</span>
            </div>
            <span class="wb-amount font-mono">${fmtCurrency(wp.earnings)}</span>
          </div>
          <div class="wb-bar-track">
            <div class="wb-bar-fill" style="width:${percent}%;background:${col.fill};"></div>
          </div>
          <span class="wb-sub font-mono">${wp.count} ca • ${wp.hours.toFixed(2)}h</span>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="monthly-card-header">
        <div class="monthly-header-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <rect x="3" y="4" width="18" height="18" rx="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span class="font-mono" style="font-size:1.05rem; font-weight:700;">${data.label}</span>
        </div>
        <span class="badge-count font-mono">${data.shiftCount} ca</span>
      </div>

      <div class="monthly-kpi-row">
        <div class="monthly-kpi-cell">
          <span class="cell-label font-mono">Thu nhập tháng</span>
          <span class="cell-number font-mono text-bold-dark" style="color:var(--primary); font-size:1.15rem;">${fmtCurrency(data.totalEarnings)}</span>
        </div>
        <div class="monthly-kpi-cell">
          <span class="cell-label font-mono">Tổng thời gian</span>
          <span class="cell-number font-mono">${fmtHours(data.totalHours)}</span>
        </div>
        <div class="monthly-kpi-cell">
          <span class="cell-label font-mono">Nơi làm việc</span>
          <span class="cell-number font-mono">${wpList.length} nơi</span>
        </div>
      </div>

      <div class="monthly-workplaces-section">
        <span class="field-hint font-mono" style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em;">Phân bổ thu nhập trong tháng</span>
        ${wpBreakdownHtml}
      </div>
    `;

    container.appendChild(card);
  });
};

const switchSummaryTab = (tab) => {
  const btnAnalytics = document.getElementById('tabBtnSummaryAnalytics');
  const btnTable = document.getElementById('tabBtnSummaryTable');
  const btnMonthly = document.getElementById('tabBtnSummaryMonthly');
  const paneAnalytics = document.getElementById('summaryTabPaneAnalytics');
  const paneTable = document.getElementById('summaryTabPaneTable');
  const paneMonthly = document.getElementById('summaryTabPaneMonthly');

  [btnAnalytics, btnTable, btnMonthly].forEach(b => { if (b) b.classList.remove('active'); });
  [paneAnalytics, paneTable, paneMonthly].forEach(p => { if (p) p.style.display = 'none'; });

  if (tab === 'analytics') {
    if (btnAnalytics) btnAnalytics.classList.add('active');
    if (paneAnalytics) paneAnalytics.style.display = 'flex';
    renderAnalyticsDashboard();
  } else if (tab === 'monthly') {
    if (btnMonthly) btnMonthly.classList.add('active');
    if (paneMonthly) paneMonthly.style.display = 'flex';
    renderMonthlyReport();
  } else {
    if (btnTable) btnTable.classList.add('active');
    if (paneTable) paneTable.style.display = 'flex';
  }
};

const openAllWeeksModal = (initialTab = 'analytics') => {
  let totalHours = 0;
  let totalEarnings = 0;
  let totalShifts = 0;

  const tbody = document.getElementById('allWeeksTableBody');
  tbody.innerHTML = '';

  state.weeks.forEach(week => {
    const weekHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
    const weekEarnings = calculateWeekTotalSalary(week);
    const weekShifts = week.shifts.length;

    totalHours += weekHours;
    totalEarnings += weekEarnings;
    totalShifts += weekShifts;

    const dateRange = getWeekDateRangeDisplay(week);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(week.name)} ${dateRange ? `<span class="field-hint" style="font-size:0.75rem;">(${dateRange})</span>` : ''}</td>
      <td>${fmtCurrency(week.rate)}/h</td>
      <td>${weekShifts} ca</td>
      <td>${weekHours.toFixed(2)} h</td>
      <td class="text-bold-dark">${fmtCurrency(weekEarnings)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-morphic btn-morphic-sm" data-jump-week="${week.id}" title="Xem tuần này" aria-label="Xem tuần này">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button class="btn-morphic btn-morphic-sm btn-morphic-danger" data-delete-week="${week.id}" title="Xóa ${escapeHtml(week.name)}" aria-label="Xóa ${escapeHtml(week.name)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    tr.querySelector(`[data-jump-week="${week.id}"]`).addEventListener('click', () => {
      state.currentWeekId = week.id;
      closeModal('allWeeksModal');
      renderApp();
    });

    tr.querySelector(`[data-delete-week="${week.id}"]`).addEventListener('click', () => {
      if (state.weeks.length <= 1) {
        alert('Không thể xóa tuần duy nhất còn lại.');
        return;
      }
      if (confirm(`Bạn có chắc chắn muốn xóa "${week.name}" bao gồm ${week.shifts.length} ca làm việc không?`)) {
        state.weeks = state.weeks.filter(w => w.id !== week.id);
        if (state.currentWeekId === week.id) {
          state.currentWeekId = state.weeks[state.weeks.length - 1].id;
        }
        saveWeeks();
        renderApp();
        openAllWeeksModal('table');
        showToast(`Đã xóa ${week.name}`);
      }
    });

    tbody.appendChild(tr);
  });

  const avgWeekEarnings = state.weeks.length > 0 ? totalEarnings / state.weeks.length : 0;

  document.getElementById('allTimeTotalEarnings').textContent = fmtCurrency(totalEarnings);
  document.getElementById('allTimeTotalHours').textContent = fmtHours(totalHours);
  document.getElementById('allTimeTotalShifts').textContent = `${totalShifts} ca`;
  document.getElementById('allTimeAvgWeekEarnings').textContent = fmtCurrency(avgWeekEarnings);

  document.getElementById('allWeeksModal').style.display = 'flex';
  switchSummaryTab(initialTab);
};

let analyticsState = {
  timeFilter: 'current',
  workplaceFilter: 'all'
};

const getAnalyticsData = () => {
  let weeks = [];
  if (analyticsState.timeFilter === 'current') {
    const cur = getCurrentWeek();
    if (cur) weeks = [cur];
  } else if (analyticsState.timeFilter === 'recent') {
    weeks = state.weeks.slice(-4);
  } else {
    weeks = [...state.weeks];
  }

  const allWorkplacesSet = new Set();
  weeks.forEach(w => {
    (w.shifts || []).forEach(s => {
      allWorkplacesSet.add(s.workplace || 'Chung');
    });
  });
  const availableWorkplaces = Array.from(allWorkplacesSet);

  let totalSalary = 0;
  let totalHours = 0;
  let totalShifts = 0;
  const workplaceMap = {};

  weeks.forEach(w => {
    (w.shifts || []).forEach(s => {
      const wp = s.workplace || 'Chung';
      if (analyticsState.workplaceFilter !== 'all' && wp !== analyticsState.workplaceFilter) {
        return;
      }
      const wage = getShiftEarnings(s, w);
      const h = Number(s.hours || 0);
      totalSalary += wage;
      totalHours += h;
      totalShifts += 1;

      if (!workplaceMap[wp]) {
        workplaceMap[wp] = { name: wp, salary: 0, hours: 0, count: 0 };
      }
      workplaceMap[wp].salary += wage;
      workplaceMap[wp].hours += h;
      workplaceMap[wp].count += 1;
    });
  });

  const workplaceList = Object.values(workplaceMap).sort((a, b) => b.salary - a.salary);
  let topWp = '--';
  let topShare = '0%';
  if (workplaceList.length > 0 && totalSalary > 0) {
    topWp = workplaceList[0].name;
    topShare = `${Math.round((workplaceList[0].salary / totalSalary) * 100)}%`;
  }

  return {
    weeks,
    availableWorkplaces,
    totalSalary,
    totalHours,
    totalShifts,
    workplaceList,
    topWp,
    topShare
  };
};

const compactCurrency = (val) => {
  const num = Math.round(val || 0);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'k';
  return num.toString();
};

const drawRoundedBar = (ctx, x, y, width, height, radius) => {
  if (height <= 0) return;
  const r = Math.min(radius, width / 2, height);
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.closePath();
  ctx.fill();
};

const drawTimelineChart = (data) => {
  const canvas = document.getElementById('timelineChartCanvas');
  if (!canvas) return;
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth || 600;
  const height = 210;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padLeft = 40;
  const padRight = 16;
  const padTop = 30;
  const padBottom = 42;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  let points = [];
  if (analyticsState.timeFilter === 'current') {
    const curWeek = getCurrentWeek();
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    points = days.map(d => {
      let salary = 0;
      let hours = 0;
      if (curWeek) {
        (curWeek.shifts || []).forEach(s => {
          const wp = s.workplace || 'Chung';
          if (s.day === d && (analyticsState.workplaceFilter === 'all' || wp === analyticsState.workplaceFilter)) {
            salary += getShiftEarnings(s, curWeek);
            hours += Number(s.hours || 0);
          }
        });
      }
      const dateStr = curWeek ? getShiftDateShort(curWeek, d) : '';
      return {
        label: d,
        subLabel: dateStr,
        salary,
        hours
      };
    });
  } else {
    points = data.weeks.map(w => {
      let salary = 0;
      let hours = 0;
      (w.shifts || []).forEach(s => {
        const wp = s.workplace || 'Chung';
        if (analyticsState.workplaceFilter === 'all' || wp === analyticsState.workplaceFilter) {
          salary += getShiftEarnings(s, w);
          hours += Number(s.hours || 0);
        }
      });
      const range = getWeekDateRangeDisplay(w);
      return {
        label: w.name,
        subLabel: range ? range.split('–')[0].trim() : '',
        salary,
        hours
      };
    });
  }

  const maxVal = Math.max(...points.map(p => p.salary), 100000);
  const roundedMax = Math.ceil(maxVal / 100000) * 100000;

  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const emptyBarColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  const steps = 3;
  ctx.fillStyle = subtextColor;
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';

  for (let i = 0; i <= steps; i++) {
    const yVal = padTop + (chartH / steps) * (steps - i);
    ctx.beginPath();
    ctx.moveTo(padLeft, yVal);
    ctx.lineTo(width - padRight, yVal);
    ctx.stroke();

    const labelVal = (roundedMax / steps) * i;
    ctx.fillText(compactCurrency(labelVal), padLeft - 6, yVal + 3.5);
  }
  ctx.setLineDash([]);

  if (points.length === 0) return;

  const barCount = points.length;
  const colWidth = chartW / barCount;
  const barWidth = Math.max(14, Math.min(42, colWidth * 0.58));

  points.forEach((p, idx) => {
    const cx = padLeft + idx * colWidth + colWidth / 2;
    const barX = cx - barWidth / 2;
    const barHeight = p.salary > 0 ? (p.salary / roundedMax) * chartH : 0;
    const barY = padTop + chartH - barHeight;

    if (p.salary > 0) {
      const grad = ctx.createLinearGradient(0, barY, 0, barY + barHeight);
      if (analyticsState.workplaceFilter !== 'all') {
        const wpCol = getWorkplaceColor(analyticsState.workplaceFilter);
        grad.addColorStop(0, wpCol.fill);
        grad.addColorStop(1, wpCol.fill + '88');
      } else {
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(1, '#818cf8');
      }
      ctx.fillStyle = grad;
      drawRoundedBar(ctx, barX, barY, barWidth, barHeight, 5);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(compactCurrency(p.salary), cx, barY - 6);
    } else {
      ctx.fillStyle = emptyBarColor;
      drawRoundedBar(ctx, barX, padTop + chartH - 3, barWidth, 3, 2);
    }

    ctx.fillStyle = textColor;
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, cx, padTop + chartH + 16);

    if (p.subLabel) {
      ctx.fillStyle = subtextColor;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(p.subLabel, cx, padTop + chartH + 28);
    }
  });
};

const drawDonutChart = (data) => {
  const canvas = document.getElementById('donutChartCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = 180;
  canvas.width = Math.floor(size * dpr);
  canvas.height = Math.floor(size * dpr);
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const outerR = 76;
  const innerR = 52;

  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const emptyCircleColor = isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0';

  if (data.totalSalary <= 0 || data.workplaceList.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = emptyCircleColor;
    ctx.lineWidth = outerR - innerR;
    ctx.stroke();

    ctx.fillStyle = subtextColor;
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Chưa có ca', cx, cy + 4);
    return;
  }

  let startAngle = -Math.PI / 2;
  const gap = data.workplaceList.length > 1 ? 0.04 : 0;

  data.workplaceList.forEach(wp => {
    const sliceAngle = (wp.salary / data.totalSalary) * (2 * Math.PI);
    const endAngle = startAngle + sliceAngle;
    const col = getWorkplaceColor(wp.name);

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, startAngle + gap / 2, endAngle - gap / 2, false);
    ctx.arc(cx, cy, innerR, endAngle - gap / 2, startAngle + gap / 2, true);
    ctx.closePath();

    ctx.fillStyle = col.fill;
    ctx.fill();

    startAngle = endAngle;
  });

  ctx.fillStyle = textColor;
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(compactCurrency(data.totalSalary), cx, cy + 1);

  ctx.fillStyle = subtextColor;
  ctx.font = '500 9px "Outfit", sans-serif';
  ctx.fillText('Tổng thu', cx, cy + 15);
};

const renderAnalyticsDashboard = () => {
  const data = getAnalyticsData();

  document.getElementById('akTotalSalary').textContent = fmtCurrency(data.totalSalary);
  document.getElementById('akTotalHours').textContent = fmtHours(data.totalHours);
  document.getElementById('akTotalShifts').textContent = `${data.totalShifts} ca`;
  document.getElementById('akTopWorkplace').textContent = data.topWp;
  document.getElementById('akTopWorkplaceShare').textContent = `${data.topShare} tổng thu`;

  const periodNames = {
    'current': 'Tuần này',
    'recent': '4 tuần gần nhất',
    'all': 'Tất cả các tuần'
  };
  document.getElementById('akSalaryPeriod').textContent = periodNames[analyticsState.timeFilter] || '';

  const subtitle = document.getElementById('timelineChartSubtitle');
  if (subtitle) {
    subtitle.textContent = analyticsState.timeFilter === 'current' ? 'Theo ngày (VNĐ)' : 'Theo tuần (VNĐ)';
  }
  const title = document.getElementById('timelineChartTitle');
  if (title) {
    title.textContent = analyticsState.timeFilter === 'current' ? 'Thu nhập theo ngày làm việc' : 'Thu nhập theo từng tuần';
  }

  const pillsContainer = document.getElementById('analyticsWorkplaceFilterPills');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    const allPill = document.createElement('span');
    allPill.className = `workplace-chip font-mono ${analyticsState.workplaceFilter === 'all' ? 'active' : ''}`;
    allPill.textContent = 'Tất cả';
    allPill.addEventListener('click', () => {
      analyticsState.workplaceFilter = 'all';
      renderAnalyticsDashboard();
    });
    pillsContainer.appendChild(allPill);

    data.availableWorkplaces.forEach(wp => {
      const chip = document.createElement('span');
      chip.className = `workplace-chip font-mono ${analyticsState.workplaceFilter === wp ? 'active' : ''}`;
      const col = getWorkplaceColor(wp);
      chip.innerHTML = `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${col.fill};margin-right:4px;"></span>${escapeHtml(wp)}`;
      chip.addEventListener('click', () => {
        analyticsState.workplaceFilter = (analyticsState.workplaceFilter === wp) ? 'all' : wp;
        renderAnalyticsDashboard();
      });
      pillsContainer.appendChild(chip);
    });
  }

  drawTimelineChart(data);
  drawDonutChart(data);

  const breakdownContainer = document.getElementById('workplaceBreakdownList');
  if (breakdownContainer) {
    breakdownContainer.innerHTML = '';
    if (data.workplaceList.length === 0) {
      breakdownContainer.innerHTML = `<span class="field-hint" style="font-size:0.8rem;">Chưa có dữ liệu ca làm việc.</span>`;
    } else {
      data.workplaceList.forEach(wp => {
        const percent = data.totalSalary > 0 ? Math.round((wp.salary / data.totalSalary) * 100) : 0;
        const col = getWorkplaceColor(wp.name);
        const item = document.createElement('div');
        item.className = 'wb-item';
        item.innerHTML = `
          <div class="wb-header font-mono">
            <div class="wb-name-group">
              <span class="wb-color-dot" style="background:${col.fill};"></span>
              <span>${escapeHtml(wp.name)}</span>
              <span class="field-hint" style="font-size:0.7rem;">(${percent}%)</span>
            </div>
            <span class="wb-amount font-mono">${fmtCurrency(wp.salary)}</span>
          </div>
          <div class="wb-bar-track">
            <div class="wb-bar-fill" style="width:${percent}%;background:${col.fill};"></div>
          </div>
          <span class="wb-sub font-mono">${wp.count} ca • ${wp.hours.toFixed(2)}h</span>
        `;
        breakdownContainer.appendChild(item);
      });
    }
  }
};

const openAnalyticsModal = () => {
  openAllWeeksModal('analytics');
};

const renderSettingsWorkplaces = () => {
  const container = document.getElementById('settingsWorkplacesList');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
  if (!state.settings.workplaceRates || typeof state.settings.workplaceRates !== 'object') {
    state.settings.workplaceRates = {};
  }

  if (state.settings.workplaces.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'empty-wp-hint';
    emptyRow.style.cssText = 'padding: 0.75rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;';
    emptyRow.textContent = 'Chưa có nơi làm việc nào. Thêm nơi làm việc mới ở ô bên dưới.';
    container.appendChild(emptyRow);
    return;
  }

  state.settings.workplaces.forEach((wp, idx) => {
    const wpCol = getWorkplaceColor(wp);
    const customRate = state.settings.workplaceRates[wp] || '';
    const row = document.createElement('div');
    row.className = 'settings-workplace-row font-mono';
    row.innerHTML = `
      <div class="settings-wp-name-wrap">
        <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
        <span class="settings-wp-name">${escapeHtml(wp)}</span>
      </div>
      <div class="settings-wp-rate-wrap">
        <div class="settings-wp-rate-box">
          <input type="number" class="settings-wp-rate-input font-mono" data-wp-name="${escapeHtml(wp)}" value="${customRate}" placeholder="${state.settings.defaultRate || 0}" step="1000" min="0" title="Đơn giá riêng (đ/h)">
          <span class="settings-wp-rate-tag font-mono">đ/h</span>
        </div>
        <button type="button" class="btn-remove-workplace btn-morphic btn-morphic-danger" data-del-wp="${idx}" title="Xóa nơi làm ${escapeHtml(wp)}" aria-label="Xóa nơi làm ${escapeHtml(wp)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    row.querySelector('[data-del-wp]').addEventListener('click', () => {
      const removed = state.settings.workplaces.splice(idx, 1)[0];
      if (removed && state.settings.workplaceRates) {
        delete state.settings.workplaceRates[removed];
      }
      saveSettings();
      renderSettingsWorkplaces();
    });

    row.querySelector('.settings-wp-rate-input').addEventListener('change', (e) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val >= 0) {
        state.settings.workplaceRates[wp] = val;
      } else {
        delete state.settings.workplaceRates[wp];
      }
      saveSettings();
    });

    container.appendChild(row);
  });
};

const addWorkplaceFromSetting = () => {
  const input = document.getElementById('newWorkplaceInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
  if (!state.settings.workplaces.includes(val)) {
    state.settings.workplaces.push(val);
    saveSettings();
    renderSettingsWorkplaces();
    input.value = '';
    showToast(`Đã thêm nơi làm: ${val}`);
  }
};

const openSettingsModal = () => {
  document.getElementById('settingDefaultRate').value = state.settings.defaultRate ? state.settings.defaultRate : '';
  renderSettingsWorkplaces();

  const currentTheme = localStorage.getItem('salary_tracker_theme') || state.settings?.theme || 'light';
  document.querySelectorAll('#themeSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeVal === currentTheme);
  });

  const currentLang = getCurrentLang();
  document.querySelectorAll('#langSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langVal === currentLang);
  });

  updateSyncStatusUI();

  document.getElementById('settingsModal').style.display = 'flex';
};

const saveSettingsFromModal = () => {
  const rateInputVal = document.getElementById('settingDefaultRate').value.trim();
  if (rateInputVal === '') {
    state.settings.defaultRate = 0;
  } else {
    const rate = Number(rateInputVal);
    if (!isNaN(rate) && rate >= 0) {
      state.settings.defaultRate = rate;
    }
  }
  saveSettings();
  closeModal('settingsModal');
  showToast('Đã lưu cài đặt');
};

const renderSlipCanvas = () => {
  const week = getCurrentWeek();
  const canvas = document.getElementById('slipCanvas');
  if (!canvas || !week) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.max(window.devicePixelRatio || 1, 2);

  const includeMoney = document.getElementById('slipIncludeMoney')?.checked;
  const shifts = week.shifts || [];

  const padX = 18;
  const padTop = 18;
  const totalWidth = 510;
  const contentWidth = totalWidth - padX * 2;

  const headerHeight = 36;
  const thHeight = 34;
  const rowHeight = 32;
  const totalRowHeight = 36;
  const footerHeight = 24;

  const totalHeight = padTop + headerHeight + thHeight + (shifts.length * rowHeight) + totalRowHeight + footerHeight;

 
  canvas.width = totalWidth * dpr;
  canvas.height = totalHeight * dpr;
  canvas.style.maxWidth = `${totalWidth}px`;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  ctx.scale(dpr, dpr);

 
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

 
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, totalWidth - 1, totalHeight - 1);

 
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "Outfit", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((week.name || 'Tuần').toUpperCase(), totalWidth / 2, padTop + 21);

 
  const tableY = padTop + headerHeight;
  let colWidths;
  let thTitles;

  if (includeMoney) {
    colWidths = [104, 85, 85, 90, 110];
    thTitles = ['Ca', 'Giờ vào', 'Giờ ra', 'Số giờ', 'Thành tiền'];
  } else {
    colWidths = [134, 110, 110, 120];
    thTitles = ['Ca', 'Giờ vào', 'Giờ ra', 'Số giờ'];
  }

  const colX = [padX];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colX.push(colX[i] + colWidths[i]);
  }

 
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(padX, tableY, contentWidth, thHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Outfit", sans-serif';
  for (let i = 0; i < thTitles.length; i++) {
    const isRight = (includeMoney && i === 4);
    const isLeft = (i === 0);
    ctx.textAlign = isRight ? 'right' : (isLeft ? 'left' : 'center');
    const tx = isRight ? (colX[i] + colWidths[i] - 10) : (isLeft ? (colX[i] + 10) : (colX[i] + colWidths[i] / 2));
    ctx.fillText(thTitles[i], tx, tableY + 21);
  }

 
  let curY = tableY + thHeight;
  let totalHours = 0;

  shifts.forEach((s, idx) => {
    const shiftHours = Number(s.hours || 0);
    totalHours += shiftHours;
    const shiftWage = getShiftEarnings(s, week);
    const isEven = idx % 2 === 0;

   
    ctx.fillStyle = isEven ? '#ffffff' : '#f8fafc';
    ctx.fillRect(padX, curY, contentWidth, rowHeight);

   
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, curY + rowHeight + 0.5);
    ctx.lineTo(padX + contentWidth, curY + rowHeight + 0.5);
    ctx.stroke();

   
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'left';
    const otExtra = (s.otRate && Number(s.otRate) > 1) ? ` (x${s.otRate})` : '';
    const shiftLabel = `${s.day} ${formatShiftType(s.type)}${otExtra}`;
    ctx.fillText(shiftLabel, colX[0] + 10, curY + 20);

   
    ctx.fillStyle = '#334155';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.start, colX[1] + colWidths[1] / 2, curY + 20);

   
    ctx.fillText(s.end, colX[2] + colWidths[2] / 2, curY + 20);

   
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hoursToColonFormat(s.hours), colX[3] + colWidths[3] / 2, curY + 20);

   
    if (includeMoney) {
      ctx.fillStyle = '#1e3a8a';
      ctx.textAlign = 'right';
      ctx.fillText(fmtCurrency(shiftWage), colX[4] + colWidths[4] - 10, curY + 20);
    }

    curY += rowHeight;
  });

 
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(padX, curY, contentWidth, totalRowHeight);

 
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Tổng', colX[0] + 10, curY + 23);

 
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(hoursToColonFormat(totalHours), colX[3] + colWidths[3] / 2, curY + 23);

 
  if (includeMoney) {
    const totalSalary = shifts.reduce((acc, s) => acc + getShiftEarnings(s, week), 0);
    ctx.fillStyle = '#34d399';
    ctx.textAlign = 'right';
    ctx.fillText(fmtCurrency(totalSalary), colX[4] + colWidths[4] - 10, curY + 23);
  }

 
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 10px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Salary Tracker', totalWidth / 2, totalHeight - 8);
};

const openAuthModal = (defaultTab = 'login') => {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  switchAuthTab(defaultTab);
  clearAuthErrors();
  modal.style.display = 'flex';
};

const switchAuthTab = (tab) => {
  const btnLogin = document.getElementById('tabBtnLogin');
  const btnRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const title = document.getElementById('authModalTitle');

  if (tab === 'login') {
    btnLogin.classList.add('active');
    btnRegister.classList.remove('active');
    formLogin.style.display = 'flex';
    formRegister.style.display = 'none';
    if (title) title.textContent = 'Đăng nhập tài khoản';
  } else {
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
    if (title) title.textContent = 'Đăng ký tài khoản mới';
  }
  clearAuthErrors();
};

const clearAuthErrors = () => {
  const loginErr = document.getElementById('loginError');
  const regErr = document.getElementById('regError');
  if (loginErr) { loginErr.style.display = 'none'; loginErr.textContent = ''; }
  if (regErr) { regErr.style.display = 'none'; regErr.textContent = ''; }
};

const openUserProfileModal = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    return;
  }

  const modal = document.getElementById('userProfileModal');
  if (!modal) return;

  const username = state.currentUser.username || 'user';
  const badge = document.getElementById('profileAvatarBadge');
  if (badge) {
    badge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
  }
  document.getElementById('profileUsername').textContent = `@${username}`;

 
  const totalWeeks = state.weeks.length;
  let totalShifts = 0;
  let totalHours = 0;
  state.weeks.forEach(w => {
    totalShifts += w.shifts.length;
    w.shifts.forEach(s => { totalHours += Number(s.hours || 0); });
  });

  document.getElementById('profileTotalWeeks').textContent = totalWeeks;
  document.getElementById('profileTotalShifts').textContent = totalShifts;
  document.getElementById('profileTotalHours').textContent = `${Math.round(totalHours)}h`;

  modal.style.display = 'flex';
};

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const rawInput = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!rawInput || !password) {
    errorEl.textContent = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
    errorEl.style.display = 'block';
    return;
  }

  if (rawInput.includes('@')) {
    errorEl.textContent = 'Chỉ cho phép đăng nhập bằng tên tài khoản (không dùng email).';
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';

  if (!supabaseClient) {
    errorEl.textContent = 'Chưa kết nối được với Supabase. Vui lòng kiểm tra mạng hoặc tải lại trang.';
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const email = `${rawInput.toLowerCase()}@salary.app`;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorEl.textContent = error.message === 'Invalid login credentials'
        ? 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.'
        : `Lỗi đăng nhập: ${error.message}`;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    const username = u.user_metadata?.username || u.email.split('@')[0];
    state.currentUser = { id: u.id, email: u.email, username };

    updateHeaderAuthUI();
    await loadState();
    renderApp();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formLogin').reset();
    showToast(`Đăng nhập thành công! Chào @${username}.`);
  } catch (err) {
    errorEl.textContent = `Lỗi kết nối: ${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  const rawUsername = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const errorEl = document.getElementById('regError');

  if (!rawUsername || !password || !passwordConfirm) {
    errorEl.textContent = 'Vui lòng điền đầy đủ tất cả các trường.';
    errorEl.style.display = 'block';
    return;
  }

  if (rawUsername.includes('@')) {
    errorEl.textContent = 'Tên tài khoản không được chứa ký tự @.';
    errorEl.style.display = 'block';
    return;
  }

  if (rawUsername.length < 3) {
    errorEl.textContent = 'Tên đăng nhập phải có ít nhất 3 ký tự.';
    errorEl.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
    errorEl.style.display = 'block';
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = 'Xác nhận mật khẩu không khớp.';
    errorEl.style.display = 'block';
    return;
  }

  if (!supabaseClient) {
    errorEl.textContent = 'Chưa kết nối được với Supabase. Vui lòng tải lại trang.';
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const email = `${rawUsername}@salary.app`;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username: rawUsername }
      }
    });

    if (error) {
      let msg = error.message;
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        msg = 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.';
      } else {
        msg = `Đăng ký thất bại: ${msg}`;
      }
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!data.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0)) {
      errorEl.textContent = 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.';
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    state.currentUser = { id: u.id, email: u.email, username: rawUsername };

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
    try {
      await supabaseClient.from('user_salary_data').upsert({
        user_id: u.id,
        username: rawUsername,
        weeks: initialWeeks,
        settings: state.settings,
        updated_at: new Date().toISOString()
      });
    } catch (_) {}
    updateHeaderAuthUI();
    renderApp();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formRegister').reset();
    showToast(`Tạo tài khoản thành công! Chào @${rawUsername}.`);
  } catch (err) {
    errorEl.textContent = `Lỗi: ${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

const handleLogout = async () => {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    state.currentUser = null;
    updateHeaderAuthUI();
    await loadState();
    renderApp();
    document.getElementById('userProfileModal').style.display = 'none';
    showToast('Đã đăng xuất tài khoản.');
  }
};

const EYE_OPEN_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
`;

const EYE_OFF_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
`;

const setupPasswordToggles = () => {
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = EYE_OFF_SVG;
        btn.setAttribute('title', 'Ẩn mật khẩu');
        btn.setAttribute('aria-label', 'Ẩn mật khẩu');
      } else {
        input.type = 'password';
        btn.innerHTML = EYE_OPEN_SVG;
        btn.setAttribute('title', 'Hiện mật khẩu');
        btn.setAttribute('aria-label', 'Hiện mật khẩu');
      }
    });
  });
};

const handleChangePasswordSubmit = async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('changeNewPassword').value;
  const confirmPassword = document.getElementById('changeConfirmPassword').value;
  const errorEl = document.getElementById('changePasswordMsg');
  const submitBtn = document.getElementById('btnSubmitChangePassword');

  if (!newPassword || newPassword.length < 6) {
    errorEl.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
    errorEl.style.display = 'block';
    return;
  }

  if (newPassword !== confirmPassword) {
    errorEl.textContent = 'Mật khẩu xác nhận không khớp.';
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
      throw new Error('Chưa kết nối tới cơ sở dữ liệu đám mây.');
    }

    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    showToast('Đổi mật khẩu thành công!');
    document.getElementById('formChangePassword').reset();
    document.getElementById('formChangePassword').style.display = 'none';
    const chevron = document.getElementById('iconChangePwdChevron');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } catch (err) {
    errorEl.textContent = `Lỗi: ${err.message || 'Không thể đổi mật khẩu.'}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      if (originalSvg) submitBtn.innerHTML = originalSvg;
    }
  }
};



const openShareSlipModal = () => {
  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('shareSlipModalTitle').textContent = 'Phiếu chấm công';
  renderSlipCanvas();
  document.getElementById('shareSlipModal').style.display = 'flex';
};

const downloadSlipImage = () => {
  const canvas = document.getElementById('slipCanvas');
  const week = getCurrentWeek();
  if (!canvas || !week) return;

  const a = document.createElement('a');
  a.download = `bang_cham_cong_${slugify(week.name)}.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('Đã tải ảnh bảng chấm công!');
};

const copySlipImageToClipboard = async () => {
  const canvas = document.getElementById('slipCanvas');
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast('Đã chép ảnh vào Clipboard! Mở Zalo bấm Ctrl+V để gửi.');
      } else {
        downloadSlipImage();
      }
    } catch (err) {
      console.warn('Clipboard write image failed, downloading instead:', err);
      downloadSlipImage();
    }
  }, 'image/png');
};

const exportCurrentWeekCSV = () => {
  const week = getCurrentWeek();
  if (!week) return;

  let csvContent = '\uFEFF';
  csvContent += `BẢNG CHẤM CÔNG VÀ LƯƠNG — ${week.name}\r\n`;
  csvContent += `Đơn giá mặc định: ${week.rate} VNĐ/h\r\n\r\n`;
  csvContent += `Thứ,Ca,Nơi làm việc,Giờ bắt đầu,Giờ kết thúc,Nghỉ (phút),Số giờ,Hệ số OT,Thưởng/Phụ cấp (VNĐ),Thành tiền (VNĐ),Ghi chú\r\n`;

  week.shifts.forEach(s => {
    const salary = getShiftEarnings(s, week);
    const ot = Number(s.otRate) || 1.0;
    const allowance = Number(s.allowance) || 0;
    csvContent += `"${s.day}","${s.type}","${(s.workplace || '').replace(/"/g, '""')}","${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${ot},${allowance},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
  });

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = calculateWeekTotalSalary(week);
  csvContent += `\r\nTỔNG CỘNG,,,"",,,,,${totalHours.toFixed(2)},,${Math.round(totalSalary)},""\r\n`;

  downloadFile(csvContent, `${slugify(week.name)}_salary.csv`, 'text/csv;charset=utf-8;');
  showToast(`Đã xuất file CSV cho ${week.name}`);
};

const exportAllWeeksCSV = () => {
  let csvContent = '\uFEFF';
  csvContent += `TỔNG HỢP CA LÀM VIỆC VÀ LƯƠNG TẤT CẢ CÁC TUẦN\r\n\r\n`;
  csvContent += `Tuần,Khoảng ngày,Đơn giá mặc định (VNĐ/h),Ngày làm,Thứ,Ca,Nơi làm việc,Bắt đầu,Kết thúc,Nghỉ (phút),Số giờ,Hệ số OT,Thưởng/Phụ cấp (VNĐ),Thành tiền (VNĐ),Ghi chú\r\n`;

  let grandTotalHours = 0;
  let grandTotalSalary = 0;

  state.weeks.forEach(w => {
    const weekRange = getWeekDateRangeDisplay(w);
    w.shifts.forEach(s => {
      const salary = getShiftEarnings(s, w);
      const ot = Number(s.otRate) || 1.0;
      const allowance = Number(s.allowance) || 0;
      const shiftFullDate = getShiftDateFull(w, s.day);
      grandTotalHours += Number(s.hours || 0);
      grandTotalSalary += salary;
      csvContent += `"${w.name}","${weekRange}",${w.rate},"${shiftFullDate}","${s.day}","${s.type}","${(s.workplace || '').replace(/"/g, '""')}","${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${ot},${allowance},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
    });
  });

  csvContent += `\r\nTỔNG TOÀN BỘ,,,,,,,,,,${grandTotalHours.toFixed(2)},,,${Math.round(grandTotalSalary)},""\r\n`;

  downloadFile(csvContent, `tong_hop_luong_cac_tuan.csv`, 'text/csv;charset=utf-8;');
  showToast('Đã xuất tổng hợp toàn bộ các tuần');
};

const backupJSON = () => {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings: state.settings,
    weeks: state.weeks
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const fileName = `SalaryTracker_Backup_${y}-${m}-${d}_${hh}${mm}.json`;
  downloadFile(jsonStr, fileName, 'application/json');
  showToast(`Đã xuất sao lưu: ${fileName}`);
};

const restoreJSON = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.weeks && Array.isArray(parsed.weeks)) {
        state.weeks = parsed.weeks;
        if (parsed.settings) state.settings = parsed.settings;
        state.currentWeekId = state.weeks[state.weeks.length - 1].id;
        saveWeeks();
        saveSettings();
        closeModal('settingsModal');
        renderApp();
        showToast('Khôi phục dữ liệu thành công!');
      } else {
        alert('File JSON không hợp lệ hoặc thiếu dữ liệu.');
      }
    } catch (err) {
      alert('Không thể đọc file: ' + err.message);
    }
  };
  reader.readAsText(file);
};


const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const slugify = (text) => {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
};

const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
};

const bindEvents = () => {
 
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

 
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

 
  const btnSettings = document.getElementById('btnSettings');
  if (btnSettings) btnSettings.addEventListener('click', openSettingsModal);

  document.querySelectorAll('#themeSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.themeVal;
      applyTheme(val, true);
    });
  });

  document.querySelectorAll('#langSegmentedControl .segmented-btn-3d').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.langVal;
      applyLanguage(val, true);
    });
  });

  const btnManualSync = document.getElementById('btnManualCloudSync');
  if (btnManualSync) {
    btnManualSync.addEventListener('click', () => syncPendingToCloud(true));
  }

  const btnNewWeek = document.getElementById('btnNewWeek');
  if (btnNewWeek) btnNewWeek.addEventListener('click', createNewWeek);

  const btnEditWeekMeta = document.getElementById('btnEditWeekMeta');
  if (btnEditWeekMeta) btnEditWeekMeta.addEventListener('click', openEditWeekModal);

  document.getElementById('shiftForm').addEventListener('submit', saveShiftFromModal);
  document.getElementById('shiftStart').addEventListener('input', () => {
    const val = document.getElementById('shiftStart').value;
    if (val) {
      const detected = detectShiftType(val);
      const sel = document.getElementById('shiftType');
      if (sel) {
        sel.value = detected;
        syncCustomSelect('shiftType');
      }
    }
    updateModalComputedPreview();
  });
  document.getElementById('shiftEnd').addEventListener('input', updateModalComputedPreview);
  const shiftBreakInput = document.getElementById('shiftBreak');
  if (shiftBreakInput) shiftBreakInput.addEventListener('input', updateModalComputedPreview);
  const shiftOtRateInput = document.getElementById('shiftOtRate');
  if (shiftOtRateInput) {
    shiftOtRateInput.addEventListener('input', updateModalComputedPreview);
    shiftOtRateInput.addEventListener('change', updateModalComputedPreview);
  }
  const shiftAllowanceInput = document.getElementById('shiftAllowance');
  if (shiftAllowanceInput) {
    shiftAllowanceInput.addEventListener('input', updateModalComputedPreview);
    shiftAllowanceInput.addEventListener('change', updateModalComputedPreview);
  }
  const shiftWorkplaceInput = document.getElementById('shiftWorkplace');
  if (shiftWorkplaceInput) shiftWorkplaceInput.addEventListener('input', updateModalComputedPreview);

  const btnDeleteShiftModal = document.getElementById('btnDeleteShiftModal');
  if (btnDeleteShiftModal) {
    btnDeleteShiftModal.addEventListener('click', () => {
      const editId = document.getElementById('editShiftId').value;
      if (editId) {
        if (confirm('Bạn có chắc chắn muốn xóa ca làm việc này không?')) {
          deleteShift(editId);
          closeModal('shiftModal');
        }
      }
    });
  }

  document.querySelectorAll('.preset-tile').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (preset === 'morning') {
        document.getElementById('shiftType').value = 'Sáng';
        document.getElementById('shiftStart').value = '08:00';
        document.getElementById('shiftEnd').value = '12:00';
      } else if (preset === 'noon') {
        document.getElementById('shiftType').value = 'Trưa';
        document.getElementById('shiftStart').value = '10:00';
        document.getElementById('shiftEnd').value = '13:30';
      } else if (preset === 'night') {
        document.getElementById('shiftType').value = 'Tối';
        document.getElementById('shiftStart').value = '17:00';
        document.getElementById('shiftEnd').value = '20:30';
      }
      syncCustomSelect('shiftType');
      updateModalComputedPreview();
    });
  });

 
  const editWeekForm = document.getElementById('editWeekForm');
  if (editWeekForm) editWeekForm.addEventListener('submit', saveWeekMeta);
  const btnDeleteCurrentWeek = document.getElementById('btnDeleteCurrentWeek');
  if (btnDeleteCurrentWeek) btnDeleteCurrentWeek.addEventListener('click', deleteCurrentWeek);
  const btnDeleteCurrentWeekBar = document.getElementById('btnDeleteCurrentWeekBar');
  if (btnDeleteCurrentWeekBar) btnDeleteCurrentWeekBar.addEventListener('click', deleteCurrentWeek);

 
  const btnUserAuth = document.getElementById('btnUserAuth');
  if (btnUserAuth) {
    btnUserAuth.addEventListener('click', () => {
      if (state.currentUser) {
        openUserProfileModal();
      } else {
        openAuthModal('login');
      }
    });
  }

  const tabBtnLogin = document.getElementById('tabBtnLogin');
  if (tabBtnLogin) tabBtnLogin.addEventListener('click', () => switchAuthTab('login'));

  const tabBtnRegister = document.getElementById('tabBtnRegister');
  if (tabBtnRegister) tabBtnRegister.addEventListener('click', () => switchAuthTab('register'));

  const formLogin = document.getElementById('formLogin');
  if (formLogin) formLogin.addEventListener('submit', handleLoginSubmit);

  const formRegister = document.getElementById('formRegister');
  if (formRegister) formRegister.addEventListener('submit', handleRegisterSubmit);

  const btnLogoutUser = document.getElementById('btnLogoutUser');
  if (btnLogoutUser) btnLogoutUser.addEventListener('click', handleLogout);

  setupPasswordToggles();

  const btnToggleChangePwd = document.getElementById('btnToggleChangePwdSection');
  const formChangePwd = document.getElementById('formChangePassword');
  const iconChevron = document.getElementById('iconChangePwdChevron');
  if (btnToggleChangePwd && formChangePwd) {
    btnToggleChangePwd.addEventListener('click', () => {
      const isHidden = formChangePwd.style.display === 'none';
      formChangePwd.style.display = isHidden ? 'flex' : 'none';
      if (iconChevron) {
        iconChevron.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  if (formChangePwd) {
    formChangePwd.addEventListener('submit', handleChangePasswordSubmit);
  }



 
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettingsFromModal);
  document.getElementById('btnBackupJson').addEventListener('click', backupJSON);
  document.getElementById('fileRestoreJson').addEventListener('change', restoreJSON);
  document.getElementById('btnExportAllExcel').addEventListener('click', exportAllWeeksCSV);

  const dockShareSlip = document.getElementById('dockShareSlip');
  if (dockShareSlip) {
    dockShareSlip.addEventListener('click', openShareSlipModal);
  }

  const dockPrevWeek = document.getElementById('dockPrevWeek');
  if (dockPrevWeek) {
    dockPrevWeek.addEventListener('click', () => navigateWeek(-1));
  }

  const dockNextWeek = document.getElementById('dockNextWeek');
  if (dockNextWeek) {
    dockNextWeek.addEventListener('click', () => navigateWeek(1));
  }

  const dockAddShift = document.getElementById('dockAddShift');
  if (dockAddShift) {
    dockAddShift.addEventListener('click', () => openAddShiftModal());
  }

  const dockAllWeeks = document.getElementById('dockAllWeeks');
  if (dockAllWeeks) {
    dockAllWeeks.addEventListener('click', () => openAllWeeksModal('analytics'));
  }

  const dockAnalytics = document.getElementById('dockAnalytics');
  if (dockAnalytics) {
    dockAnalytics.addEventListener('click', () => openAllWeeksModal('analytics'));
  }

  const ledgerCard = document.getElementById('ledgerCardSummary');
  if (ledgerCard) {
    ledgerCard.addEventListener('click', () => openAllWeeksModal('analytics'));
  }

  const btnTabSummaryAnalytics = document.getElementById('tabBtnSummaryAnalytics');
  if (btnTabSummaryAnalytics) {
    btnTabSummaryAnalytics.addEventListener('click', () => switchSummaryTab('analytics'));
  }

  const btnTabSummaryTable = document.getElementById('tabBtnSummaryTable');
  if (btnTabSummaryTable) {
    btnTabSummaryTable.addEventListener('click', () => switchSummaryTab('table'));
  }

  const btnTabSummaryMonthly = document.getElementById('tabBtnSummaryMonthly');
  if (btnTabSummaryMonthly) {
    btnTabSummaryMonthly.addEventListener('click', () => switchSummaryTab('monthly'));
  }

  // Shifts Filter Tray & Custom Select Events
  const btnToggleFilter = document.getElementById('btnToggleShiftsFilter');
  const shiftsFilterTray = document.getElementById('shiftsFilterBar');
  if (btnToggleFilter && shiftsFilterTray) {
    btnToggleFilter.addEventListener('click', () => {
      const isHidden = shiftsFilterTray.style.display === 'none' || shiftsFilterTray.style.display === '';
      shiftsFilterTray.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        syncCustomSelect('filterWorkplaceSelect');
      }
    });
  }

  const filterWpSelect = document.getElementById('filterWorkplaceSelect');
  if (filterWpSelect) {
    filterWpSelect.addEventListener('change', (e) => {
      shiftsFilterState.workplace = e.target.value;
      syncCustomSelect('filterWorkplaceSelect');
      renderShiftsList();
    });
  }

  const filterDateInput = document.getElementById('filterDateInput');
  if (filterDateInput) {
    filterDateInput.addEventListener('change', (e) => {
      shiftsFilterState.date = e.target.value;
      renderShiftsList();
    });
  }

  const btnResetAll = document.getElementById('btnResetAllFilters');
  if (btnResetAll) {
    btnResetAll.addEventListener('click', () => {
      shiftsFilterState.workplace = '';
      shiftsFilterState.date = '';
      if (filterWpSelect) filterWpSelect.value = '';
      syncCustomSelect('filterWorkplaceSelect');
      if (filterDateInput) filterDateInput.value = '';
      renderShiftsList();
    });
  }

  // Custom Workplace Autocomplete Dropdown Popover
  const btnToggleWp = document.getElementById('btnToggleWorkplaceDropdown');
  const shiftWpInput = document.getElementById('shiftWorkplace');
  const customWpDropdown = document.getElementById('customWorkplaceDropdown');
  if (btnToggleWp && shiftWpInput && customWpDropdown) {
    btnToggleWp.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = customWpDropdown.style.display === 'none' || customWpDropdown.style.display === '';
      if (isHidden) {
        closeAllCustomSelects();
        renderCustomWorkplaceDropdown(shiftWpInput.value.trim());
      } else {
        closeAllCustomSelects();
      }
    });

    shiftWpInput.addEventListener('focus', () => {
      closeAllCustomSelects();
      renderCustomWorkplaceDropdown(shiftWpInput.value.trim());
    });

    shiftWpInput.addEventListener('input', (e) => {
      renderCustomWorkplaceDropdown(e.target.value.trim());
      updateModalComputedPreview();
    });
  }

  // Global dismiss for Custom Selects and Workplace Dropdown
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper') && !e.target.closest('.workplace-field-group')) {
      closeAllCustomSelects();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCustomSelects();
    }
  });

  // Khởi tạo các Custom Dropdowns đồng bộ giao diện
  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  setupCustomSelect('filterWorkplaceSelect');

  const btnAddWp = document.getElementById('btnAddWorkplaceSetting');
  if (btnAddWp) {
    btnAddWp.addEventListener('click', addWorkplaceFromSetting);
  }
  const newWpInput = document.getElementById('newWorkplaceInput');
  if (newWpInput) {
    newWpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addWorkplaceFromSetting();
      }
    });
  }

  document.querySelectorAll('[data-time-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-time-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      analyticsState.timeFilter = btn.getAttribute('data-time-filter');
      renderAnalyticsDashboard();
    });
  });

  window.addEventListener('resize', () => {
    const modal = document.getElementById('allWeeksModal');
    const pane = document.getElementById('summaryTabPaneAnalytics');
    if (modal && modal.style.display !== 'none' && pane && pane.style.display !== 'none') {
      renderAnalyticsDashboard();
    }
  });

  const btnCopySlipImage = document.getElementById('btnCopySlipImage');
  if (btnCopySlipImage) {
    btnCopySlipImage.addEventListener('click', copySlipImageToClipboard);
  }

  const btnDownloadSlipImage = document.getElementById('btnDownloadSlipImage');
  if (btnDownloadSlipImage) {
    btnDownloadSlipImage.addEventListener('click', downloadSlipImage);
  }

  const slipIncludeMoney = document.getElementById('slipIncludeMoney');
  if (slipIncludeMoney) {
    slipIncludeMoney.addEventListener('change', () => {
      renderSlipCanvas();
    });
  }

  const weekWheelTrack = document.getElementById('weekPillsList');
  if (weekWheelTrack) {
    weekWheelTrack.addEventListener('scroll', onWheelTrackScroll, { passive: true });
    weekWheelTrack.addEventListener('wheel', (e) => {
      e.preventDefault();
      weekWheelTrack.scrollTop += e.deltaY;
    }, { passive: false });
  }

 
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js?v=20261025j').then((reg) => {
      reg.update().catch(() => {});
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });
        }
      });
    }).catch(err => {
      console.warn('Service Worker registration skipped:', err);
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
};

const setupRealtimeSync = () => {
  if (!supabaseClient) return;
  try {
    supabaseClient
      .channel('salary_realtime_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_salary_data' },
        (payload) => {
          if (state.currentUser && payload.new && payload.new.user_id === state.currentUser.id) {
            // Không ghi đè nếu máy đang có chỉnh sửa offline chưa đồng bộ
            if (!hasPendingSync() && Array.isArray(payload.new.weeks)) {
              state.weeks = payload.new.weeks;
              if (payload.new.settings) state.settings = { ...state.settings, ...payload.new.settings };
              renderApp();
              showToast('Dữ liệu vừa được đồng bộ từ thiết bị khác!');
            }
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription skipped:', e);
  }
};

const setupAutoSync = () => {
  updateSyncStatusUI();

  window.addEventListener('online', async () => {
    updateSyncStatusUI();
    if (hasPendingSync()) {
      showToast(t('toast_online_syncing', 'Đã có kết nối mạng. Đang tự động đồng bộ lên đám mây...'));
      const ok = await syncPendingToCloud(false);
      if (ok) {
        showToast(t('toast_synced_success', 'Đã tự động đồng bộ toàn bộ dữ liệu lên đám mây!'));
      }
    } else {
      showToast('Đã kết nối mạng.');
    }
  });

  window.addEventListener('offline', () => {
    updateSyncStatusUI('offline');
    showToast(t('toast_offline_mode', 'Bạn đang ngoại tuyến. Dữ liệu sẽ lưu cục bộ và tự động đồng bộ khi online.'));
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const currentTheme = localStorage.getItem('salary_tracker_theme') || 'light';
      if (currentTheme === 'auto') {
        applyTheme('auto', false);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  // Khởi tạo Theme & Ngôn ngữ trước khi vẽ UI
  const savedTheme = localStorage.getItem('salary_tracker_theme') || 'light';
  applyTheme(savedTheme, false);

  const savedLang = getCurrentLang();
  applyLanguage(savedLang, false);

  await initAuth();
  await loadState();
  bindEvents();
  renderApp();
  setupRealtimeSync();
  setupAutoSync();
});
