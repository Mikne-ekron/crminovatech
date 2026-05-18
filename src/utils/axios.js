import axios from 'axios';
import config from '../config';

const axiosServices = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: agrega token JWT y empresa actual en cada request
axiosServices.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = token;
        }
        // Multi-empresa: header X-Company desde localStorage (escrito por useCompanyStore)
        const company = localStorage.getItem('currentCompany') || 'SBOINOVA';
        config.headers['X-Company'] = company;
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosServices;
