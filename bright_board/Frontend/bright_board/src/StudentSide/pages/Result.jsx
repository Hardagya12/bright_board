import { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Download, Share2, Search, SortAsc, SortDesc, Book, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { downloadPDF, downloadCSV } from '../utils/download';
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

  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      const mockData = generateMockData();
      setStudentData(mockData);
      setIsLoading(false);
    }, 1500);
  }, []);

  const generateMockData = () => {
    const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science'];
    const data = {
      name: 'John Doe',
      rollNumber: 'A12345',
      class: '10th Grade',
      totalSubjects: subjects.length,
      subjects: subjects.map(subject => ({
        name: subject,
        marksObtained: Math.floor(Math.random() * 41) + 60, // 60 to 100
        totalMarks: 100,
        grade: calculateGrade(Math.floor(Math.random() * 41) + 60),
      })),
    };

    data.cgpa = calculateCGPA(data.subjects);
    data.passPercentage = (data.subjects.filter(s => s.grade !== 'F').length / data.totalSubjects) * 100;
    data.rank = Math.floor(Math.random() * 50) + 1; // 1 to 50
    data.performanceIndicator = getPerformanceIndicator(data.cgpa);
    data.bestSubject = [...data.subjects].sort((a, b) => b.marksObtained - a.marksObtained)[0];
    data.worstSubject = [...data.subjects].sort((a, b) => a.marksObtained - b.marksObtained)[0];

    return data;
  };

  const calculateGrade = (marks) => {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C';
    if (marks >= 50) return 'D';
    return 'F';
  };

  const calculateCGPA = (subjects) => {
    const totalGradePoints = subjects.reduce((sum, subject) => {
      const gradePoint = subject.marksObtained / 10;
      return sum + gradePoint;
    }, 0);
    return (totalGradePoints / subjects.length).toFixed(2);
  };

  const getPerformanceIndicator = (cgpa) => {
    if (cgpa >= 9) return 'Excellent';
    if (cgpa >= 7) return 'Good';
    if (cgpa >= 5) return 'Average';
    return 'Needs Improvement';
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

  const barChartData = {
    labels: studentData?.subjects.map(s => s.name) || [],
    datasets: [
      {
        label: 'Marks Obtained',
        data: studentData?.subjects.map(s => s.marksObtained) || [],
        backgroundColor: '#BFBFBF',
        borderColor: '#DEDEDE',
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: ['A+', 'A', 'B', 'C', 'D', 'F'],
    datasets: [
      {
        data: [
          studentData?.subjects.filter(s => s.grade === 'A+').length || 0,
          studentData?.subjects.filter(s => s.grade === 'A').length || 0,
          studentData?.subjects.filter(s => s.grade === 'B').length || 0,
          studentData?.subjects.filter(s => s.grade === 'C').length || 0,
          studentData?.subjects.filter(s => s.grade === 'D').length || 0,
          studentData?.subjects.filter(s => s.grade === 'F').length || 0,
        ],
        backgroundColor: ['#DEDEDE', '#BFBFBF', '#9E9E9E', '#808080', '#616161', '#404040'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const handleDownloadPDF = () => {
    if (studentData) {
      downloadPDF(studentData.subjects);
    }
  };

  const handleDownloadCSV = () => {
    if (studentData) {
      downloadCSV(studentData.subjects);
    }
  };

  const handleShareResults = () => {
    const shareUrl = window.location.href; // Replace with the specific URL you want to share
    const shareText = `Check out my results on Bright Board: ${shareUrl}`;

    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: 'Bright Board Results',
        text: shareText,
        url: shareUrl,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback to opening a new tab with the share URL
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Student Result Dashboard</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton height="8rem" />
            <Skeleton height="8rem" />
            <Skeleton height="8rem" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <h3 className="font-comic text-lg mb-2">Overall Performance</h3>
                <div className="relative w-32 h-32 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle cx="50" cy="50" r="45" className="stroke-bw-37" style={{ strokeWidth: 10, fill: 'none' }}></circle>
                    <circle cx="50" cy="50" r="45" className="stroke-bw-75" style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - studentData.cgpa / 10)}`,
                      strokeWidth: 10,
                      fill: 'none'
                    }}></circle>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-comic text-xl">{studentData.cgpa}</span>
                </div>
                <p className="text-bw-75 mt-2">CGPA</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-comic text-lg mb-2">Pass Percentage</h3>
                <p className="text-3xl font-comic">{studentData.passPercentage.toFixed(2)}%</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-bw-75"><CheckCircle size={16} /> Passed: {studentData.subjects.filter(s => s.grade !== 'F').length}</div>
                  <div className="flex items-center gap-2 text-bw-75"><XCircle size={16} /> Failed: {studentData.subjects.filter(s => s.grade === 'F').length}</div>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="font-comic text-lg mb-2">Rank & Performance</h3>
                <p className="text-3xl font-comic">#{studentData.rank}</p>
                <p className="text-bw-75 mt-1">{studentData.performanceIndicator}</p>
              </Card>
              <Card className="p-4">
                <h3 className="font-comic text-lg mb-2">Subject Analysis</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><TrendingUp size={16} /><span>Best: {studentData.bestSubject.name} ({studentData.bestSubject.marksObtained}%)</span></div>
                  <div className="flex items-center gap-2"><TrendingDown size={16} /><span>Needs Improvement: {studentData.worstSubject.name} ({studentData.worstSubject.marksObtained}%)</span></div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-comic text-lg mb-2">Subject-wise Performance</h3>
                <div className="h-64"><Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              </Card>
              <Card className="p-4">
                <h3 className="font-comic text-lg mb-2">Grade Distribution</h3>
                <div className="h-64"><Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              </Card>
            </div>

            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-2 border border-bw-37 rounded px-3 py-2">
                  <Search size={16} className="text-bw-62" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black text-white focus:outline-none"
                  />
                </div>
                <Button variant="outline" onClick={handleDownloadPDF}><Download size={16} className="mr-2" />Download PDF</Button>
                <Button variant="outline" onClick={handleDownloadCSV}><Download size={16} className="mr-2" />Download CSV</Button>
                <Button variant="outline" onClick={handleShareResults}><Share2 size={16} className="mr-2" />Share Results</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left border border-bw-37 rounded">
                  <thead className="bg-bw-12">
                    <tr>
                      <th className="px-3 py-2 cursor-pointer" onClick={() => sortData('name')}>
                        Subject {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                      </th>
                      <th className="px-3 py-2 cursor-pointer" onClick={() => sortData('marksObtained')}>
                        Marks {sortConfig.key === 'marksObtained' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                      </th>
                      <th className="px-3 py-2 cursor-pointer" onClick={() => sortData('grade')}>
                        Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubjects.map((subject) => (
                      <tr key={subject.name} className="hover:bg-bw-12 transition-colors" onClick={() => setSelectedSubject(subject)}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2"><Book size={16} /> {subject.name}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-40 bg-bw-12 rounded">
                              <div className="h-2 bg-bw-75 rounded" style={{ width: `${subject.marksObtained}%` }}></div>
                            </div>
                            <span>{subject.marksObtained} / {subject.totalMarks}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 border border-bw-37 rounded text-sm">{subject.grade}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {selectedSubject && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center animate-fade-in">
                <div className="border border-bw-37 bg-black text-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="font-comic text-xl mb-2">{selectedSubject.name}</h2>
                  <p>Marks: {selectedSubject.marksObtained} / {selectedSubject.totalMarks}</p>
                  <p>Grade: {selectedSubject.grade}</p>
                  <p>Performance: {selectedSubject.marksObtained >= 80 ? 'Excellent' : selectedSubject.marksObtained >= 60 ? 'Good' : 'Needs Improvement'}</p>
                  <div className="mt-4 flex justify-end"><Button variant="outline" onClick={() => setSelectedSubject(null)}>Close</Button></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Result;