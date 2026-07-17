import axios from 'axios';

// Buat instance Axios dengan base URL dari .env
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// INTERCEPTOR REQUEST: Sisipkan token Bearer
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token_superadmin');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// INTERCEPTOR RESPONSE: Tangani error 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token tidak valid / expired -> logout paksa
            localStorage.removeItem('token_superadmin');
            localStorage.removeItem('user_superadmin');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
