import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  new: { label: 'Нов', class: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'В обработка', class: 'bg-yellow-100 text-yellow-800' },
  resolved: { label: 'Приключен', class: 'bg-green-100 text-green-800' },
  rejected: { label: 'Отхвърлен', class: 'bg-red-100 text-red-800' },
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [signals, categories, stats] = await Promise.all([
    prisma.signal.findMany({
      include: { category: true, type: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.category.findMany({
      include: { _count: { select: { signals: true } } },
      orderBy: { orderNum: 'asc' },
    }),
    prisma.signal.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  const totalSignals = stats.reduce((sum, s) => sum + s._count, 0);
  const resolvedCount = stats.find((s) => s.status === 'resolved')?._count || 0;
  const activeCount = stats.find((s) => s.status === 'in_progress')?._count || 0;
  const newCount = stats.find((s) => s.status === 'new')?._count || 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a2744] via-[#2d4a7a] to-[#4a7ab5] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Подайте сигнал за проблем
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Помогнете ни да направим Перник по-добро място за живеене.
            Сигнализирайте за проблеми в града и следете тяхното решаване.
          </p>
          <Link
            href="/signal/create"
            className="inline-flex items-center gap-2 bg-[#e8b931] hover:bg-yellow-400 text-[#1a2744] font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Регистриране на сигнал
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Общо сигнали', value: totalSignals, icon: '📊', color: 'bg-white' },
            { label: 'Нови', value: newCount, icon: '🆕', color: 'bg-white' },
            { label: 'В обработка', value: activeCount, icon: '⚙️', color: 'bg-white' },
            { label: 'Приключени', value: resolvedCount, icon: '✅', color: 'bg-white' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-xl shadow-lg p-4 sm:p-6 text-center`}
            >
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-2xl sm:text-3xl font-bold text-[#1a2744] mt-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Category Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Категории сигнали</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-slate-100"
            >
              <span className="text-2xl">{cat.icon}</span>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 font-medium leading-tight">
                {cat.name}
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                {cat._count.signals} сигнала
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Signals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Последни сигнали</h2>
        </div>

        {signals.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Все още няма сигнали</h3>
            <p className="text-slate-500 mb-6">Бъдете първият, който подаде сигнал за проблем в Перник.</p>
            <Link
              href="/signal/create"
              className="inline-flex items-center gap-2 bg-[#2d4a7a] hover:bg-[#1a2744] text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Подайте сигнал
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => {
              const status = STATUS_LABELS[signal.status] || STATUS_LABELS.new;
              return (
                <div
                  key={signal.id}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl flex-shrink-0">{signal.category.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400">
                            {signal.code}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-slate-800 mt-1 truncate">
                          {signal.shortDesc}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {signal.category.name}
                          {signal.type ? ` → ${signal.type.name}` : ''}
                          {signal.address ? ` • ${signal.address}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 flex-shrink-0">
                      {new Date(signal.createdAt).toLocaleDateString('bg-BG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
