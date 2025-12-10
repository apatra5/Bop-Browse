import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;