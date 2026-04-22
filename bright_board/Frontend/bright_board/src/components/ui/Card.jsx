import React from 'react';
import { motion } from 'framer-motion';

function Card({ title, children, className = '', variant = 'default', hover = true, ...props }) {
  const variants = {
    default: 'bg-bw-12/40 border-white/5',
    glass: 'bg-white/5 border-white/10 backdrop-blur-md',
    outlined: 'bg-transparent border-white/10',
    solid: 'bg-bw-12 border-white/5',
  };

  const hoverEffect = hover ? { y: -4, transition: { duration: 0.3 } } : {};

  return (
    <motion.div
      className={[
        'border rounded-2xl text-white shadow-xl overflow-hidden relative',
        variants[variant] || variants.default,
        className,
      ].join(' ').trim()}
      whileHover={hover ? hoverEffect : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Optional subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      <div className="relative z-10 p-6">
        {title && (
          <h2 className="font-bold text-xl mb-4 text-white/90 tracking-tight">
            {title}
          </h2>
        )}
        <div className="text-white/70">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default Card;