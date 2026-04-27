import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, School, ChevronRight, BookOpen } from 'lucide-react';
import { 
  GradCapSVG, BookSVG, BackpackSVG, PencilSVG, 
  StarSVG, LightbulbSVG, SchoolBellSVG, SparklesSVG, ABCBlockSVG, ChalkboardSVG
} from '../../components/svg/SchoolIllustrations';

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full font-body overflow-hidden bg-[#f9faf6]">
      
      {/* Left Panel: Institute / Tutor */}
      <div 
        className="flex-1 relative flex flex-col justify-center items-center p-8 md:p-20 bg-white text-[#0e0f0c] overflow-hidden group cursor-pointer transition-all duration-500 hover:flex-[1.2] border-r border-[#e8ebe6]"
        onClick={() => navigate('/a/signup')}
      >
        {/* Soft green blob */}
        <div className="absolute top-10 left-10 w-[200px] h-[200px] bg-[#9fe870]/15 rounded-full blur-[80px] pointer-events-none transition-transform group-hover:scale-150 duration-700" />
        
        {/* Notebook lines background */}
        <div className="absolute inset-0 notebook-lines opacity-30 pointer-events-none" />
        
        {/* Floating Illustrations */}
        <div className="absolute top-[10%] right-[10%] opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none">
          <ChalkboardSVG className="" size={100} />
        </div>
        <div className="absolute bottom-[15%] left-[8%] opacity-20 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none">
          <PencilSVG size={60} />
        </div>
        <div className="absolute bottom-[10%] right-[15%] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
          <StarSVG size={45} />
        </div>
        
        <div className="relative z-10 max-w-sm w-full text-left">
          <div className="w-20 h-20 rounded-[20px] bg-[#e2f6d5] border-2 border-[#9fe870]/30 flex items-center justify-center mb-8 transform group-hover:-translate-y-2 group-hover:scale-105 transition-transform duration-300 shadow-md">
            <GraduationCap size={36} className="text-[#163300]" />
          </div>
          
          <h2 className="text-5xl font-display tracking-tight mb-2 relative inline-block text-[#0e0f0c]">
            Institute
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#9fe870" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </h2>
          
          <p className="text-[#868685] text-sm mt-6 mb-10 leading-relaxed font-medium">
            Manage batches, track attendance, and oversee your entire educational ecosystem with powerful administrative tools.
          </p>
          
          <div className="flex items-center gap-3 font-bold text-sm tracking-wide text-[#163300] group-hover:text-[#9fe870] transition-colors">
            <span className="btn-wise-outline group-hover:bg-[#9fe870] group-hover:text-[#163300] group-hover:border-[#9fe870] transition-all flex items-center gap-2">
              Access Portal <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel: Student */}
      <div 
        className="flex-1 relative flex flex-col justify-center items-center p-8 md:p-20 bg-[#e2f6d5] text-[#0e0f0c] overflow-hidden group cursor-pointer transition-all duration-500 hover:flex-[1.2]"
        onClick={() => navigate('/s/signin')}
      >
        {/* Yellow blob */}
        <div className="absolute bottom-10 right-10 w-[200px] h-[200px] bg-[#ffd11a]/15 rounded-full blur-[80px] pointer-events-none transition-transform group-hover:scale-150 duration-700" />
        
        {/* Floating Illustrations */}
        <div className="absolute top-[10%] left-[10%] opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none">
          <BookSVG size={80} />
        </div>
        <div className="absolute top-[15%] right-[8%] opacity-25 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none">
          <BackpackSVG size={65} />
        </div>
        <div className="absolute bottom-[12%] left-[12%] opacity-20 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none">
          <LightbulbSVG size={55} />
        </div>
        <div className="absolute bottom-[8%] right-[10%] opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none">
          <ABCBlockSVG size={80} />
        </div>
        <div className="absolute top-[45%] right-[5%] opacity-20 pointer-events-none">
          <SparklesSVG size={30} />
        </div>

        <div className="relative z-10 max-w-sm w-full text-left">
          <div className="w-20 h-20 rounded-[20px] bg-white border-2 border-[#9fe870]/30 flex items-center justify-center mb-8 transform group-hover:-translate-y-2 group-hover:scale-105 transition-transform duration-300 shadow-md">
            <School size={36} className="text-[#163300]" />
          </div>
          
          <h2 className="text-5xl font-display tracking-tight mb-2 text-[#163300] relative inline-block">
            Student
            <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
              <path d="M2 5 Q50 1 100 5 Q150 9 198 3" stroke="#ffd11a" strokeWidth="4" strokeLinecap="round" fill="none" />
            </svg>
          </h2>
          
          <p className="text-[#454745] text-sm mt-6 mb-10 leading-relaxed font-medium">
            Access study materials, attempt live exams, and track your performance metrics in real-time. Your learning journey starts here!
          </p>
          
          <div className="flex items-center gap-3 font-bold text-sm tracking-wide">
            <span className="btn-wise group-hover:shadow-green-glow transition-all flex items-center gap-2">
              <BookOpen size={16} /> Start Learning <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RoleSelection;