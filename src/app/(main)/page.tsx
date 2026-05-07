import { prisma } from "@/lib/prisma";
import { AlertTriangle, CheckCircle, Clock, Factory, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const machines = await prisma.machine.findMany();
  const recentSessions = await prisma.measurementSession.findMany({
    take: 10,
    orderBy: { timestamp: "desc" },
    include: { machine: true, values: true },
  });



  const alerts = recentSessions.filter(m => m.status === 'Adjust' || m.status === 'Fail');
  
  const passCount = recentSessions.filter(m => m.status === 'Pass').length;
  const adjustCount = recentSessions.filter(m => m.status === 'Adjust').length;
  const activeMachines = machines.filter(m => m.status === 'Active').length;

  return (
    <div>
      <div className="header">
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/machines" className="btn" style={{ border: '1px solid var(--border)' }}>
            <LayoutGrid size={18} />
            Separated View
          </Link>
          <Link href="/input" className="btn btn-primary">
            + New Measurement
          </Link>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="card-title">Active Alerts</h2>
          {alerts.map(alert => (
            <div key={alert.id} className="alert alert-danger">
              <AlertTriangle size={24} />
              <div>
                <strong>Offset Adjustment Required for {alert.machine.name}</strong>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  Part {alert.barcode} had measurements out of tolerance. Measured at {format(alert.timestamp, 'HH:mm:ss')}
                </p>
                <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.8 }}>
                  Values: {alert.values.map(v => v.value.toFixed(3)).join(', ')} mm 
                  (Target: {alert.machine.target}mm)
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-metrics">
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} color="var(--success)" />
            Recent Passes
          </div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>
            {passCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {recentSessions.length}</span>
          </div>
        </div>
        
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} color="var(--danger)" />
            Offset Adjustments
          </div>
          <div className="metric-value" style={{ color: 'var(--danger)' }}>
            {adjustCount}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Factory size={20} color="var(--primary)" />
            Active Machines
          </div>
          <div className="metric-value" style={{ color: 'var(--primary)' }}>
            {activeMachines} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {machines.length}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Clock size={20} />
          Latest Measurement Sessions
        </h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Machine</th>
                <th>Part Barcode</th>
                <th>Measured Values (mm)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.id}>
                  <td>{format(session.timestamp, "MMM dd, HH:mm:ss")}</td>
                  <td>{session.machine.name}</td>
                  <td>{session.barcode}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                    {session.values.map(v => v.value.toFixed(3)).join(', ')}
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
        </div>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/history" className="btn" style={{ border: '1px solid var(--border)' }}>
            View Full History
          </Link>
        </div>
      </div>
    </div>
  );
}
