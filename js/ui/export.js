import { state, getCurrentWeek } from '../state.js';
import { slugify, getShiftRate, getShiftEarnings, calculateWeekTotalSalary, getWeekDateRangeDisplay, getShiftDateFull } from '../calculator.js';
import { t, getLocalizedWeekName, getLocalizedDayName, getLocalizedShiftType } from '../i18n.js';
import { showToast } from './toast.js';
import { saveWeeks, saveSettings } from '../services/supabase.js';
import { closeModal } from './modals.js';

let appRenderer = null;
export const setExportAppRenderer = (fn) => {
  appRenderer = fn;
};
const triggerAppRender = () => {
  if (typeof appRenderer === 'function') appRenderer();
};
export const exportCurrentWeekCSV = () => {
  const week = getCurrentWeek();
  if (!week) return;

  let csvContent = '\uFEFF';
  const unit = t('rate_unit', 'đ/h');
  csvContent += `${t('csv_slip_title', 'BẢNG CHẤM CÔNG VÀ LƯƠNG')} — ${getLocalizedWeekName(week.name)}\r\n\r\n`;
  csvContent += `"${t('csv_col_day', 'Thứ')}","${t('csv_col_type', 'Ca')}","${t('csv_col_workplace', 'Nơi làm việc')}","${t('csv_col_rate', 'Đơn giá')} (${unit})","${t('csv_col_start', 'Giờ bắt đầu')}","${t('csv_col_end', 'Giờ kết thúc')}","${t('csv_col_break', 'Nghỉ (phút)')}","${t('csv_col_hours', 'Số giờ')}","${t('csv_col_ot', 'Hệ số OT')}","${t('csv_col_allowance', 'Thưởng/Phụ cấp')}","${t('csv_col_total', 'Thành tiền')}","${t('csv_col_note', 'Ghi chú')}"\r\n`;

  week.shifts.forEach(s => {
    const rate = getShiftRate(s);
    const salary = getShiftEarnings(s, week);
    const ot = Number(s.otRate) || 1.0;
    const allowance = Number(s.allowance) || 0;
    csvContent += `"${getLocalizedDayName(s.day)}","${getLocalizedShiftType(s.type)}","${(s.workplace || '').replace(/"/g, '""')}",${rate},"${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${ot},${allowance},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
  });

  const totalHours = week.shifts.reduce((acc, s) => acc + Number(s.hours || 0), 0);
  const totalSalary = calculateWeekTotalSalary(week);
  csvContent += `\r\n"${t('csv_grand_total', 'TỔNG CỘNG')}",,,,"",,,,,${totalHours.toFixed(2)},,${Math.round(totalSalary)},""\r\n`;

  downloadFile(csvContent, `${slugify(week.name)}_salary.csv`, 'text/csv;charset=utf-8;');
  showToast(`${t('toast_csv_exported', 'Đã xuất file CSV cho')} ${getLocalizedWeekName(week.name)}`);
};

export const exportAllWeeksCSV = () => {
  let csvContent = '\uFEFF';
  const unit = t('rate_unit', 'đ/h');
  csvContent += `${t('csv_all_weeks_title', 'TỔNG HỢP CA LÀM VIỆC VÀ LƯƠNG TẤT CẢ CÁC TUẦN')}\r\n\r\n`;
  csvContent += `"${t('csv_col_week', 'Tuần')}","${t('csv_col_date_range', 'Khoảng ngày')}","${t('csv_col_rate', 'Đơn giá')} (${unit})","${t('csv_col_work_date', 'Ngày làm')}","${t('csv_col_day', 'Thứ')}","${t('csv_col_type', 'Ca')}","${t('csv_col_workplace', 'Nơi làm việc')}","${t('csv_col_start', 'Bắt đầu')}","${t('csv_col_end', 'Kết thúc')}","${t('csv_col_break', 'Nghỉ (phút)')}","${t('csv_col_hours', 'Số giờ')}","${t('csv_col_ot', 'Hệ số OT')}","${t('csv_col_allowance', 'Thưởng/Phụ cấp')}","${t('csv_col_total', 'Thành tiền')}","${t('csv_col_note', 'Ghi chú')}"\r\n`;

  let grandTotalHours = 0;
  let grandTotalSalary = 0;

  state.weeks.forEach(w => {
    const weekRange = getWeekDateRangeDisplay(w);
    w.shifts.forEach(s => {
      const rate = getShiftRate(s);
      const salary = getShiftEarnings(s, w);
      const ot = Number(s.otRate) || 1.0;
      const allowance = Number(s.allowance) || 0;
      const shiftFullDate = getShiftDateFull(w, s.day);
      grandTotalHours += Number(s.hours || 0);
      grandTotalSalary += salary;
      csvContent += `"${getLocalizedWeekName(w.name)}","${weekRange}",${rate},"${shiftFullDate}","${getLocalizedDayName(s.day)}","${getLocalizedShiftType(s.type)}","${(s.workplace || '').replace(/"/g, '""')}","${s.start}","${s.end}",${s.breakMinutes || 0},${s.hours},${ot},${allowance},${Math.round(salary)},"${(s.note || '').replace(/"/g, '""')}"\r\n`;
    });
  });

  csvContent += `\r\n"${t('csv_grand_total', 'TỔNG CỘNG')}",,,,,,,,,,${grandTotalHours.toFixed(2)},,,${Math.round(grandTotalSalary)},""\r\n`;

  downloadFile(csvContent, `tong_hop_luong_cac_tuan.csv`, 'text/csv;charset=utf-8;');
  showToast(t('toast_csv_all_exported', 'Đã xuất tổng hợp toàn bộ các tuần'));
};

export const backupJSON = () => {
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

export const restoreJSON = (e) => {
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
        triggerAppRender();
        showToast(t('toast_imported_success', 'Đã nhập dữ liệu thành công!'));
      } else {
        alert(t('toast_invalid_json', 'File JSON không hợp lệ hoặc thiếu dữ liệu.'));
      }
    } catch (err) {
      alert(t('alert_file_read_error', 'Không thể đọc file: ') + err.message);
    }
  };
  reader.readAsText(file);
};

export const downloadFile = (content, filename, type) => {
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
