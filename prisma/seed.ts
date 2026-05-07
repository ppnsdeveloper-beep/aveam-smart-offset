import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create 10 CNC Machines with unique targets
  const machines = []
  for (let i = 1; i <= 10; i++) {
    const machineName = `CNC-${i.toString().padStart(2, '0')}`
    
    // Give some machines slightly different targets to show variety
    const baseTarget = 10.0 + (i % 3) * 0.5 // e.g., 10.0, 10.5, 11.0
    
    const machine = await prisma.machine.upsert({
      where: { name: machineName },
      update: {},
      create: {
        name: machineName,
        status: i % 5 === 0 ? 'Maintenance' : 'Active',
        target: baseTarget,
        upperLimit: baseTarget + 0.05,
        lowerLimit: baseTarget - 0.05,
      },
    })
    machines.push(machine)
  }
  console.log(`Created ${machines.length} Machines`)

  // 2. Create Mock Measurement Sessions
  const totalSessions = 2000;
  console.log(`Generating ${totalSessions} Mock Measurement Sessions...`)
  
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const timeRange = now.getTime() - startOfYear.getTime();

  for (let i = 0; i < totalSessions; i++) {
    const machine = machines[Math.floor(Math.random() * machines.length)]
    
    // Simulate 3 to 5 measurement values per session
    const numValues = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
    const values = [];
    
    let isAdjust = false;

    for(let j=0; j < numValues; j++) {
       let value = machine.target + (Math.random() * 0.08 - 0.04); // range roughly target +/- 0.04
       if (Math.random() > 0.95) {
         value += (Math.random() > 0.5 ? 0.06 : -0.06); // Outlier
       }
       value = parseFloat(value.toFixed(3));
       values.push(value);

       if (value > machine.upperLimit || value < machine.lowerLimit) {
         isAdjust = true;
       }
    }

    const status = isAdjust ? 'Adjust' : 'Pass';

    // Random timestamp between start of year and now
    const randomTime = startOfYear.getTime() + Math.random() * timeRange;
    const timestamp = new Date(randomTime);

    await prisma.measurementSession.create({
      data: {
        barcode: `PART-${Math.floor(Math.random() * 90000 + 10000).toString()}`,
        status: status,
        timestamp: timestamp,
        machineId: machine.id,
        values: {
          create: values.map(v => ({ value: v }))
        }
      },
    })

    if (i % 200 === 0 && i > 0) {
      console.log(`...Generated ${i} sessions`)
    }
  }
  console.log(`Created ${totalSessions} Mock Measurement Sessions`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
