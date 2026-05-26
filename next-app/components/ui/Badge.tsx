import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  variant?: 'neutral' | 'brand';
};

const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600',
  brand: 'rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-700',
};

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={styles[variant]}>{children}</span>;
}
