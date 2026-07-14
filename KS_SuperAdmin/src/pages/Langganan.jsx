import { useState, useEffect } from 'react';

export default function Langganan() {
  const [daftarLangganan, setDaftarLangganan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE UNTUK MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    instansi_nama: '',
    paket_nama: '',
    status: '',
    tanggal_berakhir: ''
  });

  // Dummy Data Simulasi Transaksi/Langganan
  useEffect(() => {
    setTimeout(() => {
      setDaftarLangganan([
        { 
          id: "INV-001", 
          instansi: "PT Maju Terus Pantang Mundur", 
          paket: "Pro Business",
          harga: 450000,
          tanggal_mulai: "2026-06-14",
          tanggal_berakhir: "2026-07-14",
          status: "Aktif"
        },
        { 
          id: "INV-002", 
          instansi: "Toko Sembako Berkah", 
          paket: "Basic",
          harga: 150000,
          tanggal_mulai: "2026-05-10",
          tanggal_berakhir: "2026-06-10",
          status: "Expired"
        },
        { 
          id: "INV-003", 
          instansi: "CV Abadi Jaya", 
          paket: "Enterprise",
          harga: 5000000,
          tanggal_mulai: "-",
          tanggal_berakhir: "-",
          status: "Menunggu Pembayaran"
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // FUNGSI BUKA MODAL PERPANJANG/UPDATE
  const handleAksi = (langganan) => {
    setFormData({
      instansi_nama: langganan.instansi,
      paket_nama: langganan.paket,
      status: langganan.status,
      tanggal_berakhir: langganan.tanggal_berakhir === '-' ? '' : langganan.tanggal_berakhir
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Simulasi pembaruan status langganan berhasil!");
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Langganan</h2>
          <p className="text-slate-500 mt-1">Pantau masa aktif paket dan pembayaran instansi klien.</p>
        </div>
      </div>

      {/* Tabel */}
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
                {daftarLangganan.map((langganan) => (
                  <tr key={langganan.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400 font-mono mb-1">{langganan.id}</p>
                      <p className="font-bold text-slate-700">{langganan.instansi}</p>
                    </td>
                    
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{langganan.paket}</p>
                      <p className="text-sm text-emerald-600 font-medium mt-0.5">{formatRupiah(langganan.harga)}</p>
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
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        langganan.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        langganan.status === 'Expired' ? 'bg-red-50 text-red-600 border-red-200' : 
                        'bg-amber-50 text-amber-600 border-amber-200'
                      }`}>
                        {langganan.status === 'Aktif' ? '● Aktif' : 
                         langganan.status === 'Expired' ? '✕ Expired' : '🕒 Menunggu Bayar'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleAksi(langganan)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        Kelola
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* AREA MODAL / POP-UP KELOLA LANGGANAN */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-[fadeIn_0.2s_ease-out]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">Kelola Status Langganan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <div className="p-6">
              <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 mb-1">Instansi:</p>
                <p className="font-bold text-slate-800">{formData.instansi_nama}</p>
                <hr className="my-2 border-slate-200" />
                <p className="text-sm text-slate-500 mb-1">Paket Terpilih:</p>
                <p className="font-bold text-blue-600">{formData.paket_nama}</p>
              </div>

              <form id="formLangganan" onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Langganan</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
                    <option value="Expired">Kedaluwarsa (Expired)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perpanjang Hingga Tanggal</label>
                  <input 
                    type="date" 
                    value={formData.tanggal_berakhir} 
                    onChange={(e) => setFormData({...formData, tanggal_berakhir: e.target.value})} 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                  <p className="text-xs text-slate-400 mt-1">*Ubah tanggal ini jika klien baru saja memperpanjang paket secara manual.</p>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button type="submit" form="formLangganan" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                Update Status
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}