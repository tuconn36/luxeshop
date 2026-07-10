import { cn } from '../../lib/utils'

export default function StatCard({ label, value, icon: Icon, color = 'brand', trend, sublabel, className }) {
  const colorMap = {
    brand:   'bg-brand-50 text-brand-700',
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-600',
    purple:  'bg-purple-50 text-purple-600',
    indigo:  'bg-indigo-50 text-indigo-600',
  }
  return (
    <div className={cn('card p-5 flex items-start justify-between', className)}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900 truncate">{value}</p>
        {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
        {trend && (
          <p className={cn(
            'text-xs mt-2 font-medium',
            trend.direction === 'up' ? 'text-emerald-600' : 'text-rose-600'
          )}>
            {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
      {Icon && (
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', colorMap[color] || colorMap.brand)}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  )
}