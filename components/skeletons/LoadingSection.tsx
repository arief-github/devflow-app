import type { ReactNode } from "react";

type Props = {
  /** Teks untuk screen reader, mis. "Loading questions" */
  label: string;
  children: ReactNode;
};

/**
 * Pembungkus semua skeleton halaman.
 * Memberi tahu screen reader bahwa konten sedang dimuat,
 * karena skeleton sendiri tidak punya teks yang bisa dibacakan.
 */
export function LoadingSection({ label, children }: Props) {
  return (
    <section aria-busy="true" aria-live="polite">
      <span className="sr-only" role="status">
        {label}
      </span>
      {children}
    </section>
  );
}
