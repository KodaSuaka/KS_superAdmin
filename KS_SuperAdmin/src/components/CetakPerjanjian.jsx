import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SuratPerjanjian from '../components/SuratPerjanjian';

/**
 * Jendela cetak surat perjanjian.
 * Menampilkan preview di modal (desktop) / overlay penuh (mobile), lalu
 * memanggil window.print() yang hanya mencetak isi jendela ini.
 *
 * Jendela dirender lewat portal ke <body>, bukan di dalam halaman Owner.
 * Alasannya: aturan cetak menyembunyikan seluruh anak body selain
 * .cetak-jendela. Kalau jendela ini ikut tertanam di dalam #root, yang
 * tersembunyi adalah sekaligus isi suratnya sendiri.
 */
export default function CetakPerjanjian({ owner, nomorUrut = 1, onClose }) {
  const [tanggalCetak] = useState(() => new Date());

  // Hilangkan isi halaman di belakang supaya yang tercetak hanya surat.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="cetak-jendela fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm">
      {/* Toolbar */}
      <div className="cetak-toolbar shrink-0 bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base md:text-lg font-bold text-slate-800">Cetak Surat Perjanjian</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            PIHAK I: CodaSuaka — PIHAK II: {owner?.instansi?.nama_instansi || 'Data owner'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            🖨 Cetak / PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200 text-sm font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Preview surat */}
      <div className="cetak-pscroll flex-1 overflow-auto py-6 px-2 md:px-6">
        {/* .cetak-kertas: dibatasi 210mm saat pratinjau, dilepas saat print
            karena area konten A4 dengan @page margin hanya 170mm. */}
        <div className="cetak-kertas mx-auto shadow-2xl max-w-[210mm] w-full">
          <div className="cetak-surat">
            <SuratPerjanjian owner={owner} tanggalCetak={tanggalCetak} nomorUrut={nomorUrut} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
