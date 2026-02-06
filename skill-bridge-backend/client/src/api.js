import axios from 'axios';

// Automatically switches between Localhost and Real URL
const API = axios.create({ 
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://skillbridge-backend.onrender.com/api'  // You will get this URL later from Render
    : 'http://localhost:5000/api' 
});

export default API;