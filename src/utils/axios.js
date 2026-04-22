import axios from 'axios';
import config from '../config';

const axiosServices = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar el token automáticamente
axiosServices.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosServices;
