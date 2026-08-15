# 🚀 CodaSuaka - Super Admin Panel

Panel Super Admin berbasis **React + Vite + Tailwind CSS** untuk mengelola seluruh sistem CodaSuaka (instansi, paket langganan, owner, dan langganan).

---

## 📋 API Endpoints yang Digunakan

Frontend ini terhubung ke **Laravel Backend** dengan endpoint berikut:

| Metode | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/register-super-admin` | Registrasi akun Super Admin baru |
| POST | `/login` | Login Super Admin |
| GET | `/user` | Ambil data user yang sedang login |
| POST | `/logout` | Logout (invalidate token) |
| GET | `/super-admin/dashboard` | Ambil statistik dashboard |
| GET | `/super-admin/pakets` | Daftar semua paket |
| POST | `/super-admin/pakets` | Tambah paket baru |
| PUT | `/super-admin/pakets/:id` | Update paket |
| DELETE | `/super-admin/pakets/:id` | Hapus paket |
| GET | `/super-admin/instansis` | Daftar semua instansi |
| POST | `/super-admin/instansis` | Tambah instansi + buat akun owner |
| PUT | `/super-admin/instansis/:id` | Update instansi |
| DELETE | `/super-admin/instansis/:id` | Hapus instansi |
| GET | `/super-admin/owners` | Daftar semua owner |
| POST | `/super-admin/owners` | Tambah owner baru |
| PUT | `/super-admin/owners/:id` | Update owner |
| DELETE | `/super-admin/owners/:id` | Hapus owner |

---

## 🛠️ Setup Lokal (Development)

### Prasyarat

- [Node.js](https://nodejs.org/) v18+ 
- npm atau yarn
- Laravel Backend CodaSuaka sudah berjalan

### Langkah-langkah

**1. Clone Repository**

```bash
git clone -b development https://github.com/KodaSuaka/CodaSuaka.git
cd CodaSuaka/ks-superadmin
```

**2. Install Dependencies**

```bash
npm install
```

**3. Konfigurasi Environment Variable**

```bash
# Copy file .env.example ke .env
cp .env.example .env
```

Buka file `.env` dan isi dengan URL backend Laravel Anda:

```env
# URL API Laravel (tanpa slash di akhir)
VITE_API_BASE_URL=https://api.codasuaka.com/api

# Untuk development lokal:
# VITE_API_BASE_URL=http://localhost:8000/api
```

**4. Jalankan Development Server**

```bash
npm run dev
```

Akses panel di: `http://localhost:5173`

---

## 🚀 Deploy ke Vercel (Production)

### Step-by-Step Lengkap

#### Step 1: Siapkan Repository GitHub

```bash
# Pastikan kode sudah di-push ke GitHub
git add .
git commit -m "feat: siap deploy ke vercel"
git push origin development
```

#### Step 2: Buat Akun Vercel

1. Buka [https://vercel.com](https://vercel.com)
2. Klik **Sign Up** → pilih **Continue with GitHub**
3. Authorize akses ke repository GitHub Anda

#### Step 3: Import Project ke Vercel

1. Di Dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Cari repository **CodaSuaka** → klik **Import**
3. Vercel akan mendeteksi ini sebagai project **Vite (React)**

#### Step 4: Konfigurasi Project

Di halaman konfigurasi deployment, isi setting berikut:

| Field | Nilai |
|-------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `./` (atau `ks-superadmin` jika root repo bukan subfolder ini) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

#### Step 5: Tambah Environment Variable

Di bagian **Environment Variables**, tambahkan:

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://api.codasuaka.com/api` |

> ⚠️ **PENTING:** Ganti URL di atas dengan URL backend Laravel Anda yang sebenarnya. Pastikan backend sudah di-deploy dan bisa diakses publik.

Klik **"Add"** untuk menyimpan, lalu klik **"Deploy"**.

#### Step 6: Tunggu Deploy Selesai

- Vercel akan menjalankan `npm install` → `npm run build` → deploy ke CDN
- Proses biasanya sekitar **1-2 menit**
- Setelah selesai, Anda akan mendapat URL seperti: `https://ks-superadmin-xxx.vercel.app`

#### Step 7: Konfigurasi Custom Domain (Opsional)

1. Di Dashboard Vercel → pilih project → **Settings** → **Domains**
2. Masukkan domain custom Anda (contoh: `admin.codasuaka.com`)
3. Ikuti petunjuk DNS:
   - Tambah **CNAME Record** → target: `cname.vercel-dns.com`
   - Atau **A Record** → target: `76.76.21.21`

#### Step 8: Verifikasi Backend Laravel

Pastikan backend Laravel Anda:

1. **CORS sudah dikonfigurasi** di `config/cors.php`:

```php
'allowed_origins' => [
    'https://ks-superadmin-xxx.vercel.app',  // URL Vercel Anda
    'https://admin.codasuaka.com',            // Custom domain (jika ada)
],
'supports_credentials' => true,
```

2. **Route API** sudah benar dan menggunakan prefix `/api`
3. **Sanctum** (atau auth driver lain) sudah dikonfigurasi untuk Bearer Token

---

## 📁 Struktur Project

```
KS_SuperAdmin/
├── index.html                  # Entry HTML
├── package.json                # Dependencies & scripts
├── vite.config.js              # Konfigurasi Vite
├── vercel.json                 # Konfigurasi Vercel (SPA routing)
├── .env.example                # Template environment variable
├── public/
│   └── favicon.svg             # Ikon tab browser
└── src/
    ├── main.jsx                # Entry point React
    ├── App.jsx                 # Router & Routes
    ├── index.css               # Tailwind CSS import
    ├── layouts/
    │   └── MainLayout.jsx      # Layout dengan sidebar
    ├── pages/
    │   ├── Login.jsx           # Halaman login
    │   ├── Register.jsx        # Halaman registrasi
    │   ├── Dashboard.jsx       # Dashboard statistik
    │   ├── Paket.jsx           # CRUD Master Paket
    │   ├── Instansi.jsx        # CRUD Data Instansi
    │   ├── Owner.jsx           # CRUD Data Owner
    │   └── Langganan.jsx       # Manajemen Langganan
    └── services/
        ├── api.js              # Axios instance + interceptors
        └── authService.js      # Fungsi autentikasi
```

---

## 🔧 Perintah Tersedia

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Preview build production
npm run preview

# Linting
npm run lint
```

---

## 🔐 Flow Autentikasi

1. **Login** → `POST /login` → server mengembalikan `access_token` + `user`
2. Token disimpan di `localStorage` dengan key `token_superadmin`
3. Setiap request API otomatis menyertakan header `Authorization: Bearer <token>`
4. Jika response **401 Unauthorized** → token dihapus & redirect ke `/login`
5. **Logout** → `POST /logout` → hapus token dari localStorage

---

## ⚠️ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Halaman blank setelah deploy | Pastikan `vercel.json` ada di root project |
| CORS Error di browser | Tambahkan URL Vercel ke `allowed_origins` di backend Laravel |
| API 404 Not Found | Pastikan `VITE_API_BASE_URL` benar dan backend berjalan |
| "Gagal terhubung ke server" | Backend belum di-deploy atau URL salah |
| Routing halaman 404 di refresh | `vercel.json` sudah handle dengan rewrite ke `index.html` |

---

## 📄 License

Proprietary - CodaSuaka
