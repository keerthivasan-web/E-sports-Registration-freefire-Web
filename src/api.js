import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    // Vite sets import.meta.env.PROD to true when running `vite build`
    // Provide your actual production backend URL below before deploying
    baseURL: import.meta.env.PROD
        ? 'https://your-backend-app.onrender.com' // Replace with your backend deployment URL
        : `http://${window.location.hostname}:5000`,
});

export default api;
