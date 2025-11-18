import React from 'react';
import { Check, X, Percent, Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';

const DashboardStudent = () => {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="font-comic text-2xl mb-6">Welcome, Student!</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-5 h-5" />
              <span>Total Classes Attended</span>
            </div>
            <div className="font-comic text-3xl">25</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="w-5 h-5" />
              <span>Total Classes Missed</span>
            </div>
            <div className="font-comic text-3xl">5</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-5 h-5" />
              <span>Attendance Percentage</span>
            </div>
            <div className="font-comic text-3xl">83%</div>
          </Card>
        </div>

        <section className="mb-6">
          <h2 className="font-comic text-xl mb-3">Upcoming Exams</h2>
          <Card className="p-4">
            <div className="flex justify-between border-b border-bw-12 py-2">
              <span>Math Midterm - 2023-10-20</span>
              <span className="text-bw-75">Registration Open</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Science Final - 2023-10-25</span>
              <span className="text-bw-75">Registration Open</span>
            </div>
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