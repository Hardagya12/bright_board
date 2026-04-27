import React, { useRef } from 'react';
import { motion } from 'framer-motion';

function Card({ title, children, className = '', variant = 'default', hover = true, accentColor, ...props }) {
  const hoverEffect = hover ? { y: -4, scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } } : {};
  const hasAnimated = useRef(false);

  const accentColors = {
    green: '#9fe870',
    yellow: '#ffd11a',
    orange: '#ffc091',
    red: '#d03238',
    blue: '#38c8ff',
  };

  const topColor = accentColor ? (accentColors[accentColor] || accentColor) : null;

  // Only play entrance animation once on first mount
  const shouldAnimate = !hasAnimated.current;
  if (shouldAnimate) hasAnimated.current = true;

  return (
    <motion.div
      className={`bb-card ${className}`}
      whileHover={hover ? hoverEffect : {}}
      initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {/* Green accent line on top */}
      {topColor && (
        <div
          className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full pointer-events-none"
          style={{ background: topColor }}
        />
      )}

      <div className="relative z-10 p-6 h-full flex flex-col">
        {title && (
          <div className="mb-4">
            <h2 className="font-display text-xl text-[#0e0f0c] tracking-tight">
              {title}
            </h2>
            <div className="w-12 h-1 mt-2 rounded-full bg-[#9fe870]" />
          </div>
        )}
        <div className="text-[#454745] flex-1">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default Card;