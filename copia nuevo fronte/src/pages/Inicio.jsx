import { useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaViaje from '../components/TarjetaViaje'
import { viajes } from '../data/datos'

export default function Inicio() {
const [regreso, setRegreso] = useState(false)
return (
<>
<section className="panel centrado">
<h1>Bienvenido a Transporte Solidario Rural</h1>
<div className="acciones">
<Link className="boton boton-verde" to="/solicitar-viaje">Solicitar Viaje</Link>
<Link className="boton boton-azul" to="/registro">Crear Cuenta</Link>
<Link className="boton" to="/login">Iniciar Sesión</Link>
</div>
</section>
<h2>Viajes disponibles</h2>
<div className="pestanas" role="group" aria-label="Sentido del viaje">
<button type="button" className="boton" aria-pressed={!regreso} onClick={() => setRegreso(false)}>Ida: Popayán → Vereda</button>
<button type="button" className="boton" aria-pressed={regreso} onClick={() => setRegreso(true)}>Regreso: Vereda → Popayán</button>
</div>
<div className="grid">
{viajes.map((v) => <TarjetaViaje key={v.id} v={v} regreso={regreso} />)}
</div>
</>
)
}