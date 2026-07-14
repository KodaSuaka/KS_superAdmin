import { useState, useEffect } from 'react';

export default function Paket() {
  const [daftarPaket, setDaftarPaket] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi mengambil data dari API yang sesuai dengan struktur tabel di gambar
  useEffect(() => {
    // Nanti bagian setTimeout ini diganti dengan Axios saat CORS sudah diperbaiki
    setTimeout(() => {
      const mockDataDatabase = [
        {
          id: 1,
          nama_paket: "Basic",
          harga: 150000,
          deskripsi: "Paket dasar cocok untuk UMKM pemula.",
          fitur: ["Absensi Standar", "Penggajian Dasar", "Export Laporan"], // Anggap ini sudah di-parse dari JSON
          durasi_hari: 30,
          max_outlet: 1,
          max_karyawan_per_outlet: 15,
          is_active: 1,
        },
        {
          id: 2,
          nama_paket: "Pro Business",
          harga: 450000,
          deskripsi: "Solusi lengkap untuk perusahaan berkembang.",
          fitur: ["Absensi GPS", "Penggajian Kompleks", "Laporan Pajak", "Approval Cuti", "Shift Malam"],
          durasi_hari: 30,
          max_outlet: 5,
          max_karyawan_per_outlet: 50,
          is_active: 1,
        },
        {
          id: 3,
          nama_paket: "Enterprise",
          harga: 5000000,
          deskripsi: "Harga khusus untuk kontrak tahunan korporat besar.",
          fitur: ["Semua Fitur Pro", "Custom Branding", "Dedicated Server", "Prioritas Support 24/7"],
          durasi_hari: 365,
          max_outlet: 999, // 999 bisa dianggap unlimited nantinya
          max_karyawan_per_outlet: 999,
          is_active: 0,
        }
      ];
      
      setDaftarPaket(mockDataDatabase);
      setIsLoading(false);
    }, 1000); // Loading pura-pura selama 1 detik
  }, []);

  // Fungsi pembantu untuk mengubah angka menjadi format Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div>
      {/* Bagian Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Paket</h2>
          <p className="text-slate-500 mt-1">Kelola harga, limitasi, dan fitur langganan untuk klien.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2">
          <span>+</span> Tambah Paket
        </button>
      </div>

      {/* Tabel Data Paket */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Loading State */}
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 font-medium">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
              Memuat data paket dari database...
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Info Paket</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Harga & Durasi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kapasitas Maksimal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarPaket.map((paket) => (
                  <tr key={paket.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Kolom Info Paket */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-base">{paket.nama_paket}</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={paket.deskripsi}>
                        {paket.deskripsi}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {paket.fitur.length} Fitur In-App
                        </span>
                      </div>
                    </td>

                    {/* Kolom Harga & Durasi */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-emerald-600">{formatRupiah(paket.harga)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-1 rounded-md">
                        Masa aktif: {paket.durasi_hari} Hari
                      </p>
                    </td>

                    {/* Kolom Kapasitas */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 text-center">🏢</span> 
                          <b>{paket.max_outlet > 100 ? 'Unlimited' : paket.max_outlet}</b> Outlet
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 text-center">👥</span> 
                          <b>{paket.max_karyawan_per_outlet > 100 ? 'Unlimited' : paket.max_karyawan_per_outlet}</b> Karyawan/outlet
                        </div>
                      </div>
                    </td>

                    {/* Kolom Status (is_active) */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        paket.is_active === 1 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {paket.is_active === 1 ? '● Publik' : 'Draf / Arsip'}
                      </span>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2">
                        Edit
                      </button>
                      <button className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">
                        Hapus
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Jika Data Kosong */}
            {daftarPaket.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 font-medium">Belum ada paket yang ditambahkan.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}