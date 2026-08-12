export interface DeviceInfo {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  osName: 'Windows' | 'Mac' | 'iPhone/iOS' | 'Android' | 'Linux' | 'Outro';
  browserName: string;
  label: string;
  userAgent: string;
}

/**
 * Detecta automaticamente o sistema operacional, tipo de dispositivo e navegador do usuário.
 */
export function detectDevice(): DeviceInfo {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let osName: DeviceInfo['osName'] = 'Outro';
  let deviceType: DeviceInfo['deviceType'] = 'desktop';

  if (/iPhone|iPad|iPod/i.test(ua)) {
    osName = 'iPhone/iOS';
    deviceType = /iPad/i.test(ua) ? 'tablet' : 'mobile';
  } else if (/Android/i.test(ua)) {
    osName = 'Android';
    deviceType = /Mobile/i.test(ua) ? 'mobile' : 'tablet';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    osName = 'Mac';
    deviceType = 'desktop';
  } else if (/Windows/i.test(ua)) {
    osName = 'Windows';
    deviceType = 'desktop';
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux';
    deviceType = 'desktop';
  }

  let browserName = 'Navegador';
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) {
    browserName = 'Chrome';
  } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
    browserName = 'Safari';
  } else if (/firefox|fxios/i.test(ua)) {
    browserName = 'Firefox';
  } else if (/edge|edg/i.test(ua)) {
    browserName = 'Edge';
  }

  const label = `${osName} (${browserName})`;

  return {
    deviceType,
    osName,
    browserName,
    label,
    userAgent: ua,
  };
}
