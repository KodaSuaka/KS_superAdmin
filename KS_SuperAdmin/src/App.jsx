import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Layout
import MainLayout from './layouts/MainLayout';

// Import Pages
import Dashboard from './pages/Dashboard';
import Paket from './pages/Paket';
import Instansi from './pages/Instansi';
import Owner from './pages/Owner';
import Langganan from './pages/Langganan';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* RUTE TANPA SIDEBAR (Khusus Halaman Bebas/Publik) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* RUTE DENGAN SIDEBAR (Khusus Halaman Admin) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="paket" element={<Paket />} />
          <Route path="instansi" element={<Instansi />} />
          <Route path="owner" element={<Owner />} />
          <Route path="langganan" element={<Langganan />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}