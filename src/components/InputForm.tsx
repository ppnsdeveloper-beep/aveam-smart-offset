"use client"

import { useState, useRef, useEffect } from "react"
import { submitMeasurement, getMachineHistory } from "@/app/actions"
import { MonitorStop, ScanBarcode, Cpu, Plus, Trash2 } from "lucide-react"
import HistoricalChart from "./HistoricalChart"

export default function InputForm({ machines }: { machines: any[] }) {
  const [selectedMachineId, setSelectedMachineId] = useState<number | "">("")
  const [barcode, setBarcode] = useState("")
  const [values, setValues] = useState<string[]>([""])
  const [historyData, setHistoryData] = useState<any[]>([])
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Focus barcode input on load
  useEffect(() => {
    barcodeRef.current?.focus()
  }, [])

  // Fetch history when machine changes
  useEffect(() => {
    if (selectedMachineId) {
      getMachineHistory(selectedMachineId as number).then(data => {
        setHistoryData(data)
      })
    } else {
      setHistoryData([])
    }
  }, [selectedMachineId])

  const selectedMachine = machines.find(m => m.id === selectedMachineId)

  const handleSimulate = (index: number) => {
    if (!selectedMachine) return;
    const randomValue = (selectedMachine.target + (Math.random() * 0.06 - 0.03)).toFixed(3)
    const newValues = [...values]
    newValues[index] = randomValue
    setValues(newValues)
  }

  const addValueField = () => {
    setValues([...values, ""])
  }

  const removeValueField = (index: number) => {
    const newValues = values.filter((_, i) => i !== index)
    setValues(newValues.length ? newValues : [""])
  }

  const handleValueChange = (index: number, val: string) => {
    const newValues = [...values]
    newValues[index] = val
    setValues(newValues)
  }

  return (
    <div>
      <form action={submitMeasurement}>
        {/* Pass array of values as a JSON string to Server Action */}
        <input type="hidden" name="values" value={JSON.stringify(values.map(v => parseFloat(v)).filter(v => !isNaN(v)))} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MonitorStop size={18} />
              Select CNC Machine
            </label>
            <select 
              name="machineId" 
              required
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(parseInt(e.target.value))}
              className="form-input" 
              style={{ appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
            >
              <option value="" disabled>-- Select a Machine --</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ScanBarcode size={18} />
              Part Barcode
            </label>
            <input 
              ref={barcodeRef}
              type="text" 
              name="barcode" 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan barcode here..." 
              required 
              className="form-input" 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Cpu size={18} />
            Measured Values (mm)
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {values.map((value, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', width: '30px' }}>#{index + 1}</span>
                <input 
                  type="number" 
                  step="0.001" 
                  value={value}
                  onChange={(e) => handleValueChange(index, e.target.value)}
                  placeholder="0.000" 
                  required 
                  className="form-input" 
                />
                <button 
                  type="button" 
                  onClick={() => handleSimulate(index)}
                  className="btn" 
                  style={{ border: '1px solid var(--primary)', color: 'var(--primary)', whiteSpace: 'nowrap' }}
                  disabled={!selectedMachine}
                >
                  Simulate
                </button>
                {values.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeValueField(index)}
                    className="btn" 
                    style={{ color: 'var(--danger)', padding: '0.75rem' }}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addValueField}
            className="btn" 
            style={{ marginTop: '1rem', background: 'var(--surface-light)', color: 'var(--text-main)', width: '100%' }}
          >
            <Plus size={18} /> Add Measurement Value
          </button>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            Save Session
          </button>
        </div>
      </form>

      {/* Historical Chart */}
      {selectedMachine && historyData.length > 0 && (
        <HistoricalChart 
          data={historyData} 
          target={selectedMachine.target} 
          upperLimit={selectedMachine.upperLimit} 
          lowerLimit={selectedMachine.lowerLimit} 
        />
      )}
    </div>
  )
}
