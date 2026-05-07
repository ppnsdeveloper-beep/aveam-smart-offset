import { prisma } from "@/lib/prisma";
import { Activity, ArrowRight, CheckCircle, AlertTriangle, Clock, Server } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export const dynamic = 'force-dynamic'

export default async function MachinesPage() {
  const machines = await prisma.machine.findMany({
    include: {
      sessions: {
        take: 1,
        orderBy: { timestamp: "desc" },
        include: { values: true }
      }
    }
  });

  return (
    <div className="machines-container">
      <div className="header">
        <div>
          <h1>Machine Monitoring</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Real-time status overview of all CNC machines on the shop floor.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="badge badge-active" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={14} />
            {machines.filter(m => m.status === 'Active').length} Active
          </div>
        </div>
      </div>

      <div className="machines-grid">
        {machines.map((machine) => {
          const lastSession = machine.sessions[0];
          const isPass = lastSession?.status === 'Pass';
          const isAdjust = lastSession?.status === 'Adjust';
          
          return (
            <div key={machine.id} className="machine-card card">
              <div className="machine-card-header">
                <div className="machine-info">
                  <div className="machine-name-row">
                    <Activity size={18} color="var(--primary)" />
                    <h2 className="machine-name">{machine.name}</h2>
                  </div>
                  <span className={`badge badge-${machine.status.toLowerCase()}`}>
                    {machine.status}
                  </span>
                </div>
                <Link 
                  href={`/${machine.name.replace("-", "")}`} 
                  className="view-btn"
                  title="Open Dedicated Display"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div className="machine-metrics">
                <div className="metric-item">
                  <span className="metric-label">Latest Reading</span>
                  <div className={`metric-value-small ${isPass ? 'text-success' : isAdjust ? 'text-danger' : ''}`}>
                    {lastSession ? (
                      <>
                        {lastSession.values[0]?.value.toFixed(3)}
                        <span className="unit">mm</span>
                      </>
                    ) : '---'}
                  </div>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Target / Limit</span>
                  <div className="metric-value-small">
                    {machine.target.toFixed(3)}
                    <span className="limit-range">
                      ±{(machine.upperLimit - machine.target).toFixed(3)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="machine-card-footer">
                <div className="status-indicator">
                  {lastSession ? (
                    isPass ? (
                      <div className="status-pill status-pass">
                        <CheckCircle size={14} />
                        <span>PASS</span>
                      </div>
                    ) : (
                      <div className="status-pill status-adjust">
                        <AlertTriangle size={14} />
                        <span>ADJUST</span>
                      </div>
                    )
                  ) : (
                    <div className="status-pill status-none">
                      <Clock size={14} />
                      <span>NO DATA</span>
                    </div>
                  )}
                </div>
                <div className="time-info">
                  {lastSession ? format(lastSession.timestamp, 'HH:mm:ss') : '--:--:--'}
                </div>
              </div>
              
              <Link href={`/${machine.name.replace("-", "")}`} className="card-overlay-link" />
            </div>
          );
        })}
      </div>

    </div>
  );
}
