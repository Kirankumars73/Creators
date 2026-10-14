/** Supabase's API returns at most 1,000 rows per request: keep paging until a short page. */
export async function fetchAllPages<T>(page: (from: number, to: number) => Promise<T[]>, size = 1000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += size) {
    const rows = await page(from, from + size - 1);
    out.push(...rows);
    if (rows.length < size) return out;
  }
}
