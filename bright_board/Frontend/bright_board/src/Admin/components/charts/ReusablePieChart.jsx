import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#9fe870', '#ffd11a', '#ffc091', '#38c8ff', '#d03238'];

const ReusablePieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-[#868685] font-medium">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity focus:outline-none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e8ebe6', borderRadius: '16px', color: '#0e0f0c', fontFamily: 'Inter', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#0e0f0c' }} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px', fontWeight: 600 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ReusablePieChart;
