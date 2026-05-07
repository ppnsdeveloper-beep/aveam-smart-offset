"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitMeasurement(formData: FormData) {
  const barcode = formData.get("barcode") as string
  const machineId = parseInt(formData.get("machineId") as string)
  
  // Parse multiple values (sent as a JSON string from client component)
  const valuesStr = formData.get("values") as string
  let values: number[] = []
  try {
    values = JSON.parse(valuesStr)
  } catch(e) {
    throw new Error("Invalid measurement values format")
  }

  if (!barcode || isNaN(machineId) || values.length === 0) {
    throw new Error("Invalid data")
  }

  // Get machine settings to determine status
  const machine = await prisma.machine.findUnique({ where: { id: machineId } })
  if (!machine) {
    throw new Error("Machine not found")
  }

  let status = "Pass"
  for (const val of values) {
    if (val > machine.upperLimit || val < machine.lowerLimit) {
      status = "Adjust"
      break;
    }
  }

  await prisma.measurementSession.create({
    data: {
      barcode,
      machineId,
      status,
      values: {
        create: values.map(v => ({ value: v }))
      }
    }
  })

  revalidatePath("/")
  revalidatePath("/history")
  redirect("/")
}

export async function updateMachineSettings(formData: FormData) {
  const machineId = parseInt(formData.get("machineId") as string)
  const target = parseFloat(formData.get("target") as string)
  const upperLimit = parseFloat(formData.get("upperLimit") as string)
  const lowerLimit = parseFloat(formData.get("lowerLimit") as string)

  if (isNaN(machineId) || isNaN(target) || isNaN(upperLimit) || isNaN(lowerLimit)) {
    throw new Error("Invalid data")
  }

  await prisma.machine.update({
    where: { id: machineId },
    data: { target, upperLimit, lowerLimit }
  })

  revalidatePath("/settings")
  revalidatePath("/input")
  redirect("/settings")
}

export async function getMachineHistory(machineId: number) {
  // Fetch the last 30 measurement sessions for the graph
  const sessions = await prisma.measurementSession.findMany({
    where: { machineId },
    take: 30,
    orderBy: { timestamp: "desc" },
    include: { values: true }
  });
  
  // Reverse to show chronological order on chart
  return sessions.reverse().map(session => {
    // For the chart, we could plot the average of the values in the session
    // Or just the first value. Let's plot the average.
    const avgValue = session.values.length > 0 
      ? session.values.reduce((sum, v) => sum + v.value, 0) / session.values.length 
      : 0;
      
    return {
      id: session.id,
      barcode: session.barcode,
      value: parseFloat(avgValue.toFixed(3)),
      status: session.status,
    };
  });
}
export async function getDashboardStats() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const sessions = await prisma.measurementSession.findMany({
    where: {
      timestamp: {
        gte: sevenDaysAgo,
      },
    },
    select: {
      timestamp: true,
      status: true,
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  const dailyStats: Record<string, { date: string; Pass: number; Adjust: number }> = {};
  
  sessions.forEach(session => {
    const day = session.timestamp.toISOString().split('T')[0];
    if (!dailyStats[day]) {
      dailyStats[day] = { date: day, Pass: 0, Adjust: 0 };
    }
    if (session.status === 'Pass') dailyStats[day].Pass++;
    else dailyStats[day].Adjust++;
  });

  return Object.values(dailyStats);
}

export async function getFilteredHistory(barcode?: string, month?: string, machineId?: number) {
  let where: any = {};
  
  if (barcode) {
    where.barcode = { contains: barcode };
  }

  if (machineId && !isNaN(machineId)) {
    where.machineId = machineId;
  }
  
  if (month) {
    const [year, m] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(m) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
    where.timestamp = {
      gte: startDate,
      lte: endDate,
    };
  }

  const sessions = await prisma.measurementSession.findMany({
    where,
    orderBy: { timestamp: "desc" },
    include: { machine: true, values: true },
  });

  return sessions.map(session => {
    const avgValue = session.values.length > 0 
      ? session.values.reduce((sum, v) => sum + v.value, 0) / session.values.length 
      : 0;
      
    return {
      ...session,
      avgValue: parseFloat(avgValue.toFixed(3)),
    };
  });
}
