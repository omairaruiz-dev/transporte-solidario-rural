import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Inicio from './pages/Inicio'
import SolicitarViaje from './pages/SolicitarViaje'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Recuperar from './pages/Recuperar'

export default function App() {
return (
<>
<a className="saltar" href="#contenido">Saltar al contenido</a>
<Header />
<main id="contenido" className="contenedor">
<Routes>
<Route path="/" element={<Inicio />} />
<Route path="/solicitar-viaje" element={<SolicitarViaje />} />
<Route path="/registro" element={<Registro />} />
<Route path="/login" element={<Login />} />
<Route path="/recuperar" element={<Recuperar />} />
<Route path="*" element={<h1>Página no encontrada</h1>} />
</Routes>
</main>
</>
)
}