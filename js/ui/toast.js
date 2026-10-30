import { escapeHtml } from '../calculator.js';
import { t } from '../i18n.js';

export const showToast = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.display = 'inline-flex';
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (!toast.classList.contains('visible')) {
        toast.style.display = 'none';
      }
    }, 240);
  }, 2500);
};

export const showToastWithAction = (message, actionText, actionCallback, duration = 8000) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = `
    <span>${message}</span>
    <button type="button" class="toast-action-btn" id="btnToastAction" title="${escapeHtml(actionText || t('btn_undo', 'Hoàn tác'))}" aria-label="${escapeHtml(actionText || t('btn_undo', 'Hoàn tác'))}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5h5"></path>
      </svg>
      <span>${escapeHtml(actionText || t('btn_undo', 'Hoàn tác'))}</span>
    </button>
  `;
  toast.style.display = 'inline-flex';
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  clearTimeout(toast._timer);

  const btn = document.getElementById('btnToastAction');
  if (btn) {
    btn.onclick = () => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (!toast.classList.contains('visible')) toast.style.display = 'none';
      }, 240);
      if (typeof actionCallback === 'function') actionCallback();
    };
  }

  toast._timer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      if (!toast.classList.contains('visible')) toast.style.display = 'none';
    }, 240);
  }, duration);
};
