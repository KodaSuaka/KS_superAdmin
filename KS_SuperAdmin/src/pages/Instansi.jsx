import { useState, useEffect } from 'react';

export default function Instansi() {
  const [daftarInstansi, setDaftarInstansi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. STATE UNTUK MODAL & FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama_instansi: '',
    paket_id: '',
    owner_name: '',
    owner_email: '',
    owner_password: ''
  });

  // Simulasi opsi paket untuk Dropdown (Nanti diambil dari API GET /pakets)
  const daftarPaketOption = [
    { id: 1, nama_paket: "Basic - Rp 150.000" },
    { id: 2, nama_paket: "Pro Business - Rp 450.000" },
    { id: 3, nama_paket: "Enterprise - Rp 5.000.000" }
  ];

  // Load Data Dummy Instansi
  useEffect(() => {
    setTimeout(() => {
      setDaftarInstansi([
        { 
          id: "019f4be5-6bb7", // Mengikuti format UUID di gambarmu
          nama_instansi: "PT Maju Terus Pantang Mundur", 
          paket: { nama_paket: "Pro Business" },
          outlets_count: 3,
          users: [{ name: "Budi Santoso", email: "budi@majuterus.com" }]
        },
        { 
          id: "019f4c17-75ab", 
          nama_instansi: "Toko Sembako Berkah", 
          paket: null, // Skenario jika paket_id NULL seperti di database-mu
          outlets_count: 1,
          users: [{ name: "Siti Aminah", email: "siti@berkah.com" }]
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Data Payload untuk storeInstansi:", formData);
    alert("Cek Console (F12) untuk melihat data Instansi & Owner yang akan dikirim!");
    
    setIsModalOpen(false);
    setFormData({ nama_instansi: '', paket_id: '', owner_name: '', owner_email: '', owner_password: '' });
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Instansi</h2>
          <p className="text-slate-500 mt-1">Kelola perusahaan klien dan penetapan paket langganan.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Instansi
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Memuat data instansi...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nama Instansi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paket Aktif</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Info Owner</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarInstansi.map((instansi) => (
                  <tr key={instansi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{instansi.nama_instansi}</td>
                    <td className="px-6 py-4">
                      {/* Kondisi jika paket_id NULL */}
                      {instansi.paket ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-xs font-bold">
                          {instansi.paket.nama_paket}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold">
                          Belum Ada Paket
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{instansi.users[0]?.name}</p>
                      <p className="text-xs text-slate-500">{instansi.users[0]?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2">Edit</button>
                      <button className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* AREA MODAL / POP-UP TAMBAH INSTANSI */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">Registrasi Instansi & Owner Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="formInstansi" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Bagian Instansi */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. Data Perusahaan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Instansi *</label>
                      <input type="text" name="nama_instansi" required value={formData.nama_instansi} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PT Contoh Maju" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Paket (Opsional)</label>
                      <select name="paket_id" value={formData.paket_id} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">-- Tanpa Paket (NULL) --</option>
                        {daftarPaketOption.map(paket => (
                          <option key={paket.id} value={paket.id}>{paket.nama_paket}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Bagian Akun Owner */}
                <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Kredensial Akun Owner</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap Owner *</label>
                      <input type="text" name="owner_name" required value={formData.owner_name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Pemilik" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email (Untuk Login) *</label>
                        <input type="email" name="owner_email" required value={formData.owner_email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin@contohmaju.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                        <input type="password" name="owner_password" required minLength={6} value={formData.owner_password} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Minimal 6 karakter" />
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button type="submit" form="formInstansi" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                Simpan & Buat Akun
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}