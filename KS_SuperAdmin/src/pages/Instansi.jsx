import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Instansi() {
  const [daftarInstansi, setDaftarInstansi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daftarPaketOption, setDaftarPaketOption] = useState([]);

  // STATE UNTUK MODAL & FORM
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nama_instansi: '',
    paket_id: '',
    owner_name: '',
    owner_email: '',
    owner_password: ''
  });

  // Load data instansi & paket dari API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resInstansi, resPaket] = await Promise.all([
        api.get('/super-admin/instansis'),
        api.get('/super-admin/pakets')
      ]);
      setDaftarInstansi(resInstansi.data.data);
      setDaftarPaketOption(resPaket.data.data);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTambahBaru = () => {
    setIsEditMode(false);
    setFormData({ id: null, nama_instansi: '', paket_id: '', owner_name: '', owner_email: '', owner_password: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (instansi) => {
    setIsEditMode(true);
    setFormData({
      id: instansi.id,
      nama_instansi: instansi.nama_instansi,
      paket_id: instansi.paket ? instansi.paket.id : '',
      owner_name: '',
      owner_email: '',
      owner_password: ''
    });
    setIsModalOpen(true);
  };

  const handleHapus = async (id) => {
    if (!window.confirm('Peringatan: Menghapus instansi akan menghapus SELURUH data Owner dan Outlet di dalamnya. Tetap lanjutkan?')) {
      return;
    }
    try {
      await api.delete(`/super-admin/instansis/${id}`);
      alert('Instansi berhasil dihapus!');
      loadData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menghapus instansi.';
      alert(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await api.put(`/super-admin/instansis/${formData.id}`, {
          nama_instansi: formData.nama_instansi,
          paket_id: formData.paket_id || null
        });
        alert('Instansi berhasil diperbarui!');
      } else {
        await api.post('/super-admin/instansis', {
          nama_instansi: formData.nama_instansi,
          paket_id: formData.paket_id || null,
          owner_name: formData.owner_name,
          owner_email: formData.owner_email,
          owner_password: formData.owner_password,
        });
        alert('Instansi & Owner berhasil dibuat!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data.';
      const errors = error.response?.data?.errors;
      if (errors) {
        const detail = Object.values(errors).flat().join('\n');
        alert(`${msg}\n\n${detail}`);
      } else {
        alert(msg);
      }
    }
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
          onClick={handleTambahBaru}
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
                {daftarInstansi.length > 0 ? daftarInstansi.map((instansi) => (
                  <tr key={instansi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{instansi.nama_instansi}</td>
                    <td className="px-6 py-4">
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
                      {instansi.users && instansi.users.length > 0 ? (
                        <>
                          <p className="font-semibold text-slate-800">{instansi.users[0]?.name}</p>
                          <p className="text-xs text-slate-500">{instansi.users[0]?.email}</p>
                        </>
                      ) : (
                        <span className="text-slate-400 text-sm">Tidak ada owner</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(instansi)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleHapus(instansi.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-400">Belum ada data instansi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* MODAL TAMBAH & EDIT INSTANSI */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-[fadeIn_0.2s_ease-out]">

            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditMode ? 'Edit Profil Instansi' : 'Registrasi Instansi & Owner Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="formInstansi" onSubmit={handleSubmit} className="space-y-6">

                <div>
                  {!isEditMode && <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. Data Perusahaan</h4>}
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
                          <option key={paket.id} value={paket.id}>{paket.nama_paket} - Rp {Number(paket.harga).toLocaleString('id-ID')}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {!isEditMode && (
                  <>
                    <hr className="border-slate-100" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. Kredensial Akun Owner</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap Owner *</label>
                          <input type="text" name="owner_name" required={!isEditMode} value={formData.owner_name} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama Pemilik" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Untuk Login) *</label>
                            <input type="email" name="owner_email" required={!isEditMode} value={formData.owner_email} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="admin@contohmaju.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                            <input type="password" name="owner_password" required={!isEditMode} minLength={6} value={formData.owner_password} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Minimal 6 karakter" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                Batal
              </button>
              <button type="submit" form="formInstansi" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">
                {isEditMode ? 'Simpan Perubahan' : 'Simpan & Buat Akun'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
