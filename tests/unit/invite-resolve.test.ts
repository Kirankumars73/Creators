import { describe, expect, test } from 'vitest';
import { parseServerEnv } from '@/lib/env.server';
import { resolveInviteLinks } from '@/lib/invite/resolve';

const wa = {
  community: 'https://chat.whatsapp.com/COMM',
  creators: 'https://chat.whatsapp.com/CRE',
  editors: 'https://chat.whatsapp.com/EDI',
  other: null,
};

const validRaw = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://abc.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
  NEXT_PUBLIC_SITE_URL: 'https://creatorskootam.in',
  WA_COMMUNITY_URL: 'https://chat.whatsapp.com/COMM',
  WA_CREATORS_URL: 'https://chat.whatsapp.com/CRE',
  WA_EDITORS_URL: 'https://chat.whatsapp.com/EDI',
  WA_OTHER_URL: '',
  ADMIN_EMAILS: '',
};

describe('resolveInviteLinks', () => {
  test('a creator gets the community and CONTENT CREATORS', () => {
    expect(resolveInviteLinks('creator', wa)).toEqual({ community: wa.community, lane: wa.creators, laneKey: 'creators' });
  });

  test('a creator never receives the editors link (§8 test 3)', () => {
    expect(JSON.stringify(resolveInviteLinks('creator', wa))).not.toContain('EDI');
  });

  test('an editor gets EDITORS (§8 test 4)', () => {
    expect(resolveInviteLinks('editor', wa)).toMatchObject({ lane: wa.editors, laneKey: 'editors' });
  });

  test('other has no room yet → community only', () => {
    expect(resolveInviteLinks('other', wa)).toEqual({ community: wa.community, lane: null, laneKey: null });
  });

  test('other pointed at the community link is still community only', () => {
    expect(resolveInviteLinks('other', { ...wa, other: wa.community }).lane).toBeNull();
  });

  test('other gets its own room once one exists', () => {
    expect(resolveInviteLinks('other', { ...wa, other: 'https://chat.whatsapp.com/OTH' })).toMatchObject({
      lane: 'https://chat.whatsapp.com/OTH',
      laneKey: 'other',
    });
  });
});

describe('parseServerEnv', () => {
  test('parses a complete env', () => {
    expect(parseServerEnv(validRaw)).toEqual({
      supabaseUrl: 'https://abc.supabase.co',
      serviceRoleKey: 'service-key',
      siteUrl: 'https://creatorskootam.in',
      adminEmails: [],
      wa,
    });
  });

  test('names a missing key', () => {
    expect(() => parseServerEnv({ ...validRaw, WA_EDITORS_URL: undefined })).toThrow(/WA_EDITORS_URL/);
  });

  test('rejects a link that is not a WhatsApp invite, naming the key', () => {
    expect(() => parseServerEnv({ ...validRaw, WA_CREATORS_URL: 'https://evil.example/x' })).toThrow(/WA_CREATORS_URL/);
  });

  test('never echoes the bad value back', () => {
    let message = '';
    try {
      parseServerEnv({ ...validRaw, WA_CREATORS_URL: 'https://evil.example/x' });
    } catch (e) {
      message = String(e);
    }
    expect(message).not.toContain('evil.example');
  });

  test('accepts invite links copied with WhatsApp’s ?mode= suffix', () => {
    expect(parseServerEnv({ ...validRaw, WA_COMMUNITY_URL: 'https://chat.whatsapp.com/AbC123?mode=ems_copy_t' }).wa.community).toBe(
      'https://chat.whatsapp.com/AbC123?mode=ems_copy_t',
    );
  });

  test('normalises the admin list', () => {
    expect(parseServerEnv({ ...validRaw, ADMIN_EMAILS: ' A@x.com, b@y.com ,' }).adminEmails).toEqual(['a@x.com', 'b@y.com']);
  });
});

describe('parseServerEnv — pasted values (final review F10)', () => {
  test('stray whitespace around links and keys is trimmed, not fatal', () => {
    const env = parseServerEnv({ ...validRaw, WA_EDITORS_URL: '  https://chat.whatsapp.com/EDI \n', SUPABASE_SERVICE_ROLE_KEY: ' service-key ' });
    expect(env.wa.editors).toBe('https://chat.whatsapp.com/EDI');
    expect(env.serviceRoleKey).toBe('service-key');
  });
});

describe('adminEmailsFromEnv — the built-in admins', () => {
  test('the founder and the developer are admins even when nothing is set on the host', async () => {
    const { adminEmailsFromEnv } = await import('@/lib/env.server');
    expect(adminEmailsFromEnv(undefined)).toEqual(['gowthamdas04@gmail.com', 'thomasmartinoa@gmail.com']);
    expect(adminEmailsFromEnv('')).toEqual(['gowthamdas04@gmail.com', 'thomasmartinoa@gmail.com']);
  });

  test('ADMIN_EMAILS adds more, lower-cased, without duplicating the built-in ones', async () => {
    const { adminEmailsFromEnv } = await import('@/lib/env.server');
    expect(adminEmailsFromEnv(' New@x.com, THOMASMARTINOA@gmail.com ,')).toEqual(['gowthamdas04@gmail.com', 'thomasmartinoa@gmail.com', 'new@x.com']);
  });
});
