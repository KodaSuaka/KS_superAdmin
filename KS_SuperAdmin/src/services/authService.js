import api from './api';

/**
 * Service untuk handle semua request/response terkait Auth (Super Admin).
 * Semua fungsi mengembalikan Promise.
 */

/**
 * Register Super Admin baru.
 * @param {object} payload - { name, email, password }
 * @returns {Promise<object>} - { user, access_token, token_type }
 */
export const registerSuperAdmin = async (payload) => {
    const response = await api.post('/register-super-admin', payload);
    return response.data.data;
};

/**
 * Login Super Admin.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { user, permissions, access_token, token_type }
 */
export const loginSuperAdmin = async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data.data;
};

/**
 * Verifikasi token & ambil data user dari backend.
 * @returns {Promise<object>} - Data user dari API
 */
export const getCurrentUser = async () => {
    const response = await api.get('/user');
    return response.data.data;
};

/**
 * Logout (hapus token di backend & hapus localStorage).
 */
export const logoutSuperAdmin = async () => {
    try {
        await api.post('/logout');
    } catch {
        // Tetap lanjut walau request logout gagal
    }
    localStorage.removeItem('token_superadmin');
    localStorage.removeItem('user_superadmin');
};

/**
 * Simpan data auth ke localStorage.
 * @param {object} data - { user, access_token }
 */
export const saveAuthData = (data) => {
    localStorage.setItem('token_superadmin', data.access_token);
    localStorage.setItem('user_superadmin', JSON.stringify(data.user));
};

/**
 * Hapus data auth dari localStorage.
 */
export const clearAuthData = () => {
    localStorage.removeItem('token_superadmin');
    localStorage.removeItem('user_superadmin');
};

/**
 * Cek apakah user sudah login (token ada).
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token_superadmin');
};

/**
 * Ambil data user dari localStorage.
 * @returns {object|null}
 */
export const getStoredUser = () => {
    const data = localStorage.getItem('user_superadmin');
    return data ? JSON.parse(data) : null;
};
