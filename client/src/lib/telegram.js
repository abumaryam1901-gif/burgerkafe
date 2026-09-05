export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  const applyTheme = () => {
    const isDark = tg?.colorScheme
      ? tg.colorScheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (tg?.themeParams) {
      const root = document.documentElement;
      const p = tg.themeParams;
      if (p.bg_color) root.style.setProperty('--tg-theme-bg-color', p.bg_color);
      if (p.text_color) root.style.setProperty('--tg-theme-text-color', p.text_color);
      if (p.hint_color) root.style.setProperty('--tg-theme-hint-color', p.hint_color);
      if (p.button_color) root.style.setProperty('--tg-theme-button-color', p.button_color);
      if (p.button_text_color) root.style.setProperty('--tg-theme-button-text-color', p.button_text_color);
      if (p.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color);
    }
  };

  applyTheme();

  if (tg) {
    tg.ready();
    tg.expand();
    tg.onEvent?.('themeChanged', applyTheme);
  } else {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user || null;
}

export function hapticImpact(style = 'light') {
  tg?.HapticFeedback?.impactOccurred(style);
}

export function hapticNotify(type = 'success') {
  tg?.HapticFeedback?.notificationOccurred(type);
}

export function showMainButton(text, onClick) {
  if (!tg) return;
  tg.MainButton.setText(text);
  tg.MainButton.show();
  tg.MainButton.offClick();
  tg.MainButton.onClick(onClick);
}

export function hideMainButton() {
  tg?.MainButton?.hide();
}

export function requestLocation() {
  return new Promise((resolve) => {
    if (!tg?.LocationManager) {
      resolve(null);
      return;
    }
    tg.LocationManager.init(() => {
      tg.LocationManager.getLocation((location) => resolve(location));
    });
  });
}
