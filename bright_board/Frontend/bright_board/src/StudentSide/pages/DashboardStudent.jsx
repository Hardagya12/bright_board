import React, { useEffect, useState } from 'react';
import { Check, X, Percent, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStudentAttendance } from '../../utils/services/attendance';
import { listExamsStudent } from '../../utils/services/exams';

const DashboardStudent = () => {
  const [attSummary, setAttSummary] = useState({ attended: 0, missed: 0, leave: 0, percentage: 0 });
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getStudentAttendance();
        const logs = data.attendance || [];
        const attended = logs.filter(l => l.status === 'present').length;
        const missed = logs.filter(l => l.status === 'absent').length;
        const leave = logs.filter(l => l.status === 'excused').length;
        const total = logs.length;
        const percentage = total ? Math.round((attended / total) * 100) : 0;
        setAttSummary({ attended, missed, leave, percentage });
        try {
          const { data: ex } = await listExamsStudent();
          setExams(ex.exams || []);
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
        <h1 className="font-comic text-2xl mb-6">Welcome, Student!</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5" />
              <span>Total Classes Attended</span>
            </div>
            <div className="font-comic text-3xl">{attSummary.attended}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5" />
              <span>Total Classes Missed</span>
            </div>
            <div className="font-comic text-3xl">{attSummary.missed}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5" />
              <span>Attendance Percentage</span>
            </div>
            <div className="font-comic text-3xl">{attSummary.percentage}%</div>
          </Card>
        </div>

        <section className="mb-6">
          <h2 className="font-comic text-xl mb-3">Upcoming Exams</h2>
          <Card className="p-4">
            {exams.length === 0 && <div className="text-bw-62">No exams available</div>}
            {exams.map((exam, idx) => (
              <div key={exam.id || exam._id || idx} className="flex justify-between border-b border-bw-12 py-2">
                <span className="font-semibold">{exam.title}</span>
                <span className="text-bw-75">{exam.scheduledDate ? new Date(exam.scheduledDate).toLocaleDateString() : ''}</span>
                <Button variant="outline" onClick={() => (window.location.href = `/s/exams/${exam.id || exam._id}`)}>Attempt</Button>
              </div>
            ))}
          </Card>
        </section>

        <section className="mb-6">
          <h2 className="font-comic text-xl mb-3">Notifications</h2>
          <Card className="p-4">
            <div className="flex items-center gap-2 py-2 border-b border-bw-12">
              <Bell className="w-4 h-4" />
              <span>New assignment posted for Math.</span>
            </div>
            <div className="flex items-center gap-2 py-2 border-b border-bw-12">
              <Bell className="w-4 h-4" />
              <span>Science exam results are available.</span>
            </div>
            <div className="flex items-center gap-2 py-2">
              <Bell className="w-4 h-4" />
              <span>New message from your tutor.</span>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="font-comic text-xl mb-3">New Study Materials</h2>
          <Card className="p-4">
            <div className="flex justify-between border-b border-bw-12 py-2">
              <span className="font-semibold">Algebra Notes</span>
              <span className="text-bw-75">Uploaded on 2023-10-01</span>
            </div>
            <div className="flex justify-between border-b border-bw-12 py-2">
              <span className="font-semibold">Biology Study Guide</span>
              <span className="text-bw-75">Uploaded on 2023-10-02</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">History Presentation</span>
              <span className="text-bw-75">Uploaded on 2023-10-03</span>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default DashboardStudent;