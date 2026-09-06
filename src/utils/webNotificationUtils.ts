/**
 * webNotificationUtils.ts
 * Utilidades para solicitar permisos y emitir notificaciones nativas del navegador
 * para entregas de boletos, cartones y recordatorios de partida en Bingotenango.
 */

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return 'denied';
  }
};

export interface SendNotificationOptions {
  body: string;
  url?: string;
  icon?: string;
  tag?: string;
}

export const triggerBrowserNotification = (
  title: string,
  options: SendNotificationOptions
): boolean => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: options.icon || '/favicon.svg',
      tag: options.tag || 'bingotenango-notification',
      badge: '/favicon.svg',
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('No se pudo desplegar la notificación estándar, intentando con ServiceWorker:', err);
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: options.body,
          icon: options.icon || '/favicon.svg',
          tag: options.tag || 'bingotenango-notification',
          data: { url: options.url },
        });
      });
      return true;
    }
    return false;
  }
};
