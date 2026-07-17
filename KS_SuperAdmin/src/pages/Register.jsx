import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerSuperAdmin, saveAuthData } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validasi password confirmation
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      setIsLoading(false);
      return;
    }

    try {
      // Panggil service register
      const data = await registerSuperAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Simpan token & data user via service
      saveAuthData(data);

      setSuccessMessage('Akun Super Admin berhasil dibuat! Mengarahkan ke dashboard...');

      // Redirect ke dashboard setelah 1.5 detik
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (error) {
      if (error.response && error.response.data) {
        const errData = error.response.data;
        if (errData.errors) {
          const messages = Object.values(errData.errors).flat().join('\n');
          setErrorMessage(messages);
        } else {
          setErrorMessage(errData.message || 'Registrasi gagal. Silakan coba lagi.');
        }
      } else {
        setErrorMessage('Gagal terhubung ke server. Pastikan koneksi internet Anda stabil.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">

        <div className="bg-slate-900 p-8 text-center">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            CodaSuaka
          </h2>
          <p className="text-slate-400 text-sm tracking-wider">REGISTRASI SUPER ADMIN</p>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-2 text-center">Buat Akun Super Admin</h3>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Daftarkan akun untuk mengelola seluruh sistem CodaSuaka.
            <br />
            <span className="text-amber-600 font-semibold text-xs">⚠️ Hanya satu akun Super Admin yang diizinkan.</span>
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 whitespace-pre-line">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-100 text-emerald-700 text-sm rounded-lg border border-emerald-200">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Super Admin"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="superadmin@codasuaka.com"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min. 8 karakter"
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Konfirmasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  minLength={8}
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 font-bold rounded-lg transition-colors shadow-md mt-2 flex justify-center items-center ${isLoading
                  ? 'bg-blue-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                }`}
            >
              {isLoading ? 'Mendaftarkan...' : 'Daftarkan Super Admin'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
              Masuk di sini
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
