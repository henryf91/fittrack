import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Un punto de la serie de volumen (coincide con DailyVolume del backend). */
export interface DailyVolumePoint {
  date: string
  exercises: number
}

/**
 * Gráfica de barras del volumen diario: ejercicios realizados por día
 * en las últimas 8 semanas.
 */
export default function WeeklyVolumeChart({ data }: { data: DailyVolumePoint[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#8b95a8', fontSize: 12 }}
            tickFormatter={(d: string) => d.slice(5)} // MM-DD
          />
          <YAxis allowDecimals={false} tick={{ fill: '#8b95a8', fontSize: 12 }} width={32} />
          <Tooltip
            cursor={{ fill: 'rgba(79, 140, 255, 0.1)' }}
            contentStyle={{ background: '#1a2233', border: '1px solid #2e3a4e', borderRadius: 8 }}
            labelStyle={{ color: '#e8ecf4' }}
            itemStyle={{ color: '#4f9cf9' }}
            formatter={(value) => [`${value} ejercicios`, '']}
          />
          <Bar dataKey="exercises" fill="#4f8cff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
