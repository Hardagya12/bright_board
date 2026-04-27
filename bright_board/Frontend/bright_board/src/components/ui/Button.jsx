import React from 'react';
import { motion } from 'framer-motion';

function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-body font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9fe870]/40 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden cursor-pointer';

  const variants = {
    primary: 'btn-wise',
    secondary: 'btn-wise-outline',
    outline: 'bg-transparent text-[#0e0f0c] border-2 border-[#e8ebe6] hover:border-[#9fe870] hover:bg-[#e2f6d5] rounded-full',
    ghost: 'bg-transparent text-[#454745] border-transparent hover:bg-[#e2f6d5] hover:text-[#163300] rounded-full',
    accent: 'bg-[#9fe870] text-[#163300] border border-transparent rounded-full shadow-green-glow',
    danger: 'btn-wise-danger',
    success: 'bg-[#e2f6d5] text-[#054d28] border border-[#054d28]/15 hover:bg-[#cdffad] rounded-full',
    warning: 'bg-[#fff8e0] text-[#8a6d00] border border-[#ffd11a]/20 hover:bg-[#ffd11a]/30 rounded-full',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const width = fullWidth ? 'w-full' : '';
  const variantClass = variants[variant] || variants.primary;
  const classes = [base, variantClass, sizes[size] || sizes.md, width, className].join(' ').trim();

  return (
    <motion.button
      className={classes}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

export default Button;