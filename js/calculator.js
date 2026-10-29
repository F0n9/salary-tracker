import { state, getDefaultWorkplace } from './state.js';
import { t, formatShiftType } from './i18n.js';

export { formatShiftType };

export const fmtCurrency = (num) => {
  const val = Math.round(num || 0);
  return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
};

export const fmtHours = (hours) => {
  const h = Number(hours || 0);
  return h.toFixed(2) + ' h';
};

export const hoursToHourMinutes = (hours) => {
  const totalMinutes = Math.round(Number(hours || 0) * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m < 10 ? '0' : ''}${m}m`;
};

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const calculateHoursDiff = (startStr, endStr, breakMinutes = 0) => {
  const startMins = parseTimeToMinutes(startStr);
  let endMins = parseTimeToMinutes(endStr);
  if (endMins < startMins) {
    endMins += 24 * 60;
  }
  const diffMinutes = Math.max(0, endMins - startMins - (Number(breakMinutes) || 0));
  return Number((diffMinutes / 60).toFixed(2));
};

export const getShiftRate = (shift) => {
  const wp = (shift && shift.workplace && shift.workplace.trim()) ? shift.workplace.trim() : getDefaultWorkplace();
  if (state.settings && state.settings.workplaceRates && state.settings.workplaceRates[wp] !== undefined) {
    const customRate = Number(state.settings.workplaceRates[wp]);
    if (!isNaN(customRate) && customRate >= 0) return customRate;
  }
  const defWp = getDefaultWorkplace();
  if (state.settings && state.settings.workplaceRates && state.settings.workplaceRates[defWp] !== undefined) {
    const defRate = Number(state.settings.workplaceRates[defWp]);
    if (!isNaN(defRate) && defRate >= 0) return defRate;
  }
  return 0;
};

export const getShiftEarnings = (shift, week) => {
  if (!shift) return 0;
  const hours = Number(shift.hours || 0);
  const rate = getShiftRate(shift);
  const ot = Number(shift.otRate) || 1.0;
  const allowance = Number(shift.allowance) || 0;
  return Math.round(hours * rate * ot + allowance);
};

export const calculateWeekTotalSalary = (week) => {
  if (!week || !Array.isArray(week.shifts)) return 0;
  return week.shifts.reduce((acc, s) => {
    return acc + getShiftEarnings(s, week);
  }, 0);
};

export const hoursToColonFormat = (hours) => {
  const totalMins = Math.round(Number(hours || 0) * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}:${m < 10 ? '0' : ''}${m}`;
};

export const getVietnameseDayOfWeek = (date = new Date()) => {
  const dayIndex = date.getDay();
  const map = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return map[dayIndex];
};

export const getMondayDate = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(monday.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
};

export const getShiftDateObj = (week, dayStr) => {
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

export const getShiftDateShort = (week, dayStr) => {
  const obj = getShiftDateObj(week, dayStr);
  return obj ? obj.short : '';
};

export const getShiftDateFull = (week, dayStr) => {
  const obj = getShiftDateObj(week, dayStr);
  return obj ? obj.full : '';
};

export const getWeekDateRangeDisplay = (week) => {
  if (!week || !week.startDate) return '';
  const start = getShiftDateObj(week, 'T2');
  const end = getShiftDateObj(week, 'CN');
  if (!start || !end) return '';
  return `${start.short} – ${end.short}`;
};

export const ensureWeekStartDate = (week, index) => {
  if (week.startDate) return;
  const now = new Date();
  const totalWeeks = state.weeks.length || 1;
  const weeksBack = (totalWeeks - 1 - index);
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() - weeksBack * 7);
  week.startDate = getMondayDate(targetDate);
};

export const getDayClass = (day) => {
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

export const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const detectShiftType = (startTimeStr) => {
  if (!startTimeStr) return 'Tối';
  const parts = startTimeStr.split(':');
  const h = parseInt(parts[0], 10);
  if (isNaN(h)) return 'Tối';
  if (h >= 11 && h < 16) return 'Trưa';
  if (h >= 16 || h < 5) return 'Tối';
  return 'Sáng';
};

export const calculateSmartShiftDefaults = (prefill = null, now = new Date()) => {
  let endMin = Math.round(now.getMinutes() / 15) * 15;
  let endHour = now.getHours();
  if (endMin === 60) {
    endHour = (endHour + 1) % 24;
    endMin = 0;
  }
  const endTotalMins = endHour * 60 + endMin;
  const defaultEnd = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

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

  let durationMinutes = 4 * 60;
  let detectedType = '';
  let detectedBreak = 0;

  if (allPastShifts.length > 0) {
    const similarEndShifts = allPastShifts.filter(s => {
      const sEndMins = parseTimeToMinutes(s.end);
      let diff = Math.abs(sEndMins - endTotalMins);
      if (diff > 12 * 60) diff = 24 * 60 - diff;
      return diff <= 90;
    });

    const candidateShifts = similarEndShifts.length > 0 ? similarEndShifts : allPastShifts;

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

    if (similarEndShifts.length > 0) {
      const typeCounts = {};
      similarEndShifts.forEach(s => {
        if (s.type) typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
      });
      const topType = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a])[0];
      if (topType) detectedType = topType;

      const breakCounts = {};
      similarEndShifts.forEach(s => {
        const b = Number(s.breakMinutes) || 0;
        breakCounts[b] = (breakCounts[b] || 0) + 1;
      });
      const topBreak = Object.keys(breakCounts).sort((a, b) => breakCounts[b] - breakCounts[a])[0];
      if (topBreak !== undefined) detectedBreak = Number(topBreak);
    }
  }

  let startTotalMins = (endTotalMins - durationMinutes + 24 * 60) % (24 * 60);
  let startHour = Math.floor(startTotalMins / 60);
  let startMin = startTotalMins % 60;
  let defaultStart = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

  if (!detectedType) {
    if (endHour >= 18 || endHour < 5 || startHour >= 16) {
      detectedType = 'Tối';
    } else if (endHour >= 13 && endHour < 18) {
      detectedType = 'Trưa';
    } else {
      detectedType = 'Sáng';
    }
  }

  const defaultDay = prefill?.day || getVietnameseDayOfWeek(now);

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

export const slugify = (text) => {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim();
};
