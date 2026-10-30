import { state, getWorkplaceColor } from '../state.js';
import { escapeHtml, getShiftRate, fmtCurrency } from '../calculator.js';
import { t } from '../i18n.js';
export const setupCustomSelect = (selectId) => {
  const select = document.getElementById(selectId);
  if (!select) return;

  const parent = select.parentElement;
  let wrapper = parent.querySelector(`.custom-select-wrapper[data-for="${selectId}"]`);

  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper' + (select.classList.contains('font-mono') ? ' font-mono' : '');
    wrapper.setAttribute('data-for', selectId);

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const label = document.createElement('span');
    label.className = 'custom-select-label';

    const chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron-icon';
    chevron.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="m6 9 6 6 6-6"></path></svg>`;

    trigger.appendChild(label);
    trigger.appendChild(chevron);

    const menu = document.createElement('div');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    select.classList.add('native-select-hidden');
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      closeAllCustomSelects();
      if (!isOpen) {
        const rect = wrapper.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 220 && spaceAbove > 180) {
          wrapper.classList.add('open-up');
        } else {
          wrapper.classList.remove('open-up');
        }

        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');

        const formItem = wrapper.closest('.form-item');
        if (formItem) formItem.classList.add('has-open-dropdown');
        const formGrid = wrapper.closest('.form-grid-2');
        if (formGrid) formGrid.classList.add('has-open-dropdown');
        const filterTray = wrapper.closest('.shifts-filter-tray');
        if (filterTray) filterTray.classList.add('has-open-dropdown');
        const filterInner = wrapper.closest('.filter-tray-inner');
        if (filterInner) filterInner.classList.add('has-open-dropdown');
        const filterWp = wrapper.closest('.filter-wp-wrap');
        if (filterWp) filterWp.classList.add('has-open-dropdown');
        const modalBody = wrapper.closest('.modal-body');
        if (modalBody) modalBody.classList.add('has-open-dropdown');
      }
    });
  }

  const menu = wrapper.querySelector('.custom-select-menu');
  const label = wrapper.querySelector('.custom-select-label');
  menu.innerHTML = '';

  const options = Array.from(select.options);
  const selectedOption = select.options[select.selectedIndex] || options[0];

  const updateTriggerLabel = () => {
    if (!label) return;
    const curOpt = select.options[select.selectedIndex] || options[0];
    if (!curOpt) {
      label.textContent = '';
      return;
    }
    if (selectId === 'shiftWorkplace' && curOpt.value) {
      const wpCol = getWorkplaceColor(curOpt.value);
      label.innerHTML = `
        <span class="workplace-item-left">
          <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
          <span>${escapeHtml(curOpt.value)}</span>
        </span>
      `;
    } else {
      label.textContent = curOpt.textContent;
    }
  };

  updateTriggerLabel();

  options.forEach((opt) => {
    const item = document.createElement('div');
    const isSelected = opt.value === select.value || (opt.selected && !select.value);
    item.className = 'custom-select-option' + (isSelected ? ' is-selected' : '');
    item.setAttribute('role', 'option');
    item.setAttribute('data-value', opt.value);

    if (selectId === 'shiftWorkplace' && opt.value) {
      const wpCol = getWorkplaceColor(opt.value);
      const rate = getShiftRate({ workplace: opt.value });
      item.innerHTML = `
        <div class="workplace-item-left">
          <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
          <span>${escapeHtml(opt.value)}</span>
        </div>
        <div class="workplace-item-right">
          <span class="workplace-item-rate font-mono">${fmtCurrency(rate)}/h</span>
          <span class="custom-select-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13">
              <path d="M20 6 9 17l-5-5"></path>
            </svg>
          </span>
        </div>
      `;
    } else {
      const textSpan = document.createElement('span');
      textSpan.textContent = opt.textContent;

      const checkIcon = document.createElement('span');
      checkIcon.className = 'custom-select-check';
      checkIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M20 6 9 17l-5-5"></path></svg>`;

      item.appendChild(textSpan);
      item.appendChild(checkIcon);
    }

    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      select.value = opt.value;
      updateTriggerLabel();
      wrapper.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('is-selected'));
      item.classList.add('is-selected');
      closeAllCustomSelects();

      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    menu.appendChild(item);
  });
};

export const syncCustomSelect = (selectId) => {
  const select = document.getElementById(selectId);
  if (!select) return;
  const parent = select.parentElement;
  const wrapper = parent.querySelector(`.custom-select-wrapper[data-for="${selectId}"]`);
  if (!wrapper) {
    setupCustomSelect(selectId);
    return;
  }
  const label = wrapper.querySelector('.custom-select-label');
  const selectedOption = select.options[select.selectedIndex];
  if (label && selectedOption) {
    if (selectId === 'shiftWorkplace' && selectedOption.value) {
      const wpCol = getWorkplaceColor(selectedOption.value);
      label.innerHTML = `
        <span class="workplace-item-left">
          <span class="wb-color-dot" style="background:${wpCol.fill};"></span>
          <span>${escapeHtml(selectedOption.value)}</span>
        </span>
      `;
    } else {
      label.textContent = selectedOption.textContent;
    }
  }
  wrapper.querySelectorAll('.custom-select-option').forEach(el => {
    if (el.getAttribute('data-value') === select.value) {
      el.classList.add('is-selected');
    } else {
      el.classList.remove('is-selected');
    }
  });
};

export const closeAllCustomSelects = () => {
  document.querySelectorAll('.custom-select-wrapper.open').forEach(el => {
    el.classList.remove('open');
    el.classList.remove('open-up');
    const trigger = el.querySelector('.custom-select-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.has-open-dropdown').forEach(el => {
    el.classList.remove('has-open-dropdown');
  });
  };
