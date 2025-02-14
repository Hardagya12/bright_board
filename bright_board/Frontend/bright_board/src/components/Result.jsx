import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Download, Share2, Search, SortAsc, SortDesc, Book, Award, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import './Result.css';
import { downloadPDF, downloadCSV } from '../utils/download';

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
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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
        backgroundColor: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff5722'],
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="result-page-container">
      <Sidebar />
      <motion.div 
        className="result-page"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 variants={itemVariants}>Student Result Dashboard</motion.h1>
        
        {isLoading ? (
          <div className="loading-skeleton">
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
            <div className="skeleton-item"></div>
          </div>
        ) : (
          <>
            <motion.div className="performance-summary" variants={containerVariants}>
              <motion.div className="summary-card" variants={itemVariants}>
                <h3>Overall Performance</h3>
                <div className="circular-progress">
                  <svg viewBox="0 0 100 100">
                    <circle className="progress-bg" cx="50" cy="50" r="45"></circle>
                    <circle className="progress-bar" cx="50" cy="50" r="45" style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${2 * Math.PI * 45 * (1 - studentData.cgpa / 10)}`,
                      strokeWidth: 10,
                      fill: 'none',
                      stroke: '#4caf50'
                    }}></circle>
                  </svg>
                  <span className="progress-text">{studentData.cgpa}</span>
                </div>
                <p>CGPA</p>
              </motion.div>
              <motion.div className="summary-card" variants={itemVariants}>
                <h3>Pass Percentage</h3>
                <p className="stat-number">{studentData.passPercentage.toFixed(2)}%</p>
                <div className="stat-icons">
                  <span><CheckCircle color="var(--color-success)" /> Passed: {studentData.subjects.filter(s => s.grade !== 'F').length}</span>
                  <span><XCircle color="var(--color-danger)" /> Failed: {studentData.subjects.filter(s => s.grade === 'F').length}</span>
                </div>
              </motion.div>
              <motion.div className="summary-card" variants={itemVariants}>
                <h3>Rank & Performance</h3>
                <p className="stat-number">#{studentData.rank}</p>
                <p className="performance-indicator">{studentData.performanceIndicator}</p>
              </motion.div>
              <motion.div className="summary-card" variants={itemVariants}>
                <h3>Subject Analysis</h3>
                <div className="subject-analysis">
                  <div className="best-subject">
                    <TrendingUp color="var(--color-success)" />
                    <span>Best: {studentData.bestSubject.name} ({studentData.bestSubject.marksObtained}%)</span>
                  </div>
                  <div className="worst-subject">
                    <TrendingDown color="var(--color-danger)" />
                    <span>Needs Improvement: {studentData.worstSubject.name} ({studentData.worstSubject.marksObtained}%)</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="chart-container" variants={containerVariants}>
              <motion.div className="chart" variants={itemVariants}>
                <h3>Subject-wise Performance</h3>
                <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </motion.div>
              <motion.div className="chart" variants={itemVariants}>
                <h3>Grade Distribution</h3>
                <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </motion.div>
            </motion.div>

            <motion.div className="result-table-container" variants={containerVariants}>
              <motion.div className="table-controls" variants={itemVariants}>
                <div className="search-bar">
                  <Search size={20} />
                  <input 
                    type="text" 
                    placeholder="Search subjects..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="download-btn" onClick={handleDownloadPDF}>
                  <Download size={20} />
                  Download PDF
                </button>
                <button className="download-btn" onClick={handleDownloadCSV}>
                  <Download size={20} />
                  Download CSV
                </button>
                <button className="share-btn">
                  <Share2 size={20} />
                  Share Results
                </button>
              </motion.div>

              <motion.table className="result-table" variants={itemVariants}>
                <thead>
                  <tr>
                    <th onClick={() => sortData('name')}>
                      Subject {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </th>
                    <th onClick={() => sortData('marksObtained')}>
                      Marks {sortConfig.key === 'marksObtained' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </th>
                    <th onClick={() => sortData('grade')}>
                      Grade {sortConfig.key === 'grade' && (sortConfig.direction === 'ascending' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSubjects.map((subject) => (
                    <motion.tr 
                      key={subject.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setSelectedSubject(subject)}
                    >
                      <td>
                        <Book size={16} className="subject-icon" />
                        {subject.name}
                      </td>
                      <td>
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${subject.marksObtained}%` }}
                          ></div>
                          <span>{subject.marksObtained} / {subject.totalMarks}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`grade grade-${subject.grade}`}>{subject.grade}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </motion.table>
            </motion.div>

            <AnimatePresence>
              {selectedSubject && (
                <motion.div 
                  className="subject-modal"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="modal-content">
                    <h2>{selectedSubject.name}</h2>
                    <p>Marks: {selectedSubject.marksObtained} / {selectedSubject.totalMarks}</p>
                    <p>Grade: {selectedSubject.grade}</p>
                    <p>Performance: {selectedSubject.marksObtained >= 80 ? 'Excellent' : selectedSubject.marksObtained >= 60 ? 'Good' : 'Needs Improvement'}</p>
                    <button onClick={() => setSelectedSubject(null)}>Close</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Result;