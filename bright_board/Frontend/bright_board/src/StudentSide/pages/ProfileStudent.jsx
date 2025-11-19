import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import { getStudentAttendance } from '../../utils/services/attendance';
import api from '../../utils/api';

const tabs = ['Personal Info', 'Academic Details', 'Achievements', 'Feedback & Ratings'];

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profile, setProfile] = useState(null);
  const [attSummary, setAttSummary] = useState({ attended: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/students/me');
        setProfile(data.student || null);
        try {
          const { data: att } = await getStudentAttendance();
          const logs = att.attendance || [];
          const attended = logs.filter(l => l.status === 'present').length;
          const total = logs.length;
          const percentage = total ? Math.round((attended / total) * 100) : 0;
          setAttSummary({ attended, total, percentage });
        } catch {}
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="font-comic text-2xl">My Profile</h1>
          <p className="text-bw-75">Your personal profile with quick insights and details.</p>
        </header>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-comic text-lg mb-2">Attendance</h3>
            <div className="font-comic text-3xl">{attSummary.percentage}%</div>
            <p className="text-bw-75">Classes Attended: {attSummary.attended}/{attSummary.total}</p>
            <button className="mt-3 px-3 py-2 border border-bw-37 rounded hover:bg-bw-12">View Details</button>
          </Card>
          <Card className="p-4">
            <h3 className="font-comic text-lg mb-2">Results</h3>
            <div className="mb-2">
              <h4 className="font-semibold">Recent Exam:</h4>
              <p className="text-bw-75">Midterm Exam</p>
              <p className="text-bw-75">Grade: A</p>
            </div>
            <button className="mt-3 px-3 py-2 border border-bw-37 rounded hover:bg-bw-12">View All Results</button>
          </Card>
          <Card className="p-4">
            <h3 className="font-comic text-lg mb-2">Payment Summary</h3>
            <div>
              <h4 className="font-semibold">Total Paid: ₹20,000</h4>
              <p className="text-bw-75">Pending Fees: <span>₹5,000</span></p>
            </div>
            <button className="mt-3 px-3 py-2 border border-bw-37 rounded hover:bg-bw-12">Go to Payments</button>
          </Card>
        </div>

        <section>
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded border ${activeTab === tab ? 'border-bw-75 text-white' : 'border-bw-37 text-bw-75 hover:bg-bw-12'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Card className="p-4">
            {activeTab === 'Personal Info' && (
              <div>
                <h3 className="font-comic text-lg mb-2">Personal Info</h3>
                <p className="text-bw-75">Name: {profile?.name || '-'}</p>
                <p className="text-bw-75">Email: {profile?.email || '-'}</p>
                <p className="text-bw-75">Phone: {profile?.phone || '-'}</p>
                <p className="text-bw-75">Address: {profile?.address || '-'}</p>
              </div>
            )}
            {activeTab === 'Academic Details' && (
              <div>
                <h3 className="font-comic text-lg mb-2">Academic Details</h3>
                <p className="text-bw-75">Current GPA: 8.7</p>
                <p className="text-bw-75">Upcoming Exam: Final Exam 2025</p>
              </div>
            )}
            {activeTab === 'Achievements' && (
              <div>
                <h3 className="font-comic text-lg mb-2">Achievements</h3>
                <p className="text-bw-75">Top Scorer in Midterm Exam 2024</p>
              </div>
            )}
            {activeTab === 'Feedback & Ratings' && (
              <div>
                <h3 className="font-comic text-lg mb-2">Feedback</h3>
                <p className="text-bw-75">Tutor Feedback: Great improvement in performance!</p>
              </div>
            )}
          </Card>
        </section>
      </main>
    </div>
  );
};

export default StudentProfile;
