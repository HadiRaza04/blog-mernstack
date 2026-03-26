import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api', // Your Node.js server URL
});

// Automatically attach JWT token to every request if it exists in localStorage
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;