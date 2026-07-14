import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen font-sans bg-slate-50">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            CodaSuaka
          </h2>
          <span className="text-xs text-slate-400 tracking-wider">SUPERADMIN PANEL</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            🏠 Dashboard
          </Link>
          <Link to="/paket" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            📦 Master Paket
          </Link>
          <Link to="/instansi" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            🏢 Data Instansi
          </Link>
          <Link to="/owner" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            👤 Data Owner
          </Link>
          <Link to="/langganan" className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            💳 Langganan
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm px-8 py-5 border-b border-slate-200 flex justify-between items-center">
          <h1 className="text-slate-700 font-medium">Halo, SuperAdmin! 👋</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              SA
            </div>
          </div>
        </header>
        
        {/* Area Konten Dinamis (Outlet) */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet /> 
        </div>

      </main>
      
    </div>
  );
}