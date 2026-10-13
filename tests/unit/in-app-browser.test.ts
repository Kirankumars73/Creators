import { describe, expect, test } from 'vitest';
import { chromeIntentUrl, detectInAppBrowser } from '@/lib/join/in-app-browser';

const UA = {
  instagramAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.134 Mobile Safari/537.36 Instagram 339.0.0.38.119 Android (34/14; 450dpi; 1080x2340; samsung; SM-A546E; a54x; s5e8835; en_IN; 625217640)',
  instagramIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 339.0.3.12.91 (iPhone14,5; iOS 17_5; en_IN; en; scale=3.00; 1170x2532; 622436451)',
  facebookIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.37.110;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBLC/en_US;FBOP/5]',
  androidWebView:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.122 Mobile Safari/537.36',
  chromeAndroid:
    'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36',
  safariIos:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
};

describe('detectInAppBrowser (Review Focus 1)', () => {
  test('Instagram on Android', () =>
    expect(detectInAppBrowser(UA.instagramAndroid)).toEqual({ inApp: true, app: 'instagram', platform: 'android' }));
  test('Instagram on iPhone', () => expect(detectInAppBrowser(UA.instagramIos)).toMatchObject({ inApp: true, app: 'instagram', platform: 'ios' }));
  test('Facebook on iPhone', () => expect(detectInAppBrowser(UA.facebookIos)).toMatchObject({ inApp: true, app: 'facebook' }));
  test('a bare Android WebView', () => expect(detectInAppBrowser(UA.androidWebView)).toMatchObject({ inApp: true, app: 'webview' }));
  test('Chrome on Android is a real browser', () => expect(detectInAppBrowser(UA.chromeAndroid).inApp).toBe(false));
  test('Safari on iPhone is a real browser', () => expect(detectInAppBrowser(UA.safariIos).inApp).toBe(false));
  test('an empty UA is not in-app', () => expect(detectInAppBrowser('').inApp).toBe(false));
});

describe('chromeIntentUrl', () => {
  test('hands the page to Chrome', () =>
    expect(chromeIntentUrl('https://creatorskootam.in/join')).toBe(
      'intent://creatorskootam.in/join#Intent;scheme=https;package=com.android.chrome;end',
    ));
  test('keeps the query', () =>
    expect(chromeIntentUrl('https://creatorskootam.in/join?step=lane')).toBe(
      'intent://creatorskootam.in/join?step=lane#Intent;scheme=https;package=com.android.chrome;end',
    ));
});
