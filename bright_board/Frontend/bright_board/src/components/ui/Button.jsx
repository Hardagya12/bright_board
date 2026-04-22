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
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm relative overflow-hidden';

  const variants = {
    primary: 'bg-white text-black border border-transparent shadow-lg shadow-white/10 hover:bg-gray-200',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
    outline: 'bg-transparent text-white border border-white/20 hover:bg-white/5 hover:border-white/40',
    ghost: 'bg-transparent text-white border-transparent hover:bg-white/5',
    accent: 'bg-blue-600 text-white border border-transparent shadow-lg shadow-blue-500/20 hover:bg-blue-700',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const width = fullWidth ? 'w-full' : '';

  // Fallback to primary if variant doesn't exist
  const variantClass = variants[variant] || variants.primary;

  const classes = [base, variantClass, sizes[size] || sizes.md, width, className].join(' ').trim();

  return (
    <motion.button
      className={classes}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default Button;