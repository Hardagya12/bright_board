import React from 'react';
import { CheckCircle } from 'lucide-react';
import InputGroup from '../../components/ui/InputGroup';

const ExamSettingsForm = ({ examForm, setExamForm, batches, isModal = false }) => {
  return (
    <>
      <InputGroup label="Exam Title" value={examForm.title} onChange={(e) => setExamForm(f => ({...f, title: e.target.value}))} required placeholder="e.g. Midterm Evaluation" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Subject" value={examForm.subject} onChange={(e) => setExamForm(f => ({...f, subject: e.target.value}))} placeholder="e.g. Mathematics" />
        <InputGroup label="Scheduled Date" type="date" value={examForm.scheduledDate} onChange={(e) => setExamForm(f => ({...f, scheduledDate: e.target.value}))} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputGroup label="Duration (Mins)" type="number" min="1" max="600" value={examForm.durationMinutes} onChange={(e) => setExamForm(f => ({...f, durationMinutes: parseInt(e.target.value)}))} required />
        <InputGroup label="Passing Marks (%)" type="number" min="0" max="100" value={examForm.passingMarks} onChange={(e) => setExamForm(f => ({...f, passingMarks: parseInt(e.target.value)}))} />
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Target Batch</label>
          <select value={examForm.batchId} onChange={(e) => setExamForm(f => ({...f, batchId: e.target.value}))}
            className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-full px-5 py-3 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner custom-select appearance-none cursor-pointer pr-10"
            style={isModal ? { backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23ffffff%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem top 50%', backgroundSize: '0.65rem auto' } : {}}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-[#868685] uppercase tracking-widest ml-1">Instructions for Students</label>
        <textarea rows={3} value={examForm.instructions}
          onChange={(e) => setExamForm(f => ({...f, instructions: e.target.value}))}
          placeholder="Add any specific rules or instructions..."
          className="w-full bg-[#f9faf6] border border-[#e8ebe6] rounded-[24px] px-5 py-4 text-sm font-medium tracking-wide text-[#0e0f0c] outline-none resize-none focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] transition-all shadow-inner" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <label className={`flex items-start gap-4 p-5 rounded-[24px] ${isModal ? 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]' : 'bg-[#f9faf6] border border-[#e8ebe6] hover:bg-white'} cursor-pointer transition-colors shadow-inner`}>
          <div className="relative flex items-center mt-1">
            <input type="checkbox" checked={examForm.shuffleQuestions} onChange={(e) => setExamForm(f => ({...f, shuffleQuestions: e.target.checked}))} className="peer sr-only" />
            <div className={`w-5 h-5 rounded-full border border-[#e8ebe6] peer-checked:bg-cyan-400 peer-checked:border-cyan-400 transition-all flex items-center justify-center ${!isModal && 'mt-0.5'}`}>
              <CheckCircle size={14} className={isModal ? "text-black opacity-0 peer-checked:opacity-100 transition-opacity" : "text-white opacity-0 peer-checked:opacity-100"} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="text-[#0e0f0c] text-sm font-bold tracking-wide">{isModal ? 'Shuffle Questions' : 'Shuffle'}</p>
            <p className="text-[#868685] text-xs mt-1 font-medium leading-tight">{isModal ? 'Randomize order for each student' : 'Randomize order'}</p>
          </div>
        </label>
        <label className={`flex items-start gap-4 p-5 rounded-[24px] ${isModal ? 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]' : 'bg-[#f9faf6] border border-[#e8ebe6] hover:bg-white'} cursor-pointer transition-colors shadow-inner`}>
          <div className="relative flex items-center mt-1">
            <input type="checkbox" checked={examForm.showResultImmediately} onChange={(e) => setExamForm(f => ({...f, showResultImmediately: e.target.checked}))} className="peer sr-only" />
            <div className={`w-5 h-5 rounded-full border border-[#e8ebe6] peer-checked:bg-cyan-400 peer-checked:border-cyan-400 transition-all flex items-center justify-center ${!isModal && 'mt-0.5'}`}>
              <CheckCircle size={14} className={isModal ? "text-black opacity-0 peer-checked:opacity-100 transition-opacity" : "text-white opacity-0 peer-checked:opacity-100"} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="text-[#0e0f0c] text-sm font-bold tracking-wide">{isModal ? 'Instant Results' : 'Results'}</p>
            <p className="text-[#868685] text-xs mt-1 font-medium leading-tight">{isModal ? 'Show score upon completion' : 'Show immediately'}</p>
          </div>
        </label>
        <label className={`flex items-start gap-4 p-5 rounded-[24px] ${isModal ? 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]' : 'bg-[#f9faf6] border border-[#e8ebe6] hover:bg-white'} cursor-pointer transition-colors shadow-inner`}>
          <div className="relative flex items-center mt-1">
            <input type="checkbox" checked={examForm.negativeMarkingEnabled} onChange={(e) => setExamForm(f => ({...f, negativeMarkingEnabled: e.target.checked}))} className="peer sr-only" />
            <div className={`w-5 h-5 rounded-full border border-[#e8ebe6] peer-checked:bg-pink-400 peer-checked:border-pink-400 transition-all flex items-center justify-center ${!isModal && 'mt-0.5'}`}>
              <CheckCircle size={14} className={isModal ? "text-black opacity-0 peer-checked:opacity-100 transition-opacity" : "text-white opacity-0 peer-checked:opacity-100"} strokeWidth={3} />
            </div>
          </div>
          <div>
            <p className="text-[#0e0f0c] text-sm font-bold tracking-wide">{isModal ? 'Negative Marking' : 'Negative Mark'}</p>
            <p className="text-[#868685] text-xs mt-1 font-medium leading-tight">{isModal ? 'Enable deduction for wrong answers' : 'Deduct for wrong'}</p>
          </div>
        </label>
      </div>
    </>
  );
};

export default ExamSettingsForm;
