import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function MainLayout() {
  // State untuk mengontrol buka-tutup sidebar di layar kecil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fungsi untuk menutup sidebar saat menu diklik (khusus mobile)
  const tutupSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      
      {/* 1. LAYAR GELAP (BACKDROP) UNTUK MOBILE */}
      {/* Muncul saat sidebar terbuka di layar HP, jika diklik akan menutup sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity"
          onClick={tutupSidebar}
        />
      )}

      {/* 2. SIDEBAR */}
      {/* Di HP: melayang (fixed) dan bergeser. Di Laptop: menempel (relative) */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              CodaSuaka
            </h2>
            <span className="text-[10px] text-slate-400 tracking-wider">SUPERADMIN PANEL</span>
          </div>
          
          {/* Tombol Silang (X) khusus mobile */}
          <button onClick={tutupSidebar} className="md:hidden text-slate-400 hover:text-white text-xl">
            ✕
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/" onClick={tutupSidebar} className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            🏠 Dashboard
          </Link>
          <Link to="/paket" onClick={tutupSidebar} className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            📦 Master Paket
          </Link>
          <Link to="/instansi" onClick={tutupSidebar} className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            🏢 Data Instansi
          </Link>
          <Link to="/owner" onClick={tutupSidebar} className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            👤 Data Owner
          </Link>
          <Link to="/langganan" onClick={tutupSidebar} className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
            💳 Langganan
          </Link>
        </nav>
      </aside>

      {/* 3. AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header Atas */}
        <header className="bg-white shadow-sm px-4 md:px-8 py-4 border-b border-slate-200 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            
            {/* Tombol Hamburger (Hanya muncul di layar kecil) */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 md:hidden focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>

            <h1 className="text-slate-700 font-medium hidden sm:block">Halo, SuperAdmin! 👋</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
              SA
            </div>
          </div>
        </header>
        
        {/* Area Halaman Dinamis (Outlet) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <Outlet /> 
        </main>

      </div>
      
    </div>
  );
}