import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://skill-bridge-app.onrender.com' // <--- REPLACE WITH YOUR RENDER URL
    : 'http://localhost:5000/api'
});

// Add token to requests if it exists
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('skillBridgeUser'));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;