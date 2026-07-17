import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Panggil API login
      const response = await api.post('/login', {
        email: email,
        password: password
      });

      const { data } = response.data; // { user, permissions, access_token, token_type }

      // VALIDASI: Pastikan role adalah "Super Admin"
      if (data.user.role !== 'Super Admin') {
        setErrorMessage('Akses ditolak! Hanya akun Super Admin yang bisa masuk ke panel ini.');
        setIsLoading(false);
        return;
      }

      // Simpan token & data user ke localStorage
      localStorage.setItem('token_superadmin', data.access_token);
      localStorage.setItem('user_superadmin', JSON.stringify(data.user));

      // Arahkan ke Dashboard
      navigate('/');

    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Email atau password salah.');
      } else {
        setErrorMessage('Gagal terhubung ke server. Pastikan backend Laravel sudah berjalan.');
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
          <p className="text-slate-400 text-sm tracking-wider">SUPERADMIN PORTAL</p>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Selamat Datang Kembali!</h3>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
              <input
                type="email"
                required
                placeholder="superadmin@codasuaka.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 font-bold rounded-lg transition-colors shadow-md mt-4 flex justify-center items-center ${isLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                }`}
            >
              {isLoading ? 'Memeriksa Data...' : 'Masuk ke Dashboard'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
