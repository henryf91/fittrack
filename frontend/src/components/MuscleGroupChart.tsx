import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MuscleGroupVolume } from '../api/workoutsApi'

/** BarChart horizontal: ejercicios por grupo muscular (tema oscuro). */
export default function MuscleGroupChart({ data }: { data: MuscleGroupVolume[] }) {
  if (data.length === 0) {
    return <p className="muted">Aún no hay ejercicios registrados en tus sesiones.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2f3a" />
        <XAxis type="number" allowDecimals={false} stroke="#8b93a7" tick={{ fill: '#8b93a7', fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="muscleGroup"
          width={90}
          stroke="#8b93a7"
          tick={{ fill: '#e2e6f0', fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1a1f2b', border: '1px solid #2a2f3a', borderRadius: 8 }}
          labelStyle={{ color: '#e2e6f0' }}
          itemStyle={{ color: '#7c9cff' }}
        />
        <Bar dataKey="exercises" name="Ejercicios" fill="#7c9cff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
