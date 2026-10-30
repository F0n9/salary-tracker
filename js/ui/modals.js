import { state, getCurrentWeek, hasWorkplaces, getDefaultWorkplace, getWorkplaceColor, normalizeWorkplacesAndRates } from '../state.js';
import { fmtCurrency, fmtHours, parseTimeToMinutes, calculateHoursDiff, getShiftRate, getShiftEarnings, calculateSmartShiftDefaults, detectShiftType, getVietnameseDayOfWeek, getMondayDate, getShiftDateObj, getShiftDateShort, getWeekDateRangeDisplay, ensureWeekStartDate, getDayClass, escapeHtml, calculateWeekTotalSalary } from '../calculator.js';
import { t, getLocalizedWeekName, getLocalizedShiftType, getLocalizedDayName, formatShiftType } from '../i18n.js';
import { saveWeeks, saveSettings, updateSyncStatusUI } from '../services/supabase.js';
import { showToast, showToastWithAction } from './toast.js';
import { setupCustomSelect, syncCustomSelect } from './select.js';
import { renderAnalyticsDashboard } from './chart.js';
import { EYE_OPEN_SVG, EYE_OFF_SVG } from '../config.js';

let appRenderer = null;
export const setModalAppRenderer = (fn) => {
  appRenderer = fn;
};
const triggerAppRender = () => {
  if (typeof appRenderer === 'function') appRenderer();
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
    opt.textContent = dateStr ? `${getLocalizedDayName(day)} (${dateStr})` : getLocalizedDayName(day);
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

const updateWorkplaceInputOptions = (currentVal = '') => {
  const select = document.getElementById('shiftWorkplace');
  if (!select) return;

  const list = getUniqueWorkplacesList();
  const defaultWp = getDefaultWorkplace();
  const targetVal = (currentVal && list.includes(currentVal))
    ? currentVal
    : (defaultWp && list.includes(defaultWp) ? defaultWp : (list[0] || ''));

  select.innerHTML = '';
  list.forEach(wp => {
    const opt = document.createElement('option');
    opt.value = wp;
    opt.textContent = wp;
    if (wp === targetVal) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });

  if (targetVal) {
    select.value = targetVal;
  }

  setupCustomSelect('shiftWorkplace');
  syncCustomSelect('shiftWorkplace');
};

export const openAddShiftModal = (prefill = null) => {
  if (!hasWorkplaces()) {
    showToast(t('warn_no_workplace', 'Vui lòng thêm nơi làm việc trong Cài đặt trước!'));
    openSettingsModal();
    return;
  }

  const modal = document.getElementById('shiftModal');
  const form = document.getElementById('shiftForm');
  form.reset();

  document.getElementById('shiftModalTitle').textContent = t('modal_add_shift', 'Thêm ca làm việc');
  const shiftSubAdd = document.getElementById('shiftModalSubtitle');
  if (shiftSubAdd) shiftSubAdd.textContent = 'Thông tin thời gian & địa điểm làm việc';
  document.getElementById('editShiftId').value = '';

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'none';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  const defaultWp = getDefaultWorkplace();
  updateWorkplaceInputOptions(defaultWp);

  const smartDefaults = calculateSmartShiftDefaults(prefill, new Date());

  document.getElementById('shiftDay').value = smartDefaults.day;
  document.getElementById('shiftType').value = smartDefaults.type;
  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  setupCustomSelect('shiftWorkplace');
  syncCustomSelect('shiftDay');
  syncCustomSelect('shiftType');
  syncCustomSelect('shiftWorkplace');

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

export const openEditShiftModal = (shift) => {
  const modal = document.getElementById('shiftModal');
  document.getElementById('shiftModalTitle').textContent = t('modal_edit_shift', 'Chỉnh sửa ca làm việc');
  const shiftSubEdit = document.getElementById('shiftModalSubtitle');
  if (shiftSubEdit) shiftSubEdit.textContent = 'Cập nhật thời gian & phụ cấp';
  document.getElementById('editShiftId').value = shift.id;

  const btnDel = document.getElementById('btnDeleteShiftModal');
  if (btnDel) btnDel.style.display = 'inline-flex';

  const week = getCurrentWeek();
  updateShiftDayOptions(week);
  updateWorkplaceInputOptions(shift.workplace || '');

  document.getElementById('shiftDay').value = shift.day;
  document.getElementById('shiftType').value = shift.type;
  setupCustomSelect('shiftDay');
  setupCustomSelect('shiftType');
  setupCustomSelect('shiftOtRate');
  setupCustomSelect('shiftWorkplace');
  syncCustomSelect('shiftDay');
  syncCustomSelect('shiftType');
  syncCustomSelect('shiftWorkplace');

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

export const updateModalComputedPreview = () => {
  const start = document.getElementById('shiftStart').value;
  const end = document.getElementById('shiftEnd').value;
  const breakMins = Number(document.getElementById('shiftBreak')?.value || 0);
  const otRate = Number(document.getElementById('shiftOtRate')?.value || 1.0);
  const allowance = Number(document.getElementById('shiftAllowance')?.value || 0);
  const workplace = (document.getElementById('shiftWorkplace')?.value || '').trim();
  if (!start || !end) return;

  const hours = calculateHoursDiff(start, end, breakMins);
  const rate = getShiftRate({ workplace });
  const wage = Math.round(hours * rate * otRate + allowance);

  const breakLabel = breakMins > 0 ? ` (${t('break_tag', 'nghỉ')} ${breakMins}${t('unit_min', 'm')})` : '';
  const otLabel = otRate > 1 ? ` • x${otRate}` : '';
  document.getElementById('previewDuration').textContent = `${hours.toFixed(2)}h${breakLabel}${otLabel}`;
  document.getElementById('previewSalary').textContent = fmtCurrency(wage);
};

export const saveShiftFromModal = (e) => {
  e.preventDefault();
  if (!hasWorkplaces()) {
    showToast(t('warn_no_workplace', 'Vui lòng thêm nơi làm việc trong Cài đặt trước!'));
    openSettingsModal();
    return;
  }

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
    const overlapPattern = t('confirm_shift_overlap');
    const confirmMsg = overlapPattern
      ? overlapPattern.replace('{start}', start)
          .replace('{end}', end)
          .replace('{type}', getLocalizedShiftType(overlappingShift.type))
          .replace('{oStart}', overlappingShift.start)
          .replace('{oEnd}', overlappingShift.end)
          .replace('{day}', getLocalizedDayName(day))
      : `CẢNH BÁO TRÙNG GIỜ:\nCa làm này (${start} – ${end}) bị đè thời gian lên ca "${overlappingShift.type}" (${overlappingShift.start} – ${overlappingShift.end}) của cùng ngày ${day}.\n\nBạn có chắc chắn vẫn muốn lưu không?`;
    const confirmSave = confirm(confirmMsg);
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
      showToast(t('toast_shift_updated', 'Đã cập nhật ca làm'));
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
  triggerAppRender();
};

let lastDeletedShiftRecord = null;

export const deleteShift = (shiftId) => {
  const week = getCurrentWeek();
  if (!week) return;

  const shiftIndex = week.shifts.findIndex(s => s.id === shiftId);
  if (shiftIndex === -1) return;
  const removedShift = week.shifts[shiftIndex];

  week.shifts.splice(shiftIndex, 1);
  saveWeeks();
  triggerAppRender();

  lastDeletedShiftRecord = {
    weekId: week.id,
    shift: removedShift,
    index: shiftIndex
  };

  const delMsg = `${t('toast_shift_deleted', 'Đã xóa ca')} ${getLocalizedDayName(removedShift.day)} (${getLocalizedShiftType(removedShift.type)})`;
  showToastWithAction(delMsg, t('btn_undo', 'Hoàn tác'), () => {
    undoLastDeleteShift();
  }, 8000);
};

export const undoLastDeleteShift = () => {
  if (!lastDeletedShiftRecord) return;
  const { weekId, shift, index } = lastDeletedShiftRecord;
  const targetWeek = state.weeks.find(w => w.id === weekId);
  if (!targetWeek) {
    showToast(t('toast_cannot_restore_week', 'Không tìm thấy tuần để khôi phục'));
    return;
  }
  if (typeof index === 'number' && index >= 0 && index <= targetWeek.shifts.length) {
    targetWeek.shifts.splice(index, 0, shift);
  } else {
    targetWeek.shifts.push(shift);
  }
  lastDeletedShiftRecord = null;
  saveWeeks();
  triggerAppRender();
  showToast(`${t('toast_shift_restored', 'Đã khôi phục ca làm việc!')} ${getLocalizedDayName(shift.day)} (${getLocalizedShiftType(shift.type)})`);
};

export const createNewWeek = () => {
  if (!hasWorkplaces()) {
    showToast(t('warn_no_workplace', 'Vui lòng thêm nơi làm việc trong Cài đặt trước!'));
    openSettingsModal();
    return;
  }

  const nextNum = state.weeks.length + 1;
  const newWeekId = `week-${Date.now()}`;
  const newWeekName = `Tuần ${nextNum}`;

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
    shifts: []
  };

  state.weeks.push(newWeek);
  state.currentWeekId = newWeekId;
  saveWeeks();
  triggerAppRender();
  showToast(`Đã tạo ${newWeekName}`);
};

export const openEditWeekModal = () => {
  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('editWeekNameInput').value = week.name;
  document.getElementById('editWeekStartDateInput').value = week.startDate || getMondayDate(new Date());
  const editRateInput = document.getElementById('editWeekRateInput');
  if (editRateInput) editRateInput.value = week.rate || 0;
  document.getElementById('editWeekModal').style.display = 'flex';
};

export const saveWeekMeta = (e) => {
  e.preventDefault();
  const week = getCurrentWeek();
  if (!week) return;

  const newName = document.getElementById('editWeekNameInput').value.trim();
  const newStartDate = document.getElementById('editWeekStartDateInput').value;
  const editRateInput = document.getElementById('editWeekRateInput');
  if (editRateInput) {
    const newRate = Number(editRateInput.value);
    if (!isNaN(newRate) && newRate >= 0) week.rate = newRate;
  }

  if (newName) week.name = newName;
  if (newStartDate) week.startDate = newStartDate;

  saveWeeks();
  closeModal('editWeekModal');
  triggerAppRender();
  showToast('Đã cập nhật thông tin tuần');
};

let lastDeletedWeekRecord = null;

export const deleteCurrentWeek = () => {
  const week = getCurrentWeek();
  if (!week) return;

  if (state.weeks.length <= 1) {
    alert(t('alert_cannot_delete_only_week', 'Không thể xóa tuần duy nhất còn lại.'));
    return;
  }

  const delWeekMsg = t('confirm_delete_week_named')
    ? t('confirm_delete_week_named').replace('{name}', getLocalizedWeekName(week.name)).replace('{count}', week.shifts.length)
    : `Bạn có chắc chắn muốn xóa "${getLocalizedWeekName(week.name)}" bao gồm ${week.shifts.length} ca làm việc không?`;
  if (confirm(delWeekMsg)) {
    const weekIndex = state.weeks.findIndex(w => w.id === week.id);
    const removedWeek = { ...week, shifts: [...week.shifts] };

    state.weeks = state.weeks.filter(w => w.id !== week.id);
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    closeModal('editWeekModal');
    triggerAppRender();

    lastDeletedWeekRecord = {
      week: removedWeek,
      index: weekIndex
    };

    showToastWithAction(`${t('toast_week_deleted', 'Đã xóa')} ${getLocalizedWeekName(removedWeek.name)}`, t('btn_undo', 'Hoàn tác'), () => {
      undoLastDeleteWeek();
    }, 8000);
  }
};

export const undoLastDeleteWeek = () => {
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
  triggerAppRender();
  showToast(`Đã khôi phục ${week.name}!`);
};

export const navigateWeek = (direction) => {
  const currentIndex = state.weeks.findIndex(w => w.id === state.currentWeekId);
  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < state.weeks.length) {
    state.currentWeekId = state.weeks[nextIndex].id;
    triggerAppRender();
  }
};

export const renderMonthlyReport = () => {
  const container = document.getElementById('monthlyReportsContainer');
  if (!container) return;
  container.innerHTML = '';

  const monthMap = {};

  state.weeks.forEach(week => {
    (week.shifts || []).forEach(shift => {
      const dObj = getShiftDateObj(week, shift.day);
      const mKey = dObj ? dObj.monthKey : 'unknown';
      let mLabel = '';
      if (dObj) {
        mLabel = `Tháng ${String(dObj.month).padStart(2, '0')}/${dObj.year}`;
      } else {
        mLabel = 'Không rõ thời gian';
      }

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
        <div class="empty-state-title font-sans">${t('empty_month_title', 'Chưa có dữ liệu theo tháng')}</div>
        <p class="empty-state-desc font-sans">${t('empty_month_desc', 'Hãy thêm ca làm việc vào các tuần để hệ thống tự động tổng hợp báo cáo tháng cho bạn.')}</p>
      </div>
    `;
    return;
  }

  monthKeys.forEach(mKey => {
    const data = monthMap[mKey];
    const card = document.createElement('div');
    card.className = 'monthly-report-card';

    const wpList = Object.values(data.workplaces).sort((a, b) => b.earnings - a.earnings);
    const avgEarnings = data.shiftCount > 0 ? Math.round(data.totalEarnings / data.shiftCount) : 0;
    const avgHours = data.shiftCount > 0 ? (data.totalHours / data.shiftCount).toFixed(1) : '0';

    let wpBreakdownHtml = '';
    if (wpList.length > 0) {
      wpBreakdownHtml = `
        <div class="monthly-workplaces-section">
          <div class="monthly-wp-title font-sans">${t('lbl_month_dist', 'Phân bổ thu nhập trong tháng')}</div>
          <div class="workplace-breakdown-list">
            ${wpList.map(wp => {
              const col = getWorkplaceColor(wp.name);
              const percent = data.totalEarnings > 0 ? Math.round((wp.earnings / data.totalEarnings) * 100) : 0;
              return `
                <div class="wb-item">
                  <div class="wb-header">
                    <div class="wb-name-group font-sans">
                      <span class="wb-color-dot" style="background:${col.fill};"></span>
                      <span>${escapeHtml(wp.name)}</span>
                      <span class="font-mono" style="font-size:0.7rem;color:var(--text-dim);font-weight:400;">(${percent}%)</span>
                    </div>
                    <span class="wb-amount font-mono">${fmtCurrency(wp.earnings)}</span>
                  </div>
                  <div class="wb-bar-track">
                    <div class="wb-bar-fill" style="width:${percent}%;background:${col.fill};"></div>
                  </div>
                  <div class="wb-sub font-mono">${wp.count} ca • ${wp.hours.toFixed(2)}h</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="monthly-card-header">
        <div class="monthly-header-title">
          <span class="monthly-title-text font-sans">${data.label}</span>
        </div>
        <span class="monthly-badge-pill font-mono">${data.shiftCount} ${t('unit_shift', 'ca')} • ${fmtHours(data.totalHours)}</span>
      </div>

      <div class="monthly-kpis-grid">
        <div class="stat-kpi-card stat-kpi-primary">
          <span class="sk-label font-sans">${t('lbl_month_income', 'Thu nhập tháng')}</span>
          <span class="sk-val font-mono">+${fmtCurrency(data.totalEarnings)}</span>
          <span class="sk-meta font-mono">TB ${fmtCurrency(avgEarnings)} / ca</span>
        </div>
        <div class="stat-kpi-card">
          <span class="sk-label font-sans">${t('lbl_month_hours', 'Tổng thời gian')}</span>
          <span class="sk-val font-mono">${fmtHours(data.totalHours)}</span>
          <span class="sk-meta font-mono">TB ${avgHours}h / ca</span>
        </div>
        <div class="stat-kpi-card">
          <span class="sk-label font-sans">${t('lbl_month_workplaces', 'Số ca & Cơ sở')}</span>
          <span class="sk-val font-mono">${data.shiftCount} <span style="font-size:0.8rem;font-weight:500;">ca</span></span>
          <span class="sk-meta font-sans">${wpList.length} ${t('unit_workplaces', 'nơi')}</span>
        </div>
      </div>

      ${wpBreakdownHtml}
    `;

    container.appendChild(card);
  });
};

export const switchSummaryTab = (tab) => {
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

export const openAllWeeksModal = (initialTab = 'analytics') => {
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

    const isCurrent = state.currentWeekId === week.id;
    const dateRange = getWeekDateRangeDisplay(week);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="table-week-cell">
          <span class="table-week-title">${escapeHtml(week.name)}</span>
          ${dateRange ? `<span class="table-week-dates font-mono">${dateRange}</span>` : ''}
        </div>
      </td>
      <td>${weekShifts} ca</td>
      <td>${weekHours.toFixed(2)} h</td>
      <td class="text-bold-dark">${fmtCurrency(weekEarnings)}</td>
      <td>
        <div class="table-actions">
          ${isCurrent ? `
            <button type="button" class="btn-table-action btn-table-current" disabled title="${t('week_currently_selected', 'Tuần đang chọn')}" aria-label="${t('week_currently_selected', 'Tuần đang chọn')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          ` : `
            <button type="button" class="btn-table-action btn-table-view" data-jump-week="${week.id}" title="${t('view_this_week', 'Xem tuần này')}" aria-label="${t('view_this_week', 'Xem tuần này')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="14" height="14">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          `}
          <button type="button" class="btn-table-action btn-table-delete" data-delete-week="${week.id}" title="${t('btn_delete_week', 'Xóa tuần')} ${escapeHtml(getLocalizedWeekName(week.name))}" aria-label="${t('btn_delete_week', 'Xóa tuần')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" width="13" height="13">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    const btnJump = tr.querySelector(`[data-jump-week="${week.id}"]`);
    if (btnJump) {
      btnJump.addEventListener('click', () => {
        state.currentWeekId = week.id;
        closeModal('allWeeksModal');
        triggerAppRender();
      });
    }

    tr.querySelector(`[data-delete-week="${week.id}"]`).addEventListener('click', () => {
      if (state.weeks.length <= 1) {
        alert(t('alert_cannot_delete_only_week', 'Không thể xóa tuần duy nhất còn lại.'));
        return;
      }
      const delWeekMsg = t('confirm_delete_week_named')
    ? t('confirm_delete_week_named').replace('{name}', getLocalizedWeekName(week.name)).replace('{count}', week.shifts.length)
    : `Bạn có chắc chắn muốn xóa "${getLocalizedWeekName(week.name)}" bao gồm ${week.shifts.length} ca làm việc không?`;
  if (confirm(delWeekMsg)) {
        state.weeks = state.weeks.filter(w => w.id !== week.id);
        if (state.currentWeekId === week.id) {
          state.currentWeekId = state.weeks[state.weeks.length - 1].id;
        }
        saveWeeks();
        triggerAppRender();
        openAllWeeksModal('table');
        showToast(`Đã xóa ${week.name}`);
      }
    });

    tbody.appendChild(tr);
  });

  const elTotalEarnings = document.getElementById('allTimeTotalEarnings');
  if (elTotalEarnings) elTotalEarnings.textContent = fmtCurrency(totalEarnings);
  const elTotalHours = document.getElementById('allTimeTotalHours');
  if (elTotalHours) elTotalHours.textContent = fmtHours(totalHours);
  const elTotalShifts = document.getElementById('allTimeTotalShifts');
  if (elTotalShifts) elTotalShifts.textContent = `${totalShifts} ${t('unit_shift', 'ca')}`;
  const elAvgWeek = document.getElementById('allTimeAvgWeekEarnings');
  if (elAvgWeek) elAvgWeek.textContent = fmtCurrency(state.weeks.length > 0 ? totalEarnings / state.weeks.length : 0);

  document.getElementById('allWeeksModal').style.display = 'flex';
  switchSummaryTab(initialTab);
};

export const renderSettingsWorkplaces = () => {
  normalizeWorkplacesAndRates();
  const container = document.getElementById('settingsWorkplacesList');
  if (!container) return;
  container.innerHTML = '';

  if (state.settings.workplaces.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'empty-wp-hint';
    emptyRow.style.cssText = 'padding: 0.75rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;';
    emptyRow.textContent = t('empty_workplaces_hint', 'Chưa có nơi làm việc nào. Thêm nơi làm việc mới ở ô bên dưới.');
    container.appendChild(emptyRow);
    return;
  }

  const currentDefaultWp = getDefaultWorkplace();
  const hasMultipleWp = state.settings.workplaces.length > 1;

  state.settings.workplaces.forEach((wp, idx) => {
    const wpCol = getWorkplaceColor(wp);
    const customRate = (state.settings.workplaceRates && state.settings.workplaceRates[wp] !== undefined)
      ? state.settings.workplaceRates[wp]
      : '';
    const isDefault = (wp === currentDefaultWp);
    const row = document.createElement('div');
    row.className = 'settings-workplace-row';
    row.innerHTML = `
      <div class="settings-wp-name-wrap">
        <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
        <span class="settings-wp-name">${escapeHtml(wp)}</span>
        ${isDefault ? `
          <span class="wp-default-tag">
            <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10" style="margin-right:2px;">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            ${t('tag_default_workplace', 'Mặc định')}
          </span>` : (hasMultipleWp ? `
          <button type="button" class="btn-set-default-wp btn-morphic" data-set-default="${escapeHtml(wp)}" title="${t('btn_set_default_wp', 'Đặt làm nơi làm việc mặc định')}" aria-label="${t('btn_set_default_wp', 'Đặt làm nơi làm việc mặc định')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>` : '')}
      </div>
      <div class="settings-wp-rate-wrap">
        <div class="settings-wp-rate-box">
          <input type="number" class="settings-wp-rate-input font-mono" data-wp-name="${escapeHtml(wp)}" value="${customRate}" placeholder="0" step="1000" min="0" title="${t('custom_wp_rate', 'Đơn giá (đ/h)')}">
          <span class="settings-wp-rate-tag font-mono">${t('rate_unit', 'đ/h')}</span>
        </div>
        <button type="button" class="btn-remove-workplace btn-morphic btn-morphic-danger" data-del-wp="${idx}" title="${t('btn_delete_wp', 'Xóa nơi làm')} ${escapeHtml(wp)}" aria-label="${t('btn_delete_wp', 'Xóa nơi làm')} ${escapeHtml(wp)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="13" height="13">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    const setDefaultBtn = row.querySelector('[data-set-default]');
    if (setDefaultBtn) {
      setDefaultBtn.addEventListener('click', () => {
        state.settings.defaultWorkplace = wp;
        saveSettings();
        renderSettingsWorkplaces();
        triggerAppRender();
        showToast(`Đã đặt "${wp}" làm nơi làm việc mặc định`);
      });
    }

    const delBtn = row.querySelector('[data-del-wp]');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        const removed = state.settings.workplaces.splice(idx, 1)[0];
        if (state.settings.defaultWorkplace === removed) {
          state.settings.defaultWorkplace = state.settings.workplaces[0] || '';
        }
        saveSettings();
        renderSettingsWorkplaces();
        triggerAppRender();
        showToast(`Đã xóa nơi làm: ${removed}`);
      });
    }

    row.querySelector('.settings-wp-rate-input').addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val >= 0) {
        state.settings.workplaceRates[wp] = val;
      } else {
        state.settings.workplaceRates[wp] = 0;
      }
      saveSettings();
      triggerAppRender();
    });

    container.appendChild(row);
  });
};

export const addWorkplaceFromSetting = () => {
  const input = document.getElementById('newWorkplaceInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  normalizeWorkplacesAndRates();
  if (!state.settings.workplaces.includes(val)) {
    const isFirst = state.settings.workplaces.length === 0;
    state.settings.workplaces.push(val);
    if (isFirst || !state.settings.defaultWorkplace) {
      state.settings.defaultWorkplace = val;
    }
    if (state.settings.workplaceRates[val] === undefined) {
      const defWp = getDefaultWorkplace();
      state.settings.workplaceRates[val] = state.settings.workplaceRates[defWp] || 0;
    }
    saveSettings();
    renderSettingsWorkplaces();
    triggerAppRender();
    input.value = '';
    showToast(`Đã thêm nơi làm: ${val}`);
  }
};

export const openSettingsModal = () => {
  normalizeWorkplacesAndRates();
  const defRateEl = document.getElementById('settingDefaultRate');
  if (defRateEl) defRateEl.value = state.settings.defaultRate ? state.settings.defaultRate : '';
  renderSettingsWorkplaces();

  updateSyncStatusUI();

  document.getElementById('settingsModal').style.display = 'flex';
};

export const saveSettingsFromModal = () => {
  const defRateEl = document.getElementById('settingDefaultRate');
  if (defRateEl) {
    const rateInputVal = defRateEl.value.trim();
    if (rateInputVal === '') {
      state.settings.defaultRate = 0;
    } else {
      const rate = Number(rateInputVal);
      if (!isNaN(rate) && rate >= 0) {
        state.settings.defaultRate = rate;
      }
    }
  }
  saveSettings();
  closeModal('settingsModal');
  triggerAppRender();
  showToast('Đã lưu cài đặt');
};

export const openAuthModal = (defaultTab = 'login') => {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  switchAuthTab(defaultTab);
  clearAuthErrors();
  modal.style.display = 'flex';
};

export const switchAuthTab = (tab) => {
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
    if (title) title.textContent = t('auth_tab_login', 'Đăng nhập tài khoản');
  } else {
    btnRegister.classList.add('active');
    btnLogin.classList.remove('active');
    formRegister.style.display = 'flex';
    formLogin.style.display = 'none';
    if (title) title.textContent = t('auth_tab_register', 'Đăng ký tài khoản mới');
  }
  clearAuthErrors();
};

export const clearAuthErrors = () => {
  const loginErr = document.getElementById('loginError');
  const regErr = document.getElementById('regError');
  if (loginErr) { loginErr.style.display = 'none'; loginErr.textContent = ''; }
  if (regErr) { regErr.style.display = 'none'; regErr.textContent = ''; }
};

export const openUserProfileModal = () => {
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

export const setupPasswordToggles = () => {
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
        btn.setAttribute('title', t('pwd_hide', 'Ẩn mật khẩu'));
        btn.setAttribute('aria-label', t('pwd_hide', 'Ẩn mật khẩu'));
      } else {
        input.type = 'password';
        btn.innerHTML = EYE_OPEN_SVG;
        btn.setAttribute('title', t('pwd_show', 'Hiện mật khẩu'));
        btn.setAttribute('aria-label', t('pwd_show', 'Hiện mật khẩu'));
      }
    });
  });
};

export const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
};
