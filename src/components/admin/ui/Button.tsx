import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const classesByVariant: Record<Variant, string> = {
  primary:
    'bg-accent-500 text-neutral-900 hover:bg-accent-400 focus:ring-2 focus:ring-accent-300',
  outline:
    'border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus:ring-2 focus:ring-red-300',
  ghost:
    'text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60',
};

const classesBySize: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className = '', ...props },
  ref
) {
  const base = 'inline-flex items-center gap-2 font-medium transition-colors ease-smooth focus:outline-none';
  return (
    <button ref={ref} className={`${base} ${classesByVariant[variant]} ${classesBySize[size]} ${className}`} {...props} />
  );
});

export default Button;