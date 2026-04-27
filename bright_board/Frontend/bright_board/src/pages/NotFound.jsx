import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f9faf6] flex items-center justify-center p-6 font-body">
      <div className="max-w-lg w-full text-center">
        <div className="relative inline-block mb-8">
          <span className="text-[160px] font-display text-[#e8ebe6] leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
        </div>

        <h1 className="text-3xl font-display text-[#0e0f0c] mb-3">Page Not Found</h1>
        <p className="text-[#868685] mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          Looks like this page has gone missing from the classroom. Let's get you back on track!
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-wise-outline px-6 py-3 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-wise px-6 py-3 flex items-center gap-2"
          >
            <Home size={16} /> Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
