import axios from 'axios';

// In production (Vercel), use relative path (same domain).
// In development, point to the local Node.js backend.
const api = axios.create({
    baseURL: import.meta.env.PROD
        ? ''  // same domain on Vercel
        : 'http://localhost:5000', // local API for local dev
});

export default api;
