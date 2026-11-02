import React from 'react'
import ReactDOM from 'react-dom/client'
import '../styles/shared.css'
import '../shared/graph/graph.css'
import '../shared/graph3d/graph3d.css'
import App3D from '../shared/graph3d/App3D.jsx'

// 시안 E-2 — 3D 그래프(은하). 엔진·패널은 공용(src/shared/graph3d, src/shared/graph), 차이는 preset 뿐.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App3D variant="e-2" />
  </React.StrictMode>,
)
