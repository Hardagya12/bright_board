import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Upload, Plus, AlertCircle, FileJson, X } from 'lucide-react';
import { createExam, addBulkQuestions, uploadPdfQuestions } from '../../utils/services/exams';
import { listBatches } from '../../utils/services/batches';
import AdminSidebar from '../components/AdminSidebar';
import Button from '../../components/ui/Button';
import ExamSettingsForm from '../components/ExamSettingsForm';

const CreateExam = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Details, 2 = Questions
  const [createdExamId, setCreatedExamId] = useState(null);
  
  const [examForm, setExamForm] = useState({
    title: '', description: '', subject: '', scheduledDate: '', durationMinutes: 60,
    batchId: '', status: 'draft', totalMarks: 0, passingMarks: 40,
    shuffleQuestions: false, showResultImmediately: true, instructions: '',
    negativeMarkingEnabled: false, defaultNegativeMarks: 0,
  });
  
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Bulk upload
  const [file, setFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: b } = await listBatches({ limit: 100 });
        setBatches((b.batches || []).map(x => ({ id: x.batchId || x._id, name: x.name })));
      } catch { }
    };
    load();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await createExam(examForm);
      setCreatedExamId(data.examId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const processBulkUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const questions = JSON.parse(text);
        if (!Array.isArray(questions)) {
          throw new Error("JSON file must contain an array of questions.");
        }
        await addBulkQuestions(createdExamId, questions);
        navigate('/a/exams');
      } else if (file.name.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          try {
            await uploadPdfQuestions(createdExamId, reader.result);
            navigate('/a/exams');
          } catch (err) {
            setError(err.response?.data?.error || err.message);
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to read PDF file');
          setLoading(false);
        };
        return; // wait for onload
      } else {
        throw new Error("Currently only JSON and PDF files are supported.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bb-offwhite)] font-body relative">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 mt-4">
          
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/a/exams')} className="w-10 h-10 rounded-full bg-white border border-[#e8ebe6] flex items-center justify-center text-[#868685] hover:text-[#0e0f0c] shadow-sm transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight">Create New Exam</h1>
              <p className="text-[#868685] text-sm mt-1">Step {step} of 2: {step === 1 ? 'Exam Details' : 'Add Questions'}</p>
            </div>
          </div>

          {error && (
            <div className="px-5 py-3 bg-[#ffeaea] border border-[#d03238]/20 rounded-[16px] text-[#d03238] text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-3"><AlertCircle size={16} /> {error}</div>
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}

          <div className="bg-white border border-[#e8ebe6] rounded-[32px] p-8 shadow-sm">
            {step === 1 ? (
              <form onSubmit={handleCreateExam} className="space-y-6">
                <ExamSettingsForm examForm={examForm} setExamForm={setExamForm} batches={batches} />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={loading} className="btn-primary rounded-full px-8 shadow-glow-cyan font-bold py-3.5">
                    {loading ? 'Creating...' : 'Create Exam & Continue'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0e0f0c] font-display mb-2">Exam Created Successfully!</h2>
                  <p className="text-[#868685]">Now, let's add some questions to your assessment.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bulk Upload Option */}
                  <div className="border border-[#e8ebe6] rounded-[24px] p-6 bg-[#f9faf6] flex flex-col items-center justify-center text-center hover:border-cyan-400 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4">
                      <FileJson size={24} className="text-cyan-500" />
                    </div>
                    <h3 className="font-bold text-[#0e0f0c] mb-2">Upload JSON or AI PDF</h3>
                    <p className="text-sm text-[#868685] mb-6">Upload a JSON array or a PDF file containing your questions. PDFs are automatically classified by AI.</p>
                    
                    <input type="file" id="bulk-upload" accept=".json,.pdf" className="hidden" onChange={handleFileUpload} />
                    
                    {file ? (
                      <div className="w-full flex items-center justify-between bg-white border border-[#e8ebe6] p-3 rounded-full mb-4">
                        <span className="text-xs font-bold text-[#0e0f0c] truncate px-2">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-[#868685] hover:text-red-500"><X size={16}/></button>
                      </div>
                    ) : (
                      <label htmlFor="bulk-upload" className="w-full py-3 px-6 rounded-full border border-cyan-400 text-cyan-500 font-bold text-sm cursor-pointer hover:bg-cyan-500/10 transition-colors">
                        Choose JSON/PDF File
                      </label>
                    )}
                    
                    {file && (
                      <Button onClick={processBulkUpload} disabled={loading} className="w-full btn-primary rounded-full py-3 shadow-glow-cyan font-bold mt-2 text-sm">
                        {loading ? 'Uploading...' : 'Process Upload'}
                      </Button>
                    )}
                  </div>

                  {/* Manual Option */}
                  <div className="border border-[#e8ebe6] rounded-[24px] p-6 bg-[#f9faf6] flex flex-col items-center justify-center text-center hover:border-purple-500/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                      <Plus size={24} className="text-purple-500" />
                    </div>
                    <h3 className="font-bold text-[#0e0f0c] mb-2">Add Manually</h3>
                    <p className="text-sm text-[#868685] mb-6">Use the interactive question builder in the Exam Management matrix.</p>
                    
                    <Button onClick={() => navigate('/a/exams')} className="w-full bg-white border border-[#e8ebe6] text-[#0e0f0c] hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-300 rounded-full py-3 font-bold text-sm transition-colors mt-auto">
                      Go to Question Matrix
                    </Button>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <a href="/sample_questions.json" download className="text-xs text-cyan-500 font-bold hover:underline">Download Sample JSON Template</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
