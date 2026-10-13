export type InAppInfo = {
  inApp: boolean;
  app: 'instagram' | 'facebook' | 'threads' | 'tiktok' | 'snapchat' | 'linkedin' | 'webview' | null;
  platform: 'android' | 'ios' | 'other';
};

/**
 * Google refuses OAuth inside embedded WebViews (403 disallowed_useragent), which is
 * exactly where people land when they tap his Instagram bio link.
 */
export function detectInAppBrowser(ua: string): InAppInfo {
  const platform = /android/i.test(ua) ? 'android' : /iphone|ipad|ipod/i.test(ua) ? 'ios' : 'other';
  let app: InAppInfo['app'] = null;
  if (/\bInstagram\b/.test(ua)) app = 'instagram';
  else if (/\bBarcelona\b/.test(ua)) app = 'threads';
  else if (/FBAN|FBAV|FB_IAB|FBIOS/.test(ua)) app = 'facebook';
  else if (/musical_ly|BytedanceWebview|TikTok/.test(ua)) app = 'tiktok';
  else if (/Snapchat/.test(ua)) app = 'snapchat';
  else if (/LinkedInApp/.test(ua)) app = 'linkedin';
  else if (platform === 'android' && /; wv\)/.test(ua)) app = 'webview';
  // Every real iOS browser (Safari, Chrome, Firefox, Edge) carries "Safari/"; bare WKWebViews don't.
  else if (platform === 'ios' && /AppleWebKit/.test(ua) && !/Safari\//.test(ua)) app = 'webview';
  return { inApp: app !== null, app, platform };
}

/** An Android intent URL that reopens `url` in Chrome. */
export function chromeIntentUrl(url: string): string {
  const u = new URL(url);
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(':', '')};package=com.android.chrome;end`;
}
