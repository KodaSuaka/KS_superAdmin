/**
 * Dokumen "Surat Perjanjian Penggunaan dan Berlangganan Aplikasi CodaSuaka".
 *
 * Struktur mengikuti dokumen acuan resmi: judul, PIHAK PERTAMA / PIHAK KEDUA,
 * 13 pasal (termasuk tabel Paket Berlangganan), blok tanda tangan + materai.
 *
 * Komponen ini murni presentasi: tidak menyimpan state, tidak memanggil API.
 * Identitas PIHAK PERTAMA, rekening, dan masa berlangganan mengikuti template
 * resmi; data PIHAK KEDUA diisi dari data owner, dan yang tidak ada di sistem
 * dikosongkan dengan garis titik-titik (Isian) supaya dicetak tangan, bukan dikarang.
 */

// Identitas PIHAK PERTAMA fiks, sama dengan template resmi
// (file/Surat-Perjanjian-Penggunaan-dan-Berlangganan-CodaSuaka.docx).
// Isian ini tidak diubah: nama, jabatan, dan nomor telepon dipakai apa adanya.
const PIHAK_PERTAMA = {
  nama: 'RAHMAT NURIL MUSTOFA',
  jabatan: 'CEO',
  telepon: '0882009179668',
  email: 'kodasuaka@gmail.com',
  bertindakUntuk: 'Penyedia Aplikasi CodaSuaka',
};

// Rekening penagihan PIHAK PERTAMA, sama dengan template resmi.
const PEMBAYARAN = '1710016942966 A.N Rahmat Nuril M (Mandiri)';

// Tempat pembuatan surat: tetap Kediri, tidak diambil dari data owner.
const TEMPAT_SURAT = 'Kediri';

// Masa Berlangganan sesuai ketentuan: 30 hari sejak tanggal penandatanganan.
const MASA_BERLANGGANAN_HARI = 30;

const formatRupiah = (angka) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

/**
 * Nomor surat: <3 huruf awal instansi>-<nomor urut>/KDS/<bulan>/<tahun>,
 * contoh ABC-001/KDS/09/2026. Angka bulan dan tahun ikut tanggal pencetakan.
 * Sengaja tidak diekspor: aturan fast-refresh mensyaratkan file komponen
 * hanya mengekspor komponen.
 */
function formatNomorSurat({ namaInstansi, nomorUrut, tanggal }) {
  const kode = (namaInstansi || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((kata) => kata.replace(/[^A-Za-z0-9]/g, '').charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
  const urut = String(nomorUrut || 1).padStart(3, '0');
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
  return `${kode || 'XXX'}-${urut}/KDS/${bulan}/${tanggal.getFullYear()}`;
}

/** Garis titik-titik untuk data yang belum ada di sistem / diisi tangan. */
function Isian({ lebar = 'w-40' }) {
  return (
    <span className={`inline-block border-b border-dotted border-slate-600 align-baseline ${lebar}`}>
      &nbsp;
    </span>
  );
}

// Penomoran butir: penanda "1." ikut di dalam string nomor supaya spasi
// sebelum titik tidak pernah muncul di hasil cetak.
function Paragraf({ children, nomor }) {
  return (
    <p className="text-[12px] leading-[1.75] text-slate-900 text-justify mb-2">
      {nomor ? <span className="font-semibold">{nomor}</span> : null}
      {children}
    </p>
  );
}

/** Judikal pasal: "PASAL 1" rata tengah, dengan garis bawah (sesuai acuan). */
function Pasal({ nomor, judul, children }) {
  return (
    <section className="mb-4">
      <h3 className="text-[12.5px] font-bold text-center text-slate-900 mb-1">
        PASAL {nomor}
        {judul ? <span className="underline ml-1">{judul}</span> : null}
      </h3>
      {children}
    </section>
  );
}

function BarisTabel({ label, lebarLabel = 'w-40', children }) {
  return (
    <tr>
      <td className={`py-0.5 pr-2 align-top text-[12px] font-semibold text-slate-900 ${lebarLabel}`}>{label}</td>
      <td className="py-0.5 pr-2 align-top text-[12px] text-center">:</td>
      <td className="py-0.5 align-top text-[12px] text-slate-900">{children}</td>
    </tr>
  );
}

export default function SuratPerjanjian({ owner, tanggalCetak = new Date(), nomorUrut = 1 }) {
  if (!owner) return null;

  // Tanggal cetak satu-satunya tanggal yang dipakai di surat: mengisi kalimat
  // pembuka dan angka bulan/tahun pada nomor surat. Pasal 4 tidak lagi memakai
  // tanggal karena Masa Berlangganannya tetap 30 hari sejak penandatanganan.
  const namaHari = tanggalCetak.toLocaleDateString('id-ID', { weekday: 'long' });
  const namaBulan = tanggalCetak.toLocaleDateString('id-ID', { month: 'long' });

  const profil = owner.profil_karyawan || {};
  const instansi = owner.instansi || {};

  const nomorSurat = formatNomorSurat({
    namaInstansi: instansi.nama_instansi,
    nomorUrut,
    tanggal: tanggalCetak,
  });

  // Paket milik owner, digabung per-field dari tiga sumber:
  //   1) owner.paket_aktif   -> paket dari invoice (transaksi_paket)
  //   2) owner.paket_instansi -> paket yang melekat di instansi
  //   3) instansi.paket       -> bentuk legacy, kalau owner dari /owners
  // Fallback per-field (bukan per-objek) wajib: invoice sering punya tanggal
  // tapi relasi paketnya tidak termuat, jadi objeknya ada tapi isinya null.
  // Kalau fallback per-objek, field yang kosong tidak akan terisi.
  const sumberPaket = [owner.paket_aktif, owner.paket_instansi, instansi.paket].filter(
    (p) => p && typeof p === 'object'
  );
  const paket = sumberPaket.length
    ? {
        nama_paket: sumberPaket.map((p) => p.nama_paket).find(Boolean) || null,
        harga: sumberPaket.map((p) => p.harga).find(Boolean) || null,
        durasi_hari: sumberPaket.map((p) => p.durasi_hari).find((v) => v != null) ?? null,
        max_outlet: sumberPaket.map((p) => p.max_outlet).find((v) => v != null) ?? null,
        max_karyawan_per_outlet: sumberPaket
          .map((p) => p.max_karyawan_per_outlet)
          .find((v) => v != null) ?? null,
        fitur: sumberPaket.map((p) => p.fitur).find((v) => v != null) ?? null,
        status: sumberPaket.map((p) => p.status).find(Boolean) || null,
      }
    : null;

  const namaPihakKedua = profil.nama_lengkap || owner.name || '';
  const kontak = profil.kontak || null;
  // Surel pemilik ada di tabel users (karyawans tidak punya kolom email).
  const email = owner.email || null;
  // Gabung telepon dan surel per bagian yang ada: dulu baris ini bergantung
  // pada kontak saja, jadi owner tanpa nomor telepon menampilkan baris kosong
  // padahal surelnya ada.
  const kontakEmail = [kontak, email].filter(Boolean).join(' / ');
  const npwp = profil.npwp || null;

  // Masa Berlangganan tidak lagi memakai tanggal transaksi: sekarang tetap
  // 30 hari sejak penandatanganan (lihat MASA_BERLANGGANAN_HARI di Pasal 4).
  // Durasi paket (durasi_hari) tetap tampil di Pasal 3 sebagaiinformasi paket.

  // Fitur paket disimpan backend sebagai JSON string; terima array, JSON, atau teks.
  const fitur = Array.isArray(paket?.fitur)
    ? paket.fitur
    : (() => {
        if (!paket?.fitur) return [];
        try {
          const parsed = JSON.parse(paket.fitur);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return String(paket.fitur)
            .split('\n')
            .filter(Boolean);
        }
      })();

  return (
    <div
      className="bg-white text-slate-900 mx-auto"
      style={{
        // Times New Roman dengan fallback metric-compatible (Liberation Serif)
        // supaya hasil cetak di mesin tanpa Times tetap proporsional.
        fontFamily: "'Times New Roman', 'Liberation Serif', Times, serif",
        width: '210mm',
        padding: '18mm 20mm 20mm',
      }}
    >
      {/* JUDUL */}
      <header className="text-center mb-5">
        <h1 className="text-[15px] font-bold uppercase tracking-wide">Surat Perjanjian</h1>
        <h2 className="text-[13.5px] font-bold uppercase mt-0.5">
          Penggunaan dan Berlangganan Aplikasi CodaSuaka
        </h2>
      </header>

      {/* NOMOR — pola: <kode instansi>-<urut>/KDS/<bln>/<thn>, rata tengah */}
      <p className="text-[12px] mb-4 text-center">
        No.: <b>{nomorSurat}</b>
      </p>

      {/* PEMBUKA — tempat surat tetap Kediri, tanggal dari tanggal pencetakan */}
      <p className="text-[12px] leading-[1.75] text-justify mb-4">
        Pada hari ini, {namaHari}, tanggal {tanggalCetak.getDate()}, bulan {namaBulan}, tahun{' '}
        {tanggalCetak.getFullYear()},bertempat di {TEMPAT_SURAT}, kami yang bertanda tangan di bawah ini:
      </p>

      {/* PIHAK PERTAMA — isi tetap sesuai template; baris Alamat dihapus */}
      <table className="w-full mb-4 border-collapse">
        <tbody>
          <BarisTabel label="Nama">{PIHAK_PERTAMA.nama}</BarisTabel>
          <BarisTabel label="Jabatan">{PIHAK_PERTAMA.jabatan}</BarisTabel>
          <BarisTabel label="Bertindak untuk dan atas nama">{PIHAK_PERTAMA.bertindakUntuk}</BarisTabel>
          <BarisTabel label="Nomor Telepon/Email">
            {PIHAK_PERTAMA.telepon} / {PIHAK_PERTAMA.email}
          </BarisTabel>
        </tbody>
      </table>
      <p className="text-[12px] leading-[1.75] text-justify mb-4">
        Selanjutnya disebut sebagai <b>&ldquo;PIHAK PERTAMA&rdquo;</b> atau <b>&ldquo;Penyedia&rdquo;</b>.
      </p>

      {/* PIHAK KEDUA — baris Alamat Instansi dihapus, sesuai template */}
      <table className="w-full mb-4 border-collapse">
        <tbody>
          <BarisTabel label="Nama">{namaPihakKedua || <Isian lebar="w-56" />}</BarisTabel>
          <BarisTabel label="Jabatan">Pemilik / Penanggung Jawab</BarisTabel>
          <BarisTabel label="Nama Instansi/Perusahaan">{instansi.nama_instansi || <Isian lebar="w-56" />}</BarisTabel>
          <BarisTabel label="NPWP (jika ada)">{npwp || <Isian lebar="w-40" />}</BarisTabel>
          <BarisTabel label="Nomor Telepon/Email">
            {kontakEmail ? kontakEmail : <Isian lebar="w-56" />}
          </BarisTabel>
        </tbody>
      </table>
      <p className="text-[12px] leading-[1.75] text-justify mb-4">
       Selanjutnya disebut sebagai <b>&ldquo;PIHAK KEDUA&rdquo;</b> atau{' '}
        <b>&ldquo;Pelanggan&rdquo;</b>.
      </p>

      <p className="text-[12px] leading-[1.75] text-justify mb-4">
        PIHAK PERTAMA dan PIHAK KEDUA (selanjutnya secara bersama-sama disebut <b>&ldquo;Para Pihak&rdquo;</b> dan
        masing-masing disebut <b>&ldquo;Pihak&rdquo;</b>) dengan ini sepakat untuk mengadakan dan menandatangani
        Perjanjian Penggunaan dan Berlangganan Aplikasi CodaSuaka (<b>&ldquo;Perjanjian&rdquo;</b>) dengan syarat dan
        ketentuan sebagaimana berikut:
      </p>

      {/* PASAL 1 */}
      <Pasal nomor={1} judul="DEFINISI">
        <Paragraf nomor="1.">
          <b>&ldquo;Aplikasi&rdquo;</b> adalah aplikasi manajemen bisnis CodaSuaka, mencakup aplikasi mobile Android dan
          layanan backend beserta seluruh fitur di dalamnya.
        </Paragraf>
        <Paragraf nomor="2.">
          <b>&ldquo;Paket Berlangganan&rdquo;</b> adalah paket layanan yang dipilih PIHAK KEDUA sebagaimana diatur dalam
          Pasal 3, dengan batasan fitur, jumlah outlet, dan jumlah karyawan per outlet tertentu.
        </Paragraf>
        <Paragraf nomor="3.">
          <b>&ldquo;Masa Berlangganan&rdquo;</b> adalah jangka waktu keberlakuan Paket Berlangganan sebagaimana diatur
          dalam Pasal 4.
        </Paragraf>
        <Paragraf nomor="4.">
          <b>&ldquo;Data Instansi&rdquo;</b> adalah seluruh data yang diinput dan/atau dihasilkan oleh PIHAK KEDUA dalam
          Aplikasi, termasuk data karyawan, presensi, pengajuan cuti/izin/sakit, dan data keuangan.
        </Paragraf>
      </Pasal>

      {/* PASAL 2 */}
      <Pasal nomor={2} judul="OBJEK PERJANJIAN">
        <Paragraf>
          PIHAK PERTAMA memberikan hak kepada PIHAK KEDUA untuk menggunakan Aplikasi CodaSuaka sesuai dengan Paket
          Berlangganan yang dipilih, guna mendukung kegiatan operasional PIHAK KEDUA yang meliputi antara lain manajemen
          karyawan, presensi, pengajuan cuti/izin/sakit, penjadwalan, penugasan, pengelolaan keuangan (buku kas dan
          laporan), serta komunikasi.
        </Paragraf>
        <Paragraf>
          Penggunaan Aplikasi oleh PIHAK KEDUA tetap tunduk pada ketentuan Perjanjian Lisensi Pengguna Akhir (EULA)
          CodaSuaka yang merupakan bagian yang tidak terpisahkan dari Perjanjian ini.
        </Paragraf>
      </Pasal>

      {/* PASAL 3 — TABEL PAKET */}
      <Pasal nomor={3} judul="PAKET BERLANGGANAN DAN BIAYA">
        <Paragraf>
          PIHAK KEDUA memilih Paket Berlangganan dengan rincian sebagai berikut:
        </Paragraf>
        <table className="w-full border-collapse mb-2 text-[11px] pasal-tabel">
          <thead>
            <tr>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Nama Paket</th>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Fitur Utama</th>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Harga</th>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Durasi (hari)</th>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Maks. Outlet</th>
              <th className="border border-slate-500 py-1 px-1.5 text-left font-semibold">Maks. Karyawan/Outlet</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-slate-500 py-1 px-1.5">{paket ? paket.nama_paket : <Isian lebar="w-20" />}</td>
              <td className="border border-slate-500 py-1 px-1.5">
                {fitur.length > 0 ? fitur.join(', ') : <Isian lebar="w-32" />}
              </td>
              <td className="border border-slate-500 py-1 px-1.5">
                {paket?.harga ? formatRupiah(Number(paket.harga)) : <Isian lebar="w-24" />}
              </td>
              <td className="border border-slate-500 py-1 px-1.5">{paket?.durasi_hari || <Isian lebar="w-12" />}</td>
              <td className="border border-slate-500 py-1 px-1.5">{paket?.max_outlet || <Isian lebar="w-12" />}</td>
              <td className="border border-slate-500 py-1 px-1.5">
                {paket?.max_karyawan_per_outlet || <Isian lebar="w-16" />}
              </td>
            </tr>
          </tbody>
        </table>
        <Paragraf>
          Biaya Paket Berlangganan sebagaimana tercantum di atas belum termasuk pajak yang berlaku, kecuali dinyatakan lain
          secara tertulis.
        </Paragraf>
        <Paragraf>
          PIHAK KEDUA wajib melakukan pembayaran penuh sebelum atau paling lambat pada tanggal aktivasi/perpanjangan Paket
          Berlangganan, melalui metode pembayaran yang disepakati dan/atau tersedia dalam Aplikasi.
        </Paragraf>
        <Paragraf>
          Bukti pembayaran yang sah wajib diunggah/diserahkan oleh PIHAK KEDUA sebagai syarat aktivasi status
          <b> &ldquo;aktif&rdquo;</b> pada Paket Berlangganan.
        </Paragraf>
      </Pasal>

      {/* PASAL 4 — masa berlangganan tetap 30 hari, tanpa isian tanggal */}
      <Pasal nomor={4} judul="JANGKA WAKTU">
        <Paragraf>
          Masa Berlangganan berlaku selama {MASA_BERLANGGANAN_HARI} (tiga puluh) hari sejak tanggal
          penandatanganan Perjanjian ini, atas Paket Berlangganan yang dipilih sebagaimana diatur dalam Pasal 3.
        </Paragraf>
        <Paragraf>
          Perjanjian ini dapat diperpanjang untuk periode berikutnya berdasarkan persetujuan tertulis (termasuk melalui
          Aplikasi) dan pembayaran biaya perpanjangan oleh PIHAK KEDUA. Apabila PIHAK KEDUA tidak melakukan perpanjangan
          sampai dengan berakhirnya Masa Berlangganan, status Paket Berlangganan akan berubah menjadi
          <b> &ldquo;kedaluwarsa&rdquo;</b> dan akses terhadap fitur berbayar dapat dibatasi oleh PIHAK PERTAMA.
        </Paragraf>
      </Pasal>

      {/* PASAL 5 */}
      <Pasal nomor={5} judul="HAK DAN KEWAJIBAN PIHAK PERTAMA">
        <Paragraf nomor="1.">
          <b>Hak PIHAK PERTAMA:</b>
        </Paragraf>
        <Paragraf>
          a. Menerima pembayaran biaya Paket Berlangganan sesuai Pasal 3 dan Pasal 7;
        </Paragraf>
        <Paragraf>
          b. Menangguhkan atau menghentikan akses PIHAK KEDUA apabila terjadi keterlambatan pembayaran atau pelanggaran
          terhadap Perjanjian ini dan/atau EULA;
        </Paragraf>
        <Paragraf>
          c. Melakukan pemeliharaan, pembaruan, dan penyempurnaan Aplikasi dari waktu ke waktu.
        </Paragraf>
        <Paragraf nomor="2.">
          <b>Kewajiban PIHAK PERTAMA:</b>
        </Paragraf>
        <Paragraf>
          a. Menyediakan akses Aplikasi yang berfungsi sesuai dengan Paket Berlangganan yang dipilih PIHAK KEDUA;
        </Paragraf>
        <Paragraf>
          b. Menjaga kerahasiaan dan keamanan Data Instansi PIHAK KEDUA sesuai dengan Pasal 8;
        </Paragraf>
        <Paragraf>
          c. Memberikan pemberitahuan yang wajar kepada PIHAK KEDUA sebelum Masa Berlangganan berakhir, sepanjang
          dimungkinkan secara teknis.
        </Paragraf>
      </Pasal>

      {/* PASAL 6 */}
      <Pasal nomor={6} judul="HAK DAN KEWAJIBAN PIHAK KEDUA">
        <Paragraf nomor="1.">
          <b>Hak PIHAK KEDUA:</b>
        </Paragraf>
        <Paragraf>
          a. Menggunakan seluruh fitur Aplikasi sesuai dengan batasan Paket Berlangganan yang dipilih (jumlah outlet dan
          jumlah karyawan per outlet);
        </Paragraf>
        <Paragraf>
          b. Memperoleh dukungan teknis dari PIHAK PERTAMA sesuai dengan kanal dukungan yang tersedia.
        </Paragraf>
        <Paragraf nomor="2.">
          <b>Kewajiban PIHAK KEDUA:</b>
        </Paragraf>
        <Paragraf>
          a. Melakukan pembayaran biaya Paket Berlangganan secara tepat waktu sesuai Pasal 3 dan Pasal 7;
        </Paragraf>
        <Paragraf>
          b. Menggunakan Aplikasi sesuai dengan ketentuan Perjanjian ini dan EULA, serta tidak melakukan tindakan yang
          dilarang sebagaimana diatur dalam EULA;
        </Paragraf>
        <Paragraf>
          c. Bertanggung jawab atas keakuratan dan keabsahan Data Instansi yang dimasukkan ke dalam Aplikasi, termasuk telah
          memperoleh persetujuan yang sah dari karyawan/pihak terkait atas pengolahan data pribadinya;
        </Paragraf>
        <Paragraf>
          d. Menjaga kerahasiaan kredensial akses (Akun) dan segera melaporkan kepada PIHAK PERTAMA
          apabila terjadi penyalahgunaan.
        </Paragraf>
      </Pasal>

      {/* PASAL 7 — rekening penagihan tetap sesuai template */}
      <Pasal nomor={7} judul="TATA CARA PEMBAYARAN">
        <Paragraf>
          Pembayaran dilakukan melalui {PEMBAYARAN}, ke rekening/akun yang ditentukan oleh PIHAK PERTAMA.
        </Paragraf>
        <Paragraf>
          Keterlambatan pembayaran dapat menyebabkan status Paket Berlangganan berubah menjadi <b>&ldquo;kedaluwarsa&rdquo;</b>{' '}
          dan/atau dikenakan denda keterlambatan sebesar yang disepakati oleh Para Pihak, jika ada.
        </Paragraf>
      </Pasal>

      {/* PASAL 8 */}
      <Pasal nomor={8} judul="KERAHASIAAN DATA">
        <Paragraf>
          PIHAK PERTAMA wajib menjaga kerahasiaan Data Instansi PIHAK KEDUA dan tidak akan mengungkapkannya kepada pihak
          ketiga tanpa persetujuan tertulis dari PIHAK KEDUA, kecuali diwajibkan oleh peraturan perundang-undangan atau
          perintah instansi yang berwenang.
        </Paragraf>
        <Paragraf>
          Data Instansi PIHAK KEDUA terisolasi secara otomatis dari data instansi lain melalui mekanisme multi-tenant pada
          sistem Aplikasi.
        </Paragraf>
      </Pasal>

      {/* PASAL 9 */}
      <Pasal nomor={9} judul="PEMBATASAN TANGGUNG JAWAB">
        <Paragraf>
          PIHAK PERTAMA tidak bertanggung jawab atas kerugian yang timbul akibat: (a) kesalahan input data oleh PIHAK
          KEDUA; (b) gangguan koneksi internet atau perangkat PIHAK KEDUA; (c) keadaan kahar (force majeure) sebagaimana
          diatur dalam Pasal 11; atau (d) penyalahgunaan Akun oleh pihak yang tidak berwenang akibat kelalaian PIHAK KEDUA.
        </Paragraf>
        <Paragraf>
          Tanggung jawab PIHAK PERTAMA atas kerugian yang timbul dari Perjanjian ini dibatasi maksimal sebesar total biaya
          Paket Berlangganan yang telah dibayarkan oleh PIHAK KEDUA dalam Masa Berlangganan yang sedang berjalan.
        </Paragraf>
      </Pasal>

      {/* PASAL 10 */}
      <Pasal nomor={10} judul="PENGAKHIRAN PERJANJIAN">
        <Paragraf>
          Perjanjian ini dapat diakhiri sebelum berakhirnya Masa Berlangganan apabila:
        </Paragraf>
        <Paragraf nomor="1.">
          Disepakati secara tertulis oleh Para Pihak;
        </Paragraf>
        <Paragraf nomor="2.">
          PIHAK KEDUA melakukan pelanggaran material terhadap Perjanjian ini dan/atau EULA dan tidak memperbaikinya dalam
          waktu empat belas (14) hari kalender sejak diberikan pemberitahuan tertulis oleh PIHAK PERTAMA;
        </Paragraf>
        <Paragraf nomor="3.">
          PIHAK KEDUA tidak melakukan pembayaran biaya Paket Berlangganan sesuai Pasal 3 dan Pasal 7;
        </Paragraf>
        <Paragraf nomor="4.">
          Salah satu Pihak dinyatakan pailit, dibubarkan, atau tidak lagi menjalankan usahanya secara sah.
        </Paragraf>
        <Paragraf>
          Pengakhiran Perjanjian tidak menghapus kewajiban pembayaran yang telah timbul dan belum dilunasi oleh PIHAK KEDUA
          sampai dengan tanggal pengakhiran.
        </Paragraf>
      </Pasal>

      {/* PASAL 11 */}
      <Pasal nomor={11} judul="KEADAAN KAHAR (FORCE MAJEURE)">
        <Paragraf>
          Para Pihak dibebaskan dari tanggung jawab atas keterlambatan atau kegagalan pelaksanaan Perjanjian ini yang
          diakibatkan oleh keadaan kahar, termasuk namun tidak terbatas pada bencana alam, kebakaran, huru-hara, perang,
          pemogokan massal, gangguan infrastruktur telekomunikasi/internet nasional, kebijakan pemerintah, atau peristiwa
          lain di luar kendali wajar Para Pihak.
        </Paragraf>
      </Pasal>

      {/* PASAL 12 */}
      <Pasal nomor={12} judul="PENYELESAIAN PERSELISIHAN">
        <Paragraf>
          Setiap perselisihan yang timbul dari Perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk
          mufakat. Apabila tidak tercapai kesepakatan dalam waktu tiga puluh (30) hari kalender, Para Pihak sepakat untuk
          menyelesaikannya melalui Pengadilan Negeri yang berwenang di domisili PIHAK PERTAMA.
        </Paragraf>
      </Pasal>

      {/* PASAL 13 */}
      <Pasal nomor={13} judul="PENUTUP">
        <Paragraf>
          Perjanjian ini dibuat dalam rangkap 2 (dua) asli, masing-masing bermeterai cukup dan mempunyai kekuatan hukum
          yang sama, untuk dipegang oleh masing-masing Pihak.
        </Paragraf>
        <Paragraf>
          Segala hal yang belum atau belum cukup diatur dalam Perjanjian ini akan diatur lebih lanjut dalam addendum yang
          merupakan bagian yang tidak terpisahkan dari Perjanjian ini, berdasarkan kesepakatan tertulis Para Pihak.
        </Paragraf>
      </Pasal>

      {/* PENUTUP + TANDA TANGAN */}
      <p className="text-[12px] leading-[1.75] text-justify mb-8">
        Demikian Perjanjian ini dibuat dan ditandatangani oleh Para Pihak dalam keadaan sehat jasmani dan rohani, tanpa
        paksaan dari pihak mana pun, untuk dilaksanakan dengan sebaik-baiknya.
      </p>

      {/* Verifikasi elektronik, menggantikan tanda tangan basah. Formatnya
          mengikuti dokumen SIAKAD di folder file/: stempel "© valid" di atas
          nama, dan nama ditulis dalam kurung. */}
      <div className="grid grid-cols-2 gap-8 text-left text-[12px] ttd-blok">
        <div>
          <p className="font-bold mb-1">PIHAK PERTAMA</p>
          <p className="mb-3">&copy; <b>valid</b></p>
          <p className="font-semibold">({PIHAK_PERTAMA.nama})</p>
          <p className="text-[11px] text-slate-600">{PIHAK_PERTAMA.jabatan}</p>
          <p className="text-[11px] text-slate-600">
            Disetujui pada {tanggalCetak.getDate()} {namaBulan} {tanggalCetak.getFullYear()}
          </p>
          <p className="text-[11px] text-slate-600">{PIHAK_PERTAMA.email}</p>
        </div>
        <div>
          <p className="font-bold mb-1">PIHAK KEDUA</p>
          <p className="mb-3">&copy; <b>valid</b></p>
          <p className="font-semibold">({namaPihakKedua || <Isian lebar="w-40" />})</p>
          <p className="text-[11px] text-slate-600">Pemilik / Penanggung Jawab</p>
          <p className="text-[11px] text-slate-600">
            Instansi: {instansi.nama_instansi || <Isian lebar="w-32" />}
          </p>
          {email ? <p className="text-[11px] text-slate-600">({email})</p> : null}
        </div>
      </div>
    </div>
  );
}
