import { useState, useEffect } from 'react';
import api from '../services/api';
import CetakPerjanjian from '../components/CetakPerjanjian';

export default function Owner() {
  const [daftarOwner, setDaftarOwner] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [daftarInstansiOption, setDaftarInstansiOption] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  // Owner yang sedang dipratinjau untuk dicetak suratnya (null = jendela ditutup)
  const [ownerCetak, setOwnerCetak] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    instansi_id: ''
  });

  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Paket milik instansi dan riwayat transaksi diambil terpisah: kalau satu
      // endpoint gagal, data paket dari yang lain tetap bisa tampil (dulu
      // Promise.all dipakai utuh sehingga satu kegagalan kosongkan semua tabel).
      const [resOwner, resInstansi, resTrx] = await Promise.allSettled([
        api.get('/super-admin/owners'),
        api.get('/super-admin/instansis'),
        api.get('/super-admin/transaksi-pakets', { params: { per_page: 200 } })
      ]);

      if (resOwner.status !== 'fulfilled') throw resOwner.reason;
      if (resInstansi.status !== 'fulfilled') throw resInstansi.reason;
      if (resTrx.status === 'rejected') {
        console.warn('Gagal memuat riwayat transaksi paket:', resTrx.reason);
      }

      const owners = resOwner.value.data.data;
      const dataInstansi = resInstansi.value.data.data || [];
      const transaksi = resTrx.status === 'fulfilled' ? resTrx.value.data?.data || [] : [];

      // Paket milik tiap instansi, dipetakan dari /instansis (cadangan).
      // Sumber utamanya nanti owner.instansi.paket yang ikut dikirim backend;
      // peta ini dipakai kalau relasi itu belum tersedia di respons /owners.
      const paketPerInstansi = new Map();
      dataInstansi.forEach((ins) => {
        if (ins.paket) paketPerInstansi.set(String(ins.id), ins.paket);
      });

      // Kelompokkan transaksi per instansi, urut dari yang terbaru.
      const trxPerInstansi = new Map();
      transaksi.forEach((trx) => {
        const key = String(trx.instansi_id || trx.instansi?.id);
        if (!trxPerInstansi.has(key)) trxPerInstansi.set(key, []);
        trxPerInstansi.get(key).push(trx);
      });

      setDaftarOwner(
        owners.map((owner) => {
          const key = String(owner.instansi_id || owner.instansi?.id || '');
          // Prioritas: relasi paket yang ikut di payload owner, lalu peta /instansis.
          const paketInstansi = owner.instansi?.paket || paketPerInstansi.get(key) || null;
          const riwayat = (trxPerInstansi.get(key) || []).map((trx) => ({
            id: trx.id,
            // Paket pada invoice boleh null bila relasinya tidak ikut termuat;
            // biarkan null supaya merge di bawah memakai nilai dari instansi.
            nama_paket: trx.paket?.nama_paket || null,
            harga: trx.total_harga || trx.paket?.harga || null,
            durasi_hari: trx.paket?.durasi_hari ?? null,
            max_outlet: trx.paket?.max_outlet ?? null,
            max_karyawan_per_outlet: trx.paket?.max_karyawan_per_outlet ?? null,
            fitur: trx.paket?.fitur ?? null,
            tanggal_mulai: trx.tanggal_mulai || null,
            tanggal_berakhir: trx.tanggal_berakhir || null,
            status: trx.status || 'pending',
          }));

          // Sumber paket = invoice (transaksi_paket) milik instansi itu.
          // Status invoice tidak jadi syarat: selama ada invoice, datanya dipakai
          // (paket, fitur, harga, masa langganan) apa pun statusnya. Invoice
          // terbaru yang dipilih.Paket yang melekat di instansi hanya dipakai
          // kalau instansi belum punya invoice sama sekali.
          const trxPaket = riwayat[0] || null;
          const paketDipakai = trxPaket
            ? {
                // Nilai dari invoice lebih spesifik; field yang null di invoice
                // tetap memakai nilai paket instansi (atau sebaliknya).
                nama_paket: trxPaket.nama_paket || paketInstansi?.nama_paket || null,
                harga: trxPaket.harga || paketInstansi?.harga || null,
                durasi_hari: trxPaket.durasi_hari ?? paketInstansi?.durasi_hari ?? null,
                max_outlet: trxPaket.max_outlet ?? paketInstansi?.max_outlet ?? null,
                max_karyawan_per_outlet:
                  trxPaket.max_karyawan_per_outlet ?? paketInstansi?.max_karyawan_per_outlet ?? null,
                fitur: trxPaket.fitur ?? paketInstansi?.fitur ?? null,
                tanggal_mulai: trxPaket.tanggal_mulai,
                tanggal_berakhir: trxPaket.tanggal_berakhir,
                status: trxPaket.status,
              }
            : paketInstansi;

          return {
            ...owner,
            riwayat_langganan: riwayat,
            paket_aktif: paketDipakai,
            paket_instansi: paketInstansi,
          };
        })
      );
      setDaftarInstansiOption(dataInstansi);
    } catch (error) {
      console.error('Gagal memuat data owner:', error);
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
    setFormData({ id: null, name: '', email: '', password: '', instansi_id: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (owner) => {
    setIsEditMode(true);
    setFormData({
      id: owner.id,
      name: owner.name,
      email: owner.email,
      password: '',
      instansi_id: owner.instansi_id || ''
    });
    setIsModalOpen(true);
  };

  const handleHapus = async (id) => {
    if (!window.confirm('Yakin ingin menghapus Owner ini beserta semua aksesnya?')) return;
    try {
      await api.delete(`/super-admin/owners/${id}`);
      alert('Owner berhasil dihapus!');
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menghapus owner.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        const payload = {
          name: formData.name,
          email: formData.email,
          instansi_id: formData.instansi_id,
        };
        if (formData.password) {
          payload.password = formData.password;
        }
        await api.put(`/super-admin/owners/${formData.id}`, payload);
        alert('Owner berhasil diperbarui!');
      } else {
        await api.post('/super-admin/owners', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          instansi_id: formData.instansi_id,
        });
        alert('Owner berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menyimpan data.';
      const errors = error.response?.data?.errors;
      if (errors) {
        alert(`${msg}\n\n${Object.values(errors).flat().join('\n')}`);
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div className="relative">
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
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paket Berlangganan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Kontak</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftarOwner.length > 0 ? daftarOwner.map((owner) => (
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
                    <td className="px-6 py-4">
                      {owner.paket_aktif ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-slate-700">
                            {owner.paket_aktif.nama_paket || 'Paket tidak tercatat'}
                          </span>
                          <span className="text-xs text-emerald-600 font-medium">
                            {owner.paket_aktif.harga
                              ? formatRupiah(Number(owner.paket_aktif.harga))
                              : 'Harga belum tercatat'}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border w-fit ${
                              owner.paket_aktif.status === 'aktif'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : owner.paket_aktif.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {owner.paket_aktif.status || 'Tanpa Transaksi'}
                          </span>
                          {owner.riwayat_langganan.length > 1 && (
                            <span className="text-[10px] text-slate-400">
                              +{owner.riwayat_langganan.length - 1} riwayat
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-md text-xs font-bold">
                          Belum Ada Paket
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {owner.profil_karyawan?.kontak || 'Belum diatur'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setOwnerCetak(owner)}
                        title="Cetak surat perjanjian"
                        className="text-sm font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors mr-2"
                      >
                        🖨 Cetak
                      </button>
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
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Belum ada data owner.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
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
                    Password {isEditMode ? '(Kosongkan jika tidak diubah)' : '*'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    required={!isEditMode}
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah sandi' : 'Minimal 6 karakter'}
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

      {/* JENDELA CETAK SURAT PERJANJIAN */}
      {ownerCetak && (
        <CetakPerjanjian owner={ownerCetak} onClose={() => setOwnerCetak(null)} />
      )}

    </div>
  );
}