import { describe, expect, test } from 'vitest';
import { findStaleStyles } from '../../scripts/check-live.mjs';

const css = (extra = '') => `:root{--wall:#eef2f8;--print:#101828;--neelam:#2346c8}[data-surface=wall]{--surface:var(--wall)}[data-surface=night]{--ink:#0a0a0b}.wall-writing{filter:url(#brush)}${extra}`;

describe('findStaleStyles: is the live stylesheet the current one?', () => {
  test('a current stylesheet has nothing missing', () => expect(findStaleStyles(css())).toEqual([]));

  test('the original (pre-redesign) stylesheet is reported, naming what is missing', () => {
    const old = ':root{--ink:#0a0a0b}[data-surface=bay]{--surface:var(--carbon)}[data-surface=poster]{--surface:var(--ink)}.reel-craft{filter:saturate(.35)}';
    expect(findStaleStyles(old)).toEqual(expect.arrayContaining(['the wall colour tokens (--wall)', 'the wall surface rules', 'the night surface rules', 'the wall-writing styles']));
  });

  test('a stylesheet that still carries removed classes is reported too', () => {
    expect(findStaleStyles(css('.reel-craft{x:1}'))).toEqual(['a class removed from the code (.reel-craft)']);
  });

  test('works on minified output with quoted selectors', () => {
    expect(findStaleStyles(css().replaceAll('=wall]', '="wall"]'))).toEqual([]);
  });
});
