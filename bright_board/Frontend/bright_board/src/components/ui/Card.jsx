import React from 'react';

function Card({ title, children, className = '' }) {
  return (
    <div className={[
      'border border-bw-37 rounded-lg bg-black text-white shadow-lg',
      'p-4',
      className,
    ].join(' ').trim()}>
      {title && (
        <h2 className="font-comic text-xl mb-3">
          {title}
        </h2>
      )}
      <div className="font-gill-sans">
        {children}
      </div>
    </div>
  );
}

export default Card;