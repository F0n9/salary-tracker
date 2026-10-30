import { state, getCurrentWeek, hasWorkplaces, getDefaultWorkplace, getWorkplaceColor } from './state.js';
import { fmtCurrency, fmtHours, getShiftRate, getShiftEarnings, calculateWeekTotalSalary, hoursToColonFormat, hoursToHourMinutes, getVietnameseDayOfWeek, getMondayDate, getShiftDateObj, getShiftDateShort, getShiftDateFull, getWeekDateRangeDisplay, ensureWeekStartDate, getDayClass, formatShiftType, detectShiftType, escapeHtml, calculateSmartShiftDefaults } from './calculator.js';
import { t, getLocalizedWeekName, getLocalizedShiftType, getLocalizedDayName } from './i18n.js';
import { applyTheme, toggleTheme } from './theme.js';
import { supabaseClient, loadState, saveWeeks, syncWithSupabase, saveSettings, initAuth, updateHeaderAuthUI, updateSyncStatusUI, syncPendingToCloud, handleLoginSubmit, handleRegisterSubmit, handleLogout, handleChangePasswordSubmit, setupRealtimeSync, setupAutoSync, setSupabaseAppRenderer } from './services/supabase.js';
import { showToast, showToastWithAction } from './ui/toast.js';
import { setupCustomSelect, syncCustomSelect, closeAllCustomSelects } from './ui/select.js';
import { drawDashboardWeekChart, setAllWeeksModalOpener, renderAnalyticsDashboard, analyticsState } from './ui/chart.js';
import { renderSlipCanvas, openShareSlipModal, downloadSlipImage, copySlipImageToClipboard } from './ui/canvas-slip.js';
import { exportCurrentWeekCSV, exportAllWeeksCSV, backupJSON, restoreJSON, setExportAppRenderer } from './ui/export.js';
import { closeModal, openAddShiftModal, openEditShiftModal, updateModalComputedPreview, saveShiftFromModal, deleteShift, undoLastDeleteShift, createNewWeek, openEditWeekModal, saveWeekMeta, deleteCurrentWeek, undoLastDeleteWeek, navigateWeek, renderMonthlyReport, switchSummaryTab, openAllWeeksModal, renderSettingsWorkplaces, addWorkplaceFromSetting, openSettingsModal, saveSettingsFromModal, openAuthModal, switchAuthTab, clearAuthErrors, openUserProfileModal, setupPasswordToggles, setModalAppRenderer } from './ui/modals.js';

const updateWheelIndicator = () => {};

function renderApp() {
  renderDateDisplay();
  renderWeekPills();
  renderWeekDetails();
  renderShiftsList();

  const canAct = hasWorkplaces();
  const btnNewWeek = document.getElementById('btnNewWeek');
  if (btnNewWeek) {
    btnNewWeek.classList.toggle('disabled-state', !canAct);
    btnNewWeek.title = canAct ? t('btn_add_week', 'Tạo tuần mới') : t('warn_no_workplace_action', 'Cần thêm nơi làm việc để tiếp tục');
  }
  const dockAddShift = document.getElementById('dockAddShift');
  if (dockAddShift) {
    dockAddShift.classList.toggle('disabled-state', !canAct);
    dockAddShift.title = canAct ? t('dock_add', 'Thêm ca làm việc mới') : t('warn_no_workplace_action', 'Cần thêm nơi làm việc để tiếp tục');
  }
}

setSupabaseAppRenderer(renderApp);
setModalAppRenderer(renderApp);
setExportAppRenderer(renderApp);
setAllWeeksModalOpener(openAllWeeksModal);

const renderDateDisplay = () => {
  const now = new Date();
  const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysVi[now.getDay()];
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
    if (typeof updateWheelIndicator === 'function') updateWheelIndicator();
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
      <span class="wheel-item-name font-mono">${getLocalizedWeekName(week.name)}</span>
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
  const localizedName = getLocalizedWeekName(week.name);

  const titleEl = document.getElementById('currentWeekTitle');
  if (titleEl) {
    const yearMatch = (week.name || '').match(/20\d\d/) || (dateRange || '').match(/20\d\d/);
    const yearStr = yearMatch ? yearMatch[0] : new Date().getFullYear();
    const nameWithoutYear = localizedName.replace(/20\d\d/g, '').replace(/[()]/g, '').trim();
    titleEl.innerHTML = `<span class="period-bold">${nameWithoutYear}</span> <span class="hero-period-year">${yearStr}</span>`;
  }

  const dateRangeEl = document.getElementById('currentWeekDateRange');
  if (dateRangeEl) {
    dateRangeEl.textContent = dateRange ? `${dateRange}` : '';
  }

  const rateBadge = document.getElementById('currentWeekRateBadge');
  if (rateBadge) rateBadge.textContent = `${new Intl.NumberFormat('vi-VN').format(getShiftRate())} đ/h`;

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

  const wpListEl = document.getElementById('kpiWorkplacesList');
  if (wpListEl) {
    const wpHours = {};
    (week.shifts || []).forEach(s => {
      const wp = s.workplace || 'Chung';
      wpHours[wp] = (wpHours[wp] || 0) + Number(s.hours || 0);
    });
    const entries = Object.entries(wpHours).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) {
      wpListEl.innerHTML = entries.slice(0, 3).map(([name, h]) => {
        const col = getWorkplaceColor(name);
        return `<div class="kpi-wp-row"><div class="kpi-wp-left"><span class="kpi-wp-dot" style="background:${col.fill}"></span><span class="kpi-wp-name">${name}</span></div><span class="kpi-wp-hours font-mono">${fmtHours(h)}</span></div>`;
      }).join('');
    } else {
      wpListEl.innerHTML = `<span class="kpi-wp-empty font-mono">Chưa có ca</span>`;
    }
  }

  drawDashboardWeekChart(week);
};

const renderShiftsList = () => {
  const listContainer = document.getElementById('shiftsList');
  listContainer.innerHTML = '';

  const week = getCurrentWeek();

  if (!week || !Array.isArray(week.shifts) || week.shifts.length === 0) {
    const shiftsCountBadge = document.getElementById('shiftsCountBadge');
    if (shiftsCountBadge) shiftsCountBadge.textContent = '0 ca';

    listContainer.innerHTML = `
      <div class="empty-shifts-box">
        <div class="es-icon-ring">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <rect width="18" height="18" x="3" y="4" rx="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
        </div>
        <div class="es-title">${hasWorkplaces() ? t('empty_shifts_title', 'Chưa có ca làm việc nào trong tuần này') : t('no_workplaces_title', 'Chưa có nơi làm việc')}</div>
        <p class="es-desc">${hasWorkplaces() ? t('empty_shifts_desc', 'Thêm ca làm việc mới để bắt đầu theo dõi thu nhập và giờ giấc.') : t('no_workplaces_desc', 'Thêm nơi làm việc trong Cài đặt để bắt đầu tính lương.')}</p>
        <div class="es-actions">
          ${hasWorkplaces() ? `
            <button type="button" class="btn-action-primary" id="btnEmptyAddShift">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <span>${t('btn_add_shift', 'Thêm ca')}</span>
            </button>
          ` : `
            <button type="button" class="btn-action-primary" id="btnEmptyAddWp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="15" height="15">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              <span>${t('btn_add_workplace', 'Thêm nơi làm')}</span>
            </button>
          `}
          <button type="button" class="btn-action-secondary" id="btnEmptyDeleteWeek">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
            <span>${t('btn_delete_week', 'Xóa tuần')}</span>
          </button>
        </div>
      </div>
    `;

    const btnAdd = document.getElementById('btnEmptyAddShift');
    if (btnAdd) btnAdd.addEventListener('click', () => openAddShiftModal());

    const btnWp = document.getElementById('btnEmptyAddWp');
    if (btnWp) btnWp.addEventListener('click', openSettingsModal);

    const btnDel = document.getElementById('btnEmptyDeleteWeek');
    if (btnDel) btnDel.addEventListener('click', deleteCurrentWeek);

    return;
  }

  if (!hasWorkplaces()) {
    const banner = document.createElement('div');
    banner.className = 'no-workplaces-banner font-mono';
    banner.innerHTML = `
      <div class="banner-text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="flex-shrink:0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Chưa có nơi làm việc nào. Thêm nơi làm việc để tiếp tục thêm ca mới.</span>
      </div>
      <button type="button" class="btn-morphic btn-morphic-sm btn-morphic-primary" id="btnBannerAddWp" title="${t('btn_add_workplace', 'Thêm nơi làm việc')}" aria-label="${t('btn_add_workplace', 'Thêm nơi làm việc')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>
      </button>
    `;
    const btnBannerWp = banner.querySelector('#btnBannerAddWp');
    if (btnBannerWp) btnBannerWp.addEventListener('click', openSettingsModal);
    listContainer.appendChild(banner);
  }

  const allShifts = week.shifts;
  const shiftsCountBadge = document.getElementById('shiftsCountBadge');
  if (shiftsCountBadge) shiftsCountBadge.textContent = `${allShifts.length} ${t('unit_shift', 'ca')}`;

  allShifts.forEach((shift) => {
    const card = document.createElement('div');
    card.className = 'shift-ledger-row';
    
    const shiftEarnings = getShiftEarnings(shift, week);
    const displayType = getLocalizedShiftType(shift.type);
    const normType = formatShiftType(shift.type).toLowerCase();
    const typeClass = normType === 'trưa' ? 'type-trua' : (normType === 'tối' ? 'type-toi' : (normType === 'sáng' ? 'type-sang' : ''));
    const dayLabel = getLocalizedDayName(shift.day);
    const shiftDateStr = getShiftDateShort(week, shift.day);
    const breakTag = shift.breakMinutes ? ` • ${t('break_tag', 'nghỉ')} ${shift.breakMinutes}${t('unit_min', 'm')}` : '';

    const otRateVal = Number(shift.otRate) || 1.0;
    const otBadge = otRateVal > 1.0 ? `<span class="shift-ot-badge font-mono">OT x${otRateVal}</span>` : '';
    const allowanceVal = Number(shift.allowance) || 0;
    const allowanceBadge = allowanceVal > 0 ? `<span class="shift-allowance-badge font-mono">+${fmtCurrency(allowanceVal)}</span>` : '';
    const wpCol = getWorkplaceColor(shift.workplace);
    const shiftRate = getShiftRate(shift);

    card.innerHTML = `
      <div class="sl-date-capsule ${getDayClass(shift.day)} font-mono">
        <span class="sl-day-tag">${dayLabel}</span>
        <span class="sl-date-val">${shiftDateStr || '--/--'}</span>
      </div>

      <div class="sl-info-col">
        <div class="sl-primary-line">
          <div class="sl-wp-badge">
            <span class="sl-wp-dot" style="background:${wpCol.fill};"></span>
            <span class="sl-wp-name">${escapeHtml(shift.workplace || 'Chung')}</span>
          </div>
          <span class="sl-type-pill ${typeClass}">${escapeHtml(displayType)}</span>
          ${otBadge}
          ${allowanceBadge}
        </div>

        <div class="sl-meta-line font-mono">
          <div class="sl-meta-item sl-time-item">
            <svg class="sl-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>${shift.start} → ${shift.end}</span>
          </div>
          <span class="sl-bullet">•</span>
          <span class="sl-meta-item sl-hours-item">${shift.hours}h${breakTag}</span>
          ${shift.note ? `
            <span class="sl-bullet">•</span>
            <div class="sl-meta-item sl-note-item font-sans" title="${escapeHtml(shift.note)}">
              <svg class="sl-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="11" height="11">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                <path d="M10 9H8"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
              </svg>
              <span class="sl-note-text">${escapeHtml(shift.note)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="sl-finance-col">
        <div class="sl-earnings-wrap font-mono">
          <span class="sl-earnings-val">+${fmtCurrency(shiftEarnings)}</span>
          <span class="sl-rate-sub">@ ${fmtCurrency(shiftRate)} /h</span>
        </div>

        <div class="sl-actions-wrap">
          <button type="button" class="btn-micro-action btn-edit-shift" title="${t('btn_edit_shift', 'Sửa ca')}" data-edit-shift="${shift.id}" aria-label="${t('btn_edit_shift', 'Sửa')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </button>
          <button type="button" class="btn-micro-action btn-delete-shift" title="${t('btn_delete_shift', 'Xóa ca')}" data-delete-shift="${shift.id}" aria-label="${t('btn_delete_shift', 'Xóa')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
    `;

    card.querySelector(`[data-edit-shift="${shift.id}"]`).addEventListener('click', () => {
      openEditShiftModal(shift);
    });

    card.querySelector(`[data-delete-shift="${shift.id}"]`).addEventListener('click', () => {
      if (confirm(`${t('confirm_delete_shift', 'Bạn có chắc chắn muốn xóa ca làm này không?')} (${getLocalizedDayName(shift.day)} ${getLocalizedShiftType(shift.type)} ${shift.start}-${shift.end})`)) {
        deleteShift(shift.id);
      }
    });

    listContainer.appendChild(card);
  });
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

  const btnToggleTheme = document.getElementById('btnToggleTheme');
  if (btnToggleTheme) {
    btnToggleTheme.addEventListener('click', (e) => {
      toggleTheme(e);
    });
  }

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
        if (confirm(t('confirm_delete_shift', 'Bạn có chắc chắn muốn xóa ca làm việc này không?'))) {
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
  const btnDeleteCurrentWeekInModal = document.getElementById('btnDeleteCurrentWeekInModal');
  if (btnDeleteCurrentWeekInModal) {
    btnDeleteCurrentWeekInModal.addEventListener('click', () => {
      closeModal('editWeekModal');
      deleteCurrentWeek();
    });
  }

 
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

  const btnSyncNow = document.getElementById('btnSyncNow');
  if (btnSyncNow) {
    btnSyncNow.addEventListener('click', () => syncPendingToCloud(true));
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

  const btnHeaderAnalytics = document.getElementById('btnHeaderAnalytics');
  if (btnHeaderAnalytics) {
    btnHeaderAnalytics.addEventListener('click', () => openAllWeeksModal('analytics'));
  }

  const dockAllWeeks = document.getElementById('dockAllWeeks');
  if (dockAllWeeks) {
    dockAllWeeks.addEventListener('click', () => openAllWeeksModal('analytics'));
  }

  const dockAnalytics = document.getElementById('dockAnalytics');
  if (dockAnalytics) {
    dockAnalytics.addEventListener('click', () => openAllWeeksModal('analytics'));
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

  const shiftWpSelect = document.getElementById('shiftWorkplace');
  if (shiftWpSelect) {
    shiftWpSelect.addEventListener('change', updateModalComputedPreview);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
      closeAllCustomSelects();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllCustomSelects();
    }
  });

  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  setupCustomSelect('shiftWorkplace');
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
    const curWeek = getCurrentWeek();
    if (curWeek) {
      drawDashboardWeekChart(curWeek);
    }
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
    window.addEventListener('load', async () => {
      try {
        if (typeof navigator.serviceWorker.getRegistrations === 'function') {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            const scriptURL = (reg.active && reg.active.scriptURL) || (reg.installing && reg.installing.scriptURL) || (reg.waiting && reg.waiting.scriptURL) || '';
            if (scriptURL.includes('?v=')) {
              await reg.unregister();
            }
          }
        }

        const reg = await navigator.serviceWorker.register('./sw.js');
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Salary Tracker: Phiên bản mới đã được lưu vào bộ nhớ đệm.');
              }
            });
          }
        });
      } catch (err) {
        console.warn('Service Worker registration skipped:', err);
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const savedTheme = localStorage.getItem('salary_tracker_theme') || 'light';
  applyTheme(savedTheme, false);

  try {
    localStorage.removeItem('salary_tracker_lang');
  } catch (_) {}

  await initAuth();
  await loadState();
  if (state.settings && state.settings.language) {
    delete state.settings.language;
  }
  bindEvents();
  renderApp();
  setupRealtimeSync();
  setupAutoSync();
});
