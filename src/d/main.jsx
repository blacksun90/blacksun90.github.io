import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/shared.css'
import './styles/water.css'
import App from './App.jsx'

// 시안 D — 물방울. 목차를 터뜨리면 물길을 따라 그 이야기로 흘러간다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
