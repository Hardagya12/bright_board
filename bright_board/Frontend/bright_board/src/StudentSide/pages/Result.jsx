import { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Download, Share2, Search, SortAsc, SortDesc, Book, TrendingUp, TrendingDown, CheckCircle, XCircle, Award, BarChart2, PieChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { downloadPDF, downloadCSV } from '../utils/download';
import { listStudentResults, getStudentResultsAnalytics } from '../../utils/services/results';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Result = () => {
  const [studentData, setStudentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [analytics, setAnalytics] = useState({ trend: [], distribution: [] });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await listStudentResults();
        const results = data.results || [];
        const subjects = Array.from(new Set(results.map(r => r.subjectName).filter(Boolean)));
        const subjectsData = subjects.map(name => {
          const entry = results.filter(r => r.subjectName === name).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          return {
            name,
            marksObtained: Math.round(entry.percentage),
            totalMarks: 100,
            grade: entry.grade,
          };
        });
        const cgpa = (subjectsData.reduce((sum, s) => sum + s.marksObtained / 10, 0) / (subjectsData.length || 1)).toFixed(2);
        const passPercentage = (results.filter(r => r.status === 'Pass').length / (results.length || 1)) * 100;
        const bestSubject = [...subjectsData].sort((a, b) => b.marksObtained - a.marksObtained)[0] || null;
        const worstSubject = [...subjectsData].sort((a, b) => a.marksObtained - b.marksObtained)[0] || null;
        setStudentData({ subjects: subjectsData, cgpa, passPercentage, bestSubject, worstSubject });
        try {
          const { data: an } = await getStudentResultsAnalytics();
          setAnalytics(an);
        } catch { }
      } catch (err) {
        setStudentData({ subjects: [], cgpa: 0, passPercentage: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getPerformanceIndicator = (cgpa) => {
    if (cgpa >= 9) return { label: 'Excellent', color: 'text-emerald-400' };
    if (cgpa >= 7) return { label: 'Good', color: 'text-cyan-400' };
    if (cgpa >= 5) return { label: 'Average', color: 'text-amber-400' };
    return { label: 'Needs Improvement', color: 'text-rose-400' };
  };

  const sortData = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredSubjects = studentData?.subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSubjects = filteredSubjects?.sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.6)', font: { family: "'Outfit', sans-serif" } } },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 26, 0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.7)',
        padding: 16,
        cornerRadius: 16,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: true,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)', display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { family: "'Outfit', sans-serif" } } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font: { family: "'Outfit', sans-serif" } } }
    }
  };

  const barChartData = {
    labels: studentData?.subjects.map(s => s.name) || [],
    datasets: [{
      label: 'Marks Obtained',
      data: studentData?.subjects.map(s => s.marksObtained) || [],
      backgroundColor: 'rgba(0, 245, 255, 0.2)',
      borderColor: '#00f5ff',
      borderWidth: 1,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(0, 245, 255, 0.4)',
    }],
  };

  const pieChartData = {
    labels: analytics.distribution.map(d => d.name),
    datasets: [{
      data: analytics.distribution.map(d => d.value),
      backgroundColor: ['#00f5ff', '#10b981', '#f59e0b', '#ef4444', '#bf00ff', '#8b5cf6'],
      borderColor: 'rgba(15, 15, 26, 1)',
      borderWidth: 4,
      hoverOffset: 4,
    }],
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f9faf6] font-body relative">
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vh] bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />

      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[#e8ebe6] scrollbar-track-transparent relative z-10">
        <div className="max-w-7xl mx-auto space-y-10">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">Results & Analytics</h1>
              <p className="text-[#868685] tracking-wide mt-2">Track your academic performance and progress.</p>
            </div>
            <div className="flex gap-4">
              <Button className="bg-white hover:bg-[#e2f6d5] border border-[#e8ebe6] text-[#0e0f0c] rounded-full px-6 transition-all" onClick={() => studentData && downloadPDF(studentData.subjects)}>
                <Download size={16} className="mr-2" /> PDF Report
              </Button>
              <Button className="bg-white hover:bg-[#e2f6d5] border border-[#e8ebe6] text-[#0e0f0c] rounded-full px-6 transition-all" onClick={() => studentData && downloadCSV(studentData.subjects)}>
                <Download size={16} className="mr-2" /> Export CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-[24px] bg-white" />)}
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card accentColor="cyan" className="p-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-cyan-400">
                    <Award size={80} className="transform rotate-12" />
                  </div>
                  <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] shadow-inner flex items-center justify-center text-cyan-400 mb-4">
                    <Award size={24} />
                  </div>
                  <h3 className="text-[#868685] text-xs font-bold uppercase tracking-widest mb-1">Cumulative GPA</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-[#0e0f0c] font-display tracking-tight drop-shadow-md">{studentData.cgpa}</span>
                    <span className="text-[#868685] mb-1.5 text-sm font-medium">/ 10.0</span>
                  </div>
                  <div className="mt-5 h-2 bg-black/40 rounded-full overflow-hidden border border-[#e8ebe6] shadow-inner">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_rgba(0,245,255,0.5)]" style={{ width: `${(studentData.cgpa / 10) * 100}%` }} />
                  </div>
                </Card>

                <Card accentColor="green" className="p-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-emerald-400">
                    <CheckCircle size={80} className="transform rotate-12" />
                  </div>
                  <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] shadow-inner flex items-center justify-center text-emerald-400 mb-4">
                    <CheckCircle size={24} />
                  </div>
                  <h3 className="text-[#868685] text-xs font-bold uppercase tracking-widest mb-1">Pass Ratio</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-[#0e0f0c] font-display tracking-tight drop-shadow-md">{studentData.passPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="mt-5 flex gap-4 text-[11px] font-bold tracking-wide">
                    <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"/> Passed: {studentData.subjects.filter(s => s.grade !== 'F').length}</span>
                    <span className="text-rose-400 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]"/> Failed: {studentData.subjects.filter(s => s.grade === 'F').length}</span>
                  </div>
                </Card>

                <Card accentColor="amber" className="p-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-amber-400">
                    <TrendingUp size={80} className="transform rotate-12" />
                  </div>
                  <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] shadow-inner flex items-center justify-center text-amber-400 mb-4">
                    <TrendingUp size={24} />
                  </div>
                  <h3 className="text-[#868685] text-xs font-bold uppercase tracking-widest mb-1">Overall Status</h3>
                  <div className={`text-2xl mt-1 font-bold font-display tracking-wide ${getPerformanceIndicator(studentData.cgpa).color}`}>
                    {getPerformanceIndicator(studentData.cgpa).label}
                  </div>
                  <p className="text-[#868685] text-[10px] mt-2 uppercase tracking-widest">Based on computation metrics</p>
                </Card>

                <Card accentColor="purple" className="p-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-purple-400">
                    <Book size={80} className="transform rotate-12" />
                  </div>
                  <div className="w-12 h-12 rounded-[16px] bg-white border border-[#e8ebe6] shadow-inner flex items-center justify-center text-purple-400 mb-4">
                    <Award size={24} />
                  </div>
                  <h3 className="text-[#868685] text-xs font-bold uppercase tracking-widest mb-1">Peak Module</h3>
                  <div className="text-xl font-bold text-[#0e0f0c] truncate font-display tracking-wide mt-1" title={studentData.bestSubject?.name}>
                    {studentData.bestSubject?.name || 'N/A'}
                  </div>
                  <div className="text-purple-400 text-sm font-bold tracking-wide mt-2">
                    {studentData.bestSubject?.marksObtained}% Score
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 accent-top-cyan">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide flex items-center gap-3">
                      <BarChart2 className="text-cyan-400" size={24} /> Subject Performance
                    </h3>
                  </div>
                  <div className="h-72">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-8 accent-top-purple">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#0e0f0c] font-display tracking-wide flex items-center gap-3">
                      <PieChart className="text-purple-400" size={24} /> Grade Distribution
                    </h3>
                  </div>
                  <div className="h-72 flex justify-center">
                    <Pie data={pieChartData} options={{ ...chartOptions, scales: {} }} />
                  </div>
                </div>
              </div>

              {/* Detailed Results Table */}
              <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-[#e8ebe6] flex flex-col md:flex-row justify-between items-center gap-6">
                  <h3 className="text-2xl font-bold text-[#0e0f0c] font-display tracking-tight">Detailed Analysis</h3>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#868685]" size={18} />
                    <input
                      type="text"
                      placeholder="Search modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-[#e8ebe6] rounded-full pl-12 pr-6 py-3 text-sm text-[#0e0f0c] focus:border-cyan-400 focus:shadow-[inset_0_0_15px_rgba(0,245,255,0.1)] outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-[#e8ebe6] text-xs font-bold uppercase tracking-widest text-[#868685]">
                        <th className="p-5 cursor-pointer hover:text-[#0e0f0c] transition-colors" onClick={() => sortData('name')}>
                          <div className="flex items-center gap-2">Module {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} className="text-cyan-400"/> : <SortDesc size={14} className="text-cyan-400"/>)}</div>
                        </th>
                        <th className="p-5 cursor-pointer hover:text-[#0e0f0c] transition-colors" onClick={() => sortData('marksObtained')}>
                          <div className="flex items-center gap-2">Score {sortConfig.key === 'marksObtained' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} className="text-cyan-400"/> : <SortDesc size={14} className="text-cyan-400"/>)}</div>
                        </th>
                        <th className="p-5 cursor-pointer hover:text-[#0e0f0c] transition-colors" onClick={() => sortData('grade')}>
                          <div className="flex items-center gap-2">Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} className="text-cyan-400"/> : <SortDesc size={14} className="text-cyan-400"/>)}</div>
                        </th>
                        <th className="p-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedSubjects?.map((subject) => (
                        <tr
                          key={subject.name}
                          onClick={() => setSelectedSubject(subject)}
                          className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-[#868685] group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all shadow-inner">
                                <Book size={18} />
                              </div>
                              <span className="font-bold text-[#0e0f0c] tracking-wide">{subject.name}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col gap-2">
                              <span className="text-[#0e0f0c] font-bold tracking-wide">{subject.marksObtained} <span className="text-[#868685] text-sm">/ {subject.totalMarks}</span></span>
                              <div className="w-32 h-2 bg-black/40 rounded-full overflow-hidden shadow-inner border border-[#e8ebe6]">
                                <div
                                  className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${subject.marksObtained >= 80 ? 'bg-emerald-400 text-emerald-400' : subject.marksObtained >= 60 ? 'bg-cyan-400 text-cyan-400' : 'bg-rose-400 text-rose-400'}`}
                                  style={{ width: `${subject.marksObtained}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border shadow-inner ${subject.grade === 'F'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            {subject.grade === 'F' ? (
                               <span className="text-rose-400 text-sm font-bold tracking-wide flex items-center justify-end gap-2"><XCircle size={16} /> Fail</span>
                            ) : (
                               <span className="text-emerald-400 text-sm font-bold tracking-wide flex items-center justify-end gap-2"><CheckCircle size={16} /> Pass</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <AnimatePresence>
            {selectedSubject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-[#f9faf6]/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 font-body"
                onClick={() => setSelectedSubject(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="bg-white border border-[#e8ebe6] rounded-[24px] shadow-sm p-10 border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden accent-top-cyan">
                    <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 blur-sm rounded-full"></div>
                    
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-[24px] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6 text-cyan-400 shadow-inner">
                        <Book size={40} className="drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]" />
                      </div>
                      <h2 className="text-3xl font-bold text-[#0e0f0c] font-display tracking-tight mb-2">{selectedSubject.name}</h2>
                      <p className="text-cyan-400/80 text-xs font-bold uppercase tracking-widest">Performance Report</p>
                    </div>

                    <div className="space-y-4 mb-10">
                      <div className="flex justify-between items-center p-4 rounded-[16px] bg-white/[0.03] border border-[#e8ebe6] hover:bg-white/[0.06] transition-colors">
                        <span className="text-[#868685] font-medium tracking-wide">Score</span>
                        <span className="text-[#0e0f0c] font-bold text-lg">{selectedSubject.marksObtained} <span className="text-[#868685] text-sm">/ {selectedSubject.totalMarks}</span></span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-[16px] bg-white/[0.03] border border-[#e8ebe6] hover:bg-white/[0.06] transition-colors">
                        <span className="text-[#868685] font-medium tracking-wide">Grade Awarded</span>
                        <span className={`font-bold text-lg ${selectedSubject.grade === 'F' ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedSubject.grade}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-[16px] bg-white/[0.03] border border-[#e8ebe6] hover:bg-white/[0.06] transition-colors">
                        <span className="text-[#868685] font-medium tracking-wide">Status</span>
                        <span className="text-cyan-400 font-bold">
                          {selectedSubject.marksObtained >= 80 ? 'Excellent' : selectedSubject.marksObtained >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>

                    <Button className="w-full py-4 rounded-full bg-white border border-[#e8ebe6] hover:bg-[#e2f6d5] text-[#0e0f0c] font-bold tracking-wide transition-all shadow-inner" onClick={() => setSelectedSubject(null)}>
                      Close Report
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Result;