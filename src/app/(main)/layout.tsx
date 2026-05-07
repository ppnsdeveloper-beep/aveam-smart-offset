import Link from "next/link";
import { Activity, Settings, Clock, MonitorStop, LayoutGrid } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <MonitorStop size={28} color="#3B82F6" />
          <span>Smart Offset</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/" className="nav-item">
            <Activity size={20} />
            <span>Overview</span>
          </Link>
          <Link href="/machines" className="nav-item">
            <LayoutGrid size={20} />
            <span>Machine Displays</span>
          </Link>
          <Link href="/input" className="nav-item">
            <MonitorStop size={20} />
            <span>Measurement Input</span>
          </Link>
          <Link href="/history" className="nav-item">
            <Clock size={20} />
            <span>History</span>
          </Link>
          <Link href="/settings" className="nav-item">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface-light)', borderRadius: '8px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>v1.0.0-beta</p>
          <p>CNC Monitoring System</p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
