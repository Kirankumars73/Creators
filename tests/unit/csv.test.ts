import { describe, expect, test } from 'vitest';
import { toCsv } from '@/lib/csv';

describe('toCsv', () => {
  test('RFC 4180 quoting with CRLF rows', () => expect(toCsv([{ a: 'x,"y"\nz' }], ['a'])).toBe('a\r\n"x,""y""\nz"'));
  test('spreadsheet formula injection is neutralised', () => expect(toCsv([{ a: '=HYPERLINK("u")' }], ['a'])).toBe('a\r\n"\'=HYPERLINK(""u"")"'));
  test.each(['+1', '-1', '@x', '\tx'])('a cell starting with %j gets an apostrophe', (v) => expect(toCsv([{ a: v }], ['a']).split('\r\n')[1]!.replace(/"/g, '').startsWith("'")).toBe(true));
  test('nulls are empty, arrays are joined, booleans are words', () =>
    expect(toCsv([{ a: null, b: ['davinci', 'color'], c: true }], ['a', 'b', 'c'])).toBe('a,b,c\r\n,davinci; color,true'));
  test('Malayalam passes through untouched', () => expect(toCsv([{ a: 'ഗൗതം' }], ['a'])).toBe('a\r\nഗൗതം'));
});
