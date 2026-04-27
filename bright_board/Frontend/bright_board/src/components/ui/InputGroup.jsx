import React from 'react';

const InputGroup = ({ label, ...props }) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">{label}</label>
    <input className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-sm text-[#0e0f0c] placeholder:text-[#868685] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none transition-all shadow-inner" {...props} />
  </div>
);

export default InputGroup;
