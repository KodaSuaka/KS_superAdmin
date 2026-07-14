import { useState, useEffect } from 'react';

export default function Paket() {
  const [daftarPaket, setDaftarPaket] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // STATE UNTUK MODAL & FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Penanda apakah sedang Edit atau Tambah Baru
  const [formData, setFormData] = useState({
    id: null,
    nama_paket: '',
    harga: '',
    deskripsi: '',
    fitur: [''], 
    durasi_hari: 30,
    max_outlet: '',
    max_karyawan_per_outlet: '',
    is_active: 1
  });

  // Dummy Data Load (Kapasitas & Fitur lengkap)
  useEffect(() => {
    setTimeout(() => {
      setDaftarPaket([
        { 
          id: 1, nama_paket: "Basic", harga: 150000, deskripsi: "Paket dasar cocok untuk UMKM pemula.", 
          fitur: ["Absensi Standar", "Penggajian Dasar"], durasi_hari: 30, max_outlet: 1, max_karyawan_per_outlet: 15, is_active: 1 
        },
        { 
          id: 2, nama_paket: "Pro Business", harga: 450000, deskripsi: "Solusi lengkap untuk perusahaan berkembang.", 
          fitur: ["Absensi GPS", "Penggajian Kompleks", "Laporan Pajak", "Approval Cuti"], durasi_hari: 30, max_outlet: 5, max_karyawan_per_outlet: 50, is_active: 1 
        },
        { 
          id: 3, nama_paket: "Enterprise", harga: 5000000, deskripsi: "Harga khusus untuk kontrak tahunan korporat besar.", 
          fitur: ["Semua Fitur Pro", "Custom Branding", "Dedicated Server", "Prioritas Support 24/7"], durasi_hari: 365, max_outlet: 999, max_karyawan_per_outlet: 999, is_active: 0 
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // FUNGSI INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFiturChange = (index, value) => {
    const fiturBaru = [...formData.fitur];
    fiturBaru[index] = value;
    setFormData({ ...formData, fitur: fiturBaru });
  };

  const tambahBarisFitur = () => setFormData({ ...formData, fitur: [...formData.fitur, ''] });
  
  const hapusBarisFitur = (index) => {
    const fiturBaru = formData.fitur.filter((_, i) => i !== index);
    setFormData({ ...formData, fitur: fiturBaru });
  };

  // FUNGSI BUKA MODAL TAMBAH
  const handleTambahBaru = () => {
    setIsEditMode(false);
    setFormData({
      id: null, nama_paket: '', harga: '', deskripsi: '', fitur: [''], 
      durasi_hari: 30, max_outlet: '', max_karyawan_per_outlet: '', is_active: 1
    });
    setIsModalOpen(true);
  };

  // FUNGSI BUKA MODAL EDIT
  const handleEdit = (paket) => {
    setIsEditMode(true);
    setFormData({
      ...paket,
      // Pastikan fitur minimal ada 1 baris kosong jika kebetulan datanya kosong
      fitur: paket.fitur && paket.fitur.length > 0 ? paket.fitur : ['']
    });
    setIsModalOpen(true);
  };

  // FUNGSI HAPUS (Simulasi)
  const handleHapus = (id) => {
    if(window.confirm("Yakin ingin menghapus paket ini?")) {
      console.log("Hapus paket ID:", id);
      // Logika Axios DELETE nanti di sini
    }
  };

  // FUNGSI SUBMIT FORM
  const handleSubmit = (e) => {
    e.preventDefault();
    const fiturBersih = formData.fitur.filter(item => item.trim() !== '');
    const dataUntukDikirim = { ...formData, fitur: fiturBersih };

    if (isEditMode) {
      console.log("Data UPDATE dikirim ke Laravel:", dataUntukDikirim);
      alert("Simulasi UPDATE berhasil! Cek Console (F12)");
    } else {
      console.log("Data CREATE dikirim ke Laravel:", dataUntukDikirim);
      alert("Simulasi CREATE berhasil! Cek Console (F12)");
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Master Paket</h2>
          <p className="text-slate-500 mt-1">Kelola harga, limitasi, dan fitur langganan.</p>
        </div>
        <button 
          onClick={handleTambahBaru}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Paket
        </button>
      </div>

      {/* Tabel Data Paket Lengkap */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Memuat data paket...</div>
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
                    
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-base">{paket.nama_paket}</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">{paket.deskripsi}</p>
                      <div className="flex mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {paket.fitur.length} Fitur
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-bold text-emerald-600">{formatRupiah(paket.harga)}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1 bg-slate-100 inline-block px-2 py-1 rounded-md">
                        Masa aktif: {paket.durasi_hari} Hari
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 text-center">🏢</span> 
                          <b>{paket.max_outlet > 100 ? 'Unlimited' : paket.max_outlet}</b> Outlet
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="w-5 text-center">👥</span> 
                          <b>{paket.max_karyawan_per_outlet > 100 ? 'Unlimited' : paket.max_karyawan_per_outlet}</b> Staff/outlet
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        paket.is_active === 1 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {paket.is_active === 1 ? '● Publik' : 'Draf / Arsip'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* TOMBOL EDIT & HAPUS */}
                      <button 
                        onClick={() => handleEdit(paket)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleHapus(paket.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Hapus
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
      {/* AREA MODAL / POP-UP FORM */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditMode ? 'Edit Data Paket' : 'Tambah Paket Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="formPaket" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Paket *</label>
                    <input type="text" name="nama_paket" required value={formData.nama_paket} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Misal: Enterprise" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp) *</label>
                    <input type="number" name="harga" required value={formData.harga} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="500000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Singkat</label>
                  <textarea name="deskripsi" rows="2" value={formData.deskripsi} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cocok untuk perusahaan..."></textarea>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Durasi (Hari) *</label>
                    <input type="number" name="durasi_hari" required value={formData.durasi_hari} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maks. Outlet *</label>
                    <input type="number" name="max_outlet" required value={formData.max_outlet} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maks. Karyawan *</label>
                    <input type="number" name="max_karyawan_per_outlet" required value={formData.max_karyawan_per_outlet} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="15" />
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Daftar Fitur (JSON)</label>
                  <div className="space-y-3">
                    {formData.fitur.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <input 
                          type="text" 
                          value={item} 
                          onChange={(e) => handleFiturChange(index, e.target.value)} 
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="Misal: Absensi GPS..." 
                        />
                        {formData.fitur.length > 1 && (
                          <button type="button" onClick={() => hapusBarisFitur(index)} className="px-3 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100">
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={tambahBarisFitur} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2">
                      <span>+</span> Tambah Baris Fitur
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="is_active" checked={formData.is_active === 1} onChange={(e) => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} className="w-4 h-4 text-blue-600 rounded" />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Publikasikan Paket Ini (Aktif)</label>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button type="submit" form="formPaket" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                {isEditMode ? 'Simpan Perubahan' : 'Simpan Paket Baru'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}