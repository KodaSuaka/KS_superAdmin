import { useState, useEffect } from 'react';

export default function Owner() {
  const [daftarOwner, setDaftarOwner] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. STATE UNTUK MODAL & FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    instansi_id: ''
  });

  // Simulasi opsi Instansi untuk Dropdown (Nanti dari API GET /instansis)
  const daftarInstansiOption = [
    { id: 1, nama_instansi: "PT Maju Terus Pantang Mundur" },
    { id: 2, nama_instansi: "Toko Sembako Berkah" },
    { id: 3, nama_instansi: "CV Abadi Jaya" }
  ];

  // Load Data Dummy
  useEffect(() => {
    setTimeout(() => {
      setDaftarOwner([
        { 
          id: 1, 
          name: "Budi Santoso", 
          email: "budi@majuterus.com",
          instansi_id: 1, // Untuk select option saat edit
          instansi: { nama_instansi: "PT Maju Terus Pantang Mundur" },
          profilKaryawan: { kontak: "081234567890" }
        },
        { 
          id: 2, 
          name: "Siti Aminah", 
          email: "siti@berkah.com",
          instansi_id: 2,
          instansi: { nama_instansi: "Toko Sembako Berkah" },
          profilKaryawan: { kontak: "089876543210" }
        }
      ]);
      setIsLoading(false);
    }, 800);
  }, []);

  // FUNGSI INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // FUNGSI BUKA MODAL TAMBAH
  const handleTambahBaru = () => {
    setIsEditMode(false);
    setFormData({ id: null, name: '', email: '', password: '', instansi_id: '' });
    setIsModalOpen(true);
  };

  // FUNGSI BUKA MODAL EDIT
  const handleEdit = (owner) => {
    setIsEditMode(true);
    setFormData({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      password: '', // Sengaja dikosongkan, hanya diisi jika ingin ganti password
      instansi_id: owner.instansi_id || ''
    });
    setIsModalOpen(true);
  };

  // FUNGSI HAPUS (Simulasi)
  const handleHapus = (id) => {
    if(window.confirm("Yakin ingin menghapus Owner ini beserta semua aksesnya?")) {
      console.log("Hapus Owner ID:", id);
      alert("Simulasi Hapus Berhasil!");
    }
  };

  // FUNGSI SUBMIT FORM
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      console.log("Data UPDATE dikirim ke Laravel:", formData);
      alert("Simulasi UPDATE berhasil! Cek Console (F12)");
    } else {
      console.log("Data CREATE dikirim ke Laravel:", formData);
      alert("Simulasi CREATE berhasil! Cek Console (F12)");
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Data Owner</h2>
          <p className="text-slate-500 mt-1">Manajemen akun utama pemilik instansi (Klien).</p>
        </div>
        <button 
          onClick={handleTambahBaru}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <span>+</span> Tambah Owner Manual
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Memuat data owner...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nama Lengkap</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email (Username)</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Milik Instansi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kontak</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarOwner.map((owner) => (
                  <tr key={owner.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                          {owner.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{owner.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {owner.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded border border-slate-200">
                        🏢 {owner.instansi?.nama_instansi || 'Belum Diatur'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {owner.profilKaryawan?.kontak || 'Belum diatur'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(owner)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleHapus(owner.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col animate-[fadeIn_0.2s_ease-out]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditMode ? 'Edit Data Owner' : 'Tambah Owner Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="formOwner" onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Budi Santoso" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email (Username) *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="budi@contoh.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {isEditMode ? '(Opsional)' : '*'}
                  </label>
                  <input 
                    type="password" 
                    name="password" 
                    required={!isEditMode} // Wajib jika nambah baru, opsional jika edit
                    minLength={6} 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder={isEditMode ? "Kosongkan jika tidak ingin mengubah sandi" : "Minimal 6 karakter"} 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tugaskan ke Instansi *</label>
                  <select name="instansi_id" required value={formData.instansi_id} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="" disabled>-- Pilih Instansi --</option>
                    {daftarInstansiOption.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.nama_instansi}</option>
                    ))}
                  </select>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button type="submit" form="formOwner" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                {isEditMode ? 'Simpan Perubahan' : 'Buat Akun Owner'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}