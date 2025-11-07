import { InputHTMLAttributes, useId } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className = '', ...props }: Props) {
  const id = useId();
  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        {...props}
        className={`peer w-full bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-xl px-3 py-3 text-neutral-900 dark:text-neutral-100 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-accent-300`}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={`absolute left-3 -top-2 bg-white dark:bg-neutral-900 px-1 text-xs text-neutral-600 dark:text-neutral-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-xs`}
      >
        {label}
      </label>
    </div>
  );
}