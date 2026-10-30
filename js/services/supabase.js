import { SUPABASE_URL, SUPABASE_ANON_KEY, GUEST_DEFAULT_DATA, GUEST_WEEKS_KEY, GUEST_SETTINGS_KEY, PENDING_SYNC_KEY } from '../config.js';
import { state, getWeeksStorageKey, getSettingsStorageKey, normalizeWorkplacesAndRates } from '../state.js';
import { t } from '../i18n.js';
import { ensureWeekStartDate } from '../calculator.js';
import { showToast } from '../ui/toast.js';
import { applyTheme } from '../theme.js';

let appRenderer = null;
export const setSupabaseAppRenderer = (fn) => {
  appRenderer = fn;
};
const triggerAppRender = () => {
  if (typeof appRenderer === 'function') appRenderer();
};
export let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}

const getPendingSyncKey = () => {
  return `${PENDING_SYNC_KEY}_${state.currentUser?.id || 'guest'}`;
};

const hasPendingSync = () => {
  try {
    return localStorage.getItem(getPendingSyncKey()) === '1';
  } catch (_) {
    return false;
  }
};

const markPendingSync = () => {
  try {
    localStorage.setItem(getPendingSyncKey(), '1');
    updateSyncStatusUI();
  } catch (_) {}
};

const clearPendingSync = () => {
  try {
    localStorage.removeItem(getPendingSyncKey());
    updateSyncStatusUI();
  } catch (_) {}
};

export const updateSyncStatusUI = (forcedState) => {
  const dot = document.getElementById('cloudSyncStatusDot');
  const text = document.getElementById('cloudSyncStatusText');
  if (!dot || !text) return;

  const isOnline = navigator.onLine;
  const isPending = hasPendingSync();

  if (forcedState === 'syncing') {
    dot.className = 'sync-status-dot syncing';
    text.textContent = t('cloud_syncing', 'Đang đồng bộ...');
  } else if (!isOnline) {
    dot.className = 'sync-status-dot offline';
    text.textContent = t('cloud_offline', 'Đang ngoại tuyến (Offline)');
  } else if (isPending) {
    dot.className = 'sync-status-dot pending';
    text.textContent = t('cloud_pending', 'Chờ kết nối mạng để đồng bộ');
  } else {
    dot.className = 'sync-status-dot synced';
    text.textContent = t('cloud_synced', 'Đã đồng bộ đám mây');
  }
};

export const syncPendingToCloud = async (isManual = false) => {
  if (!navigator.onLine) {
    updateSyncStatusUI();
    if (isManual) showToast(t('cloud_offline', 'Đang ngoại tuyến. Dữ liệu đã được lưu trữ an toàn cục bộ.'));
    return false;
  }

  if (!state.currentUser || !supabaseClient) {
    clearPendingSync();
    updateSyncStatusUI();
    if (isManual) showToast('Chế độ khách: Dữ liệu được lưu an toàn trên trình duyệt.');
    return true;
  }

  updateSyncStatusUI('syncing');

  try {
    const { error } = await supabaseClient.from('user_salary_data').upsert({
      user_id: state.currentUser.id,
      username: state.currentUser.username,
      weeks: state.weeks,
      settings: state.settings,
      updated_at: new Date().toISOString()
    });

    if (error) throw error;

    clearPendingSync();
    updateSyncStatusUI();
    if (isManual) {
      showToast(t('toast_sync_manual_done', 'Đã đồng bộ thành công dữ liệu đám mây!'));
    }
    return true;
  } catch (err) {
    console.warn('Sync pending to cloud failed:', err);
    markPendingSync();
    updateSyncStatusUI();
    if (isManual) {
      showToast(t('toast_sync_manual_fail', 'Không thể kết nối máy chủ để đồng bộ. Vui lòng thử lại.'));
    }
    return false;
  }
};

export const loadState = async () => {
  try {
    const isPending = hasPendingSync();
    if (state.currentUser && supabaseClient) {
      if (isPending) {
        const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
        const cachedSettings = localStorage.getItem(getSettingsStorageKey());
        if (cachedWeeks) {
          state.weeks = JSON.parse(cachedWeeks);
          if (cachedSettings) state.settings = JSON.parse(cachedSettings);
        }
        if (navigator.onLine) {
          syncPendingToCloud(false);
        }
      } else {
        const { data, error } = await supabaseClient
          .from('user_salary_data')
          .select('*')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (!error && data && Array.isArray(data.weeks) && data.weeks.length > 0) {
          state.weeks = data.weeks;
          if (data.settings) state.settings = { ...state.settings, ...data.settings };
          if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
          localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
          localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
        } else {
          const cachedWeeks = localStorage.getItem(getWeeksStorageKey());
          const cachedSettings = localStorage.getItem(getSettingsStorageKey());
          if (cachedWeeks) {
            state.weeks = JSON.parse(cachedWeeks);
            if (cachedSettings) state.settings = JSON.parse(cachedSettings);
            if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
          } else {
            state.weeks = [{ id: 'week-1', name: 'Tuần 1', rate: 0, shifts: [] }];
            if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
            saveWeeks();
          }
        }
      }
    } else {
      const guestWeeks = localStorage.getItem(GUEST_WEEKS_KEY);
      const guestSettings = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (guestWeeks) {
        try {
          const parsed = JSON.parse(guestWeeks);
          state.weeks = Array.isArray(parsed) && parsed.length > 0 ? parsed : JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
        } catch (_) {
          state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
        }
      } else {
        state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
      }
      if (guestSettings) {
        try {
          const parsedSet = JSON.parse(guestSettings);
          if (parsedSet) state.settings = { ...state.settings, ...parsedSet };
        } catch (_) {}
      }
      if (!Array.isArray(state.settings.workplaces)) state.settings.workplaces = [];
      saveWeeks();
    }

    normalizeWorkplacesAndRates();
    if (state.weeks.length > 0) {
      state.weeks.forEach((w, idx) => {
        ensureWeekStartDate(w, idx);
      });
      state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    }
  } catch (err) {
    console.error('Error loading state:', err);
    state.weeks = JSON.parse(JSON.stringify(GUEST_DEFAULT_DATA));
    state.currentWeekId = state.weeks[0].id;
  }
};

let cloudSyncTimer = null;

export const saveWeeks = () => {
  const weeksKey = getWeeksStorageKey();
  localStorage.setItem(weeksKey, JSON.stringify(state.weeks));

  if (state.currentUser && supabaseClient) {
    markPendingSync();
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(async () => {
      if (navigator.onLine) {
        await syncPendingToCloud(false);
      } else {
        markPendingSync();
      }
    }, 500);
  } else {
    clearPendingSync();
  }
};

export const syncWithSupabase = async () => {
  saveWeeks();
};
window.syncWithSupabase = syncWithSupabase;

export const saveSettings = () => {
  const settingsKey = getSettingsStorageKey();
  localStorage.setItem(settingsKey, JSON.stringify(state.settings));
  saveWeeks();
};

export const initAuth = async () => {
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        const u = session.user;
        const username = u.user_metadata?.username || u.email.split('@')[0];
        state.currentUser = { id: u.id, email: u.email, username };
      } else {
        state.currentUser = null;
      }
    } catch (e) {
      console.warn('Supabase auth check failed:', e);
      state.currentUser = null;
    }
  } else {
    state.currentUser = null;
  }

  updateHeaderAuthUI();
};

export const updateHeaderAuthUI = () => {
  const btn = document.getElementById('btnUserAuth');
  if (!btn) return;

  if (state.currentUser && state.currentUser.username) {
    btn.className = 'btn-morphic is-logged-in';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    btn.title = `${t('nav_account_user', 'Tài khoản')}: @${state.currentUser.username}`;
    btn.setAttribute('aria-label', btn.title);
  } else {
    btn.className = 'btn-morphic';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
    btn.title = t('nav_account', 'Đăng nhập / Đăng ký tài khoản');
    btn.setAttribute('aria-label', btn.title);
  }
};

export const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const rawInput = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');

  if (!rawInput || !password) {
    errorEl.textContent = t('auth_err_missing_fields', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    errorEl.style.display = 'block';
    return;
  }

  if (rawInput.includes('@')) {
    errorEl.textContent = t('auth_err_no_email', 'Chỉ cho phép đăng nhập bằng tên tài khoản (không dùng email).');
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';

  if (!supabaseClient) {
    errorEl.textContent = t('auth_err_supabase', 'Chưa kết nối được với Supabase. Vui lòng kiểm tra mạng hoặc tải lại trang.');
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const email = `${rawInput.toLowerCase()}@salary.app`;
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorEl.textContent = error.message === 'Invalid login credentials'
        ? t('auth_err_invalid_creds', 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.')
        : `${t('auth_err_login_prefix', 'Lỗi đăng nhập: ')}${error.message}`;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    const username = u.user_metadata?.username || u.email.split('@')[0];
    state.currentUser = { id: u.id, email: u.email, username };

    updateHeaderAuthUI();
    await loadState();
    triggerAppRender();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formLogin').reset();
    showToast(t('auth_login_success', 'Đăng nhập thành công! Chào @{username}.').replace('{username}', username));
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi kết nối: ')}${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

export const handleRegisterSubmit = async (e) => {
  e.preventDefault();
  const rawUsername = document.getElementById('regUsername').value.trim().toLowerCase();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;
  const errorEl = document.getElementById('regError');

  if (!rawUsername || !password || !passwordConfirm) {
    errorEl.textContent = t('auth_err_all_fields', 'Vui lòng điền đầy đủ tất cả các trường.');
    errorEl.style.display = 'block';
    return;
  }

  if (rawUsername.includes('@')) {
    errorEl.textContent = t('auth_err_at_char', 'Tên tài khoản không được chứa ký tự @.');
    errorEl.style.display = 'block';
    return;
  }

  if (rawUsername.length < 3) {
    errorEl.textContent = t('auth_err_min_user', 'Tên đăng nhập phải có ít nhất 3 ký tự.');
    errorEl.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = t('auth_err_min_pass', 'Mật khẩu phải có ít nhất 6 ký tự.');
    errorEl.style.display = 'block';
    return;
  }

  if (password !== passwordConfirm) {
    errorEl.textContent = t('auth_err_pass_mismatch', 'Xác nhận mật khẩu không khớp.');
    errorEl.style.display = 'block';
    return;
  }

  if (!supabaseClient) {
    errorEl.textContent = t('auth_err_supabase', 'Chưa kết nối được với Supabase. Vui lòng tải lại trang.');
    errorEl.style.display = 'block';
    return;
  }

  const submitBtn = e.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const email = `${rawUsername}@salary.app`;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: { username: rawUsername }
      }
    });

    if (error) {
      let msg = error.message;
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
        msg = t('auth_err_user_exists', 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.');
      } else {
        msg = `${t('auth_reg_fail_prefix', 'Đăng ký thất bại: ')}${msg}`;
      }
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!data.user || (Array.isArray(data.user.identities) && data.user.identities.length === 0)) {
      errorEl.textContent = t('auth_err_user_exists', 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác.');
      errorEl.style.display = 'block';
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const u = data.user;
    state.currentUser = { id: u.id, email: u.email, username: rawUsername };

    const copyGuest = document.getElementById('regCopyGuestData')?.checked;
    let initialWeeks = [{ id: 'week-1', name: 'Tuần 1', rate: 0, shifts: [] }];
    if (copyGuest) {
      const guestRaw = localStorage.getItem(GUEST_WEEKS_KEY);
      if (guestRaw) {
        try {
          const parsed = JSON.parse(guestRaw);
          if (Array.isArray(parsed) && parsed.length > 0) initialWeeks = parsed;
        } catch (_) {}
      }
    }

    state.weeks = initialWeeks;
    state.currentWeekId = state.weeks[state.weeks.length - 1].id;
    saveWeeks();
    try {
      await supabaseClient.from('user_salary_data').upsert({
        user_id: u.id,
        username: rawUsername,
        weeks: initialWeeks,
        settings: state.settings,
        updated_at: new Date().toISOString()
      });
    } catch (_) {}
    updateHeaderAuthUI();
    triggerAppRender();

    document.getElementById('authModal').style.display = 'none';
    document.getElementById('formRegister').reset();
    showToast(t('auth_login_success', 'Đăng nhập thành công! Chào @{username}.').replace('{username}', rawUsername));
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
};

export const handleLogout = async () => {
  if (confirm(t('confirm_logout', 'Bạn có chắc chắn muốn đăng xuất không?'))) {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    state.currentUser = null;
    updateHeaderAuthUI();
    await loadState();
    triggerAppRender();
    document.getElementById('userProfileModal').style.display = 'none';
    showToast(t('toast_logged_out', 'Đã đăng xuất tài khoản.'));
  }
};

export const handleChangePasswordSubmit = async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('changeNewPassword').value;
  const confirmPassword = document.getElementById('changeConfirmPassword').value;
  const errorEl = document.getElementById('changePasswordMsg');
  const submitBtn = document.getElementById('btnSubmitChangePassword');

  if (!newPassword || newPassword.length < 6) {
    errorEl.textContent = t('auth_err_min_pass', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
    errorEl.style.display = 'block';
    return;
  }

  if (newPassword !== confirmPassword) {
    errorEl.textContent = t('auth_err_pass_mismatch', 'Mật khẩu xác nhận không khớp.');
    errorEl.style.display = 'block';
    return;
  }

  errorEl.style.display = 'none';
  const originalSvg = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
  }

  try {
    if (!supabaseClient) {
      throw new Error(t('auth_err_supabase', 'Chưa kết nối tới cơ sở dữ liệu đám mây.'));
    }

    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    showToast(t('profile_pw_updated', 'Đổi mật khẩu thành công!'));
    document.getElementById('formChangePassword').reset();
    document.getElementById('formChangePassword').style.display = 'none';
    const chevron = document.getElementById('iconChangePwdChevron');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } catch (err) {
    errorEl.textContent = `${t('auth_err_conn_prefix', 'Lỗi: ')}${err.message || ''}`;
    errorEl.style.display = 'block';
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      if (originalSvg) submitBtn.innerHTML = originalSvg;
    }
  }
};

export const setupRealtimeSync = () => {
  if (!supabaseClient) return;
  try {
    supabaseClient
      .channel('salary_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_salary_data' },
        (payload) => {
          if (state.currentUser && payload.new && payload.new.user_id === state.currentUser.id) {
            if (!hasPendingSync() && Array.isArray(payload.new.weeks)) {
              state.weeks = payload.new.weeks;
              if (payload.new.settings) state.settings = { ...state.settings, ...payload.new.settings };
              localStorage.setItem(getWeeksStorageKey(), JSON.stringify(state.weeks));
              localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
              normalizeWorkplacesAndRates();
              if (state.weeks.length > 0) {
                state.weeks.forEach((w, idx) => ensureWeekStartDate(w, idx));
                if (!state.weeks.some(w => w.id === state.currentWeekId)) {
                  state.currentWeekId = state.weeks[state.weeks.length - 1].id;
                }
              }
              triggerAppRender();
              showToast(t('toast_synced_from_other_device', 'Dữ liệu vừa được đồng bộ từ thiết bị khác!'));
            }
          }
        }
      )
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription skipped:', e);
  }
};

export const setupAutoSync = () => {
  updateSyncStatusUI();

  window.addEventListener('online', async () => {
    updateSyncStatusUI();
    if (hasPendingSync()) {
      showToast(t('toast_online_syncing', 'Đã có kết nối mạng. Đang tự động đồng bộ lên đám mây...'));
      const ok = await syncPendingToCloud(false);
      if (ok) {
        showToast(t('toast_synced_success', 'Đã tự động đồng bộ toàn bộ dữ liệu lên đám mây!'));
      }
    } else {
      showToast('Đã kết nối mạng.');
    }
  });

  window.addEventListener('offline', () => {
    updateSyncStatusUI('offline');
    showToast(t('toast_offline_mode', 'Bạn đang ngoại tuyến. Dữ liệu sẽ lưu cục bộ và tự động đồng bộ khi online.'));
  });

  let lastFocusSyncTime = 0;
  const syncOnFocus = async () => {
    const now = Date.now();
    if (now - lastFocusSyncTime < 10000) return;
    lastFocusSyncTime = now;

    if (document.visibilityState === 'visible' && navigator.onLine && state.currentUser && supabaseClient && !hasPendingSync()) {
      try {
        const { data, error } = await supabaseClient
          .from('user_salary_data')
          .select('weeks, settings, updated_at')
          .eq('user_id', state.currentUser.id)
          .maybeSingle();

        if (!error && data && Array.isArray(data.weeks)) {
          const localWeeksStr = localStorage.getItem(getWeeksStorageKey());
          const remoteWeeksStr = JSON.stringify(data.weeks);
          if (localWeeksStr !== remoteWeeksStr) {
            state.weeks = data.weeks;
            if (data.settings) state.settings = { ...state.settings, ...data.settings };
            localStorage.setItem(getWeeksStorageKey(), remoteWeeksStr);
            if (data.settings) localStorage.setItem(getSettingsStorageKey(), JSON.stringify(state.settings));
            normalizeWorkplacesAndRates();
            if (state.weeks.length > 0) {
              state.weeks.forEach((w, idx) => ensureWeekStartDate(w, idx));
              if (!state.weeks.some(w => w.id === state.currentWeekId)) {
                state.currentWeekId = state.weeks[state.weeks.length - 1].id;
              }
            }
            triggerAppRender();
            showToast(t('toast_synced_from_other_device', 'Dữ liệu vừa được đồng bộ từ thiết bị khác!'));
          }
        }
      } catch (_) {}
    }
  };

  document.addEventListener('visibilitychange', syncOnFocus);
  window.addEventListener('focus', syncOnFocus);

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const currentTheme = localStorage.getItem('salary_tracker_theme') || 'light';
      if (currentTheme === 'auto') {
        applyTheme('auto', false);
      }
    });
  }
};
