import { prisma } from "@/lib/prisma";
import InputForm from "@/components/InputForm";

export const dynamic = 'force-dynamic'

export default async function InputPage() {
  const machines = await prisma.machine.findMany({
    where: { status: 'Active' },
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <div className="header">
        <h1>Measurement Input</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Scan the part barcode and wait for the measurement value from the machine. For this presentation, you can manually simulate the measurement data.
        </p>

        <InputForm machines={machines} />
      </div>
    </div>
  );
}
