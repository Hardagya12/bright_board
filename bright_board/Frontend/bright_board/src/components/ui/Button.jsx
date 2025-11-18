import React from 'react';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-comic border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-bw-75 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-white text-black border-bw-87 hover:bg-bw-87 hover:text-black',
    outline: 'bg-transparent text-white border-bw-37 hover:bg-bw-12',
    ghost: 'bg-transparent text-white border-transparent hover:bg-bw-12',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };
  const width = fullWidth ? 'w-full' : '';
  const classes = [base, variants[variant] || variants.primary, sizes[size] || sizes.md, width, className].join(' ').trim();
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;