import { prisma } from "@/lib/prisma";
import { getMachineHistory } from "@/app/actions";
import HistoricalChart from "@/components/HistoricalChart";
import { notFound } from "next/navigation";
import { Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ machineName: string }>;
}

export default async function MachineDisplayPage({ params }: PageProps) {
  const { machineName } = await params;
  
  // Attempt to match exact name or a version with a dash (e.g., CNC01 -> CNC-01)
  const withDash = machineName.replace(/^(CNC)(\d+)$/i, '$1-$2');
  
  const machine = await prisma.machine.findFirst({
    where: {
      OR: [
        { name: { equals: machineName } },
        { name: { equals: withDash } },
        { name: { equals: machineName.toUpperCase() } },
        { name: { equals: withDash.toUpperCase() } },
      ]
    },
    include: {
      sessions: {
        take: 1,
        orderBy: { timestamp: 'desc' },
        include: { values: true }
      }
    }
  });

  if (!machine) {
    notFound();
  }

  const history = await getMachineHistory(machine.id);
  const lastSession = machine.sessions[0];
  
  // Calculate some stats from history
  const recentPasses = history.filter(h => h.status === 'Pass').length;
  const recentAdjusts = history.filter(h => h.status === 'Adjust').length;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Activity size={32} />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE MONITORING</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{machine.name}</h1>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CURRENT STATUS</div>
          <div className={`badge badge-${machine.status.toLowerCase()}`} style={{ fontSize: '1.25rem', padding: '0.5rem 1.5rem' }}>
            {machine.status}
          </div>
        </div>
      </div>

      <div className="grid-metrics">
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="card-title">Target Value</div>
          <div className="metric-value">{machine.target.toFixed(3)} <span style={{ fontSize: '1rem' }}>mm</span></div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Range: {machine.lowerLimit.toFixed(3)} - {machine.upperLimit.toFixed(3)}
          </div>
        </div>

        <div className="card" style={{ borderLeft: `4px solid ${lastSession?.status === 'Pass' ? 'var(--success)' : 'var(--danger)'}` }}>
          <div className="card-title">Latest Reading</div>
          <div className="metric-value" style={{ color: lastSession?.status === 'Pass' ? 'var(--success)' : 'var(--danger)' }}>
            {lastSession ? lastSession.values[0]?.value.toFixed(3) : 'N/A'} <span style={{ fontSize: '1rem' }}>mm</span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={14} />
            {lastSession ? format(lastSession.timestamp, 'HH:mm:ss') : 'No data'}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Performance (Last 30)</div>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div>
              <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.5rem' }}>{recentPasses}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PASS</div>
            </div>
            <div>
              <div style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.5rem' }}>{recentAdjusts}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ADJUST</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <HistoricalChart 
          data={history} 
          target={machine.target} 
          upperLimit={machine.upperLimit} 
          lowerLimit={machine.lowerLimit} 
        />
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Dedicated CNC Display • {format(new Date(), 'yyyy-MM-dd HH:mm')}
      </div>
    </div>
  );
}
