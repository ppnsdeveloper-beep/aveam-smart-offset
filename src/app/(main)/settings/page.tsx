import { prisma } from "@/lib/prisma";
import { updateMachineSettings } from "@/app/actions";
import { Settings as SettingsIcon, Target, ArrowUpToLine, ArrowDownToLine, Factory } from "lucide-react";

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const machines = await prisma.machine.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <div className="header">
        <h1>Machine Settings</h1>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Configure the target value and acceptable tolerances for each specific CNC machine.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {machines.map(machine => (
          <div key={machine.id} className="card">
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
              <Factory size={20} className="text-primary" />
              {machine.name}
            </h2>
            
            <form action={updateMachineSettings}>
              <input type="hidden" name="machineId" value={machine.id} />
              
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} />
                  Target Value (mm)
                </label>
                <input 
                  type="number" 
                  step="0.001" 
                  name="target" 
                  defaultValue={machine.target} 
                  required 
                  className="form-input" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
                    <ArrowUpToLine size={16} />
                    Upper Limit
                  </label>
                  <input 
                    type="number" 
                    step="0.001" 
                    name="upperLimit" 
                    defaultValue={machine.upperLimit} 
                    required 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontSize: '0.875rem' }}>
                    <ArrowDownToLine size={16} />
                    Lower Limit
                  </label>
                  <input 
                    type="number" 
                    step="0.001" 
                    name="lowerLimit" 
                    defaultValue={machine.lowerLimit} 
                    required 
                    className="form-input" 
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
