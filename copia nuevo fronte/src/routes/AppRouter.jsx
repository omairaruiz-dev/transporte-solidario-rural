import { Routes, Route } from 'react-router-dom'
import InicioPage from '../features/viajes/pages/InicioPage'
import SolicitarViajePage from '../features/solicitudes/pages/SolicitarViajePage'
import RegistroPage from '../features/auth/pages/RegistroPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RecuperarPage from '../features/auth/pages/RecuperarPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<InicioPage />} />
      <Route path="/solicitar-viaje" element={<SolicitarViajePage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecuperarPage />} />
      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  )
}
