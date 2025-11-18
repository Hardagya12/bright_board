import React from 'react';

function Skeleton({ className = '', width = '100%', height = '1rem' }) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded',
        'bg-gradient-to-r from-bw-12 via-bw-25 to-bw-12',
        'animate-shimmer',
        className,
      ].join(' ').trim()}
      style={{ width, height, backgroundSize: '200% 100%' }}
    />
  );
}

export default Skeleton;