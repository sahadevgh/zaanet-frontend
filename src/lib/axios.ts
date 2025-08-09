import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api', // Explicitly set to localhost
  timeout: 10000, // Increase to 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;