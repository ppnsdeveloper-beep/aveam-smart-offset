"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartProps {
  data: any[];
  target: number;
  upperLimit: number;
  lowerLimit: number;
}

export default function HistoricalChart({ data, target, upperLimit, lowerLimit }: ChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No historical data available</div>;
  }

  // Calculate Y-axis domain to ensure limits are visible
  const minVal = Math.min(...data.map(d => d.value), lowerLimit - 0.05);
  const maxVal = Math.max(...data.map(d => d.value), upperLimit + 0.05);

  return (
    <div style={{ height: '350px', width: '100%', marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Historical Trend (Last 30 Sessions)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
          <XAxis 
            dataKey="barcode" 
            stroke="#94A3B8" 
            fontSize={12} 
            tickFormatter={(val) => val.replace('PART-', '')} 
          />
          <YAxis 
            domain={[minVal, maxVal]} 
            stroke="#94A3B8" 
            fontSize={12} 
            tickFormatter={(val) => val.toFixed(3)}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#151B2B', borderColor: '#2D3748', borderRadius: '8px', color: '#F8FAFC' }}
            formatter={(value: any) => [`${Number(value).toFixed(3)} mm`, 'Avg Value']}
            labelFormatter={(label) => `Part: ${label}`}
          />
          
          <ReferenceLine y={upperLimit} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Upper Limit', fill: '#EF4444', fontSize: 12 }} />
          <ReferenceLine y={target} stroke="#3B82F6" strokeDasharray="3 3" />
          <ReferenceLine y={lowerLimit} stroke="#F59E0B" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Lower Limit', fill: '#F59E0B', fontSize: 12 }} />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
