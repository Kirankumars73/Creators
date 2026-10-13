// The scroll film's cut list (§6.2). Each id is a section anchor on `/`;
// each label is a clip on the timeline scrubber.
export const SECTIONS = [
  { id: 'cold-open', n: '01', label: 'COLD OPEN' },
  { id: 'the-room', n: '02', label: 'THE ROOM' },
  { id: 'whos-inside', n: '03', label: "WHO'S INSIDE" },
  { id: 'the-code', n: '04', label: 'THE CODE' },
  { id: 'inside', n: '05', label: 'INSIDE' },
  { id: 'roll-call', n: '06', label: 'ROLL CALL' },
  { id: 'join', n: '07', label: 'JOIN' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function sectionTitle(id: SectionId): string {
  const s = SECTIONS.find((x) => x.id === id)!;
  return `${s.n} — ${s.label}`;
}
