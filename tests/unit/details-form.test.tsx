// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { DetailsForm } from '@/components/join/DetailsForm';
import type { SubmitResult } from '@/lib/members/submit';

afterEach(cleanup);

function setup(overrides: Partial<Parameters<typeof DetailsForm>[0]> = {}) {
  const props = {
    lane: 'creator' as const,
    user: { name: 'Gowtham Das' },
    draft: {},
    onDraft: vi.fn(),
    onSubmit: vi.fn(async (): Promise<SubmitResult> => ({ ok: true, alreadyMember: false })),
    onDone: vi.fn(),
    ...overrides,
  };
  render(<DetailsForm {...props} />);
  return props;
}

async function fillValid() {
  await userEvent.type(screen.getByRole('textbox', { name: 'Instagram handle' }), '@the.gowtham_das');
  const city = screen.getByRole('combobox', { name: 'City / district' });
  await userEvent.type(city, 'Ernakulam');
  await userEvent.tab();
  await userEvent.click(screen.getByRole('checkbox', { name: /read the code/i }));
}

describe('DetailsForm (§7 step 3)', () => {
  test('the display name is prefilled from Google', () => {
    setup();
    expect(screen.getByRole('textbox', { name: 'Display name' })).toHaveValue('Gowtham Das');
  });

  test('without The Code ticked, nothing is sent and the checkbox says why', async () => {
    const props = setup();
    await userEvent.type(screen.getByRole('textbox', { name: 'Instagram handle' }), 'the.gowtham_das');
    await userEvent.type(screen.getByRole('combobox', { name: 'City / district' }), 'Ernakulam');
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: /read the code/i })).toHaveAttribute('aria-invalid', 'true');
  });

  test('editors get editor tags, not creator ones', () => {
    setup({ lane: 'editor' });
    expect(screen.getByRole('button', { name: 'davinci' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'fashion' })).toBeNull();
  });

  test('the normalised handle is previewed', async () => {
    setup();
    await userEvent.type(screen.getByRole('textbox', { name: 'Instagram handle' }), 'instagram.com/The.Gowtham_Das');
    expect(screen.getByText('@the.gowtham_das')).toBeInTheDocument();
  });

  test('a double tap sends once', async () => {
    let resolve!: (r: SubmitResult) => void;
    const onSubmit = vi.fn(() => new Promise<SubmitResult>((r) => (resolve = r)));
    setup({ onSubmit });
    await fillValid();
    const submit = screen.getByRole('button', { name: /render my pass/i });
    await userEvent.dblClick(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    resolve({ ok: true, alreadyMember: false });
  });

  test('"already in" moves on to the reveal', async () => {
    const props = setup({ onSubmit: vi.fn(async () => ({ ok: true, alreadyMember: true }) as SubmitResult) });
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    await waitFor(() => expect(props.onDone).toHaveBeenCalled());
  });

  test('a valid submit sends the parsed input with the lane', async () => {
    const props = setup();
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    await waitFor(() =>
      expect(props.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'creator', instagram: 'the.gowtham_das', city: 'Ernakulam', acceptedCode: true, showOnWall: true }),
      ),
    );
  });

  test('server field errors land on their fields', async () => {
    setup({
      onSubmit: vi.fn(async () => ({ ok: false, error: 'invalid', fieldErrors: { instagram: 'x' } }) as SubmitResult),
    });
    await fillValid();
    await userEvent.click(screen.getByRole('button', { name: /render my pass/i }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Instagram handle' })).toHaveAttribute('aria-invalid', 'true'));
  });
});
