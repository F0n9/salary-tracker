

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
    defaultRate: 40000
  }
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

const calculateHoursDiff = (startStr, endStr) => {
  const startMins = parseTimeToMinutes(startStr);
  let endMins = parseTimeToMinutes(endStr);
  if (endMins < startMins) {
    endMins += 24 * 60;
  }
  const diffMinutes = endMins - startMins;
  return Number((diffMinutes / 60).toFixed(2));
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
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2400);
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
       
        localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
        localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
      } else {
       
        const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
        const cachedSettings = localStorage.getItem(getSettingsStorageKey());
        if (cachedWeeks) {
          state.weeks = JSON.parse(cachedWeeks);
          if (cachedSettings) state.settings = JSON.parse(cachedSettings);
        } else {
          state.weeks = [{ id: 'week-1', name: 'Tuần 1', rate: 40000, shifts: [] }];
          saveWeeks();
        }
      }
    } else {
     
      state.weeks = [];
      state.currentWeekId = null;
    }

    if (state.weeks.length > 0) {
      state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    }
  } catch (err) {
    console.error('Error loading state:', err);
    state.weeks = [{ id: 'week-1', name: 'Tuần 1', rate: 40000, shifts: [] }];
    state.currentWeekId = state.weeks[0].id;
  }
};

let cloudSyncTimer = null;
let gistSyncTimer = null;

const triggerAutoGistSync = () => {
  if (!state.settings || !state.settings.githubToken || !state.settings.gistId) return;
  clearTimeout(gistSyncTimer);
  gistSyncTimer = setTimeout(() => {
    syncWithGitHubGist(true);
  }, 2500);
};

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

  triggerAutoGistSync();
};

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

const renderWeekPills = () => {
  const container = document.getElementById('weekPillsList');
  container.innerHTML = '';

  if (!state.currentUser) {
    const pill = document.createElement('div');
    pill.className = 'week-pill active';
    pill.innerHTML = `
      <div class="pill-name">Chưa đăng nhập</div>
      <div class="pill-sub font-mono">0 đ</div>
    `;
    pill.addEventListener('click', () => {
      openAuthModal('login');
      showToast('Vui lòng đăng nhập để sử dụng');
    });
    container.appendChild(pill);
    return;
  }

  state.weeks.forEach(week => {
    const pill = document.createElement('div');
    pill.className = `week-pill ${week.id === state.currentWeekId ? 'active' : ''}`;
    
    const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
    const totalWage = totalHours * week.rate;

    pill.innerHTML = `
      <div class="pill-name">${week.name}</div>
      <div class="pill-sub font-mono">${fmtCurrency(totalWage)}</div>
    `;

    pill.addEventListener('click', () => {
      state.currentWeekId = week.id;
      renderWeekPills();
      renderWeekDetails();
      renderShiftsList();
    });

    container.appendChild(pill);
  });

  const activePill = container.querySelector('.week-pill.active');
  if (activePill) {
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
};

const renderWeekDetails = () => {
  if (!state.currentUser) {
    document.getElementById('currentWeekTitle').textContent = 'Chưa đăng nhập';
    document.getElementById('currentWeekRateBadge').textContent = '0 đ/h';
    document.getElementById('kpiWeekSalary').textContent = '0 đ';
    document.getElementById('kpiWeekHours').textContent = '0.00 h';
    document.getElementById('kpiWeekHoursDetail').textContent = '0h 00m';
    document.getElementById('kpiShiftCount').textContent = '0 ca';
    document.getElementById('kpiAvgHours').textContent = '0.00 h/ca';
    document.getElementById('shiftsCountBadge').textContent = '0 ca';
    return;
  }

  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('currentWeekTitle').textContent = week.name;
  document.getElementById('currentWeekRateBadge').textContent = `${new Intl.NumberFormat('vi-VN').format(week.rate)} đ/h`;

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = totalHours * week.rate;
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

  if (!state.currentUser) {
    listContainer.innerHTML = `
      <div class="auth-lock-banner">
        <div class="auth-lock-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="auth-lock-title">Yêu cầu đăng nhập</div>
        <p class="auth-lock-desc">Hệ thống yêu cầu đăng nhập để sử dụng. Vui lòng đăng nhập tài khoản để quản lý ca làm việc và xem dữ liệu cá nhân.</p>
        <button type="button" class="btn-morphic btn-morphic-primary btn-morphic-lg" id="btnAuthGateLogin" title="Đăng nhập" aria-label="Đăng nhập" style="margin-top: 0.5rem;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="20" height="20">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
        </button>
      </div>
    `;

    const btnGate = document.getElementById('btnAuthGateLogin');
    if (btnGate) btnGate.addEventListener('click', () => openAuthModal('login'));
    return;
  }

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
        <div class="empty-state-title">Chưa có ca làm việc nào trong ${escapeHtml(week.name)}</div>
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
    
    const shiftEarnings = Number(shift.hours || 0) * week.rate;
    const typeClass = shift.type === 'Trưa' ? 'type-trua' : (shift.type === 'Tối' ? 'type-toi' : (shift.type === 'Sáng' ? 'type-sang' : ''));
    const dayLabel = dayNames[shift.day] || shift.day;

    card.innerHTML = `
      <div class="shift-left">
        <div class="day-badge font-mono ${getDayClass(shift.day)}">
          <span>${shift.day}</span>
        </div>
        <div class="shift-info">
          <div class="shift-title-row">
            <span class="shift-time-range font-mono">${shift.start} – ${shift.end}</span>
            <span class="shift-type-pill ${typeClass}">Ca ${shift.type}</span>
          </div>
          <div class="shift-subtext font-mono">
            <span class="shift-duration-badge">${shift.hours}h • ${hoursToHourMinutes(shift.hours)}</span>
            ${shift.note ? `<span class="shift-note font-sans" title="${escapeHtml(shift.note)}">💬 ${escapeHtml(shift.note)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="shift-right">
        <div class="shift-earnings-wrap">
          <div class="shift-earnings font-mono">${fmtCurrency(shiftEarnings)}</div>
          <div class="shift-hours-label font-mono">lương ca</div>
        </div>
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

const openAddShiftModal = (prefill = null) => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

  const modal = document.getElementById('shiftModal');
  const form = document.getElementById('shiftForm');
  form.reset();

  document.getElementById('shiftModalTitle').textContent = 'Thêm ca làm việc';
  document.getElementById('editShiftId').value = '';

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'none';

  const now = new Date();
  const defaultDay = prefill ? prefill.day : getVietnameseDayOfWeek(now);
  const defaultType = prefill ? prefill.type : 'Tối';
  const defaultStart = prefill ? prefill.start : '17:00';
  const defaultEnd = prefill ? prefill.end : '20:30';
  const defaultNote = prefill ? (prefill.note || '') : '';

  document.getElementById('shiftDay').value = defaultDay;
  document.getElementById('shiftType').value = defaultType;
  document.getElementById('shiftStart').value = defaultStart;
  document.getElementById('shiftEnd').value = defaultEnd;
  document.getElementById('shiftNote').value = defaultNote;

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const openEditShiftModal = (shift) => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

  const modal = document.getElementById('shiftModal');
  document.getElementById('shiftModalTitle').textContent = 'Chỉnh sửa ca làm việc';
  document.getElementById('editShiftId').value = shift.id;

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'inline-flex';

  document.getElementById('shiftDay').value = shift.day;
  document.getElementById('shiftType').value = shift.type;
  document.getElementById('shiftStart').value = shift.start;
  document.getElementById('shiftEnd').value = shift.end;
  document.getElementById('shiftNote').value = shift.note || '';

  updateModalComputedPreview();
  modal.style.display = 'flex';
};

const updateModalComputedPreview = () => {
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  if (!start || !end) return;

  const hours = calculateHoursDiff(start, end);
  const week = getCurrentWeek();
  const rate = week ? week.rate : state.settings.defaultRate;
  const wage = hours * rate;

  document.getElementById('previewDuration').textContent = `${hours.toFixed(2)} giờ (${hoursToHourMinutes(hours)})`;
  document.getElementById('previewSalary').textContent = fmtCurrency(wage);
};

const saveShiftFromModal = (e) => {
  e.preventDefault();
  const editId = document.getElementById('editShiftId').value;
  const day = document.getElementById('shiftDay').value;
  const type = document.getElementById('shiftType').value;
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const note = document.getElementById('shiftNote').value.trim();
  const hours = calculateHoursDiff(start, end);

  const week = getCurrentWeek();
  if (!week) return;

  if (editId) {
    const index = week.shifts.findIndex(s => s.id === editId);
    if (index !== -1) {
      week.shifts[index] = { ...week.shifts[index], day, type, start, end, hours, note };
      showToast('Đã cập nhật ca làm');
    }
  } else {
    const newShift = {
      id: `s-${Date.now()}`,
      day,
      type,
      start,
      end,
      hours,
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

const deleteShift = (shiftId) => {
  const week = getCurrentWeek();
  if (!week) return;

  week.shifts = week.shifts.filter(s => s.id !== shiftId);
  saveWeeks();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();
  showToast('Đã xóa ca làm việc');
};

const createNewWeek = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

  const nextNum = state.weeks.length + 1;
  const newWeekId = `week-${Date.now()}`;
  const newWeekName = `Tuần ${nextNum}`;
  const newWeekRate = state.settings.defaultRate || 40000;

  const newWeek = {
    id: newWeekId,
    name: newWeekName,
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
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('editWeekNameInput').value = week.name;
  document.getElementById('editWeekRateInput').value = week.rate;
  document.getElementById('editWeekModal').style.display = 'flex';
};

const saveWeekMeta = (e) => {
  e.preventDefault();
  const week = getCurrentWeek();
  if (!week) return;

  const newName = document.getElementById('editWeekNameInput').value.trim();
  const newRate = Number(document.getElementById('editWeekRateInput').value);

  if (newName) week.name = newName;
  if (newRate && newRate >= 1000) week.rate = newRate;

  saveWeeks();
  closeModal('editWeekModal');
  renderApp();
  showToast('Đã cập nhật thông tin tuần');
};

const deleteCurrentWeek = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

  const week = getCurrentWeek();
  if (!week) return;

  if (state.weeks.length <= 1) {
    alert('Không thể xóa tuần duy nhất còn lại.');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa "${week.name}" bao gồm ${week.shifts.length} ca làm việc không?`)) {
    state.weeks = state.weeks.filter(w => w.id !== week.id);
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    closeModal('editWeekModal');
    renderApp();
    showToast(`Đã xóa ${week.name}`);
  }
};

const navigateWeek = (direction) => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }

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

const openAllWeeksModal = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }
  let totalHours = 0;
  let totalEarnings = 0;
  let totalShifts = 0;

  const tbody = document.getElementById('allWeeksTableBody');
  tbody.innerHTML = '';

  state.weeks.forEach(week => {
    const weekHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
    const weekEarnings = weekHours * week.rate;
    const weekShifts = week.shifts.length;

    totalHours += weekHours;
    totalEarnings += weekEarnings;
    totalShifts += weekShifts;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(week.name)}</td>
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
        openAllWeeksModal();
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
};

const openSettingsModal = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }
  document.getElementById('settingDefaultRate').value = state.settings.defaultRate;
  if (document.getElementById('settingGithubToken')) {
    document.getElementById('settingGithubToken').value = state.settings.githubToken || '';
  }
  if (document.getElementById('settingGistId')) {
    document.getElementById('settingGistId').value = state.settings.gistId || '';
  }
  document.getElementById('settingsModal').style.display = 'flex';
};

const saveSettingsFromModal = () => {
  const rate = Number(document.getElementById('settingDefaultRate').value);
  if (rate && rate >= 1000) {
    state.settings.defaultRate = rate;
  }
  const token = document.getElementById('settingGithubToken')?.value.trim();
  const gistId = document.getElementById('settingGistId')?.value.trim();
  if (token !== undefined) state.settings.githubToken = token;
  if (gistId !== undefined) state.settings.gistId = gistId;

  saveSettings();
  closeModal('settingsModal');
  showToast('Đã lưu cài đặt');
};

const syncWithGitHubGist = async (isSilent = false) => {
  const token = document.getElementById('settingGithubToken')?.value.trim() || state.settings.githubToken;
  let gistId = document.getElementById('settingGistId')?.value.trim() || state.settings.gistId;
  const statusEl = document.getElementById('gistSyncStatusText');

  if (!token) {
    if (!isSilent) alert('Vui lòng nhập GitHub Personal Access Token (PAT) để đồng bộ.');
    return;
  }

  if (statusEl) statusEl.textContent = 'Đang đồng bộ với GitHub Gist...';

  const payload = {
    description: 'Shift & Salary Tracker Data Backup',
    public: false,
    files: {
      'shift_salary_tracker.json': {
        content: JSON.stringify({
          version: '2.0',
          updatedAt: new Date().toISOString(),
          settings: state.settings,
          weeks: state.weeks
        }, null, 2)
      }
    }
  };

  try {
    let url = 'https://api.github.com/gists';
    let method = 'POST';

    if (gistId) {
      url = `https://api.github.com/gists/${gistId}`;
      method = 'PATCH';
    }

    const res = await fetch(url, {
      method: method,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    state.settings.githubToken = token;
    state.settings.gistId = data.id;
    saveSettings();

    if (document.getElementById('settingGistId')) {
      document.getElementById('settingGistId').value = data.id;
    }

    if (statusEl) {
      statusEl.textContent = `Đồng bộ thành công lúc ${new Date().toLocaleTimeString('vi-VN')} (Gist: ${data.id.slice(0, 8)}...)`;
    }
    if (!isSilent) showToast('Đồng bộ GitHub Gist thành công!');
  } catch (err) {
    console.error('GitHub Gist sync error:', err);
    if (statusEl) statusEl.textContent = `Lỗi đồng bộ: ${err.message}`;
    if (!isSilent) alert(`Không thể đồng bộ GitHub Gist: ${err.message}`);
  }
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
  const totalWidth = includeMoney ? 510 : 420;
  const contentWidth = totalWidth - padX * 2;

  const headerHeight = 44;
  const thHeight = 34;
  const rowHeight = 32;
  const totalRowHeight = 36;
  const footerHeight = 24;

  const totalHeight = padTop + headerHeight + thHeight + (shifts.length * rowHeight) + totalRowHeight + footerHeight;

 
  canvas.width = totalWidth * dpr;
  canvas.height = totalHeight * dpr;
  canvas.style.width = `${totalWidth}px`;
  canvas.style.height = `${totalHeight}px`;

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
    colWidths = [104, 90, 90, 100];
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
    const shiftWage = shiftHours * week.rate;
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
    ctx.fillText(`${s.day} ${s.type}`, colX[0] + 10, curY + 20);

   
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
    const totalSalary = totalHours * week.rate;
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
    await syncWithSupabase(state.weeks);
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
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }
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
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }
  const week = getCurrentWeek();
  if (!week) return;

  let csvContent = '\uFEFF';
  csvContent += `BẢNG CHẤM CÔNG VÀ LƯƠNG — ${week.name}\r\n`;
  csvContent += `Đơn giá: ${week.rate} VNĐ/h\r\n\r\n`;
  csvContent += `Thứ,Ca,Giờ bắt đầu,Giờ kết thúc,Số giờ,Thành tiền (VNĐ),Ghi chú\r\n`;

  week.shifts.forEach(s => {
    const salary = Number(s.hours || 0) * week.rate;
    csvContent += `"${s.day}","${s.type}","${s.start}","${s.end}",${s.hours},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
  });

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = totalHours * week.rate;
  csvContent += `\r\nTỔNG CỘNG,,,"",${totalHours.toFixed(2)},${Math.round(totalSalary)},""\r\n`;

  downloadFile(csvContent, `${slugify(week.name)}_salary.csv`, 'text/csv;charset=utf-8;');
  showToast(`Đã xuất file CSV cho ${week.name}`);
};

const exportAllWeeksCSV = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    showToast('Vui lòng đăng nhập để sử dụng');
    return;
  }
  let csvContent = '\uFEFF';
  csvContent += `TỔNG HỢP CA LÀM VIỆC VÀ LƯƠNG TẤT CẢ CÁC TUẦN\r\n\r\n`;
  csvContent += `Tuần,Đơn giá (VNĐ/h),Thứ,Ca,Bắt đầu,Kết thúc,Số giờ,Thành tiền (VNĐ),Ghi chú\r\n`;

  let grandTotalHours = 0;
  let grandTotalSalary = 0;

  state.weeks.forEach(w => {
    w.shifts.forEach(s => {
      const salary = Number(s.hours || 0) * w.rate;
      grandTotalHours += Number(s.hours || 0);
      grandTotalSalary += salary;
      csvContent += `"${w.name}",${w.rate},"${s.day}","${s.type}","${s.start}","${s.end}",${s.hours},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
    });
  });

  csvContent += `\r\nTỔNG TOÀN BỘ,,,,,,${grandTotalHours.toFixed(2)},${Math.round(grandTotalSalary)},""\r\n`;

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
  document.getElementById('shiftStart').addEventListener('input', updateModalComputedPreview);
  document.getElementById('shiftEnd').addEventListener('input', updateModalComputedPreview);

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
      if (preset === 'noon') {
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
  document.getElementById('btnResetToOriginal').addEventListener('click', resetToOriginalExcel);
  document.getElementById('btnExportAllExcel').addEventListener('click', exportAllWeeksCSV);

 
  const btnSyncGist = document.getElementById('btnSyncGistNow');
  if (btnSyncGist) {
    btnSyncGist.addEventListener('click', () => syncWithGitHubGist(false));
  }

 
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
    dockAllWeeks.addEventListener('click', openAllWeeksModal);
  }

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

 
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js?v=20261024').then((reg) => {
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
