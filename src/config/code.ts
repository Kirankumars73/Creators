// The Code — the community charter (§6.5). 01–03 are his, verbatim from the brief.
// [ASK GOUTHAM] 04–07 are drafts in his voice; `pnpm check:launch` fails while any is a draft.
export type CodeArticle = { n: string; text: string; draft: boolean };

export const CODE_ARTICLES: readonly CodeArticle[] = [
  { n: '01', text: 'Credit the editor. Every time. In the caption, not the comments.', draft: false },
  { n: '02', text: "Don't repost someone's cut as your own. We will know. Kerala is small.", draft: false },
  { n: '03', text: 'Show the work in progress. Finished things teach nobody anything.', draft: false },
  { n: '04', text: 'Tag everyone in the frame. The stylist, the DOP, the friend holding the reflector.', draft: true },
  { n: '05', text: 'Tear the cut apart. Leave the editor standing.', draft: true },
  { n: '06', text: 'Pay people. Exposure is not a rate. Agree the fee before the first frame.', draft: true },
  { n: '07', text: 'Ask before you use it. Their audio, their grade, their look. A DM costs nothing.', draft: true },
];
