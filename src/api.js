import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    // Vite sets import.meta.env.PROD to true when running `vite build`
    baseURL: import.meta.env.PROD
        ? '' // Use relative path in production (same domain)
        : `http://${window.location.hostname}:5000`,
});

export default api;
