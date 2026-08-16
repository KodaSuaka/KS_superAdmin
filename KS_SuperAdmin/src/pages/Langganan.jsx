import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Langganan() {
  const navigate = useNavigate();
  const [daftarLangganan, setDaftarLangganan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Ambil data instansi dengan paket dari API Super Admin
      const res = await api.get('/super-admin/instansis');
      const instansis = res.data.data;

      // Transform ke format Langganan
      const data = instansis.map((inst) => ({
        id: inst.id,
        instansi: inst.nama_instansi,
        paket: inst.paket?.nama_paket || 'Belum ada paket',
        harga: inst.paket?.harga || 0,
        durasi_hari: inst.paket?.durasi_hari || 0,
        tanggal_mulai: inst.created_at ? new Date(inst.created_at).toISOString().split('T')[0] : '-',
        tanggal_berakhir: inst.paket ? (() => {
          // Estimasi tanggal berakhir berdasarkan created_at + durasi_hari
          const tglMulai = new Date(inst.created_at);
          tglMulai.setDate(tglMulai.getDate() + (inst.paket?.durasi_hari || 30));
          return tglMulai.toISOString().split('T')[0];
        })() : '-',
        outlets_count: inst.outlets_count || 0,
        status: inst.paket ? 'Aktif' : 'Menunggu Pembayaran',
      }));

      setDaftarLangganan(data);
    } catch (error) {
      console.error('Gagal memuat data langganan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Status langganan dikelola lewat Invoice Paket (transaksi_paket),
  // bukan lewat update instansi. Kelola membuka invoice ter-filter instansi ini.
  const kelola = (langganan) => {
    navigate(`/invoice-paket?instansi_id=${langganan.id}`);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Langganan</h2>
          <p className="text-slate-500 mt-1">Pantau masa aktif paket klien. Ubah status lewat Invoice Paket.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Memuat data transaksi...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID / Instansi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paket & Tagihan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Masa Aktif</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarLangganan.length > 0 ? daftarLangganan.map((langganan) => (
                  <tr key={langganan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 font-mono mb-1">{langganan.id}</p>
                      <p className="font-bold text-slate-700">{langganan.instansi}</p>
                      <p className="text-xs text-slate-400">{langganan.outlets_count} outlet</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{langganan.paket}</p>
                      {langganan.harga > 0 && (
                        <p className="text-sm text-emerald-600 font-medium mt-0.5">{formatRupiah(Number(langganan.harga))}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {langganan.tanggal_mulai !== '-' ? (
                        <div className="flex flex-col gap-1">
                          <span>Mulai: <b className="text-slate-700">{langganan.tanggal_mulai}</b></span>
                          <span>Akhir: <b className="text-slate-700">{langganan.tanggal_berakhir}</b></span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum diaktifkan</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${langganan.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                        {langganan.status === 'Aktif' ? '● Aktif' : '🕒 Menunggu Bayar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => kelola(langganan)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        Kelola →
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">Belum ada data langganan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
