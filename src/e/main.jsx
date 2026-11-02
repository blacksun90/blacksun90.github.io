import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/shared.css'
import '../shared/graph/graph.css'
import App from './App.jsx'

// 시안 E — 그래프(옵시디언 그래프 뷰 콘셉트). 모든 내용이 노드이고, 고르면 오른쪽에 열린다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
