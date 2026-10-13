import { formatTimecode } from '@/lib/timecode';

type TimecodeProps = { frames: number; fps?: number; className?: string };

export function Timecode({ frames, fps = 25, className = '' }: TimecodeProps) {
  return <span className={`text-label tabular-nums ${className}`}>{formatTimecode(frames, fps)}</span>;
}
