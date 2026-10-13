// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { Checkbox } from '@/components/ui/Checkbox';
import { Combobox } from '@/components/ui/Combobox';
import { Field } from '@/components/ui/Field';
import { TagSelect } from '@/components/ui/TagSelect';
import { DISTRICTS } from '@/config/join';

afterEach(cleanup);

describe('Combobox (WAI-ARIA combobox + listbox)', () => {
  function Harness({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('');
    return (
      <Combobox
        label="City / district"
        options={DISTRICTS}
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    );
  }

  test('typing filters, arrow + enter picks', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: 'City / district' });
    await userEvent.type(input, 'ern');
    expect(screen.getByRole('option', { name: 'Ernakulam' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Kollam' })).toBeNull();
    await userEvent.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Ernakulam' }).id);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('Ernakulam');
    expect(input).toHaveValue('Ernakulam');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('escape closes the list', async () => {
    render(<Harness onChange={() => {}} />);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'k');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking an option picks it', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.type(screen.getByRole('combobox'), 'thri');
    await userEvent.click(screen.getByRole('option', { name: 'Thrissur' }));
    expect(onChange).toHaveBeenCalledWith('Thrissur');
  });
});

describe('TagSelect', () => {
  test('tags toggle with aria-pressed', async () => {
    function Harness({ onChange }: { onChange: (v: string[]) => void }) {
      const [value, setValue] = useState<string[]>([]);
      return (
        <TagSelect
          label="What you do"
          options={['davinci', 'capcut']}
          value={value}
          onChange={(v) => {
            setValue(v);
            onChange(v);
          }}
        />
      );
    }
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const tag = screen.getByRole('button', { name: 'davinci' });
    await userEvent.click(tag);
    expect(tag).toHaveAttribute('aria-pressed', 'true');
    expect(onChange).toHaveBeenLastCalledWith(['davinci']);
    await userEvent.click(tag);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('group', { name: 'What you do' })).toBeInTheDocument();
  });
});

describe('Field', () => {
  test('an error marks the input invalid and is announced with it', () => {
    render(<Field label="Instagram handle" name="instagram" error="Required" />);
    const input = screen.getByRole('textbox', { name: 'Instagram handle' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Required');
  });

  test('a hint is part of the description when there is no error', () => {
    render(<Field label="Portfolio" name="portfolio" hint="Optional" />);
    expect(screen.getByRole('textbox', { name: 'Portfolio' })).toHaveAccessibleDescription('Optional');
  });
});

describe('Checkbox', () => {
  test('reports the new checked state', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Show me on the member wall" checked={false} onChange={onChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Show me on the member wall' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
