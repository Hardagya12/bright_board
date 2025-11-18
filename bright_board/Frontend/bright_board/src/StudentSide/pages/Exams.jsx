import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { listExamsStudent } from '../../utils/services/exams';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listExamsStudent();
        setExams(data.exams || []);
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
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Available Exams</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Card key={exam._id || exam.id} className="p-4">
              <div className="font-comic text-lg">{exam.title}</div>
              <div className="text-bw-75 text-sm">Subject: {exam.subject || '-'}</div>
              {exam.scheduledDate && (
                <div className="text-bw-75 text-sm">Date: {new Date(exam.scheduledDate).toLocaleDateString()}</div>
              )}
              <div className="mt-2">Duration: {exam.durationMinutes} minutes</div>
              <div className="mt-3">
                <Button variant="outline" onClick={() => (window.location.href = `/s/exams/${exam.id || exam._id}`)}>Attempt</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exams;