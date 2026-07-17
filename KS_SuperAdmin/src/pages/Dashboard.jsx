import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [statistik, setStatistik] = useState(null);
  const [instansiTerbaru, setInstansiTerbaru] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/super-admin/dashboard'),
      api.get('/super-admin/instansis')
    ])
      .then(([resDashboard, resInstansi]) => {
        const dashData = resDashboard.data.data;
        const listInstansi = resInstansi.data.data;

        setStatistik([
          { id: 1, judul: 'Total Instansi', nilai: dashData.total_instansi, ikon: '🏢', bgIcon: 'bg-blue-100', textColor: 'text-blue-600' },
          { id: 2, judul: 'Total Paket', nilai: dashData.total_paket, ikon: '📦', bgIcon: 'bg-emerald-100', textColor: 'text-emerald-600' },
          { id: 3, judul: 'Total Owner', nilai: dashData.total_owner, ikon: '👤', bgIcon: 'bg-amber-100', textColor: 'text-amber-600' },
          { id: 4, judul: 'Total Karyawan', nilai: dashData.total_karyawan, ikon: '👥', bgIcon: 'bg-purple-100', textColor: 'text-purple-600' },
        ]);

        setInstansiTerbaru(listInstansi.slice(0, 5).map((inst) => ({
          id: inst.id,
          nama: inst.nama_instansi,
          paket: inst.paket?.nama_paket || 'Belum ada paket',
          tanggal: new Date(inst.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: inst.paket ? 'Aktif' : 'Pending',
        })));
      })
      .catch((error) => {
        console.error('Gagal memuat dashboard:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500 font-semibold animate-pulse text-lg">Memuat dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Overview Panel</h2>
        <p className="text-slate-500 mt-1">Pantau perkembangan dan pendaftaran instansi CodaSuaka hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statistik?.map((item) => (
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

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Instansi Terbaru</h3>
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
              {instansiTerbaru.length > 0 ? instansiTerbaru.map((instansi) => (
                <tr key={instansi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-700">{instansi.nama}</td>
                  <td className="px-6 py-4 text-slate-500">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium">
                      {instansi.paket}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{instansi.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${instansi.status === 'Aktif'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                      {instansi.status === 'Aktif' ? '● Aktif' : '🕒 Pending'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-400">Belum ada instansi terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
