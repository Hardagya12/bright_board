import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Card from '../../components/ui/Card';

const tabs = ['Personal Info', 'Academic Details', 'Achievements', 'Feedback & Ratings'];

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('Personal Info');

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className="flex-1 p-6">
        <header className="mb-6">
          <h1 className="font-comic text-2xl">My Profile</h1>
          <p className="text-bw-75">Your personal profile with quick insights and details.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="font-comic text-lg mb-2">Attendance</h3>
            <div className="font-comic text-3xl">85%</div>
            <p className="text-bw-75">Classes Attended: 42/50</p>
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
                <p className="text-bw-75">Email: jabcd@gmail.com</p>
                <p className="text-bw-75">Phone: 999999999</p>
                <p className="text-bw-75">Address: XYZ Street, City, State, 123456</p>
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
