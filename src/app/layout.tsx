import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Контактен център Община Перник',
  description: 'Подайте сигнал за проблеми в град Перник. Системата за граждански сигнали на Община Перник.',
  keywords: 'Перник, сигнали, община, граждански сигнали, проблеми',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-slate-50 min-h-screen">
        <header className="bg-gradient-to-r from-[#1a2744] to-[#2d4a7a] text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors">
                  <span className="text-xl sm:text-2xl">🏛️</span>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold leading-tight">
                    Контактен център
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-200 leading-tight">
                    Община Перник
                  </p>
                </div>
              </a>
              <nav className="hidden sm:flex items-center gap-6">
                <a href="/signal/create" className="text-sm text-blue-100 hover:text-white transition-colors font-medium">
                  Подай сигнал
                </a>
                <a href="/" className="text-sm text-blue-100 hover:text-white transition-colors">
                  Сигнали
                </a>
                <a href="#faq" className="text-sm text-blue-100 hover:text-white transition-colors">
                  Помощ
                </a>
              </nav>
              <a
                href="/signal/create"
                className="sm:hidden bg-[#e8b931] text-[#1a2744] px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors"
              >
                + Сигнал
              </a>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-180px)]">
          {children}
        </main>

        <footer className="bg-[#1a2744] text-blue-200 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-bold mb-2">Контактен център Община Перник</h3>
                <p className="text-sm">пл. Свети Иван Рилски 1А</p>
                <p className="text-sm">2300 Перник, България</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Контакти</h3>
                <p className="text-sm">Телефон: 076 / 684 200</p>
                <p className="text-sm">E-mail: pernik@pernik.bg</p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Връзки</h3>
                <a href="/signal/create" className="block text-sm hover:text-white transition-colors">Подаване на сигнал</a>
                <a href="#" className="block text-sm hover:text-white transition-colors mt-1">Общи условия</a>
                <a href="#" className="block text-sm hover:text-white transition-colors mt-1">Декларация за поверителност</a>
              </div>
            </div>
            <div className="border-t border-blue-800 mt-6 pt-4 text-center text-xs text-blue-300">
              © {new Date().getFullYear()} Община Перник. Всички права запазени.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
