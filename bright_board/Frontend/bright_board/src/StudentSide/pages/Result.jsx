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
    if (cgpa >= 7) return { label: 'Good', color: 'text-blue-400' };
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
      legend: { labels: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } } },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  const barChartData = {
    labels: studentData?.subjects.map(s => s.name) || [],
    datasets: [{
      label: 'Marks Obtained',
      data: studentData?.subjects.map(s => s.marksObtained) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const pieChartData = {
    labels: analytics.distribution.map(d => d.name),
    datasets: [{
      data: analytics.distribution.map(d => d.value),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'],
      borderColor: 'rgba(0,0,0,0.2)',
      borderWidth: 2,
    }],
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Results & Analytics</h1>
              <p className="text-white/50">Track your academic performance and progress.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => studentData && downloadPDF(studentData.subjects)}>
                <Download size={16} className="mr-2" /> PDF
              </Button>
              <Button variant="outline" onClick={() => studentData && downloadCSV(studentData.subjects)}>
                <Download size={16} className="mr-2" /> CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-40 rounded-2xl bg-white/5" />
              <Skeleton className="h-40 rounded-2xl bg-white/5" />
              <Skeleton className="h-40 rounded-2xl bg-white/5" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-400">
                    <Award size={80} />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">CGPA</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{studentData.cgpa}</span>
                    <span className="text-white/40 mb-1">/ 10.0</span>
                  </div>
                  <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(studentData.cgpa / 10) * 100}%` }} />
                  </div>
                </Card>

                <Card variant="glass" className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-400">
                    <CheckCircle size={80} />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Pass Percentage</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">{studentData.passPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs">
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> Passed: {studentData.subjects.filter(s => s.grade !== 'F').length}</span>
                    <span className="text-rose-400 flex items-center gap-1"><XCircle size={12} /> Failed: {studentData.subjects.filter(s => s.grade === 'F').length}</span>
                  </div>
                </Card>

                <Card variant="glass" className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-400">
                    <TrendingUp size={80} />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Performance</h3>
                  <div className={`text-3xl font-bold ${getPerformanceIndicator(studentData.cgpa).color}`}>
                    {getPerformanceIndicator(studentData.cgpa).label}
                  </div>
                  <p className="text-white/40 text-xs mt-2">Based on overall CGPA</p>
                </Card>

                <Card variant="glass" className="p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-400">
                    <Book size={80} />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">Best Subject</h3>
                  <div className="text-xl font-bold text-white truncate" title={studentData.bestSubject?.name}>
                    {studentData.bestSubject?.name || 'N/A'}
                  </div>
                  <div className="text-emerald-400 text-sm font-medium mt-1">
                    {studentData.bestSubject?.marksObtained}% Score
                  </div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart2 className="text-blue-400" size={20} /> Subject Performance
                    </h3>
                  </div>
                  <div className="h-64">
                    <Bar data={barChartData} options={chartOptions} />
                  </div>
                </Card>

                <Card variant="glass" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <PieChart className="text-purple-400" size={20} /> Grade Distribution
                    </h3>
                  </div>
                  <div className="h-64 flex justify-center">
                    <Pie data={pieChartData} options={{ ...chartOptions, scales: {} }} />
                  </div>
                </Card>
              </div>

              {/* Detailed Results Table */}
              <Card variant="glass" className="overflow-hidden">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-lg font-bold text-white">Detailed Subject Analysis</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-white/60">
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => sortData('name')}>
                          <div className="flex items-center gap-2">Subject {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                        </th>
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => sortData('marksObtained')}>
                          <div className="flex items-center gap-2">Score {sortConfig.key === 'marksObtained' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                        </th>
                        <th className="p-4 cursor-pointer hover:text-white transition-colors" onClick={() => sortData('grade')}>
                          <div className="flex items-center gap-2">Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}</div>
                        </th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedSubjects?.map((subject) => (
                        <tr
                          key={subject.name}
                          onClick={() => setSelectedSubject(subject)}
                          className="hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white group-hover:bg-blue-500/20 transition-all">
                                <Book size={16} />
                              </div>
                              <span className="font-medium text-white">{subject.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-white font-bold">{subject.marksObtained} / {subject.totalMarks}</span>
                              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${subject.marksObtained >= 80 ? 'bg-emerald-500' : subject.marksObtained >= 60 ? 'bg-blue-500' : 'bg-rose-500'}`}
                                  style={{ width: `${subject.marksObtained}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${subject.grade === 'F'
                                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              }`}>
                              {subject.grade}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {subject.grade === 'F' ? (
                              <span className="text-rose-400 text-sm flex items-center justify-end gap-1"><XCircle size={14} /> Fail</span>
                            ) : (
                              <span className="text-emerald-400 text-sm flex items-center justify-end gap-1"><CheckCircle size={14} /> Pass</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          <AnimatePresence>
            {selectedSubject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedSubject(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-md"
                  onClick={e => e.stopPropagation()}
                >
                  <Card variant="glass" className="p-8 border-blue-500/30 shadow-2xl shadow-blue-500/10">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400">
                        <Book size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{selectedSubject.name}</h2>
                      <p className="text-white/50">Detailed Performance Report</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/60">Marks Obtained</span>
                        <span className="text-white font-bold">{selectedSubject.marksObtained} / {selectedSubject.totalMarks}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/60">Grade Awarded</span>
                        <span className={`font-bold ${selectedSubject.grade === 'F' ? 'text-rose-400' : 'text-emerald-400'}`}>{selectedSubject.grade}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-white/60">Performance</span>
                        <span className="text-blue-400 font-medium">
                          {selectedSubject.marksObtained >= 80 ? 'Excellent' : selectedSubject.marksObtained >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>

                    <Button variant="accent" fullWidth onClick={() => setSelectedSubject(null)}>
                      Close Report
                    </Button>
                  </Card>
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