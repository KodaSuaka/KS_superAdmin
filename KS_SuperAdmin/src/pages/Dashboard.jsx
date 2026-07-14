export default function Dashboard() {
  // Data simulasi (nantinya ini diambil dari API Laravel menggunakan Axios)
  const statistik = [
    { id: 1, judul: "Total Instansi", nilai: "124", ikon: "🏢", bgIcon: "bg-blue-100", textColor: "text-blue-600" },
    { id: 2, judul: "Pendapatan Bulan Ini", nilai: "Rp 45 Juta", ikon: "💳", bgIcon: "bg-emerald-100", textColor: "text-emerald-600" },
    { id: 3, judul: "Total Owner", nilai: "120", ikon: "👤", bgIcon: "bg-amber-100", textColor: "text-amber-600" },
    { id: 4, judul: "Total Karyawan", nilai: "4.530", ikon: "👥", bgIcon: "bg-purple-100", textColor: "text-purple-600" },
  ];

  const instansiTerbaru = [
    { id: 1, nama: "PT Mencari Cinta Sejati", paket: "Enterprise", tanggal: "14 Jul 2026", status: "Aktif" },
    { id: 2, nama: "CV Maju Mundur", paket: "Basic", tanggal: "12 Jul 2026", status: "Pending" },
    { id: 3, nama: "Toko Sinar Makmur", paket: "Pro", tanggal: "10 Jul 2026", status: "Aktif" },
  ];

  return (
    <div>
      {/* Header Halaman Dashboard */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Overview Panel</h2>
        <p className="text-slate-500 mt-1">Pantau perkembangan dan pendaftaran instansi CodaSuaka hari ini.</p>
      </div>

      {/* Area Card Statistik (Grid 4 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statistik.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
            <div className={`text-3xl w-16 h-16 rounded-2xl flex items-center justify-center ${item.bgIcon} ${item.textColor}`}>
              {item.ikon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{item.judul}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{item.nilai}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Area Tabel Pendaftaran Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Pendaftaran Instansi Terbaru</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Nama Instansi</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Paket Langganan</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Tanggal Daftar</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {instansiTerbaru.map((instansi) => (
                <tr key={instansi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{instansi.nama}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium">
                      {instansi.paket}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{instansi.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                      instansi.status === 'Aktif' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                    }`}>
                      {instansi.status === 'Aktif' ? '● Aktif' : '🕒 Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}