import axios from 'axios';

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url) {
        return import.meta.env.DEV ? 'http://localhost:3000' : 'https://lacanasta-api-h629.onrender.com/api';
    }
    // Append /api if it's a Render URL provided by Blueprint service linking
    return url.includes('onrender.com') && !url.endsWith('/api') 
        ? (url.endsWith('/') ? `${url}api` : `${url}/api`)
        : url;
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Note: Backend auth middleware might need to be verified if it expects Bearer
    }
    return config;
});



api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
