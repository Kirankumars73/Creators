import type { Lane } from '@/config/brand';

/** Everything typed into /join so far, kept per tab so back/refresh never loses it. */
export type JoinDraft = Partial<{
  lane: Lane;
  roleOtherText: string;
  displayName: string;
  instagram: string;
  city: string;
  tags: string[];
  portfolioUrl: string;
  showOnWall: boolean;
}>;
