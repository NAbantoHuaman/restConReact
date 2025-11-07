import { SelectHTMLAttributes, useId } from 'react';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export default function Select({ label, className = '', children, ...props }: Props) {
  const id = useId();
  return (
    <div className={`relative ${className}`}>
      <select
        id={id}
        {...props}
        className={`peer w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-3 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent-300`}
      >
        {children}
      </select>
      <label
        htmlFor={id}
        className={`absolute left-3 -top-2 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-600 dark:text-neutral-400 transition-all peer-focus:-top-2 peer-focus:text-xs`}
      >
        {label}
      </label>
    </div>
  );
}