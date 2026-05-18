// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import 'leaflet/dist/leaflet.css'
// import App from './App.jsx'
// import { BrowserRouter } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter>
//       <AuthProvider>
//         <App />
//       </AuthProvider>
//     </BrowserRouter>
//   </StrictMode>,
// )
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotifProvider } from './context/NotifContext.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <App />
          <Toaster position="top-right" />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)