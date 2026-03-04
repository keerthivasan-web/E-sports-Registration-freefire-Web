import axios from 'axios';

// In production (Vercel), use relative path (same domain).
// In development, point to the local Node.js backend.
const api = axios.create({
    baseURL: import.meta.env.PROD
        ? '' // Same domain in production
        : 'http://localhost:5000', // Local backend
});

export default api;
