import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/shared.css'
import '../shared/graph/graph.css'
import '../shared/graph3d/graph3d.css'
import App3D from '../shared/graph3d/App3D.jsx'

// E-4 — 3D 성운 그래프. C·D와 공유하는 내용을 탐색한다.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App3D />
  </React.StrictMode>,
)
