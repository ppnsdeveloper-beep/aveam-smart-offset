"use client"

import { useState, useEffect } from "react"
import { getFilteredHistory } from "@/app/actions"
import { format } from "date-fns"
import { Clock, Search, Calendar, BarChart2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts'

export default function HistoryClient({ initialSessions, machines }: { initialSessions: any[], machines: any[] }) {
  const [barcode, setBarcode] = useState("")
  const [month, setMonth] = useState("")
  // Default to first machine if available
  const [machineId, setMachineId] = useState<string>(machines[0]?.id.toString() || "")
  const [sessions, setSessions] = useState(initialSessions)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Effect to handle automatic filtering
  useEffect(() => {
    const filterData = async () => {
      setLoading(true)
      const mId = machineId === "" ? undefined : parseInt(machineId)
      const data = await getFilteredHistory(barcode, month, mId)
      setSessions(data)
      setCurrentPage(1)
      setLoading(false)
    }

    // Debounce barcode search to avoid too many requests while typing
    const timer = setTimeout(() => {
      filterData()
    }, barcode ? 500 : 0)

    return () => clearTimeout(timer)
  }, [barcode, month, machineId])

  // handleFilter is no longer needed as a manual trigger but we can keep logic in useEffect

  // Pagination calculations
  const totalPages = Math.ceil(sessions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentSessions = sessions.slice(startIndex, startIndex + itemsPerPage)

  // Generate chart data from filtered sessions (all filtered, not just current page)
  const chartData = [...sessions].reverse().map(s => ({
    barcode: s.barcode,
    [s.machine.name]: s.avgValue,
    timestamp: format(new Date(s.timestamp), 'MMM dd HH:mm'),
  }))

  const machineColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Search size={16} /> Search Barcode
            </label>
            <input 
              type="text" 
              className="form-input" 
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              placeholder="Enter barcode..."
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} /> Machine
            </label>
            <select 
              className="form-input" 
              value={machineId} 
              onChange={(e) => setMachineId(e.target.value)}
            >
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} /> Filter by Month
            </label>
            <input 
              type="month" 
              className="form-input" 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '42px', color: 'var(--primary)' }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div className="spinner-small" />
                Updating...
              </div>
            )}
          </div>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem', height: '400px' }}>
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} /> Trend Analysis
          </h3>
          <ResponsiveContainer width="100%" height="90%">

            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
              <XAxis dataKey="barcode" stroke="#94A3B8" fontSize={12} tickFormatter={(val) => val.replace('PART-', '')} />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={12} 
                domain={([dataMin, dataMax]) => {
                  const m = machines.find(m => m.id === parseInt(machineId));
                  if (!m) return [dataMin, dataMax];
                  const min = Math.min(dataMin, m.lowerLimit - 0.01);
                  const max = Math.max(dataMax, m.upperLimit + 0.01);
                  return [min, max] as [number, number];
                }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151B2B', borderColor: '#2D3748', borderRadius: '8px', color: '#F8FAFC' }}
                labelFormatter={(label) => `Part: ${label}`}
              />
              <Legend verticalAlign="top" height={36}/>
              
              {machineId !== "all" && machines.find(m => m.id === parseInt(machineId)) && (
                <>
                  <ReferenceLine 
                    y={machines.find(m => m.id === parseInt(machineId))?.target} 
                    stroke="var(--primary)" 
                    strokeDasharray="3 3" 
                    label={{ position: 'right', value: 'Target', fill: 'var(--primary)', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={machines.find(m => m.id === parseInt(machineId))?.upperLimit} 
                    stroke="var(--danger)" 
                    strokeDasharray="3 3" 
                    label={{ position: 'right', value: 'UCL', fill: 'var(--danger)', fontSize: 10 }} 
                  />
                  <ReferenceLine 
                    y={machines.find(m => m.id === parseInt(machineId))?.lowerLimit} 
                    stroke="var(--danger)" 
                    strokeDasharray="3 3" 
                    label={{ position: 'right', value: 'LCL', fill: 'var(--danger)', fontSize: 10 }} 
                  />
                </>
              )}

              {machines.map((machine, index) => {
                // If a specific machine is selected, only show that line
                if (machineId !== "all" && machine.id !== parseInt(machineId)) return null;
                
                return (
                  <Line 
                    key={machine.id}
                    type="monotone" 
                    dataKey={machine.name} 
                    stroke={machineColors[index % machineColors.length]} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Clock size={20} />
          {barcode || month ? "Filtered Results" : "All Measurement Sessions"}
        </h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Machine</th>
                <th>Part Barcode</th>
                <th>Avg Value (mm)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentSessions.map((session) => (
                <tr key={session.id}>
                  <td>{format(new Date(session.timestamp), "MMM dd, yyyy HH:mm:ss")}</td>
                  <td>{session.machine.name}</td>
                  <td>{session.barcode}</td>
                  <td style={{ fontFamily: 'monospace' }}>
                    {session.avgValue.toFixed(3)}
                  </td>
                  <td>
                    <span className={`badge badge-${session.status.toLowerCase()}`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <button 
                className="btn" 
                style={{ border: '1px solid var(--border)', padding: '0.5rem 1rem' }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Page <strong>{currentPage}</strong> of {totalPages}
              </div>

              <button 
                className="btn" 
                style={{ border: '1px solid var(--border)', padding: '0.5rem 1rem' }}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
          {sessions.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No records found for the selected filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
