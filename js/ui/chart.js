import { state, getCurrentWeek, getWorkplaceColor } from '../state.js';
import { fmtCurrency, fmtHours, getVietnameseDayOfWeek, getMondayDate, getShiftEarnings, getShiftDateShort, getWeekDateRangeDisplay, escapeHtml } from '../calculator.js';
import { t, getLocalizedDayName, getLocalizedWeekName } from '../i18n.js';

let allWeeksModalOpener = null;
export const setAllWeeksModalOpener = (fn) => {
  allWeeksModalOpener = fn;
};
const triggerOpenAllWeeksModal = (tab) => {
  if (typeof allWeeksModalOpener === 'function') allWeeksModalOpener(tab);
};
export const drawDashboardWeekChart = (week) => {
  const canvas = document.getElementById('dashboardWeekCanvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth || 600;
  const height = 72;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const dayEarnings = { T2: 0, T3: 0, T4: 0, T5: 0, T6: 0, T7: 0, CN: 0 };

  if (week && Array.isArray(week.shifts)) {
    week.shifts.forEach((s) => {
      const d = (s.day || '').toUpperCase().trim();
      if (dayEarnings[d] !== undefined) {
        dayEarnings[d] += getShiftEarnings(s, week);
      }
    });
  }

  const values = days.map(d => dayEarnings[d]);
  const maxVal = Math.max(...values, 100000);

  const padLeft = 24;
  const padRight = 24;
  const padTop = 14;
  const padBottom = 20;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const isDark = document.body.classList.contains('dark-mode');

  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(padLeft, padTop + chartH);
  ctx.lineTo(width - padRight, padTop + chartH);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padLeft, padTop + chartH / 2);
  ctx.lineTo(width - padRight, padTop + chartH / 2);
  ctx.stroke();

  const points = days.map((d, i) => {
    const x = padLeft + (i / (days.length - 1)) * chartW;
    const norm = values[i] / maxVal;
    const y = padTop + chartH - (norm * (chartH - 4));
    return { x, y, val: values[i], day: d };
  });

  if (points.length > 0) {
    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    if (isDark) {
      areaGrad.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
      areaGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
      areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    } else {
      areaGrad.addColorStop(0, 'rgba(37, 99, 235, 0.16)');
      areaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(mx, p0.y, mx, p1.y, p1.x, p1.y);
    }

    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.lineTo(points[0].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    const strokeGrad = ctx.createLinearGradient(padLeft, 0, width - padRight, 0);
    strokeGrad.addColorStop(0, '#3b82f6');
    strokeGrad.addColorStop(0.5, '#10b981');
    strokeGrad.addColorStop(1, '#8b5cf6');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      ctx.bezierCurveTo(mx, p0.y, mx, p1.y, p1.x, p1.y);
    }
    ctx.strokeStyle = strokeGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    points.forEach((pt) => {
      ctx.fillStyle = pt.val > 0 ? (isDark ? '#e2e8f0' : '#0f172a') : '#64748b';
      ctx.font = '500 10px Inter, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.day, pt.x, height - 3);

      if (pt.val > 0) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isDark ? '#0c0d12' : '#ffffff';
        ctx.stroke();
      }
    });
  }
};

export let analyticsState = {
  timeFilter: 'current',
  workplaceFilter: 'all'
};

export const getAnalyticsData = () => {
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

export const compactCurrency = (val) => {
  const num = Math.round(val || 0);
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'k';
  return num.toString();
};

export const drawRoundedBar = (ctx, x, y, width, height, radius) => {
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

export const drawTimelineChart = (data) => {
  const canvas = document.getElementById('timelineChartCanvas');
  if (!canvas) return;
  const parent = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = parent.clientWidth || 560;
  const height = 150;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padLeft = 36;
  const padRight = 14;
  const padTop = 20;
  const padBottom = 34;
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
        label: getLocalizedDayName(d),
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
        label: getLocalizedWeekName(w.name),
        subLabel: range ? range.split('–')[0].trim() : '',
        salary,
        hours
      };
    });
  }

  const maxVal = Math.max(...points.map(p => p.salary), 100000);
  const roundedMax = Math.ceil(maxVal / 100000) * 100000;

  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#ededef' : '#0f1115';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const subtextColor = isDark ? '#8b8d98' : '#64666e';
  const emptyBarColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#e5e7eb';

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
        grad.addColorStop(0, '#2563eb');
        grad.addColorStop(1, '#3b82f6');
      }
      ctx.fillStyle = grad;
      drawRoundedBar(ctx, barX, barY, barWidth, barHeight, 4);

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
    ctx.fillText(p.label, cx, padTop + chartH + 13);

    if (p.subLabel) {
      ctx.fillStyle = subtextColor;
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(p.subLabel, cx, padTop + chartH + 24);
    }
  });
};

export const drawDonutChart = (data) => {
  const canvas = document.getElementById('donutChartCanvas');
  if (!canvas || canvas.style.display === 'none') return;
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
  const textColor = isDark ? '#ededef' : '#0f1115';
  const subtextColor = isDark ? '#8b8d98' : '#64666e';
  const emptyCircleColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e5e7eb';

  if (data.totalSalary <= 0 || data.workplaceList.length === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = emptyCircleColor;
    ctx.lineWidth = outerR - innerR;
    ctx.stroke();

    ctx.fillStyle = subtextColor;
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('no_shifts', 'Chưa có ca'), cx, cy + 4);
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
  ctx.fillText(t('lbl_total_revenue', 'Tổng thu'), cx, cy + 15);
};

export const renderAnalyticsDashboard = () => {
  const data = getAnalyticsData();

  document.getElementById('akTotalSalary').textContent = fmtCurrency(data.totalSalary);
  document.getElementById('akTotalHours').textContent = fmtHours(data.totalHours);
  document.getElementById('akTotalShifts').textContent = `${data.totalShifts} ${t('unit_shift', 'ca')}`;
  document.getElementById('akTopWorkplace').textContent = data.topWp;
  document.getElementById('akTopWorkplaceShare').textContent = `${data.topShare} ${t('lbl_total_revenue', 'tổng thu')}`;

  const avgH = data.totalShifts > 0 ? (data.totalHours / data.totalShifts).toFixed(1) : '0.0';
  const avgEl = document.getElementById('akAvgHoursPerShift');
  if (avgEl) avgEl.textContent = `${avgH}${t('unit_hour', 'h')} / ${t('unit_shift', 'ca')}`;

  const wpCountEl = document.getElementById('akWorkplaceCount');
  if (wpCountEl) wpCountEl.textContent = `${data.workplaceList.length} ${t('unit_workplaces', 'nơi làm')}`;

  const periodNames = {
    'current': t('time_this_week', 'Tuần này'),
    'recent': t('time_4_weeks', '4 tuần gần nhất'),
    'all': t('time_all_weeks', 'Tất cả các tuần')
  };
  document.getElementById('akSalaryPeriod').textContent = periodNames[analyticsState.timeFilter] || '';

  const subtitle = document.getElementById('timelineChartSubtitle');
  if (subtitle) {
    subtitle.textContent = analyticsState.timeFilter === 'current' ? t('chart_sub_daily', 'Theo ngày (đ)') : t('chart_sub_weekly', 'Theo tuần (đ)');
  }
  const title = document.getElementById('timelineChartTitle');
  if (title) {
    title.textContent = analyticsState.timeFilter === 'current' ? t('chart_title_daily', 'Thu nhập theo ngày làm việc') : t('chart_title_weekly', 'Thu nhập theo từng tuần');
  }

  const pillsContainer = document.getElementById('analyticsWorkplaceFilterPills');
  if (pillsContainer) {
    pillsContainer.innerHTML = '';
    const allPill = document.createElement('button');
    allPill.type = 'button';
    allPill.className = `filter-pill-btn font-mono ${analyticsState.workplaceFilter === 'all' ? 'active' : ''}`;
    allPill.textContent = t('filter_all', 'Tất cả');
    allPill.addEventListener('click', () => {
      analyticsState.workplaceFilter = 'all';
      renderAnalyticsDashboard();
    });
    pillsContainer.appendChild(allPill);

    data.availableWorkplaces.forEach(wp => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `filter-pill-btn font-mono ${analyticsState.workplaceFilter === wp ? 'active' : ''}`;
      const col = getWorkplaceColor(wp);
      chip.innerHTML = `<span class="wb-color-dot" style="background:${col.fill};"></span><span>${escapeHtml(wp)}</span>`;
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
      breakdownContainer.innerHTML = `<span class="field-hint" style="font-size:0.8rem;">${t('no_shift_data', 'Chưa có dữ liệu ca làm việc.')}</span>`;
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

export const openAnalyticsModal = () => {
  triggerOpenAllWeeksModal('analytics');
};
