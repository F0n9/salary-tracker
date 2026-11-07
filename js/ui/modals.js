import { state, getCurrentWeek, hasWorkplaces, getDefaultWorkplace, getWorkplaceColor, normalizeWorkplacesAndRates } from '../state.js';
import { fmtCurrency, fmtHours, parseTimeToMinutes, calculateHoursDiff, getShiftRate, getShiftEarnings, calculateSmartShiftDefaults, detectShiftType, getVietnameseDayOfWeek, getMondayDate, getShiftDateObj, getShiftDateShort, getWeekDateRangeDisplay, ensureWeekStartDate, getDayClass, escapeHtml, calculateWeekTotalSalary } from '../calculator.js';
import { t, getLocalizedWeekName, getLocalizedShiftType, getLocalizedDayName, formatShiftType } from '../i18n.js';
import { saveWeeks, saveSettings, updateSyncStatusUI, updateHeaderAuthUI, supabaseClient } from '../services/supabase.js';
import { showToast, showToastWithAction } from './toast.js';
import { showConfirmDialog, showAlertDialog } from './dialog.js';
import { triggerHaptic } from './haptic.js';
import { setupCustomSelect, syncCustomSelect } from './select.js';
import { renderAnalyticsDashboard } from './chart.js';
import { EYE_OPEN_SVG, EYE_OFF_SVG, EYE_OPEN_PATH, EYE_OFF_PATH } from '../config.js';
import { AVATARS, getAvatarSvg } from './avatars.js';

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

  const manageBox = document.getElementById('shiftWorkplaceManageBox');
  const btnToggleWp = document.getElementById('btnToggleWorkplacePanel');
  const shouldOpenManage = !hasWorkplaces();
  if (manageBox) {
    manageBox.style.display = shouldOpenManage ? 'flex' : 'none';
  }
  if (btnToggleWp) {
    btnToggleWp.classList.toggle('is-active', shouldOpenManage);
  }
  renderShiftWorkplacesList();

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
  const deductionInput = document.getElementById('shiftDeduction');
  if (deductionInput) deductionInput.value = '0';
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

  const manageBox = document.getElementById('shiftWorkplaceManageBox');
  const btnToggleWp = document.getElementById('btnToggleWorkplacePanel');
  if (manageBox) manageBox.style.display = 'none';
  if (btnToggleWp) btnToggleWp.classList.remove('is-active');
  renderShiftWorkplacesList();

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
  const deductionInput = document.getElementById('shiftDeduction');
  if (deductionInput) deductionInput.value = String(shift.deduction || '0');
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
  const deduction = Number(document.getElementById('shiftDeduction')?.value || 0);
  const workplace = (document.getElementById('shiftWorkplace')?.value || '').trim();
  if (!start || !end) return;

  const hours = calculateHoursDiff(start, end, breakMins);
  const rate = getShiftRate({ workplace });
  const wage = Math.max(0, Math.round(hours * rate * otRate + allowance - deduction));

  const breakLabel = breakMins > 0 ? ` (${t('break_tag', 'nghỉ')} ${breakMins}${t('unit_min', 'm')})` : '';
  const otLabel = otRate > 1 ? ` • x${otRate}` : '';
  document.getElementById('previewDuration').textContent = `${hours.toFixed(2)}h${breakLabel}${otLabel}`;
  document.getElementById('previewSalary').textContent = fmtCurrency(wage);
};

export const saveShiftFromModal = async (e) => {
  e.preventDefault();
  if (!hasWorkplaces()) {
    showToast(t('warn_no_workplace', 'Vui lòng thêm nơi làm việc trước.'));
    const manageBox = document.getElementById('shiftWorkplaceManageBox');
    if (manageBox) manageBox.style.display = 'flex';
    document.getElementById('shiftNewWpName')?.focus();
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
  const deduction = Math.max(0, Number(document.getElementById('shiftDeduction')?.value || 0));
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
    const confirmSave = await showConfirmDialog({
      title: t('confirm_overlap_title', 'Cảnh báo trùng giờ'),
      message: `Ca làm (${start} – ${end}) bị đè thời gian lên ca khác của cùng ngày ${getLocalizedDayName(day)}. Bạn có chắc chắn vẫn muốn lưu không?`,
      details: `${getLocalizedShiftType(overlappingShift.type)}: ${overlappingShift.start} – ${overlappingShift.end}`,
      confirmText: t('btn_continue_save', 'Vẫn lưu ca'),
      cancelText: t('btn_cancel', 'Hủy'),
      isDanger: false,
      isWarning: true,
      iconType: 'warning'
    });
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
      week.shifts[index] = { ...week.shifts[index], day, type, start, end, breakMinutes, otRate, allowance, deduction, hours, workplace, note };
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
      deduction,
      hours,
      workplace,
      note
    };
    week.shifts.push(newShift);
    showToast(t('toast_shift_added', 'Đã thêm ca làm việc mới'));
  }

  triggerHaptic('success');
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

  triggerHaptic('danger');
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
  triggerHaptic('medium');
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
  showToast(`${t('toast_shift_restored', 'Đã khôi phục ca làm việc.')} ${getLocalizedDayName(shift.day)} (${getLocalizedShiftType(shift.type)})`);
};

export const createNewWeek = () => {
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

export const deleteCurrentWeek = async () => {
  const week = getCurrentWeek();
  if (!week) return;

  if (state.weeks.length <= 1) {
    await showAlertDialog({
      title: t('btn_delete_week', 'Xóa tuần'),
      message: t('alert_cannot_delete_only_week', 'Không thể xóa tuần duy nhất còn lại.'),
      isError: true,
      iconType: 'error'
    });
    return;
  }

  const confirmed = await showConfirmDialog({
    title: t('btn_delete_week', 'Xóa tuần'),
    message: t('confirm_delete_week', 'Bạn có chắc chắn muốn xóa tuần làm việc này không?'),
    details: `${getLocalizedWeekName(week.name)} • ${week.shifts.length} ${t('unit_shift', 'ca')}`,
    confirmText: t('btn_delete', 'Xóa'),
    cancelText: t('btn_cancel', 'Hủy'),
    isDanger: true,
    iconType: 'delete'
  });
  if (confirmed) {
    triggerHaptic('danger');
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
  triggerHaptic('medium');
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
  showToast(`Đã khôi phục ${week.name}.`);
};

export const navigateWeek = (direction) => {
  const currentIndex = state.weeks.findIndex(w => w.id === state.currentWeekId);
  if (currentIndex === -1) return;

  const nextIndex = currentIndex + direction;
  if (nextIndex >= 0 && nextIndex < state.weeks.length) {
    triggerHaptic('light');
    state.currentWeekId = state.weeks[nextIndex].id;
    localStorage.setItem('salary_tracker_current_week', state.currentWeekId);
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
          workplaces: {},
          weeks: {}
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

      if (!monthMap[mKey].weeks[week.id]) {
        monthMap[mKey].weeks[week.id] = {
          id: week.id,
          name: week.name,
          startDate: week.startDate,
          weekObj: week,
          hours: 0,
          earnings: 0,
          shiftCount: 0
        };
      }
      monthMap[mKey].weeks[week.id].hours += shiftHours;
      monthMap[mKey].weeks[week.id].earnings += shiftEarnings;
      monthMap[mKey].weeks[week.id].shiftCount += 1;
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
    const weekList = Object.values(data.weeks).sort((a, b) => {
      const dateA = a.startDate || '';
      const dateB = b.startDate || '';
      return dateB.localeCompare(dateA);
    });

    const avgEarnings = data.shiftCount > 0 ? Math.round(data.totalEarnings / data.shiftCount) : 0;
    const avgHours = data.shiftCount > 0 ? (data.totalHours / data.shiftCount).toFixed(1) : '0';

    let wpBreakdownHtml = '';
    if (wpList.length > 1) {
      wpBreakdownHtml = `
        <div class="monthly-workplaces-section">
          <div class="monthly-section-subhead font-sans">${t('lbl_month_dist', 'Phân bổ theo nơi làm')}</div>
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
                      <span class="font-mono wb-percent" style="font-size:0.7rem;color:var(--text-dim);font-weight:400;">(${percent}%)</span>
                    </div>
                    <span class="wb-amount font-mono">${fmtCurrency(wp.earnings)}</span>
                  </div>
                  <div class="wb-bar-track">
                    <div class="wb-bar-fill" style="width:${percent}%;background:${col.fill};"></div>
                  </div>
                  <div class="wb-sub font-mono">${wp.count} ca • ${wp.hours.toFixed(1)}h</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    let weeksBreakdownHtml = '';
    if (weekList.length > 0) {
      weeksBreakdownHtml = `
        <div class="monthly-weeks-section">
          <div class="monthly-section-subhead font-sans">${t('lbl_month_weeks', 'Chi tiết các tuần')}</div>
          <div class="monthly-weeks-list">
            ${weekList.map(w => {
              const dateRange = getWeekDateRangeDisplay(w.weekObj);
              return `
                <div class="monthly-week-row" data-jump-week="${w.id}" title="${t('view_this_week', 'Xem tuần này')}">
                  <div class="mw-left">
                    <span class="mw-name font-sans">${escapeHtml(w.name)}</span>
                    ${dateRange ? `<span class="mw-range font-mono">${dateRange}</span>` : ''}
                  </div>
                  <div class="mw-right">
                    <span class="mw-meta font-mono">${w.shiftCount} ca • ${fmtHours(w.hours)}</span>
                    <span class="mw-earnings font-mono">${fmtCurrency(w.earnings)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="monthly-card-header">
        <div class="monthly-header-left">
          <span class="monthly-title-text font-sans">${data.label}</span>
          <span class="monthly-title-meta font-mono">${data.shiftCount} ca • ${fmtHours(data.totalHours)}</span>
        </div>
        <div class="monthly-header-right">
          <span class="monthly-total-label font-sans">${t('lbl_total_income', 'Tổng thu nhập')}</span>
          <span class="monthly-total-val font-mono">${fmtCurrency(data.totalEarnings)}</span>
        </div>
      </div>

      <div class="monthly-summary-strip">
        <div class="mss-item">
          <span class="mss-label font-sans">${t('lbl_avg_per_shift', 'Trung bình / ca')}</span>
          <span class="mss-val font-mono text-money">${fmtCurrency(avgEarnings)} <span class="mss-sub font-mono">(${avgHours}h)</span></span>
        </div>
        <div class="mss-item">
          <span class="mss-label font-sans">${t('lbl_workplace', 'Cơ sở làm việc')}</span>
          <span class="mss-val font-sans">${wpList.length === 1 ? escapeHtml(wpList[0].name) : `${wpList.length} cơ sở`}</span>
        </div>
      </div>

      ${weeksBreakdownHtml}
      ${wpBreakdownHtml}
    `;

    card.querySelectorAll('[data-jump-week]').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.getAttribute('data-jump-week');
        if (targetId) {
          state.currentWeekId = targetId;
          closeModal('allWeeksModal');
          triggerAppRender();
        }
      });
    });

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
    tr.className = isCurrent ? 'is-current-week' : '';
    tr.innerHTML = `
      <td class="col-week">
        <div class="table-week-cell">
          <span class="table-week-title">${escapeHtml(week.name)}</span>
          ${dateRange ? `<span class="table-week-dates font-mono">${dateRange}</span>` : ''}
        </div>
      </td>
      <td class="col-shifts-desktop font-mono">${weekShifts} ca</td>
      <td class="col-hours-desktop font-mono">${weekHours.toFixed(2)} h</td>
      <td class="col-income text-bold-dark text-money font-mono">${fmtCurrency(weekEarnings)}</td>
      <td class="col-metrics-mobile font-mono">${weekShifts} ca • ${weekHours.toFixed(2)} h</td>
      <td class="col-actions">
        <div class="table-actions">
          ${isCurrent ? `
            <button type="button" class="btn-table-action btn-table-current" disabled title="${t('week_currently_selected', 'Tuần đang chọn')}" aria-label="${t('week_currently_selected', 'Tuần đang chọn')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          ` : `
            <button type="button" class="btn-table-action btn-table-view" data-jump-week="${week.id}" title="${t('view_this_week', 'Xem tuần này')}" aria-label="${t('view_this_week', 'Xem tuần này')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          `}
          <button type="button" class="btn-table-action btn-table-delete" data-delete-week="${week.id}" title="${t('btn_delete_week', 'Xóa tuần')} ${escapeHtml(getLocalizedWeekName(week.name))}" aria-label="${t('btn_delete_week', 'Xóa tuần')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              <line x1="10" x2="10" y1="11" y2="17"></line>
              <line x1="14" x2="14" y1="11" y2="17"></line>
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

    tr.querySelector(`[data-delete-week="${week.id}"]`).addEventListener('click', async () => {
      if (state.weeks.length <= 1) {
        await showAlertDialog({
          title: t('btn_delete_week', 'Xóa tuần'),
          message: t('alert_cannot_delete_only_week', 'Không thể xóa tuần duy nhất còn lại.'),
          isError: true,
          iconType: 'error'
        });
        return;
      }
      const confirmed = await showConfirmDialog({
        title: t('btn_delete_week', 'Xóa tuần'),
        message: t('confirm_delete_week', 'Bạn có chắc chắn muốn xóa tuần làm việc này không?'),
        details: `${getLocalizedWeekName(week.name)} • ${week.shifts.length} ${t('unit_shift', 'ca')}`,
        confirmText: t('btn_delete', 'Xóa'),
        cancelText: t('btn_cancel', 'Hủy'),
        isDanger: true,
        iconType: 'delete'
      });
      if (confirmed) {
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

const parseWpRate = (raw) => {
  if (raw === null || raw === undefined) return 0;
  const str = String(raw).trim().toLowerCase();
  if (!str) return 0;
  if (str.endsWith('k')) {
    const n = parseFloat(str.replace(/,/g, '.'));
    return !isNaN(n) && n >= 0 ? Math.round(n * 1000) : 0;
  }
  const cleaned = str.replace(/[^\d]/g, '');
  const num = Number(cleaned);
  return !isNaN(num) && num >= 0 ? num : 0;
};

const formatWpRateDisplay = (num) => {
  const val = Number(num);
  if (!val || isNaN(val) || val <= 0) return '';
  return new Intl.NumberFormat('vi-VN').format(val);
};

export const renderShiftWorkplacesList = () => {
  const container = document.getElementById('shiftWpQuickList');
  if (!container) return;
  container.innerHTML = '';
  normalizeWorkplacesAndRates();

  const countBadge = document.getElementById('swmListCountBadge');
  if (countBadge) {
    countBadge.textContent = String(state.settings.workplaces.length);
  }

  const currentDefaultWp = getDefaultWorkplace();
  const hasMultiple = state.settings.workplaces.length > 1;

  state.settings.workplaces.forEach((wp, idx) => {
    const wpCol = getWorkplaceColor(wp);
    const rate = (state.settings.workplaceRates && state.settings.workplaceRates[wp] !== undefined)
      ? state.settings.workplaceRates[wp]
      : '';
    const isDefault = (wp === currentDefaultWp);

    const row = document.createElement('div');
    row.className = `swq-item-card ${isDefault ? 'is-default-card' : ''}`;
    row.dataset.wp = wp;
    row.innerHTML = `
      <div class="swq-card-top">
        <div class="swq-card-identity">
          <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
          <span class="swq-name" title="${escapeHtml(wp)}">${escapeHtml(wp)}</span>
          ${isDefault ? `
            <span class="wp-default-tag" title="${t('tag_default_workplace', 'Mặc định')}">
              <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${t('tag_default_workplace', 'Mặc định')}</span>
            </span>
          ` : (hasMultiple ? `
            <button type="button" class="btn-set-default-wp" data-set-default="${escapeHtml(wp)}" title="${t('btn_set_default_wp', 'Đặt làm nơi làm việc mặc định')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="11" height="11">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Đặt mặc định</span>
            </button>
          ` : '')}
        </div>
        <div class="swq-card-actions">
          <button type="button" class="swq-btn-icon btn-rename-workplace" data-rename-wp="${idx}" title="${t('btn_rename_wp', 'Đổi tên nơi làm')}" aria-label="Đổi tên">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </button>
          ${hasMultiple ? `
            <button type="button" class="swq-btn-icon is-danger btn-remove-workplace" data-del-wp="${idx}" title="${t('btn_delete_wp', 'Xóa nơi làm')}" aria-label="Xóa">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          ` : ''}
        </div>
      </div>
      <div class="swq-card-bottom">
        <span class="swq-rate-label">Đơn giá theo giờ:</span>
        <div class="swq-rate-input-wrap">
          <input type="text" inputmode="numeric" class="swq-rate-input font-mono" data-wp="${escapeHtml(wp)}" value="${formatWpRateDisplay(rate)}" placeholder="0" autocomplete="off">
          <span class="swq-rate-tag font-mono">đ/h</span>
        </div>
      </div>
    `;

    const renameBtn = row.querySelector('[data-rename-wp]');
    if (renameBtn) {
      renameBtn.addEventListener('click', () => {
        triggerHaptic('light');
        row.innerHTML = `
          <div class="swq-edit-mode-wrap">
            <div class="swq-edit-header">
              <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
              <span class="swq-edit-title">Đổi tên: <strong>${escapeHtml(wp)}</strong></span>
            </div>
            <div class="swq-edit-form">
              <input type="text" class="swq-name-input form-input font-sans" value="${escapeHtml(wp)}" placeholder="${t('ph_workplace_name', 'Tên nơi làm')}" autocomplete="off">
              <div class="swq-edit-btn-group">
                <button type="button" class="btn-save-wp-rename btn-action-primary" title="${t('btn_save', 'Lưu')}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="12" height="12">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>${t('btn_save', 'Lưu')}</span>
                </button>
                <button type="button" class="btn-cancel-wp-rename btn-morphic" title="${t('btn_cancel', 'Hủy')}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  <span>${t('btn_cancel', 'Hủy')}</span>
                </button>
              </div>
            </div>
          </div>
        `;

        const nameInput = row.querySelector('.swq-name-input');
        if (nameInput) {
          nameInput.focus();
          nameInput.select();
        }

        const handleSave = () => {
          const newName = (nameInput?.value || '').trim();
          if (!newName) {
            showToast(t('warn_wp_name_empty', 'Vui lòng nhập tên nơi làm việc.'));
            nameInput?.focus();
            return;
          }
          if (newName === wp) {
            renderShiftWorkplacesList();
            return;
          }
          if (state.settings.workplaces.some(w => w.toLowerCase() === newName.toLowerCase() && w !== wp)) {
            showToast(t('warn_wp_exists', 'Tên nơi làm việc này đã tồn tại.'));
            nameInput?.focus();
            return;
          }

          state.settings.workplaces[idx] = newName;
          const currentRate = state.settings.workplaceRates?.[wp] ?? 0;
          if (!state.settings.workplaceRates) state.settings.workplaceRates = {};
          state.settings.workplaceRates[newName] = currentRate;
          delete state.settings.workplaceRates[wp];

          if (state.settings.defaultWorkplace === wp) {
            state.settings.defaultWorkplace = newName;
          }

          state.weeks.forEach(w => {
            if (Array.isArray(w.shifts)) {
              w.shifts.forEach(s => {
                if (s.workplace === wp) {
                  s.workplace = newName;
                }
              });
            }
          });

          saveSettings();
          saveWeeks();
          renderShiftWorkplacesList();
          updateWorkplaceInputOptions(newName);
          updateModalComputedPreview();
          triggerAppRender();
          triggerHaptic('medium');
          showToast(`Đã đổi tên thành "${newName}"`);
        };

        row.querySelector('.btn-save-wp-rename')?.addEventListener('click', handleSave);
        row.querySelector('.btn-cancel-wp-rename')?.addEventListener('click', () => {
          triggerHaptic('light');
          renderShiftWorkplacesList();
        });

        nameInput?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            triggerHaptic('light');
            renderShiftWorkplacesList();
          }
        });
      });
    }

    const setDefaultBtn = row.querySelector('[data-set-default]');
    if (setDefaultBtn) {
      setDefaultBtn.addEventListener('click', () => {
        triggerHaptic('medium');
        state.settings.defaultWorkplace = wp;
        saveSettings();
        renderShiftWorkplacesList();
        updateWorkplaceInputOptions(wp);
        updateModalComputedPreview();
        triggerAppRender();
        showToast(`Đã đặt "${wp}" làm nơi làm việc mặc định`);
      });
    }

    const delBtn = row.querySelector('[data-del-wp]');
    if (delBtn) {
      delBtn.addEventListener('click', async () => {
        triggerHaptic('light');
        const confirmed = await showConfirmDialog({
          title: t('btn_delete_wp', 'Xóa nơi làm'),
          message: `Bạn có chắc chắn muốn xóa nơi làm việc "${wp}" không?`,
          confirmText: t('btn_delete', 'Xóa'),
          cancelText: t('btn_cancel', 'Hủy'),
          isDanger: true,
          iconType: 'delete'
        });
        if (!confirmed) return;
        const removed = state.settings.workplaces.splice(idx, 1)[0];
        if (state.settings.workplaceRates && state.settings.workplaceRates[removed] !== undefined) {
          delete state.settings.workplaceRates[removed];
        }
        if (state.settings.defaultWorkplace === removed) {
          state.settings.defaultWorkplace = state.settings.workplaces[0] || '';
        }
        saveSettings();
        renderShiftWorkplacesList();
        updateWorkplaceInputOptions();
        updateModalComputedPreview();
        triggerAppRender();
        triggerHaptic('medium');
        showToast(`Đã xóa nơi làm: ${removed}`);
      });
    }

    const rateInput = row.querySelector('.swq-rate-input');
    if (rateInput) {
      rateInput.addEventListener('input', (e) => {
        const val = parseWpRate(e.target.value);
        if (!state.settings.workplaceRates) state.settings.workplaceRates = {};
        state.settings.workplaceRates[wp] = val;
        saveSettings();
        updateModalComputedPreview();
        triggerAppRender();
      });

      rateInput.addEventListener('focus', (e) => {
        e.target.select();
      });

      rateInput.addEventListener('blur', (e) => {
        const val = parseWpRate(e.target.value);
        if (!state.settings.workplaceRates) state.settings.workplaceRates = {};
        state.settings.workplaceRates[wp] = val;
        e.target.value = formatWpRateDisplay(val);
        saveSettings();
        updateModalComputedPreview();
        triggerAppRender();
      });

      rateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          rateInput.blur();
        }
      });
    }

    container.appendChild(row);
  });
};

export const addWorkplaceFromShiftModal = () => {
  const nameInput = document.getElementById('shiftNewWpName');
  const rateInput = document.getElementById('shiftNewWpRate');
  if (!nameInput) return;
  const val = nameInput.value.trim();
  if (!val) {
    showToast(t('warn_wp_name_empty', 'Vui lòng nhập tên nơi làm việc mới.'));
    nameInput.focus();
    return;
  }
  normalizeWorkplacesAndRates();
  if (state.settings.workplaces.some(w => w.toLowerCase() === val.toLowerCase())) {
    showToast(t('warn_wp_exists', 'Tên nơi làm việc này đã tồn tại.'));
    nameInput.focus();
    return;
  }

  const isFirst = state.settings.workplaces.length === 0;
  state.settings.workplaces.push(val);
  if (isFirst || !state.settings.defaultWorkplace) {
    state.settings.defaultWorkplace = val;
  }

  const customRate = rateInput ? parseWpRate(rateInput.value) : 0;
  if (!state.settings.workplaceRates) state.settings.workplaceRates = {};
  state.settings.workplaceRates[val] = customRate;

  saveSettings();
  nameInput.value = '';
  if (rateInput) rateInput.value = '';

  renderShiftWorkplacesList();
  updateWorkplaceInputOptions(val);
  updateModalComputedPreview();
  triggerAppRender();
  triggerHaptic('medium');
  showToast(`Đã thêm nơi làm việc: ${val}`);
};

export const toggleWorkplacePanel = (forceOpen = null) => {
  const box = document.getElementById('shiftWorkplaceManageBox');
  const btn = document.getElementById('btnToggleWorkplacePanel');
  if (!box) return;
  const shouldOpen = (forceOpen !== null)
    ? !!forceOpen
    : (box.style.display === 'none' || !box.style.display);
  box.style.display = shouldOpen ? 'flex' : 'none';
  if (btn) {
    btn.classList.toggle('is-active', shouldOpen);
  }
  if (shouldOpen) {
    renderShiftWorkplacesList();
    const nameInput = document.getElementById('shiftNewWpName');
    if (nameInput) nameInput.focus();
  }
};

export const openAuthModal = (defaultTab = 'login') => {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  switchAuthTab(defaultTab);
  clearAuthErrors();
  modal.style.display = 'flex';
};

export const openResetPasswordModal = () => {
  const modal = document.getElementById('resetPasswordModal');
  if (!modal) return;
  const form = document.getElementById('formResetPassword');
  if (form) form.reset();
  const errorEl = document.getElementById('resetPasswordError');
  if (errorEl) errorEl.style.display = 'none';
  const authModal = document.getElementById('authModal');
  if (authModal) authModal.style.display = 'none';
  const profileModal = document.getElementById('userProfileModal');
  if (profileModal) profileModal.style.display = 'none';
  modal.style.display = 'flex';
  setTimeout(() => {
    document.getElementById('resetNewPassword')?.focus();
  }, 100);
};

export const closeResetPasswordModal = () => {
  const modal = document.getElementById('resetPasswordModal');
  if (modal) modal.style.display = 'none';
};

export const switchAuthTab = (tab) => {
  const btnLogin = document.getElementById('tabBtnLogin');
  const btnRegister = document.getElementById('tabBtnRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const formForgot = document.getElementById('formForgotPassword');
  const tabsRow = document.querySelector('.auth-tabs-row');
  const oauthWrap = document.getElementById('authOauthWrap');
  const title = document.getElementById('authModalTitle');

  if (tab === 'login') {
    if (btnLogin) btnLogin.classList.add('active');
    if (btnRegister) btnRegister.classList.remove('active');
    if (tabsRow) tabsRow.style.display = 'flex';
    if (formLogin) formLogin.style.display = 'flex';
    if (formRegister) formRegister.style.display = 'none';
    if (formForgot) formForgot.style.display = 'none';
    if (oauthWrap) oauthWrap.style.display = 'flex';
    if (title) title.textContent = t('auth_tab_login', 'Đăng nhập tài khoản');
  } else if (tab === 'register') {
    if (btnRegister) btnRegister.classList.add('active');
    if (btnLogin) btnLogin.classList.remove('active');
    if (tabsRow) tabsRow.style.display = 'flex';
    if (formRegister) formRegister.style.display = 'flex';
    if (formLogin) formLogin.style.display = 'none';
    if (formForgot) formForgot.style.display = 'none';
    if (oauthWrap) oauthWrap.style.display = 'flex';
    if (title) title.textContent = t('auth_tab_register', 'Đăng ký tài khoản mới');
  } else if (tab === 'forgot') {
    if (tabsRow) tabsRow.style.display = 'none';
    if (formLogin) formLogin.style.display = 'none';
    if (formRegister) formRegister.style.display = 'none';
    if (formForgot) formForgot.style.display = 'flex';
    if (oauthWrap) oauthWrap.style.display = 'none';
    if (title) title.textContent = t('auth_forgot_title', 'Khôi phục mật khẩu');
    document.getElementById('forgotEmail')?.focus();
  }
  clearAuthErrors();
};

export const clearAuthErrors = () => {
  const loginErr = document.getElementById('loginError');
  const regErr = document.getElementById('regError');
  const forgotErr = document.getElementById('forgotError');
  const forgotSuccess = document.getElementById('forgotSuccess');
  if (loginErr) { loginErr.style.display = 'none'; loginErr.textContent = ''; }
  if (regErr) { regErr.style.display = 'none'; regErr.textContent = ''; }
  if (forgotErr) { forgotErr.style.display = 'none'; forgotErr.textContent = ''; }
  if (forgotSuccess) { forgotSuccess.style.display = 'none'; forgotSuccess.textContent = ''; }
};

export const renderAvatarPickerGrid = () => {
  const grid = document.getElementById('avatarPickerGrid');
  if (!grid) return;
  const currentAvatarId = state.currentUser?.avatar || state.settings?.avatar || 'default';
  grid.innerHTML = '';

  AVATARS.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `avatar-choice-btn${item.id === currentAvatarId ? ' is-active' : ''}`;
    btn.setAttribute('data-avatar-id', item.id);
    btn.setAttribute('title', item.name || ('Avatar ' + (index + 1)));
    btn.setAttribute('aria-label', item.name || ('Avatar ' + (index + 1)));
    btn.innerHTML = item.svg;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerHaptic('light');
      if (!state.settings) state.settings = {};
      state.settings.avatar = item.id;
      if (state.currentUser) {
        state.currentUser.avatar = item.id;
        try {
          const raw = localStorage.getItem('salary_tracker_cached_user');
          if (raw) {
            const u = JSON.parse(raw);
            u.avatar = item.id;
            localStorage.setItem('salary_tracker_cached_user', JSON.stringify(u));
          }
        } catch (_) {}
      }
      saveSettings();

      const avatarContent = document.getElementById('profileAvatarContent');
      if (avatarContent) avatarContent.innerHTML = item.svg;

      grid.querySelectorAll('.avatar-choice-btn').forEach(b => {
        b.classList.toggle('is-active', b.getAttribute('data-avatar-id') === item.id);
      });

      updateHeaderAuthUI();
      showToast(t('toast_avatar_saved', 'Đã lưu ảnh đại diện.'), 'success');
    });

    grid.appendChild(btn);
  });
};

export const collapsePasswordSection = () => {
  const formChangePwd = document.getElementById('formChangePassword');
  const iconChevron = document.getElementById('iconChangePwdChevron');
  if (formChangePwd) {
    formChangePwd.style.display = 'none';
    formChangePwd.reset();
  }
  if (iconChevron) {
    iconChevron.style.transform = 'rotate(0deg)';
  }
  const changeMsg = document.getElementById('changePasswordMsg');
  if (changeMsg) {
    changeMsg.style.display = 'none';
    changeMsg.textContent = '';
  }
};

export const collapseAvatarPicker = () => {
  const shelf = document.getElementById('avatarPickerShelf');
  if (shelf) shelf.style.display = 'none';
};

export const expandAvatarPicker = () => {
  collapsePasswordSection();
  const shelf = document.getElementById('avatarPickerShelf');
  if (shelf) shelf.style.display = 'flex';
};

export const expandPasswordSection = () => {
  collapseAvatarPicker();
  const formChangePwd = document.getElementById('formChangePassword');
  const iconChevron = document.getElementById('iconChangePwdChevron');
  if (formChangePwd) formChangePwd.style.display = 'flex';
  if (iconChevron) iconChevron.style.transform = 'rotate(180deg)';
  const pwdInput = document.getElementById('changeNewPassword');
  if (pwdInput) setTimeout(() => pwdInput.focus(), 60);
};

export const openUserProfileModal = () => {
  if (!state.currentUser) {
    openAuthModal('login');
    return;
  }

  const modal = document.getElementById('userProfileModal');
  if (!modal) return;

  let username = state.currentUser.username || 'user';
  if (username.includes(' ') || !username.match(/^[a-zA-Z0-9_.-]+$/)) {
    if (state.currentUser?.email) {
      username = state.currentUser.email.split('@')[0].trim().replace(/\s+/g, '').toLowerCase();
      state.currentUser.username = username;
    }
  }
  const currentAvatarId = state.currentUser?.avatar || state.settings?.avatar || 'default';

  const avatarContent = document.getElementById('profileAvatarContent');
  if (avatarContent) {
    avatarContent.innerHTML = getAvatarSvg(currentAvatarId);
  }

  collapseAvatarPicker();
  collapsePasswordSection();

  renderAvatarPickerGrid();

  const btnToggleAvatar = document.getElementById('btnToggleAvatarPicker');
  if (btnToggleAvatar) {
    btnToggleAvatar.onclick = (e) => {
      e.preventDefault();
      triggerHaptic('light');
      const shelf = document.getElementById('avatarPickerShelf');
      const isClosed = !shelf || shelf.style.display === 'none';
      if (isClosed) {
        expandAvatarPicker();
      } else {
        collapseAvatarPicker();
      }
    };
  }

  const avatarBadge = document.getElementById('profileAvatarBadge');
  if (avatarBadge && btnToggleAvatar) {
    avatarBadge.onclick = (e) => {
      e.preventDefault();
      btnToggleAvatar.click();
    };
  }

  const btnToggleChangePwd = document.getElementById('btnToggleChangePwdSection');
  if (btnToggleChangePwd) {
    btnToggleChangePwd.onclick = (e) => {
      e.preventDefault();
      triggerHaptic('light');
      const formChangePwd = document.getElementById('formChangePassword');
      const isClosed = !formChangePwd || formChangePwd.style.display === 'none';
      if (isClosed) {
        expandPasswordSection();
      } else {
        collapsePasswordSection();
      }
    };
  }

  document.getElementById('profileUsername').textContent = `@${username}`;

  const viewWrap = document.getElementById('profileUsernameView');
  const editWrap = document.getElementById('profileUsernameEdit');
  const inputEl = document.getElementById('inputEditUsername');
  const btnEditUsername = document.getElementById('btnEditUsername');
  const btnSaveUsername = document.getElementById('btnSaveUsername');
  const btnCancelUsername = document.getElementById('btnCancelUsername');

  const setUsernameViewMode = () => {
    if (viewWrap) viewWrap.style.display = 'inline-flex';
    if (editWrap) editWrap.style.display = 'none';
  };

  const setUsernameEditMode = () => {
    if (viewWrap) viewWrap.style.display = 'none';
    if (editWrap) {
      editWrap.style.display = 'inline-flex';
      if (inputEl) {
        inputEl.value = state.currentUser?.username || '';
        requestAnimationFrame(() => {
          inputEl.focus();
          inputEl.select();
        });
      }
    }
  };

  setUsernameViewMode();

  const handleSaveUsername = async () => {
    if (!inputEl) return;
    const currentName = state.currentUser?.username || '';
    const rawVal = inputEl.value;
    if (!rawVal || !rawVal.trim()) {
      setUsernameViewMode();
      return;
    }
    const cleanName = rawVal.trim().replace(/\s+/g, '').toLowerCase();
    if (!cleanName || cleanName === currentName) {
      setUsernameViewMode();
      return;
    }
    triggerHaptic('medium');
    try {
      if (state.currentUser) state.currentUser.username = cleanName;
      document.getElementById('profileUsername').textContent = `@${cleanName}`;
      updateHeaderAuthUI();
      setUsernameViewMode();
      if (supabaseClient && state.currentUser?.id) {
        try {
          await supabaseClient.auth.updateUser({
            data: { username: cleanName }
          });
        } catch (_) {}
        try {
          await supabaseClient.from('user_salary_data').update({
            username: cleanName,
            updated_at: new Date().toISOString()
          }).eq('user_id', state.currentUser.id);
        } catch (_) {}
      }
      try {
        const cached = localStorage.getItem('salary_tracker_cached_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.username = cleanName;
          localStorage.setItem('salary_tracker_cached_user', JSON.stringify(parsed));
        }
      } catch (_) {}
      showToast(t('toast_username_updated', 'Đã cập nhật tên tài khoản: @{name}').replace('{name}', cleanName), 'success');
    } catch (err) {
      showToast(t('toast_username_error', 'Lỗi khi đổi tên tài khoản.'), 'error');
    }
  };

  if (btnEditUsername) {
    btnEditUsername.onclick = (e) => {
      e.preventDefault();
      triggerHaptic('light');
      setUsernameEditMode();
    };
  }

  if (btnSaveUsername) {
    btnSaveUsername.onclick = (e) => {
      e.preventDefault();
      handleSaveUsername();
    };
  }

  if (btnCancelUsername) {
    btnCancelUsername.onclick = (e) => {
      e.preventDefault();
      triggerHaptic('light');
      setUsernameViewMode();
    };
  }

  if (inputEl) {
    inputEl.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveUsername();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        triggerHaptic('light');
        setUsernameViewMode();
      }
    };
  }

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

  const pwdBox = document.querySelector('.profile-change-pwd-box');
  if (pwdBox) {
    pwdBox.style.display = 'block';
  }
  const hasPassword = Boolean(
    (state.currentUser?.email && state.currentUser.email.endsWith('@salary.app')) ||
    state.currentUser?.has_password ||
    state.currentUser?.user_metadata?.has_password ||
    (Array.isArray(state.currentUser?.identities) && state.currentUser.identities.some(i => i.provider === 'email')) ||
    (Array.isArray(state.currentUser?.app_metadata?.providers) && state.currentUser.app_metadata.providers.includes('email'))
  );
  const pwdTitle = document.getElementById('profileChangePwdTitle');
  if (pwdTitle) {
    pwdTitle.textContent = hasPassword ? t('profile_change_pw', 'Đổi mật khẩu') : t('profile_create_pw', 'Tạo mật khẩu');
  }
  const btnSubmitPwd = document.getElementById('btnSubmitChangePassword');
  if (btnSubmitPwd) {
    const lbl = hasPassword ? t('profile_change_pw', 'Đổi mật khẩu') : t('profile_create_pw', 'Tạo mật khẩu');
    btnSubmitPwd.title = lbl;
    btnSubmitPwd.setAttribute('aria-label', lbl);
  }

  const btnLinkGoogle = document.getElementById('btnLinkGoogleAccount');
  const badgeGoogle = document.getElementById('badgeGoogleLinked');
  const isGoogle = Boolean(state.currentUser?.email && !state.currentUser.email.endsWith('@salary.app'));
  const isGoogleLinked = isGoogle || (Array.isArray(state.currentUser?.identities) && state.currentUser.identities.some(i => i.provider === 'google'));
  if (btnLinkGoogle) btnLinkGoogle.style.display = isGoogleLinked ? 'none' : 'flex';
  if (badgeGoogle) badgeGoogle.style.display = isGoogleLinked ? 'inline-flex' : 'none';

  modal.style.display = 'flex';
};

export const setupPasswordToggles = () => {
  document.querySelectorAll('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;
      triggerHaptic('light');
      const start = (input.selectionStart !== null && input.selectionStart !== undefined) ? input.selectionStart : input.value.length;
      const end = (input.selectionEnd !== null && input.selectionEnd !== undefined) ? input.selectionEnd : input.value.length;
      const morph = btn.querySelector('morph-icon');
      const willBeText = input.type === 'password';

      input.classList.remove('input-reveal-active');
      input.classList.add('input-reveal-dissolve');

      if (morph && typeof morph.morphTo === 'function') {
        morph.morphTo(willBeText ? EYE_OFF_PATH : EYE_OPEN_PATH);
      } else if (morph) {
        morph.setAttribute('icon', willBeText ? EYE_OFF_PATH : EYE_OPEN_PATH);
      } else {
        btn.innerHTML = willBeText ? EYE_OFF_SVG : EYE_OPEN_SVG;
      }

      const newTitle = willBeText ? t('pwd_hide', 'Ẩn mật khẩu') : t('pwd_show', 'Hiện mật khẩu');
      btn.setAttribute('title', newTitle);
      btn.setAttribute('aria-label', newTitle);

      setTimeout(() => {
        input.type = willBeText ? 'text' : 'password';
        input.focus();
        try {
          if (start !== null && end !== null) {
            input.setSelectionRange(start, end);
          }
        } catch (_) {}
        input.classList.remove('input-reveal-dissolve');
        input.classList.add('input-reveal-active');
        setTimeout(() => {
          input.classList.remove('input-reveal-active');
        }, 160);
      }, 70);
    });
  });
};

export const closeModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
};
