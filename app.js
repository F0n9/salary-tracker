/**
 * Shift & Salary Tracker — Application Logic
 * Pure ES6+, Zero-Dependency, Offline-First
 */

// 1. Embedded Seed Data (migrated exactly from Salary.xlsx Weeks 1-8)
const DEFAULT_SEED_DATA = [
  {
    "id": "week-1",
    "name": "Tuần 1",
    "rate": 35000,
    "shifts": [
      { "id": "s-1-1", "day": "T6", "type": "Tối", "start": "17:00", "end": "20:11", "hours": 3.18, "note": "" },
      { "id": "s-1-2", "day": "T7", "type": "Trưa", "start": "10:00", "end": "13:14", "hours": 3.23, "note": "" },
      { "id": "s-1-3", "day": "T7", "type": "Tối", "start": "17:00", "end": "19:48", "hours": 2.8, "note": "" },
      { "id": "s-1-4", "day": "CN", "type": "Tối", "start": "17:00", "end": "20:04", "hours": 3.07, "note": "" }
    ]
  },
  {
    "id": "week-2",
    "name": "Tuần 2",
    "rate": 35000,
    "shifts": [
      { "id": "s-2-1", "day": "T2", "type": "Tối", "start": "17:00", "end": "20:00", "hours": 3.0, "note": "" },
      { "id": "s-2-2", "day": "T3", "type": "Tối", "start": "17:00", "end": "20:00", "hours": 3.0, "note": "" },
      { "id": "s-2-3", "day": "T5", "type": "Tối", "start": "17:00", "end": "20:30", "hours": 3.5, "note": "" },
      { "id": "s-2-4", "day": "T7", "type": "Trưa", "start": "10:00", "end": "13:30", "hours": 3.5, "note": "" },
      { "id": "s-2-5", "day": "T7", "type": "Tối", "start": "17:00", "end": "20:00", "hours": 3.0, "note": "" }
    ]
  },
  {
    "id": "week-3",
    "name": "Tuần 3",
    "rate": 35000,
    "shifts": [
      { "id": "s-3-1", "day": "T2", "type": "Tối", "start": "17:00", "end": "20:15", "hours": 3.25, "note": "" },
      { "id": "s-3-2", "day": "T5", "type": "Trưa", "start": "10:10", "end": "13:10", "hours": 3.0, "note": "" },
      { "id": "s-3-3", "day": "T5", "type": "Tối", "start": "17:00", "end": "20:00", "hours": 3.0, "note": "" },
      { "id": "s-3-4", "day": "T6", "type": "Tối", "start": "17:00", "end": "20:30", "hours": 3.5, "note": "" },
      { "id": "s-3-5", "day": "CN", "type": "Tối", "start": "17:00", "end": "19:49", "hours": 2.82, "note": "" }
    ]
  },
  {
    "id": "week-4",
    "name": "Tuần 4",
    "rate": 35000,
    "shifts": [
      { "id": "s-4-1", "day": "T2", "type": "Tối", "start": "17:00", "end": "19:59", "hours": 2.98, "note": "" },
      { "id": "s-4-2", "day": "T3", "type": "Tối", "start": "17:04", "end": "20:06", "hours": 3.03, "note": "" },
      { "id": "s-4-3", "day": "T4", "type": "Tối", "start": "17:00", "end": "19:53", "hours": 2.88, "note": "" },
      { "id": "s-4-4", "day": "T5", "type": "Trưa", "start": "10:05", "end": "13:44", "hours": 3.65, "note": "" },
      { "id": "s-4-5", "day": "T6", "type": "Trưa", "start": "10:00", "end": "12:54", "hours": 2.9, "note": "" },
      { "id": "s-4-6", "day": "CN", "type": "Tối", "start": "17:00", "end": "20:00", "hours": 3.0, "note": "" }
    ]
  },
  {
    "id": "week-5",
    "name": "Tuần 5",
    "rate": 40000,
    "shifts": [
      { "id": "s-5-1", "day": "T2", "type": "Trưa", "start": "10:00", "end": "13:25", "hours": 3.42, "note": "" },
      { "id": "s-5-2", "day": "T4", "type": "Tối", "start": "18:00", "end": "19:40", "hours": 1.67, "note": "" },
      { "id": "s-5-3", "day": "T5", "type": "Trưa", "start": "10:00", "end": "13:30", "hours": 3.5, "note": "" },
      { "id": "s-5-4", "day": "T5", "type": "Tối", "start": "17:00", "end": "19:24", "hours": 2.4, "note": "" },
      { "id": "s-5-5", "day": "T6", "type": "Tối", "start": "17:00", "end": "19:48", "hours": 2.8, "note": "" }
    ]
  },
  {
    "id": "week-6",
    "name": "Tuần 6",
    "rate": 40000,
    "shifts": [
      { "id": "s-6-1", "day": "T2", "type": "Trưa", "start": "10:00", "end": "13:25", "hours": 3.42, "note": "" },
      { "id": "s-6-2", "day": "T5", "type": "Trưa", "start": "10:00", "end": "13:00", "hours": 3.0, "note": "" },
      { "id": "s-6-3", "day": "T5", "type": "Tối", "start": "17:00", "end": "19:35", "hours": 2.58, "note": "" },
      { "id": "s-6-4", "day": "T6", "type": "Tối", "start": "17:00", "end": "20:15", "hours": 3.25, "note": "" }
    ]
  },
  {
    "id": "week-7",
    "name": "Tuần 7",
    "rate": 40000,
    "shifts": [
      { "id": "s-7-1", "day": "T2", "type": "Trưa", "start": "10:00", "end": "13:00", "hours": 3.0, "note": "" },
      { "id": "s-7-2", "day": "T2", "type": "Tối", "start": "17:00", "end": "19:45", "hours": 2.75, "note": "" },
      { "id": "s-7-3", "day": "T5", "type": "Trưa", "start": "10:00", "end": "12:54", "hours": 2.9, "note": "" },
      { "id": "s-7-4", "day": "T5", "type": "Tối", "start": "17:00", "end": "20:20", "hours": 3.33, "note": "" },
      { "id": "s-7-5", "day": "CN", "type": "Tối", "start": "17:00", "end": "20:10", "hours": 3.17, "note": "" }
    ]
  },
  {
    "id": "week-8",
    "name": "Tuần 8",
    "rate": 40000,
    "shifts": [
      { "id": "s-8-1", "day": "T2", "type": "Trưa", "start": "10:00", "end": "13:19", "hours": 3.32, "note": "" },
      { "id": "s-8-2", "day": "T2", "type": "Tối", "start": "17:05", "end": "20:00", "hours": 2.92, "note": "" }
    ]
  }
];

// Storage Keys
const STORAGE_WEEKS_KEY = 'shift_tracker_weeks_v1';
const STORAGE_SETTINGS_KEY = 'shift_tracker_settings_v1';
const STORAGE_PUNCH_KEY = 'shift_tracker_punch_v1';

// Application State
const state = {
  weeks: [],
  currentWeekId: null,
  settings: {
    defaultRate: 40000
  },
  punchSession: null, // { active: bool, startTime: timestamp, type: string, day: string }
  punchTimerInterval: null
};

// Utilities
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

const minutesToTimeStr = (totalMins) => {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
};

const calculateHoursDiff = (startStr, endStr) => {
  const startMins = parseTimeToMinutes(startStr);
  let endMins = parseTimeToMinutes(endStr);
  if (endMins < startMins) {
    endMins += 24 * 60; // Overnight shift
  }
  const diffMinutes = endMins - startMins;
  return Number((diffMinutes / 60).toFixed(2));
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
  }, 2500);
};

// State Persistence
const loadState = () => {
  try {
    const savedWeeks = localStorage.getItem(STORAGE_WEEKS_KEY);
    if (savedWeeks) {
      state.weeks = JSON.parse(savedWeeks);
    } else {
      state.weeks = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
      saveWeeks();
    }

    const savedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (savedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }

    const savedPunch = localStorage.getItem(STORAGE_PUNCH_KEY);
    if (savedPunch) {
      state.punchSession = JSON.parse(savedPunch);
    }

    // Default current week is the last week in list
    if (state.weeks.length > 0) {
      state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    }
  } catch (err) {
    console.error('Error loading state:', err);
    state.weeks = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
  }
};

const saveWeeks = () => {
  localStorage.setItem(STORAGE_WEEKS_KEY, JSON.stringify(state.weeks));
};

const saveSettings = () => {
  localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(state.settings));
};

const savePunchSession = () => {
  if (state.punchSession) {
    localStorage.setItem(STORAGE_PUNCH_KEY, JSON.stringify(state.punchSession));
  } else {
    localStorage.removeItem(STORAGE_PUNCH_KEY);
  }
};

// Current Week Helper
const getCurrentWeek = () => {
  return state.weeks.find(w => w.id === state.currentWeekId) || state.weeks[0];
};

// Rendering Functions
const renderApp = () => {
  renderDateDisplay();
  renderPunchCard();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();
};

const renderDateDisplay = () => {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[now.getDay()];
  const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  document.getElementById('currentDateDisplay').textContent = `${dayName}, ${dateStr}`;
};

const renderWeekPills = () => {
  const container = document.getElementById('weekPillsList');
  container.innerHTML = '';

  state.weeks.forEach(week => {
    const pill = document.createElement('div');
    pill.className = `week-pill ${week.id === state.currentWeekId ? 'active' : ''}`;
    
    // Calculate week hours for preview
    const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
    const totalWage = totalHours * week.rate;

    pill.innerHTML = `
      <div class="pill-name">${week.name}</div>
      <div class="pill-sub">${fmtCurrency(totalWage)}</div>
    `;

    pill.addEventListener('click', () => {
      state.currentWeekId = week.id;
      renderWeekPills();
      renderWeekDetails();
      renderShiftsList();
    });

    container.appendChild(pill);
  });

  // Auto scroll active pill into view
  const activePill = container.querySelector('.week-pill.active');
  if (activePill) {
    activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
};

const renderWeekDetails = () => {
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
  document.getElementById('kpiAvgHours').textContent = `Trung bình ${avgHours}h / ca`;
  document.getElementById('shiftsCountBadge').textContent = `${shiftCount} ca`;
};

const renderShiftsList = () => {
  const week = getCurrentWeek();
  const listContainer = document.getElementById('shiftsList');
  listContainer.innerHTML = '';

  if (!week || week.shifts.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="empty-state-title">Chưa có ca làm việc nào trong ${week.name}</div>
        <p class="empty-state-desc">Bấm nút "Thêm ca" hoặc bật đồng hồ bấm giờ để bắt đầu ghi lại ca làm việc của bạn.</p>
        <button class="btn btn-primary btn-sm" onclick="document.getElementById('btnOpenAddShift').click()">
          + Thêm ca đầu tiên
        </button>
      </div>
    `;
    return;
  }

  week.shifts.forEach((shift) => {
    const card = document.createElement('div');
    card.className = 'shift-card';
    
    const shiftEarnings = Number(shift.hours || 0) * week.rate;
    const typeClass = shift.type === 'Trưa' ? 'type-trua' : (shift.type === 'Tối' ? 'type-toi' : '');

    card.innerHTML = `
      <div class="shift-left">
        <div class="day-badge ${getDayClass(shift.day)}">
          <span>${shift.day}</span>
        </div>
        <div class="shift-info">
          <div class="shift-title-row">
            <span class="shift-type-pill ${typeClass}">${shift.type}</span>
            <span class="shift-time-range">${shift.start} → ${shift.end}</span>
          </div>
          <div class="shift-subtext">
            <span>${shift.hours}h (${hoursToHourMinutes(shift.hours)})</span>
            ${shift.note ? `<span class="shift-note">• ${escapeHtml(shift.note)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="shift-right">
        <div class="shift-earnings-wrap">
          <div class="shift-earnings font-mono">${fmtCurrency(shiftEarnings)}</div>
          <div class="shift-hours-label">lương ca</div>
        </div>
        <div class="shift-card-actions">
          <button class="btn-action-icon" title="Chỉnh sửa ca" data-edit-shift="${shift.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="btn-action-icon danger" title="Xóa ca" data-delete-shift="${shift.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Action handlers
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

// Live Punch Timer Logic
const renderPunchCard = () => {
  const idleStateEl = document.getElementById('punchIdleState');
  const activeStateEl = document.getElementById('punchActiveState');

  if (state.punchSession && state.punchSession.active) {
    idleStateEl.style.display = 'none';
    activeStateEl.style.display = 'flex';

    document.getElementById('punchActiveType').textContent = state.punchSession.type || 'Trưa';
    const startDate = new Date(state.punchSession.startTime);
    document.getElementById('punchStartTimeDisplay').textContent = 
      `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

    startPunchTicker();
  } else {
    idleStateEl.style.display = 'flex';
    activeStateEl.style.display = 'none';
    stopPunchTicker();
  }
};

const startPunchTicker = () => {
  stopPunchTicker();
  updatePunchMetrics();
  state.punchTimerInterval = setInterval(updatePunchMetrics, 1000);
};

const stopPunchTicker = () => {
  if (state.punchTimerInterval) {
    clearInterval(state.punchTimerInterval);
    state.punchTimerInterval = null;
  }
};

const updatePunchMetrics = () => {
  if (!state.punchSession || !state.punchSession.active) return;

  const now = Date.now();
  const elapsedMs = Math.max(0, now - state.punchSession.startTime);
  const totalSeconds = Math.floor(elapsedMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  document.getElementById('punchElapsedTime').textContent = timeStr;

  const week = getCurrentWeek();
  const rate = week ? week.rate : state.settings.defaultRate;
  const hoursFraction = totalSeconds / 3600;
  const estimatedWage = hoursFraction * rate;

  document.getElementById('punchEstimatedWage').textContent = fmtCurrency(estimatedWage);
};

// Start Punch In
const startPunch = (type = 'Tối') => {
  state.punchSession = {
    active: true,
    startTime: Date.now(),
    type: type,
    day: getVietnameseDayOfWeek()
  };
  savePunchSession();
  renderPunchCard();
  showToast(`Đã bắt đầu tính giờ ca ${type}`);
};

// Stop Punch In
const stopPunch = () => {
  if (!state.punchSession) return;

  const startTime = new Date(state.punchSession.startTime);
  const endTime = new Date();
  const type = state.punchSession.type;
  const day = state.punchSession.day || getVietnameseDayOfWeek(startTime);

  const startStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
  const endStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

  // Reset punch session
  state.punchSession = null;
  savePunchSession();
  renderPunchCard();

  // Open modal with pre-filled punch data for final confirmation & save
  openAddShiftModal({
    day: day,
    type: type,
    start: startStr,
    end: endStr,
    note: 'Bấm giờ trực tiếp'
  });
};

// Shift Actions (Add / Edit / Delete)
const openAddShiftModal = (prefill = null) => {
  const modal = document.getElementById('shiftModal');
  const form = document.getElementById('shiftForm');
  form.reset();

  document.getElementById('shiftModalTitle').textContent = 'Thêm ca làm việc';
  document.getElementById('editShiftId').value = '';

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
  const modal = document.getElementById('shiftModal');
  document.getElementById('shiftModalTitle').textContent = 'Chỉnh sửa ca làm việc';
  document.getElementById('editShiftId').value = shift.id;

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
    // Update existing shift
    const index = week.shifts.findIndex(s => s.id === editId);
    if (index !== -1) {
      week.shifts[index] = { ...week.shifts[index], day, type, start, end, hours, note };
      showToast('Đã cập nhật ca làm việc');
    }
  } else {
    // Add new shift
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

// Week Actions (New, Edit, Prev/Next, Delete)
const createNewWeek = () => {
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
  const week = getCurrentWeek();
  if (!week) return;

  if (state.weeks.length <= 1) {
    alert('Không thể xóa tuần duy nhất còn lại.');
    return;
  }

  if (confirm(`Bạn có chắc chắn muốn xóa toàn bộ "${week.name}" bao gồm ${week.shifts.length} ca làm việc không?`)) {
    state.weeks = state.weeks.filter(w => w.id !== week.id);
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    closeModal('editWeekModal');
    renderApp();
    showToast(`Đã xóa ${week.name}`);
  }
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

// All-time Summary Modal
const openAllWeeksModal = () => {
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
      <td>${week.name}</td>
      <td>${fmtCurrency(week.rate)}/h</td>
      <td>${weekShifts} ca</td>
      <td>${weekHours.toFixed(2)} h</td>
      <td class="text-emerald">${fmtCurrency(weekEarnings)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" data-jump-week="${week.id}">Xem</button>
      </td>
    `;

    tr.querySelector(`[data-jump-week="${week.id}"]`).addEventListener('click', () => {
      state.currentWeekId = week.id;
      closeModal('allWeeksModal');
      renderApp();
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

// Settings Modal
const openSettingsModal = () => {
  document.getElementById('settingDefaultRate').value = state.settings.defaultRate;
  document.getElementById('settingsModal').style.display = 'flex';
};

const saveSettingsFromModal = () => {
  const rate = Number(document.getElementById('settingDefaultRate').value);
  if (rate && rate >= 1000) {
    state.settings.defaultRate = rate;
    saveSettings();
    closeModal('settingsModal');
    showToast('Đã lưu cài đặt');
  }
};

// Export to CSV / Excel
const exportCurrentWeekCSV = () => {
  const week = getCurrentWeek();
  if (!week) return;

  let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
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
    version: '1.0',
    exportDate: new Date().toISOString(),
    settings: state.settings,
    weeks: state.weeks
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `shift_tracker_backup_${dateStr}.json`, 'application/json');
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
        alert('File JSON không hợp lệ hoặc thiếu dữ liệu các tuần.');
      }
    } catch (err) {
      alert('Không thể đọc file: ' + err.message);
    }
  };
  reader.readAsText(file);
};

const resetToOriginalExcel = () => {
  if (confirm('Khôi phục sẽ đưa dữ liệu về đúng 8 tuần ban đầu từ Salary.xlsx. Bạn có chắc không?')) {
    state.weeks = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    closeModal('settingsModal');
    renderApp();
    showToast('Đã khôi phục dữ liệu gốc từ Salary.xlsx');
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

// Event Listeners Binding
const bindEvents = () => {
  // Modal Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close-modal');
      closeModal(modalId);
    });
  });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Header Buttons
  document.getElementById('btnAllWeeks').addEventListener('click', openAllWeeksModal);
  document.getElementById('btnSettings').addEventListener('click', openSettingsModal);
  document.getElementById('btnOpenAddShift').addEventListener('click', () => openAddShiftModal());

  // Punch actions
  document.getElementById('btnStartPunch').addEventListener('click', () => {
    const activeChip = document.querySelector('.chip.active, .btn-chip.active');
    const preset = activeChip ? activeChip.getAttribute('data-preset-type') : 'Tối';
    startPunch(preset);
  });
  document.getElementById('btnStopPunch').addEventListener('click', stopPunch);

  // Punch preset chips
  document.querySelectorAll('.chip, .btn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip, .btn-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Week navigation
  document.getElementById('btnPrevWeek').addEventListener('click', () => navigateWeek(-1));
  document.getElementById('btnNextWeek').addEventListener('click', () => navigateWeek(1));
  document.getElementById('btnNewWeek').addEventListener('click', createNewWeek);
  document.getElementById('btnEditWeekMeta').addEventListener('click', openEditWeekModal);

  // Quick export button on section
  document.getElementById('btnQuickExportWeek').addEventListener('click', exportCurrentWeekCSV);

  // Shift Modal Form
  document.getElementById('shiftForm').addEventListener('submit', saveShiftFromModal);
  document.getElementById('shiftStart').addEventListener('input', updateModalComputedPreview);
  document.getElementById('shiftEnd').addEventListener('input', updateModalComputedPreview);

  // Preset buttons in Shift Modal
  document.querySelectorAll('.btn-preset').forEach(btn => {
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

  // Edit Week Form
  document.getElementById('editWeekForm').addEventListener('submit', saveWeekMeta);
  document.getElementById('btnDeleteCurrentWeek').addEventListener('click', deleteCurrentWeek);

  // Settings Actions
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettingsFromModal);
  document.getElementById('btnBackupJson').addEventListener('click', backupJSON);
  document.getElementById('fileRestoreJson').addEventListener('change', restoreJSON);
  document.getElementById('btnResetToOriginal').addEventListener('click', resetToOriginalExcel);
  document.getElementById('btnExportAllExcel').addEventListener('click', exportAllWeeksCSV);

  // PWA Service Worker Registration
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      console.log('ShiftTracker Service Worker active.');
    }).catch(err => {
      console.warn('Service Worker registration skipped:', err);
    });
  }
};

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  bindEvents();
  renderApp();
});
