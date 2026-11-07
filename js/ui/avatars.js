export const DEFAULT_AVATAR = {
  id: 'default',
  name: 'Mặc định',
  svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_def" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#64748b"/><stop offset="1" stop-color="#334155"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_def)"/><circle cx="20" cy="15" r="6" fill="#f1f5f9"/><path d="M10 34c0-5.5 4.5-9 10-9s10 3.5 10 9" fill="#f1f5f9"/></svg>`
};

export const AVATARS = [
  DEFAULT_AVATAR,
  {
    id: 'dicebear_knight',
    name: 'Hiệp Sĩ',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_kn" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#2563eb"/><stop offset="1" stop-color="#1e3a8a"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_kn)"/><path d="M14 17c0 6 3 10 6 10s6-4 6-10v-3H14v3z" fill="#fed7aa"/><path d="M10 16c0-6 4.5-11 10-11s10 5 10 11v4H10v-4z" fill="#94a3b8"/><rect x="13" y="16" width="14" height="4" rx="1" fill="#334155"/><line x1="15" y1="18" x2="25" y2="18" stroke="#f1f5f9" stroke-width="0.8"/><circle cx="20" cy="9" r="2.5" fill="#ef4444"/><path d="M19 7c1-3 4-4 6-4" stroke="#dc2626" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="17.5" cy="18" rx="1" ry="0.6" fill="#38bdf8"/><ellipse cx="22.5" cy="18" rx="1" ry="0.6" fill="#38bdf8"/><path d="M10 34c1-4 4-6 10-6s9 2 10 6" fill="#64748b"/><rect x="16" y="28" width="8" height="6" fill="#cbd5e1"/><polygon points="18,29 20,33 22,29" fill="#facc15"/></svg>`
  },
  {
    id: 'dicebear_mage',
    name: 'Pháp Sư',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_mg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#312e81"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_mg)"/><path d="M14 18c0 6 3 10 6 10s6-4 6-10v-3H14v3z" fill="#ffedd5"/><polygon points="20,4 10,17 30,17" fill="#4338ca"/><ellipse cx="20" cy="17" rx="14" ry="3.5" fill="#3730a3"/><polygon points="20,7 15,17 25,17" fill="#6366f1"/><circle cx="20" cy="14" r="1.5" fill="#facc15"/><circle cx="17" cy="20.5" r="1.2" fill="#38bdf8"/><circle cx="23" cy="20.5" r="1.2" fill="#38bdf8"/><circle cx="17" cy="20.5" r="0.5" fill="#ffffff"/><circle cx="23" cy="20.5" r="0.5" fill="#ffffff"/><path d="M18.5 24.5q1.5 1 3 0" stroke="#4338ca" stroke-width="0.8" fill="none"/><path d="M10 34c1-4 4-6 10-6s9 2 10 6" fill="#4f46e5"/><polygon points="18,28 20,32 22,28" fill="#facc15"/></svg>`
  },
  {
    id: 'dicebear_samurai',
    name: 'Samurai',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_sm" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#991b1b"/><stop offset="1" stop-color="#450a0a"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_sm)"/><circle cx="20" cy="6" r="2.5" fill="#18181b"/><path d="M14 17c0 6 3 10 6 10s6-4 6-10v-3H14v3z" fill="#fed7aa"/><path d="M10 16c1-5 4-8 10-8s9 3 10 8c-2-2-5-2-7-1-1-2-4-2-6-1-2-1-5-1-7 2z" fill="#18181b"/><rect x="11" y="14" width="18" height="2.5" rx="0.5" fill="#dc2626"/><ellipse cx="16.5" cy="19.5" rx="1.2" ry="1.2" fill="#18181b"/><circle cx="16.8" cy="19.1" r="0.4" fill="#ffffff"/><ellipse cx="23.5" cy="19.5" rx="1.2" ry="1.2" fill="#18181b"/><circle cx="23.8" cy="19.1" r="0.4" fill="#ffffff"/><path d="M18.5 24.5l3-0.5" stroke="#18181b" stroke-width="0.9" stroke-linecap="round"/><path d="M10 34c1-4 4-6 10-6s9 2 10 6" fill="#18181b"/><polygon points="17,28 20,33 23,28" fill="#dc2626"/></svg>`
  },
  {
    id: 'dicebear_sakura',
    name: 'Sakura',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_sk" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#f472b6"/><stop offset="1" stop-color="#be185d"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_sk)"/><path d="M14 17c0 6 3 10 6 10s6-4 6-10v-3H14v3z" fill="#fff1f2"/><path d="M9 16c0-6 4-10 11-10s11 4 11 10c-1-1-3-1-5 0-2-3-5-4-8-3-2 1-4 2-5 3-1-1-3-1-4 0z" fill="#831843"/><circle cx="26" cy="12" r="2" fill="#fbcfe8"/><circle cx="26" cy="12" r="0.8" fill="#fb7185"/><ellipse cx="16.5" cy="19.2" rx="1.4" ry="1.6" fill="#9d174d"/><circle cx="16.2" cy="18.6" r="0.5" fill="#ffffff"/><ellipse cx="23.5" cy="19.2" rx="1.4" ry="1.6" fill="#9d174d"/><circle cx="23.2" cy="18.6" r="0.5" fill="#ffffff"/><circle cx="14" cy="22" r="1.3" fill="#f43f5e" opacity="0.35"/><circle cx="26" cy="22" r="1.3" fill="#f43f5e" opacity="0.35"/><path d="M18.5 24.5q1.5 1 3 0" stroke="#be185d" stroke-width="0.8" fill="none"/><path d="M10 34c1-4 4-6 10-6s9 2 10 6" fill="#fbcfe8"/><path d="M17 28l3 4 3-4" fill="#f472b6"/></svg>`
  },
  {
    id: 'dicebear_bot',
    name: 'Bottts',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_bt" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#0d9488"/><stop offset="1" stop-color="#115e59"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_bt)"/><line x1="20" y1="5" x2="20" y2="11" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="5" r="2" fill="#facc15"/><rect x="11" y="11" width="18" height="15" rx="3" fill="#334155"/><rect x="13.5" y="14" width="13" height="5.5" rx="1.5" fill="#020617"/><circle cx="16.5" cy="16.8" r="1.5" fill="#38bdf8"/><circle cx="23.5" cy="16.8" r="1.5" fill="#38bdf8"/><circle cx="17" cy="16.3" r="0.5" fill="#ffffff"/><circle cx="24" cy="16.3" r="0.5" fill="#ffffff"/><line x1="16" y1="22.5" x2="24" y2="22.5" stroke="#94a3b8" stroke-width="1" stroke-linecap="round"/><rect x="8.5" y="16" width="2.5" height="5" rx="1" fill="#64748b"/><rect x="29" y="16" width="2.5" height="5" rx="1" fill="#64748b"/><path d="M11 34c1-4 4-6 9-6s8 2 9 6" fill="#475569"/><circle cx="20" cy="31" r="1.5" fill="#22d3ee"/></svg>`
  },
  {
    id: 'dicebear_ninja',
    name: 'Shinobi',
    svg: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="db_nj" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stop-color="#1e1b4b"/><stop offset="1" stop-color="#020617"/></linearGradient></defs><rect width="40" height="40" fill="url(#db_nj)"/><path d="M10 18c0-8 4.5-12 10-12s10 4 10 12v14c-3 1-6 2-10 2s-7-1-10-2z" fill="#1e293b"/><path d="M12 21c0 5 3.5 8 8 8s8-3 8-8v4c0 3-3.5 6-8 6s-8-3-8-6z" fill="#0f172a"/><rect x="13" y="12" width="14" height="4" rx="1" fill="#94a3b8"/><circle cx="20" cy="14" r="1" fill="#0f172a"/><path d="M14 18.5l3.5 1-3.5 0.5z" fill="#e2e8f0"/><path d="M22.5 19.5l3.5-1-0.5 1.5z" fill="#e2e8f0"/><circle cx="16" cy="19" r="0.8" fill="#ef4444"/><circle cx="24" cy="19" r="0.8" fill="#ef4444"/></svg>`
  }
];

export const getAvatarById = (id) => {
  if (id === 'ninja') return AVATARS.find(a => a.id === 'dicebear_ninja') || AVATARS[6];
  if (id === 'nerd' || id === 'hacker') return AVATARS.find(a => a.id === 'dicebear_bot') || AVATARS[5];
  if (id === 'luffy' || id === 'naruto' || id === 'goku') return AVATARS.find(a => a.id === 'dicebear_knight') || AVATARS[1];
  if (id === 'zoro' || id === 'levi') return AVATARS.find(a => a.id === 'dicebear_samurai') || AVATARS[3];
  if (id === 'kakashi' || id === 'gojo') return AVATARS.find(a => a.id === 'dicebear_mage') || AVATARS[2];
  if (id === 'nezuko' || id === 'anya' || id === 'shinobu') return AVATARS.find(a => a.id === 'dicebear_sakura') || AVATARS[4];
  if (!id || id === 'default') return DEFAULT_AVATAR;
  return AVATARS.find(a => a.id === id) || DEFAULT_AVATAR;
};

export const getAvatarSvg = (id) => {
  const item = getAvatarById(id);
  return item.svg;
};

export const getAvatarName = (id) => {
  const item = getAvatarById(id);
  return item.name;
};

export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * AVATARS.length);
  return AVATARS[index] || AVATARS[0];
};
