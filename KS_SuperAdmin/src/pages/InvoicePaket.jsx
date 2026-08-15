import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';

const STATUS_STYLE = {
  aktif: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  kedaluwarsa: 'bg-slate-100 text-slate-600 border-slate-200',
  dibatalkan: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_LIST = ['pending', 'aktif', 'kedaluwarsa', 'dibatalkan'];

const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

const hariIni = () => new Date().toISOString().split('T')[0];

export default function InvoicePaket() {
  const [daftar, setDaftar] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instansiOptions, setInstansiOptions] = useState([]);
  const [paketOptions, setPaketOptions] = useState([]);

  const [filter, setFilter] = useState({ instansi_id: '', status: '' });
  const [page, setPage] = useState(1);

  // Modal terbitkan invoice baru
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ instansi_id: '', paket_id: '', tanggal_mulai: hariIni(), status: 'pending' });

  // Modal kelola status
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ status: '', tanggal_berakhir: '' });

  const paketTerpilih = useMemo(
    () => paketOptions.find((p) => String(p.id) === String(createForm.paket_id)),
    [paketOptions, createForm.paket_id]
  );

  useEffect(() => {
    Promise.all([
      api.get('/super-admin/instansis'),
      api.get('/super-admin/pakets'),
    ])
      .then(([resInst, resPaket]) => {
        setInstansiOptions(resInst.data.data);
        setPaketOptions(resPaket.data.data);
      })
      .catch((err) => console.error('Gagal memuat opsi:', err));
  }, []);

  const loadData = async (pageArg = page, filterArg = filter) => {
    setIsLoading(true);
    try {
      const params = { per_page: 20, page: pageArg };
      if (filterArg.instansi_id) params.instansi_id = filterArg.instansi_id;
      if (filterArg.status) params.status = filterArg.status;
      const res = await api.get('/super-admin/transaksi-pakets', { params });
      setDaftar(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error('Gagal memuat invoice paket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(page, filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const terapkanFilter = () => {
    if (page === 1) loadData(1, filter);
    else setPage(1);
  };

  const bukaCreate = () => {
    setCreateForm({ instansi_id: '', paket_id: '', tanggal_mulai: hariIni(), status: 'pending' });
    setIsCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/super-admin/transaksi-pakets', {
        instansi_id: createForm.instansi_id,
        paket_id: createForm.paket_id,
        tanggal_mulai: createForm.tanggal_mulai,
        status: createForm.status,
      });
      alert('Invoice pembelian paket berhasil diterbitkan!');
      setIsCreateOpen(false);
      loadData(1, filter);
      setPage(1);
    } catch (error) {
      const msg = error.response?.data?.message || 'Gagal menerbitkan invoice.';
      const errors = error.response?.data?.errors;
      alert(errors ? `${msg}\n\n${Object.values(errors).flat().join('\n')}` : msg);
    }
  };

  const bukaEdit = (trx) => {
    setEditTarget(trx);
    setEditForm({ status: trx.status, tanggal_berakhir: trx.tanggal_berakhir || '' });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/super-admin/transaksi-pakets/${editTarget.id}`, {
        status: editForm.status,
        tanggal_berakhir: editForm.tanggal_berakhir || null,
      });
      alert('Status invoice berhasil diperbarui!');
      setEditTarget(null);
      loadData(page, filter);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memperbarui invoice.');
    }
  };

  const unduhInvoice = async (id) => {
    try {
      const res = await api.get(`/super-admin/transaksi-pakets/${id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-paket-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh invoice PDF.');
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Invoice Pembelian Paket</h2>
          <p className="text-slate-500 mt-1">Terbitkan & verifikasi pembelian paket dari owner UMKM (kendali penuh Super Admin).</p>
        </div>
        <button onClick={bukaCreate} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-500/30 transition-all flex items-center gap-2">
          <span>+</span> Terbitkan Invoice
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Owner / Instansi</label>
          <select value={filter.instansi_id} onChange={(e) => setFilter({ ...filter, instansi_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
            <option value="">-- Semua Instansi --</option>
            {instansiOptions.map((inst) => <option key={inst.id} value={inst.id}>{inst.nama_instansi}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
          <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
            <option value="">-- Semua Status --</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={terapkanFilter} className="px-5 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all text-sm">Terapkan</button>
      </div>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Memuat invoice...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">No. Invoice</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Instansi / Owner</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Paket & Total</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Periode</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.length > 0 ? daftar.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">INV/PKT/{new Date(trx.created_at).getFullYear()}/{String(trx.id).padStart(4, '0')}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{trx.instansi?.nama_instansi || '-'}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{trx.paket?.nama_paket || '-'}</p>
                      <p className="text-sm text-emerald-600 font-medium">{formatRupiah(Number(trx.total_harga))}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {trx.tanggal_mulai || '-'} <span className="text-slate-300">→</span> {trx.tanggal_berakhir || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${STATUS_STYLE[trx.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button onClick={() => bukaEdit(trx)} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors mr-2">Kelola</button>
                      <button onClick={() => unduhInvoice(trx.id)} className="text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors">Unduh PDF</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">Belum ada invoice pembelian paket.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">Halaman <b>{meta.current_page}</b> dari <b>{meta.last_page}</b> — total <b>{meta.total}</b> invoice</p>
            <div className="flex gap-2">
              <button disabled={meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">← Sebelumnya</button>
              <button disabled={meta.current_page >= meta.last_page} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">Berikutnya →</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL TERBITKAN */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">Terbitkan Invoice Paket</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            <form id="formCreateInvoice" onSubmit={submitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instansi (Owner) *</label>
                <select required value={createForm.instansi_id} onChange={(e) => setCreateForm({ ...createForm, instansi_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="" disabled>-- Pilih Instansi --</option>
                  {instansiOptions.map((inst) => <option key={inst.id} value={inst.id}>{inst.nama_instansi}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paket *</label>
                <select required value={createForm.paket_id} onChange={(e) => setCreateForm({ ...createForm, paket_id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="" disabled>-- Pilih Paket --</option>
                  {paketOptions.map((p) => <option key={p.id} value={p.id}>{p.nama_paket} — {formatRupiah(Number(p.harga))}</option>)}
                </select>
                {paketTerpilih && (
                  <p className="text-xs text-slate-500 mt-1">Total tagihan: <b className="text-emerald-600">{formatRupiah(Number(paketTerpilih.harga))}</b> · masa aktif {paketTerpilih.durasi_hari} hari (tanggal berakhir dihitung otomatis).</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai *</label>
                  <input type="date" required value={createForm.tanggal_mulai} onChange={(e) => setCreateForm({ ...createForm, tanggal_mulai: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Awal</label>
                  <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white capitalize">
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400">Status <b>aktif</b> akan langsung menyetel paket instansi ini.</p>
            </form>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
              <button type="submit" form="formCreateInvoice" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">Terbitkan</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KELOLA STATUS */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">Kelola Invoice</h3>
              <button onClick={() => setEditTarget(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                <p className="text-slate-500">Instansi: <b className="text-slate-800">{editTarget.instansi?.nama_instansi}</b></p>
                <p className="text-slate-500 mt-1">Paket: <b className="text-blue-600">{editTarget.paket?.nama_paket}</b> · {formatRupiah(Number(editTarget.total_harga))}</p>
              </div>
              <form id="formEditInvoice" onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white capitalize">
                    {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">Set <b>aktif</b> untuk mengonfirmasi pembayaran & menyetel paket instansi.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Perpanjang Hingga (opsional)</label>
                  <input type="date" value={editForm.tanggal_berakhir} onChange={(e) => setEditForm({ ...editForm, tanggal_berakhir: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Batal</button>
              <button type="submit" form="formEditInvoice" className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
