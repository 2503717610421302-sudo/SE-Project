export default function StatsCard({ label, value, icon, trend, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
    green: 'from-green-600/20 to-green-600/5 border-green-500/20 text-green-400',
    purple: 'from-purple-600/20 to-purple-600/5 border-purple-500/20 text-purple-400',
    amber: 'from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400',
    rose: 'from-rose-600/20 to-rose-600/5 border-rose-500/20 text-rose-400',
    cyan: 'from-cyan-600/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`p-5 rounded-xl bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
