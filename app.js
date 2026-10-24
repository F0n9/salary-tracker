

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
    "rate": 40000,
    "shifts": []
  }
];

const GUEST_WEEKS_KEY = 'shift_tracker_weeks_v2';
const GUEST_SETTINGS_KEY = 'shift_tracker_settings_v2';
const LOCAL_CACHE_WEEKS_KEY = 'salary_cloud_cache_weeks';
const LOCAL_CACHE_SETTINGS_KEY = 'salary_cloud_cache_settings';

const state = {
  currentUser: null,
  weeks: [],
  currentWeekId: null,
  settings: {
    defaultRate: 40000,
    workplaces: ['Cơm Chin Chin', 'Cafe', 'Gia sư']
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
  if (name === 'Cơm Chin Chin') {
    return { bg: 'rgba(234, 88, 12, 0.1)', color: '#ea580c', border: 'rgba(234, 88, 12, 0.28)', fill: '#ea580c' };
  }
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
  return Number(week?.rate || state.settings?.defaultRate || 40000);
};

const calculateWeekTotalSalary = (week) => {
  if (!week || !Array.isArray(week.shifts)) return 0;
  return week.shifts.reduce((acc, s) => {
    return acc + Number(s.hours || 0) * getShiftRate(s, week);
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
    full: `${d}/${m}/${y}`
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
    <button type="button" class="toast-action-btn" id="btnToastAction">${actionText}</button>
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
    if (state.currentUser && supabaseClient) {
     
      const { data, error } = await supabaseClient
        .from('user_salary_data')
        .select('*')
        .eq('user_id', state.currentUser.id)
        .maybeSingle();

      if (!error && data && Array.isArray(data.weeks) && data.weeks.length > 0) {
        state.weeks = data.weeks;
        if (data.settings) state.settings = { ...state.settings, ...data.settings };
        if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
        localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
        localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
      } else {
        const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
        const cachedSettings = localStorage.getItem(getSettingsStorageKey());
        if (cachedWeeks) {
          state.weeks = JSON.parse(cachedWeeks);
          if (cachedSettings) state.settings = JSON.parse(cachedSettings);
          if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
        } else {
          state.weeks = [{ id: 'week-1', name: 'Tuần 1', rate: 40000, shifts: [] }];
          if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
          saveWeeks();
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
      if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
      saveWeeks();
    }

    if (state.weeks.length > 0) {
      let migrated = false;
      state.weeks.forEach((w, idx) => {
        ensureWeekStartDate(w, idx);
        (w.shifts || []).forEach(s => {
          if (!s.workplace || s.workplace === 'Cafe' || s.workplace === 'Gia sư' || s.workplace === 'Chung') {
            s.workplace = 'Cơm Chin Chin';
            migrated = true;
          }
        });
      });
      if (!Array.isArray(state.settings.workplaces)) {
        state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
        migrated = true;
      } else if (!state.settings.workplaces.includes('Cơm Chin Chin')) {
        state.settings.workplaces.unshift('Cơm Chin Chin');
        migrated = true;
      }
      if (migrated) {
        saveWeeks();
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
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(async () => {
      try {
        await supabaseClient.from('user_salary_data').upsert({
          user_id: state.currentUser.id,
          username: state.currentUser.username,
          weeks: state.weeks,
          settings: state.settings,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase cloud sync error:', err);
      }
    }, 500);
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
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
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

const onWheelTrackScroll = () => {
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
  document.getElementById('kpiShiftCount').textContent = `${shiftCount} ca`;
  document.getElementById('kpiAvgHours').textContent = `${avgHours} h/ca`;
  document.getElementById('shiftsCountBadge').textContent = `${shiftCount} ca`;
};

const renderShiftsList = () => {
  const listContainer = document.getElementById('shiftsList');
  listContainer.innerHTML = '';

  const week = getCurrentWeek();

  if (!week || week.shifts.length === 0) {
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

  const dayNames = {
    'T2': 'Thứ 2',
    'T3': 'Thứ 3',
    'T4': 'Thứ 4',
    'T5': 'Thứ 5',
    'T6': 'Thứ 6',
    'T7': 'Thứ 7',
    'CN': 'Chủ Nhật'
  };

  week.shifts.forEach((shift) => {
    const card = document.createElement('div');
    card.className = 'shift-card';
    
    const shiftRate = getShiftRate(shift, week);
    const shiftEarnings = Number(shift.hours || 0) * shiftRate;
    const typeClass = shift.type === 'Trưa' ? 'type-trua' : (shift.type === 'Tối' ? 'type-toi' : (shift.type === 'Sáng' ? 'type-sang' : ''));
    const dayLabel = dayNames[shift.day] || shift.day;
    const shiftDateStr = getShiftDateShort(week, shift.day);
    const breakTag = shift.breakMinutes ? ` • nghỉ ${shift.breakMinutes}m` : '';

    card.innerHTML = `
      <div class="shift-left">
        <div class="day-badge font-mono ${getDayClass(shift.day)}">
          <span class="day-badge-name">${shift.day}</span>
          ${shiftDateStr ? `<span class="day-badge-date font-mono">${shiftDateStr}</span>` : ''}
        </div>
        <div class="shift-info">
          <div class="shift-title-row">
            <span class="shift-time-range font-mono">${shift.start} – ${shift.end}</span>
            <span class="shift-type-pill ${typeClass}">${shift.type}</span>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-morphic btn-morphic-sm btn-morphic-danger" title="Xóa ca" data-delete-shift="${shift.id}" aria-label="Xóa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
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
  if (h >= 10 && h < 15) return 'Trưa';
  if (h >= 15 && h < 24) return 'Tối';
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
};

const updateWorkplaceInputOptions = (currentVal = '') => {
  const datalist = document.getElementById('workplaceDatalist');
  const chipsContainer = document.getElementById('shiftWorkplaceChips');
  const input = document.getElementById('shiftWorkplace');
  if (input) input.value = currentVal;

  if (datalist) {
    datalist.innerHTML = '';
    const list = Array.isArray(state.settings.workplaces) ? state.settings.workplaces : ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
    list.forEach(wp => {
      const opt = document.createElement('option');
      opt.value = wp;
      datalist.appendChild(opt);
    });
  }

  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    const list = Array.isArray(state.settings.workplaces) ? state.settings.workplaces : ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
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
      });
      chipsContainer.appendChild(chip);
    });
  }
};

const openAddShiftModal = (prefill = null) => {
  const modal = document.getElementById('shiftModal');
  const form = document.getElementById('shiftForm');
  form.reset();

  document.getElementById('shiftModalTitle').textContent = 'Thêm ca làm việc';
  document.getElementById('editShiftId').value = '';

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'none';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  const defaultWp = (state.settings.workplaces && state.settings.workplaces.length > 0) ? state.settings.workplaces[0] : 'Cơm Chin Chin';
  updateWorkplaceInputOptions(defaultWp);

  const now = new Date();
  const currentHour = now.getHours();
  let defaultType = 'Tối';
  let defaultStart = '17:00';
  let defaultEnd = '20:30';

  if (currentHour >= 0 && currentHour < 10) {
    defaultType = 'Sáng';
    defaultStart = '08:00';
    defaultEnd = '12:00';
  } else if (currentHour >= 10 && currentHour < 15) {
    defaultType = 'Trưa';
    defaultStart = '10:00';
    defaultEnd = '13:30';
  } else {
    defaultType = 'Tối';
    defaultStart = '17:00';
    defaultEnd = '20:30';
  }

  const defaultDay = prefill ? prefill.day : getVietnameseDayOfWeek(now);
  if (prefill) {
    defaultStart = prefill.start || defaultStart;
    defaultEnd = prefill.end || defaultEnd;
    defaultType = prefill.type || detectShiftType(defaultStart);
  }
  const defaultNote = prefill ? (prefill.note || '') : '';

  document.getElementById('shiftDay').value = defaultDay;
  document.getElementById('shiftType').value = defaultType;
  document.getElementById('shiftStart').value = defaultStart;
  document.getElementById('shiftEnd').value = defaultEnd;
  const breakInput = document.getElementById('shiftBreak');
  if (breakInput) breakInput.value = '0';
  document.getElementById('shiftNote').value = defaultNote;

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const openEditShiftModal = (shift) => {
  const modal = document.getElementById('shiftModal');
  document.getElementById('shiftModalTitle').textContent = 'Chỉnh sửa ca làm việc';
  document.getElementById('editShiftId').value = shift.id;

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'inline-flex';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  updateWorkplaceInputOptions(shift.workplace || '');

  document.getElementById('shiftDay').value = shift.day;
  document.getElementById('shiftType').value = shift.type;
  document.getElementById('shiftStart').value = shift.start;
  document.getElementById('shiftEnd').value = shift.end;
  const breakInput = document.getElementById('shiftBreak');
  if (breakInput) breakInput.value = shift.breakMinutes || 0;
  document.getElementById('shiftNote').value = shift.note || '';

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const updateModalComputedPreview = () => {
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const breakMins = Number(document.getElementById('shiftBreak')?.value || 0);
  const workplace = (document.getElementById('shiftWorkplace')?.value || '').trim();
  if (!start || !end) return;

  const hours = calculateHoursDiff(start, end, breakMins);
  const week = getCurrentWeek();
  const rate = getShiftRate({ workplace }, week);
  const wage = hours * rate;

  const breakLabel = breakMins > 0 ? ` (nghỉ ${breakMins}m)` : '';
  document.getElementById('previewDuration').textContent = `${hours.toFixed(2)}h${breakLabel}`;
  document.getElementById('previewSalary').textContent = fmtCurrency(wage);
};

const saveShiftFromModal = (e) => {
  e.preventDefault();
  const editId = document.getElementById('editShiftId').value;
  const day = document.getElementById('shiftDay').value;
  const type = document.getElementById('shiftType').value;
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const breakMinutes = Math.max(0, Number(document.getElementById('shiftBreak')?.value || 0));
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
      week.shifts[index] = { ...week.shifts[index], day, type, start, end, breakMinutes, hours, workplace, note };
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
  const newWeekRate = state.settings.defaultRate || 40000;

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
  if (newRate && newRate >= 1000) week.rate = newRate;

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

const switchSummaryTab = (tab) => {
  const btnAnalytics = document.getElementById('tabBtnSummaryAnalytics');
  const btnTable = document.getElementById('tabBtnSummaryTable');
  const paneAnalytics = document.getElementById('summaryTabPaneAnalytics');
  const paneTable = document.getElementById('summaryTabPaneTable');
  if (tab === 'analytics') {
    if (btnAnalytics) btnAnalytics.classList.add('active');
    if (btnTable) btnTable.classList.remove('active');
    if (paneAnalytics) paneAnalytics.style.display = 'flex';
    if (paneTable) paneTable.style.display = 'none';
    renderAnalyticsDashboard();
  } else {
    if (btnTable) btnTable.classList.add('active');
    if (btnAnalytics) btnAnalytics.classList.remove('active');
    if (paneTable) paneTable.style.display = 'flex';
    if (paneAnalytics) paneAnalytics.style.display = 'none';
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
      const wage = Number(s.hours || 0) * getShiftRate(s, w);
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
            salary += Number(s.hours || 0) * getShiftRate(s, curWeek);
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
          salary += Number(s.hours || 0) * getShiftRate(s, w);
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

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);

  const steps = 3;
  ctx.fillStyle = '#94a3b8';
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

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(compactCurrency(p.salary), cx, barY - 6);
    } else {
      ctx.fillStyle = '#e2e8f0';
      drawRoundedBar(ctx, barX, padTop + chartH - 3, barWidth, 3, 2);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(p.label, cx, padTop + chartH + 16);

    if (p.subLabel) {
      ctx.fillStyle = '#94a3b8';
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

  if (data.totalSalary <= 0 || data.workplaceList.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = outerR - innerR;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
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

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(compactCurrency(data.totalSalary), cx, cy + 1);

  ctx.fillStyle = '#64748b';
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
  if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = ['Cơm Chin Chin', 'Cafe', 'Gia sư'];
  if (!state.settings.workplaceRates || typeof state.settings.workplaceRates !== 'object') {
    state.settings.workplaceRates = {};
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
        <input type="number" class="settings-wp-rate-input font-mono" data-wp-name="${escapeHtml(wp)}" value="${customRate}" placeholder="${state.settings.defaultRate || 40000}" step="1000" min="10000" title="Đơn giá riêng (đ/h)">
        <span class="tag font-mono" style="font-size:0.7rem;">đ/h</span>
        <button type="button" class="btn-remove-workplace" data-del-wp="${idx}" title="Xóa nơi làm ${escapeHtml(wp)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
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
      if (val && val >= 1000) {
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
  document.getElementById('settingDefaultRate').value = state.settings.defaultRate;
  renderSettingsWorkplaces();
  document.getElementById('settingsModal').style.display = 'flex';
};

const saveSettingsFromModal = () => {
  const rate = Number(document.getElementById('settingDefaultRate').value);
  if (rate && rate >= 1000) {
    state.settings.defaultRate = rate;
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

  const headerHeight = 44;
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
  ctx.fillText(`BẢNG CHẤM CÔNG — ${week.name.toUpperCase()}`, totalWidth / 2, padTop + 16);

 
  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(new Date().toLocaleDateString('vi-VN'), totalWidth / 2, padTop + 34);

 
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
    const shiftWage = shiftHours * getShiftRate(s, week);
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
    const shiftDate = getShiftDateShort(week, s.day);
    let shiftLabel = shiftDate ? `${s.day} (${shiftDate}) ${s.type}` : `${s.day} ${s.type}`;
    if (s.workplace) shiftLabel += ` • ${s.workplace}`;
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
    const totalSalary = shifts.reduce((acc, s) => acc + (Number(s.hours || 0) * getShiftRate(s, week)), 0);
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
    let initialWeeks = [{ id: 'week-1', name: 'Tuần 1', rate: 40000, shifts: [] }];
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



const openShareSlipModal = () => {
  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('shareSlipModalTitle').textContent = `Phiếu chấm công — ${week.name}`;
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
  csvContent += `Thứ,Ca,Nơi làm việc,Giờ bắt đầu,Giờ kết thúc,Nghỉ (phút),Số giờ,Thành tiền (VNĐ),Ghi chú\r\n`;

  week.shifts.forEach(s => {
    const salary = Number(s.hours || 0) * getShiftRate(s, week);
    csvContent += `"${s.day}","${s.type}","${(s.workplace || '').replace(/"/g, '""')}","${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
  });

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = calculateWeekTotalSalary(week);
  csvContent += `\r\nTỔNG CỘNG,,,"",,,${totalHours.toFixed(2)},${Math.round(totalSalary)},""\r\n`;

  downloadFile(csvContent, `${slugify(week.name)}_salary.csv`, 'text/csv;charset=utf-8;');
  showToast(`Đã xuất file CSV cho ${week.name}`);
};

const exportAllWeeksCSV = () => {
  let csvContent = '\uFEFF';
  csvContent += `TỔNG HỢP CA LÀM VIỆC VÀ LƯƠNG TẤT CẢ CÁC TUẦN\r\n\r\n`;
  csvContent += `Tuần,Khoảng ngày,Đơn giá mặc định (VNĐ/h),Ngày làm,Thứ,Ca,Nơi làm việc,Bắt đầu,Kết thúc,Nghỉ (phút),Số giờ,Thành tiền (VNĐ),Ghi chú\r\n`;

  let grandTotalHours = 0;
  let grandTotalSalary = 0;

  state.weeks.forEach(w => {
    const weekRange = getWeekDateRangeDisplay(w);
    w.shifts.forEach(s => {
      const salary = Number(s.hours || 0) * getShiftRate(s, w);
      const shiftFullDate = getShiftDateFull(w, s.day);
      grandTotalHours += Number(s.hours || 0);
      grandTotalSalary += salary;
      csvContent += `"${w.name}","${weekRange}",${w.rate},"${shiftFullDate}","${s.day}","${s.type}","${(s.workplace || '').replace(/"/g, '""')}","${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
    });
  });

  csvContent += `\r\nTỔNG TOÀN BỘ,,,,,,,,,,${grandTotalHours.toFixed(2)},${Math.round(grandTotalSalary)},""\r\n`;

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
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `shift_salary_backup_${dateStr}.json`, 'application/json');
  showToast('Đã tải file sao lưu JSON');
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

const resetToOriginalExcel = async () => {
  if (confirm('Khôi phục sẽ tải lại dữ liệu từ đám mây Supabase. Bạn có chắc không?')) {
    if (state.currentUser && supabaseClient) {
      const { data } = await supabaseClient
        .from('user_salary_data')
        .select('*')
        .eq('user_id', state.currentUser.id)
        .maybeSingle();

      if (data && Array.isArray(data.weeks) && data.weeks.length > 0) {
        state.weeks = data.weeks;
        state.currentWeekId = state.weeks[state.weeks.length - 1].id;
        saveWeeks();
        closeModal('settingsModal');
        renderApp();
        showToast('Đã đồng bộ lại dữ liệu từ Supabase Cloud!');
        return;
      }
    }
    state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
    state.currentWeekId = state.weeks[0].id;
    saveWeeks();
    closeModal('settingsModal');
    renderApp();
    showToast('Đã khôi phục dữ liệu ban đầu.');
  }
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

 
  const btnNewWeek = document.getElementById('btnNewWeek');
  if (btnNewWeek) btnNewWeek.addEventListener('click', createNewWeek);

  const btnDeleteCurrentWeekBar = document.getElementById('btnDeleteCurrentWeekBar');
  if (btnDeleteCurrentWeekBar) btnDeleteCurrentWeekBar.addEventListener('click', deleteCurrentWeek);

  const btnEditWeekMeta = document.getElementById('btnEditWeekMeta');
  if (btnEditWeekMeta) btnEditWeekMeta.addEventListener('click', openEditWeekModal);

 
  const btnQuickExport = document.getElementById('btnQuickExportWeek');
  if (btnQuickExport) btnQuickExport.addEventListener('click', exportCurrentWeekCSV);

 
  document.getElementById('shiftForm').addEventListener('submit', saveShiftFromModal);
  document.getElementById('shiftStart').addEventListener('input', () => {
    const val = document.getElementById('shiftStart').value;
    if (val) {
      const detected = detectShiftType(val);
      const sel = document.getElementById('shiftType');
      if (sel) sel.value = detected;
    }
    updateModalComputedPreview();
  });
  document.getElementById('shiftEnd').addEventListener('input', updateModalComputedPreview);
  const shiftBreakInput = document.getElementById('shiftBreak');
  if (shiftBreakInput) shiftBreakInput.addEventListener('input', updateModalComputedPreview);
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
      updateModalComputedPreview();
    });
  });

 
  document.getElementById('editWeekForm').addEventListener('submit', saveWeekMeta);
  document.getElementById('btnDeleteCurrentWeek').addEventListener('click', deleteCurrentWeek);

 
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



 
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettingsFromModal);
  document.getElementById('btnBackupJson').addEventListener('click', backupJSON);
  document.getElementById('fileRestoreJson').addEventListener('change', restoreJSON);
  const btnReset = document.getElementById('btnResetToOriginal');
  if (btnReset) {
    btnReset.addEventListener('click', resetToOriginalExcel);
  }
  document.getElementById('btnExportAllExcel').addEventListener('click', exportAllWeeksCSV);



 
  const btnOpenShareSlip = document.getElementById('btnOpenShareSlip');
  if (btnOpenShareSlip) {
    btnOpenShareSlip.addEventListener('click', openShareSlipModal);
  }

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
    navigator.serviceWorker.register('./sw.js?v=20261024v').then((reg) => {
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
            if (Array.isArray(payload.new.weeks)) {
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

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();
  await loadState();
  bindEvents();
  renderApp();
  setupRealtimeSync();
});
