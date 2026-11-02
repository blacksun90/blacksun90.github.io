import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/shared.css'
import './tokens.css'
import './c.css'
import App from './App.jsx'

// 시안 C — 표준. 이 분야가 늘 만드는 배치를 가장 높은 완성도로.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
