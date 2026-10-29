import { escapeHtml } from '../calculator.js';
import { t } from '../i18n.js';

export const showToast = (message) => {
  const toast = document.getElementById('toast');
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, 2400);
};

export const showToastWithAction = (message, actionText, actionCallback, duration = 8000) => {
  const toast = document.getElementById('toast');
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" class="toast-action-btn" id="btnToastAction" title="${escapeHtml(actionText || t('btn_undo', 'Hoàn tác'))}" aria-label="${escapeHtml(actionText || t('btn_undo', 'Hoàn tác'))}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" width="14" height="14">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
      </svg>
    </button>
  `;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);

  const btn = document.getElementById('btnToastAction');
  if (btn) {
    btn.onclick = () => {
      toast.style.display = 'none';
      if (typeof actionCallback === 'function') actionCallback();
    };
  }

  toast._timer = setTimeout(() => {
    toast.style.display = 'none';
  }, duration);
};
