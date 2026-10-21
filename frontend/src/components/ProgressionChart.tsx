import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Un punto de la serie de progresión (coincide con ProgressionEntry del backend). */
export interface ProgressionPoint {
  date: string
  setsReps: string | null
  notes: string | null
  weightKg: number | null
}

/**
 * Gráfica de línea de la progresión de un ejercicio: peso levantado
 * (@ Nkg) por fecha. Omite entradas sin peso (p. ej. cardio).
 */
export default function ProgressionChart({ data }: { data: ProgressionPoint[] }) {
  const points = data.filter((p) => p.weightKg != null)

  if (points.length === 0) {
    return <p className="muted">Sin pesos registrados todavía (¿cardio?).</p>
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <CartesianGrid stroke="#2e3a4e" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8b95a8', fontSize: 12 }}
            tickFormatter={(d: string) => d.slice(5)} // MM-DD
          />
          <YAxis
            tick={{ fill: '#8b95a8', fontSize: 12 }}
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${v}kg`}
          />
          <Tooltip
            contentStyle={{ background: '#1a2233', border: '1px solid #2e3a4e', borderRadius: 8 }}
            labelStyle={{ color: '#e8ecf4' }}
            itemStyle={{ color: '#4f9cf9' }}
            formatter={(value) => [`${value} kg`, '']}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#4f9cf9"
            strokeWidth={2}
            dot={{ r: 4, fill: '#4f9cf9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
