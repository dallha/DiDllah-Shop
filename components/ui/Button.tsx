import type { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const styles: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800',
  secondary:
    'inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-50',
  ghost:
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-slate-950 transition hover:text-slate-700',
};

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${styles[variant]} ${className}`.trim()} {...props} />;
}
