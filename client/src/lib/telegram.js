export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
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
