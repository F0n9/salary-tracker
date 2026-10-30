import { getCurrentWeek } from '../state.js';
import { fmtCurrency, getShiftEarnings, hoursToColonFormat, slugify } from '../calculator.js';
import { t, getLocalizedWeekName, getLocalizedDayName, getLocalizedShiftType } from '../i18n.js';
import { showToast } from './toast.js';

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = typeof radius === 'number'
    ? { tl: radius, tr: radius, br: radius, bl: radius }
    : { tl: radius.tl || 0, tr: radius.tr || 0, br: radius.br || 0, bl: radius.bl || 0 };

  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + width - r.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
  ctx.lineTo(x + width, y + height - r.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
  ctx.lineTo(x + r.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
};

export const renderSlipCanvas = () => {
  const week = getCurrentWeek();
  const canvas = document.getElementById('slipCanvas');
  if (!canvas || !week) return;

  const ctx = canvas.getContext('2d');
  const dpr = Math.max(window.devicePixelRatio || 1, 2);

  const includeMoney = document.getElementById('slipIncludeMoney')?.checked;
  const shifts = week.shifts || [];

  const padX = 18;
  const padTop = 20;
  const totalWidth = 510;
  const contentWidth = totalWidth - padX * 2;

  const headerHeight = 44;
  const thHeight = 36;
  const rowHeight = 34;
  const totalRowHeight = 40;
  const footerHeight = 28;

  const totalHeight = padTop + headerHeight + thHeight + (shifts.length * rowHeight) + totalRowHeight + footerHeight;

  canvas.width = totalWidth * dpr;
  canvas.height = totalHeight * dpr;
  canvas.style.maxWidth = `${totalWidth}px`;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';

  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, totalWidth, totalHeight);
  drawRoundedRect(ctx, 0.5, 0.5, totalWidth - 1, totalHeight - 1, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  const accentGrad = ctx.createLinearGradient(padX, 0, padX + contentWidth, 0);
  accentGrad.addColorStop(0, '#2563eb');
  accentGrad.addColorStop(1, '#3b82f6');
  drawRoundedRect(ctx, padX + 30, 0.5, contentWidth - 60, 3, { tl: 0, tr: 0, br: 2, bl: 2 });
  ctx.fillStyle = accentGrad;
  ctx.fill();

  const weekTitle = (getLocalizedWeekName(week.name) || t('week_prefix', 'Tuần')).toUpperCase();
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 16px "Be Vietnam Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(weekTitle, totalWidth / 2, padTop + 26);

  const tableY = padTop + headerHeight;
  let colWidths;
  let thTitles;

  if (includeMoney) {
    colWidths = [124, 75, 75, 85, 115];
    thTitles = [
      t('slip_th_shift', 'Ca'),
      t('slip_th_start', 'Giờ vào'),
      t('slip_th_end', 'Giờ ra'),
      t('slip_th_hours', 'Số giờ'),
      t('slip_th_amount', 'Thành tiền')
    ];
  } else {
    colWidths = [159, 105, 105, 105];
    thTitles = [
      t('slip_th_shift', 'Ca'),
      t('slip_th_start', 'Giờ vào'),
      t('slip_th_end', 'Giờ ra'),
      t('slip_th_hours', 'Số giờ')
    ];
  }

  const colX = [padX];
  for (let i = 0; i < colWidths.length - 1; i++) {
    colX.push(colX[i] + colWidths[i]);
  }

  drawRoundedRect(ctx, padX, tableY, contentWidth, thHeight, { tl: 8, tr: 8, br: 0, bl: 0 });
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '600 11.5px "Be Vietnam Pro", sans-serif';
  for (let i = 0; i < thTitles.length; i++) {
    const isRight = (includeMoney && i === 4);
    const isLeft = (i === 0);
    ctx.textAlign = isRight ? 'right' : (isLeft ? 'left' : 'center');
    const tx = isRight ? (colX[i] + colWidths[i] - 12) : (isLeft ? (colX[i] + 12) : (colX[i] + colWidths[i] / 2));
    ctx.fillText(thTitles[i], tx, tableY + 23);
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

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, curY + rowHeight - 0.5);
    ctx.lineTo(padX + contentWidth, curY + rowHeight - 0.5);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'left';
    const otExtra = (s.otRate && Number(s.otRate) > 1) ? ` (x${s.otRate})` : '';
    const shiftLabel = `${getLocalizedDayName(s.day)} ${getLocalizedShiftType(s.type)}${otExtra}`;
    ctx.fillText(shiftLabel, colX[0] + 12, curY + 22);

    ctx.fillStyle = '#475569';
    ctx.font = '500 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.start, colX[1] + colWidths[1] / 2, curY + 22);
    ctx.fillText(s.end, colX[2] + colWidths[2] / 2, curY + 22);

    ctx.fillStyle = '#0f172a';
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(hoursToColonFormat(s.hours), colX[3] + colWidths[3] / 2, curY + 22);

    if (includeMoney) {
      ctx.fillStyle = '#2563eb';
      ctx.font = '600 12.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(fmtCurrency(shiftWage), colX[4] + colWidths[4] - 12, curY + 22);
    }

    curY += rowHeight;
  });

  drawRoundedRect(ctx, padX, curY, contentWidth, totalRowHeight, { tl: 0, tr: 0, br: 8, bl: 8 });
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 13px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(t('slip_total', 'Tổng'), colX[0] + 12, curY + 25);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(hoursToColonFormat(totalHours), colX[3] + colWidths[3] / 2, curY + 25);

  if (includeMoney) {
    const totalSalary = shifts.reduce((acc, s) => acc + getShiftEarnings(s, week), 0);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 13.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(fmtCurrency(totalSalary), colX[4] + colWidths[4] - 12, curY + 25);
  }

  drawRoundedRect(ctx, padX, tableY, contentWidth, thHeight + (shifts.length * rowHeight) + totalRowHeight, 8);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 10.5px "Be Vietnam Pro", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Salary Tracker', totalWidth / 2, totalHeight - 11);
};

export const openShareSlipModal = () => {
  const week = getCurrentWeek();
  if (!week) return;

  document.getElementById('shareSlipModalTitle').textContent = t('slip_modal_title', 'Phiếu chấm công');
  renderSlipCanvas();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => renderSlipCanvas());
  }
  document.getElementById('shareSlipModal').style.display = 'flex';
};

export const downloadSlipImage = () => {
  const canvas = document.getElementById('slipCanvas');
  const week = getCurrentWeek();
  if (!canvas || !week) return;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const weekSlug = slugify(week.name).replace(/-/g, '_').toUpperCase();
  const fileName = `Bang_Luong_${weekSlug}_${y}${m}${d}.png`;

  const a = document.createElement('a');
  a.download = fileName;
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast(t('toast_slip_downloaded', 'Đã tải ảnh bảng chấm công!'));
};

export const copySlipImageToClipboard = async () => {
  const canvas = document.getElementById('slipCanvas');
  if (!canvas) return;

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToast(t('toast_slip_copied', 'Đã chép ảnh vào Clipboard! Mở Zalo bấm Ctrl+V để gửi.'));
      } else {
        downloadSlipImage();
      }
    } catch (err) {
      console.warn('Clipboard write image failed, downloading instead:', err);
      downloadSlipImage();
    }
  }, 'image/png');
};
