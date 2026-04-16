import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' 
import './index.css'
import axios from 'axios';

// Настраиваем ОДИН РАЗ здесь:
axios.defaults.baseURL = 'https://reversion-grueling-reviving.ngrok-free.dev';
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)