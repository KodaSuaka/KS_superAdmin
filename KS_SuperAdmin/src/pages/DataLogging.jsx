import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const METHOD_STYLE = {
  GET: 'bg-blue-50 text-blue-700 border-blue-200',
  POST: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PUT: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETE: 'bg-red-50 text-red-700 border-red-200',
};

const statusStyle = (code) => {
  if (code >= 500) return 'bg-red-50 text-red-700 border-red-200';
  if (code >= 400) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (code >= 300) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const KOSONG_FILTER = {
  instansi_id: '',
  user_id: '',
  method: '',
  status_code: '',
  path: '',
  date_from: '',
  date_to: '',
};

export default function DataLogging() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [instansiOptions, setInstansiOptions] = useState([]);
  const [filters, setFilters] = useState(KOSONG_FILTER);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  // Dropdown karyawan diturunkan dari user yang muncul di log saat ini,
  // supaya super admin bisa memfilter "request dari karyawan A" tanpa tahu ID numeriknya.
  const userOptions = useMemo(() => {
    const map = new Map();
    logs.forEach((l) => {
      if (l.user) map.set(l.user.id, l.user);
    });
    return Array.from(map.values());
  }, [logs]);

  useEffect(() => {
    api.get('/super-admin/instansis')
      .then((res) => setInstansiOptions(res.data.data))
      .catch((err) => console.error('Gagal memuat instansi:', err));
  }, []);

  const loadData = useCallback(async (pageArg, filterArg) => {
    setIsLoading(true);
    try {
      const params = { per_page: 20, page: pageArg };
      Object.entries(filterArg).forEach(([key, value]) => {
        if (value !== '' && value !== null) params[key] = value;
      });
      const res = await api.get('/super-admin/request-logs', { params });
      setLogs(res.data.data);
      setMeta(res.data.meta);
    } catch (error) {
      console.error('Gagal memuat data logging:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(page, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Ganti instansi -> reset filter karyawan (daftar karyawan berbeda per instansi).
    setFilters((prev) => ({ ...prev, [name]: value, ...(name === 'instansi_id' ? { user_id: '' } : {}) }));
  };

  const terapkan = (e) => {
    e.preventDefault();
    if (page === 1) loadData(1, filters);
    else setPage(1);
  };

  const reset = () => {
    setFilters(KOSONG_FILTER);
    if (page === 1) loadData(1, KOSONG_FILTER);
    else setPage(1);
  };

  const formatWaktu = (iso) =>
    iso ? new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Data Logging Karyawan</h2>
        <p className="text-slate-500 mt-1">Jejak request API tiap karyawan, difilter sesuai scope owner (instansi).</p>
      </div>

      {/* FILTER */}
      <form onSubmit={terapkan} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Owner / Instansi</label>
            <select name="instansi_id" value={filters.instansi_id} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
              <option value="">-- Semua Instansi --</option>
              {instansiOptions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.nama_instansi}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Karyawan (dari log tampil)</label>
            <select name="user_id" value={filters.user_id} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
              <option value="">-- Semua Karyawan --</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Method</label>
            <select name="method" value={filters.method} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
              <option value="">-- Semua --</option>
              {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status Code</label>
            <input type="number" name="status_code" value={filters.status_code} onChange={handleFilterChange} placeholder="mis. 200 / 500" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1">Path (URL)</label>
            <input type="text" name="path" value={filters.path} onChange={handleFilterChange} placeholder="mis. transaksi-kas" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Dari Tanggal</label>
            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={reset} className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors text-sm">Reset</button>
          <button type="submit" className="px-5 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all text-sm">Terapkan Filter</button>
        </div>
      </form>

      {/* TABEL */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Memuat data logging...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Waktu</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Karyawan</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Method</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Path</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Durasi</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{formatWaktu(log.created_at)}</td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <>
                          <p className="font-semibold text-slate-700">{log.user.name}</p>
                          <p className="text-xs text-slate-400">{log.user.email}</p>
                        </>
                      ) : (
                        <span className="text-slate-400 text-sm">Tanpa user</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${METHOD_STYLE[log.method] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono max-w-[280px] truncate" title={log.path}>{log.path}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusStyle(log.status_code)}`}>
                        {log.status_code ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{log.duration_ms != null ? `${log.duration_ms} ms` : '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setDetail(log)} className="text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">Lihat</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">Belum ada data logging.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Halaman <b>{meta.current_page}</b> dari <b>{meta.last_page}</b> — total <b>{meta.total}</b> log
            </p>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berikutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-800">Detail Request Log #{detail.id}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-red-500 font-bold text-xl">✕</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-400">Karyawan</p><p className="font-semibold text-slate-700">{detail.user?.name || 'Tanpa user'}</p></div>
                <div><p className="text-xs text-slate-400">Waktu</p><p className="font-semibold text-slate-700">{formatWaktu(detail.created_at)}</p></div>
                <div><p className="text-xs text-slate-400">Method &amp; Status</p><p className="font-semibold text-slate-700">{detail.method} — {detail.status_code}</p></div>
                <div><p className="text-xs text-slate-400">Durasi</p><p className="font-semibold text-slate-700">{detail.duration_ms} ms</p></div>
                <div><p className="text-xs text-slate-400">IP Address</p><p className="font-semibold text-slate-700">{detail.ip_address || '-'}</p></div>
                <div><p className="text-xs text-slate-400">Instansi ID</p><p className="font-mono text-xs text-slate-600 break-all">{detail.instansi_id || '-'}</p></div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Full URL</p>
                <p className="font-mono text-xs text-slate-600 break-all bg-slate-50 border border-slate-200 rounded-lg p-2">{detail.full_url || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">User Agent</p>
                <p className="text-xs text-slate-600 break-all bg-slate-50 border border-slate-200 rounded-lg p-2">{detail.user_agent || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Query Params</p>
                <pre className="font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto">{JSON.stringify(detail.query_params ?? {}, null, 2)}</pre>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Request Body <span className="text-slate-300">(password otomatis disensor)</span></p>
                <pre className="font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto">{JSON.stringify(detail.request_body ?? {}, null, 2)}</pre>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
              <button onClick={() => setDetail(null)} className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
