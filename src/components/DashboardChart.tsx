"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function DashboardChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available for the last 7 days</div>;
  }

  const formattedData = data.map(d => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  }));

  return (
    <div className="card" style={{ marginBottom: '2rem', height: '400px' }}>
      <h3 className="card-title">Production Quality Trend (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
          <YAxis stroke="#94A3B8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#151B2B', borderColor: '#2D3748', borderRadius: '8px', color: '#F8FAFC' }}
          />
          <Legend />
          <Bar dataKey="Pass" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Adjust" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
