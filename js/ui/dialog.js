import { t } from '../i18n.js';

let activeDialogResolve = null;
let currentKeyHandler = null;

const ICONS = {
  danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
};

const BTN_ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const BTN_ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>';
const BTN_ICON_LOGOUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>';
const BTN_ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

const closeDialog = (result) => {
  if (currentKeyHandler) {
    window.removeEventListener('keydown', currentKeyHandler);
    currentKeyHandler = null;
  }

  const modal = document.getElementById('appDialogModal');
  if (modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      if (!modal.classList.contains('open')) {
        modal.style.display = 'none';
      }
    }, 180);
  }

  if (activeDialogResolve) {
    const resolve = activeDialogResolve;
    activeDialogResolve = null;
    resolve(result);
  }
};

export const showConfirmDialog = (options = {}) => {
  const opts = typeof options === 'string' ? { message: options } : (options || {});

  return new Promise((resolve) => {
    if (activeDialogResolve) {
      activeDialogResolve(false);
    }
    activeDialogResolve = resolve;

    const modal = document.getElementById('appDialogModal');
    if (!modal) {
      resolve(false);
      return;
    }

    const titleEl = document.getElementById('appDialogTitle');
    const subtitleEl = document.getElementById('appDialogSubtitle');
    const msgEl = document.getElementById('appDialogMessage');
    const detailCardEl = document.getElementById('appDialogDetailCard');
    const detailTextEl = document.getElementById('appDialogDetailText');
    const badgeEl = document.getElementById('appDialogIconBadge');
    const cancelBtn = document.getElementById('appDialogCancelBtn');
    const confirmBtn = document.getElementById('appDialogConfirmBtn');

    const isDanger = Boolean(opts.isDanger);
    const isWarning = Boolean(opts.isWarning);
    const iconKey = opts.iconType || (isDanger ? 'delete' : (isWarning ? 'warning' : 'info'));

    if (titleEl) {
      titleEl.textContent = opts.title || (isDanger ? t('confirm_title', 'Xác nhận xóa') : (isWarning ? t('warning_title', 'Cảnh báo') : t('confirm_title', 'Xác nhận')));
    }

    if (subtitleEl) {
      if (opts.subtitle) {
        subtitleEl.textContent = opts.subtitle;
        subtitleEl.style.display = '';
      } else {
        subtitleEl.textContent = '';
        subtitleEl.style.display = 'none';
      }
    }

    if (msgEl) {
      msgEl.textContent = opts.message || '';
    }

    if (detailCardEl && detailTextEl) {
      if (opts.details) {
        detailTextEl.textContent = opts.details;
        detailCardEl.style.display = 'flex';
      } else {
        detailTextEl.textContent = '';
        detailCardEl.style.display = 'none';
      }
    }

    if (badgeEl) {
      badgeEl.className = 'app-dialog-icon-badge ' + (isDanger ? 'danger' : (isWarning ? 'warning' : 'info'));
      badgeEl.innerHTML = ICONS[iconKey] || ICONS.info;
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'inline-flex';
      cancelBtn.className = 'btn-action-secondary btn-icon-only';
      cancelBtn.innerHTML = BTN_ICON_CLOSE;
      const cancelLabel = opts.cancelText || t('btn_cancel', 'Hủy');
      cancelBtn.title = cancelLabel;
      cancelBtn.setAttribute('aria-label', cancelLabel);
    }

    if (confirmBtn) {
      confirmBtn.className = (isDanger ? 'btn-action-danger' : 'btn-action-primary') + ' btn-icon-only';
      confirmBtn.innerHTML = isDanger ? (iconKey === 'logout' ? BTN_ICON_LOGOUT : BTN_ICON_TRASH) : BTN_ICON_CHECK;
      const confirmLabel = opts.confirmText || (isDanger ? t('btn_delete', 'Xóa') : t('dialog_btn_ok', 'Đồng ý'));
      confirmBtn.title = confirmLabel;
      confirmBtn.setAttribute('aria-label', confirmLabel);
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('open');
      if (confirmBtn) confirmBtn.focus();
    });

    currentKeyHandler = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(false);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        closeDialog(true);
      }
    };
    window.addEventListener('keydown', currentKeyHandler);
  });
};

export const showAlertDialog = (options = {}) => {
  const opts = typeof options === 'string' ? { message: options } : (options || {});

  return new Promise((resolve) => {
    if (activeDialogResolve) {
      activeDialogResolve(true);
    }
    activeDialogResolve = resolve;

    const modal = document.getElementById('appDialogModal');
    if (!modal) {
      resolve();
      return;
    }

    const titleEl = document.getElementById('appDialogTitle');
    const subtitleEl = document.getElementById('appDialogSubtitle');
    const msgEl = document.getElementById('appDialogMessage');
    const detailCardEl = document.getElementById('appDialogDetailCard');
    const detailTextEl = document.getElementById('appDialogDetailText');
    const badgeEl = document.getElementById('appDialogIconBadge');
    const cancelBtn = document.getElementById('appDialogCancelBtn');
    const confirmBtn = document.getElementById('appDialogConfirmBtn');

    const isError = Boolean(opts.isError);
    const iconKey = opts.iconType || (isError ? 'error' : 'info');

    if (titleEl) {
      titleEl.textContent = opts.title || (isError ? t('dialog_err_title', 'Lỗi') : t('dialog_info_title', 'Thông báo'));
    }

    if (subtitleEl) {
      if (opts.subtitle) {
        subtitleEl.textContent = opts.subtitle;
        subtitleEl.style.display = '';
      } else {
        subtitleEl.textContent = '';
        subtitleEl.style.display = 'none';
      }
    }

    if (msgEl) {
      msgEl.textContent = opts.message || '';
    }

    if (detailCardEl && detailTextEl) {
      if (opts.details) {
        detailTextEl.textContent = opts.details;
        detailCardEl.style.display = 'flex';
      } else {
        detailTextEl.textContent = '';
        detailCardEl.style.display = 'none';
      }
    }

    if (badgeEl) {
      badgeEl.className = 'app-dialog-icon-badge ' + (isError ? 'danger' : 'info');
      badgeEl.innerHTML = ICONS[iconKey] || ICONS.info;
    }

    if (cancelBtn) {
      cancelBtn.style.display = 'none';
    }

    if (confirmBtn) {
      confirmBtn.className = 'btn-action-primary btn-icon-only';
      confirmBtn.innerHTML = BTN_ICON_CHECK;
      const okLabel = opts.okText || t('dialog_btn_understood', 'Đã hiểu');
      confirmBtn.title = okLabel;
      confirmBtn.setAttribute('aria-label', okLabel);
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('open');
      if (confirmBtn) confirmBtn.focus();
    });

    currentKeyHandler = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        closeDialog(true);
      }
    };
    window.addEventListener('keydown', currentKeyHandler);
  });
};

export const initDialogHandlers = () => {
  const modal = document.getElementById('appDialogModal');
  if (!modal) return;

  const closeBtn = document.getElementById('appDialogCloseBtn');
  const cancelBtn = document.getElementById('appDialogCancelBtn');
  const confirmBtn = document.getElementById('appDialogConfirmBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeDialog(false));
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => closeDialog(false));
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => closeDialog(true));
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeDialog(false);
    }
  });
};
