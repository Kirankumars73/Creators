// The cut from Poster to Editing Bay (§7): everything under /join sits on carbon.
export default function JoinLayout({ children }: LayoutProps<'/join'>) {
  return (
    <div data-surface="bay" className="min-h-dvh bg-surface">
      {children}
    </div>
  );
}
