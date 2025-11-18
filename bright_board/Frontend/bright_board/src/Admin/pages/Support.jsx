import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { listTickets, createTicket } from '../../utils/services/support';

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ subject: '', message: '', category: 'general' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await listTickets();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createTicket(form);
      setForm({ subject: '', message: '', category: 'general' });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Support</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        <Card className="p-4">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm text-bw-75">Subject</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm text-bw-75">Category</label>
              <select className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature-request">Feature Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-bw-75">Message</label>
              <textarea rows={3} className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <Button type="submit">Create Ticket</Button>
          </form>
        </Card>
        <Card className="p-4">
          <div className="font-comic mb-2">Your Tickets</div>
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="border border-bw-37 rounded p-3">
                <div className="font-comic">{t.subject}</div>
                <div className="text-bw-75 text-sm">{t.category} • {t.status}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Support;