// The cut from Poster to Editing Bay (§7): everything under /join sits on carbon.
// overflow-x: clip keeps frames sliding off-screen from ever widening the page.
export default function JoinLayout({ children }: LayoutProps<'/join'>) {
  return (
    <div data-surface="bay" className="min-h-dvh overflow-x-clip bg-surface">
      {children}
    </div>
  );
}
