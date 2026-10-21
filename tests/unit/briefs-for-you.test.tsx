// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import { BriefsForYou } from '@/components/me/BriefsForYou';

afterEach(cleanup);

const brief = { id: '1', brand: 'Malabar Café', contact_name: 'Anjali Menon', brief: 'A 30s reel for our new menu.', created_at: '2026-10-20T10:00:00Z' };

describe('BriefsForYou (/me)', () => {
  test('nothing yet: says so, and says where they will show up', () => {
    render(<BriefsForYou briefs={[]} />);
    expect(screen.getByText(/Nothing yet/)).toBeInTheDocument();
  });

  test('shows who it is from, the message and the date, with a count', () => {
    render(<BriefsForYou briefs={[brief, { ...brief, id: '2', brand: 'Kerala Bites', brief: null }]} />);
    expect(screen.getByRole('heading', { name: /Briefs for you \(2\)/ })).toBeInTheDocument();
    expect(screen.getByText(/Malabar Café/)).toBeInTheDocument();
    expect(screen.getByText('A 30s reel for our new menu.')).toBeInTheDocument();
    expect(screen.getAllByText('20 Oct 2026')).toHaveLength(2);
    expect(screen.getByText('No message.')).toBeInTheDocument();
  });

  test('never shows a brand’s email or phone (the team keeps those)', () => {
    const { container } = render(<BriefsForYou briefs={[{ ...brief, email: 'secret@brand.com', phone: '+91 99999 99999' } as typeof brief]} />);
    expect(container.textContent).not.toMatch(/secret@brand\.com|99999/);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
