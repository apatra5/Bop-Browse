import axios from 'axios';

// Debug: Log the API URL being used
console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;