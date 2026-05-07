import { prisma } from "@/lib/prisma";
import HistoryClient from "@/components/HistoryClient";

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const sessions = await prisma.measurementSession.findMany({
    orderBy: { timestamp: "desc" },
    include: { machine: true, values: true },
  });

  const formattedSessions = sessions.map(session => {
    const avgValue = session.values.length > 0 
      ? session.values.reduce((sum, v) => sum + v.value, 0) / session.values.length 
      : 0;
      
    return {
      ...session,
      avgValue: parseFloat(avgValue.toFixed(3)),
    };
  });

  const machines = await prisma.machine.findMany();

  return (
    <div>
      <div className="header">
        <h1>Historical Data & Analytics</h1>
      </div>

      <HistoryClient initialSessions={formattedSessions} machines={machines} />
    </div>
  );
}
