const PATTERNS = {
  light: 10,
  medium: 22,
  heavy: 38,
  success: [12, 35, 18],
  warning: [25, 40, 25],
  danger: [35, 50, 40]
};

export const triggerHaptic = (type = 'light') => {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    const pattern = PATTERNS[type] || PATTERNS.light;
    navigator.vibrate(pattern);
  } catch (e) {
  }
};
