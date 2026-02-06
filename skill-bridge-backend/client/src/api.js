import axios from 'axios';

// I used the Render URL from your screenshot (image_6893fb.png)
const API = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://skill-bridge-app.onrender.com/api' 
    : 'http://localhost:5000/api'
});

// Add token to requests if the user is logged in
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('skillBridgeUser'));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;