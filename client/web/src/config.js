const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
export default API_URL;
