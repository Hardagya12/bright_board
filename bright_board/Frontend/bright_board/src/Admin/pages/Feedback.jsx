import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createTicket } from '../../utils/services/support';

const Feedback = () => {
  const [form, setForm] = useState({ subject: '', message: '', category: 'feature-request' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createTicket(form);
      setSuccess('Thank you for your feedback');
      setForm({ subject: '', message: '', category: 'feature-request' });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Feedback</h1>
        {error && <div className="text-bw-62">{error}</div>}
        {success && <div className="text-bw-75">{success}</div>}
        <Card className="p-4">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm text-bw-75">Subject</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-bw-75">Message</label>
              <textarea rows={3} className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Feedback'}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;