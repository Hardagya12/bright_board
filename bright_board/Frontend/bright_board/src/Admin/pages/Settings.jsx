import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getInstituteProfile, updateInstituteProfile } from '../../utils/services/institute';

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', contactNumber: '', coursesOffered: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getInstituteProfile();
        setProfile(data.institute);
        setForm({
          name: data.institute.name || '',
          address: data.institute.address || '',
          contactNumber: data.institute.contactNumber || '',
          coursesOffered: data.institute.coursesOffered || [],
        });
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaved('');
    try {
      await updateInstituteProfile(form);
      setSaved('Profile updated');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="font-comic text-2xl">Settings</h1>
        {loading && <div className="text-bw-62">Loading...</div>}
        {error && <div className="text-bw-62">{error}</div>}
        {saved && <div className="text-bw-75">{saved}</div>}
        <Card className="p-4">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm text-bw-75">Institute Name</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-bw-75">Address</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-bw-75">Contact Number</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-bw-75">Courses Offered (comma separated)</label>
              <input className="w-full px-3 py-2 bg-black border border-bw-37 rounded" value={form.coursesOffered.join(', ')} onChange={(e) => setForm({ ...form, coursesOffered: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;